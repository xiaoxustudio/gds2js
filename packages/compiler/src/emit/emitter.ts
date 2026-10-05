import { staticMemberFn } from "../lower/ir";
import { GLOBAL_CONSTANTS, GLOBAL_TODO_FUNCTIONS, isGlobalConst } from "../lower/globals";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, PropAccessor, SignalDecl, Stmt, TypeRef, VarDecl } from "../lower/ir";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { isElemKind } from "@gds2js/runtime/runtime/values";
import { isGlobalValueRead, isNativeClassValueRead } from "../lower/analyze";
import { buildSourceMap, type LineMapping, type RawSourceMap } from "./sourcemap";


export type BaseSpec =
  | { kind: "host" }
  | { kind: "none" }
  | { kind: "import"; name: string; from: string };

export interface EmitOptions {
  /** 产物里 runtime 的 import 说明符 —— 由调用方按产物落点算，编译器不带仓库布局知识。 */
  runtimeImport: string;
  /** 产物里宿主的 import 说明符；null = 这个产物不带宿主。 */
  hostImport: string | null;
  autoRun?: boolean;
  className?: string;
  baseClass?: BaseSpec;
  classRefs?: Array<{ name: string; from: string }>;
  resPath?: string;
  preloads?: Array<{ literal: string; name: string; from: string }>;
  loadMap?: Array<{ literal: string; resPath: string }>;
  sideEffectImports?: string[];
  inheritedMembers?: string[];
  /** JS 原型链顶端挂的是宿主 SceneTree（自己 extends 它，或沿脚本继承链走到它）：`quit()` / `create_timer()` 这类宿主方法只在链上有时才认。 */
  hostBaseInChain?: boolean;
  sourcemap?: boolean;
  sourceFile?: string;
  jsFile?: string;
  rawAbiExternal?: string[];
  /** 本模块的类被工程里别的脚本类 extends：构造要走协议形状，由 project.ts 按 extends 边给出。 */
  extendedByScript?: boolean;
  runtimeMode?: "import" | "local" | "single";
  standaloneRequirePath?: string;
  standaloneInline?: string;
}

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

/** 这张表用普通数组而不是 `as const` 元组：静态编译目标没有对元组走 for-of 的 lowering。 */
const ABI_KINDS: Array<"int" | "float" | "str"> = ["int", "float", "str"];

