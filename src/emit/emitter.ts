import { staticMemberFn } from "../lower/ir";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Pattern, PropAccessor, Stmt, TypeRef, VarDecl } from "../lower/ir";
import { UnsupportedError } from "../runtime/errors";
import { isElemKind } from "../runtime/values";
import { buildSourceMap, type LineMapping, type RawSourceMap } from "./sourcemap";


export type BaseSpec =
  | { kind: "host" }
  | { kind: "none" }
  | { kind: "import"; name: string; from: string };

export interface EmitOptions {
  runtimeImport?: string;
  hostImport?: string | null;
  autoRun?: boolean;
  className?: string;
  baseClass?: BaseSpec;
  classRefs?: Array<{ name: string; from: string }>;
  resPath?: string;
  preloads?: Array<{ literal: string; name: string; from: string }>;
  loadMap?: Array<{ literal: string; resPath: string }>;
  sideEffectImports?: string[];
  inheritedMembers?: string[];
  sourcemap?: boolean;
  sourceFile?: string;
  jsFile?: string;
  rawAbiExternal?: string[];
  runtimeMode?: "import" | "local" | "single";
  standaloneRequirePath?: string;
  standaloneInline?: string;
}

const DEFAULT_RUNTIME_IMPORT = "../../../src/runtime/index";
const DEFAULT_HOST_IMPORT = "../../../tools/harness/scene-tree";

const BINOP: Record<string, string> = {
  "+": "add",
  "-": "sub",
  "*": "mul",
  "/": "div",
  "%": "mod",
  "**": "pow",
  "==": "eq",
  "!=": "neq",
  "<": "lt",
  "<=": "lte",
  ">": "gt",
  ">=": "gte",
  "<<": "shl",
  ">>": "shr",
  "&": "band",
  "|": "bor",
  "^": "bxor",
};

/**
 * range(...) 的实参 → 交给运行时的裸 number 参数串。BUILTIN.range（表达式用法）与
 * `for x in range(...)` 的裸循环展开共用这一份，免得两条路径把参数渲染歪。
 * 第三个实参是 step —— 早先只发前两参，于是 `for i in range(0, 10, 2)` **静默**按 1 递增
 * （058 差分实测：Godot 0,2,4,6,8 而我们 0,1,2,…）。参数对不上就响，别再悄悄丢。
 */
function rangeArgList(a: Array<string | undefined>): string {
  if (a.length > 3) {
    throw new UnsupportedError("range-arity", `range 最多 3 个参数（收到 ${a.length} 个）`);
  }
  return `[${a.filter((x): x is string => x !== undefined).join(", ")}]`;
}

/** 认 `range(...)` 调用（1~3 参）。emitCall 里 BUILTIN 先于本类方法命中，故 range 必是内置。 */
function isRangeCall(e: Expr): e is Extract<Expr, { kind: "call" }> {
  return (
    e.kind === "call" &&
    e.callee.kind === "ident" &&
    e.callee.name === "range" &&
    e.args.length >= 1 &&
    e.args.length <= 3
  );
}

/** 映射到运行时的内置函数 */
const BUILTIN: Record<string, (args: string[]) => string> = {
  range: (a) => `rt.V.array(rt.range(${rangeArgList(a)}))`,
  str: (a) => `rt.strOf(${a.join(", ")})`,
  float: (a) => `rt.toFloat(${a.join(", ")})`,
  int: (a) => `rt.toInt(${a.join(", ")})`,
  bool: (a) => `rt.toBool(${a.join(", ")})`,
  sqrt: (a) => `rt.sqrt(${a.join(", ")})`,
  hash: (a) => `rt.variantHash([${a.join(", ")}])`,
  abs: (a) => `rt.abs(${a.join(", ")})`,
  len: (a) => `rt.lengthOf(${a.join(", ")})`,
  typeof: (a) => `rt.typeOf(${a.join(", ")})`,
  Vector2: (a) => `rt.vector2New([${a.join(", ")}])`,
  Vector3: (a) => `rt.vector3New([${a.join(", ")}])`,
  Vector2i: (a) => `rt.vector2iNew([${a.join(", ")}])`,
  Color: (a) => `rt.colorNew([${a.join(", ")}])`,
  String: (a) => `rt.stringCtor([${a.join(", ")}])`,
  StringName: (a) => `rt.stringNameCtor([${a.join(", ")}])`,
  PackedByteArray: (a) => `rt.bytesCtor([${a.join(", ")}])`,
  PackedInt32Array: (a) => `rt.packCtor("int32", [${a.join(", ")}])`,
  PackedInt64Array: (a) => `rt.packCtor("int64", [${a.join(", ")}])`,
  PackedFloat32Array: (a) => `rt.packCtor("float32", [${a.join(", ")}])`,
  PackedFloat64Array: (a) => `rt.packCtor("float64", [${a.join(", ")}])`,
  PackedStringArray: (a) => `rt.packCtor("string", [${a.join(", ")}])`,
  PackedVector2Array: (a) => `rt.packCtor("vector2", [${a.join(", ")}])`,
  PackedVector3Array: (a) => `rt.packCtor("vector3", [${a.join(", ")}])`,
  PackedColorArray: (a) => `rt.packCtor("color", [${a.join(", ")}])`,
  Array: (a) => `rt.arrayFromVariant(${a[0] ?? "rt.V.nil()"})`,
};

/** 认得但还没实现的内置：宁可响，不能悄悄生成错代码 */
const BUILTIN_TODO = new Set([
  "Vector2i",
  "Vector3",
  "Vector3i",
  "load",
  "preload",
]);

/**
 * 模块级名字。局部变量不在里面，所以发射成裸标识符；
 * 模块级的变量 / 信号 / 函数被发射成类字段或方法，引用时必须带 `this.`。
 *
 * 已知缺口：局部变量与模块级变量同名时会被误判成 `this.x`。
 * emitter 目前没有作用域信息，等 IR 带上符号解析结果再修。
 */
let MODULE_VARS = new Set<string>();
let MODULE_FUNCS = new Set<string>();
let MODULE_CLASSES = new Set<string>();
/** preload("字面量") → 解析到的类绑定名 */
let PRELOADS = new Map<string, string>();
/** load("字面量") → 规范化 res 路径（脚本注册表的键） */
let LOADS = new Map<string, string>();
/** 正在发射 _init（constructor）体——只有此上下文允许 super(...) 构造调用。 */
let IN_CONSTRUCTOR = false;
/** 正在发射的模块里 named enum 的名字（`Suit.HEARTS` 点访问要特判成 rt.index） */
let ENUM_NAMES = new Set<string>();
/** 当前正在发射的类的成员名（内部类方法里引用 `hp` 要变成 `this.hp`） */
let CURRENT_MEMBERS = new Set<string>();
/**
 * 当前类作用域里的 `static func` 名字（模块类与内部类各一套）。
 * 三条实测口径决定它必须存在（S160）：静态方法**发在构造器上**，所以
 * ① 实例方法里裸调静态（`func usestatic(): return make()`）不能发成 `this.make()` —— 实例摸不到静态；
 * ② 静态方法里裸调静态同理要发成 `Inner.twice(...)`；
 * ③ 静态方法名站在值位置（`typeof(Inner.make)` → 25）要发成绑过类名的 Callable。
 */
let STATIC_FUNCS = new Set<string>();
/** 当前类作用域的 JS 类名：静态调用与静态取值都挂在这个名字上。 */
let CURRENT_CLASS = "";
/**
 * 当前作用域可见的 `const` → **它所属的 JS 类名**。
 * Godot 的常量是类级的，而且**内部类看得见外层脚本的常量**（f29 实测 t2/t4 都给值）；
 * 我们平时把常量发成实例字段，于是内部类里读外层常量会拿到 `this.NAME` = undefined → 印 `<null>`
 * —— 一处静默错（f29 对拍：Godot `outer-name`、我们 `<null>`）。
 * 现在给每个常量在**它自己的类**上再发一份 static 副本，裸读一律按归属发成 `<类>.NAME`，
 * 静态方法里读常量（f15 t4/t5）与内部类读外层常量（f29 t2/t4）就同一条路了。
 */
let CLASS_VALUE_OWNERS = new Map<string, string>();
/**
 * 「这个类有哪些类级值（常量 / 静态变量）」—— 认 `Inner.IC`、`A.sv` 这种**类名点类级值**的写法
 * （实测 f29 t7、f16 t1 都读得到）。要单独一张按类分的表：外层脚本里同名常量会遮住内部类那个
 * （f29 的 `TOP` 就是），按「当前作用域谁可见」判会把 `Inner.TOP` 认成外层的。
 * 必须在发射任何函数体**之前**建好 —— 模块方法在产物里排在内部类之前。
 */
let CLASS_VALUES = new Map<string, Set<string>>();
/**
 * 当前作用域里**声明了类型**的名字 → 那个 TypeRef（模块级 + 当前类的成员变量，emitClassDecl 进出时切换）。
 * 赋值点要按声明类型转换：实测 Godot 对 `var mt: int` 之后 `mt = 2.7` 给 2（截断），
 * 我们过去直接把 float 存进去 —— 一处静默错（用例 118 的 q1）。
 */
let VAR_TYPES = new Map<string, TypeRef | null>();
/** 函数体内 `var x: T` 的声明类型（含嵌套块），emitFunc 每次重建并与 VAR_TYPES 合并。 */
let LOCAL_TYPES = new Map<string, TypeRef | null>();

// ---- sourcemap 采集（只在 emitModuleWithMap 且 opts.sourcemap 时启用）----
let MAP_ACTIVE = false;
let LINE_MAPPINGS: LineMapping[] = [];
function mark(genLine: number, loc: Loc | undefined): void {
  if (!MAP_ACTIVE || !loc) return;
  LINE_MAPPINGS.push({ genLine, srcLine: loc.line - 1, srcCol: loc.col - 1 });
}

export interface EmitResult {
  code: string;
  map: RawSourceMap | null;
}

function standaloneInlineHeader(body: string): string {
  const indented = body
    .split("\n")
    .map((l) => (l.length ? `  ${l}` : l))
    .join("\n");
  return [
    "const { rt, print, SceneTree } = (() => {",
    "  const module = { exports: {} };",
    "  const exports = module.exports;",
    indented,
    "  return exports;",
    "})();",
  ].join("\n");
}

export function emitModule(m: Module, opts: EmitOptions = {}): string {
  return emitModuleWithMap(m, opts).code;
}

