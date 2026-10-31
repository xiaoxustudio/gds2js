import { GodotRuntimeError, UnsupportedError } from "../errors";
import { Tag, V, intToBig, intToNum, wrap64, tagName, type IntPayload, type Variant } from "../tags";
import { strToFloat } from "../numstr";
import { truthyOf } from "../values";
import { valueTypeName } from "../string-ops";
import { GVector2, vector2Method } from "../class/vector/vector2";
import { GVector2i, vector2i, vector2iMethod } from "../class/vector/vector2i";
import { GVector3, vector3Method } from "../class/vector/vector3";
import { GVector3i, vector3i, vector3iMethod } from "../class/vector/vector3i";
import { GVector4, vector4, vector4Method } from "../class/vector/vector4";
import { GVector4i, vector4i, vector4iMethod } from "../class/vector/vector4i";
import { GColor, colorMethod } from "../class/color/color";

export function num(v: Variant): number {
  if (v.t === Tag.BOOL) return (v.v as boolean) ? 1 : 0;
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
    throw new UnsupportedError("not-number", `需要数值，收到类型 ${v.t}`);
  }
  return v.t === Tag.INT ? intToNum(v.v as IntPayload) : (v.v as number);
}

export function utilFloatArg(v: Variant, fn: string, n: number): number {
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT && v.t !== Tag.BOOL) {
    throw new GodotRuntimeError("utility-convert", `Invalid type in utility function "${fn}()". Cannot convert argument ${n} from ${valueTypeName(v)} to float.`);
  }
  return num(v);
}

export function utilIntArg(v: Variant, fn: string, n: number): number {
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT && v.t !== Tag.BOOL) {
    throw new GodotRuntimeError("utility-convert", `Invalid type in utility function "${fn}()". Cannot convert argument ${n} from ${valueTypeName(v)} to int.`);
  }
  return Math.trunc(num(v));
}

export function numOrVectorArg(v: Variant, fn: string): number {
  vec4UtilityGuard(v, fn);
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT && v.t !== Tag.BOOL) {
    throw new GodotRuntimeError("utility-arg", `Error calling utility function "${fn}()": Argument "x" must be "int", "float", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", or "Vector4i".`);
  }
  return num(v);
}

export function vec4UtilityGuard(v: Variant, fn: string): void {
  if (v.t === Tag.OBJECT && (v.v instanceof GVector4 || v.v instanceof GVector4i)) {
    throw new UnsupportedError("utility-vector4", `${fn}() 在 Vector4 / Vector4i 上的语义没实测过（S580 只到核心值类型）`);
  }
}

export const MASK64 = (1n << 64n) - 1n;

export function sqrt(v: Variant): Variant {
  return V.float(Math.sqrt(utilFloatArg(v, "sqrt", 1)));
}

export function abs(v: Variant): Variant {
  if (v.t === Tag.INT) {
    const x = intToBig(v.v as IntPayload);
    return V.int(x < 0n ? wrap64(-x) : x);
  }
  const vec = vectorMath(v, "abs");
  if (vec !== null) return vec;
  return V.float(Math.abs(numOrVectorArg(v, "abs")) + 0);
}

export function vi(n: number): Variant {
  const v = Object.is(n, -0) ? 0 : n;
  return Number.isSafeInteger(v) ? V.int(v) : V.int(BigInt(Math.trunc(v)));
}

export function isInt(v: Variant): boolean {
  return v.t === Tag.INT;
}

function mathNum(v: Variant): number {
  if (v.t === Tag.FLOAT) return v.v as number;
  if (v.t === Tag.INT) return intToNum(v.v as IntPayload);
  if (v.t === Tag.BOOL) return v.v ? 1 : 0;
  throw new UnsupportedError("not-number", `需要 int / float / bool，收到类型 ${v.t}`);
}

export function fl(v: Variant): number {
  return mathNum(v);
}

export function intOf(v: Variant): number {
  return Math.trunc(mathNum(v));
}

export function one(x: number): number {
  return Number.isNaN(x) ? 0 : x > 0 ? 1 : x < 0 ? -1 : 0;
}

export function vectorMath(v: Variant, name: "abs" | "floor" | "ceil" | "round" | "sign"): Variant | null {
  if (v.t !== Tag.OBJECT) return null;
  const o = v.v;
  if (o instanceof GVector2) return vector2Method(o, name, []);
  if (o instanceof GVector3) return vector3Method(o, name, []);
  if (o instanceof GVector4) return vector4Method(o, name, []);
  if (o instanceof GVector4i) return name === "abs" || name === "sign" ? vector4iMethod(o, name, []) : vector4i(o.x, o.y, o.z, o.w);
  if (o instanceof GVector2i) return name === "abs" || name === "sign" ? vector2iMethod(o, name, []) : vector2i(o.x, o.y);
  if (o instanceof GVector3i) return name === "abs" || name === "sign" ? vector3iMethod(o, name, []) : vector3i(o.x, o.y, o.z);
  return null;
}

