import { analysis, beginEmit, type ElemKind, type EmitContext, type Kind, type RawAbi, ctx } from "./context";
import { staticMemberFn } from "../lower/ir";
import { GLOBAL_CONSTANTS, GLOBAL_TODO_FUNCTIONS, isGlobalConst } from "../lower/globals";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, PropAccessor, SignalDecl, Stmt, TypeRef, VarDecl } from "../lower/ir";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { isElemKind } from "@gds2js/runtime/runtime/values";
import { NATIVE_CLASS_SLOTS } from "../semantics/elem-faces";
import { NO_ANALYSIS, type AnalysisResult } from "../analyze/analysis-result";
import { buildSourceMap, type LineMapping, type RawSourceMap } from "./sourcemap";

import { type Rep, rangeArgList } from "./helpers";

export const BINOP: Record<string, string> = {
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

export const ABI_KINDS: Array<"int" | "float" | "str"> = ["int", "float", "str"];

export const BUILTIN: Record<string, (args: string[]) => string> = {
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
  convert: (a) => `rt.variantConvert(${a[0]}, ${a[1]}, true)`,
  type_convert: (a) => `rt.variantConvert(${a[0]}, ${a[1]}, false)`,
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
  Vector4: (a) => `rt.vector4New([${a.join(", ")}])`,
  Vector4i: (a) => `rt.vector4iNew([${a.join(", ")}])`,
  Color: (a) => `rt.colorNew([${a.join(", ")}])`,
  String: (a) => `rt.stringCtor([${a.join(", ")}])`,
  StringName: (a) => `rt.stringNameCtor([${a.join(", ")}])`,
  NodePath: (a) => `rt.nodePathCtor([${a.join(", ")}])`,
  PackedByteArray: (a) => `rt.bytesCtor([${a.join(", ")}])`,
  PackedInt32Array: (a) => `rt.packCtor("int32", [${a.join(", ")}])`,
  PackedInt64Array: (a) => `rt.packCtor("int64", [${a.join(", ")}])`,
  PackedFloat32Array: (a) => `rt.packCtor("float32", [${a.join(", ")}])`,
  PackedFloat64Array: (a) => `rt.packCtor("float64", [${a.join(", ")}])`,
  PackedStringArray: (a) => `rt.packCtor("string", [${a.join(", ")}])`,
  PackedVector2Array: (a) => `rt.packCtor("vector2", [${a.join(", ")}])`,
  PackedVector3Array: (a) => `rt.packCtor("vector3", [${a.join(", ")}])`,
  PackedVector4Array: (a) => `rt.packCtor("vector4", [${a.join(", ")}])`,
  PackedColorArray: (a) => `rt.packCtor("color", [${a.join(", ")}])`,
  Array: (a) => `rt.arrayFromArgs([${a.join(", ")}])`,
  Callable: (a) => `rt.callableCtor([${a.join(", ")}])`,
  Signal: (a) => `rt.signalCtor([${a.join(", ")}])`,
  is_instance_of: (a) => `rt.gIsInstanceOf(${a[0]}, ${a[1]})`,
  is_instance_valid: (a) => `rt.gIsInstanceValid(${a[0]})`,
  is_instance_id_valid: (a) => `rt.gIsInstanceIdValid(${a[0]})`,
  instance_from_id: (a) => `rt.gInstanceFromId(${a[0]})`,
  weakref: (a) => `rt.gWeakref(${a[0]})`,
  rid_from_int64: (a) => `rt.gRidFromInt64(${a[0]})`,
  rid_allocate_id: () => "rt.gRidAllocateId()",
  inst_to_dict: (a) => `rt.gInstToDict(${a[0]})`,
  dict_to_inst: (a) => `rt.gDictToInst(${a[0]})`,
  randi: () => "rt.gRandi()",
  randf: () => "rt.gRandf()",
  randomize: () => "rt.gRandomize()",
  seed: (a) => `rt.gSeed(${a[0]})`,
  rand_from_seed: (a) => `rt.gRandFromSeed(${a[0]})`,
  randi_range: (a) => `rt.gRandiRange(${a[0]}, ${a[1]})`,
  randf_range: (a) => `rt.gRandfRange(${a[0]}, ${a[1]})`,
  randfn: (a) => `rt.gRandfn(${a[0]}, ${a[1]})`,
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
  min: (a) => `rt.gMin(${a.join(", ")})`,
  max: (a) => `rt.gMax(${a.join(", ")})`,
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
  var_to_bytes: (a) => `rt.gVarToBytes(${a[0]})`,
  var_to_bytes_with_objects: (a) => `rt.gVarToBytesWithObjects(${a[0]})`,
  bytes_to_var: (a) => `rt.gBytesToVar(${a[0]})`,
  bytes_to_var_with_objects: (a) => `rt.gBytesToVarWithObjects(${a[0]})`,
  get_stack: () => "rt.gGetStack()",
  print_stack: () => "rt.gPrintStack()",
  push_error: (a) => `rt.gPushError([${a.join(", ")}])`,
  push_warning: (a) => `rt.gPushWarning([${a.join(", ")}])`,
};

export const BUILTIN_TODO = GLOBAL_TODO_FUNCTIONS;

export const BUILTIN_TODO_WHY: Readonly<Record<string, string>> = {};

export const HOST_PRINT_NAMES: readonly string[] = [
  "print",
  "printJoined",
  "printRaw",
  "printErr",
  "printVerbose",
  "printRich",
  "printDebug",
];

export const GLOBAL_IMPLEMENTED: Set<string> = new Set([
  ...Object.keys(BUILTIN),
  ...HOST_PRINT_NAMES,
  "load",
  "preload",
]);

export const SCRIPT_HOST_BASES = new Set(["RefCounted", "Node", "Object"]);

export const HOST_MEMBERS = ["quit", "create_timer", "run", "_initialize", "_process", "__gdDispatch"];

export const MEASURED_SLOTS = new Set([
  "int",
  "float",
  "bool",
  "String",
  "StringName",
  "Vector2",
  "Vector2i",
  "Vector3",
  "Vector3i",
  "Vector4",
  "Vector4i",
  "Color",
]);

export interface R {
  code: string;
  rep: Rep;
}

export const NO_ARRAYS: Map<string, ElemKind> = new Map();

export const NO_DICTS: Map<string, "int" | "float"> = new Map();

export const CMP_RAW: Record<string, string> = { "<": "<", "<=": "<=", ">": ">", ">=": ">=", "==": "===", "!=": "!==" };

export const ARITH_RAW: Record<string, string> = { "+": "iAddC", "-": "iSubC", "*": "iMulC", "/": "iDivC", "%": "iModC" };

export const FLOAT_ARITH_RAW: Record<string, string> = { "+": "+", "-": "-", "*": "*", "/": "/" };

export const INT_ARITH = new Set(["+", "-", "*", "/", "%"]);

export const FLOAT_ARITH = new Set(["+", "-", "*", "/"]);

export const CMP_OPS = new Set(["<", "<=", ">", ">=", "==", "!="]);

export const RAW_INT_MIN = BigInt(Number.MIN_SAFE_INTEGER);

export const RAW_INT_MAX = BigInt(Number.MAX_SAFE_INTEGER);

export const D6_VALUE_TYPES = new Set(["Rect2", "Rect2i", "Transform2D", "Plane", "Quaternion", "Basis", "AABB"]);
