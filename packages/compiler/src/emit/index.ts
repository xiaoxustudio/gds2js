import { analysis, beginEmit, type ElemKind, type EmitContext, type Kind, type RawAbi, ctx } from "./context";
import { staticMemberFn } from "../lower/ir";
import { GLOBAL_CONSTANTS, GLOBAL_TODO_FUNCTIONS, isGlobalConst } from "../lower/globals";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, PropAccessor, SignalDecl, Stmt, TypeRef, VarDecl } from "../lower/ir";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { isElemKind } from "@gds2js/runtime/runtime/values";
import { NATIVE_CLASS_SLOTS } from "../semantics/elem-faces";
import { NO_ANALYSIS, type AnalysisResult } from "../analyze/analysis-result";
import { buildSourceMap, type LineMapping, type RawSourceMap } from "./sourcemap";

import { HOST_MEMBERS, HOST_PRINT_NAMES } from "./surface";
import { basenameOfGd, globalConstLines, makeClosure, mark, standaloneInlineHeader } from "./helpers";
import { collectScriptBase, ctorAritiesLiteral, dictIdentityLiteral, fieldTypesLiteral, methodAritiesLiteral, methodParamsLiteral, orderInnerClasses, scriptPropsLiteral, scriptPropsReaderLiteral, staticNamesLiteral, staticVarTableLiteral, staticsTableLiteral } from "./layout";
import { computeRawAbis, staticVarSlotsLiteral } from "./abi";
import { emitClassDecl, emitClassLevelVars, emitDispatch, emitFieldDeclarations, emitFieldsMethod, emitFieldsOnlyConstructor, emitRootConstructor } from "./class";
import { emitFunc } from "./func";

export type BaseSpec =
  | { kind: "host" }
  | { kind: "none" }
  | { kind: "import"; name: string; from: string }
  | { kind: "engine"; name: string };

export type SceneChild = { expr: string; name: string; cls: string; children: SceneChild[] };

export type SceneEmit = { rootName: string; rootCls: string; children: SceneChild[] };

export interface EmitOptions {
  runtimeImport: string;
  hostImport: string | null;
  autoRun?: boolean;
  className?: string;
  baseClass?: BaseSpec;
  scene?: SceneEmit;
  classRefs?: Array<{ name: string; from: string }>;
  resPath?: string;
  preloads?: Array<{ literal: string; name: string; from: string }>;
  loadMap?: Array<{ literal: string; resPath: string }>;
  sideEffectImports?: string[];
  inheritedMembers?: string[];
  hostBaseInChain?: boolean;
  sourcemap?: boolean;
  sourceFile?: string;
  jsFile?: string;
  rawAbiExternal?: string[];
  extendedByScript?: boolean;
  runtimeMode?: "import" | "local" | "single";
  standaloneRequirePath?: string;
  standaloneInline?: string;
  projectName?: string;
}

export interface EmitResult {
  code: string;
  map: RawSourceMap | null;
}

function sceneLiteral(children: SceneChild[]): string {
  if (children.length === 0) return "[]";
  return `[${children.map((c) => `rt.sceneNode(${c.expr}, ${JSON.stringify(c.name)}, ${JSON.stringify(c.cls)}, ${sceneLiteral(c.children)})`).join(", ")}]`;
}

export function emitModule(m: Module, opts: EmitOptions, analysisResult: AnalysisResult): string {
  return emitModuleWithMap(m, opts, analysisResult).code;
}

