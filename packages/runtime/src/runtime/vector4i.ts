import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { vecFailKey } from "./vector2";
import { add32, div32, mul32, sub32, wrap32 } from "./vector2i";
import { asVec4, GVector4, registerVec4iParts, vector4 } from "./vector4";

export class GVector4i {
  x: number;
  y: number;
  z: number;
  w: number;
  constructor(x: number | bigint, y: number | bigint, z: number | bigint, w: number | bigint) {
    this.x = wrap32(x);
    this.y = wrap32(y);
    this.z = wrap32(z);
    this.w = wrap32(w);
  }
}

export function vector4i(x: number | bigint, y: number | bigint, z: number | bigint, w: number | bigint): Variant {
  return V.object(new GVector4i(x, y, z, w));
}

registerVec4iParts((o: object): [number, number, number, number] | null =>
  o instanceof GVector4i ? [o.x, o.y, o.z, o.w] : null,
);

export function asVec4i(v: Variant): GVector4i | null {
  return v.t === Tag.OBJECT && v.v instanceof GVector4i ? (v.v as GVector4i) : null;
}

function intArg(v: Variant | undefined, who: string): bigint {
  if (v === undefined) throw new UnsupportedError("vector4i-arg", `${who} 缺少实参`);
  if (v.t === Tag.INT) return v.v as bigint;
  if (v.t === Tag.BOOL) return v.v ? 1n : 0n;
  if (v.t === Tag.FLOAT) {
    const n = v.v as number;
    return Number.isFinite(n) ? BigInt(Math.trunc(n)) : 0n;
  }
  throw new UnsupportedError("vector4i-arg", `${who} 只收整数族，收到 ${tagName(v.t)}`);
}

/** `Vector4i(...)`（S580）：0 参、4 个分量、或单参收 Vector4（向零截断 + int32 回绕）。 */
export function vector4iNew(args: Variant[]): Variant {
  if (args.length === 0) return vector4i(0, 0, 0, 0);
  if (args.length === 1) {
    const f = asVec4(args[0] as Variant);
    if (f !== null) return vector4i(f.x, f.y, f.z, f.w);
    const i = asVec4i(args[0] as Variant);
    if (i !== null) return vector4i(i.x, i.y, i.z, i.w);
    throw new UnsupportedError("vector4i-arg", `Vector4i() 单参只收 Vector4 / Vector4i，收到 ${tagName((args[0] as Variant).t)}`);
  }
  if (args.length !== 4) {
    throw new UnsupportedError("vector4i-arity", `Vector4i() 需要 0、1 或 4 个参数（收到 ${args.length} 个）`);
  }
  return vector4i(intArg(args[0], "Vector4i"), intArg(args[1], "Vector4i"), intArg(args[2], "Vector4i"), intArg(args[3], "Vector4i"));
}

const VEC4I_CONST: Record<string, [number, number, number, number]> = {
  ZERO: [0, 0, 0, 0],
  ONE: [1, 1, 1, 1],
  MIN: [-2147483648, -2147483648, -2147483648, -2147483648],
  MAX: [2147483647, 2147483647, 2147483647, 2147483647],
};

export function vector4iConst(name: string, args: Variant[] = []): Variant {
  const c = VEC4I_CONST[name];
  if (c === undefined || args.length > 0) {
    if (args.length > 0 && c !== undefined) throw new UnsupportedError("vector4i-const", `Vector4i.${name} 不是函数`);
    throw new UnsupportedError("vector4i-const", `Vector4i.${name} 还没接（只量过 ZERO / ONE / MIN / MAX）`);
  }
  return vector4i(c[0], c[1], c[2], c[3]);
}

export function vec4iCmp(a: GVector4i, b: GVector4i): number {
  if (a.x !== b.x) return a.x < b.x ? -1 : 1;
  if (a.y !== b.y) return a.y < b.y ? -1 : 1;
  if (a.z !== b.z) return a.z < b.z ? -1 : 1;
  return a.w === b.w ? 0 : a.w < b.w ? -1 : 1;
}

function vec4iSlot(key: Variant): 0 | 1 | 2 | 3 | null {
  if (key.t === Tag.INT) {
    const i = intToNum(key.v as IntPayload);
    return i === 0 ? 0 : i === 1 ? 1 : i === 2 ? 2 : i === 3 ? 3 : null;
  }
  if (key.t === Tag.STRING || key.t === Tag.STRING_NAME) {
    const s = key.v as string;
    return s === "x" ? 0 : s === "y" ? 1 : s === "z" ? 2 : s === "w" ? 3 : null;
  }
  return null;
}

