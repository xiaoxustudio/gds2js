import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { cachedLower } from "./ir-cache";
import { emitModule, emitModuleWithMap, type BaseSpec, type SceneChild, type SceneEmit } from "../emit/index";
import { parseScene, type SceneNode } from "../parse/scene";
import type { RawSourceMap } from "../emit/sourcemap";
import type { Diagnostic } from "../analyze/analysis-result";
import { analyze } from "../analyze/index";
import type { ClassDecl, Expr, Module, Stmt, TypeRef } from "../lower/ir";
import { lower } from "../lower/lower";
import { parseSource } from "../parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { ENGINE_CLASS_NAMES } from "@gds2js/runtime/runtime/engine-classes";

const RES_PREFIX = "res://";

const HOST_BASES = new Set(["SceneTree"]);

const SCRIPT_NODE_BASES = new Set(["Node", "Node2D", "Control", "Node3D"]);

export interface ProjectOptions {
  entries: string[];
  resRoot: string;
  outDir: string;
  closureOnly?: boolean;
  runtimeImport: string;
  hostImport: string | null;
  runtimeRoot?: string;
  runtimeFile?: string;
  hostFile?: string;
  autoRun?: boolean;
  sourcemap?: boolean;
  runtimeMode?: "import" | "local" | "single";
  standaloneInline?: string;
  standaloneFile?: string;
  sceneFile?: string | null;
}

export interface CompiledModule {
  resPath: string;
  jsPath: string;
  className: string;
  code: string;
  map?: RawSourceMap;
  usesPackCodec: boolean;
}

export interface ProjectResult {
  modules: CompiledModule[];
  diags: Array<{ resPath: string; diagnostic: Diagnostic }>;
}

function toResPath(absPath: string, resRoot: string): string {
  const rel = relative(resRoot, absPath).split(sep).join("/");
  return RES_PREFIX + rel;
}

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

function mainSceneFile(resRoot: string): string | null {
  const project = join(resRoot, "project.godot");
  if (!existsSync(project)) return null;
  const m = /^run\/main_scene="(res:\/\/[^"]+)"/m.exec(readFileSync(project, "utf8"));
  if (m === null) return null;
  const abs = resToAbs(normalizeRes(m[1]!), resRoot);
  return existsSync(abs) ? abs : null;
}

