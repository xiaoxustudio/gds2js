import { GodotRuntimeError, UnsupportedError } from "../errors";
import { Tag, V, intToNum, wrap64, tagName, type IntPayload, type Variant } from "../tags";
import { INT64_MIN } from "../numstr";
import { intArgBig, valueTypeName } from "../string-ops";
import { GBytes, packTypeName } from "../class/bytes/packed";
import { GVector2 } from "../class/vector/vector2";
import { GVector2i } from "../class/vector/vector2i";
import { GVector3 } from "../class/vector/vector3";
import { GVector3i } from "../class/vector/vector3i";
import { GVector4, vector4Method, vec4Cmp } from "../class/vector/vector4";
import { GVector4i, vector4iMethod } from "../class/vector/vector4i";
import { GColor } from "../class/color/color";
import { utilityArgLabel } from "./ops";
import { CMP_EPSILON, MASK64, approxEq, fl, intOf, isInt, num, numOrVectorArg, one, or, sameTypeVectorMath, utilConvertError, utilFloatArg, utilIntArg, vec4UtilityGuard, vecClassName, vecComponents3, vectorMath, vi } from "./args";
import { range } from "./array";

const INT_MIN_F = -9223372036854775808;

/** 实测 `round` 是**远离零**（`round(2.5)`=3、`round(-2.5)`=-3、`round(-3.5)`=-4），JS 原生对负半数会差一格。 */
function gdRound(x: number): number {
  return x >= 0 ? Math.floor(x + 0.5) : Math.ceil(x - 0.5);
}

export function gSign(v: Variant): Variant {
  const vec = vectorMath(v, "sign");
  if (vec !== null) return vec;
  if (isInt(v)) return vi(one(intToNum(v.v as IntPayload)));
  return V.float(one(numOrVectorArg(v, "sign")) + 0);
}

export function gSignI(v: Variant): Variant {
  utilIntArg(v, "signi", 1);
  return vi(one(intOf(v)));
}

export function gSignF(v: Variant): Variant {
  return V.float(one(utilFloatArg(v, "signf", 1)) + 0);
}

type RoundMode = "auto" | "float" | "int";

function roundThree(x: number, fn: (n: number) => number, mode: RoundMode): Variant {
  if (mode === "int") {
    if (!Number.isFinite(x)) return V.int(INT64_MIN);
    return vi(fn(x));
  }
  if (mode === "float") return V.float(fn(x));
  return V.float(fn(x));
}

function intPassthrough(v: Variant, mode: RoundMode): Variant | null {
  if (!isInt(v)) return null;
  const x = intToNum(v.v as IntPayload);
  if (mode === "auto") return v;
  if (mode === "int") return vi(x);
  return V.float(x + 0);
}

export function gFloor(v: Variant, mode: RoundMode = "auto"): Variant {
  const pas = intPassthrough(v, mode);
  if (pas !== null) return pas;
  if (mode === "auto") {
    const vec = vectorMath(v, "floor");
    if (vec !== null) return vec;
  }
  return roundThree(mode === "auto" ? numOrVectorArg(v, "floor") : utilFloatArg(v, mode === "float" ? "floorf" : "floori", 1), Math.floor, mode);
}

export function gCeil(v: Variant, mode: RoundMode = "auto"): Variant {
  const pas = intPassthrough(v, mode);
  if (pas !== null) return pas;
  if (mode === "auto") {
    const vec = vectorMath(v, "ceil");
    if (vec !== null) return vec;
  }
  return roundThree(mode === "auto" ? numOrVectorArg(v, "ceil") : utilFloatArg(v, mode === "float" ? "ceilf" : "ceili", 1), Math.ceil, mode);
}

export function gRound(v: Variant, mode: RoundMode = "auto"): Variant {
  const pas = intPassthrough(v, mode);
  if (pas !== null) return pas;
  if (mode === "auto") {
    const vec = vectorMath(v, "round");
    if (vec !== null) return vec;
  }
  return roundThree(mode === "auto" ? numOrVectorArg(v, "round") : utilFloatArg(v, mode === "float" ? "roundf" : "roundi", 1), (x: number): number => (x === 0 ? x : gdRound(x)), mode);
}