export function vec4iReadIndex(vec: GVector4i, key: Variant): Variant {
  if (key.t === Tag.INT) {
    const i = intToNum(key.v as IntPayload);
    if (i < 0 || i > 3) throw new GodotRuntimeError("vector4i-index", `Out of bounds get index '${String(i)}' (on base: 'Vector4i')`);
    return V.int(i === 0 ? vec.x : i === 1 ? vec.y : i === 2 ? vec.z : vec.w);
  }
  const slot = vec4iSlot(key);
  if (slot === null) vecFailKey(key, "read", "Vector4i");
  return V.int(slot === 0 ? vec.x : slot === 1 ? vec.y : slot === 2 ? vec.z : vec.w);
}

export function vec4iWrite(vec: GVector4i, key: Variant, value: Variant, via: "prop" | "index"): Variant {
  const slot = vec4iSlot(key);
  if (slot === null) {
    if (via === "index" && key.t === Tag.INT) throw new UnsupportedError("vector4i-index-write", "向量按下标写越界的引擎文案没量过");
    vecFailKey(key, via, "Vector4i", value);
  }
  const n = intArg(value, "分量写入");
  return vector4i(slot === 0 ? n : vec.x, slot === 1 ? n : vec.y, slot === 2 ? n : vec.z, slot === 3 ? n : vec.w);
}

export function toVec4i(v: Variant): Variant {
  const i = asVec4i(v);
  if (i !== null) return v;
  const f = asVec4(v);
  if (f !== null) return vector4i(f.x, f.y, f.z, f.w);
  throw new UnsupportedError("vector4i-slot", `Vector4i 槽只收 Vector4i / Vector4（收到 ${tagName(v.t)}）`);
}

export const v4iAdd = (a: GVector4i, b: GVector4i): Variant =>
  vector4i(add32(a.x, b.x), add32(a.y, b.y), add32(a.z, b.z), add32(a.w, b.w));
export const v4iSub = (a: GVector4i, b: GVector4i): Variant =>
  vector4i(sub32(a.x, b.x), sub32(a.y, b.y), sub32(a.z, b.z), sub32(a.w, b.w));
export const v4iMul = (a: GVector4i, b: GVector4i): Variant =>
  vector4i(mul32(a.x, b.x), mul32(a.y, b.y), mul32(a.z, b.z), mul32(a.w, b.w));
export const v4iDiv = (a: GVector4i, b: GVector4i): Variant =>
  vector4i(div32(a.x, b.x), div32(a.y, b.y), div32(a.z, b.z), div32(a.w, b.w));
export const v4iMulK = (a: GVector4i, k: number): Variant => vector4i(mul32(a.x, k), mul32(a.y, k), mul32(a.z, k), mul32(a.w, k));
export const v4iDivK = (a: GVector4i, k: number): Variant => vector4i(div32(a.x, k), div32(a.y, k), div32(a.z, k), div32(a.w, k));
export const v4iNeg = (a: GVector4i): Variant => vector4i(sub32(0, a.x), sub32(0, a.y), sub32(0, a.z), sub32(0, a.w));
export const vec4iToFloat = (a: GVector4i, k: number, op: "mul" | "div"): Variant =>
  vector4(
    op === "mul" ? a.x * k : a.x / k,
    op === "mul" ? a.y * k : a.y / k,
    op === "mul" ? a.z * k : a.z / k,
    op === "mul" ? a.w * k : a.w / k,
  );

function vecArg4i(args: Variant[], i: number, who: string): GVector4i {
  const o = asVec4i(args[i] as Variant);
  if (o === null) throw new UnsupportedError("vector4i-arg", `Vector4i.${who}() 的第 ${i + 1} 个实参需要 Vector4i`);
  return o;
}

function arity4i(args: Variant[], n: number, who: string): void {
  if (args.length !== n) throw new UnsupportedError("vector4i-arity", `Vector4i.${who}() 需要 ${n} 个参数（收到 ${args.length} 个）`);
}

function intScalar(v: Variant | undefined): number {
  return Number(intArg(v, "Vector4i"));
}

function snapInt(n: number, s: number): number {
  if (s === 0) return n;
  return wrap32(Math.floor((n + Math.trunc(s / 2)) / s) * s);
}

function lenSqInt(v: GVector4i): bigint {
  const x = BigInt(v.x), y = BigInt(v.y), z = BigInt(v.z), w = BigInt(v.w);
  return BigInt.asIntN(64, x * x + y * y + z * z + w * w);
}

