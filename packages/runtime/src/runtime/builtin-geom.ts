import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, type Variant } from "./tags";
import { show } from "./values";
import { GVector4 } from "./vector4";
import { GVector4i } from "./vector4i";
import { PI_D, TAU_D, approxEq, num, sameShape, sameTypeVectorMath, sqrt, utilConvertError, utilFloatArg, vecClassName, weightToFloat } from "./builtin-args";
import { LERP_FROM_LIST } from "./builtin-math";

export function gLerp(a: Variant, b: Variant, w: Variant): Variant {
  const va4 = a.t === Tag.OBJECT && a.v instanceof GVector4 ? (a.v as GVector4) : null;
  const vb4 = b.t === Tag.OBJECT && b.v instanceof GVector4 ? (b.v as GVector4) : null;
  if (va4 !== null && vb4 !== null) {
    const t = weightToFloat(w);
    const mix = (x: number, y: number) => Math.fround(x + Math.fround((y - x) * Math.fround(t)));
    return V.object(new GVector4(mix(va4.x, vb4.x), mix(va4.y, vb4.y), mix(va4.z, vb4.z), mix(va4.w, vb4.w)));
  }
  if (a.t === Tag.OBJECT && a.v instanceof GVector4i) throw new GodotRuntimeError("utility-arg", LERP_FROM_LIST);
  const weight = weightToFloat(w);
  if (sameShape(a, b)) {
    const vec = sameTypeVectorMath("lerp", a, [b, V.float(weight)]);
    if (vec !== null) return vec;
  }
  const listName = a.t === Tag.OBJECT ? vecClassName(a.v as object) : null;
  const aName =
    a.t === Tag.OBJECT
      ? listName === "Vector2" || listName === "Vector3" || listName === "Vector4" || listName === "Color" ? listName : null
      : a.t === Tag.INT ? "int" : a.t === Tag.FLOAT ? "float" : a.t === Tag.BOOL ? "float" : null;
  if (aName === null) throw new GodotRuntimeError("utility-arg", LERP_FROM_LIST);
  if (a.t === Tag.INT || a.t === Tag.FLOAT || a.t === Tag.BOOL) {
    if (b.t !== Tag.INT && b.t !== Tag.FLOAT && b.t !== Tag.BOOL) throw utilConvertError("lerp", b, aName, 2);
    const x = num(a);
    return V.float(x + (num(b) - x) * weight + 0);
  }
  throw utilConvertError("lerp", b, aName, 2);
}

export function gInverseLerp(a: Variant, b: Variant, v: Variant): Variant {
  const aa = utilFloatArg(a, "inverse_lerp", 1);
  const bb = utilFloatArg(b, "inverse_lerp", 2);
  const vv = utilFloatArg(v, "inverse_lerp", 3);
  const den = bb - aa;
  if (den === 0) return V.float((vv - aa) / den);
  return V.float((vv - aa) / den + 0);
}

export function gMoveToward(from: Variant, to: Variant, delta: Variant): Variant {
  const a = utilFloatArg(from, "move_toward", 1);
  const b = utilFloatArg(to, "move_toward", 2);
  const d = utilFloatArg(delta, "move_toward", 3);
  if (Math.abs(b - a) <= d) return V.float(b + 0);
  return V.float(a + (b - a > 0 ? 1 : b - a < 0 ? -1 : 0) * d + 0);
}

/** `deg_to_rad(-0.0)` 与 `rad_to_deg(-0.0)` 实测都留号（乘法在 IEEE 里就把号带过去），所以不 `+ 0`。 */
export function gDegToRad(v: Variant): Variant {
  return V.float(utilFloatArg(v, "deg_to_rad", 1) * (PI_D / 180));
}

export function gRadToDeg(v: Variant): Variant {
  return V.float(utilFloatArg(v, "rad_to_deg", 1) * (180 / PI_D));
}

/** 式子是「取差 → 对 TAU 取余 → 折进 [-π, π]」：`angle_difference(6.0, 0.1)` = +0.38318530717959，反过来给负数。 */
export function gAngleDifference(from: Variant, to: Variant): Variant {
  return V.float(angleDiff(utilFloatArg(from, "angle_difference", 1), utilFloatArg(to, "angle_difference", 2)));
}