function floorDiv(a: number, b: number): number {
  return Math.floor(a / b);
}

export function gPosmod(x: Variant, y: Variant): Variant {
  utilIntArg(x, "posmod", 1);
  utilIntArg(y, "posmod", 2);
  const a = intOf(x);
  const b = intOf(y);
  if (b === 0) return vi(0);
  return vi(a - b * floorDiv(a, b));
}

export function gFposmod(x: Variant, y: Variant): Variant {
  const a = utilFloatArg(x, "fposmod", 1);
  const b = utilFloatArg(y, "fposmod", 2);
  let v = a % b;
  if ((v < 0 && b > 0) || (v > 0 && b < 0)) v += b;
  return V.float(v + 0);
}

/** `fmod(-0.0, 1.0)` 实测留号（C 的 `fmod` 就是把被除数的号带下来），所以不 `+ 0`。 */
export function gFmod(x: Variant, y: Variant): Variant {
  return V.float(utilFloatArg(x, "fmod", 1) % utilFloatArg(y, "fmod", 2));
}

export function gWrap(v: Variant, lo: Variant, hi: Variant, asInt: boolean): Variant {
  if (asInt) {
    utilIntArg(v, "wrapi", 1);
    utilIntArg(lo, "wrapi", 2);
    utilIntArg(hi, "wrapi", 3);
  }
  if (!asInt) {
    const mn = utilFloatArg(lo, "wrapf", 2);
    const mx = utilFloatArg(hi, "wrapf", 3);
    const x = utilFloatArg(v, "wrapf", 1);
    const range = mx - mn;
    if (Math.abs(range) < CMP_EPSILON) return V.float(mn + 0);
    const result = x - range * Math.floor((x - mn) / range);
    return V.float((approxEq(result, mx) ? mn : result) + 0);
  }
  const mn0 = intOf(lo);
  const mx0 = intOf(hi);
  const a = intOf(v);
  const [mn, mx] = mn0 > mx0 ? [mx0, mn0] : [mn0, mx0];
  const range = mx - mn;
  if (range === 0) return vi(mn);
  const inside = a - mn;
  const r = inside - range * floorDiv(inside, range);
  return vi(mn + r);
}

export const LERP_FROM_LIST = 'Error calling utility function "lerp()": Argument "from" must be "int", "float", "Vector2", "Vector3", "Vector4", "Color", "Quaternion", "Basis", "Transform2D", or "Transform3D".';

const SNAPPED_X_LIST = 'Error calling utility function "snapped()": Argument "x" must be "int", "float", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", or "Vector4i".';

const SNAPPED_STEP_MUST = 'Error calling utility function "snapped()": Argument "step" must be "int" or "float".';

export function gSnapped(x: Variant, step: Variant): Variant {
  const sx4 = x.t === Tag.OBJECT && x.v instanceof GVector4 ? (x.v as GVector4) : null;
  const st4 = step.t === Tag.OBJECT && step.v instanceof GVector4 ? (step.v as GVector4) : null;
  if (sx4 !== null && st4 !== null) return vector4Method(sx4, "snapped", [step]);
  const sx4i = x.t === Tag.OBJECT && x.v instanceof GVector4i ? (x.v as GVector4i) : null;
  const st4i = step.t === Tag.OBJECT && step.v instanceof GVector4i ? (step.v as GVector4i) : null;
  if (sx4i !== null && st4i !== null) return vector4iMethod(sx4i, "snapped", [step]);
  if (sx4 !== null) throw utilConvertError("snapped", step, "Vector4", 2);
  if (sx4i !== null) throw utilConvertError("snapped", step, "Vector4i", 2);
  vec4UtilityGuard(x, "snapped");
  vec4UtilityGuard(step, "snapped");
  const xName = x.t === Tag.OBJECT ? vecClassName(x.v as object) : null;
  if (xName !== null && xName !== "Color") {
    if (step.t === Tag.OBJECT && vecClassName(step.v as object) === xName) {
      const vec = sameTypeVectorMath("snapped", x, [step]);
      if (vec !== null) return vec;
    }
    throw utilConvertError("snapped", step, xName, 2);
  }
  if (!(x.t === Tag.INT || x.t === Tag.FLOAT || x.t === Tag.BOOL)) throw new GodotRuntimeError("utility-arg", SNAPPED_X_LIST);
  if (!(step.t === Tag.INT || step.t === Tag.FLOAT || step.t === Tag.BOOL)) throw new GodotRuntimeError("utility-arg", SNAPPED_STEP_MUST);
  const s = num(step);
  const a = num(x);
  if (isInt(step)) {
    if (s === 0) return vi(intOf(x));
    return vi(Math.trunc(Math.floor(a / s + 0.5) * s));
  }
  if (s === 0) return V.float(a + 0);
  return V.float(Math.floor(a / s + 0.5) * s + 0);
}