export function vector4iMethod(v: GVector4i, name: string, args: Variant[]): Variant {
  switch (name) {
    case "min_axis_index":
      arity4i(args, 0, name);
      return V.int(v.x < v.y ? (v.x < v.z ? (v.x < v.w ? 0 : 3) : v.z < v.w ? 2 : 3) : v.y < v.z ? (v.y < v.w ? 1 : 3) : v.z < v.w ? 2 : 3);
    case "max_axis_index":
      arity4i(args, 0, name);
      return V.int(v.x < v.y ? (v.y < v.z ? (v.z < v.w ? 3 : 2) : v.y < v.w ? 3 : 1) : v.x < v.z ? (v.z < v.w ? 3 : 2) : v.x < v.w ? 3 : 0);
    case "length":
      arity4i(args, 0, name);
      return V.float(Math.sqrt(Number(lenSqInt(v))));
    case "length_squared":
      arity4i(args, 0, name);
      return V.int(lenSqInt(v));
    case "distance_to": {
      arity4i(args, 1, name);
      const o = vecArg4i(args, 0, name);
      const dx = BigInt(sub32(o.x, v.x)), dy = BigInt(sub32(o.y, v.y)), dz = BigInt(sub32(o.z, v.z)), dw = BigInt(sub32(o.w, v.w));
      return V.float(Math.sqrt(Number(BigInt.asIntN(64, dx * dx + dy * dy + dz * dz + dw * dw))));
    }
    case "distance_squared_to": {
      arity4i(args, 1, name);
      const o = vecArg4i(args, 0, name);
      const dx = BigInt(sub32(o.x, v.x)), dy = BigInt(sub32(o.y, v.y)), dz = BigInt(sub32(o.z, v.z)), dw = BigInt(sub32(o.w, v.w));
      return V.int(BigInt.asIntN(64, dx * dx + dy * dy + dz * dz + dw * dw));
    }
    case "abs":
      arity4i(args, 0, name);
      return vector4i(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z), Math.abs(v.w));
    case "sign": {
      arity4i(args, 0, name);
      const s = (n: number) => (n > 0 ? 1 : n < 0 ? -1 : 0);
      return vector4i(s(v.x), s(v.y), s(v.z), s(v.w));
    }
    case "min": {
      arity4i(args, 1, name);
      const o = vecArg4i(args, 0, name);
      return vector4i(Math.min(v.x, o.x), Math.min(v.y, o.y), Math.min(v.z, o.z), Math.min(v.w, o.w));
    }
    case "max": {
      arity4i(args, 1, name);
      const o = vecArg4i(args, 0, name);
      return vector4i(Math.max(v.x, o.x), Math.max(v.y, o.y), Math.max(v.z, o.z), Math.max(v.w, o.w));
    }
    case "mini": {
      arity4i(args, 1, name);
      const s = intScalar(args[0]);
      return vector4i(Math.min(v.x, s), Math.min(v.y, s), Math.min(v.z, s), Math.min(v.w, s));
    }
    case "maxi": {
      arity4i(args, 1, name);
      const s = intScalar(args[0]);
      return vector4i(Math.max(v.x, s), Math.max(v.y, s), Math.max(v.z, s), Math.max(v.w, s));
    }
    case "clamp": {
      arity4i(args, 2, name);
      const lo = vecArg4i(args, 0, name);
      const hi = vecArg4i(args, 1, name);
      return vector4i(
        Math.min(Math.max(v.x, lo.x), hi.x),
        Math.min(Math.max(v.y, lo.y), hi.y),
        Math.min(Math.max(v.z, lo.z), hi.z),
        Math.min(Math.max(v.w, lo.w), hi.w),
      );
    }
    case "clampi": {
      arity4i(args, 2, name);
      const lo = intScalar(args[0]);
      const hi = intScalar(args[1]);
      return vector4i(Math.min(Math.max(v.x, lo), hi), Math.min(Math.max(v.y, lo), hi), Math.min(Math.max(v.z, lo), hi), Math.min(Math.max(v.w, lo), hi));
    }
    case "snapped": {
      arity4i(args, 1, name);
      const o = vecArg4i(args, 0, name);
      return vector4i(snapInt(v.x, o.x), snapInt(v.y, o.y), snapInt(v.z, o.z), snapInt(v.w, o.w));
    }
    case "snappedi": {
      arity4i(args, 1, name);
      const s = intScalar(args[0]);
      return vector4i(snapInt(v.x, s), snapInt(v.y, s), snapInt(v.z, s), snapInt(v.w, s));
    }
    default:
      throw new UnsupportedError("vector4i-method", `Vector4i.${name}() 未实现`);
  }
}