export function emitModuleWithMap(m: Module, opts: EmitOptions = {}): EmitResult {
  MAP_ACTIVE = opts.sourcemap === true;
  LINE_MAPPINGS = [];
  const runtimeImport = opts.runtimeImport ?? DEFAULT_RUNTIME_IMPORT;
  const hostImport = opts.hostImport === undefined ? DEFAULT_HOST_IMPORT : opts.hostImport;
  const autoRun = opts.autoRun ?? true;
  const className = opts.className ?? "Main";
  const classRefs = opts.classRefs ?? [];
  const resPath = opts.resPath;
  const preloads = opts.preloads ?? [];
  const sideEffectImports = opts.sideEffectImports ?? [];
  const baseClass: BaseSpec = opts.baseClass ?? (hostImport ? { kind: "host" } : { kind: "none" });

  MODULE_VARS = new Set([
    ...m.vars.filter((v) => !v.isStatic).map((v) => v.name),
    ...m.signals.map((s) => s.name),
    ...(opts.inheritedMembers ?? []),
  ]);
  MODULE_FUNCS = new Set(m.funcs.map((f) => f.name));
  CURRENT_CLASS = className;
  STATIC_FUNCS = new Set(m.funcs.filter((f) => f.isStatic).map((f) => f.name));
  CLASS_VALUE_OWNERS = new Map(
    m.vars.filter((v) => v.isConst || v.isStatic).map((v) => [v.name, className]),
  );
  CLASS_VALUES = new Map();
  const collectClassValues = (name: string, vars: { name: string; isConst: boolean; isStatic: boolean }[]): void => {
    CLASS_VALUES.set(name, new Set(vars.filter((v) => v.isConst || v.isStatic).map((v) => v.name)));
  };
  collectClassValues(className, m.vars);
  const collectInner = (c: ClassDecl): void => {
    collectClassValues(c.name, c.vars);
    for (const inner of c.innerClasses) collectInner(inner);
  };
  for (const c of m.innerClasses) collectInner(c);
  VAR_TYPES = new Map(m.vars.map((v) => [v.name, v.type]));
  MODULE_CLASSES = new Set([
    ...m.innerClasses.map((c) => c.name),
    ...(m.className ? [m.className] : []),
    ...classRefs.map((r) => r.name),
  ]);
  PRELOADS = new Map(preloads.map((p) => [p.literal, p.name]));
  LOADS = new Map((opts.loadMap ?? []).map((l) => [l.literal, l.resPath]));

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
    out.push(`const { rt, print, SceneTree } = createRequire(import.meta.url)(${JSON.stringify(p)});`);
  } else {
    out.push(`import * as rt from "${runtimeImport}";`);
    if (hostImport) {
      const hostNames = baseClass.kind === "host" ? ["print", "SceneTree"] : ["print"];
      out.push(`import { ${hostNames.join(", ")} } from "${hostImport}";`);
    }
  }
  const imports = new Map<string, string>();
  for (const ref of classRefs) imports.set(ref.name, ref.from);
  for (const p of preloads) imports.set(p.name, p.from);
  for (const [name, from] of imports) out.push(`import { ${name} } from "${from}";`);
  for (const spec of sideEffectImports ?? []) out.push(`import "${spec}";`);
  if (baseClass.kind === "import") out.push(`import { ${baseClass.name} } from "${baseClass.from}";`);
  out.push("");

  ENUM_NAMES = new Set<string>();
  for (const en of m.enums) {
    mark(out.length, en.loc);
    if (en.name) {
      ENUM_NAMES.add(en.name);
      const pairs = en.members.map((mm) => `[rt.V.str(${JSON.stringify(mm.name)}), rt.V.int(${mm.value})]`).join(", ");
      out.push(`const ${en.name} = rt.dictOf([${pairs}]);`);
    } else {
      for (const mm of en.members) out.push(`const ${mm.name} = rt.V.int(${mm.value});`);
    }
  }
  if (m.enums.length > 0) out.push("");

  RAW_ABIS = computeRawAbis(m, {
    hasBase: baseClass.kind === "import",
    inherited: new Set(opts.inheritedMembers ?? []),
    external: new Set(opts.rawAbiExternal ?? []),
  });

  const heritage =
    baseClass.kind === "host" ? " extends SceneTree"
    : baseClass.kind === "import" ? ` extends ${baseClass.name}`
    : "";
  out.push(`export class ${className}${heritage} {`);
  for (const s of m.signals) {
    mark(out.length, s.loc);
    out.push(`  ${s.name} = new rt.Signal(${JSON.stringify(s.name)});`);
  }
  for (const v of m.vars) {
    mark(out.length, v.loc);
    for (const l of emitMemberVar(v)) out.push(l);
  }
  if (m.signals.length > 0 || m.vars.length > 0) out.push("");
  for (const f of m.funcs) {
    const base = out.length;
    const lines = emitFunc(f, base, baseClass.kind !== "none");
    for (const line of lines) out.push(`  ${line}`);
  }
  out.push("}");
  out.push("");

  if (m.className) out.push(`rt.registerClass(${JSON.stringify(m.className)}, ${className});`);
  const moduleFields = fieldTypesLiteral(m.vars.filter((v) => !v.isStatic));
  if (moduleFields !== null) out.push(`rt.registerFieldTypes(${className}, ${moduleFields});`);
  const moduleStaticVars = staticVarTableLiteral(m.vars);
  if (moduleStaticVars !== null) out.push(`rt.registerStaticVars(${className}, ${moduleStaticVars});`);
  const moduleStatics = staticNamesLiteral(m.funcs);
  if (moduleStatics.length > 0) out.push(`rt.registerStaticMethods(${className}, ${JSON.stringify(moduleStatics)});`);
  if (baseClass.kind !== "import") {
    out.push(`rt.registerNativeBase(${className}, ${JSON.stringify(baseClass.kind === "host" ? "SceneTree" : "RefCounted")});`);
  }
  if (resPath) out.push(`rt.registerScript(${JSON.stringify(resPath)}, ${className});`);

  for (const c of m.innerClasses) {
    const base = out.length;
    for (const line of emitClassDecl(c, base)) out.push(line);
  }

  if (autoRun) out.push(`await new ${className}().run();`);

  let code = `${out.join("\n")}\n`;
  let map: RawSourceMap | null = null;
  if (MAP_ACTIVE) {
    const sourceFile = opts.sourceFile ?? `${className}.gd`;
    const jsFile = opts.jsFile ?? `${className}.mjs`;
    map = buildSourceMap({ file: jsFile, source: sourceFile, mappings: LINE_MAPPINGS });
    code += `//# sourceMappingURL=${jsFile}.map\n`;
  }
  MAP_ACTIVE = false;
  RAW_ABIS = new Map();
  RAW_ARRAYS = new Map();
  RAW_DICTS = new Map();
  CURRENT_RET = null;
  VAR_TYPES = new Map();
  LOCAL_TYPES = new Map();
  return { code, map };
}

function fieldTypesLiteral(vars: readonly { name: string; type: TypeRef | null; accessor?: PropAccessor | null }[]): string | null {
  const rows: string[] = [];
  for (const v of vars) {
    const base = v.type !== null && v.type.kind === "named" ? v.type.name.replace(/\[.*\]$/, "") : "";
    if (v.accessor !== null && v.accessor !== undefined) {
      const known = base === "int" || base === "float" || base === "bool" || base === "String" || base === "Vector2";
      rows.push(`${JSON.stringify(v.name)}: ${JSON.stringify(known ? base : "accessor")}`);
      continue;
    }
    if (v.type === null || v.type.kind !== "named") continue;
    if (base === "int" || base === "float" || base === "bool" || base === "String" || base === "Vector2") {
      rows.push(`${JSON.stringify(v.name)}: ${JSON.stringify(base)}`);
    }
  }
  return rows.length === 0 ? null : `{${rows.join(", ")}}`;
}

/**
 * 静态方法名表，发成 `rt.registerStaticMethods(Cls, ["make", "twice"])`。
 * 运行时靠它把 `A.f()`、`p.f()`、`A.f`（取值）三条路落到构造器上 —— 实测三条都成立（S160）。
 * **必须是显式表**：静态方法就是 JS 构造器上的自有属性，用 `constructor[name]` 鸭子类型去认
 * 会把函数自带的 `name` / `length` 两个键当成方法，把不该存在的"方法"召出来。
 */
function staticNamesLiteral(funcs: readonly { name: string; isStatic: boolean }[]): string[] {
  return funcs.filter((f) => f.isStatic).map((f) => f.name);
}

function staticVarTableLiteral(vars: readonly VarDecl[]): string | null {
  const rows: string[] = [];
  for (const v of vars) {
    if (!v.isStatic) continue;
    const base = v.type !== null && v.type.kind === "named" ? v.type.name.replace(/\[.*\]$/, "") : "";
    rows.push(`${JSON.stringify(v.name)}: ${JSON.stringify(base === "int" || base === "float" || base === "bool" || base === "String" || base === "Vector2" ? base : "")}`);
  }
  return rows.length === 0 ? null : `{${rows.join(", ")}}`;
}

function emitMemberVar(v: VarDecl): string[] {
  const a = v.accessor;
  if (a === null || a === undefined) {
    const init = stampDecl(v.type, v.init, emitExpr);
    if (v.isStatic) return [`  static ${v.name} = ${init};`];
    const field = `  ${v.name} = ${init};`;
    if (v.isConst) return [field, `  static ${v.name} = ${init};`];
    return [field];
  }
  const out: string[] = [];
  const lines = (body: Stmt[]): string[] => body.flatMap((s) => emitStmt(s, false)).map((l) => `    ${l}`);
  out.push(`  get ${v.name}() {`);
  if (a.getter.kind === "inline") out.push(...lines(a.getter.body));
  else out.push(`    return this.${a.getter.method}();`);
  out.push("  }");
  const pname = a.setter !== null && a.setter.kind === "inline" ? a.setter.param : "value";
  out.push(`  set ${v.name}(${pname}) {`);
  if (a.setter === null) out.push(`    // 只读属性：Godot 实测写它是静默无操作（S152），不是报错`);
  else if (a.setter.kind === "inline") out.push(...lines(a.setter.body));
  else out.push(`    this.${a.setter.method}(value);`);
  out.push("  }");
  return out;
}

function emitClassDecl(decl: ClassDecl, base = 0): string[] {
  if (decl.extends) {
    throw new UnsupportedError("class-extends", `类 ${decl.name} 的 extends 还没实现`);
  }
  const saved = CURRENT_MEMBERS;
  const savedTypes = VAR_TYPES;
  const savedStatics = STATIC_FUNCS;
  const savedClass = CURRENT_CLASS;
  const savedConsts = CLASS_VALUE_OWNERS;
  CURRENT_MEMBERS = new Set(decl.vars.filter((v) => !v.isStatic).map((v) => v.name));
  VAR_TYPES = new Map(decl.vars.map((v) => [v.name, v.type]));
  CURRENT_CLASS = decl.name;
  STATIC_FUNCS = new Set(decl.funcs.filter((f) => f.isStatic).map((f) => f.name));
  CLASS_VALUE_OWNERS = new Map(savedConsts);
  for (const v of decl.vars) if (v.isConst || v.isStatic) CLASS_VALUE_OWNERS.set(v.name, decl.name);

  const lines = [`class ${decl.name} {`];
  mark(base, decl.loc);
  for (const s of decl.signals) {
    mark(base + lines.length, s.loc);
    lines.push(`  ${s.name} = new rt.Signal(${JSON.stringify(s.name)});`);
  }
  for (const v of decl.vars) {
    mark(base + lines.length, v.loc);
    for (const l of emitMemberVar(v)) lines.push(l);
  }
  if (decl.vars.length > 0 || decl.signals.length > 0) lines.push("");
  for (const f of decl.funcs) {
    const funcBase = base + lines.length;
    for (const line of emitFunc(f, funcBase)) lines.push(`  ${line}`);
  }
  lines.push("}");
  lines.push(`rt.registerClass(${JSON.stringify(decl.name)}, ${decl.name});`);
  const declFields = fieldTypesLiteral(decl.vars.filter((v) => !v.isStatic));
  if (declFields !== null) lines.push(`rt.registerFieldTypes(${decl.name}, ${declFields});`);
  const declStaticVars = staticVarTableLiteral(decl.vars);
  if (declStaticVars !== null) lines.push(`rt.registerStaticVars(${decl.name}, ${declStaticVars});`);
  const declStatics = staticNamesLiteral(decl.funcs);
  if (declStatics.length > 0) lines.push(`rt.registerStaticMethods(${decl.name}, ${JSON.stringify(declStatics)});`);
  lines.push(`rt.registerNativeBase(${decl.name}, "RefCounted");`);
  lines.push("");

  CURRENT_MEMBERS = saved;
  VAR_TYPES = savedTypes;
  STATIC_FUNCS = savedStatics;
  CURRENT_CLASS = savedClass;
  CLASS_VALUE_OWNERS = savedConsts;
  return lines;
}

function collectLocalTypes(body: Stmt[], out: Map<string, TypeRef | null>): Map<string, TypeRef | null> {
  const stmt = (s: Stmt): void => {
    switch (s.kind) {
      case "var":
        if (s.type !== null) out.set(s.name, s.type);
        return;
      case "if":
        for (const br of s.branches) {
          br.cond && exprTypes(br.cond);
          br.body.forEach(stmt);
        }
        return;
      case "for":
        exprTypes(s.iter);
        s.body.forEach(stmt);
        return;
      case "while":
        exprTypes(s.cond);
        s.body.forEach(stmt);
        return;
      case "match":
        exprTypes(s.subject);
        for (const arm of s.arms) {
          arm.guard && exprTypes(arm.guard);
          arm.body.forEach(stmt);
        }
        return;
      case "assign":
        exprTypes(s.target);
        exprTypes(s.value);
        return;
      case "expr":
        exprTypes(s.expr);
        return;
      case "return":
        if (s.value) exprTypes(s.value);
        return;
      default:
        return;
    }
  };
  const exprTypes = (e: Expr): void => {
    switch (e.kind) {
      case "lambda":
        e.body.forEach(stmt);
        return;
      case "call":
        exprTypes(e.callee);
        e.args.forEach(exprTypes);
        return;
      case "binary":
        exprTypes(e.left);
        exprTypes(e.right);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        exprTypes(e.operand);
        return;
      case "attribute":
        exprTypes(e.obj);
        return;
      case "index":
        exprTypes(e.obj);
        exprTypes(e.index);
        return;
      case "array":
        e.items.forEach(exprTypes);
        return;
      case "dict":
        for (const en of e.entries) {
          exprTypes(en.key);
          exprTypes(en.value);
        }
        return;
      default:
        return;
    }
  };
  body.forEach(stmt);
  return out;
}

function emitFunc(f: FuncDecl, base = 0, hasSuper = false): string[] {
  const saved = LOCAL_TYPES;
  LOCAL_TYPES = collectLocalTypes(f.body, new Map(VAR_TYPES));
  try {
    return emitFuncInner(f, base, hasSuper);
  } finally {
    LOCAL_TYPES = saved;
  }
}

function emitFuncInner(f: FuncDecl, base = 0, hasSuper = false): string[] {
  if (f.isStatic && (f.name === "_init" || f.name === "_initialize" || f.name === "_process")) {
    throw new UnsupportedError("static-entry", `静态的 ${f.name}() 还没实测过行为，不猜着发`);
  }
  if (f.name === "_init") return emitConstructor(f, base, hasSuper);

  const isEntry = f.name === "_initialize" || f.name === "_process";
  const abi = RAW_ABIS.get(f.name);
  const async = f.coroutine || isEntry ? "async " : "";
  const params = f.params.map((p) => p.name).join(", ");
  const hasValue = hasValueReturn(f.body);

  let ret: string;
  if (abi) ret = abi.ret === "str" ? "string" : "number";
  else if (f.name === "_initialize") ret = "Promise<void>";
  else if (isEntry || f.coroutine) ret = "Promise<unknown>";
  else ret = hasValue ? "unknown" : "void";

  const lines = [`${f.isStatic ? "static " : ""}${async}${f.name}(${params}): ${ret} {`];
  mark(base, f.loc);
  const savedUnboxed = UNBOXED;
  const savedRet = CURRENT_RET;
  const savedArrays = RAW_ARRAYS;
  const savedDicts = RAW_DICTS;
  CURRENT_RET = abi ? abi.ret : null;
  const layout = analyzeFuncLayout(f);
  UNBOXED = layout.unboxed;
  RAW_ARRAYS = layout.arrays;
  RAW_DICTS = layout.dicts;
  try {
    for (const s of f.body) {
      mark(base + lines.length, s.loc);
      for (const line of emitStmt(s, f.name === "_initialize")) lines.push(`  ${line}`);
    }
  } finally {
    UNBOXED = savedUnboxed;
    CURRENT_RET = savedRet;
    RAW_ARRAYS = savedArrays;
    RAW_DICTS = savedDicts;
  }
  lines.push("}");
  lines.push("");
  return lines;
}