function climbsAboveRoot(target: string, fromAbs: string, resRoot: string): boolean {
  if (target.startsWith(RES_PREFIX)) return false;
  const rel = relative(resRoot, resolve(join(dirname(fromAbs), target)));
  return rel === "" || rel.startsWith("..") || isAbsolute(rel);
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
    const module = await cachedLower(src, async () => lower(await parseSource(src)));
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
  if (!opts.closureOnly) for (const f of findGdFiles(resRoot)) seed(f);
  for (let i = 0; i < queue.length; i++) {
    const resPath = queue[i]!;
    const abs = resToAbs(resPath, resRoot);
    const l = await need(abs);
    if (!l) continue;
    const collect = (candidate: string | null, from: string): string | null => {
      if (!candidate) return null;
      if (!candidate.endsWith(".gd")) return null;
      if (opts.closureOnly && climbsAboveRoot(candidate, l.absPath, resRoot)) {
        throw new UnsupportedError(
          "closure-root",
          `"${candidate}" 往上爬出了闭包根（默认是入口所在目录）：res:// 空间放不下 .. —— 用 --res-root 点名真正的根，或把父脚本挪进入口那一层`,
        );
      }
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
  const extendedModules = new Set<string>();
  for (const l of loaded.values()) {
    const bm = baseModule(l, loaded, classIndex);
    if (bm) {
      rawAbiBlockedModules.add(l.resPath);
      rawAbiBlockedModules.add(bm.resPath);
      extendedModules.add(bm.resPath);
    }
  }

  const scenePath = opts.sceneFile === undefined ? mainSceneFile(opts.resRoot) : opts.sceneFile;
  const sceneRoot: SceneNode | null = scenePath ? parseScene(readFileSync(scenePath, "utf8")) : null;
  const sceneDeps = new Map<string, Loaded>();
  if (sceneRoot !== null) {
    const collect = (node: SceneNode): void => {
      if (node.script !== null) {
        const dep = loaded.get(normalizeRes(node.script));
        if (dep === undefined) throw new UnsupportedError("scene-script-missing", `场景脚本 ${node.script} 不在编译作用域里`);
        sceneDeps.set(normalizeRes(node.script), dep);
      }
      for (const c of node.children) collect(c);
    };
    collect(sceneRoot);
    if (sceneRoot.script === null) throw new UnsupportedError("scene-root-script", "场景根节点没挂脚本时入口驱动发不出来（只量过根节点带 script= 的那一形）");
  }

  const sceneChild = (node: SceneNode): SceneChild => {
    if (node.cls !== "Node" && node.cls !== "Node2D") throw new UnsupportedError("scene-node-class", `场景节点的类型 ${node.cls} 造不出来（只量过 Node 与 Node2D）`);
    let expr = `rt.engineClassNew(${JSON.stringify(node.cls)})`;
    if (node.script !== null) expr = `new ${(sceneDeps.get(normalizeRes(node.script)) as Loaded).jsName}()`;
    return { expr, name: node.name, cls: node.cls, children: node.children.map((c) => sceneChild(c)) };
  };

  const modules: CompiledModule[] = [];
  for (const l of loaded.values()) {
    const inherited = inheritedMembers(l, loaded, classIndex);
    const globals = new Set<string>([...classIndex.keys(), ...inherited]);
    const hostChain = opts.hostImport !== null && hostOnChain(l, loaded, classIndex, entryResSet);
    const analysisResult = analyze(l.module, globals, l.resPath, hostChain);
    const fileDiags = analysisResult.diagnostics.map((d) => ({ resPath: l.resPath, diagnostic: d }));
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

    const scene: SceneEmit | null =
      sceneRoot !== null && normalizeRes(sceneRoot.script ?? "") === l.resPath
        ? { rootName: sceneRoot.name, rootCls: sceneRoot.cls, children: sceneRoot.children.map((c) => sceneChild(c)) }
        : null;
    if (scene !== null) {
      for (const dep of sceneDeps.values()) {
        if (dep.resPath === l.resPath) continue;
        if (!classRefs.some((r) => r.name === dep.jsName)) classRefs.push({ name: dep.jsName, from: jsImportSpecifier(l, dep, opts) });
      }
    }

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
      scene: scene ?? undefined,
      hostBaseInChain: hostChain,
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
    const { code, map } = opts.sourcemap ? emitModuleWithMap(l.module, emitOpts, analysisResult) : { code: emitModule(l.module, emitOpts, analysisResult), map: null };

    modules.push({
      resPath: l.resPath,
      jsPath,
      className: l.jsName,
      code,
      usesPackCodec: l.module.usesPackCodec,
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

function hostOnChain(
  l: Loaded,
  loaded: Map<string, Loaded>,
  classIndex: Map<string, string>,
  entryResSet: Set<string>,
  seen = new Set<string>(),
): boolean {
  if (seen.has(l.resPath)) return false;
  seen.add(l.resPath);
  const ext = extendsRefText(l.module.extends);
  if (!ext) return entryResSet.has(l.resPath);
  if (HOST_BASES.has(ext.replace(/\[.*\]$/, ""))) return true;
  const parent = baseModule(l, loaded, classIndex);
  return parent ? hostOnChain(parent, loaded, classIndex, entryResSet, seen) : false;
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
  if (SCRIPT_NODE_BASES.has(bare)) return { jsName: null, spec: { kind: "engine", name: bare } };
  if (ENGINE_CLASS_NAMES.has(bare)) {
    throw new UnsupportedError("engine-base", `extends 引擎类型 ${bare} 还没建模（脚本基类只量过 Node、Node2D、Control 与 Node3D）`);
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