/** 值类型的引擎型名（`snapped` / `lerp` 的「跟第一参走」句要用）。 */
export function vecClassName(o: object): string | null {
  if (o instanceof GVector2) return "Vector2";
  if (o instanceof GVector3) return "Vector3";
  if (o instanceof GVector2i) return "Vector2i";
  if (o instanceof GVector3i) return "Vector3i";
  if (o instanceof GVector4) return "Vector4";
  if (o instanceof GVector4i) return "Vector4i";
  if (o instanceof GColor) return "Color";
  return null;
}

export function utilConvertError(fn: string, src: Variant, target: string, argNo: number): GodotRuntimeError {
  return new GodotRuntimeError("utility-convert", `Invalid type in utility function "${fn}()". Cannot convert argument ${argNo} from ${valueTypeName(src)} to ${target}.`);
}

export function weightToFloat(w: Variant): number {
  if (w.t === Tag.INT) {
    const n = intToNum(w.v as IntPayload);
    return typeof n === "bigint" ? Number(n) : n;
  }
  if (w.t === Tag.FLOAT) return w.v as number;
  if (w.t === Tag.BOOL) return w.v ? 1 : 0;
  if (w.t === Tag.STRING) return strToFloat(w.v as string);
  return 0;
}

/** 同型向量的分量数组（`clamp` 的字典序比较用）：V2 / V2i 取 2 个、V3 / V3i 取 3 个，其余给 null。 */
export function vecComponents3(o: object): number[] | null {
  if (o instanceof GVector2) return [o.x, o.y];
  if (o instanceof GVector3) return [o.x, o.y, o.z];
  if (o instanceof GVector2i) return [o.x, o.y];
  if (o instanceof GVector3i) return [o.x, o.y, o.z];
  return null;
}

export function sameTypeVectorMath(name: "snapped" | "lerp", a: Variant, args: Variant[]): Variant | null {
  if (a.t !== Tag.OBJECT) return null;
  const o = a.v;
  if (o instanceof GVector2) return vector2Method(o, name, args);
  if (o instanceof GVector3) return vector3Method(o, name, args);
  if (name === "snapped" && o instanceof GVector2i) return vector2iMethod(o, "snapped", args);
  if (name === "snapped" && o instanceof GVector3i) return vector3iMethod(o, "snapped", args);
  if (o instanceof GColor) return colorMethod(o, name, args);
  return null;
}

export function sameShape(a: Variant, b: Variant): boolean {
  if (a.t !== Tag.OBJECT || b.t !== Tag.OBJECT) return false;
  const x = a.v;
  const y = b.v;
  return (
    (x instanceof GVector2 && y instanceof GVector2) ||
    (x instanceof GVector3 && y instanceof GVector3) ||
    (x instanceof GColor && y instanceof GColor)
  );
}

export const PI_D = 3.14159265358979323846;

export const TAU_D = 2 * PI_D;

export function approxEq(a: number, b: number): boolean {
  if (a === b) return true;
  const diff = Math.abs(a - b);
  const tol = Math.max(1e-5, 1e-5 * Math.min(Math.abs(a), Math.abs(b)));
  return diff < tol;
}

/** and / or 是短路的，所以右值延迟求值；两支的值恒为 bool（S398：`1 and 2` 引擎给 `true`，`typeof` 那格给 1）。 */
export function and(l: Variant, right: () => Variant): Variant {
  return truthyOf(l) ? V.bool(truthyOf(right())) : V.bool(false);
}

export function tern(cond: Variant, thenE: () => Variant, elseE: () => Variant): Variant {
  return truthyOf(cond) ? thenE() : elseE();
}

export function or(l: Variant, right: () => Variant): Variant {
  return truthyOf(l) ? V.bool(true) : V.bool(truthyOf(right()));
}

export function numArg(v: Variant, who: string): number {
  if (v.t === Tag.BOOL) return v.v ? 1 : 0;
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
    throw new GodotRuntimeError("arg-float", `${who} 需要 float，收到 ${tagName(v.t)}`);
  }
  return v.t === Tag.FLOAT ? (v.v as number) : intToNum(v.v as IntPayload);
}

export const CMP_EPSILON = 0.00001;

export const MATH_TAU = 6.283185307179586;