function emitConstructor(f: FuncDecl, base: number, hasSuper: boolean): string[] {
  const params = f.params.map((p) => p.name).join(", ");
  const lines = [`constructor(${params}) {`];
  mark(base, f.loc);

  const first = f.body[0];
  const explicitSuper =
    !!first &&
    first.kind === "expr" &&
    first.expr.kind === "call" &&
    first.expr.callee.kind === "ident" &&
    first.expr.callee.name === "super";
  if (!explicitSuper && hasSuper) lines.push("  super();");

  IN_CONSTRUCTOR = true;
  const savedUnboxed = UNBOXED;
  UNBOXED = computeUnboxed(f);
  try {
    for (const s of f.body) {
      mark(base + lines.length, s.loc);
      for (const line of emitStmt(s, false)) lines.push(`  ${line}`);
    }
  } finally {
    IN_CONSTRUCTOR = false;
    UNBOXED = savedUnboxed;
  }
  lines.push("}");
  lines.push("");
  return lines;
}

function hasValueReturn(stmts: Stmt[]): boolean {
  for (const s of stmts) {
    if (s.kind === "return" && s.value) return true;
    if (s.kind === "if") {
      for (const br of s.branches) if (hasValueReturn(br.body)) return true;
    }
    if (s.kind === "for" || s.kind === "while") {
      if (hasValueReturn(s.body)) return true;
    }
  }
  return false;
}


/** 条件表达式：裸 bool 直接用；裸 int/float 用 `!== 0`，裸 str 用 `!== ""`（S12 空串假值）；否则 rt.ops.truthy。 */
function condExpr(e: Expr): string {
  const r = emitExprR(e);
  if (r.rep === "bool") return r.code;
  if (r.rep === "int" || r.rep === "float") return `${r.code} !== 0`;
  if (r.rep === "str") return `${r.code} !== ""`;
  return `rt.ops.truthy(${r.code})`;
}

function emitStmt(s: Stmt, voidReturn: boolean): string[] {
  switch (s.kind) {
    case "var": {
      const ek = RAW_ARRAYS.get(s.name);
      if (ek && s.init && s.init.kind === "array") {
        if (isGridElem(ek)) {
          const leaf = leafOf(ek);
          const rows = s.init.items.map((row) => {
            if (row.kind !== "array") {
              throw new UnsupportedError("raw-array-init", `内部不变量破坏：裸网格行期望数组字面量，实得 ${row.kind}`);
            }
            const cells = row.items.map((it) => {
              const r = emitExprR(it);
              if (r.rep !== leaf) {
                throw new UnsupportedError("raw-array-init", `内部不变量破坏：裸网格叶子期望 ${leaf}，实得 ${r.rep}`);
              }
              return r.code;
            });
            return `[${cells.join(", ")}]`;
          });
          return [`let ${s.name} = [${rows.join(", ")}];`];
        }
        const parts = s.init.items.map((it) => {
          const r = emitExprR(it);
          if (r.rep !== ek) {
            throw new UnsupportedError("raw-array-init", `内部不变量破坏：裸数组元素期望 ${ek}，实得 ${r.rep}`);
          }
          return r.code;
        });
        return [`let ${s.name} = [${parts.join(", ")}];`];
      }
      const dk = RAW_DICTS.get(s.name);
      if (dk && s.init && s.init.kind === "dict") {
        const pairs = s.init.entries.map((en) => {
          const kr = emitExprR(en.key);
          const vr = emitExprR(en.value);
          if (kr.rep !== "int" && kr.rep !== "str") {
            throw new UnsupportedError("raw-dict-key", `内部不变量破坏：裸字典键期望 int/str，实得 ${kr.rep}`);
          }
          if (vr.rep !== dk) {
            throw new UnsupportedError("raw-dict-init", `内部不变量破坏：裸字典值期望 ${dk}，实得 ${vr.rep}`);
          }
          return `[${kr.code}, ${vr.code}]`;
        });
        return [`let ${s.name} = new Map([${pairs.join(", ")}]);`];
      }
      if (s.init && UNBOXED.has(s.name)) {
        return [`let ${s.name} = ${emitExprR(s.init).code};`];
      }
      const init = stampDecl(s.type, s.init, emitExpr);
      const cast = declaredCast(s.type);
      return [`let ${s.name} = ${cast ? `${cast}(${init})` : init};`];
    }

    case "expr":
      return [`${emitExprR(s.expr).code};`];

    case "assign": {
      const bare = unwrapSelfMember(s.target);
      if (bare) return emitStmt({ ...s, target: bare }, voidReturn);
      if (s.target.kind === "index" && s.target.obj.kind === "ident") {
        const dk = RAW_DICTS.get(s.target.obj.name);
        if (dk) {
          const kr = emitExprR(s.target.index);
          const vr = emitExprR(s.value);
          if (kr.rep !== "int" && kr.rep !== "str") {
            throw new UnsupportedError("raw-dict-key", `内部不变量破坏：裸字典键期望 int/str，实得 ${kr.rep}`);
          }
          if (vr.rep !== dk) {
            throw new UnsupportedError("raw-dict-set", `内部不变量破坏：裸字典值期望 ${dk}，实得 ${vr.rep}`);
          }
          return [`${s.target.obj.name}.set(${kr.code}, ${vr.code});`];
        }
      }
      if (s.target.kind === "ident") {
        const kind = UNBOXED.get(s.target.name);
        if (kind) {
          const vr = emitExprR(s.value);
          const fn = kind === "int" ? "toInt" : kind === "float" ? "toFloat" : "strOf";
          const raw = vr.rep === kind ? vr.code : `rt.${fn}(${boxR(vr)}).v`;
          return [`${s.target.name} = ${raw};`];
        }
      }
      const rawWrite = emitRawIndexWrite(s.target, s.value);
      if (rawWrite) return [rawWrite];
      if (s.target.kind === "attribute" || s.target.kind === "index") {
        const vw = emitValueWrite(s.target, s.value);
        if (vw) return vw;
      }
      return [emitAssign(s.target, emitExpr(s.value))];
    }

    case "return":
      if (!s.value) return ["return;"];
      if (CURRENT_RET) {
        const rr = emitExprR(s.value);
        if (rr.rep !== CURRENT_RET) {
          throw new UnsupportedError(
            "raw-abi-return",
            `内部不变量破坏：裸函数返回期望 ${CURRENT_RET}，实得 ${rr.rep}`,
          );
        }
        return [`return ${rr.code};`];
      }
      return voidReturn ? [`return void (${emitExpr(s.value)});`] : [`return ${emitExpr(s.value)};`];

    case "if": {
      const lines: string[] = [];
      s.branches.forEach((br, i) => {
        const prefix = i === 0 ? "" : "} ";
        const kw = i === 0 ? "if" : br.cond ? "else if" : "else";
        const cond = br.cond ? ` (${condExpr(br.cond)})` : "";
        lines.push(`${prefix}${kw}${cond} {`);
        for (const st of br.body) {
          for (const line of emitStmt(st, voidReturn)) lines.push(`  ${line}`);
        }
      });
      lines.push("}");
      return lines;
    }

    case "for": {
      const body = s.body.flatMap((st) => emitStmt(st, voidReturn).map((l) => `  ${l}`));
      if (isRangeCall(s.iter) && UNBOXED.get(s.var) === "int") {
        return [
          `for (let ${s.var} of rt.rangeSeq(${rangeArgList(s.iter.args.map(emitExpr))})) {`,
          ...body,
          "}",
        ];
      }
      return [`for (let ${s.var} of rt.iter(${emitExpr(s.iter)})) {`, ...body, "}"];
    }

    case "while":
      return [
        `while (${condExpr(s.cond)}) {`,
        ...s.body.flatMap((st) => emitStmt(st, voidReturn).map((l) => `  ${l}`)),
        "}",
      ];

    case "break":
      return ["break;"];
    case "continue":
      return ["continue;"];
    case "pass":
      return ["/* pass */"];

    case "match": {
      const subject = emitExpr(s.subject);
      const lines: string[] = ["do {"];
      s.arms.forEach((arm, i) => {
        const m = `__m${i}`;
        const guard = arm.guard ? ` && rt.ops.truthy(${emitExpr(arm.guard)})` : "";
        lines.push(`  const ${m} = rt.matchPattern(${subject}, ${emitPattern(arm.pattern)});`);
        lines.push(`  if (${m} !== null${guard}) {`);
        patternNames(arm.pattern).forEach((name, idx) => {
          lines.push(`    const ${name} = ${m}[${idx}];`);
        });
        for (const st of arm.body) {
          for (const line of emitStmt(st, voidReturn)) lines.push(`    ${line}`);
        }
        lines.push("    break;");
        lines.push("  }");
      });
      lines.push("} while (false);");
      return lines;
    }
  }
}

/**
 * 裸数组 / 裸网格的下标写（step 15）。verifyArray 已保证写值同型、下标为 int，这里再核一次 rep：
 * 核不上说明「推断为 X ⟺ 发射为 X rep」这条不变式被破坏，宁可编译期响亮报错，也绝不静默发出
 * 一个往 number[] 里塞 Variant 的裸写。返回 null 表示这不是裸容器，交回装箱的 setIndex。
 */