export function gSnappedF(x: Variant, step: Variant): Variant {
  const a = fl(x);
  const s = fl(step);
  if (s === 0) return V.float(a + 0);
  return V.float(Math.floor(a / s + 0.5) * s + 0);
}

export function gSnappedI(x: Variant, step: Variant): Variant {
  const a = fl(x);
  const s = fl(step);
  if (s === 0) return vi(Math.trunc(a));
  return vi(Math.trunc(Math.floor(a / s + 0.5) * s));
}

export function gIsEqualApprox(a: Variant, b: Variant): Variant {
  const x = utilFloatArg(a, "is_equal_approx", 1);
  const y = utilFloatArg(b, "is_equal_approx", 2);
  return V.bool(approxEq(x, y));
}

export function gIsZeroApprox(v: Variant): Variant {
  const x = utilFloatArg(v, "is_zero_approx", 1);
  return V.bool(Number.isFinite(x) && Math.abs(x) < 1e-5);
}

export function gIsNan(v: Variant): Variant {
  return V.bool(Number.isNaN(utilFloatArg(v, "is_nan", 1)));
}

export function gIsInf(v: Variant): Variant {
  const x = utilFloatArg(v, "is_inf", 1);
  return V.bool(x === Infinity || x === -Infinity);
}

export function gIsFinite(v: Variant): Variant {
  return V.bool(Number.isFinite(utilFloatArg(v, "is_finite", 1)));
}

function maxMinFloat(xs: Variant[], i: number, who: string): number {
  const v = xs[i] as Variant;
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
    throw new GodotRuntimeError(
      `${who}-arg`,
      `Invalid type in utility function "${who}()". Cannot convert argument ${String(i + 1)} from ${utilityArgLabel(v)} to float.`,
    );
  }
  return fl(v);
}

export function gMin(...xs: Variant[]): Variant {
  let best = xs[0] as Variant;
  let bestN = maxMinFloat(xs, 0, "min");
  for (let i = 1; i < xs.length; i++) {
    const x = maxMinFloat(xs, i, "min");
    if (bestN > x) {
      best = xs[i] as Variant;
      bestN = x;
    }
  }
  return best;
}

export function gMax(...xs: Variant[]): Variant {
  let best = xs[0] as Variant;
  let bestN = maxMinFloat(xs, 0, "max");
  for (let i = 1; i < xs.length; i++) {
    const x = maxMinFloat(xs, i, "max");
    if (bestN < x) {
      best = xs[i] as Variant;
      bestN = x;
    }
  }
  return best;
}

export function gMinI(a: Variant, b: Variant): Variant {
  utilIntArg(a, "mini", 1);
  utilIntArg(b, "mini", 2);
  const x = intOf(a);
  const y = intOf(b);
  return vi(x > y ? y : x);
}