export function gSmoothstep(from: Variant, to: Variant, s: Variant): Variant {
  const a = utilFloatArg(from, "smoothstep", 1);
  const b = utilFloatArg(to, "smoothstep", 2);
  const x = utilFloatArg(s, "smoothstep", 3);
  if (approxEq(a, b)) return V.float((a <= b ? (x <= a ? 0.0 : 1.0) : x <= b ? 1.0 : 0.0) + 0);
  const y = Math.min(Math.max((x - a) / (b - a), 0.0), 1.0);
  return V.float(y * y * (3.0 - 2.0 * y) + 0);
}

export function gEase(delta: Variant, curve: Variant): Variant {
  const c = Math.fround(utilFloatArg(curve, "ease", 2));
  let x = Math.fround(utilFloatArg(delta, "ease", 1));
  if (x < 0) x = 0;
  else if (x > 1.0) x = 1.0;
  if (c > 0) {
    if (c < 1.0) return V.float(1.0 - Math.pow(1.0 - x, 1.0 / c) + 0);
    return V.float(Math.pow(x, c) + 0);
  }
  if (c < 0) {
    if (x < 0.5) return V.float(Math.pow(x * 2.0, -c) * 0.5 + 0);
    return V.float((1.0 - Math.pow(1.0 - (x - 0.5) * 2.0, -c)) * 0.5 + 0.5 + 0);
  }
  return V.float(0.0);
}

export function gCubic(from: Variant, to: Variant, pre: Variant, after: Variant, w: Variant): Variant {
  const p0 = utilFloatArg(from, "cubic_interpolate", 1);
  const p1 = utilFloatArg(to, "cubic_interpolate", 2);
  const p2 = utilFloatArg(pre, "cubic_interpolate", 3);
  const p3 = utilFloatArg(after, "cubic_interpolate", 4);
  const t = utilFloatArg(w, "cubic_interpolate", 5);
  return V.float(cubicNum(p0, p1, p2, p3, t) + 0);
}

export function gRemap(v: Variant, fl0: Variant, fh: Variant, tl: Variant, th: Variant): Variant {
  utilFloatArg(v, "remap", 1);
  utilFloatArg(fl0, "remap", 2);
  utilFloatArg(fh, "remap", 3);
  const a = utilFloatArg(tl, "remap", 4);
  const b = utilFloatArg(th, "remap", 5);
  const t = gInverseLerp(fl0, fh, v).v as number;
  return V.float(a + (b - a) * t + 0);
}

export function gExp(v: Variant): Variant {
  return V.float(Math.exp(utilFloatArg(v, "exp", 1)) + 0);
}

export function gLog(v: Variant): Variant {
  return V.float(Math.log(utilFloatArg(v, "log", 1)) + 0);
}

export function gPow(a: Variant, b: Variant): Variant {
  return V.float(Math.pow(utilFloatArg(a, "pow", 1), utilFloatArg(b, "pow", 2)) + 0);
}

export function gSqrt(v: Variant): Variant {
  return V.float(Math.sqrt(utilFloatArg(v, "sqrt", 1)));
}

const SIN_LIMIT = 1e6;

const COS_LIMIT = 1e5;

const HALF_PI = Math.PI / 2;

export function trig(name: string, v: Variant, f: (x: number) => number, limit: number | null): Variant {
  const x = utilFloatArg(v, name, 1);
  if (limit !== null && Number.isFinite(x) && Math.abs(x) > limit) {
    throw new UnsupportedError("trig-large-arg", `${name}() 收到 ${show(V.float(x))}：|x| 超过实测的 ${String(limit)}，引擎那侧的归约从这一档开始丢有效位（没量过的不发）`);
  }
  return V.float(f(x));
}

export const gSin = (v: Variant): Variant => trig("sin", v, Math.sin, SIN_LIMIT);

export const gCos = (v: Variant): Variant => trig("cos", v, Math.cos, COS_LIMIT);

export const gTan = (v: Variant): Variant => trig("tan", v, Math.tan, null);

export const gAtan = (v: Variant): Variant => trig("atan", v, Math.atan, null);

export const gSinh = (v: Variant): Variant => trig("sinh", v, Math.sinh, null);

export const gCosh = (v: Variant): Variant => trig("cosh", v, Math.cosh, null);

export const gTanh = (v: Variant): Variant => trig("tanh", v, Math.tanh, null);

export const gAsinh = (v: Variant): Variant => trig("asinh", v, Math.asinh, null);