function emitRawIndexWrite(target: Expr, value: Expr): string | null {
  if (target.kind !== "index") return null;
  const raw = (e: Expr, want: Kind): string => {
    const r = emitExprR(e);
    if (r.rep !== want) {
      throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组写入值 rep=${r.rep}，应为 ${want}`);
    }
    return r.code;
  };
  if (target.obj.kind === "ident") {
    const K = RAW_ARRAYS.get(target.obj.name);
    if (!K || isGridElem(K)) return null;
    const i = raw(target.index, "int");
    const v = raw(value, K);
    return `rt.fast.rawArrSet(${target.obj.name}, ${i}, ${v});`;
  }
  if (target.obj.kind === "index" && target.obj.obj.kind === "ident") {
    const K = RAW_ARRAYS.get(target.obj.obj.name);
    if (!K || !isGridElem(K)) return null;
    const i = raw(target.obj.index, "int");
    const j = raw(target.index, "int");
    const v = raw(value, leafOf(K));
    return `rt.fast.rawArrSet2(${target.obj.obj.name}, ${i}, ${j}, ${v});`;
  }
  return null;
}

interface WPath {
  read: string;
  write: (nv: string) => string;
  pre: string[];
}

/**
 * 一次写回：容器是原地改（运行时返回 null，不用再补一笔）；只有值类型（Vector2）才要把新值
 * 放回它来的那个存储位 —— 那个位置是变量还是容器的一格，只有发射器知道。
 */
function writeBack(p: WPath, call: string): string[] {
  const store = p.write("_nv");
  if (store === "") return [call + ";"];
  return ["{", ...p.pre, "  const _nv = " + call + ";", "  if (_nv !== null) " + store, "}"];
}

/**
 * 值类型写：`v.x = 1`、`v[0] = 9`、`a[0].x = 5`、`d["k"].y = 8`、`m.x = 3`（模块字段）—— 全部实测合法。
 *
 * Vector2 是**值类型**，写它必须产出新值再放回它来的那一格：实测 `var w = v; w.x = 100` 不动 `v`、
 * `for x in a: x.x = 100` 一整格都不改，而 `a[0].x = 5` 确实改到数组里那一格、`m.x = 5` 真的改到成员。
 * 所以这里生成一对「读这条路」+「把新值写回这条路」的代码，路径由 {@link writePathFor} 给。
 */
function emitValueWrite(target: Expr, value: Expr): string[] | null {
  const seq = { n: 0 };
  if (target.kind === "attribute") {
    const p = writePathFor(target.obj, seq);
    return writeBack(p, `rt.writeProp(${p.read}, ${JSON.stringify(target.name)}, ${emitExpr(value)})`);
  }
  if (target.kind === "index") {
    const p = writePathFor(target.obj, seq);
    return writeBack(p, `rt.writeIdx(${p.read}, ${emitExpr(target.index)}, ${emitExpr(value)})`);
  }
  return null;
}

/**
 * 一条读写路径。写不回去时只有一种命运（实测过）：根是**临时值**（`f().x = 1`）——
 * Godot 同样只求值、看不见效果、而且不报错，所以只发求值、不写回。
 * 根是变量时一律能落地（ident / index / attribute 三段各自给出 read+write），
 * 穿过字段的值类型写（`p.m.x = 5`）自 step 58b 的属性写落地后已经不是特例。
 */
function writePathFor(t: Expr, seq: { n: number }): WPath {
  const p = lvalueOf(t, seq);
  if (p !== null) return p;
  return { read: emitExpr(t), write: () => "", pre: [] };
}

/**
 * 能读也能写回的存储路径：变量（局部、或发成类字段的模块变量）/ 容器下标。
 * 下标的实参先提到临时变量里 —— 读和写回都要用它，不能求两次值。
 */
function lvalueOf(t: Expr, seq: { n: number }): WPath | null {
  if (t.kind === "ident") {
    const read = emitExpr(t);
    return { read, write: (nv) => `${read} = ${nv};`, pre: [] };
  }
  if (t.kind === "index") {
    const base = lvalueOf(t.obj, seq);
    if (base === null) return null;
    const key = `_w${seq.n++}`;
    return {
      read: `rt.index(${base.read}, ${key})`,
      write: (nv) => `rt.setIndex(${base.read}, ${key}, ${nv});`,
      pre: [...base.pre, `const ${key} = ${emitExpr(t.index)};`],
    };
  }
  if (t.kind === "attribute") {
    const base = lvalueOf(t.obj, seq);
    if (base === null) return null;
    const nm = JSON.stringify(t.name);
    return {
      read: `rt.attribute(${base.read}, ${nm})`,
      write: (nv) => `rt.writeProp(${base.read}, ${nm}, ${nv});`,
      pre: base.pre,
    };
  }
  return null;
}

/**
 * `self.<成员>` → 裸成员 ident（S143：实测 `self.m` 与 `m` 是同一格，写哪边都互相看得见）。
 * 名字不是当前类的成员就返回 null —— 那是 `self.get_script()` 这类 Object 方法，
 * 我们还没有对象模型去接，宁可让它走各自的响亮分支，不能悄悄发成一个不存在的 `this.x`。
 */
function unwrapSelfMember(t: Expr): Expr | null {
  if (t.kind !== "attribute" || t.obj.kind !== "ident" || t.obj.name !== "self") return null;
  if (!CURRENT_MEMBERS.has(t.name) && !MODULE_VARS.has(t.name)) return null;
  return { kind: "ident", name: t.name, loc: t.loc };
}

function emitAssign(target: Expr, value: string): string {
  if (target.kind === "ident") {
    const cast = declaredCast(LOCAL_TYPES.get(target.name) ?? null);
    return `${emitExpr(target)} = ${cast ? `${cast}(${value})` : value};`;
  }
  if (target.kind === "index") {
    if (target.obj.kind === "ident" && RAW_ARRAYS.has(target.obj.name)) {
      throw new UnsupportedError("raw-array", "内部不变量破坏：裸数组不应出现下标赋值");
    }
    return `rt.setIndex(${emitExpr(target.obj)}, ${emitExpr(target.index)}, ${value});`;
  }
  if (target.kind === "attribute") {
    return `rt.writeProp(${emitExpr(target.obj)}, ${JSON.stringify(target.name)}, ${value});`;
  }
  throw new UnsupportedError("emit-assign", `赋值目标 ${target.kind} 还没实现`);
}


type Rep = "var" | "int" | "float" | "str" | "bool";
interface R {
  code: string;
  rep: Rep;
}

/** 当前函数里被解箱成裸 JS 值的局部：int/float → number，str → string。 */
let UNBOXED = new Map<string, "int" | "float" | "str">();

type Kind = "int" | "float" | "str";
interface RawAbi {
  params: Kind[];
  ret: Kind;
}
/** 当前模块内可走裸 ABI 的函数：名字 → 签名。由 computeRawAbis 逐模块算出。 */
let RAW_ABIS = new Map<string, RawAbi>();
/** 当前正在发射的函数若走裸 ABI，其返回裸类型；否则 null（返回值需装箱）。 */
let CURRENT_RET: Kind | null = null;

type ElemKind = "int" | "float" | "str" | "int[]" | "float[]" | "str[]";
const isGridElem = (k: ElemKind): k is "int[]" | "float[]" | "str[]" => k === "int[]" || k === "float[]" || k === "str[]";
/** 网格的叶子标量类型。 */
const leafOf = (k: ElemKind): Kind => (k === "int[]" ? "int" : k === "float[]" ? "float" : k === "str[]" ? "str" : k);
/** 当前函数里被特化成裸 number[] / number[][] 的数组局部：名字 → 元素类型。由 analyzeFuncLayout 逐函数算出。 */
let RAW_ARRAYS = new Map<string, ElemKind>();
/** 当前函数里被特化成裸 Map<primitive,number> 的字典局部：名字 → 值类型（键仅 int/str，值仅标量 int/float）。 */
let RAW_DICTS = new Map<string, "int" | "float">();
const NO_ARRAYS: Map<string, ElemKind> = new Map();
const NO_DICTS: Map<string, "int" | "float"> = new Map();

const CMP_RAW: Record<string, string> = { "<": "<", "<=": "<=", ">": ">", ">=": ">=", "==": "===", "!=": "!==" };
const ARITH_RAW: Record<string, string> = { "+": "iAddC", "-": "iSubC", "*": "iMulC", "/": "iDivC", "%": "iModC" };
// float 无 D1 范围陷阱（溢出→Infinity、除零→Infinity，与装箱 V.float(a op b) 逐位一致），故内联裸运算即可。
const FLOAT_ARITH_RAW: Record<string, string> = { "+": "+", "-": "-", "*": "*", "/": "/" };

/** 把带表示的表达式装箱成 Variant 字符串。 */
function boxR(r: R): string {
  if (r.rep === "int") return `rt.V.int(${r.code})`;
  if (r.rep === "float") return `rt.V.float(${r.code})`;
  if (r.rep === "str") return `rt.V.str(${r.code})`;
  if (r.rep === "bool") return `rt.V.bool(${r.code})`;
  return r.code;
}

function emitExpr(e: Expr): string {
  return boxR(emitExprR(e));
}

function emitExprR(e: Expr): R {
  if (e.kind === "lit" && e.lit === "int" && typeof e.value === "number" && Number.isSafeInteger(e.value)) {
    return { code: String(e.value), rep: "int" };
  }
  if (e.kind === "lit" && e.lit === "float" && typeof e.value === "number") {
    return { code: String(e.value), rep: "float" };
  }
  if (e.kind === "lit" && e.lit === "string") {
    return { code: JSON.stringify(e.value), rep: "str" };
  }
  if (e.kind === "ident") {
    const k = UNBOXED.get(e.name);
    if (k) return { code: e.name, rep: k };
  }
  if (e.kind === "index" && e.obj.kind === "index" && e.obj.obj.kind === "ident") {
    const ek = RAW_ARRAYS.get(e.obj.obj.name);
    if (ek && isGridElem(ek)) {
      const ri = emitExprR(e.obj.index);
      const rj = emitExprR(e.index);
      if (ri.rep !== "int" || rj.rep !== "int") {
        throw new UnsupportedError("raw-array", `内部不变量破坏：裸网格下标期望 int，实得 ${ri.rep}/${rj.rep}`);
      }
      return { code: `rt.fast.rawArrGet2(${e.obj.obj.name}, ${ri.code}, ${rj.code})`, rep: leafOf(ek) };
    }
  }
  if (e.kind === "index" && e.obj.kind === "ident") {
    const ek = RAW_ARRAYS.get(e.obj.name);
    if (ek && !isGridElem(ek)) {
      const ir = emitExprR(e.index);
      if (ir.rep !== "int") throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组下标期望 int，实得 ${ir.rep}`);
      return { code: `rt.fast.rawArrGet(${e.obj.name}, ${ir.code})`, rep: ek };
    }
    const dk = RAW_DICTS.get(e.obj.name);
    if (dk) {
      const kr = emitExprR(e.index);
      if (kr.rep !== "int" && kr.rep !== "str") {
        throw new UnsupportedError("raw-dict-key", `内部不变量破坏：裸字典键期望 int/str，实得 ${kr.rep}`);
      }
      return { code: `rt.fast.rawDictGet(${e.obj.name}, ${kr.code})`, rep: dk };
    }
  }
  if (e.kind === "call" && e.callee.kind === "attribute" && e.callee.obj.kind === "ident") {
    const nm = e.callee.obj.name;
    const ek = RAW_ARRAYS.get(nm);
    const dk = RAW_DICTS.get(nm);
    if ((ek || dk) && (e.callee.name === "size" || e.callee.name === "length") && e.args.length === 0) {
      return { code: `${nm}.${ek ? "length" : "size"}`, rep: "int" };
    }
    if (ek && (e.callee.name === "append" || e.callee.name === "push_back") && e.args.length === 1) {
      const er = emitExprR(e.args[0]!);
      if (er.rep !== ek) throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 ${e.callee.name} 元素期望 ${ek}，实得 ${er.rep}`);
      return { code: `${nm}.push(${er.code})`, rep: "var" };
    }
    if (ek && e.callee.name === "reverse" && e.args.length === 0) {
      return { code: `${nm}.reverse()`, rep: "var" };
    }
    if (ek && e.callee.name === "push_front" && e.args.length === 1) {
      const er = emitExprR(e.args[0]!);
      if (er.rep !== ek) throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 push_front 元素期望 ${ek}，实得 ${er.rep}`);
      return { code: `rt.fast.rawArrPushFront(${nm}, ${er.code})`, rep: "var" };
    }
    if (ek && e.callee.name === "fill" && e.args.length === 1) {
      const er = emitExprR(e.args[0]!);
      if (er.rep !== ek) throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 fill 元素期望 ${ek}，实得 ${er.rep}`);
      return { code: `${nm}.fill(${er.code})`, rep: "var" };
    }
    if (ek && e.callee.name === "insert" && e.args.length === 2) {
      const ir = emitExprR(e.args[0]!);
      const vr = emitExprR(e.args[1]!);
      if (ir.rep !== "int") throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 insert 下标期望 int，实得 ${ir.rep}`);
      if (vr.rep !== ek) throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 insert 元素期望 ${ek}，实得 ${vr.rep}`);
      return { code: `rt.fast.rawArrInsert(${nm}, ${ir.code}, ${vr.code})`, rep: "int" };
    }
    if (ek && e.callee.name === "remove_at" && e.args.length === 1) {
      const ir = emitExprR(e.args[0]!);
      if (ir.rep !== "int") throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 remove_at 下标期望 int，实得 ${ir.rep}`);
      return { code: `rt.fast.rawArrRemoveAt(${nm}, ${ir.code})`, rep: "var" };
    }
    if (ek && e.callee.name === "clear" && e.args.length === 0) {
      return { code: `rt.fast.rawArrClear(${nm})`, rep: "var" };
    }
    if (ek && e.callee.name === "pop_back" && e.args.length === 0) {
      return { code: `${nm}.pop()`, rep: "var" };
    }
    if (ek && e.callee.name === "pop_front" && e.args.length === 0) {
      return { code: `${nm}.shift()`, rep: "var" };
    }
    if (ek && e.callee.name === "pop_at" && e.args.length === 1) {
      const ir = emitExprR(e.args[0]!);
      if (ir.rep !== "int") throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 pop_at 下标期望 int，实得 ${ir.rep}`);
      return { code: `rt.fast.rawArrRemoveAt(${nm}, ${ir.code})`, rep: "var" };
    }
    if (dk && e.callee.name === "get" && e.args.length === 2) {
      const kr = emitExprR(e.args[0]!);
      const dr = emitExprR(e.args[1]!);
      if (kr.rep !== "int" && kr.rep !== "str") {
        throw new UnsupportedError("raw-dict-key", `内部不变量破坏：裸字典 get 键期望 int/str，实得 ${kr.rep}`);
      }
      if (dr.rep !== dk) throw new UnsupportedError("raw-dict-get", `内部不变量破坏：裸字典 get 默认值期望 ${dk}，实得 ${dr.rep}`);
      return { code: `rt.fast.rawDictGetOr(${nm}, ${kr.code}, ${dr.code})`, rep: dk };
    }
  }
  if (e.kind === "call" && e.callee.kind === "ident") {
    const abi = RAW_ABIS.get(e.callee.name);
    if (abi) {
      if (e.args.length !== abi.params.length) {
        throw new UnsupportedError("raw-abi-arity", `内部不变量破坏：${e.callee.name} 期望 ${abi.params.length} 个实参`);
      }
      const raws = e.args.map(emitExprR);
      for (let i = 0; i < raws.length; i++) {
        const want = abi.params[i]!;
        const got = raws[i]!;
        if (got.rep !== want) {
          throw new UnsupportedError(
            "raw-abi-arg",
            `内部不变量破坏：${e.callee.name} 第 ${i + 1} 参数期望 ${want}，实得 ${got.rep}`,
          );
        }
      }
      return { code: `this.${e.callee.name}(${raws.map((r) => r.code).join(", ")})`, rep: abi.ret };
    }
  }
  if (e.kind === "unary" && e.op === "-") {
    const or = emitExprR(e.operand);
    if (or.rep === "int" || or.rep === "float") return { code: `(-${or.code})`, rep: or.rep };
  }
  if (e.kind === "binary") {
    const raw = tryRawBinary(e);
    if (raw) return raw;
  }
  return { code: emitExprVar(e), rep: "var" };
}

function tryRawBinary(e: Extract<Expr, { kind: "binary" }>): R | null {
  const L = emitExprR(e.left);
  const Rr = emitExprR(e.right);
  if (CMP_RAW[e.op] && L.rep === Rr.rep && (L.rep === "int" || L.rep === "float")) {
    return { code: `(${L.code} ${CMP_RAW[e.op]!} ${Rr.code})`, rep: "bool" };
  }
  if (L.rep === "int" && Rr.rep === "int" && ARITH_RAW[e.op]) {
    if (!litBinaryFitsRaw(e)) return null;
    return { code: `rt.fast.${ARITH_RAW[e.op]!}(${L.code}, ${Rr.code})`, rep: "int" };
  }
  if (L.rep === "float" && Rr.rep === "float" && FLOAT_ARITH_RAW[e.op]) {
    return { code: `(${L.code} ${FLOAT_ARITH_RAW[e.op]!} ${Rr.code})`, rep: "float" };
  }
  if (L.rep === "str" && Rr.rep === "str" && e.op === "+") {
    return { code: `(${L.code} + ${Rr.code})`, rep: "str" };
  }
  return null;
}

function computeUnboxed(
  f: FuncDecl,
  arrays: Map<string, ElemKind> = NO_ARRAYS,
  dict: Map<string, "int" | "float"> = NO_DICTS,
): Map<string, "int" | "float" | "str"> {
  const abi = RAW_ABIS.get(f.name);
  const paramKind = new Map<string, Kind>();
  if (abi) f.params.forEach((p, i) => paramKind.set(p.name, abi.params[i]!));
  const excluded = new Set<string>(f.params.map((p) => p.name));
  const decls: Array<{ name: string; init: Expr | null }> = [];
  const assigns: Array<{ name: string; value: Expr }> = [];

  const walkExpr = (e: Expr, inLambda: boolean): void => {
    switch (e.kind) {
      case "lambda":
        e.body.forEach((s) => walkStmt(s, true));
        break;
      case "binary":
        walkExpr(e.left, inLambda);
        walkExpr(e.right, inLambda);
        break;
      case "unary":
      case "await":
        walkExpr(e.operand, inLambda);
        break;
      case "call":
        walkExpr(e.callee, inLambda);
        e.args.forEach((a) => walkExpr(a, inLambda));
        break;
      case "attribute":
        walkExpr(e.obj, inLambda);
        break;
      case "index":
        walkExpr(e.obj, inLambda);
        walkExpr(e.index, inLambda);
        break;
      case "array":
        e.items.forEach((a) => walkExpr(a, inLambda));
        break;
      case "dict":
        e.entries.forEach((en) => {
          walkExpr(en.key, inLambda);
          walkExpr(en.value, inLambda);
        });
        break;
      case "is":
      case "as":
        walkExpr(e.operand, inLambda);
        break;
    }
  };
  const walkStmt = (s: Stmt, inLambda: boolean): void => {
    switch (s.kind) {
      case "var":
        if (inLambda) excluded.add(s.name);
        else if (!s.type) decls.push({ name: s.name, init: s.init });
        else excluded.add(s.name);
        if (s.init) walkExpr(s.init, inLambda);
        break;
      case "assign":
        if (s.target.kind === "ident") {
          if (inLambda) excluded.add(s.target.name);
          else assigns.push({ name: s.target.name, value: s.value });
        }
        walkExpr(s.target, inLambda);
        walkExpr(s.value, inLambda);
        break;
      case "expr":
        walkExpr(s.expr, inLambda);
        break;
      case "return":
        if (s.value) walkExpr(s.value, inLambda);
        break;
      case "if":
        for (const b of s.branches) {
          if (b.cond) walkExpr(b.cond, inLambda);
          b.body.forEach((x) => walkStmt(x, inLambda));
        }
        break;
      case "for":
        if (inLambda || !isRangeCall(s.iter)) excluded.add(s.var);
        else decls.push({ name: s.var, init: { kind: "lit", lit: "int", value: 0, loc: s.iter.loc } });
        walkExpr(s.iter, inLambda);
        s.body.forEach((x) => walkStmt(x, inLambda));
        break;
      case "while":
        walkExpr(s.cond, inLambda);
        s.body.forEach((x) => walkStmt(x, inLambda));
        break;
      case "match":
        walkExpr(s.subject, inLambda);
        for (const a of s.arms) {
          if (a.guard) walkExpr(a.guard, inLambda);
          patternNames(a.pattern).forEach((n) => excluded.add(n));
          a.body.forEach((x) => walkStmt(x, inLambda));
        }
        break;
    }
  };
  f.body.forEach((s) => walkStmt(s, false));

  const result = new Map<string, "int" | "float" | "str">();
  if (abi) f.params.forEach((p, i) => result.set(p.name, abi.params[i]!));
  for (const kind of ["int", "float", "str"] as const) {
    const isLit = (e: Expr): boolean =>
      e.kind === "lit" &&
      (kind === "int"
        ? e.lit === "int" && typeof e.value === "number" && Number.isSafeInteger(e.value)
        : kind === "float"
          ? e.lit === "float"
          : e.lit === "string");
    const U = new Set<string>();
    const identKind = (self: string) => (n: string): Kind | null =>
      paramKind.get(n) ?? result.get(n) ?? (n === self || U.has(n) ? kind : null);
    const isNum = (e: Expr, self: string): boolean => {
      if (e.kind === "call") return kindOfExpr(e, identKind(self), arrays, dict) === kind;
      if (e.kind === "binary") return kindOfExpr(e, identKind(self), arrays, dict) === kind;
      if (e.kind === "index") return kindOfExpr(e, identKind(self), arrays, dict) === kind;
      if (e.kind === "lit") return isLit(e);
      if (e.kind === "ident") return e.name === self || U.has(e.name) || paramKind.get(e.name) === kind;
      return false;
    };
    for (const d of decls) if (!excluded.has(d.name) && !result.has(d.name)) U.add(d.name);
    let pruned = true;
    while (pruned) {
      pruned = false;
      for (const name of [...U]) {
        const okInit = decls.every((d) => d.name !== name || (!!d.init && isNum(d.init, name)));
        if (okInit && assigns.every((a) => a.name !== name || isNum(a.value, name))) continue;
        U.delete(name);
        pruned = true;
      }
    }
    for (const name of U) result.set(name, kind);
  }
  return result;
}


const INT_ARITH = new Set(["+", "-", "*", "/", "%"]);
const FLOAT_ARITH = new Set(["+", "-", "*", "/"]);
const CMP_OPS = new Set(["<", "<=", ">", ">=", "==", "!="]);

const RAW_INT_MIN = BigInt(Number.MIN_SAFE_INTEGER);
const RAW_INT_MAX = BigInt(Number.MAX_SAFE_INTEGER);

/** 只在「本身就是个范围内 int 字面量」时给出其精确值，否则 null（不参与判定）。 */
function rawIntLit(e: Expr): bigint | null {
  if (e.kind !== "lit" || e.lit !== "int") return null;
  return typeof e.value === "number" ? BigInt(e.value) : null;
}

/**
 * 双 int 字面量的裸算术，结果还塞得进 2^53 吗？塞不进就整式退回装箱轨。
 * 裸 number 谈不了 int64：硬发 `iMulC(4000000000, 4000000000)` 只会在运行期抛
 * int64-out-of-range —— 编译期就能算出来的必然崩溃，不该留给运行时。装箱轨那边按
 * Godot 的 int64 回绕，才是这种式子的正确归宿。
 * 只有「操作数皆为字面量」才可静态判定，其余一律维持原有保守行为。
 */
function litBinaryFitsRaw(e: Extract<Expr, { kind: "binary" }>): boolean {
  const a = rawIntLit(e.left);
  const b = rawIntLit(e.right);
  if (a === null || b === null) return true;
  let r: bigint;
  switch (e.op) {
    case "+":
      r = a + b;
      break;
    case "-":
      r = a - b;
      break;
    case "*":
      r = a * b;
      break;
    default:
      return true;
  }
  return r >= RAW_INT_MIN && r <= RAW_INT_MAX;
}

function kindOfExpr(
  e: Expr,
  identKind: (n: string) => Kind | null,
  arrays: Map<string, ElemKind> = NO_ARRAYS,
  dict: Map<string, "int" | "float"> = NO_DICTS,
): Kind | "bool" | null {
  switch (e.kind) {
    case "lit":
      if (e.lit === "int" && typeof e.value === "number" && Number.isSafeInteger(e.value)) return "int";
      if (e.lit === "float" && typeof e.value === "number") return "float";
      if (e.lit === "string") return "str";
      return null;
    case "ident":
      return identKind(e.name);
    case "binary": {
      const lk = kindOfExpr(e.left, identKind, arrays, dict);
      const rk = kindOfExpr(e.right, identKind, arrays, dict);
      if (lk === null || rk === null || lk === "bool" || rk === "bool" || lk !== rk) return null;
      if (lk === "int" && INT_ARITH.has(e.op)) return litBinaryFitsRaw(e) ? "int" : null;
      if (lk === "float" && FLOAT_ARITH.has(e.op)) return "float";
      if (lk === "str" && e.op === "+") return "str";
      if ((lk === "int" || lk === "float") && CMP_OPS.has(e.op)) return "bool";
      return null;
    }
    case "unary": {
      if (e.op !== "-") return null;
      const ok = kindOfExpr(e.operand, identKind, arrays, dict);
      return ok === "int" || ok === "float" ? ok : null;
    }
    case "index": {
      const mid = e.obj;
      if (mid.kind === "index" && mid.obj.kind === "ident") {
        const ek = arrays.get(mid.obj.name);
        if (
          ek &&
          isGridElem(ek) &&
          kindOfExpr(mid.index, identKind, arrays, dict) === "int" &&
          kindOfExpr(e.index, identKind, arrays, dict) === "int"
        )
          return leafOf(ek);
      }
      if (e.obj.kind === "ident") {
        const ek = arrays.get(e.obj.name);
        if (ek && !isGridElem(ek) && kindOfExpr(e.index, identKind, arrays, dict) === "int") return ek;
        const dk = dict.get(e.obj.name);
        if (dk) {
          const kk = kindOfExpr(e.index, identKind, arrays, dict);
          if (kk === "int" || kk === "str") return dk;
        }
      }
      return null;
    }
    case "call": {
      if (e.callee.kind === "attribute" && e.callee.obj.kind === "ident") {
        const recv = e.callee.obj.name;
        if (
          (arrays.has(recv) || dict.has(recv)) &&
          (e.callee.name === "size" || e.callee.name === "length") &&
          e.args.length === 0
        )
          return "int";
        if (arrays.has(recv) && e.callee.name === "insert" && e.args.length === 2) {
          return kindOfExpr(e.args[0]!, identKind, arrays, dict) === "int" ? "int" : null;
        }
        const gk = dict.get(recv);
        if (gk && e.callee.name === "get" && e.args.length === 2) {
          const kk = kindOfExpr(e.args[0]!, identKind, arrays, dict);
          const dk2 = kindOfExpr(e.args[1]!, identKind, arrays, dict);
          if ((kk === "int" || kk === "str") && dk2 === gk) return gk;
        }
        return null;
      }
      if (e.callee.kind !== "ident") return null;
      const abi = RAW_ABIS.get(e.callee.name);
      if (!abi || e.args.length !== abi.params.length) return null;
      for (let i = 0; i < e.args.length; i++) {
        if (kindOfExpr(e.args[i]!, identKind, arrays, dict) !== abi.params[i]!) return null;
      }
      return abi.ret;
    }
    default:
      return null;
  }
}

interface RawSite {
  args: Expr[];
  owner: FuncDecl;
}

/**
 * 裸 ABI 形态判定（D2 第三轨 v2）：无返回类型标注、参数无类型/默认值、非协程/静态/入口，
 * 且函数体是**直线**——每条语句只能是 `var x = …`（无类型标注）、`x = …`（目标是裸 ident）、或 `return <有值>`；
 * 且至少一条带值 return。禁止 if/while/for/match/裸表达式语句/容器字面量等——那些会引入 Variant 落点，
 * 一旦混进裸 ABI 就可能静默算错。真正的同型性判定交给 sigValid 的前向 env 推断。
 */
function abiFormOk(f: FuncDecl): boolean {
  if (f.coroutine || f.isStatic) return false;
  if (f.returnType) return false;
  if (f.body.length === 0) return false;
  for (const p of f.params) if (p.type || p.default) return false;
  let sawReturn = false;
  for (const st of f.body) {
    if (st.kind === "return") {
      if (!st.value) return false;
      sawReturn = true;
    } else if (st.kind === "var") {
      if (st.type) return false;
    } else if (st.kind === "assign") {
      if (st.target.kind !== "ident") return false;
    } else {
      return false;
    }
  }
  return sawReturn;
}

function scanRawUsage(m: Module, candNames: Set<string>): { escapes: Set<string>; sitesByF: Map<string, RawSite[]> } {
  const escapes = new Set<string>();
  const sitesByF = new Map<string, RawSite[]>();
  const escape = (n: string): void => {
    if (n !== "super") escapes.add(n);
  };

  const expr = (e: Expr, owner: FuncDecl | null, allowSite: boolean): void => {
    switch (e.kind) {
      case "lit":
        if (e.lit === "string") escape(String(e.value));
        return;
      case "ident":
        escape(e.name);
        return;
      case "call": {
        if (e.callee.kind === "ident") {
          const nm = e.callee.name;
          if (allowSite && owner && candNames.has(nm)) {
            if (!sitesByF.has(nm)) sitesByF.set(nm, []);
            sitesByF.get(nm)!.push({ args: e.args, owner });
          } else {
            escape(nm);
          }
        } else {
          expr(e.callee, owner, false);
        }
        for (const a of e.args) expr(a, owner, allowSite);
        return;
      }
      case "attribute":
        escape(e.name);
        expr(e.obj, owner, allowSite);
        return;
      case "index":
        expr(e.obj, owner, allowSite);
        expr(e.index, owner, allowSite);
        return;
      case "binary":
        expr(e.left, owner, allowSite);
        expr(e.right, owner, allowSite);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        expr(e.operand, owner, allowSite);
        return;
      case "array":
        for (const it of e.items) expr(it, owner, allowSite);
        return;
      case "dict":
        for (const en of e.entries) {
          expr(en.key, owner, allowSite);
          expr(en.value, owner, allowSite);
        }
        return;
      case "lambda":
        for (const s of e.body) stmt(s, owner, false);
        return;
    }
  };
  const stmt = (s: Stmt, owner: FuncDecl | null, allowSite: boolean): void => {
    switch (s.kind) {
      case "var":
        if (s.init) expr(s.init, owner, allowSite);
        return;
      case "assign":
        expr(s.target, owner, allowSite);
        expr(s.value, owner, allowSite);
        return;
      case "expr":
        expr(s.expr, owner, allowSite);
        return;
      case "return":
        if (s.value) expr(s.value, owner, allowSite);
        return;
      case "if":
        for (const b of s.branches) {
          if (b.cond) expr(b.cond, owner, allowSite);
          for (const x of b.body) stmt(x, owner, allowSite);
        }
        return;
      case "for":
        expr(s.iter, owner, allowSite);
        for (const x of s.body) stmt(x, owner, allowSite);
        return;
      case "while":
        expr(s.cond, owner, allowSite);
        for (const x of s.body) stmt(x, owner, allowSite);
        return;
      case "match":
        expr(s.subject, owner, allowSite);
        for (const a of s.arms) {
          if (a.guard) expr(a.guard, owner, allowSite);
          for (const x of a.body) stmt(x, owner, false);
        }
        return;
      case "break":
      case "continue":
      case "pass":
        return;
    }
  };

  for (const f of m.funcs) {
    for (const p of f.params) if (p.default) expr(p.default, f, false);
    for (const s of f.body) stmt(s, f, true);
  }
  for (const v of m.vars) if (v.init) expr(v.init, null, false);
  const walkClass = (c: ClassDecl): void => {
    for (const v of c.vars) if (v.init) expr(v.init, null, false);
    for (const f of c.funcs) {
      for (const s of f.body) stmt(s, f, false);
    }
    c.innerClasses.forEach(walkClass);
  };
  m.innerClasses.forEach(walkClass);

  return { escapes, sitesByF };
}

function sigValid(
  f: FuncDecl,
  K: Kind,
  sites: RawSite[],
  uOf: (fn: FuncDecl) => Map<string, "int" | "float" | "str">,
): boolean {
  const env = new Map<string, Kind>();
  for (const p of f.params) env.set(p.name, K);
  const ik = (n: string): Kind | null => env.get(n) ?? null;
  let sawReturn = false;
  for (const st of f.body) {
    if (st.kind === "var") {
      if (!st.init || kindOfExpr(st.init, ik) !== K) return false;
      env.set(st.name, K);
    } else if (st.kind === "assign") {
      if (st.target.kind !== "ident" || !env.has(st.target.name)) return false;
      if (kindOfExpr(st.value, ik) !== K) return false;
    } else if (st.kind === "return") {
      if (!st.value || kindOfExpr(st.value, ik) !== K) return false;
      sawReturn = true;
    } else {
      return false;
    }
  }
  if (!sawReturn) return false;
  for (const s of sites) {
    if (s.args.length !== f.params.length) return false;
    const u = uOf(s.owner);
    for (const a of s.args) {
      if (kindOfExpr(a, (n) => u.get(n) ?? null, NO_ARRAYS, NO_DICTS) !== K) return false;
    }
  }
  return true;
}

function sameAbis(a: Map<string, RawAbi>, b: Map<string, RawAbi>): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) {
    const w = b.get(k);
    if (!w || w.ret !== v.ret) return false;
  }
  return true;
}

function computeRawAbis(
  m: Module,
  ctx: { hasBase: boolean; inherited: Set<string>; external: Set<string> },
): Map<string, RawAbi> {
  const empty = new Map<string, RawAbi>();
  if (m.innerClasses.length > 0 || ctx.hasBase) return empty;

  const byName = new Map<string, FuncDecl>();
  for (const f of m.funcs) byName.set(f.name, f);

  const candNames = new Set<string>();
  for (const f of m.funcs) {
    if (!abiFormOk(f)) continue;
    if (f.name.startsWith("_")) continue;
    if (ENUM_NAMES.has(f.name) || MODULE_VARS.has(f.name) || MODULE_CLASSES.has(f.name)) continue;
    if (ctx.inherited.has(f.name) || ctx.external.has(f.name)) continue;
    candNames.add(f.name);
  }
  if (candNames.size === 0) return empty;

  const { escapes, sitesByF } = scanRawUsage(m, candNames);
  for (const n of escapes) candNames.delete(n);

  for (const n of [...candNames]) {
    if ((sitesByF.get(n) ?? []).length === 0) candNames.delete(n);
  }
  if (candNames.size === 0) return empty;

  const saved = RAW_ABIS;
  const dummyU: (fn: FuncDecl) => Map<string, "int" | "float" | "str"> = () => new Map();
  const seed = new Map<string, RawAbi>();
  for (const name of candNames) {
    const f = byName.get(name)!;
    for (const K of ["int", "float", "str"] as const) {
      if (sigValid(f, K, [], dummyU)) {
        seed.set(name, { params: f.params.map(() => K), ret: K });
        break;
      }
    }
  }
  let cur = seed;
  let stable = false;
  const cap = (candNames.size + 2) * 4;
  for (let it = 0; it < cap; it++) {
    RAW_ABIS = cur;
    const uCache = new Map<string, Map<string, "int" | "float" | "str">>();
    const uOf = (fn: FuncDecl): Map<string, "int" | "float" | "str"> => {
      let v = uCache.get(fn.name);
      if (!v) {
        v = computeUnboxed(fn);
        uCache.set(fn.name, v);
      }
      return v;
    };
    const next = new Map<string, RawAbi>();
    for (const name of candNames) {
      const f = byName.get(name)!;
      const sites = sitesByF.get(name) ?? [];
      for (const K of ["int", "float", "str"] as const) {
        if (sigValid(f, K, sites, uOf)) {
          next.set(name, { params: f.params.map(() => K), ret: K });
          break;
        }
      }
    }
    if (sameAbis(cur, next)) {
      cur = next;
      stable = true;
      break;
    }
    cur = next;
  }
  RAW_ABIS = saved;
  return stable ? cur : empty;
}


interface ArrayCand {
  init: Extract<Expr, { kind: "array" }>;
  writeElems: Expr[];
  readIdxs: Expr[];
  writeIdxs: Expr[];
  writeVals: Expr[];
  escaped: boolean;
}

/**
 * 数组候选的元素类型。step 75 起 **空初值不再一律当 int**：这里一律不给类型，改由 `analyzeFuncLayout`
 * 的不动点按「写入证据」定（那里才拿得到 unboxed 表，所以 `s.append("x")`、`a[i] = n` 这类非字面量写入
 * 也能定下来 —— 只看字面量会把 049 那类特化白丢掉）。
 * 只在 candidates 扫完之后调用（isGridCand 那处在扫描中途，仍按初值判，网格必须有字面量行）。
 */
function arrayElemKind(c: ArrayCand): ElemKind | null {
  if (c.init.items.length === 0) return null;
  return elemKindFromInit(c.init, true);
}

function scanArrayCandidates(f: FuncDecl): Map<string, ArrayCand> {
  const cands = new Map<string, ArrayCand>();

  const pre = (s: Stmt): void => {
    if (s.kind === "var") {
      if (!s.type && s.init && s.init.kind === "array") {
        cands.set(s.name, {
          init: s.init,
          writeElems: [],
          readIdxs: [],
          writeIdxs: [],
          writeVals: [],
          escaped: false,
        });
      }
    } else if (s.kind === "if") for (const b of s.branches) b.body.forEach(pre);
    else if (s.kind === "for") {
      s.body.forEach(pre);
    } else if (s.kind === "while") s.body.forEach(pre);
    else if (s.kind === "match") for (const a of s.arms) a.body.forEach(pre);
  };
  f.body.forEach(pre);

  const markEscape = (n: string): void => {
    const c = cands.get(n);
    if (c) c.escaped = true;
  };
  const isCandObj = (e: Expr): string | null => e.kind === "ident" && cands.has(e.name) ? e.name : null;
  const isGridCand = (c: ArrayCand): boolean => {
    const k = elemKindFromInit(c.init, true);
    return !!k && isGridElem(k);
  };
  const matchIndexWrite = (t: Expr): { name: string; idxs: Expr[] } | null => {
    if (t.kind !== "index") return null;
    if (t.obj.kind === "ident") {
      const c = cands.get(t.obj.name);
      return c && !isGridCand(c) ? { name: t.obj.name, idxs: [t.index] } : null;
    }
    if (t.obj.kind === "index" && t.obj.obj.kind === "ident") {
      const c = cands.get(t.obj.obj.name);
      return c && isGridCand(c) ? { name: t.obj.obj.name, idxs: [t.obj.index, t.index] } : null;
    }
    return null;
  };

  const visitExpr = (e: Expr, inL: boolean, discarded = false): void => {
    switch (e.kind) {
      case "ident":
        if (cands.has(e.name)) markEscape(e.name);
        return;
      case "call": {
        if (e.callee.kind === "attribute") {
          const objName = isCandObj(e.callee.obj);
          const N = e.callee.name;
          if (objName) {
            const c = cands.get(objName)!;
            if (inL) {
              c.escaped = true;
            } else if ((N === "append" || N === "push_back") && e.args.length === 1) {
              c.writeElems.push(e.args[0]!);
            } else if ((N === "size" || N === "length") && e.args.length === 0) {
            } else if (N === "insert" && e.args.length === 2) {
              c.writeIdxs.push(e.args[0]!);
              c.writeElems.push(e.args[1]!);
            } else if (N === "remove_at" && e.args.length === 1) {
              c.writeIdxs.push(e.args[0]!);
            } else if (N === "push_front" && e.args.length === 1) {
              c.writeElems.push(e.args[0]!);
            } else if (N === "fill" && e.args.length === 1) {
              c.writeElems.push(e.args[0]!);
            } else if (N === "clear" && e.args.length === 0) {
            } else if (N === "reverse" && e.args.length === 0) {
            } else if (discarded && N === "pop_back" && e.args.length === 0) {
            } else if (discarded && N === "pop_front" && e.args.length === 0) {
            } else if (discarded && N === "pop_at" && e.args.length === 1) {
              c.readIdxs.push(e.args[0]!);
            } else {
              c.escaped = true;
            }
            e.args.forEach((a) => visitExpr(a, inL));
            return;
          }
          visitExpr(e.callee, inL);
          e.args.forEach((a) => visitExpr(a, inL));
          return;
        }
        visitExpr(e.callee, inL);
        e.args.forEach((a) => visitExpr(a, inL));
        return;
      }
      case "index": {
        const mid = e.obj;
        if (mid.kind === "index" && mid.obj.kind === "ident" && cands.has(mid.obj.name)) {
          const c = cands.get(mid.obj.name)!;
          if (inL || !isGridCand(c)) c.escaped = true;
          else {
            c.readIdxs.push(mid.index);
            c.readIdxs.push(e.index);
          }
          visitExpr(mid.index, inL);
          visitExpr(e.index, inL);
          return;
        }
        const objName = isCandObj(e.obj);
        if (objName) {
          const c = cands.get(objName)!;
          if (inL || isGridCand(c)) c.escaped = true;
          else c.readIdxs.push(e.index);
          visitExpr(e.index, inL);
          return;
        }
        visitExpr(e.obj, inL);
        visitExpr(e.index, inL);
        return;
      }
      case "attribute":
        visitExpr(e.obj, inL);
        return;
      case "binary":
        visitExpr(e.left, inL);
        visitExpr(e.right, inL);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        visitExpr(e.operand, inL);
        return;
      case "array":
        e.items.forEach((it) => visitExpr(it, inL));
        return;
      case "dict":
        for (const en of e.entries) {
          visitExpr(en.key, inL);
          visitExpr(en.value, inL);
        }
        return;
      case "lambda":
        e.body.forEach((s) => visitStmt(s, true));
        return;
    }
  };
  const visitStmt = (s: Stmt, inL: boolean): void => {
    switch (s.kind) {
      case "var":
        if (s.init) visitExpr(s.init, inL);
        return;
      case "assign": {
        const w = matchIndexWrite(s.target);
        if (w && !inL) {
          const c = cands.get(w.name)!;
          c.writeIdxs.push(...w.idxs);
          c.writeVals.push(s.value);
          w.idxs.forEach((ix) => visitExpr(ix, inL));
          visitExpr(s.value, inL);
          return;
        }
        const wt =
          s.target.kind === "index"
            ? isCandObj(s.target.obj)
            : s.target.kind === "ident" && cands.has(s.target.name)
              ? s.target.name
              : null;
        if (wt) markEscape(wt);
        if (w) markEscape(w.name);
        visitExpr(s.target, inL);
        visitExpr(s.value, inL);
        return;
      }
      case "expr":
        visitExpr(s.expr, inL, true);
        return;
      case "return":
        if (s.value) visitExpr(s.value, inL);
        return;
      case "if":
        for (const b of s.branches) {
          if (b.cond) visitExpr(b.cond, inL);
          b.body.forEach((x) => visitStmt(x, inL));
        }
        return;
      case "for":
        visitExpr(s.iter, inL);
        s.body.forEach((x) => visitStmt(x, inL));
        return;
      case "while":
        visitExpr(s.cond, inL);
        s.body.forEach((x) => visitStmt(x, inL));
        return;
      case "match":
        visitExpr(s.subject, inL);
        for (const a of s.arms) {
          if (a.guard) visitExpr(a.guard, inL);
          a.body.forEach((x) => visitStmt(x, inL));
        }
        return;
      case "break":
      case "continue":
      case "pass":
        return;
    }
  };
  f.body.forEach((s) => visitStmt(s, false));
  return cands;
}

/** 标量数字字面量的类型；非安全 int / 非数字 → null。 */
function scalarLitKind(e: Expr): Kind | null {
  if (e.kind !== "lit") return null;
  if (e.lit === "float" && typeof e.value === "number") return "float";
  if (e.lit === "int" && typeof e.value === "number" && Number.isSafeInteger(e.value)) return "int";
  // 字符串元素进裸轨：rep 走 step 5 那条 `str`，越界读仍由 arrIdx 响亮抛错
  if (e.lit === "string") return "str";
  return null;
}

/**
 * 数组/字典初值的元素类型。nested=false（字典值）只认标量字面量数组；
 * nested=true（数组）额外认"数组的数组"（叶子同为 int / float / str 字面量、基型统一）
 * → 返回 `"int[]"` / `"float[]"` / `"str[]"`。
 * 空数组这里给 "int"，但**数组候选不看这一格**（step 75 起空初值改由不动点按写入证据定类型）：
 * 留着这个返回值的消费方是字典值那条与扫描中途的 isGridCand，两者都拿不到写入证据。
 */
function elemKindFromInit(init: Extract<Expr, { kind: "array" }>, nested = false): ElemKind | null {
  if (init.items.length === 0) return "int";
  let scalar: Kind | null = null;
  let scalarOk = true;
  for (const it of init.items) {
    const k = scalarLitKind(it);
    if (!k) { scalarOk = false; break; }
    if (scalar && scalar !== k) { scalarOk = false; break; }
    scalar = k;
  }
  if (scalarOk && scalar) return scalar;
  if (nested) {
    let leaf: Kind | null = null;
    for (const row of init.items) {
      if (row.kind !== "array") return null;
      for (const it of row.items) {
        const k = scalarLitKind(it);
        if (!k) return null;
        if (leaf && leaf !== k) return null;
        leaf = k;
      }
    }
    if (leaf) return leaf === "float" ? "float[]" : leaf === "str" ? "str[]" : "int[]";
  }
  return null;
}

function mapsEqual<T>(a: Map<string, T>, b: Map<string, T>): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v) return false;
  return true;
}

/**
 * 联合不动点：数组元素 Kind 与标量解箱彼此依赖（`s += a[j]` 要靠 a 的元素类型才能解箱 s，
 * 而 a 的元素类型又要靠写入实参（可能是别的解箱局部/别的数组读）来定）。单调移除：从乐观种子出发，
 * 逐一剔除「写入/初值/下标与所设 Kind 不符」或「逃逸」的候选，直到数组集与解箱集同时稳定。
 * 最终 arrays 与 unboxed 互为不动点，发射期据此发裸数组并对 rep 断言兜底。
 */
function analyzeFuncLayout(f: FuncDecl): {
  unboxed: Map<string, "int" | "float" | "str">;
  arrays: Map<string, ElemKind>;
  dicts: Map<string, "int" | "float">;
} {
  const aC = scanArrayCandidates(f);
  const dC = scanDictCandidates(f);
  const arrays = new Map<string, ElemKind>();
  for (const [name, c] of aC) {
    if (c.escaped) continue;
    const k = arrayElemKind(c);
    if (k) arrays.set(name, k);
  }
  const dicts = new Map<string, "int" | "float">();
  for (const [name, c] of dC) {
    if (c.escaped) continue;
    const k = elemKindFromInit({ kind: "array", items: c.init.entries.map((en) => en.value), loc: c.init.loc });
    if (k === "int" || k === "float") dicts.set(name, k);
  }
  let unboxed = computeUnboxed(f, arrays, dicts);
  const seeded = new Set<string>();
  // 每轮至少消费掉一次「播种 / 删数组 / 删字典」事件，所以这个上限够用；到上限也只是提前停止特化（保守方向）。
  const cap = aC.size * 2 + dC.size + 8;
  for (let it = 0; it < cap; it++) {
    let changed = false;
    // 空初值的候选在这里定类型（step 75）。为什么放在不动点里：`var a = []` + `a.append(i)` 的 `i`
    // 往往是解箱局部，只看字面量证据会白丢这类特化（049 就掉过）。
    // `seeded` 是单调度所在：每个候选**最多播种一次**，被 verifyArray 删掉之后不再重播（否则
    // 「写入都是 str、下标证不出 int」这类候选会每轮加一次删一次，不动点永远跑到上限才停）。
    for (const [name, c] of aC) {
      if (c.escaped || arrays.has(name) || seeded.has(name) || c.init.items.length !== 0) continue;
      const identKind = (n: string): Kind | null => unboxed.get(n) ?? null;
      const kinds = [...c.writeElems, ...c.writeVals].map((e) => kindOfExpr(e, identKind, arrays, dicts));
      const first = kinds[0];
      if (first === undefined || first === null || first === "bool") continue;
      if (!kinds.every((k) => k === first)) continue;
      arrays.set(name, first);
      seeded.add(name);
      changed = true;
    }
    for (const [name, K] of [...arrays]) {
      const c = aC.get(name);
      if (!c || c.escaped || !verifyArray(c, K, unboxed, arrays, dicts)) {
        arrays.delete(name);
        changed = true;
      }
    }
    for (const [name, K] of [...dicts]) {
      const c = dC.get(name);
      if (!c || c.escaped || !verifyDict(c, K, unboxed, arrays, dicts)) {
        dicts.delete(name);
        changed = true;
      }
    }
    const un2 = computeUnboxed(f, arrays, dicts);
    const unChanged = !mapsEqual(un2, unboxed);
    unboxed = un2;
    if (!changed && !unChanged) break;
  }
  return { unboxed, arrays, dicts };
}

/** 校验候选数组在其所设 Kind 下：初值元素、写入元素皆为该 Kind，读下标皆为 int。 */
function verifyArray(
  c: ArrayCand,
  K: ElemKind,
  unboxed: Map<string, "int" | "float" | "str">,
  arrays: Map<string, ElemKind>,
  dicts: Map<string, "int" | "float">,
): boolean {
  const identKind = (n: string): Kind | null => unboxed.get(n) ?? null;
  // 空初值没有"初值类型"可对：它的 K 是不动点里按写入证据定的，下面 writeElems / writeVals 那两条就是它的校验
  if (c.init.items.length !== 0 && elemKindFromInit(c.init, true) !== K) return false;
  if (!isGridElem(K)) {
    for (const it of c.init.items) {
      if (it.kind === "lit") continue;
      if (kindOfExpr(it, identKind, arrays, dicts) !== K) return false;
    }
  }
  for (const w of c.writeElems) if (kindOfExpr(w, identKind, arrays, dicts) !== K) return false;
  for (const r of c.readIdxs) if (kindOfExpr(r, identKind, arrays, dicts) !== "int") return false;
  const leaf: Kind = isGridElem(K) ? leafOf(K) : K;
  for (const v of c.writeVals) if (kindOfExpr(v, identKind, arrays, dicts) !== leaf) return false;
  for (const ix of c.writeIdxs) if (kindOfExpr(ix, identKind, arrays, dicts) !== "int") return false;
  return true;
}


interface DictCand {
  init: Extract<Expr, { kind: "dict" }>;
  writeKeys: Expr[];
  writeVals: Expr[];
  readKeys: Expr[];
  escaped: boolean;
}

function scanDictCandidates(f: FuncDecl): Map<string, DictCand> {
  const cands = new Map<string, DictCand>();
  const pre = (s: Stmt): void => {
    if (s.kind === "var") {
      if (!s.type && s.init && s.init.kind === "dict") {
        cands.set(s.name, { init: s.init, writeKeys: [], writeVals: [], readKeys: [], escaped: false });
      }
    } else if (s.kind === "if") for (const b of s.branches) b.body.forEach(pre);
    else if (s.kind === "for") s.body.forEach(pre);
    else if (s.kind === "while") s.body.forEach(pre);
    else if (s.kind === "match") for (const a of s.arms) a.body.forEach(pre);
  };
  f.body.forEach(pre);

  const markEscape = (n: string): void => {
    const c = cands.get(n);
    if (c) c.escaped = true;
  };
  const candObj = (e: Expr): string | null => (e.kind === "ident" && cands.has(e.name) ? e.name : null);

  const visitExpr = (e: Expr, inL: boolean): void => {
    switch (e.kind) {
      case "ident":
        if (cands.has(e.name)) markEscape(e.name);
        return;
      case "call": {
        if (e.callee.kind === "attribute") {
          const obj = candObj(e.callee.obj);
          if (obj) {
            const c = cands.get(obj)!;
            const N = e.callee.name;
            if (inL) c.escaped = true;
            else if ((N === "size" || N === "length") && e.args.length === 0) {
            } else if (N === "get" && e.args.length === 2) {
              c.readKeys.push(e.args[0]!);
              c.writeVals.push(e.args[1]!);
            } else c.escaped = true;
            e.args.forEach((a) => visitExpr(a, inL));
            return;
          }
          visitExpr(e.callee, inL);
          e.args.forEach((a) => visitExpr(a, inL));
          return;
        }
        visitExpr(e.callee, inL);
        e.args.forEach((a) => visitExpr(a, inL));
        return;
      }
      case "index": {
        const obj = candObj(e.obj);
        if (obj) {
          const c = cands.get(obj)!;
          if (inL) c.escaped = true;
          else c.readKeys.push(e.index);
          visitExpr(e.index, inL);
          return;
        }
        visitExpr(e.obj, inL);
        visitExpr(e.index, inL);
        return;
      }
      case "attribute":
        visitExpr(e.obj, inL);
        return;
      case "binary":
        visitExpr(e.left, inL);
        visitExpr(e.right, inL);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        visitExpr(e.operand, inL);
        return;
      case "array":
        e.items.forEach((it) => visitExpr(it, inL));
        return;
      case "dict":
        for (const en of e.entries) {
          visitExpr(en.key, inL);
          visitExpr(en.value, inL);
        }
        return;
      case "lambda":
        e.body.forEach((s) => visitStmt(s, true));
        return;
    }
  };
  const visitStmt = (s: Stmt, inL: boolean): void => {
    switch (s.kind) {
      case "var":
        if (s.init) visitExpr(s.init, inL);
        return;
      case "assign": {
        if (s.target.kind === "index") {
          const obj = candObj(s.target.obj);
          if (obj) {
            const c = cands.get(obj)!;
            if (inL) c.escaped = true;
            else {
              c.writeKeys.push(s.target.index);
              c.writeVals.push(s.value);
            }
            visitExpr(s.target, inL);
            visitExpr(s.value, inL);
            return;
          }
        }
        if (s.target.kind === "ident" && cands.has(s.target.name)) markEscape(s.target.name);
        visitExpr(s.target, inL);
        visitExpr(s.value, inL);
        return;
      }
      case "expr":
        visitExpr(s.expr, inL);
        return;
      case "return":
        if (s.value) visitExpr(s.value, inL);
        return;
      case "if":
        for (const b of s.branches) {
          if (b.cond) visitExpr(b.cond, inL);
          b.body.forEach((x) => visitStmt(x, inL));
        }
        return;
      case "for":
        visitExpr(s.iter, inL);
        s.body.forEach((x) => visitStmt(x, inL));
        return;
      case "while":
        visitExpr(s.cond, inL);
        s.body.forEach((x) => visitStmt(x, inL));
        return;
      case "match":
        visitExpr(s.subject, inL);
        for (const a of s.arms) {
          if (a.guard) visitExpr(a.guard, inL);
          a.body.forEach((x) => visitStmt(x, inL));
        }
        return;
      case "break":
      case "continue":
      case "pass":
        return;
    }
  };
  f.body.forEach((s) => visitStmt(s, false));
  return cands;
}

/** 键必须裸化为 int 或 str（float/bool/其它一律拒收，避免 S14 的 1 与 1.0 碰撞）。 */
function keyKindOk(k: Kind | "bool" | null): boolean {
  return k === "int" || k === "str";
}

/** 校验候选字典在所设值 Kind 下：初值/写入值皆为该 Kind，初值/写入/读键皆 int|str。 */
function verifyDict(
  c: DictCand,
  K: ElemKind,
  unboxed: Map<string, "int" | "float" | "str">,
  arrays: Map<string, ElemKind>,
  dicts: Map<string, "int" | "float">,
): boolean {
  const identKind = (n: string): Kind | null => unboxed.get(n) ?? null;
  for (const en of c.init.entries) {
    if (!keyKindOk(kindOfExpr(en.key, identKind, arrays, dicts))) return false;
    if (kindOfExpr(en.value, identKind, arrays, dicts) !== K) return false;
  }
  for (const k of c.writeKeys) if (!keyKindOk(kindOfExpr(k, identKind, arrays, dicts))) return false;
  for (const v of c.writeVals) if (kindOfExpr(v, identKind, arrays, dicts) !== K) return false;
  for (const k of c.readKeys) if (!keyKindOk(kindOfExpr(k, identKind, arrays, dicts))) return false;
  return true;
}

function emitExprVar(e: Expr): string {
  switch (e.kind) {
    case "lit":
      return emitLit(e.lit, e.value);

    case "ident":
      if (e.name === "self") return `rt.V.object(this)`;
      const owner = CLASS_VALUE_OWNERS.get(e.name);
      if (owner !== undefined) return `${owner}.${e.name}`;
      if (STATIC_FUNCS.has(e.name)) return `rt.callableOf(${CURRENT_CLASS}.${e.name}.bind(${CURRENT_CLASS}), ${JSON.stringify(e.name)})`;
      if (MODULE_FUNCS.has(e.name)) return `rt.callableOf(this.${e.name}.bind(this), ${JSON.stringify(e.name)}, rt.V.object(this))`;
      if (CURRENT_MEMBERS.has(e.name)) return `this.${e.name}`;
      if (MODULE_VARS.has(e.name)) return `this.${e.name}`;
      return e.name;

    case "unary":
      if (e.op === "not") return `rt.V.bool(!rt.ops.truthy(${emitExpr(e.operand)}))`;
      if (e.op === "-") return `rt.ops.neg(${emitExpr(e.operand)})`;
      if (e.op === "~") return `rt.ops.bnot(${emitExpr(e.operand)})`;
      throw new UnsupportedError("emit-unary", `一元运算符 ${e.op} 还没实现`);

    case "await":
      return `(await rt.awaitValue(${emitExpr(e.operand)}))`;

    case "binary":
      return emitBinary(e);

    case "array":
      return `rt.V.array(rt.GArray.of([${e.items.map(emitExpr).join(", ")}]))`;

    case "dict": {
      const pairs = e.entries.map((en) => `[${emitExpr(en.key)}, ${emitExpr(en.value)}]`);
      return `rt.dictOf([${pairs.join(", ")}])`;
    }

    case "index":
      return `rt.index(${emitExpr(e.obj)}, ${emitExpr(e.index)})`;

    case "attribute":
      if (e.obj.kind === "ident" && e.obj.name === "super") {
        throw new UnsupportedError("emit-super-prop", "super.属性 访问还没实现（只支持 super.method()）");
      }
      if (e.obj.kind === "ident" && e.obj.name === "self") {
        if (CURRENT_MEMBERS.has(e.name) || MODULE_VARS.has(e.name) || MODULE_FUNCS.has(e.name)) {
          return emitExprVar({ kind: "ident", name: e.name, loc: e.loc });
        }
        return `rt.attribute(rt.V.object(this), ${JSON.stringify(e.name)})`;
      }
      const staticFn = staticMemberFn(e.obj);
      if (staticFn) {
        return `rt.${staticFn}(${JSON.stringify(e.name)})`;
      }
      if (e.obj.kind === "ident" && ENUM_NAMES.has(e.obj.name)) {
        return `rt.index(${e.obj.name}, rt.V.str(${JSON.stringify(e.name)}))`;
      }
      if (e.obj.kind === "ident" && CLASS_VALUES.get(e.obj.name)?.has(e.name) === true) {
        return `${e.obj.name}.${e.name}`;
      }
      return `rt.attribute(${emitExpr(e.obj)}, ${JSON.stringify(e.name)})`;

    case "lambda": {
      const params = e.params.map((p) => p.name).join(", ");
      const body = e.body.flatMap((st) => emitStmt(st, false).map((l) => `      ${l}`));
      return `rt.callable((${params}) => {\n${body.join("\n")}\n    })`;
    }

    case "call":
      return emitCall(e);

    case "is":
      return `rt.isType(${emitExpr(e.operand)}, ${JSON.stringify(typeName(e.type))})`;

    case "as":
      return `rt.asType(${emitExpr(e.operand)}, ${JSON.stringify(typeName(e.type))})`;
  }
}

function emitLit(lit: string, value: string | number | bigint | boolean | null): string {
  if (lit === "int") return `rt.V.int(${typeof value === "bigint" ? `${value.toString()}n` : String(value)})`;
  if (lit === "float") return `rt.V.float(${String(value)})`;
  if (lit === "string") return `rt.V.str(${JSON.stringify(value)})`;
  if (lit === "string_name") return `rt.V.stringName(${JSON.stringify(value)})`;
  if (lit === "bool") return `rt.V.bool(${String(value)})`;
  return "rt.V.nil()";
}

/** 带类型标注的声明需要显式转换（S6：float 赋给 int 向零截断） */
/**
 * 声明类型是定型容器（`Array[int]` / `Dictionary[String, int]`）时在容器**创建处**盖章。
 * Godot 把元素类型记在值上，所以章跟着字面量/默认值一起发出去，之后 `var u = a` 自然共享
 * （实测：别名照样受限、`u[0] = 2.5` 照样截成 2）。没有初值时 Godot 给的也是**定型空容器**
 * （实测 `var a: Array[int]` 之后 append 1.5 → `[1]`），所以 typeDefault 那条也要盖。
 * 元素是引擎类（`Array[Node]`）时不盖章 —— 运行时还没有类层次可校验，宁可不限制也别误拒（见待做）。
 */
function stampDecl(t: TypeRef | null, init: Expr | null | undefined, emit: (e: Expr) => string): string {
  const raw = init ? emit(init) : typeDefault(t);
  if (t === null || t.kind !== "named") return raw;
  const m = /^(Array|Dictionary)\[(.+)\]$/.exec(t.name);
  if (m === null) return raw;
  const inner = m[2] ?? "";
  if (inner.includes("[")) return raw;
  const fromLiteral = init === null || init === undefined || init.kind === "array" || init.kind === "dict";
  if (m[1] === "Array") {
    const kind = inner.trim();
    if (!isElemKind(kind)) return raw;
    return `rt.stampArray(${raw}, ${JSON.stringify(kind)}, ${String(fromLiteral)})`;
  }
  const parts = inner.split(",").map((p) => p.trim());
  const keyKind = parts[0] ?? "";
  const valKind = parts[1] ?? "";
  if (parts.length !== 2 || !isElemKind(keyKind) || !isElemKind(valKind)) return raw;
  return `rt.stampDict(${raw}, ${JSON.stringify(keyKind)}, ${JSON.stringify(valKind)}, ${String(fromLiteral)})`;
}

function declaredCast(t: TypeRef | null): string | null {
  if (t === null || t.kind !== "named") return null;
  const base = t.name.replace(/\[.*\]$/, "");
  if (base === "int") return "rt.toInt";
  if (base === "float") return "rt.toFloat";
  if (base === "bool") return "rt.toBool";
  if (base === "String") return "rt.strOf";
  if (base === "Vector2") return "rt.toVec2";
  return null;
}

/**
 * 没有初值的声明给的是**该类型的默认值**，不是 null。实测（Godot 4.6.3）：
 *   `var i: int` → `0`、`: float` → `0.0`、`: bool` → `false`、`: String` → `""`（len 为 0）、
 *   `var arr: Array` → `[]`（且 `arr == []` 为 true）、`: Dictionary` → `{  }`、`: Vector2` → `(0.0, 0.0)`，
 *   而 `var nod: Node` → `<null>`。
 * 所以只有值类型要特判；类与引擎对象保持 null 本就是对的。
 * Color / Vector3 这些还没实现的内建值类型仍会给 null —— 但它们任何用法本来就先在构造/方法处响亮报缺。
 */
function typeDefault(t: TypeRef | null): string {
  if (t === null) return "rt.V.nil()";
  if (t.kind === "array") return "rt.V.array(rt.GArray.of([]))";
  if (t.kind !== "named") return "rt.V.nil()";
  const base = t.name.replace(/\[.*\]$/, "");
  if (base === "int") return "rt.V.int(0)";
  if (base === "float") return "rt.V.float(0)";
  if (base === "bool") return "rt.V.bool(false)";
  if (base === "String") return `rt.V.str("")`;
  if (base === "Array") return "rt.V.array(rt.GArray.of([]))";
  if (base === "Dictionary") return "rt.dictOf([])";
  if (base === "Vector2") return "rt.vector2(0, 0)";
  if (base === "Vector3") return "rt.vector3(0, 0, 0)";
  if (base === "Vector2i") return "rt.vector2i(0, 0)";
  if (base === "Color") return "rt.color(0, 0, 0, 1)";
  if (base === "PackedByteArray") return "rt.bytesCtor([])";
  if (base === "PackedInt32Array") return 'rt.packCtor("int32", [])';
  if (base === "PackedInt64Array") return 'rt.packCtor("int64", [])';
  if (base === "PackedFloat32Array") return 'rt.packCtor("float32", [])';
  if (base === "PackedFloat64Array") return 'rt.packCtor("float64", [])';
  if (base === "PackedStringArray") return 'rt.packCtor("string", [])';
  if (base === "PackedVector2Array") return 'rt.packCtor("vector2", [])';
  if (base === "PackedVector3Array") return 'rt.packCtor("vector3", [])';
  if (base === "PackedColorArray") return 'rt.packCtor("color", [])';
  return "rt.V.nil()";
}

function typeName(t: TypeRef): string {
  if (t.kind === "named") return t.name;
  if (t.kind === "array") return "Array";
  return "Variant";
}

function emitPattern(p: Pattern): string {
  switch (p.kind) {
    case "wildcard":
      return "rt.patWild()";
    case "bind":
      return "rt.patBind()";
    case "lit":
      return `rt.patLit(${emitLit(p.lit, p.value)})`;
    case "const":
      return `rt.patConst(${emitExpr(p.expr)})`;
    case "array":
      return `rt.patArray([${p.items.map(emitPattern).join(", ")}])`;
    case "dict":
      return `rt.patDict([${p.entries.map((en) => `[${emitExpr(en.key)}, ${emitPattern(en.pattern)}]`).join(", ")}])`;
  }
}

function patternNames(p: Pattern): string[] {
  switch (p.kind) {
    case "bind":
      return [p.name];
    case "array":
      return p.items.flatMap(patternNames);
    case "dict":
      return p.entries.flatMap((en) => patternNames(en.pattern));
    default:
      return [];
  }
}

function emitBinary(e: Extract<Expr, { kind: "binary" }>): string {
  const l = emitExpr(e.left);
  const r = emitExpr(e.right);

  if (e.op === "%" && e.left.kind === "lit" && e.left.lit === "string") {
    return `rt.formatOf(${l}, ${r})`;
  }
  if (e.op === "in") return `rt.ops.inOp(${l}, ${r})`;
  if (e.op === "and") return `rt.and(${l}, () => ${r})`;
  if (e.op === "or") return `rt.or(${l}, () => ${r})`;

  const fn = BINOP[e.op];
  if (!fn) throw new UnsupportedError("emit-binary", `二元运算符 ${e.op} 还没实现`);
  return `rt.ops.${fn}(${l}, ${r})`;
}

function emitCall(e: Extract<Expr, { kind: "call" }>): string {
  const args = e.args.map(emitExpr);

  if (e.callee.kind === "ident") {
    const name = e.callee.name;
    if (name === "print") return `print(rt.showArgs([${args.join(", ")}]))`;

    if (name === "preload") {
      const a = e.args[0];
      const lit = a && a.kind === "lit" && a.lit === "string" ? String(a.value) : null;
      const bound = lit !== null ? PRELOADS.get(lit) : undefined;
      if (bound) return `rt.scriptValue(${bound})`;
      throw new UnsupportedError(
        "emit-preload",
        `preload(${lit ?? "非字面量"}) 未解析到工程内的 .gd（跨文件编译需能定位该脚本）`,
      );
    }
    if (name === "load") {
      const a = e.args[0];
      const lit = a && a.kind === "lit" && a.lit === "string" ? String(a.value) : null;
      const canonical = lit !== null ? LOADS.get(lit) : undefined;
      if (canonical) return `rt.loadScript(${JSON.stringify(canonical)})`;
      return `rt.loadScript(${args[0]})`;
    }

    const builtin = BUILTIN[name];
    if (builtin) return builtin(args);
    if (name === "super") {
      if (IN_CONSTRUCTOR) return `super(${args.join(", ")})`;
      throw new UnsupportedError("emit-super-ctor", "super(...) 只能出现在 _init 里");
    }
    if (BUILTIN_TODO.has(name)) {
      throw new UnsupportedError("emit-builtin", `内置函数 ${name}() 还没实现`);
    }
    if (STATIC_FUNCS.has(name)) return `${CURRENT_CLASS}.${name}(${args.join(", ")})`;
    return `this.${name}(${args.join(", ")})`;
  }

  if (e.callee.kind === "attribute") {
    if (e.callee.obj.kind === "ident" && e.callee.obj.name === "super") {
      return `super.${e.callee.name}(${args.join(", ")})`;
    }
    if (e.callee.kind === "attribute" && e.callee.obj.kind === "ident" && e.callee.obj.name === "self") {
      const own = e.callee.name;
      if (STATIC_FUNCS.has(own)) return `${CURRENT_CLASS}.${own}(${args.join(", ")})`;
      if (MODULE_FUNCS.has(own) || CURRENT_MEMBERS.has(own) || MODULE_VARS.has(own)) {
        return `this.${own}(${args.join(", ")})`;
      }
      return `rt.method(rt.V.object(this), ${JSON.stringify(own)}, [${args.join(", ")}])`;
    }
    if (
      e.callee.name === "new" &&
      e.callee.obj.kind === "ident" &&
      MODULE_CLASSES.has(e.callee.obj.name)
    ) {
      return `rt.V.object(new ${e.callee.obj.name}(${args.join(", ")}))`;
    }
    const staticFn = staticMemberFn(e.callee.obj);
    if (staticFn) {
      return `rt.${staticFn}(${JSON.stringify(e.callee.name)}, [${args.join(", ")}])`;
    }
    const obj = emitExpr(e.callee.obj);
    return `rt.method(${obj}, ${JSON.stringify(e.callee.name)}, [${args.join(", ")}])`;
  }
  throw new UnsupportedError("emit-call", "不支持的调用形式");
}
