import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { emitModule, emitModuleWithMap, type BaseSpec } from "../emit/emitter";
import type { RawSourceMap } from "../emit/sourcemap";
import type { Diagnostic } from "../lower/analyze";
import { analyze } from "../lower/analyze";
import type { ClassDecl, Expr, Module, Stmt, TypeRef } from "../lower/ir";
import { lower } from "../lower/lower";
import { parseSource } from "../parse/parser";
import { UnsupportedError } from "../runtime/errors";

/**
 * 跨文件编译的项目层（docs/ROADMAP.md P5）。
 *
 * 单文件 emitModule 不认识"别的文件"。这一层负责：
 * 1. 从入口出发发现依赖 —— 解析 `res://` / 相对路径、`class_name`、`extends`、`preload`。
 * 2. 建 `class_name → 文件` 全局表（Godot 的 class_name 是工程级注册，跨文件可见）。
 * 3. 把跨文件引用解析成 ESM import 说明符，逐文件 emitModule。
 *
 * 范围（本步）：class_name 全局注册 + 跨文件 extends + 跨文件 `Foo.new()` / `is Foo`
 * + `preload(已知 res:// 路径)` → 静态 import。`load`（动态）留到下一步。
 */

const RES_PREFIX = "res://";

/** GDScript 里宿主/引擎提供、不需要文件支持的基类。Tier 1 只给了 SceneTree。 */
const HOST_BASES = new Set(["SceneTree"]);

/** 认得但 Tier 1 不给实现的引擎基类 —— 遇到就响亮报错（D4）。 */
const ENGINE_BASES = new Set([
  "Node", "Node2D", "Node3D", "Control", "Resource", "RefCounted", "Object",
  "CharacterBody2D", "CharacterBody3D", "Area2D", "StaticBody2D", "RigidBody2D",
]);

export interface ProjectOptions {
  /** 入口 .gd 的文件系统绝对路径。 */
  entries: string[];
  /** `res://` 映射到的目录（通常是含 project.godot 的工程根）。 */
  resRoot: string;
  /** 产物输出根目录；镜像 res:// 下的相对结构。 */
  outDir: string;
  /** 运行时的 import 说明符（裸包名或相对路径，对所有产物一致）。 */
  runtimeImport: string;
  /** 宿主的 import 说明符；null 表示不引入宿主。 */
  hostImport: string | null;
  /** 产物末尾是否自动驱动生命周期（跑 _initialize/_process）。库工程一般 false。 */
  autoRun?: boolean;
  /** 为每个产物生成行粒度 sourcemap（默认关）。 */
  sourcemap?: boolean;
}

export interface CompiledModule {
  resPath: string;
  jsPath: string;
  className: string;
  code: string;
  /** opts.sourcemap 开启时的 Source Map v3 对象。 */
  map?: RawSourceMap;
}

export interface ProjectResult {
  modules: CompiledModule[];
  /** 按文件聚合的静态检查诊断；非空表示该文件不该被发射。 */
  diags: Array<{ resPath: string; diagnostic: Diagnostic }>;
}

// ---------------------------------------------------------------- 路径工具

function toResPath(absPath: string, resRoot: string): string {
  const rel = relative(resRoot, absPath).split(sep).join("/");
  return RES_PREFIX + rel;
}

/** 把 GDScript 里的路径字符串解析成规范化的 res:// 路径（全程在 res 空间内）。 */
function resolveGdPath(fromRes: string, target: string): string {
  if (target.startsWith(RES_PREFIX)) return normalizeRes(target);
  // 相对当前文件的 res 目录
  const fromDir = dirname(fromRes); // "res://a" → "res://"; "res://a/b" → "res://a"
  const base = fromDir === "" || fromDir === RES_PREFIX || fromDir === "res:" ? RES_PREFIX : fromDir + "/";
  return normalizeRes(base + target);
}

/** res:// 路径 → 文件系统绝对路径。 */
function resToAbs(resPath: string, resRoot: string): string {
  return join(resRoot, resPath.slice(RES_PREFIX.length));
}