/** `asin` / `acos` / `acosh` / `atanh` 引擎都先夹再算（`core/math/math_funcs.h` 那四行「Always does clamping」+ 实测 k04–k08 / j.log / e.log），夹出来的是常量。 */
export function gAsin(v: Variant): Variant {
  const x = utilFloatArg(v, "asin", 1);
  if (x < -1) return V.float(-HALF_PI);
  if (x > 1) return V.float(HALF_PI);
  return V.float(Math.asin(x));
}

export function gAcos(v: Variant): Variant {
  const x = utilFloatArg(v, "acos", 1);
  if (x < -1) return V.float(Math.PI);
  if (x > 1) return V.float(0);
  return V.float(Math.acos(x));
}

export function gAcosh(v: Variant): Variant {
  const x = utilFloatArg(v, "acosh", 1);
  if (x < 1) return V.float(0);
  return V.float(Math.acosh(x));
}

export function gAtanh(v: Variant): Variant {
  const x = utilFloatArg(v, "atanh", 1);
  if (x <= -1) return V.float(-Infinity);
  if (x >= 1) return V.float(Infinity);
  return V.float(Math.atanh(x));
}

export function gAtan2(y: Variant, x: Variant): Variant {
  return V.float(Math.atan2(utilFloatArg(y, "atan2", 1), utilFloatArg(x, "atan2", 2)));
}

const DB_TO_LINEAR_K = 0.11512925464970228420089957273422;

const LINEAR_TO_DB_K = 8.6858896380650365530225783783321;

export function gDbToLinear(v: Variant): Variant {
  return V.float(Math.exp(utilFloatArg(v, "db_to_linear", 1) * DB_TO_LINEAR_K) + 0);
}

export function gLinearToDb(v: Variant): Variant {
  return V.float(Math.log(utilFloatArg(v, "linear_to_db", 1)) * LINEAR_TO_DB_K);
}

export function gPingpong(v: Variant, length: Variant): Variant {
  const value = utilFloatArg(v, "pingpong", 1);
  const l = utilFloatArg(length, "pingpong", 2);
  if (l === 0) return V.float(0);
  const x = (value - l) / (l * 2);
  return V.float(Math.abs((x - Math.floor(x)) * l * 2 - l) + 0);
}

/** 引擎那句 `fmod(2*fmod(to-from, TAU), TAU)` 折出来的最短弧（实测 q01–q03：正好 ±π 才翻，差 1e-9 都不翻）。 */
function angleDiff(from: number, to: number): number {
  const d = (to - from) % TAU_D;
  return ((2 * d) % TAU_D - d) + 0;
}

export function gLerpAngle(from: Variant, to: Variant, w: Variant): Variant {
  const a = utilFloatArg(from, "lerp_angle", 1);
  return V.float(a + angleDiff(a, utilFloatArg(to, "lerp_angle", 2)) * utilFloatArg(w, "lerp_angle", 3) + 0);
}

export function gRotateToward(from: Variant, to: Variant, delta: Variant): Variant {
  const a = utilFloatArg(from, "rotate_toward", 1);
  const diff = angleDiff(a, utilFloatArg(to, "rotate_toward", 2));
  const absDiff = Math.abs(diff);
  const d = Math.min(Math.max(utilFloatArg(delta, "rotate_toward", 3), absDiff - PI_D), absDiff);
  return V.float(a + d * (diff >= 0 ? 1 : -1) + 0);
}

export function gBezierInterpolate(s1: Variant, c1: Variant, c2: Variant, e: Variant, t: Variant): Variant {
  const p = utilFloatArg(s1, "bezier_interpolate", 1);
  const a = utilFloatArg(c1, "bezier_interpolate", 2);
  const b = utilFloatArg(c2, "bezier_interpolate", 3);
  const q = utilFloatArg(e, "bezier_interpolate", 4);
  const w = utilFloatArg(t, "bezier_interpolate", 5);
  const omt = 1 - w;
  const omt2 = omt * omt;
  const omt3 = omt2 * omt;
  const t2 = w * w;
  const t3 = t2 * w;
  return V.float(p * omt3 + a * omt2 * w * 3 + b * omt * t2 * 3 + q * t3 + 0);
}

export function gBezierDerivative(s1: Variant, c1: Variant, c2: Variant, e: Variant, t: Variant): Variant {
  const p = utilFloatArg(s1, "bezier_derivative", 1);
  const a = utilFloatArg(c1, "bezier_derivative", 2);
  const b = utilFloatArg(c2, "bezier_derivative", 3);
  const q = utilFloatArg(e, "bezier_derivative", 4);
  const w = utilFloatArg(t, "bezier_derivative", 5);
  const omt = 1 - w;
  const omt2 = omt * omt;
  const t2 = w * w;
  return V.float((a - p) * 3 * omt2 + (b - a) * 6 * omt * w + (q - b) * 3 * t2 + 0);
}

