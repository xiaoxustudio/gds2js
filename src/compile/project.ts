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


const RES_PREFIX = "res://";

/** GDScript 里宿主/引擎提供、不需要文件支持的基类。Tier 1 只给了 SceneTree。 */
const HOST_BASES = new Set(["SceneTree"]);

/** 认得但 Tier 1 不给实现的引擎基类 —— 遇到就响亮报错（D4）。 */
const ENGINE_BASES = new Set([
  "Node", "Node2D", "Node3D", "Control", "Resource", "RefCounted", "Object",
  "CharacterBody2D", "CharacterBody3D", "Area2D", "StaticBody2D", "RigidBody2D",
]);

export interface ProjectOptions {
  entries: string[];
  resRoot: string;
  outDir: string;
  runtimeImport: string;
  hostImport: string | null;
  /**
   * 静态打包（`export --pack scriptc`）用：`runtime/` 与 `host.ts` 的**源码**只铺一份，
   * 放在这个绝对目录下，每个模块的 import 按自己那一层的相对深度算出来。
   * 不给它就照 `runtimeImport` / `hostImport` 原样发（node 那两支的做法：每层各拷一份打平运行时）。
   * 为什么静态不能每层一份：scriptc 会把每一层的 runtime 编成**独立的一张图**，
   * 同一个脚本类就有两份 `ClassDesc` 身份 —— 那是静默错里最贵的一类。
   */
  runtimeRoot?: string;
  /** `runtimeRoot` 里 runtime 那一份的目标文件名（不带扩展名，scriptc 那支是 `runtime/index`）。 */
  runtimeFile?: string;
  /** 同一棵树根上的宿主文件名；不给就跟 `runtimeImport` 一样走静态那条 import。 */
  hostFile?: string;
  autoRun?: boolean;
  sourcemap?: boolean;
  runtimeMode?: "import" | "local" | "single";
  standaloneInline?: string;
  standaloneFile?: string;
}

export interface CompiledModule {
  resPath: string;
  jsPath: string;
  className: string;
  code: string;
  map?: RawSourceMap;
}

export interface ProjectResult {
  modules: CompiledModule[];
  diags: Array<{ resPath: string; diagnostic: Diagnostic }>;
}


function toResPath(absPath: string, resRoot: string): string {
  const rel = relative(resRoot, absPath).split(sep).join("/");
  return RES_PREFIX + rel;
}

/** 把 GDScript 里的路径字符串解析成规范化的 res:// 路径（全程在 res 空间内）。 */
function resolveGdPath(fromRes: string, target: string): string {
  if (target.startsWith(RES_PREFIX)) return normalizeRes(target);
  const fromDir = dirname(fromRes);
  const base = fromDir === "" || fromDir === RES_PREFIX || fromDir === "res:" ? RES_PREFIX : fromDir + "/";
  return normalizeRes(base + target);
}

