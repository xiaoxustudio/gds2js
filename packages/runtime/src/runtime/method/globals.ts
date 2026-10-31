import { GodotRuntimeError, UnsupportedError } from "../errors";
import { HEX_PREFIX_RE, HEX_RE, INT_RE, hashDjb2, strHexToInt, toBool, toFloat, toInt, variantHashNumber,
  abs, lengthOf, range as gRange, sqrt, variantHash, gAngleDifference, gCubic, gClamp, gCeil, gDegToRad, gRadToDeg, gEase, gExp,
  gFloor, gFmod, gFposmod, gInverseLerp, gIsEqualApprox, gIsFinite, gIsInf, gIsNan, gIsZeroApprox, gLerp, gLog,
  gMax, gMaxF, gMaxI, gMin, gMinF, gMinI, gMoveToward, gPosmod, gPow, gRemap, gRound, gSign, gSignF, gSignI,
  gSmoothstep, gSnapped, gSnappedF, gSnappedI, gWrap, gAbsF, gAbsI, gWrapAny, gIsSame,
  gTypeString, gErrorString, gTypeExists,
  gWeakref, gInstanceFromId, gIsInstanceValid, gIsInstanceIdValid, gRidFromInt64, gRidAllocateId, gInstToDict,
  gRandi, gRandf, gRandomize, gSeed, gRandFromSeed, gRandiRange, gRandfRange, gRandfn,
  gSin, gCos, gTan, gAsin, gAcos, gAtan, gAtan2, gSinh, gCosh, gTanh, gAsinh, gAcosh, gAtanh, randNextUint32,
  gDbToLinear, gLinearToDb, gPingpong, gStepDecimals, gNearestPo2, gRotateToward, gLerpAngle,
  gBezierInterpolate, gBezierDerivative, gCubicAngle, gCubicInTime, gCubicAngleInTime } from "../builtins";
import { GLOBAL_CALLABLES } from "../global-names";
import { variantConvert } from "../convert";
import { typeOf, gIsInstanceOf } from "../patterns";
import { dictDescOf, dictShapeOf, writeDictWritten, beginBareConstruction, endBareConstruction, loadScript } from "../class/object/script-object";
import { CallableBox } from "../class/object/script-object";
import { gGetStack, gPrintStack, gPushError, gPushWarning } from "../frames";
import { gBytesToVar, gBytesToVarWithObjects, gVarToBytes, gVarToBytesWithObjects } from "../var-bytes";
import { asNodePath, nodePathText } from "../class/identity/node-path";
import { Tag, V, type Variant } from "../tags";
import { GDict, strBuiltin, varToStr, strToVar } from "../values";
import { stringChr, valueTypeName } from "../string-ops";
import { writeProp } from "./access";
import type { Fn } from "../class/identity/callable";

export function ga(a: Variant[], i: number): Variant {
  const v = a[i];
  if (v === undefined) {
    throw new UnsupportedError("global-callable-arg", `全局 Callable 的第 ${i + 1} 个实参槽是空的（这一形没量过引擎读数）`);
  }
  return v;
}