/** 折叠 res:// 路径里的 ./ 与 ../。 */
function normalizeRes(resPath: string): string {
  const rest = resPath.slice(RES_PREFIX.length);
  const out: string[] = [];
  for (const part of rest.split("/")) {
    if (part === "." || part === "") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return RES_PREFIX + out.join("/");
}

/** 匿名脚本的类名：文件名首字母大写、去掉非法字符。 */
function derivedClassName(resPath: string): string {
  const raw = basename(resPath, extname(resPath)).replace(/[^A-Za-z0-9_]/g, "_");
  return /^[0-9]/.test(raw) ? `_${raw}` : raw.charAt(0).toUpperCase() + raw.slice(1);
}

// ---------------------------------------------------------------- IR 遍历

function walkStmt(s: Stmt, visit: (e: Expr) => void): void {
  switch (s.kind) {
    case "expr":
      walkExpr(s.expr, visit);
      break;
    case "var":
      if (s.init) walkExpr(s.init, visit);
      break;
    case "assign":
      walkExpr(s.target, visit);
      walkExpr(s.value, visit);
      break;
    case "if":
      for (const br of s.branches) {
        if (br.cond) walkExpr(br.cond, visit);
        br.body.forEach((b) => walkStmt(b, visit));
      }
      break;
    case "for":
      walkExpr(s.iter, visit);
      s.body.forEach((b) => walkStmt(b, visit));
      break;
    case "while":
      walkExpr(s.cond, visit);
      s.body.forEach((b) => walkStmt(b, visit));
      break;
    case "match":
      walkExpr(s.subject, visit);
      for (const arm of s.arms) {
        if (arm.guard) walkExpr(arm.guard, visit);
        arm.body.forEach((b) => walkStmt(b, visit));
      }
      break;
    case "return":
      if (s.value) walkExpr(s.value, visit);
      break;
  }
}

function walkExpr(e: Expr, visit: (e: Expr) => void): void {
  visit(e);
  switch (e.kind) {
    case "binary":
      walkExpr(e.left, visit);
      walkExpr(e.right, visit);
      break;
    case "unary":
    case "await":
      walkExpr(e.operand, visit);
      break;
    case "call":
      walkExpr(e.callee, visit);
      e.args.forEach((a) => walkExpr(a, visit));
      break;
    case "attribute":
      walkExpr(e.obj, visit);
      break;
    case "index":
      walkExpr(e.obj, visit);
      walkExpr(e.index, visit);
      break;
    case "array":
      e.items.forEach((a) => walkExpr(a, visit));
      break;
    case "dict":
      for (const en of e.entries) {
        walkExpr(en.key, visit);
        walkExpr(en.value, visit);
      }
      break;
    case "is":
    case "as":
      walkExpr(e.operand, visit);
      break;
    case "lambda":
      e.body.forEach((b) => walkStmt(b, visit));
      break;
  }
}

function walkModuleExprs(m: Module, visit: (e: Expr) => void): void {
  for (const v of m.vars) if (v.init) walkExpr(v.init, visit);
  for (const f of m.funcs) f.body.forEach((s) => walkStmt(s, visit));
  for (const c of m.innerClasses) walkClassExprs(c, visit);
}

function walkClassExprs(c: ClassDecl, visit: (e: Expr) => void): void {
  for (const v of c.vars) if (v.init) walkExpr(v.init, visit);
  for (const f of c.funcs) f.body.forEach((s) => walkStmt(s, visit));
  for (const inner of c.innerClasses) walkClassExprs(inner, visit);
}

function typeRefName(t: TypeRef | null): string | null {
  return t && t.kind === "named" ? t.name : null;
}

/** 从 `extends` 文本里剥出引用的名字（去掉可能的前导 @virtual 之类不涉及）。 */
function extendsRefText(raw: string | null): string | null {
  if (raw === null) return null;
  const trimmed = raw.trim();
  // `extends "res://base.gd"` —— 带引号的是脚本路径
  if (/^["'].*["']$/.test(trimmed)) return trimmed.slice(1, -1);
  return trimmed;
}

// ---------------------------------------------------------------- 主流程

interface Loaded {
  resPath: string;
  absPath: string;
  module: Module;
  /** 依赖：其它 .gd 的 res 路径（extends 脚本 / preload / load 之外，class_name 依赖后补）。 */
  depPaths: Set<string>;
  /** 引用的其它 class_name（含 extends 与表达式里的裸名字）。 */
  classRefs: Set<string>;
  /** 该模块自带的类名（class_name 或派生），用于 JS 导出名。 */
  jsName: string;
}

/**
 * 编译一个跨文件工程：发现 → 建 class_name 表 → 解析边 → 逐文件发射。
 * 不写盘，只返回产物字符串；写盘交给调用方。
 */
export async function compileProject(opts: ProjectOptions): Promise<ProjectResult> {
  const resRoot = resolve(opts.resRoot);
  const entries = opts.entries.map((e) => resolve(e));

  const loaded = new Map<string, Loaded>(); // key: resPath
  const diags: ProjectResult["diags"] = [];

  const need = async (absPath: string): Promise<Loaded | null> => {
    const resPath = normalizeRes(toResPath(absPath, resRoot));
    const hit = loaded.get(resPath);
    if (hit) return hit;
    if (!existsSync(absPath)) {
      throw new UnsupportedError("missing-file", `找不到脚本文件：${resPath}（${absPath}）`);
    }
    const src = readFileSync(absPath, "utf8");
    const module = lower(await parseSource(src));
    const l: Loaded = {
      resPath,
      absPath,
      module,
      depPaths: new Set(),
      classRefs: new Set(),
      jsName: module.className ?? derivedClassName(resPath),
    };
    loaded.set(resPath, l);
    return l;
  };

  // ---- Pass 1：确定编译作用域。
  // class_name 是**工程级**注册：`GpShape.new()` 不带任何路径，必须扫描全部 .gd 才知道它是谁。
  // 所以作用域 = 入口 ∪ resRoot 下的所有 .gd（等价于 Godot 的全局类注册表），
  // 再沿路径依赖（extends "res://…" / preload）向外补。
  const queue: string[] = [];
  const seedPaths = new Set<string>();
  const seed = (absFile: string): void => {
    const resPath = normalizeRes(toResPath(absFile, resRoot));
    if (!seedPaths.has(resPath)) {
      seedPaths.add(resPath);
      queue.push(resPath);
    }
  };
  for (const e of entries) seed(e);
  for (const f of findGdFiles(resRoot)) seed(f);
  for (let i = 0; i < queue.length; i++) {
    const resPath = queue[i]!;
    const abs = resToAbs(resPath, resRoot);
    const l = await need(abs);
    if (!l) continue;
    const collect = (candidate: string | null, from: string): string | null => {
      if (!candidate) return null;
      if (!candidate.endsWith(".gd")) return null; // 只认脚本
      const depRes = resolveGdPath(from, candidate);
      if (!l.depPaths.has(depRes)) {
        l.depPaths.add(depRes);
        queue.push(depRes);
      }
      return depRes;
    };

    // extends "res://x.gd"
    collect(extendsRefText(l.module.extends), resPath);
    // preload("res://x.gd") / load("res://x.gd")
    walkModuleExprs(l.module, (e) => {
      if (e.kind === "call" && e.callee.kind === "ident" && (e.callee.name === "preload" || e.callee.name === "load")) {
        const a = e.args[0];
        if (a && a.kind === "lit" && a.lit === "string") collect(String(a.value), resPath);
      }
    });
  }

  // ---- Pass 2：建 class_name → resPath 全局表
  const classIndex = new Map<string, string>(); // className -> resPath
  for (const l of loaded.values()) {
    if (l.module.className) {
      const prev = classIndex.get(l.module.className);
      if (prev && prev !== l.resPath) {
        throw new UnsupportedError(
          "duplicate-class-name",
          `class_name "${l.module.className}" 同时出现在 ${prev} 和 ${l.resPath}`,
        );
      }
      classIndex.set(l.module.className, l.resPath);
    }
  }

  // ---- Pass 3：解析每个文件的跨文件边（class_name 引用 + extends 基类）
  const entryResSet = new Set(entries.map((e) => normalizeRes(toResPath(e, resRoot))));
  for (const l of loaded.values()) {
    const own = l.module.className;
    // 本文件内的局部/成员/函数名，避免把局部变量误判成跨文件类名
    const locals = new Set<string>([
      ...l.module.vars.map((v) => v.name),
      ...l.module.funcs.map((f) => f.name),
      ...l.module.signals.map((s) => s.name),
      ...collectLocalNames(l.module),
    ]);

    const record = (name: string | null): void => {
      if (!name || name === own || locals.has(name)) return;
      if (classIndex.has(name)) l.classRefs.add(name);
    };

    // extends 的类名形式
    const extText = extendsRefText(l.module.extends);
    if (extText && !extText.endsWith(".gd")) record(extText.replace(/\[.*\]$/, ""));

    walkModuleExprs(l.module, (e) => {
      if (e.kind === "ident") record(e.name);
      if (e.kind === "attribute" && e.name === "new" && e.obj.kind === "ident") record(e.obj.name);
      if (e.kind === "is" || e.kind === "as") record(typeRefName(e.type));
    });
  }

  // ---- 环检测（extends 循环 / preload 循环），Godot 也是错误，这里响亮报出
  detectCycles(loaded, resRoot);

  // ---- 参数/返回单态化的跨模块安全集（D2 第三轨）：
  // 裸 ABI 会让方法只接受裸值；一旦它以装箱形式被外部触达就静默算错。跨模块触达只有两条路：
  //   (1) obj.m() / super.m() —— 属性访问，全工程任意一处出现 `.m` 就禁掉 m 的裸 ABI；
  //   (2) 继承（基类方法被子类以 this.m() 虚调用）—— 参与任何用户类继承关系的模块整体禁用。
  // 单模块直接 f() 且从不被属性/继承触达的纯 helper 才保留单态化。
  const attrNames = new Set<string>();
  for (const l of loaded.values()) {
    walkModuleExprs(l.module, (e) => {
      if (e.kind === "attribute") attrNames.add(e.name);
      // 字符串字面量可能是 obj.call("m") / connect("m") 的目标方法名（按名反射派发）→ 一并保守排除。
      if (e.kind === "lit" && e.lit === "string") attrNames.add(String(e.value));
    });
  }
  const rawAbiBlockedModules = new Set<string>();
  for (const l of loaded.values()) {
    const bm = baseModule(l, loaded, classIndex);
    if (bm) {
      rawAbiBlockedModules.add(l.resPath); // 有用户基类：this.m() 可能是虚调用
      rawAbiBlockedModules.add(bm.resPath); // 被继承：其方法可能被派生类虚调用
    }
  }

  // ---- Pass 4：逐文件发射
  const modules: CompiledModule[] = [];
  for (const l of loaded.values()) {
    // 静态分析的作用域要带上 extends 链上用户基类的成员名，否则继承来的字段/值
    // 在「值位置」会被误判未声明（被调用者位置本就宽容，所以继承方法一直没事）。
    const inherited = inheritedMembers(l, loaded, classIndex);
    const globals = new Set<string>([...classIndex.keys(), ...inherited]);
    const fileDiags = analyze(l.module, globals).map((d) => ({ resPath: l.resPath, diagnostic: d }));
    if (fileDiags.length > 0) {
      diags.push(...fileDiags);
      continue; // 有语义错误不发射（与 CLI 一致）
    }

    const isEntry = entryResSet.has(l.resPath);
    const base = resolveBase(l, loaded, classIndex, resRoot, opts);
    const baseName = base ? base.jsName : null;
    const classRefs = [...l.classRefs]
      .filter((name) => {
        const dep = classFile(name, loaded, classIndex);
        return !dep || dep.jsName !== baseName; // 基类单独 import，避免重复绑定
      })
      .map((name) => {
        const dep = classFile(name, loaded, classIndex)!;
        return { name: dep.jsName, from: jsImportSpecifier(l, dep, opts) };
      });

    // preload/load 的字面量目标 → 解析成工程内的脚本模块（literal 原样保留给 emitter 查表）
    const preloads: Array<{ literal: string; name: string; from: string }> = [];
    const loadMap = new Map<string, string>(); // 原始字面量 → 规范化 resPath（loadScript 的键）
    const sideEffect = new Map<string, string>(); // resPath → 副作用 import 说明符
    walkModuleExprs(l.module, (e) => {
      if (e.kind !== "call" || e.callee.kind !== "ident") return;
      const fn = e.callee.name;
      if (fn !== "preload" && fn !== "load") return;
      const a = e.args[0];
      if (!a || a.kind !== "lit" || a.lit !== "string") return;
      const literal = String(a.value);
      const depRes = resolveGdPath(l.resPath, literal);
      const dep = loaded.get(depRes);
      if (!dep) return; // 交给 emitter 响亮报未解析
      if (fn === "preload") {
        if (!preloads.some((p) => p.literal === literal)) {
          preloads.push({ literal, name: dep.jsName, from: jsImportSpecifier(l, dep, opts) });
        }
      } else {
        loadMap.set(literal, depRes);
        sideEffect.set(depRes, jsImportSpecifier(l, dep, opts));
      }
    });

    const emitOpts = {
      runtimeImport: opts.runtimeImport,
      hostImport: opts.hostImport,
      autoRun: opts.autoRun ?? isEntry,
      className: l.jsName,
      baseClass: base?.spec ?? (isEntry && opts.hostImport ? { kind: "host" } : { kind: "none" }),
      classRefs,
      resPath: l.resPath,
      preloads,
      inheritedMembers: inherited,
      loadMap: [...loadMap].map(([literal, resPath]) => ({ literal, resPath })),
      sideEffectImports: [...sideEffect.values()],
      // 参与继承的模块整体禁裸 ABI（传本模块全部方法名）；否则传全工程属性名集合。
      rawAbiExternal: rawAbiBlockedModules.has(l.resPath)
        ? l.module.funcs.map((f) => f.name)
        : [...attrNames],
      sourcemap: opts.sourcemap,
      jsFile: basename(jsPathFor(l, opts)),
      // source 相对产物所在目录，指向它的 .gd 源（map 与 .mts 同目录）
      sourceFile: relative(dirname(jsPathFor(l, opts)), join(resRoot, l.resPath.slice(RES_PREFIX.length))).split(sep).join("/"),
    };
    const { code, map } = opts.sourcemap ? emitModuleWithMap(l.module, emitOpts) : { code: emitModule(l.module, emitOpts), map: null };

    modules.push({
      resPath: l.resPath,
      jsPath: jsPathFor(l, opts),
      className: l.jsName,
      code,
      map: map ?? undefined,
    });
  }

  if (diags.length > 0) {
    // 仍然返回，让调用方决定；但被拦下的文件不会出现在 modules 里
  }
  return { modules, diags };
}

function collectLocalNames(m: Module): string[] {
  const names: string[] = [];
  const addPattern = (p: import("../lower/ir").Pattern): void => {
    if (p.kind === "bind") names.push(p.name);
    if (p.kind === "array") p.items.forEach(addPattern);
    if (p.kind === "dict") p.entries.forEach((en) => addPattern(en.pattern));
  };
  const addStmt = (s: Stmt): void => {
    if (s.kind === "var") names.push(s.name);
    if (s.kind === "for") names.push(s.var);
    if (s.kind === "if") s.branches.forEach((b) => b.body.forEach(addStmt));
    if (s.kind === "for" || s.kind === "while") s.body.forEach(addStmt);
    if (s.kind === "match") for (const a of s.arms) { a.body.forEach(addStmt); addPattern(a.pattern); }
  };
  for (const f of m.funcs) { f.params.forEach((p) => names.push(p.name)); f.body.forEach(addStmt); }
  const addClass = (c: ClassDecl): void => {
    for (const f of c.funcs) { f.params.forEach((p) => names.push(p.name)); f.body.forEach(addStmt); }
    for (const v of c.vars) names.push(v.name);
    c.innerClasses.forEach(addClass);
  };
  m.innerClasses.forEach(addClass);
  return names;
}

function classFile(name: string, loaded: Map<string, Loaded>, classIndex: Map<string, string>): Loaded | null {
  const resPath = classIndex.get(name);
  return resPath ? loaded.get(resPath) ?? null : null;
}

/** 解析一个文件的 extends 目标模块（用户基类）；host/引擎/无 → null。 */
function baseModule(
  l: Loaded,
  loaded: Map<string, Loaded>,
  classIndex: Map<string, string>,
): Loaded | null {
  const ext = extendsRefText(l.module.extends);
  if (!ext) return null;
  if (ext.endsWith(".gd")) return loaded.get(resolveGdPath(l.resPath, ext)) ?? null;
  const bare = ext.replace(/\[.*\]$/, "");
  if (classIndex.has(bare)) return classFile(bare, loaded, classIndex);
  return null; // SceneTree / 引擎类型 / 未知 —— 没有可读的成员模块
}

/**
 * 收集 extends 链上所有用户基类的成员名（vars / funcs / signals）。
 * 供静态分析当作「已声明」，让继承来的字段在值位置不被误判未声明。
 */
function inheritedMembers(
  l: Loaded,
  loaded: Map<string, Loaded>,
  classIndex: Map<string, string>,
): string[] {
  const names: string[] = [];
  const seen = new Set<string>([l.resPath]);
  let cur = baseModule(l, loaded, classIndex);
  while (cur && !seen.has(cur.resPath)) {
    seen.add(cur.resPath);
    for (const v of cur.module.vars) names.push(v.name);
    for (const f of cur.module.funcs) names.push(f.name);
    for (const s of cur.module.signals) names.push(s.name);
    cur = baseModule(cur, loaded, classIndex);
  }
  return names;
}

interface ResolvedBase {
  /** 基类对应的 JS 导出名；host 基类为 null。 */
  jsName: string | null;
  spec: BaseSpec;
}

function resolveBase(
  l: Loaded,
  loaded: Map<string, Loaded>,
  classIndex: Map<string, string>,
  resRoot: string,
  opts: ProjectOptions,
): ResolvedBase | null {
  const ext = extendsRefText(l.module.extends);
  if (!ext) return null;

  if (ext.endsWith(".gd")) {
    const depRes = resolveGdPath(l.resPath, ext);
    const dep = loaded.get(depRes);
    if (!dep) throw new UnsupportedError("extends-missing", `extends 的脚本未找到：${ext}`);
    return { jsName: dep.jsName, spec: { kind: "import", name: dep.jsName, from: jsImportSpecifier(l, dep, opts) } };
  }

  const bare = ext.replace(/\[.*\]$/, "");
  if (HOST_BASES.has(bare)) return { jsName: null, spec: { kind: "host" } };
  if (classIndex.has(bare)) {
    const dep = classFile(bare, loaded, classIndex)!;
    return { jsName: dep.jsName, spec: { kind: "import", name: dep.jsName, from: jsImportSpecifier(l, dep, opts) } };
  }
  if (ENGINE_BASES.has(bare)) {
    throw new UnsupportedError("engine-base", `Tier 1 不支持 extends 引擎类型 ${bare}（D4）`);
  }
  throw new UnsupportedError("extends-unknown", `无法解析 extends 目标：${ext}`);
}

function jsPathFor(l: Loaded, opts: ProjectOptions): string {
  // 产物带类型标注（: Promise<void> 等），是 TypeScript —— 与语料一致走 .mts + tsx。
  const rel = l.resPath.slice(RES_PREFIX.length).replace(/\.gd$/, ".mts");
  return join(resolve(opts.outDir), rel);
}

/** 从某个产物的 js 目录到目标产物 js 的相对 ESM 说明符（带 .mts）。 */
function jsImportSpecifier(from: Loaded, target: Loaded, opts: ProjectOptions): string {
  const fromJs = jsPathFor(from, opts);
  const targetJs = jsPathFor(target, opts);
  let rel = relative(dirname(fromJs), targetJs).split(sep).join("/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

function detectCycles(loaded: Map<string, Loaded>, resRoot: string): void {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  for (const k of loaded.keys()) color.set(k, WHITE);

  const edgesOf = (l: Loaded): string[] => {
    const out = [...l.depPaths];
    const ext = extendsRefText(l.module.extends);
    if (ext && ext.endsWith(".gd")) {
      out.push(resolveGdPath(l.resPath, ext));
    }
    return out;
  };

  const dfs = (l: Loaded, stack: string[]): void => {
    color.set(l.resPath, GRAY);
    for (const dep of edgesOf(l)) {
      const d = loaded.get(dep);
      if (!d) continue;
      const c = color.get(dep);
      if (c === GRAY) {
        throw new UnsupportedError(
          "dependency-cycle",
          `跨文件依赖成环：${[...stack, l.resPath, dep].join(" → ")}`,
        );
      }
      if (c === WHITE) dfs(d, [...stack, l.resPath]);
    }
    color.set(l.resPath, BLACK);
  };

  for (const l of loaded.values()) if (color.get(l.resPath) === WHITE) dfs(l, []);
}

/** 列出目录下的全部 .gd（递归），供 CLI 以工程根为入口时使用。 */
export function findGdFiles(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...findGdFiles(p));
    else if (e.isFile() && e.name.endsWith(".gd")) out.push(p);
  }
  return out;
}