function rangeArgList(a: Array<string | undefined>): string {
  if (a.length > 3) {
    throw new UnsupportedError("range-arity", `range 最多 3 个参数（收到 ${a.length} 个）`);
  }
  const parts: string[] = [];
  for (const x of a) {
    if (x !== undefined) parts.push(x);
  }
  return `[${parts.join(", ")}]`;
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

/** 4.6.3 解析期那两句原文（探头 `tmp/probe-arity/arity.log`，20 支一名两形）：少给报 `at least`、多给报 `at most`。 */
function aritySentence(name: string, min: number, max: number, got: number): string {
  return got < min
    ? `Too few arguments for "${name}()" call. Expected at least ${String(min)} but received ${String(got)}.`
    : `Too many arguments for "${name}()" call. Expected at most ${String(max)} but received ${String(got)}.`;
}

/** 实测过的内置函数实参区间；表外的名字（`print` / `str` / `range` 这些变元与类型构造器）不拦 —— 没量过就不说。 */
const BUILTIN_ARITY: Record<string, [number, number]> = {
  abs: [1, 1],
  angle_difference: [2, 2],
  bezier_derivative: [5, 5],
  bezier_interpolate: [5, 5],
  char: [1, 1],
  clamp: [3, 3],
  clampi: [3, 3],
  cubic_interpolate_in_time: [8, 8],
  is_same: [2, 2],
  lerp: [3, 3],
  max: [2, Number.POSITIVE_INFINITY],
  min: [2, Number.POSITIVE_INFINITY],
  move_toward: [3, 3],
  pingpong: [2, 2],
  posmod: [2, 2],
  remap: [5, 5],
  rotate_toward: [3, 3],
  sign: [1, 1],
  smoothstep: [3, 3],
  snapped: [2, 2],
  step_decimals: [1, 1],
  str_to_var: [1, 1],
  var_to_str: [1, 1],
  wrap: [3, 3],
};

/** 少给 / 多给在引擎是解析期拒；这里同样在发射期拒，措辞照原文，`code` 沿用已出货那三支的。 */
function checkBuiltinArity(name: string, got: number): void {
  const ar = BUILTIN_ARITY[name];
  if (ar === undefined) return;
  if (got >= ar[0] && got <= ar[1]) return;
  const code = name === "char" ? "char-arity" : name === "var_to_str" ? "var-to-str-arity"
    : name === "str_to_var" ? "str-to-var-arity" : "builtin-arity";
  throw new UnsupportedError(code, aritySentence(name, ar[0], ar[1], got));
}

/** 映射到运行时的内置函数 */
const BUILTIN: Record<string, (args: string[]) => string> = {
  range: (a) => `rt.V.array(rt.range(${rangeArgList(a)}))`,
  str: (a) => `rt.strBuiltin([${a.join(", ")}])`,
  float: (a) => `rt.toFloat(${a.join(", ")})`,
  int: (a) => `rt.toInt(${a.join(", ")})`,
  bool: (a) => `rt.toBool(${a.join(", ")})`,
  sqrt: (a) => `rt.sqrt(${a.join(", ")})`,
  hash: (a) => `rt.variantHash([${a.join(", ")}])`,
  var_to_str: (a) => {
    return `rt.V.str(rt.varToStr(${a[0]}))`;
  },
  str_to_var: (a) => {
    return `rt.strToVar(${a[0]})`;
  },
  convert: (a) => {
    if (a.length !== 2) {
      throw new UnsupportedError("convert-arity", `Too few arguments for "convert()" call. Expected 2 but received ${a.length}.`);
    }
    return `rt.variantConvert(${a[0]}, ${a[1]}, true)`;
  },
  type_convert: (a) => {
    if (a.length !== 2) {
      throw new UnsupportedError("convert-arity", `Too few arguments for "type_convert()" call. Expected 2 but received ${a.length}.`);
    }
    return `rt.variantConvert(${a[0]}, ${a[1]}, false)`;
  },
  abs: (a) => `rt.abs(${a.join(", ")})`,
  char: (a) => {
    return `rt.stringChr(${a[0]})`;
  },
  len: (a) => `rt.lengthOf(${a.join(", ")})`,
  typeof: (a) => `rt.typeOf(${a.join(", ")})`,
  Vector2: (a) => `rt.vector2New([${a.join(", ")}])`,
  Vector3: (a) => `rt.vector3New([${a.join(", ")}])`,
  Vector2i: (a) => `rt.vector2iNew([${a.join(", ")}])`,
  Vector3i: (a) => `rt.vector3iNew([${a.join(", ")}])`,
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
  Callable: (a) => `rt.callableCtor([${a.join(", ")}])`,
  sign: (a) => `rt.gSign(${a[0]})`,
  signi: (a) => `rt.gSignI(${a[0]})`,
  signf: (a) => `rt.gSignF(${a[0]})`,
  floor: (a) => `rt.gFloor(${a[0]}, "auto")`,
  floorf: (a) => `rt.gFloor(${a[0]}, "float")`,
  floori: (a) => `rt.gFloor(${a[0]}, "int")`,
  ceil: (a) => `rt.gCeil(${a[0]}, "auto")`,
  ceilf: (a) => `rt.gCeil(${a[0]}, "float")`,
  ceili: (a) => `rt.gCeil(${a[0]}, "int")`,
  round: (a) => `rt.gRound(${a[0]}, "auto")`,
  roundf: (a) => `rt.gRound(${a[0]}, "float")`,
  roundi: (a) => `rt.gRound(${a[0]}, "int")`,
  posmod: (a) => `rt.gPosmod(${a[0]}, ${a[1]})`,
  fposmod: (a) => `rt.gFposmod(${a[0]}, ${a[1]})`,
  fmod: (a) => `rt.gFmod(${a[0]}, ${a[1]})`,
  wrapi: (a) => `rt.gWrap(${a[0]}, ${a[1]}, ${a[2]}, true)`,
  wrap: (a) => `rt.gWrapAny(${a[0]}, ${a[1]}, ${a[2]})`,
  absf: (a) => `rt.gAbsF(${a[0]})`,
  absi: (a) => `rt.gAbsI(${a[0]})`,
  is_same: (a) => `rt.gIsSame(${a[0]}, ${a[1]})`,
  type_string: (a) => `rt.gTypeString(${a[0]})`,
  error_string: (a) => `rt.gErrorString(${a[0]})`,
  type_exists: (a) => `rt.gTypeExists(${a[0]})`,
  sin: (a) => `rt.gSin(${a[0]})`,
  cos: (a) => `rt.gCos(${a[0]})`,
  tan: (a) => `rt.gTan(${a[0]})`,
  asin: (a) => `rt.gAsin(${a[0]})`,
  acos: (a) => `rt.gAcos(${a[0]})`,
  atan: (a) => `rt.gAtan(${a[0]})`,
  atan2: (a) => `rt.gAtan2(${a[0]}, ${a[1]})`,
  sinh: (a) => `rt.gSinh(${a[0]})`,
  cosh: (a) => `rt.gCosh(${a[0]})`,
  tanh: (a) => `rt.gTanh(${a[0]})`,
  asinh: (a) => `rt.gAsinh(${a[0]})`,
  acosh: (a) => `rt.gAcosh(${a[0]})`,
  atanh: (a) => `rt.gAtanh(${a[0]})`,
  db_to_linear: (a) => `rt.gDbToLinear(${a[0]})`,
  linear_to_db: (a) => `rt.gLinearToDb(${a[0]})`,
  pingpong: (a) => `rt.gPingpong(${a[0]}, ${a[1]})`,
  step_decimals: (a) => `rt.gStepDecimals(${a[0]})`,
  nearest_po2: (a) => `rt.gNearestPo2(${a[0]})`,
  rotate_toward: (a) => `rt.gRotateToward(${a[0]}, ${a[1]}, ${a[2]})`,
  lerp_angle: (a) => `rt.gLerpAngle(${a[0]}, ${a[1]}, ${a[2]})`,
  bezier_interpolate: (a) => `rt.gBezierInterpolate(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]})`,
  bezier_derivative: (a) => `rt.gBezierDerivative(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]})`,
  cubic_interpolate_angle: (a) => `rt.gCubicAngle(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]})`,
  cubic_interpolate_in_time: (a) => `rt.gCubicInTime(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]}, ${a[5]}, ${a[6]}, ${a[7]})`,
  cubic_interpolate_angle_in_time: (a) => `rt.gCubicAngleInTime(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]}, ${a[5]}, ${a[6]}, ${a[7]})`,
  wrapf: (a) => `rt.gWrap(${a[0]}, ${a[1]}, ${a[2]}, false)`,
  lerp: (a) => `rt.gLerp(${a[0]}, ${a[1]}, ${a[2]})`,
  lerpf: (a) => `rt.gLerp(${a[0]}, ${a[1]}, ${a[2]})`,
  inverse_lerp: (a) => `rt.gInverseLerp(${a[0]}, ${a[1]}, ${a[2]})`,
  move_toward: (a) => `rt.gMoveToward(${a[0]}, ${a[1]}, ${a[2]})`,
  snapped: (a) => `rt.gSnapped(${a[0]}, ${a[1]})`,
  snappedf: (a) => `rt.gSnappedF(${a[0]}, ${a[1]})`,
  snappedi: (a) => `rt.gSnappedI(${a[0]}, ${a[1]})`,
  deg_to_rad: (a) => `rt.gDegToRad(${a[0]})`,
  rad_to_deg: (a) => `rt.gRadToDeg(${a[0]})`,
  angle_difference: (a) => `rt.gAngleDifference(${a[0]}, ${a[1]})`,
  is_equal_approx: (a) => `rt.gIsEqualApprox(${a[0]}, ${a[1]})`,
  is_zero_approx: (a) => `rt.gIsZeroApprox(${a[0]})`,
  is_nan: (a) => `rt.gIsNan(${a[0]})`,
  is_inf: (a) => `rt.gIsInf(${a[0]})`,
  is_finite: (a) => `rt.gIsFinite(${a[0]})`,
  min: (a) => `rt.gMin(${a[0]}, ${a[1]})`,
  max: (a) => `rt.gMax(${a[0]}, ${a[1]})`,
  mini: (a) => `rt.gMinI(${a[0]}, ${a[1]})`,
  maxi: (a) => `rt.gMaxI(${a[0]}, ${a[1]})`,
  minf: (a) => `rt.gMinF(${a[0]}, ${a[1]})`,
  maxf: (a) => `rt.gMaxF(${a[0]}, ${a[1]})`,
  clamp: (a) => `rt.gClamp(${a[0]}, ${a[1]}, ${a[2]}, "auto")`,
  clampf: (a) => `rt.gClamp(${a[0]}, ${a[1]}, ${a[2]}, "float")`,
  clampi: (a) => `rt.gClamp(${a[0]}, ${a[1]}, ${a[2]}, "int")`,
  smoothstep: (a) => `rt.gSmoothstep(${a[0]}, ${a[1]}, ${a[2]})`,
  ease: (a) => `rt.gEase(${a[0]}, ${a[1]})`,
  cubic_interpolate: (a) => `rt.gCubic(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]})`,
  remap: (a) => `rt.gRemap(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]})`,
  exp: (a) => `rt.gExp(${a[0]})`,
  log: (a) => `rt.gLog(${a[0]})`,
  pow: (a) => `rt.gPow(${a[0]}, ${a[1]})`,
};

/** 认得但还没实现的内置：宁可响，不能悄悄生成错代码 */
const BUILTIN_TODO = GLOBAL_TODO_FUNCTIONS;

/** 实测「Godot 有这个名字、我们这边也发得出」的全局名字：`BUILTIN` 那批加 `print` / `load` / `preload`。
 *  与 `GLOBAL_TODO_FUNCTIONS`（Godot 有、我们拒）相对，两份都是量出来的，摸不得。 */
export const GLOBAL_IMPLEMENTED: Set<string> = new Set([...Object.keys(BUILTIN), "print", "load", "preload"]);

/** 模块级名字：局部变量不在里面，发射成裸标识符；模块级的变量 / 信号 / 函数发成类字段或方法，引用时必须带 `this.`。局部与模块级同名时会被误判成 `this.x`（emitter 没有作用域信息）。 */
let MODULE_VARS = new Set<string>();
let MODULE_SIGNALS = new Set<string>();
let MODULE_FUNCS = new Set<string>();
let MODULE_CLASSES = new Set<string>();
/** 本模块可见的内部类名 → 声明：解析内部类的 `extends` 与排发射顺序都用它。 */
let INNER_CLASSES = new Map<string, ClassDecl>();
/** 被同模块内部类当基类的那些类名：它们的构造要走协议形状。 */
let EXTENDED_INNER = new Set<string>();
/** preload("字面量") → 解析到的类绑定名 */
let PRELOADS = new Map<string, string>();
/** load("字面量") → 规范化 res 路径（脚本注册表的键） */
let LOADS = new Map<string, string>();
/** 正在发射 `_init` 的体 —— 只有这里的 `super(...)` 才发成 `super._init(...)`。 */
let IN_INIT = false;
let INIT_HAS_BASE = false;
let CURRENT_FUNC = "";
/** `_init` 发成协议形状的方法（true）还是 JS constructor（false）：只有链上有脚本继承边的类才需要协议形状。 */
let INIT_AS_METHOD = false;
/** 这个类的 JS 基类上已有的成员名：覆写它们必须加 `override` 修饰符；静态方法不算覆写。 */
let INHERITED_METHODS = new Set<string>();
/** 宿主 SceneTree / GdScriptObject 身上产品脚本可能重名的成员。 */
const HOST_MEMBERS = ["quit", "create_timer", "run", "_initialize", "_process", "__gdDispatch"];
/** 旧形状下 JS 的直接基类是宿主 SceneTree：派生构造器必须自己调 super()，否则运行期当场炸。 */
let NEEDS_HOST_SUPER = false;
/** 正在发射的模块里 named enum 的名字（`Suit.HEARTS` 点访问要特判成 rt.index） */
let ENUM_NAMES = new Set<string>();
/** 当前正在发射的类的成员名（内部类方法里引用 `hp` 要变成 `this.hp`） */
let CURRENT_MEMBERS = new Set<string>();
/** 当前类作用域里的 `static func` 名字（模块类与内部类各一套）：静态方法发在构造器上，实例里的裸调用、静态方法内的裸调用与值位置都要发成 `<类>.f`。 */
let STATIC_FUNCS = new Set<string>();
/** 当前类作用域的 JS 类名：静态调用与静态取值都挂在这个名字上。 */
let CURRENT_CLASS = "";
/** 当前作用域可见的 `const` → 它所属的 JS 类名：常量是类级的，内部类也看得见外层脚本的常量，裸读一律按归属发成 `<类>.NAME`。 */
let CLASS_VALUE_OWNERS = new Map<string, string>();
/** 每个类拥有的类级值（常量 / 静态变量）：认 `Inner.IC`、`A.sv` 这种类名点类级值的写法，须在发射任何函数体之前建好。 */
let CLASS_VALUES = new Map<string, Set<string>>();
/** 当前作用域里声明了类型的名字 → 那个 TypeRef（模块级 + 当前类的成员变量，emitClassDecl 进出时切换）；赋值点要按声明类型转换。 */
let VAR_TYPES = new Map<string, TypeRef | null>();
/** 函数体内 `var x: T` 的声明类型（含嵌套块），emitFunc 每次重建并与 VAR_TYPES 合并。 */
let LOCAL_TYPES = new Map<string, TypeRef | null>();
/** 当前类里能当 callee 使的方法名：自己的 + 沿 `extends` 继承来的。`CURRENT_MEMBERS` 只收字段，内部类里裸调本类方法要靠这张表。 */
let CLASS_FUNCS = new Set<string>();

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

export function emitModule(m: Module, opts: EmitOptions): string {
  return emitModuleWithMap(m, opts).code;
}

export function emitModuleWithMap(m: Module, opts: EmitOptions): EmitResult {
  MAP_ACTIVE = opts.sourcemap === true;
  LINE_MAPPINGS = [];
  const runtimeImport = opts.runtimeImport;
  const hostImport = opts.hostImport;
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
  /** 信号字段落的是裸 `rt.Signal`，当值用（比较、当字典键、进数组、`typeof`）必须先装箱成 Variant —— 直接递出去会在运行期变成没有类型的裸对象。 */
  MODULE_SIGNALS = new Set(m.signals.map((s) => s.name));
  MODULE_FUNCS = new Set(m.funcs.map((f) => f.name));
  // 字段初始化式发在 INHERITED_METHODS 建起来之前，而那里裸调本类方法、继承来的方法与宿主基类的方法都合法，守卫认这张表。
  CLASS_FUNCS = new Set([
    ...m.funcs.map((f) => f.name),
    ...(opts.inheritedMembers ?? []),
    ...(baseClass.kind === "host" || opts.hostBaseInChain === true ? HOST_MEMBERS : []),
  ]);
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
  INNER_CLASSES = new Map();
  const indexInner = (c: ClassDecl): void => {
    INNER_CLASSES.set(c.name, c);
    for (const inner of c.innerClasses) indexInner(inner);
  };
  for (const c of m.innerClasses) indexInner(c);
  // 被同模块别的内部类当基类的，要走协议形状（它的子类字段必须排在它的 `_init` 体之前）。
  EXTENDED_INNER = new Set<string>();
  for (const c of INNER_CLASSES.values()) {
    if (c.extends !== null && INNER_CLASSES.has(c.extends)) EXTENDED_INNER.add(c.extends);
  }
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
  // 旁挂模块一律再发一条裸 import：具名 import 若在产物里没被用到会被打包器整条消掉，裸 import 永不被消；同一条 spec 只发一次。
  const bare = new Set<string>(sideEffectImports ?? []);
  for (const ref of classRefs) bare.add(ref.from);
  for (const p of preloads) bare.add(p.from);
  for (const spec of bare) out.push(`import "${spec}";`);
  if (baseClass.kind === "import") out.push(`import { ${baseClass.name} } from "${baseClass.from}";`);
  out.push("");

  // 全局常量（`PI` / `TAU` / `INF` / `NAN` / `CONNECT_*`）：只在模块真的引用了才发，发成模块顶层的 `const`、引用点保持裸名字。
  const globalConsts = globalConstLines(m, new Set<string>([
    ...m.vars.map((v) => v.name),
    ...classRefs.map((r) => r.name),
    ...preloads.map((p) => p.name),
  ]));
  if (globalConsts.length > 0) {
    out.push(...globalConsts);
    out.push("");
  }

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
    : " extends rt.GdScriptObject";
  // 构造形状由「链上有没有脚本继承边」决定：有边才用协议形状，孤立根类走 JS constructor。
  const proto = baseClass.kind === "import" || opts.extendedByScript === true;
  INIT_HAS_BASE = baseClass.kind === "import";
  INIT_AS_METHOD = proto;
  // 现在每个脚本类都有 JS 基类（宿主 SceneTree 或根 GdScriptObject），显式构造器必须串 super()
  NEEDS_HOST_SUPER = !proto;
  out.push(`export class ${className}${heritage} {`);
  if (proto) {
    if (baseClass.kind !== "import") out.push(...emitRootConstructor(true));
    out.push(...emitFieldDeclarations(m.vars, m.signals));
    out.push(...emitFieldsMethod(m.vars, m.signals, baseClass.kind === "import", out.length));
    out.push(...emitClassLevelVars(m.vars, out.length));
  } else {
    out.push(...emitLegacyMembers(m.vars, m.signals, out.length));
  }
  INHERITED_METHODS = new Set([
    ...(opts.inheritedMembers ?? []),
    ...(baseClass.kind === "host" ? HOST_MEMBERS : []),
  ]);
  for (const f of m.funcs) {
    const base = out.length;
    const lines = emitFunc(f, base);
    for (const line of lines) out.push(`  ${line}`);
  }
  INHERITED_METHODS = new Set();
  out.push(...emitDispatch(m.funcs, proto));
  out.push("}");
  out.push("");

  // 类身份登记：构造器值本身在静态编译目标上不可编，所以发的是「工厂 + 判子」两个闭包，里面全用静态类引用。
  out.push(`const __gd_d_${className} = rt.defineClass(${className}, ${makeClosure(className, m.funcs.find((x) => x.name === "_init" && !x.isStatic), proto)}, (o) => o instanceof ${className});`);
  if (m.className) out.push(`rt.nameClass(__gd_d_${className}, ${JSON.stringify(m.className)});`);
  if (baseClass.kind === "import") {
    out.push(`rt.setClassBase(__gd_d_${className}, rt.lookupClass(${JSON.stringify(baseClass.name)}) ?? null);`);
  }
  const moduleFields = fieldTypesLiteral(m.vars.filter((v) => !v.isStatic));
  if (moduleFields !== null) out.push(`rt.registerFieldTypes(__gd_d_${className}, ${moduleFields});`);
  const moduleProps = scriptPropsLiteral(m.vars.filter((v) => !v.isStatic));
  if (moduleProps !== null) out.push(`rt.registerScriptProps(__gd_d_${className}, ${moduleProps});`);
  const moduleStaticVars = staticVarTableLiteral(m.vars);
  const moduleStaticSlots = staticVarSlotsLiteral(className, m.vars);
  if (moduleStaticVars !== null && moduleStaticSlots !== null) out.push(`rt.registerStaticVars(__gd_d_${className}, ${moduleStaticVars}, ${moduleStaticSlots});`);
  const moduleArities = methodAritiesLiteral(m.funcs);
  if (moduleArities !== null) out.push(`rt.registerMethodArities(__gd_d_${className}, ${moduleArities});`);
  const moduleStatics = staticNamesLiteral(m.funcs);
  if (moduleStatics.length > 0) out.push(`rt.registerStaticMethods(__gd_d_${className}, ${JSON.stringify(moduleStatics)}, ${staticsTableLiteral(className, m.funcs)});`);
  if (baseClass.kind !== "import") {
    out.push(`rt.registerNativeBase(__gd_d_${className}, ${JSON.stringify(baseClass.kind === "host" ? "SceneTree" : "RefCounted")});`);
  }
  // Callable 标签里那截括号实测是 `class_name`，没有就用文件名（`RefCounted(Util)::hi` / `SceneTree(main.gd)::top`）。
  const scriptLabel = m.className ?? (resPath ? resPath.split("/").pop() ?? null : null);
  if (scriptLabel !== null && scriptLabel !== undefined) {
    out.push(`rt.registerScriptLabel(__gd_d_${className}, ${JSON.stringify(scriptLabel)});`);
  }
  if (resPath) out.push(`rt.registerScript(${JSON.stringify(resPath)}, __gd_d_${className});`);

  for (const c of orderInnerClasses(m.innerClasses)) {
    const base = out.length;
    for (const line of emitClassDecl(c, base)) out.push(line);
  }

  // 驱动尾拆成两句：链式的 `new Main().run()` 在静态编译目标上是围栏，落成局部变量再调就是普通虚调用。
  // 外面再包一层兜底：没有 CLI 在场时（直接 node 产物、scriptc 出的 exe）报同一句 `runtime error`，
  // 而不是漏成一条 Uncaught 栈；CLI 在 globalThis 上留了标记，那层照旧自己报。
  if (autoRun) {
    out.push(`const __gd_entry = new ${className}();`);
    out.push(`try {`);
    out.push(`  await __gd_entry.run();`);
    out.push(`} catch (__gd_e) {`);
    out.push(`  rt.reportRunFailure(__gd_e);`);
    out.push(`}`);
  }

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
  CLASS_FUNCS = new Set();
  return { code, map };
}

/** 脚本变量名的声明顺序表：`String.format()` 的实参是脚本实例时按它逐个替换（引擎顺序是自己类在前、基类在后）。 */
function scriptPropsLiteral(vars: readonly { name: string }[]): string | null {
  return vars.length === 0 ? null : JSON.stringify(vars.map((v) => v.name));
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

/** 静态方法名表，连同「名字 → 调用入口」那张闭包表一起发给 `rt.registerStaticMethods`。必须是显式表：鸭子类型去认构造器自有属性会把函数自带的 `name` / `length` 当成方法。 */
function staticNamesLiteral(funcs: readonly { name: string; isStatic: boolean }[]): string[] {
  return funcs.filter((f) => f.isStatic).map((f) => f.name);
}

/** 按位置转发实参（派发表 / 静态方法表 / `_init` 工厂共用）：带默认值的形参在调用方没给那一格时必须是真的 `undefined`。 */
function fwdParams(params: readonly { default: unknown }[], arr: string): string {
  return params
    .map((p, i) =>
      p.default === null || p.default === undefined
        ? `${arr}[${i}] as rt.Variant`
        : `${arr}.length > ${i} ? (${arr}[${i}] as rt.Variant) : undefined`,
    )
    .join(", ");
}

function staticsTableLiteral(className: string, funcs: readonly FuncDecl[]): string {
  const rows = funcs
    .filter((f) => f.isStatic)
    .map((f) => {
      const fwd = fwdParams(f.params, "a");
      return `${JSON.stringify(f.name)}: (a: rt.Variant[]): rt.Variant => rt.wrapValue(${className}.${f.name}(${fwd}))`;
    });
  return `{${rows.join(", ")}}`;
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

/** 静态变量的读写格：一格一对闭包，里面全是指向具体类的静态字段引用（类值上按名字取静态字段不可表示）。 */
function staticVarSlotsLiteral(className: string, vars: readonly VarDecl[]): string | null {
  const rows: string[] = [];
  for (const v of vars) {
    if (!v.isStatic) continue;
    rows.push(
      `${JSON.stringify(v.name)}: { get: (): rt.Variant => ${className}.${v.name}, set: (__v: rt.Variant): void => { ${className}.${v.name} = __v; } }`,
    );
  }
  return rows.length === 0 ? null : `{${rows.join(", ")}}`;
}

/** 带读写器的属性：发成 JS 的 get/set，不发初值。 */
function emitAccessors(v: VarDecl): string[] {
  const a = v.accessor;
  if (a === null || a === undefined) return [];
  const out: string[] = [];
  const lines = (body: Stmt[]): string[] => body.flatMap((s) => emitStmt(s, false)).map((l) => `    ${l}`);
  out.push(`  get ${v.name}() {`);
  if (a.getter.kind === "inline") out.push(...lines(a.getter.body));
  else out.push(`    return this.${a.getter.method}();`);
  out.push("  }");
  const pname = a.setter !== null && a.setter.kind === "inline" ? a.setter.param : "value";
  out.push(`  set ${v.name}(${pname}) {`);
  if (a.setter === null) out.push(`    // 只读属性：Godot 里写它是静默无操作，不是报错`);
  else if (a.setter.kind === "inline") out.push(...lines(a.setter.body));
  else out.push(`    this.${a.setter.method}(value);`);
  out.push("  }");
  return out;
}

/** 内部类 `extends` 的目标怎么发：无脚本构造器的原生基类（`RefCounted` / `Object`）发成不带 heritage 的根类，同模块内部类名发成 `extends 那个绑定`，其余响亮拒。 */
function innerClassBase(text: string): string | null {
  if (text === "RefCounted" || text === "Object") return null;
  if (INNER_CLASSES.has(text)) return text;
  throw new UnsupportedError("class-extends", `内部类 extends ${text} 还没实测过（引擎类型属 Tier 2，跨文件的内部类基类那一格没量）`);
}

/** 内部类沿 `extends` 链拿到的方法名（`override` 修饰符要用）。 */
function innerInheritedMethodNames(decl: ClassDecl): string[] {
  const seen = new Set<string>([decl.name]);
  const out: string[] = [];
  let next: string | null = decl.extends;
  while (next !== null) {
    const parent = INNER_CLASSES.get(next);
    if (!parent || seen.has(parent.name)) break;
    seen.add(parent.name);
    for (const f of parent.funcs) if (!f.isStatic) out.push(f.name);
    next = parent.extends;
  }
  return out;
}

/** 内部类沿 `extends` 链继承来的实例成员名（字段、常量、信号）：裸引在链上任何一层都合法，链要一路走上去。 */
function innerInheritedNames(decl: ClassDecl): string[] {
  const seen = new Set<string>([decl.name]);
  const out: string[] = [];
  let next: string | null = decl.extends;
  while (next !== null) {
    const parent = INNER_CLASSES.get(next);
    if (!parent || seen.has(parent.name)) break;
    seen.add(parent.name);
    out.push(
      ...parent.vars.filter((v) => !v.isStatic).map((v) => v.name),
      ...parent.signals.map((s) => s.name),
    );
    next = parent.extends;
  }
  return out;
}

function orderInnerClasses(classes: ClassDecl[]): ClassDecl[] {
  const out: ClassDecl[] = [];
  const done = new Set<string>();
  const visiting = new Set<string>();
  const put = (c: ClassDecl): void => {
    if (done.has(c.name)) return;
    if (visiting.has(c.name)) throw new UnsupportedError("class-extends", `内部类 ${c.name} 的 extends 成环`);
    visiting.add(c.name);
    const b = c.extends !== null ? INNER_CLASSES.get(c.extends) : undefined;
    if (b) put(b);
    visiting.delete(c.name);
    done.add(c.name);
    out.push(c);
  };
  for (const c of classes) put(c);
  return out;
}

function emitClassDecl(decl: ClassDecl, base = 0): string[] {
  if (decl.innerClasses.length > 0) {
    throw new UnsupportedError("inner-class", `内部类 ${decl.name} 里再套内部类还没实测过，不发`);
  }
  const saved = CURRENT_MEMBERS;
  const savedTypes = VAR_TYPES;
  const savedStatics = STATIC_FUNCS;
  const savedClass = CURRENT_CLASS;
  const savedConsts = CLASS_VALUE_OWNERS;
  const savedHasBase = INIT_HAS_BASE;
  const savedAsMethod = INIT_AS_METHOD;
  const savedHostSuper = NEEDS_HOST_SUPER;
  const savedClassFuncs = CLASS_FUNCS;
  CURRENT_MEMBERS = new Set([
    ...decl.vars.filter((v) => !v.isStatic).map((v) => v.name),
    ...innerInheritedNames(decl),
  ]);
  VAR_TYPES = new Map(decl.vars.map((v) => [v.name, v.type]));
  CURRENT_CLASS = decl.name;
  STATIC_FUNCS = new Set(decl.funcs.filter((f) => f.isStatic).map((f) => f.name));
  CLASS_FUNCS = new Set([...decl.funcs.map((f) => f.name), ...innerInheritedMethodNames(decl)]);
  CLASS_VALUE_OWNERS = new Map(savedConsts);
  for (const v of decl.vars) if (v.isConst || v.isStatic) CLASS_VALUE_OWNERS.set(v.name, decl.name);

  const baseName = decl.extends === null ? null : innerClassBase(decl.extends);
  const proto = baseName !== null || EXTENDED_INNER.has(decl.name);
  INIT_HAS_BASE = baseName !== null;
  INIT_AS_METHOD = proto;
  NEEDS_HOST_SUPER = !proto;
  const lines = [`class ${decl.name}${baseName !== null ? ` extends ${baseName}` : " extends rt.GdScriptObject"} {`];
  mark(base, decl.loc);
  if (proto) {
    if (baseName === null) lines.push(...emitRootConstructor(true));
    lines.push(...emitFieldDeclarations(decl.vars, decl.signals));
    lines.push(...emitFieldsMethod(decl.vars, decl.signals, baseName !== null, base + lines.length));
    lines.push(...emitClassLevelVars(decl.vars, base + lines.length));
  } else {
    lines.push(...emitLegacyMembers(decl.vars, decl.signals, base + lines.length));
  }
  INHERITED_METHODS = new Set(innerInheritedMethodNames(decl));
  for (const f of decl.funcs) {
    const funcBase = base + lines.length;
    for (const line of emitFunc(f, funcBase)) lines.push(`  ${line}`);
  }
  INHERITED_METHODS = new Set();
  lines.push(...emitDispatch(decl.funcs, proto));
  lines.push("}");
  lines.push(`const __gd_d_${decl.name} = rt.defineClass(${decl.name}, ${makeClosure(decl.name, decl.funcs.find((x) => x.name === "_init" && !x.isStatic), proto)}, (o) => o instanceof ${decl.name});`);
  lines.push(`rt.nameClass(__gd_d_${decl.name}, ${JSON.stringify(decl.name)});`);
  if (baseName !== null) {
    lines.push(`rt.setClassBase(__gd_d_${decl.name}, rt.lookupClass(${JSON.stringify(baseName)}) ?? null);`);
  }
  const declFields = fieldTypesLiteral(decl.vars.filter((v) => !v.isStatic));
  if (declFields !== null) lines.push(`rt.registerFieldTypes(__gd_d_${decl.name}, ${declFields});`);
  const declProps = scriptPropsLiteral(decl.vars.filter((v) => !v.isStatic));
  if (declProps !== null) lines.push(`rt.registerScriptProps(__gd_d_${decl.name}, ${declProps});`);
  const declStaticVars = staticVarTableLiteral(decl.vars);
  const declStaticSlots = staticVarSlotsLiteral(decl.name, decl.vars);
  if (declStaticVars !== null && declStaticSlots !== null) lines.push(`rt.registerStaticVars(__gd_d_${decl.name}, ${declStaticVars}, ${declStaticSlots});`);
  const declArities = methodAritiesLiteral(decl.funcs);
  if (declArities !== null) lines.push(`rt.registerMethodArities(__gd_d_${decl.name}, ${declArities});`);
  const declStatics = staticNamesLiteral(decl.funcs);
  if (declStatics.length > 0) lines.push(`rt.registerStaticMethods(__gd_d_${decl.name}, ${JSON.stringify(declStatics)}, ${staticsTableLiteral(decl.name, decl.funcs)});`);
  // 原生基类只在没有脚本基类时登记，有的话运行时沿 `base` 链往上找。
  if (baseName === null) lines.push(`rt.registerNativeBase(__gd_d_${decl.name}, "RefCounted");`);
  lines.push("");

  CURRENT_MEMBERS = saved;
  VAR_TYPES = savedTypes;
  STATIC_FUNCS = savedStatics;
  CURRENT_CLASS = savedClass;
  CLASS_VALUE_OWNERS = savedConsts;
  INIT_HAS_BASE = savedHasBase;
  INIT_AS_METHOD = savedAsMethod;
  NEEDS_HOST_SUPER = savedHostSuper;
  CLASS_FUNCS = savedClassFuncs;
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

function emitFunc(f: FuncDecl, base = 0): string[] {
  const saved = LOCAL_TYPES;
  LOCAL_TYPES = collectLocalTypes(f.body, new Map(VAR_TYPES));
  try {
    return emitFuncInner(f, base);
  } finally {
    LOCAL_TYPES = saved;
  }
}

/** 与 declaredCast 同一批类型，这里要的是槽位类型名（运行时报错文本里要用它）。 */
const MEASURED_SLOTS = new Set([
  "int",
  "float",
  "bool",
  "String",
  "StringName",
  "Vector2",
  "Vector2i",
  "Vector3",
  "Vector3i",
  "Color",
]);
function slotTypeName(t: TypeRef | null): string | null {
  if (t === null || t.kind !== "named") return null;
  const base = t.name.replace(/\[.*\]$/, "");
  return MEASURED_SLOTS.has(base) ? base : null;
}

/** 形参的入口槽位：Godot 在函数入口把实参塞进定型标量的槽，塞不进去是抛错而不是转换；只对实例方法发。 */
function emitParamSlots(f: FuncDecl): string[] {
  const out: string[] = [];
  let n = 0;
  for (const p of f.params) {
    n++;
    const slot = slotTypeName(p.type);
    if (slot === null) continue;
    out.push(`${p.name} = rt.paramSlot(${p.name}, ${JSON.stringify(slot)}, ${n}, ${JSON.stringify(f.name)}, this);`);
  }
  return out;
}

/** 形参表：带默认值的发成 JS 的默认参数（每次调用重新求值，可引用前面的形参），每个形参都标 `rt.Variant`。 */
function emitParamList(params: Param[], abiParams?: Kind[]): string {
  return params
    .map((p) => {
      // 裸 ABI 的形参存的就是裸 JS 值，这里按元素种类标 number / string，不能沿用 rt.Variant。
      if (p.default === null && abiParams !== undefined) {
        const k = abiParams[params.indexOf(p)];
        if (k !== undefined) return `${p.name}: ${k === "str" ? "string" : "number"}`;
      }
      if (p.default === null) return `${p.name}: rt.Variant`;
      const raw = stampDecl(p.type, p.default, emitExpr);
      const cast = declaredCast(p.type);
      return `${p.name}: rt.Variant = ${cast === null ? raw : `${cast}(${raw})`}`;
    })
    .join(", ");
}

/** `make` 闭包：把「脚本值.new(实参)」转成一次真正的构造，转发形状跟着这个类自己的构造器走。 */
function makeClosure(className: string, init: FuncDecl | undefined, protoShape: boolean): string {
  if (protoShape) return `(a) => new ${className}(...a)`;
  if (init === undefined || init.params.length === 0) return `() => new ${className}()`;
  const fwd = fwdParams(init.params, "a");
  return `(a) => new ${className}(${fwd})`;
}

function emitFuncInner(f: FuncDecl, base = 0): string[] {
  if (f.isStatic && (f.name === "_init" || f.name === "_initialize" || f.name === "_process")) {
    throw new UnsupportedError("static-entry", `静态的 ${f.name}() 还没实测过行为，不猜着发`);
  }
  if (f.name === "_init") return INIT_AS_METHOD ? emitInitMethod(f, base) : emitInitAsConstructor(f, base, NEEDS_HOST_SUPER);

  const isEntry = f.name === "_initialize" || f.name === "_process";
  const abi = RAW_ABIS.get(f.name);
  // 入口 virtual 发成两件套：非 async 的薄壳（签名与宿主的 virtual 一致）+ 别名的 async 实体。
  const wrap = isEntry && abi === undefined;
  const bodyName = wrap ? `__gd_${f.name}` : f.name;
  const async = f.coroutine || isEntry ? "async " : "";
  const params = emitParamList(f.params, abi?.params);
  const hasValue = hasValueReturn(f.body);

  let ret: string;
  if (abi) ret = abi.ret === "str" ? "string" : "number";
  else if (f.name === "_initialize") ret = "Promise<void>";
  else if (isEntry || f.coroutine) ret = "Promise<unknown>";
  // 有返回值就是装箱值，返回类型发成 rt.Variant。
  else ret = hasValue ? "rt.Variant" : "void";

  const lines: string[] = [];
  if (wrap) {
    const fwd = f.params.map((p) => p.name).join(", ");
    // 覆写的签名要与宿主那两条 virtual 逐字一致（`_process(delta: number)`），装箱在转发这一笔里做。
    const dname = f.params[0]?.name ?? "delta";
    const wrapParams = f.name === "_process" ? `${dname}: number` : params;
    const wrapFwd = f.name === "_process" ? `rt.V.float(${dname})` : fwd;
    // 宿主的两条 virtual 一定是覆写，`override` 修饰符不能省。
    lines.push(`  override ${f.name}(${wrapParams}): ${ret} { return this.${bodyName}(${wrapFwd}); }`);
  }
  const overriding = !f.isStatic && !wrap && INHERITED_METHODS.has(f.name);
  lines.push(`${f.isStatic ? "static " : ""}${overriding ? "override " : ""}${async}${bodyName}(${params}): ${ret} {`);
  mark(base, f.loc);
  const savedUnboxed = UNBOXED;
  const savedRet = CURRENT_RET;
  const savedArrays = RAW_ARRAYS;
  const savedDicts = RAW_DICTS;
  const savedFunc = CURRENT_FUNC;
  CURRENT_FUNC = f.name;
  CURRENT_RET = abi ? abi.ret : null;
  const layout = analyzeFuncLayout(f);
  UNBOXED = layout.unboxed;
  RAW_ARRAYS = layout.arrays;
  RAW_DICTS = layout.dicts;
  try {
    // 实例方法才发入口槽位（静态方法的 base 标签未定；裸 ABI 不收带类型的函数）。
    if (!f.isStatic) for (const line of emitParamSlots(f)) lines.push(`  ${line}`);
    for (const s of f.body) {
      mark(base + lines.length, s.loc);
      for (const line of emitStmt(s, f.name === "_initialize")) lines.push(`  ${line}`);
    }
  } finally {
    UNBOXED = savedUnboxed;
    CURRENT_RET = savedRet;
    RAW_ARRAYS = savedArrays;
    RAW_DICTS = savedDicts;
    CURRENT_FUNC = savedFunc;
  }
  lines.push("}");
  lines.push("");
  return lines;
}

/** `_init` 发成普通方法（协议形状）：继承链上有脚本边时用，字段初始化子全部跑完才轮到 `_init` 的体。 */
function emitInitMethod(f: FuncDecl, base: number): string[] {
  // 协议形状下所有 `_init` 都发同一个 rest 签名（静态编译目标拒换签名的覆写）；形参名与默认值在体首的绑定里还原。
  const lines = [`${INHERITED_METHODS.has("_init") ? "override " : ""}_init(...__gd_init_args: rt.Variant[]): void {`];
  f.params.forEach((p, i) => {
    const got = `__gd_init_args[${i}] as rt.Variant`;
    let value = got;
    if (p.default !== null) {
      const raw = stampDecl(p.type, p.default, emitExpr);
      const cast = declaredCast(p.type);
      const dflt = cast === null ? raw : `${cast}(${raw})`;
      value = `__gd_init_args.length > ${i} ? (${got}) : (${dflt})`;
    }
    const slot = slotTypeName(p.type);
    if (slot !== null) value = `rt.paramSlot(${value}, ${JSON.stringify(slot)}, ${i + 1}, ${JSON.stringify(f.name)}, this)`;
    lines.push(`  const ${p.name} = ${value};`);
  });
  mark(base, f.loc);
  const savedIn = IN_INIT;
  const savedUnboxed = UNBOXED;
  const savedFunc = CURRENT_FUNC;
  IN_INIT = true;
  CURRENT_FUNC = "_init";
  UNBOXED = computeUnboxed(f);
  try {
    for (const s of f.body) {
      mark(base + lines.length, s.loc);
      for (const line of emitStmt(s, false)) lines.push(`  ${line}`);
    }
  } finally {
    IN_INIT = savedIn;
    UNBOXED = savedUnboxed;
    CURRENT_FUNC = savedFunc;
  }
  lines.push("}");
  lines.push("");
  return lines;
}

/** 旧形状：`_init` 就是 JS constructor，只在链上没有脚本继承边时用；`hostSuper` 表示直接基类是宿主的 SceneTree，那种构造器必须自己调 `super()`。 */
function emitInitAsConstructor(f: FuncDecl, base: number, hostSuper: boolean): string[] {
  const params = emitParamList(f.params);
  const lines = [`constructor(${params}) {`];
  mark(base, f.loc);
  const first = f.body[0];
  const explicitSuper =
    !!first &&
    first.kind === "expr" &&
    first.expr.kind === "call" &&
    first.expr.callee.kind === "ident" &&
    first.expr.callee.name === "super";
  if (!explicitSuper && hostSuper) lines.push("  super();");
  const savedUnboxed = UNBOXED;
  const savedFunc = CURRENT_FUNC;
  UNBOXED = computeUnboxed(f);
  CURRENT_FUNC = "_init";
  try {
    for (const line of emitParamSlots(f)) lines.push(`  ${line}`);
    for (const s of f.body) {
      mark(base + lines.length, s.loc);
      for (const line of emitStmt(s, false)) lines.push(`  ${line}`);
    }
  } finally {
    UNBOXED = savedUnboxed;
    CURRENT_FUNC = savedFunc;
  }
  lines.push("}");
  lines.push("");
  return lines;
}

/** 收集模块里裸引用到的全局常量，生成模块顶层的声明行；撞名时以用户自己的声明为准，所以保留名不声明。 */
function globalConstLines(m: Module, reservedExtra: Set<string>): string[] {
  const reserved = new Set<string>(reservedExtra);
  const addEnum = (en: Module["enums"][number]): void => {
    if (en.name !== null && en.name !== undefined) reserved.add(en.name);
    for (const mm of en.members) reserved.add(mm.name);
  };
  for (const en of m.enums) addEnum(en);
  if (m.className !== undefined && m.className !== null) reserved.add(m.className);
  const addClass = (c: ClassDecl): void => {
    reserved.add(c.name);
    for (const v of c.vars) reserved.add(v.name);
    for (const inner of c.innerClasses) addClass(inner);
  };
  for (const c of m.innerClasses) addClass(c);

  const used = new Set<string>();
  const expr = (e: Expr | null): void => {
    if (e === null || e === undefined) return;
    switch (e.kind) {
      case "ident":
        if (isGlobalConst(e.name)) used.add(e.name);
        return;
      case "binary":
        expr(e.left);
        expr(e.right);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        expr(e.operand);
        return;
      case "index":
        expr(e.obj);
        expr(e.index);
        return;
      case "attribute":
        expr(e.obj);
        return;
      case "call":
        expr(e.callee);
        for (const a of e.args) expr(a);
        return;
      case "lambda":
        for (const s of e.body) stmt(s);
        return;
      case "array":
        for (const it of e.items) expr(it);
        return;
      case "dict":
        for (const en of e.entries) {
          expr(en.key);
          expr(en.value);
        }
        return;
      default:
        return;
    }
  };
  const stmt = (s: Stmt): void => {
    switch (s.kind) {
      case "expr":
        expr(s.expr);
        return;
      case "var":
        expr(s.init);
        return;
      case "assign":
        expr(s.target);
        expr(s.value);
        return;
      case "if":
        for (const b of s.branches) {
          if (b.cond !== null) expr(b.cond);
          for (const x of b.body) stmt(x);
        }
        return;
      case "for":
        expr(s.iter);
        for (const x of s.body) stmt(x);
        return;
      case "while":
        expr(s.cond);
        for (const x of s.body) stmt(x);
        return;
      case "match":
        expr(s.subject);
        for (const arm of s.arms) {
          if (arm.guard !== null) expr(arm.guard);
          for (const x of arm.body) stmt(x);
        }
        return;
      case "return":
        if (s.value !== null) expr(s.value);
        return;
      default:
        return;
    }
  };
  const func = (f: FuncDecl): void => {
    for (const p of f.params) expr(p.default ?? null);
    for (const s of f.body) stmt(s);
  };
  for (const f of m.funcs) func(f);
  for (const v of m.vars) expr(v.init);
  const walkClass = (c: ClassDecl): void => {
    for (const f of c.funcs) func(f);
    for (const v of c.vars) expr(v.init);
    for (const inner of c.innerClasses) walkClass(inner);
  };
  for (const c of m.innerClasses) walkClass(c);

  return [...used]
    .filter((n) => !reserved.has(n))
    .sort()
    .map((n) => {
      // `used` 里只放过 `isGlobalConst` 认过的名字，所以这张表一定查得到。
      const c = GLOBAL_CONSTANTS[n]!;
      return `const ${n} = ${c.kind === "int" ? "rt.V.int" : "rt.V.float"}(${c.value});`;
    });
}

/** 旧形状的类级成员：信号与实例字段发成 JS 类字段，静态与 const 的静态镜像照发，带读写器的发 get/set。 */
function emitLegacyMembers(vars: VarDecl[], signals: SignalDecl[], lineBase: number): string[] {
  const out: string[] = [];
  for (const s of signals) {
    mark(lineBase + out.length, s.loc);
    out.push(`  ${s.name} = new rt.Signal(${JSON.stringify(s.name)});`);
  }
  for (const v of vars) {
    mark(lineBase + out.length, v.loc);
    if (v.accessor) {
      out.push(...emitAccessors(v));
      continue;
    }
    const init = slotInit(v.type, v.init);
    if (v.isStatic) {
      out.push(`  static ${v.name} = ${init};`);
      continue;
    }
    out.push(`  ${v.name} = ${init};`);
    if (v.isConst) {
      mark(lineBase + out.length, v.loc);
      out.push(`  static ${v.name} = ${init};`);
    }
  }
  if (vars.length > 0 || signals.length > 0) out.push("");
  return out;
}

/** 字段 / 静态变量的初始化：定型容器走 `stampDecl`，定目标量还要再过 `declaredCast`。 */
function slotInit(t: TypeRef | null, init: Expr | null | undefined): string {
  const raw = stampDecl(t, init, emitExpr);
  const cast = declaredCast(t);
  return cast === null ? raw : `${cast}(${raw})`;
}

/** proto 形状的类要一份类型声明：字段都在 `__gd_fields__()` 里落地，类体里只发 `declare` —— 带初值的类字段会在 `super()` 之后再定义一次，把基类已写好的值冲掉。 */
function emitFieldDeclarations(vars: VarDecl[], signals: SignalDecl[]): string[] {
  const out: string[] = [];
  for (const s of signals) out.push(`  declare ${s.name}: rt.Signal;`);
  for (const v of vars) {
    if (v.isStatic || v.accessor) continue;
    out.push(`  declare ${v.name}: rt.Variant;`);
  }
  if (out.length > 0) out.push("");
  return out;
}

/** 字段与信号的初始化子集中到 `__gd_fields__`：根类的构造器调一次，派生类各自 `super.__gd_fields__()` 串起来，于是初始化子按「基类 → 子类」跑完。 */
function emitFieldsMethod(vars: VarDecl[], signals: SignalDecl[], chainToBase: boolean, lineBase: number): string[] {
  // 派生类覆写基类的这一格，`override` 修饰符不能省。
  const out: string[] = [chainToBase ? "  override __gd_fields__() {" : "  __gd_fields__() {"];
  if (chainToBase) out.push("    super.__gd_fields__();");
  for (const s of signals) {
    mark(lineBase + out.length, s.loc);
    out.push(`    this.${s.name} = new rt.Signal(${JSON.stringify(s.name)});`);
  }
  for (const v of vars) {
    if (v.isStatic || v.accessor) continue;
    mark(lineBase + out.length, v.loc);
    out.push(`    this.${v.name} = ${slotInit(v.type, v.init)};`);
  }
  out.push("  }");
  out.push("");
  return out;
}

/** 类级的那几行：静态变量、const 的静态镜像、带读写器属性的 get/set。 */
function emitClassLevelVars(vars: VarDecl[], lineBase: number): string[] {
  const out: string[] = [];
  for (const v of vars) {
    mark(lineBase + out.length, v.loc);
    if (v.accessor) {
      for (const l of emitAccessors(v)) out.push(l);
      continue;
    }
    if (v.isStatic || v.isConst) out.push(`  static ${v.name} = ${slotInit(v.type, v.init)};`);
  }
  if (out.length > 0) out.push("");
  return out;
}

/** 每个脚本类一份「名字 → 方法」派发表：表发在类里，运行时只需一次 `instanceof` 收窄。静态方法与非协议形状的 `_init` 不进表。 */
function emitDispatch(funcs: FuncDecl[], proto: boolean): string[] {
  const out: string[] = ["  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {"];
  out.push("    switch (name) {");
  for (const f of funcs) {
    if (f.isStatic) continue;
    if (!proto && f.name === "_init") continue;
    // 宿主的 virtual 发的是「薄覆写 + 别名的 async 实体」，派发表直接指向实体（形参才是 Variant 的那一个）。
    const wrapped = (f.name === "_initialize" || f.name === "_process") && RAW_ABIS.get(f.name) === undefined;
    const who = wrapped ? `__gd_${f.name}` : f.name;
    // `_init` 是统一的 rest 签名：整串实参原样交过去，缺位由它体首的绑定自己判。
    const abi = RAW_ABIS.get(f.name);
    const fwd =
      f.name === "_init" && proto
        ? "...args"
        : abi === undefined
          ? fwdParams(f.params, "args")
          : f.params.map((_p, i) => `rt.fast.${abi.params[i] === "str" ? "unboxStr" : "unboxNum"}(args[${i}] as rt.Variant)`).join(", ");
    out.push(`      case ${JSON.stringify(f.name)}: return rt.wrapValue(this.${who}(${fwd}));`);
  }
  out.push("      default: return super.__gdDispatch(name, args);");
  out.push("    }");
  out.push("  }");
  out.push("");
  return out;
}

/** 只有根用户类需要构造器：派生类继承它，`this.__gd_fields__()` 与 `this._init?.(...)` 都按最派生的一支走。 */
function emitRootConstructor(hostSuper: boolean): string[] {
  const out = ["  constructor(...__gd_new_args: rt.Variant[]) {"];
  if (hostSuper) out.push("    super();");
  out.push("    this.__gd_fields__();");
  out.push("    this.__gdDispatch(\"_init\", __gd_new_args);");
  out.push("  }");
  out.push("");
  return out;
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


/** 条件表达式：裸 bool 直接用；裸 int/float 用 `!== 0`，裸 str 用 `!== ""`（空串为假）；否则 rt.ops.truthy。 */
function condExpr(e: Expr): string {
  const r = emitExprR(e);
  if (r.rep === "bool") return r.code;
  if (r.rep === "int" || r.rep === "float") return `${r.code} !== 0`;
  if (r.rep === "str") return `${r.code} !== ""`;
  return `rt.ops.truthy(${r.code})`;
}

/** 裸数组元素的 TS 类型：静态编译目标不接受推断出的 `any[]`，而元素种类发射期就知道，声明时写上。 */
function rawElemTs(k: ElemKind): "number" | "string" {
  return leafOf(k) === "str" ? "string" : "number";
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
          return [`let ${s.name}: ${rawElemTs(ek)}[][] = [${rows.join(", ")}];`];
        }
        const parts = s.init.items.map((it) => {
          const r = emitExprR(it);
          if (r.rep !== ek) {
            throw new UnsupportedError("raw-array-init", `内部不变量破坏：裸数组元素期望 ${ek}，实得 ${r.rep}`);
          }
          return r.code;
        });
        return [`let ${s.name}: ${rawElemTs(ek)}[] = [${parts.join(", ")}];`];
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
        return [`let ${s.name} = new Map<unknown, ${rawElemTs(dk)}>([${pairs.join(", ")}]);`];
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
          lines.push(`    const ${name} = ${m}[${idx}] as rt.Variant;`);
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

/** 裸数组 / 裸网格的下标写：rep 核不上说明「推断 ⟺ 发射」的不变式被破坏，编译期响亮报错而不是静默往裸数组塞 Variant；返回 null 表示这不是裸容器。 */
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
    return `rt.fast.rawArrSet${fastSuffix(K)}(${target.obj.name}, ${i}, ${v});`;
  }
  if (target.obj.kind === "index" && target.obj.obj.kind === "ident") {
    const K = RAW_ARRAYS.get(target.obj.obj.name);
    if (!K || !isGridElem(K)) return null;
    const i = raw(target.obj.index, "int");
    const j = raw(target.index, "int");
    const v = raw(value, leafOf(K));
    return `rt.fast.rawArrSet${fastSuffix(K)}2(${target.obj.obj.name}, ${i}, ${j}, ${v});`;
  }
  return null;
}

interface WPath {
  read: string;
  write: (nv: string) => string;
  pre: string[];
}

/** 一次写回：容器是原地改（运行时返回 null，不用再补一笔）；只有值类型才要把新值放回它来的那个存储位。 */
function writeBack(p: WPath, call: string): string[] {
  const store = p.write("_nv");
  if (store === "") return [call + ";"];
  return ["{", ...p.pre, "  const _nv = " + call + ";", "  if (_nv !== null) " + store, "}"];
}

/** 值类型写（`v.x = 1`、`v[0] = 9`、`a[0].x = 5`、`m.x = 3`）：Vector2 这类是值类型，写它要产出新值再放回它来的那一格，路径由 {@link writePathFor} 给。 */
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

/** 一条读写路径：根是临时值（`f().x = 1`）时只求值、不写回；根是变量时一律给出 read+write。 */
function writePathFor(t: Expr, seq: { n: number }): WPath {
  const p = lvalueOf(t, seq);
  if (p !== null) return p;
  return { read: emitExpr(t), write: () => "", pre: [] };
}

/** 能读也能写回的存储路径：变量（局部、或发成类字段的模块变量）/ 容器下标；下标实参先提到临时变量，读写不要求两次值。 */
function lvalueOf(t: Expr, seq: { n: number }): WPath | null {
  if (t.kind === "ident") {
    const read = emitExpr(t);
    // 类名那一格读的是类身份（desc 的盒子），不是可赋值的存储位，省掉写回那一笔。
    if (INNER_CLASSES.has(t.name) || t.name === CURRENT_CLASS) return { read, write: () => "", pre: [] };
    return { read, write: (nv) => `${read} = ${nv};`, pre: [] };
  }
  if (t.kind === "index") {
    const base = lvalueOf(t.obj, seq);
    if (base === null) return null;
    const key = `_w${seq.n}`;
    seq.n += 1;
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

/** `self.<成员>` → 裸成员 ident（两者同一格）；名字不是当前类的成员就返回 null，宁可走响亮分支也不发成一个不存在的 `this.x`。 */
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

/** 快路径入口按元素种类挑具体名：静态编译目标解析不了对象字面量上的泛型成员，而种类在发射期就定死。 */
function fastSuffix(k: ElemKind): "Num" | "Str" {
  return leafOf(k) === "str" ? "Str" : "Num";
}

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
// float 没有 int64 的范围陷阱（溢出→Infinity、除零→Infinity，与装箱 V.float(a op b) 逐位一致），故可内联裸运算。
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
    return { code: JSON.stringify(String(e.value)), rep: "str" };
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
      return { code: `rt.fast.rawArrGet${fastSuffix(ek)}2(${e.obj.obj.name}, ${ri.code}, ${rj.code})`, rep: leafOf(ek) };
    }
  }
  if (e.kind === "index" && e.obj.kind === "ident") {
    const ek = RAW_ARRAYS.get(e.obj.name);
    if (ek && !isGridElem(ek)) {
      const ir = emitExprR(e.index);
      if (ir.rep !== "int") throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组下标期望 int，实得 ${ir.rep}`);
      return { code: `rt.fast.rawArrGet${fastSuffix(ek)}(${e.obj.name}, ${ir.code})`, rep: ek };
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
      return { code: `rt.fast.rawArrPushFront${fastSuffix(ek)}(${nm}, ${er.code})`, rep: "var" };
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
      return { code: `rt.fast.rawArrInsert${fastSuffix(ek)}(${nm}, ${ir.code}, ${vr.code})`, rep: "int" };
    }
    if (ek && e.callee.name === "remove_at" && e.args.length === 1) {
      const ir = emitExprR(e.args[0]!);
      if (ir.rep !== "int") throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 remove_at 下标期望 int，实得 ${ir.rep}`);
      return { code: `rt.fast.rawArrRemoveAt${fastSuffix(ek)}(${nm}, ${ir.code})`, rep: "var" };
    }
    if (ek && e.callee.name === "clear" && e.args.length === 0) {
      return { code: `rt.fast.rawArrClear${fastSuffix(ek)}(${nm})`, rep: "var" };
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
      return { code: `rt.fast.rawArrRemoveAt${fastSuffix(ek)}(${nm}, ${ir.code})`, rep: "var" };
    }
    if (dk && e.callee.name === "get" && e.args.length === 2) {
      const kr = emitExprR(e.args[0]!);
      const dr = emitExprR(e.args[1]!);
      if (kr.rep !== "int" && kr.rep !== "str") {
        throw new UnsupportedError("raw-dict-key", `内部不变量破坏：裸字典 get 键期望 int/str，实得 ${kr.rep}`);
      }
      if (dr.rep !== dk) throw new UnsupportedError("raw-dict-get", `内部不变量破坏：裸字典 get 默认值期望 ${dk}，实得 ${dr.rep}`);
      return { code: `rt.fast.rawDictGetOr${fastSuffix(dk)}(${nm}, ${kr.code}, ${dr.code})`, rep: dk };
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
      case "ident":
        // 分析器记下的全局函数取值点：同一个名字在本函数里既当全局又当局部时（实测 `var len = 5` 之前的 `len` 是全局 Callable），
        // 裸值通道按名字整支覆盖会把两处搅在一起，所以这个名字整个退出裸值优化。
        if (isGlobalValueRead(e)) excluded.add(e.name);
        break;
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
  for (const kind of ABI_KINDS) {
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

/** 双 int 字面量的裸算术结果还塞得进 2^53 吗？塞不进就整式退回装箱轨——只有操作数皆为字面量才可静态判定。 */
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

/** 裸 ABI 形态判定：无返回类型标注、参数无类型/默认值、非协程/静态/入口，且函数体是直线（只有 `var x = …`、`x = …` 目标是裸 ident、带值的 `return`）；同型性判定交给 sigValid。 */
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
  const dummyU: (fn: FuncDecl) => Map<string, "int" | "float" | "str"> = () => new Map<string, "int" | "float" | "str">();
  const seed = new Map<string, RawAbi>();
  for (const name of candNames) {
    const f = byName.get(name)!;
    for (const K of ABI_KINDS) {
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
      for (const K of ABI_KINDS) {
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

/** 数组候选的元素类型：空初值在这里不给类型，改由 analyzeFuncLayout 的不动点按写入证据定。只在 candidates 扫完之后调用。 */
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
  // 字符串元素也进裸轨（rep 为 str），越界读仍由运行时响亮抛错。
  if (e.lit === "string") return "str";
  return null;
}

/** 数组/字典初值的元素类型；nested=true 时额外认「数组的数组」并返回 `"int[]"` / `"float[]"` / `"str[]"`；空数组给 `"int"`。 */
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

/** 数组元素 Kind 与标量解箱的联合不动点：从乐观种子出发单调剔除不符或逃逸的候选，直到数组集与解箱集同时稳定。 */
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
    // 空初值的候选在这里按写入证据定类型（只看字面量证据定不下来）。
    // `seeded` 保证每个候选最多播种一次，被 verifyArray 删掉后不再重播。
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
  // 空初值没有初值类型可对：它的 K 是不动点里按写入证据定的，下面 writeElems / writeVals 两条就是它的校验。
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

/** 键必须裸化为 int 或 str（float/bool/其它一律拒收，避免 1 与 1.0 碰撞）。 */
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
      // 类名当接收者（`Inner.make()`、`Inner.f` 取值）时给的是类身份的盒子：类值本身装不进 Variant。
      if (INNER_CLASSES.has(e.name) || e.name === CURRENT_CLASS) return `rt.V.object(__gd_d_${e.name})`;
      if (STATIC_FUNCS.has(e.name)) return `rt.methodCallable(rt.V.object(__gd_d_${CURRENT_CLASS}), ${JSON.stringify(e.name)})`;
      if (MODULE_FUNCS.has(e.name)) return `rt.methodCallable(rt.V.object(this), ${JSON.stringify(e.name)})`;
      if (CURRENT_MEMBERS.has(e.name)) return `this.${e.name}`;
      if (MODULE_VARS.has(e.name)) return MODULE_SIGNALS.has(e.name) ? `rt.wrapValue(this.${e.name})` : `this.${e.name}`;
      // 全局函数的取值点：分析器按真实作用域记的号，实测一律给 `@GlobalScope::<名字>` 的 Callable（typeof 25）
      if (isGlobalValueRead(e)) return `rt.globalCallable(${JSON.stringify(e.name)})`;
      // 引擎类名的取值点：实测 typeof 24、等式按类，发一个身份盒子；打印与 `.new()` 那两支在运行时各自响亮拒
      if (isNativeClassValueRead(e)) return `rt.nativeClass(${JSON.stringify(e.name)})`;
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
      return `rt.wrapValue(rt.index(${emitExpr(e.obj)}, ${emitExpr(e.index)}))`;

    case "attribute":
      if (e.obj.kind === "ident" && e.obj.name === "super") {
        throw new UnsupportedError("emit-super-prop", "super.属性 访问还没实现（只支持 super.method()）");
      }
      if (e.obj.kind === "ident" && e.obj.name === "self") {
        if (CURRENT_MEMBERS.has(e.name) || MODULE_VARS.has(e.name) || MODULE_FUNCS.has(e.name)) {
          return emitExprVar({ kind: "ident", name: e.name, loc: e.loc });
        }
        return `rt.wrapValue(rt.attribute(rt.V.object(this), ${JSON.stringify(e.name)}))`;
      }
      const staticFn = staticMemberFn(e.obj);
      if (staticFn) {
        return `rt.${staticFn}(${JSON.stringify(e.name)})`;
      }
      if (e.obj.kind === "ident" && ENUM_NAMES.has(e.obj.name)) {
        return `rt.wrapValue(rt.index(${e.obj.name}, rt.V.str(${JSON.stringify(e.name)})))`;
      }
      if (e.obj.kind === "ident" && CLASS_VALUES.get(e.obj.name)?.has(e.name) === true) {
        return `${e.obj.name}.${e.name}`;
      }
      return `rt.wrapValue(rt.attribute(${emitExpr(e.obj)}, ${JSON.stringify(e.name)}))`;

    case "lambda": {
      // lambda 形参的默认值未实现：只拒那一格，普通形参照常发。
      if (e.params.some((p) => p.default !== null)) {
        throw new UnsupportedError("lambda-param-default", "lambda 形参的默认值还没实测过，不发");
      }
      const body = e.body.flatMap((st) => emitStmt(st, false).map((l) => `      ${l}`));
      // 盒子里的式子统一收一个数组，所以按位置把形参绑成同名 const，并把声明形参数一起交给盒子。
      const bind = e.params.map((p, i) => `      const ${p.name} = __a[${i}] as rt.Variant;`);
      return [
        `rt.callable((__a: rt.Variant[]) => {`,
        ...bind,
        ...body,
        `    }, ${e.params.length})`,
      ].join("\n");
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
  if (lit === "string") return `rt.V.str(${JSON.stringify(String(value))})`;
  if (lit === "string_name") return `rt.V.stringName(${JSON.stringify(String(value))})`;
  if (lit === "bool") return `rt.V.bool(${String(value)})`;
  return "rt.V.nil()";
}

/** 声明类型是定型容器（`Array[int]` / `Dictionary[String, int]`）时在容器创建处盖章：章跟着值一起走，别名共享；元素是引擎类时不盖章。 */
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

/** `Object.call` / `callv` 的 arity 表：`[必填数, 全部形参数]`，必填数取第一个带默认值的形参之前的个数。 */
function methodAritiesLiteral(funcs: readonly FuncDecl[]): string | null {
  const rows: string[] = [];
  for (const f of funcs) {
    // `_init` 不在表里（它的实参数另有解析期那一族）；静态方法进表，给的是声明形参数。
    if (f.name === "_init") continue;
    let required = f.params.length;
    for (let i = 0; i < f.params.length; i++) {
      if (f.params[i]?.default !== null && f.params[i]?.default !== undefined) {
        required = i;
        break;
      }
    }
    rows.push(`${JSON.stringify(f.name)}: [${required}, ${f.params.length}]`);
  }
  return rows.length === 0 ? null : `{ ${rows.join(", ")} }`;
}

/** 带类型标注的赋值按声明类型显式转换（float 赋给 int 向零截断）。 */
function declaredCast(t: TypeRef | null): string | null {
  if (t === null || t.kind !== "named") return null;
  const base = t.name.replace(/\[.*\]$/, "");
  if (base === "int") return "rt.toInt";
  if (base === "float") return "rt.toFloat";
  if (base === "bool") return "rt.toBool";
  if (base === "String") return "rt.strOf";
  if (base === "Vector2") return "rt.toVec2";
  // 值类型槽之间的互转（Vector3 ↔ Vector3i 等）：没有这两条转换时槽里存的是原形状，打印与 `typeof` 一起错。
  if (base === "Vector3") return "rt.toVec3";
  if (base === "Vector3i") return "rt.toVec3i";
  if (base === "Vector2i") return "rt.toVec2i";
  // Color 槽吃 int（packed RGBA）与 String（色名 / hex），StringName 槽吃 String；四路赋值同形。
  if (base === "Color") return "rt.toColor";
  if (base === "StringName") return "rt.toStringNameSlot";
  return null;
}

/** 没有初值的声明给的是该类型的默认值而不是 null：只有值类型要特判，类与引擎对象保持 null。 */
function typeDefault(t: TypeRef | null): string {
  if (t === null) return "rt.V.nil()";
  if (t.kind === "array") return "rt.V.array(rt.GArray.of([]))";
  if (t.kind !== "named") return "rt.V.nil()";
  const base = t.name.replace(/\[.*\]$/, "");
  if (base === "int") return "rt.V.int(0)";
  if (base === "float") return "rt.V.float(0)";
  if (base === "bool") return "rt.V.bool(false)";
  if (base === "String") return `rt.V.str("")`;
  // `var sn: StringName` 的默认值是空 StringName（打印空串、length 0），不是 null。
  if (base === "StringName") return `rt.V.stringName("")`;
  if (base === "Array") return "rt.V.array(rt.GArray.of([]))";
  if (base === "Dictionary") return "rt.dictOf([])";
  if (base === "Vector2") return "rt.vector2(0, 0)";
  if (base === "Vector3") return "rt.vector3(0, 0, 0)";
  if (base === "Vector2i") return "rt.vector2i(0, 0)";
  if (base === "Vector3i") return "rt.vector3i(0, 0, 0)";
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

/** 裸调用的 callee 名在成员表里认不认得（内置与 print/load/preload 在前面各自就返回了）：本模块与当前类的方法、字段与信号、类级的值，加上继承链上的 —— 含宿主基类的 `quit()`，但只在链上真挂着宿主时。
 *  实测 callee 名既不按局部声明解（`var cb = getv` 之后 `cb()` → `Function "cb()" not found in base self.`），也不按类名解（`Inner()` → `Member "Inner" is not a function.`），所以这两类名字不在表里。
 *  一张都不认的才拒 —— 之前兜底直接发 `this.x(...)`，运行期炸成裸 JS `TypeError`，既没有 `[code]` 也不是 `UnsupportedError`。 */
function callableInScope(name: string): boolean {
  return (
    MODULE_FUNCS.has(name) ||
    CLASS_FUNCS.has(name) ||
    STATIC_FUNCS.has(name) ||
    CURRENT_MEMBERS.has(name) ||
    MODULE_VARS.has(name) ||
    INHERITED_METHODS.has(name) ||
    CLASS_VALUE_OWNERS.has(name)
  );
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
      if (bound && lit !== null) return `rt.loadScript(${JSON.stringify(lit)})`;
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
    if (builtin) {
      checkBuiltinArity(name, e.args.length);
      return builtin(args);
    }
    if (name === "super") {
      // `_init` 里的 `super(...)` 调父类 `_init` 的体（调两次就跑两遍）；别的方法里的 `super()` 调父类的同名方法。
      if (!INIT_HAS_BASE) {
        throw new UnsupportedError("emit-super-ctor", `${CURRENT_CLASS} 没有脚本基类，super() 这一格还没实测过，不发`);
      }
      if (IN_INIT) return `super._init(${args.join(", ")})`;
      if (CURRENT_FUNC === "" || STATIC_FUNCS.has(CURRENT_FUNC)) {
        throw new UnsupportedError("emit-super-ctor", "静态方法里的 super() 没实测过，不发");
      }
      return `super.${CURRENT_FUNC}(${args.join(", ")})`;
    }
    if (BUILTIN_TODO.has(name)) {
      throw new UnsupportedError("emit-builtin", `内置函数 ${name}() 还没实现`);
    }
    if (STATIC_FUNCS.has(name)) return `${CURRENT_CLASS}.${name}(${args.join(", ")})`;
    if (!callableInScope(name)) {
      throw new UnsupportedError("call-unknown", `Function "${name}()" not found in base self.`);
    }
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