const GLOBAL_IMPL: Record<string, Fn> = {
  var_to_bytes: (a) => gVarToBytes(ga(a, 0)),
  var_to_bytes_with_objects: (a) => gVarToBytesWithObjects(ga(a, 0)),
  bytes_to_var: (a) => gBytesToVar(ga(a, 0)),
  bytes_to_var_with_objects: (a) => gBytesToVarWithObjects(ga(a, 0)),
  get_stack: () => gGetStack(),
  print_stack: () => gPrintStack(),
  push_error: (a) => gPushError(a),
  push_warning: (a) => gPushWarning(a),
  abs: (a) => abs(ga(a, 0)),
  absf: (a) => gAbsF(ga(a, 0)),
  absi: (a) => gAbsI(ga(a, 0)),
  error_string: (a) => gErrorString(ga(a, 0)),
  type_string: (a) => gTypeString(ga(a, 0)),
  type_exists: (a) => gTypeExists(ga(a, 0)),
  acos: (a) => gAcos(ga(a, 0)),
  acosh: (a) => gAcosh(ga(a, 0)),
  asin: (a) => gAsin(ga(a, 0)),
  asinh: (a) => gAsinh(ga(a, 0)),
  atan: (a) => gAtan(ga(a, 0)),
  atan2: (a) => gAtan2(ga(a, 0), ga(a, 1)),
  atanh: (a) => gAtanh(ga(a, 0)),
  cos: (a) => gCos(ga(a, 0)),
  cosh: (a) => gCosh(ga(a, 0)),
  sin: (a) => gSin(ga(a, 0)),
  sinh: (a) => gSinh(ga(a, 0)),
  tan: (a) => gTan(ga(a, 0)),
  tanh: (a) => gTanh(ga(a, 0)),
  bezier_derivative: (a) => gBezierDerivative(ga(a, 0), ga(a, 1), ga(a, 2), ga(a, 3), ga(a, 4)),
  bezier_interpolate: (a) => gBezierInterpolate(ga(a, 0), ga(a, 1), ga(a, 2), ga(a, 3), ga(a, 4)),
  cubic_interpolate_angle: (a) => gCubicAngle(ga(a, 0), ga(a, 1), ga(a, 2), ga(a, 3), ga(a, 4)),
  cubic_interpolate_angle_in_time: (a) => gCubicAngleInTime(ga(a, 0), ga(a, 1), ga(a, 2), ga(a, 3), ga(a, 4), ga(a, 5), ga(a, 6), ga(a, 7)),
  cubic_interpolate_in_time: (a) => gCubicInTime(ga(a, 0), ga(a, 1), ga(a, 2), ga(a, 3), ga(a, 4), ga(a, 5), ga(a, 6), ga(a, 7)),
  db_to_linear: (a) => gDbToLinear(ga(a, 0)),
  lerp_angle: (a) => gLerpAngle(ga(a, 0), ga(a, 1), ga(a, 2)),
  linear_to_db: (a) => gLinearToDb(ga(a, 0)),
  nearest_po2: (a) => gNearestPo2(ga(a, 0)),
  pingpong: (a) => gPingpong(ga(a, 0), ga(a, 1)),
  rotate_toward: (a) => gRotateToward(ga(a, 0), ga(a, 1), ga(a, 2)),
  step_decimals: (a) => gStepDecimals(ga(a, 0)),
  char: (a) => stringChr(ga(a, 0)),
  angle_difference: (a) => gAngleDifference(ga(a, 0), ga(a, 1)),
  ceil: (a) => gCeil(ga(a, 0), "auto"),
  ceilf: (a) => gCeil(ga(a, 0), "float"),
  ceili: (a) => gCeil(ga(a, 0), "int"),
  clamp: (a) => gClamp(ga(a, 0), ga(a, 1), ga(a, 2), "auto"),
  clampf: (a) => gClamp(ga(a, 0), ga(a, 1), ga(a, 2), "float"),
  clampi: (a) => gClamp(ga(a, 0), ga(a, 1), ga(a, 2), "int"),
  convert: (a) => variantConvert(ga(a, 0), ga(a, 1), true),
  cubic_interpolate: (a) => gCubic(ga(a, 0), ga(a, 1), ga(a, 2), ga(a, 3), ga(a, 4)),
  deg_to_rad: (a) => gDegToRad(ga(a, 0)),
  ease: (a) => gEase(ga(a, 0), ga(a, 1)),
  exp: (a) => gExp(ga(a, 0)),
  floor: (a) => gFloor(ga(a, 0), "auto"),
  floorf: (a) => gFloor(ga(a, 0), "float"),
  floori: (a) => gFloor(ga(a, 0), "int"),
  fmod: (a) => gFmod(ga(a, 0), ga(a, 1)),
  fposmod: (a) => gFposmod(ga(a, 0), ga(a, 1)),
  hash: (a) => variantHash(a),
  inverse_lerp: (a) => gInverseLerp(ga(a, 0), ga(a, 1), ga(a, 2)),
  is_equal_approx: (a) => gIsEqualApprox(ga(a, 0), ga(a, 1)),
  is_finite: (a) => gIsFinite(ga(a, 0)),
  is_inf: (a) => gIsInf(ga(a, 0)),
  is_nan: (a) => gIsNan(ga(a, 0)),
  is_same: (a) => gIsSame(ga(a, 0), ga(a, 1)),
  is_zero_approx: (a) => gIsZeroApprox(ga(a, 0)),
  len: (a) => lengthOf(ga(a, 0)),
  lerp: (a) => gLerp(ga(a, 0), ga(a, 1), ga(a, 2)),
  lerpf: (a) => gLerp(ga(a, 0), ga(a, 1), ga(a, 2)),
  load: (a) => loadScript(ga(a, 0)),
  log: (a) => gLog(ga(a, 0)),
  max: (a) => gMax(ga(a, 0), ga(a, 1), ...a.slice(2)),
  maxf: (a) => gMaxF(ga(a, 0), ga(a, 1)),
  maxi: (a) => gMaxI(ga(a, 0), ga(a, 1)),
  min: (a) => gMin(ga(a, 0), ga(a, 1), ...a.slice(2)),
  minf: (a) => gMinF(ga(a, 0), ga(a, 1)),
  mini: (a) => gMinI(ga(a, 0), ga(a, 1)),
  move_toward: (a) => gMoveToward(ga(a, 0), ga(a, 1), ga(a, 2)),
  posmod: (a) => gPosmod(ga(a, 0), ga(a, 1)),
  pow: (a) => gPow(ga(a, 0), ga(a, 1)),
  rad_to_deg: (a) => gRadToDeg(ga(a, 0)),
  weakref: (a) => gWeakref(ga(a, 0)),
  rid_from_int64: (a) => gRidFromInt64(ga(a, 0)),
  rid_allocate_id: () => gRidAllocateId(),
  inst_to_dict: (a) => gInstToDict(ga(a, 0)),
  dict_to_inst: (a) => gDictToInst(ga(a, 0)),
  instance_from_id: (a) => gInstanceFromId(ga(a, 0)),
  is_instance_of: (a) => gIsInstanceOf(ga(a, 0), ga(a, 1)),
  is_instance_valid: (a) => gIsInstanceValid(ga(a, 0)),
  is_instance_id_valid: (a) => gIsInstanceIdValid(ga(a, 0)),
  randi: () => gRandi(),
  randf: () => gRandf(),
  randomize: () => gRandomize(),
  seed: (a) => gSeed(ga(a, 0)),
  rand_from_seed: (a) => gRandFromSeed(ga(a, 0)),
  randi_range: (a) => gRandiRange(ga(a, 0), ga(a, 1)),
  randf_range: (a) => gRandfRange(ga(a, 0), ga(a, 1)),
  randfn: (a) => gRandfn(ga(a, 0), ga(a, 1)),
  range: (a) => V.array(gRange(a)),
  remap: (a) => gRemap(ga(a, 0), ga(a, 1), ga(a, 2), ga(a, 3), ga(a, 4)),
  round: (a) => gRound(ga(a, 0), "auto"),
  roundf: (a) => gRound(ga(a, 0), "float"),
  roundi: (a) => gRound(ga(a, 0), "int"),
  sign: (a) => gSign(ga(a, 0)),
  signf: (a) => gSignF(ga(a, 0)),
  signi: (a) => gSignI(ga(a, 0)),
  smoothstep: (a) => gSmoothstep(ga(a, 0), ga(a, 1), ga(a, 2)),
  snapped: (a) => gSnapped(ga(a, 0), ga(a, 1)),
  snappedf: (a) => gSnappedF(ga(a, 0), ga(a, 1)),
  snappedi: (a) => gSnappedI(ga(a, 0), ga(a, 1)),
  sqrt: (a) => sqrt(ga(a, 0)),
  str: (a) => strBuiltin(a),
  str_to_var: (a) => strToVar(ga(a, 0)),
  type_convert: (a) => variantConvert(ga(a, 0), ga(a, 1), false),
  typeof: (a) => typeOf(ga(a, 0)),
  var_to_str: (a) => V.str(varToStr(ga(a, 0))),
  wrap: (a) => gWrapAny(ga(a, 0), ga(a, 1), ga(a, 2)),
  wrapf: (a) => gWrap(ga(a, 0), ga(a, 1), ga(a, 2), false),
  wrapi: (a) => gWrap(ga(a, 0), ga(a, 1), ga(a, 2), true),
};