function angleRots(from: number, to: number, pre: number, post: number): [number, number, number, number] {
  const fromRot = from % TAU_D;
  const preDiff = (pre - fromRot) % TAU_D;
  const preRot = fromRot + ((2 * preDiff) % TAU_D) - preDiff;
  const toDiff = (to - fromRot) % TAU_D;
  const toRot = fromRot + ((2 * toDiff) % TAU_D) - toDiff;
  const postDiff = (post - toRot) % TAU_D;
  const postRot = toRot + ((2 * postDiff) % TAU_D) - postDiff;
  return [fromRot, toRot, preRot, postRot];
}

function cubicNum(from: number, to: number, pre: number, post: number, t: number): number {
  const t2 = t * t;
  return 0.5 * (from * 2 + (to - pre) * t + (pre * 2 - from * 5 + to * 4 - post) * t2 + (pre * -1 + from * 3 - to * 3 + post) * (t2 * t));
}

function lerpNum(a: number, b: number, w: number): number {
  return a + (b - a) * w;
}

function cubicInTimeNum(from: number, to: number, pre: number, post: number, w: number, toT: number, preT: number, postT: number): number {
  const t = lerpNum(0, toT, w);
  const a1 = lerpNum(pre, from, preT === 0 ? 0 : (t - preT) / -preT);
  const a2 = lerpNum(from, to, toT === 0 ? 0.5 : t / toT);
  const a3 = lerpNum(to, post, postT - toT === 0 ? 1 : (t - toT) / (postT - toT));
  const b1 = lerpNum(a1, a2, toT - preT === 0 ? 0 : (t - preT) / (toT - preT));
  const b2 = lerpNum(a2, a3, postT === 0 ? 1 : t / postT);
  return lerpNum(b1, b2, toT === 0 ? 0.5 : t / toT);
}

export function gCubicAngle(from: Variant, to: Variant, pre: Variant, post: Variant, w: Variant): Variant {
  const a = utilFloatArg(from, "cubic_interpolate_angle", 1);
  const r = angleRots(a, utilFloatArg(to, "cubic_interpolate_angle", 2), utilFloatArg(pre, "cubic_interpolate_angle", 3), utilFloatArg(post, "cubic_interpolate_angle", 4));
  return V.float(cubicNum(r[0], r[1], r[2], r[3], utilFloatArg(w, "cubic_interpolate_angle", 5)) + 0);
}

export function gCubicInTime(from: Variant, to: Variant, pre: Variant, post: Variant, w: Variant, toT: Variant, preT: Variant, postT: Variant): Variant {
  return V.float(cubicInTimeNum(
    utilFloatArg(from, "cubic_interpolate_in_time", 1), utilFloatArg(to, "cubic_interpolate_in_time", 2),
    utilFloatArg(pre, "cubic_interpolate_in_time", 3), utilFloatArg(post, "cubic_interpolate_in_time", 4),
    utilFloatArg(w, "cubic_interpolate_in_time", 5), utilFloatArg(toT, "cubic_interpolate_in_time", 6),
    utilFloatArg(preT, "cubic_interpolate_in_time", 7), utilFloatArg(postT, "cubic_interpolate_in_time", 8)) + 0);
}

export function gCubicAngleInTime(from: Variant, to: Variant, pre: Variant, post: Variant, w: Variant, toT: Variant, preT: Variant, postT: Variant): Variant {
  const a = utilFloatArg(from, "cubic_interpolate_angle_in_time", 1);
  const r = angleRots(a, utilFloatArg(to, "cubic_interpolate_angle_in_time", 2), utilFloatArg(pre, "cubic_interpolate_angle_in_time", 3), utilFloatArg(post, "cubic_interpolate_angle_in_time", 4));
  return V.float(cubicInTimeNum(r[0], r[1], r[2], r[3],
    utilFloatArg(w, "cubic_interpolate_angle_in_time", 5), utilFloatArg(toT, "cubic_interpolate_angle_in_time", 6),
    utilFloatArg(preT, "cubic_interpolate_angle_in_time", 7), utilFloatArg(postT, "cubic_interpolate_angle_in_time", 8)) + 0);
}