export function gMaxI(a: Variant, b: Variant): Variant {
  utilIntArg(a, "maxi", 1);
  utilIntArg(b, "maxi", 2);
  const x = intOf(a);
  const y = intOf(b);
  return vi(x < y ? y : x);
}

export function gMinF(a: Variant, b: Variant): Variant {
  return V.float(Math.min(utilFloatArg(a, "minf", 1), utilFloatArg(b, "minf", 2)) + 0);
}

export function gMaxF(a: Variant, b: Variant): Variant {
  return V.float(Math.max(utilFloatArg(a, "maxf", 1), utilFloatArg(b, "maxf", 2)) + 0);
}

export function need2(a: Variant, b: Variant, who: string): void {
  if ((a.t !== Tag.INT && a.t !== Tag.FLOAT) || (b.t !== Tag.INT && b.t !== Tag.FLOAT)) {
    throw new UnsupportedError("math-number", `${who}() 的两个实参都要数值（收到 ${tagName(a.t)} 与 ${tagName(b.t)}）`);
  }
}

function clampTargetName(x: Variant): string {
  if (x.t === Tag.INT) return "int";
  if (x.t === Tag.FLOAT) return "float";
  if (x.t === Tag.BOOL) return "bool";
  if (x.t === Tag.STRING) return "String";
  if (x.t === Tag.STRING_NAME) return "StringName";
  if (x.t === Tag.ARRAY) return "Array";
  if (x.t === Tag.DICT) return "Dictionary";
  if (x.t === Tag.OBJECT) {
    const n = vecClassName(x.v as object);
    if (n !== null) return n;
    if (x.v instanceof GBytes) return packTypeName((x.v as GBytes).kind);
  }
  return valueTypeName(x);
}

function clampAccepts(target: string, y: Variant): boolean {
  if (target === "int" || target === "float") return y.t === Tag.INT || y.t === Tag.FLOAT;
  if (target === "Vector2") return y.t === Tag.OBJECT && y.v instanceof GVector2;
  if (target === "Vector2i") return y.t === Tag.OBJECT && y.v instanceof GVector2i;
  if (target === "Vector3") return y.t === Tag.OBJECT && y.v instanceof GVector3;
  if (target === "Vector3i") return y.t === Tag.OBJECT && y.v instanceof GVector3i;
  if (target === "Color") return y.t === Tag.OBJECT && y.v instanceof GColor;
  if (target === "bool") return y.t === Tag.BOOL;
  if (target === "String") return y.t === Tag.STRING;
  if (target === "StringName") return y.t === Tag.STRING_NAME;
  if (target === "Array") return y.t === Tag.ARRAY;
  if (target === "Dictionary") return y.t === Tag.DICT;
  return valueTypeName(y) === target;
}