export function gDictToInst(v: Variant): Variant {
  if (v.t !== Tag.DICT) {
    throw new GodotRuntimeError(
      "dict-to-inst-arg",
      `Invalid type in GDScript utility function "dict_to_inst()". Cannot convert argument 1 from ${valueTypeName(v)} to Dictionary.`,
    );
  }
  const d = v.v as GDict;
  const keys = d.keys();
  const vals = d.values();
  let resPath: string | null = null;
  let classPath = "";
  const entries: Array<{ name: string; value: Variant }> = [];
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i] as Variant;
    const val = vals[i] as Variant;
    const text = dictKeyName(k);
    if (text === "@path") {
      resPath = dictPathText(val);
      continue;
    }
    if (text === "@subpath") {
      classPath = dictPathText(val) ?? "";
      continue;
    }
    if (text !== null) entries.push({ name: text, value: val });
  }
  if (resPath === null) {
    throw new GodotRuntimeError(
      "dict-to-inst",
      `Error calling GDScript utility function "dict_to_inst()": Invalid instance dictionary format (missing @path).`,
    );
  }
  const desc = dictDescOf(resPath, classPath);
  if (desc === null) {
    if (dictDescOf(resPath, "") === null) {
      throw new GodotRuntimeError(
        "dict-to-inst",
        `Error calling GDScript utility function "dict_to_inst()": Invalid instance dictionary format (can't load script at @path).`,
      );
    }
    throw new GodotRuntimeError(
      "dict-to-inst",
      `Error calling GDScript utility function "dict_to_inst()": Invalid instance dictionary (invalid subclasses).`,
    );
  }
  if (classPath === "") {
    throw new UnsupportedError(
      "dict-to-inst-root",
      `dict_to_inst() 造模块根类那一形（缺 @subpath 或 @subpath 是空路径）只量过 extends SceneTree 的模块：引擎真会造出宿主实例（实测造出 <SceneTree#号> 并漏出一片 RID），Tier 1 发不出那种实例，别的宿主基类也没量过，不猜`,
    );
  }
  beginBareConstruction();
  let inst: object;
  try {
    inst = desc.make([]);
  } finally {
    endBareConstruction();
  }
  const box = V.object(inst);
  const shape = dictShapeOf(inst);
  if (shape !== null) {
    const accNames = Object.keys(shape.accessors);
    for (const e of entries) {
      if (shape.names.indexOf(e.name) < 0) continue;
      if (accNames.indexOf(e.name) >= 0) writeDictWritten(inst, e.name, e.value);
      else writeProp(box, e.name, e.value);
    }
  }
  return box;
}