/** res:// 路径 → 文件系统绝对路径。 */
function resToAbs(resPath: string, resRoot: string): string {
  return join(resRoot, resPath.slice(RES_PREFIX.length));
}

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
  if (/^["'].*["']$/.test(trimmed)) return trimmed.slice(1, -1);
  return trimmed;
}


interface Loaded {
  resPath: string;
  absPath: string;
  module: Module;
  depPaths: Set<string>;
  classRefs: Set<string>;
  jsName: string;
}

export async function compileProject(opts: ProjectOptions): Promise<ProjectResult> {
  const resRoot = resolve(opts.resRoot);
  const entries = opts.entries.map((e) => resolve(e));

  const loaded = new Map<string, Loaded>();
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
      if (!candidate.endsWith(".gd")) return null;
      const depRes = resolveGdPath(from, candidate);
      if (!l.depPaths.has(depRes)) {
        l.depPaths.add(depRes);
        queue.push(depRes);
      }
      return depRes;
    };

    collect(extendsRefText(l.module.extends), resPath);
    walkModuleExprs(l.module, (e) => {
      if (e.kind === "call" && e.callee.kind === "ident" && (e.callee.name === "preload" || e.callee.name === "load")) {
        const a = e.args[0];
        if (a && a.kind === "lit" && a.lit === "string") collect(String(a.value), resPath);
      }
    });
  }

  const classIndex = new Map<string, string>();
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

  const entryResSet = new Set(entries.map((e) => normalizeRes(toResPath(e, resRoot))));
  for (const l of loaded.values()) {
    const own = l.module.className;
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

    const extText = extendsRefText(l.module.extends);
    if (extText && !extText.endsWith(".gd")) record(extText.replace(/\[.*\]$/, ""));

    walkModuleExprs(l.module, (e) => {
      if (e.kind === "ident") record(e.name);
      if (e.kind === "attribute" && e.name === "new" && e.obj.kind === "ident") record(e.obj.name);
      if (e.kind === "is" || e.kind === "as") record(typeRefName(e.type));
    });
  }

  detectCycles(loaded, resRoot);

  const attrNames = new Set<string>();
  for (const l of loaded.values()) {
    walkModuleExprs(l.module, (e) => {
      if (e.kind === "attribute") attrNames.add(e.name);
      if (e.kind === "lit" && e.lit === "string") attrNames.add(String(e.value));
    });
  }
  const rawAbiBlockedModules = new Set<string>();
  // 被别的脚本类 extends 的那些模块：构造要走协议形状（S174 —— 子类的字段初始化子必须排在父类 `_init` 体之前）
  const extendedModules = new Set<string>();
  for (const l of loaded.values()) {
    const bm = baseModule(l, loaded, classIndex);
    if (bm) {
      rawAbiBlockedModules.add(l.resPath);
      rawAbiBlockedModules.add(bm.resPath);
      extendedModules.add(bm.resPath);
    }
  }

  const modules: CompiledModule[] = [];
  for (const l of loaded.values()) {
    const inherited = inheritedMembers(l, loaded, classIndex);
    const globals = new Set<string>([...classIndex.keys(), ...inherited]);
    const fileDiags = analyze(l.module, globals).map((d) => ({ resPath: l.resPath, diagnostic: d }));
    if (fileDiags.length > 0) {
      diags.push(...fileDiags);
      continue;
    }

    const isEntry = entryResSet.has(l.resPath);
    const base = resolveBase(l, loaded, classIndex, resRoot, opts);
    const baseName = base ? base.jsName : null;
    const classRefs = [...l.classRefs]
      .filter((name) => {
        const dep = classFile(name, loaded, classIndex);
        return !dep || dep.jsName !== baseName;
      })
      .map((name) => {
        const dep = classFile(name, loaded, classIndex)!;
        return { name: dep.jsName, from: jsImportSpecifier(l, dep, opts) };
      });

    const preloads: Array<{ literal: string; name: string; from: string }> = [];
    const loadMap = new Map<string, string>();
    const sideEffect = new Map<string, string>();
    walkModuleExprs(l.module, (e) => {
      if (e.kind !== "call" || e.callee.kind !== "ident") return;
      const fn = e.callee.name;
      if (fn !== "preload" && fn !== "load") return;
      const a = e.args[0];
      if (!a || a.kind !== "lit" || a.lit !== "string") return;
      const literal = String(a.value);
      const depRes = resolveGdPath(l.resPath, literal);
      const dep = loaded.get(depRes);
      if (!dep) return;
      if (fn === "preload") {
        if (!preloads.some((p) => p.literal === literal)) {
          preloads.push({ literal, name: dep.jsName, from: jsImportSpecifier(l, dep, opts) });
        }
      } else {
        loadMap.set(literal, depRes);
        sideEffect.set(depRes, jsImportSpecifier(l, dep, opts));
      }
    });

    const jsPath = jsPathFor(l, opts);
    const emitOpts = {
      runtimeImport: opts.runtimeRoot
        ? relFromJs(jsPath, join(opts.runtimeRoot, opts.runtimeFile ?? "runtime/index"))
        : opts.runtimeImport,
      hostImport:
        opts.hostImport === null
          ? null
          : opts.runtimeRoot
            ? relFromJs(jsPath, join(opts.runtimeRoot, opts.hostFile ?? "host"))
            : opts.hostImport,
      autoRun: opts.autoRun ?? isEntry,
      className: l.jsName,
      baseClass: base?.spec ?? (isEntry && opts.hostImport ? { kind: "host" } : { kind: "none" }),
      classRefs,
      resPath: l.resPath,
      preloads,
      inheritedMembers: inherited,
      loadMap: [...loadMap].map(([literal, resPath]) => ({ literal, resPath })),
      sideEffectImports: [...sideEffect.values()],
      rawAbiExternal: rawAbiBlockedModules.has(l.resPath)
        ? l.module.funcs.map((f) => f.name)
        : [...attrNames],
      extendedByScript: extendedModules.has(l.resPath),
      runtimeMode: opts.runtimeMode ?? "import",
      standaloneInline: opts.standaloneInline,
      standaloneRequirePath:
        opts.runtimeMode === "local" && opts.standaloneFile
          ? "./" + relative(dirname(jsPath), opts.standaloneFile).split(sep).join("/")
          : undefined,
      sourcemap: opts.sourcemap,
      jsFile: basename(jsPath),
      sourceFile: relative(dirname(jsPath), join(resRoot, l.resPath.slice(RES_PREFIX.length))).split(sep).join("/"),
    };
    const { code, map } = opts.sourcemap ? emitModuleWithMap(l.module, emitOpts) : { code: emitModule(l.module, emitOpts), map: null };

    modules.push({
      resPath: l.resPath,
      jsPath,
      className: l.jsName,
      code,
      map: map ?? undefined,
    });
  }

  if (diags.length > 0) {
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
  return null;
}

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
  const rel = l.resPath.slice(RES_PREFIX.length).replace(/\.gd$/, ".mts");
  return join(resolve(opts.outDir), rel);
}

/** 从某个产物的 js 目录到目标产物 js 的相对 ESM 说明符（带 .mts）。 */
function jsImportSpecifier(from: Loaded, target: Loaded, opts: ProjectOptions): string {
  return relFromJs(jsPathFor(from, opts), jsPathFor(target, opts));
}

/** 从某个产物的目录到**绝对**目标的相对 ESM 说明符（`./` / `../` 起头，斜杠分隔）。 */
function relFromJs(fromJsPath: string, absTarget: string): string {
  const rel = relative(dirname(fromJsPath), absTarget).split(sep).join("/");
  return rel.startsWith(".") ? rel : "./" + rel;
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

export function findGdFiles(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...findGdFiles(p));
    else if (e.isFile() && e.name.endsWith(".gd")) out.push(p);
  }
  return out;
}