export function emitModuleWithMap(m: Module, opts: EmitOptions, analysisResult: AnalysisResult): EmitResult {

  beginEmit(analysisResult);
  ctx.MAP_ACTIVE = opts.sourcemap === true;
  ctx.LAMBDA_DEPTH = 0;
  ctx.LINE_MAPPINGS = [];
  const runtimeImport = opts.runtimeImport;
  const hostImport = opts.hostImport;
  const autoRun = opts.autoRun ?? true;
  const className = opts.className ?? "Main";
  const classRefs = opts.classRefs ?? [];
  const resPath = opts.resPath;
  ctx.DEBUG_FILE = resPath ?? opts.sourceFile ?? `${className}.gd`;
  ctx.MODULE_RES_PATH = resPath ?? null;
  const preloads = opts.preloads ?? [];
  const sideEffectImports = opts.sideEffectImports ?? [];
  const baseClass: BaseSpec = opts.baseClass ?? (hostImport ? { kind: "host" } : { kind: "none" });

  ctx.MODULE_VARS = new Set([
    ...m.vars.filter((v) => !v.isStatic).map((v) => v.name),
    ...m.signals.map((s) => s.name),
    ...(opts.inheritedMembers ?? []),
  ]);
  ctx.MODULE_SIGNALS = new Set(m.signals.map((s) => s.name));
  ctx.MODULE_FUNCS = new Set(m.funcs.map((f) => f.name));
  ctx.PARAM_TYPES = new Map(m.funcs.map((f) => [f.name, f.params]));
  ctx.FUNC_RETURNS = new Map(m.funcs.map((f) => [f.name, f.returnType]));
  ctx.CLASS_FUNCS = new Set([
    ...m.funcs.map((f) => f.name),
    ...(opts.inheritedMembers ?? []),
    ...(baseClass.kind === "host" || opts.hostBaseInChain === true ? HOST_MEMBERS : []),
  ]);
  ctx.CURRENT_CLASS = className;
  ctx.ENGINE_BASE = baseClass.kind === "engine" ? baseClass.name : null;
  ctx.STATIC_FUNCS = new Set(m.funcs.filter((f) => f.isStatic).map((f) => f.name));
  ctx.CLASS_VALUE_OWNERS = new Map(
    m.vars.filter((v) => v.isConst || v.isStatic).map((v) => [v.name, className]),
  );
  ctx.CLASS_VALUES = new Map();
  const collectClassValues = (name: string, vars: { name: string; isConst: boolean; isStatic: boolean }[]): void => {
    ctx.CLASS_VALUES.set(name, new Set(vars.filter((v) => v.isConst || v.isStatic).map((v) => v.name)));
  };
  collectClassValues(className, m.vars);
  const collectInner = (c: ClassDecl): void => {
    collectClassValues(c.name, c.vars);
    for (const inner of c.innerClasses) collectInner(inner);
  };
  for (const c of m.innerClasses) collectInner(c);
  ctx.VAR_TYPES = new Map(m.vars.map((v) => [v.name, v.type]));
  ctx.SCRIPT_BASE = new Map();
  for (const c of m.innerClasses) collectScriptBase(c, ctx.SCRIPT_BASE);
  ctx.MODULE_CLASSES = new Set([
    ...m.innerClasses.map((c) => c.name),
    ...(m.className ? [m.className] : []),
    ...classRefs.map((r) => r.name),
  ]);
  ctx.INNER_CLASSES = new Map();
  const indexInner = (c: ClassDecl): void => {
    ctx.INNER_CLASSES.set(c.name, c);
    for (const inner of c.innerClasses) indexInner(inner);
  };
  for (const c of m.innerClasses) indexInner(c);
  ctx.EXTENDED_INNER = new Set<string>();
  for (const c of ctx.INNER_CLASSES.values()) {
    if (c.extends !== null && ctx.INNER_CLASSES.has(c.extends)) ctx.EXTENDED_INNER.add(c.extends);
  }
  ctx.PRELOADS = new Map(preloads.map((p) => [p.literal, p.name]));
  ctx.LOADS = new Map((opts.loadMap ?? []).map((l) => [l.literal, l.resPath]));

  const out: string[] = [];
  out.push("// 由 gds2js 从 main.gd 编译生成 —— 不要手改。");
  out.push("");
  const runtimeMode = opts.runtimeMode ?? "import";
  if (runtimeMode === "single") {
    if (!opts.standaloneInline) throw new UnsupportedError("emit-standalone", "single 模式需要 standaloneInline");
    out.push(...standaloneInlineHeader(opts.standaloneInline).split("\n"));
  } else if (runtimeMode === "local") {
    const p = opts.standaloneRequirePath ?? "./gds2js-standalone.cjs";
    out.push(`import { createRequire } from "node:module";`);
    out.push(`const { rt, ${HOST_PRINT_NAMES.join(", ")}, SceneTree${opts.scene !== undefined ? ", sceneRun" : ""} } = createRequire(import.meta.url)(${JSON.stringify(p)});`);
  } else {
    out.push(`import * as rt from "${runtimeImport}";`);
    if (hostImport) {
      const hostNames = baseClass.kind === "host" ? [...HOST_PRINT_NAMES, "SceneTree"] : [...HOST_PRINT_NAMES];
      if (opts.scene !== undefined) hostNames.push("sceneRun");
      out.push(`import { ${hostNames.join(", ")} } from "${hostImport}";`);
    }
  }
  const imports = new Map<string, string>();
  for (const ref of classRefs) imports.set(ref.name, ref.from);
  for (const p of preloads) imports.set(p.name, p.from);
  for (const [name, from] of imports) out.push(`import { ${name} } from "${from}";`);
  const bare = new Set<string>(sideEffectImports ?? []);
  for (const ref of classRefs) bare.add(ref.from);
  for (const p of preloads) bare.add(p.from);
  for (const spec of bare) out.push(`import "${spec}";`);
  if (baseClass.kind === "import") out.push(`import { ${baseClass.name} } from "${baseClass.from}";`);
  out.push("");

  const globalConsts = globalConstLines(m, new Set<string>([
    ...m.vars.map((v) => v.name),
    ...classRefs.map((r) => r.name),
    ...preloads.map((p) => p.name),
  ]));
  if (globalConsts.length > 0) {
    out.push(...globalConsts);
    out.push("");
  }

  ctx.ENUM_NAMES = new Set<string>();
  for (const en of m.enums) {
    mark(out.length, en.loc);
    if (en.name) {
      ctx.ENUM_NAMES.add(en.name);
      const pairs = en.members.map((mm) => `[rt.V.str(${JSON.stringify(mm.name)}), rt.V.int(${mm.value})]`).join(", ");
      out.push(`const ${en.name} = rt.dictOf([${pairs}]);`);
    } else {
      for (const mm of en.members) out.push(`const ${mm.name} = rt.V.int(${mm.value});`);
    }
  }
  if (m.enums.length > 0) out.push("");

  ctx.RAW_ABIS = computeRawAbis(m, {
    hasBase: baseClass.kind === "import",
    inherited: new Set(opts.inheritedMembers ?? []),
    external: new Set(opts.rawAbiExternal ?? []),
  });

  const heritage =
    baseClass.kind === "host" ? " extends SceneTree"
    : baseClass.kind === "import" ? ` extends ${baseClass.name}`
    : baseClass.kind === "engine" ? " extends rt.GdNodeObject"
    : " extends rt.GdScriptObject";
  const proto = baseClass.kind === "import" || opts.extendedByScript === true;
  ctx.INIT_HAS_BASE = baseClass.kind === "import";
  ctx.INIT_AS_METHOD = proto;
  ctx.NEEDS_HOST_SUPER = !proto;
  out.push(`export class ${className}${heritage} {`);
  if (baseClass.kind === "engine") {
    out.push(`  override __gd_engine_class__ = ${JSON.stringify(baseClass.name)};`);
    out.push("  override __gd_freed__ = false;");
    out.push("  override __gd_node_queued__ = false;");
    out.push('  override __gd_node_name__ = "";');
    out.push("  override __gd_node_parent__: object | null = null;");
    out.push("  override __gd_node_children__: object[] = [];");
    out.push("  override __gd_node_groups__: string[] = [];");
  }
  if (proto && baseClass.kind !== "import") out.push(...emitRootConstructor(true));
  out.push(...emitFieldDeclarations(m.vars, m.signals));
  out.push(...emitFieldsMethod(m.vars, m.signals, proto && baseClass.kind === "import", out.length));
  out.push(...emitClassLevelVars(m.vars, out.length));
  if (!proto && !m.funcs.some((f) => f.name === "_init" && !f.isStatic)) out.push(...emitFieldsOnlyConstructor());
  ctx.INHERITED_METHODS = new Set([
    ...(opts.inheritedMembers ?? []),
    ...(baseClass.kind === "host" || opts.hostBaseInChain === true ? HOST_MEMBERS : []),
  ]);
  ctx.SCRIPT_INHERITED = new Set(opts.inheritedMembers ?? []);
  for (const f of m.funcs) {
    const base = out.length;
    const lines = emitFunc(f, base);
    for (const line of lines) out.push(`  ${line}`);
  }
  ctx.INHERITED_METHODS = new Set();
  ctx.SCRIPT_INHERITED = new Set();
  out.push(...emitDispatch(m.funcs, proto));
  out.push("}");
  out.push("");

  out.push(`const __gd_d_${className} = rt.defineClass(${className}, ${makeClosure(className, m.funcs.find((x) => x.name === "_init" && !x.isStatic), proto)}, (o) => o instanceof ${className});`);
  if (m.className) out.push(`rt.nameClass(__gd_d_${className}, ${JSON.stringify(m.className)});`);
  if (baseClass.kind === "import") {
    out.push(`rt.setClassBase(__gd_d_${className}, rt.lookupClass(${JSON.stringify(baseClass.name)}) ?? null);`);
  }
  const moduleFields = fieldTypesLiteral(m.vars.filter((v) => !v.isStatic));
  if (moduleFields !== null) out.push(`rt.registerFieldTypes(__gd_d_${className}, ${moduleFields});`);
  const moduleProps = scriptPropsLiteral(m.vars.filter((v) => !v.isStatic));
  const modulePropVars = m.vars.filter((v) => !v.isStatic);
  if (moduleProps !== null) out.push(`rt.registerScriptProps(__gd_d_${className}, ${moduleProps}, ${scriptPropsReaderLiteral(className, modulePropVars)});`);
  out.push(dictIdentityLiteral(`__gd_d_${className}`, "", m.vars, className));
  const moduleStaticVars = staticVarTableLiteral(m.vars);
  const moduleStaticSlots = staticVarSlotsLiteral(className, m.vars);
  if (moduleStaticVars !== null && moduleStaticSlots !== null) out.push(`rt.registerStaticVars(__gd_d_${className}, ${moduleStaticVars}, ${moduleStaticSlots});`);
  const moduleArities = methodAritiesLiteral(m.funcs);
  if (moduleArities !== null) out.push(`rt.registerMethodArities(__gd_d_${className}, ${moduleArities});`);
  const moduleCtor = ctorAritiesLiteral(m.funcs);
  if (moduleCtor !== null) out.push(`rt.registerCtorArities(__gd_d_${className}, ${moduleCtor});`);
  const moduleParams = methodParamsLiteral(m.funcs);
  if (moduleParams !== null) out.push(`rt.registerMethodParams(__gd_d_${className}, ${moduleParams});`);
  const moduleStatics = staticNamesLiteral(m.funcs);
  if (moduleStatics.length > 0) out.push(`rt.registerStaticMethods(__gd_d_${className}, ${JSON.stringify(moduleStatics)}, ${staticsTableLiteral(className, m.funcs)});`);
  if (baseClass.kind === "engine") {
    out.push(`rt.registerNativeBase(__gd_d_${className}, ${JSON.stringify(baseClass.name)});`);
  } else if (baseClass.kind !== "import") {
    out.push(`rt.registerNativeBase(__gd_d_${className}, ${JSON.stringify(baseClass.kind === "host" ? "SceneTree" : "RefCounted")});`);
  }
  const scriptLabel = m.className ?? basenameOfGd(resPath ?? opts.sourceFile) ?? className + ".gd";
  if (scriptLabel !== null && scriptLabel !== undefined) {
    out.push(`rt.registerScriptLabel(__gd_d_${className}, ${JSON.stringify(scriptLabel)});`);
  }
  if (resPath) out.push(`rt.registerScript(${JSON.stringify(resPath)}, __gd_d_${className});`);

  for (const c of orderInnerClasses(m.innerClasses)) {
    const base = out.length;
    for (const line of emitClassDecl(c, base)) out.push(line);
  }

  if (autoRun) {
    if (opts.projectName !== undefined && opts.projectName !== "") {
      out.push(`rt.setHostProjectName(${JSON.stringify(opts.projectName)});`);
    }
    out.push(`const __gd_entry = new ${className}();`);
    out.push(`try {`);
    if (opts.scene !== undefined) {
      const sc = opts.scene;
      out.push(`  await sceneRun(__gd_entry, ${JSON.stringify(sc.rootName)}, ${JSON.stringify(sc.rootCls)}, ${sceneLiteral(sc.children)});`);
    } else {
      out.push(`  await __gd_entry.run();`);
    }
    out.push(`} catch (__gd_e) {`);
    out.push(`  rt.reportRunFailure(__gd_e);`);
    out.push(`}`);
  }

  let code = `${out.join("\n")}\n`;
  let map: RawSourceMap | null = null;
  if (ctx.MAP_ACTIVE) {
    const sourceFile = opts.sourceFile ?? `${className}.gd`;
    const jsFile = opts.jsFile ?? `${className}.mjs`;
    map = buildSourceMap({ file: jsFile, source: sourceFile, mappings: ctx.LINE_MAPPINGS });
    code += `//# sourceMappingURL=${jsFile}.map\n`;
  }
  ctx.MAP_ACTIVE = false;
  ctx.RAW_ABIS = new Map();
  ctx.RAW_ARRAYS = new Map();
  ctx.RAW_DICTS = new Map();
  ctx.CURRENT_RET = null;
  ctx.VAR_TYPES = new Map();
  ctx.LOCAL_TYPES = new Map();
  ctx.CLASS_FUNCS = new Set();
  ctx.FUNC_RETURNS = new Map();
  ctx.UNTYPED_NAMES = new Set();
  return { code, map };
}

export { FAST_NAMES, OPS_NAMES, RT_NAMES, V_NAMES } from "./surface";