/** 字典键的名字：String 与 StringName 同形（引擎那两形都认，`@subpath` 给 String 也造得出实例，实测 s01）。 */
function dictKeyName(k: Variant): string | null {
  if (k.t === Tag.STRING || k.t === Tag.STRING_NAME) return k.v as string;
  return null;
}

function dictPathText(val: Variant): string | null {
  if (val.t === Tag.STRING || val.t === Tag.STRING_NAME) return val.v as string;
  const np = asNodePath(val);
  if (np !== null) return nodePathText(np);
  throw new UnsupportedError("dict-to-inst-value", `dict_to_inst() 的 @path / @subpath 只量过 String 与 NodePath（收到 ${valueTypeName(val)}）`);
}

export const GLOBAL_CALLABLE_IMPLEMENTED: ReadonlySet<string> = new Set(Object.keys(GLOBAL_IMPL));

export function globalCallable(name: string): Variant {
  const row = GLOBAL_CALLABLES[name];
  if (row === undefined) {
    throw new UnsupportedError("global-callable-name", `${name} 不在实测「能当值用的全局函数名」那 126 个里`);
  }
  const impl = GLOBAL_IMPL[name];
  const fn: Fn =
    impl ??
    (() => {
      throw new UnsupportedError("global-callable-call", `全局函数 ${name}() 还没实现，Callable 也调不出它`);
    });
  return V.object(new CallableBox(fn, name, null, [], null));
}