export function gClamp(v: Variant, lo: Variant, hi: Variant, mode: RoundMode = "auto"): Variant {
  if (mode === "auto") {
    const target = clampTargetName(v);
    if (!clampAccepts(target, lo)) throw utilConvertError("clamp", lo, target, 2);
    if (!clampAccepts(target, hi)) throw utilConvertError("clamp", hi, target, 3);
  }
  if (mode === "auto" && v.t === Tag.BOOL && lo.t === Tag.BOOL && hi.t === Tag.BOOL) {
    return V.bool(((v.v as boolean) || (lo.v as boolean)) && (hi.v as boolean));
  }
  if (mode === "auto" && v.t === Tag.OBJECT && lo.t === Tag.OBJECT && hi.t === Tag.OBJECT) {
    const g4 = v.v;
    const l4 = lo.v;
    const h4 = hi.v;
    if (g4 instanceof GVector4 && l4 instanceof GVector4 && h4 instanceof GVector4) {
      if (vec4Cmp(g4, l4) < 0) return lo;
      if (vec4Cmp(g4, h4) > 0) return hi;
      return v;
    }
    if (g4 instanceof GVector4i && l4 instanceof GVector4i && h4 instanceof GVector4i) {
      if (vec4Cmp(g4, l4) < 0) return lo;
      if (vec4Cmp(g4, h4) > 0) return hi;
      return v;
    }
  }
  if (mode === "auto" && v.t === Tag.OBJECT && lo.t === Tag.OBJECT && hi.t === Tag.OBJECT) {
    const a = v.v as object;
    const b = lo.v as object;
    const c = hi.v as object;
    const av = vecComponents3(a);
    const bv = vecComponents3(b);
    const cv = vecComponents3(c);
    if (av !== null && bv !== null && cv !== null &&
        Object.getPrototypeOf(a) === Object.getPrototypeOf(b) && Object.getPrototypeOf(a) === Object.getPrototypeOf(c)) {
      const cmp = (x: readonly number[], y: readonly number[]): number => {
        for (let i = 0; i < x.length; i++) {
          const d = x[i]! - y[i]!;
          if (d !== 0) return d;
        }
        return 0;
      };
      if (cmp(av, bv) < 0) return lo;
      if (cmp(av, cv) > 0) return hi;
      return v;
    }
  }
  if (mode === "float") {
    utilFloatArg(v, "clampf", 1);
    utilFloatArg(lo, "clampf", 2);
    utilFloatArg(hi, "clampf", 3);
  } else if (mode === "int") {
    utilIntArg(v, "clampi", 1);
    utilIntArg(lo, "clampi", 2);
    utilIntArg(hi, "clampi", 3);
  }
  need2(v, lo, "clamp");
  need2(v, hi, "clamp");
  const x = mode === "int" ? intOf(v) : fl(v);
  const mn = mode === "int" ? intOf(lo) : fl(lo);
  const mx = mode === "int" ? intOf(hi) : fl(hi);
  const win = x > mx ? hi : x < mn ? lo : v;
  if (mode === "int") return vi(intOf(win));
  if (mode === "float") return V.float(fl(win));
  if (mode === "auto" && !(x <= x)) return V.float(x);
  return win;
}

const STEP_THRESHOLDS = [0.9999, 0.09999, 0.009999, 0.0009999, 0.00009999, 0.000009999, 0.0000009999, 0.00000009999, 0.000000009999, 0.0000000009999];

export function gStepDecimals(v: Variant): Variant {
  const x = Math.abs(Math.fround(utilFloatArg(v, "step_decimals", 1)));
  const decs = x - Math.trunc(x);
  let i = 0;
  for (const t of STEP_THRESHOLDS) {
    if (decs >= t) return V.int(i);
    i++;
  }
  return V.int(0);
}

export function gNearestPo2(v: Variant): Variant {
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT && v.t !== Tag.BOOL) {
    throw new GodotRuntimeError("utility-convert", `Invalid type in utility function "nearest_po2()". Cannot convert argument 1 from ${valueTypeName(v)} to int.`);
  }
  let u = intArgBig(v, "nearest_po2() 的参数") & MASK64;
  u = (u - 1n) & MASK64;
  for (const s of [1, 2, 4, 8, 16, 32]) u = (u | (u >> BigInt(s))) & MASK64;
  return V.int(wrap64((u + 1n) & MASK64));
}

/** `absf` / `absi`：实测只吃 INT / FLOAT / BOOL（String、StringName、Nil、Array、Vector2 那一格引擎报 Invalid type 并掐掉本次调用，实测 f01–f12）。 */
export function gAbsF(v: Variant): Variant {
  return V.float(Math.abs(utilFloatArg(v, "absf", 1)) + 0);
}

export function gAbsI(v: Variant): Variant {
  utilIntArg(v, "absi", 1);
  const x = intArgBig(v, "absi() 的参数");
  return V.int(x < 0n ? wrap64(-x) : x);
}

export function gWrapAny(v: Variant, lo: Variant, hi: Variant): Variant {
  utilFloatArg(v, "wrap", 1);
  utilIntArg(lo, "wrap", 2);
  utilIntArg(hi, "wrap", 3);
  return gWrap(v, lo, hi, v.t === Tag.INT && lo.t === Tag.INT && hi.t === Tag.INT);
}
