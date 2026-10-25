import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { NORMALIZED_EPS, approxEq, vecFailKey } from "./vector2";

export class GVector4 {
  x: number;
  y: number;
  z: number;
  w: number;
  constructor(x: number, y: number, z: number, w: number) {
    this.x = Math.fround(x);
    this.y = Math.fround(y);
    this.z = Math.fround(z);
    this.w = Math.fround(w);
  }
}

export function vector4(x: number, y: number, z: number, w: number): Variant {
  return V.object(new GVector4(x, y, z, w));
}

type Vec4iParts = (o: object) => [number, number, number, number] | null;
let vec4iParts: Vec4iParts | null = null;
export function registerVec4iParts(f: Vec4iParts): void {
  vec4iParts = f;
}

export function asVec4(v: Variant): GVector4 | null {
  return v.t === Tag.OBJECT && v.v instanceof GVector4 ? (v.v as GVector4) : null;
}

export function vector4New(args: Variant[]): Variant {
  if (args.length === 0) return vector4(0, 0, 0, 0);
  if (args.length === 1) {
    const o = asVec4(args[0] as Variant);
    if (o !== null) return vector4(o.x, o.y, o.z, o.w);
    const a = args[0] as Variant;
    const inner = a.t === Tag.OBJECT ? a.v : null;
    const parts = inner !== null && typeof inner === "object" && vec4iParts !== null ? vec4iParts(inner) : null;
    if (parts !== null) return vector4(parts[0], parts[1], parts[2], parts[3]);
    throw new UnsupportedError("vector4-arg", `Vector4() 单参只收 Vector4 / Vector4i，收到 ${tagName(a.t)}`);
  }
  if (args.length !== 4) {
    throw new UnsupportedError("vector4-arity", `Vector4() 需要 0、1（Vector4 / Vector4i）或 4 个参数（收到 ${args.length} 个）`);
  }
  return vector4(scalar(args[0]), scalar(args[1]), scalar(args[2]), scalar(args[3]));
}

function scalar(v: Variant | undefined): number {
  if (v === undefined) throw new UnsupportedError("vector4-arg", "Vector4() 缺少分量");
  if (v.t === Tag.FLOAT) return v.v as number;
  if (v.t === Tag.INT) return intToNum(v.v as IntPayload);
  if (v.t === Tag.BOOL) return v.v ? 1 : 0;
  throw new UnsupportedError("vector4-arg", `Vector4() 的分量只收数值，收到 ${tagName(v.t)}`);
}

const VEC4_CONST: Record<string, [number, number, number, number]> = {
  ZERO: [0, 0, 0, 0],
  ONE: [1, 1, 1, 1],
  INF: [Infinity, Infinity, Infinity, Infinity],
};

export function vector4Const(name: string, args: Variant[] = []): Variant {
  const c = VEC4_CONST[name];
  if (c === undefined || args.length > 0) {
    if (args.length > 0 && c !== undefined) throw new UnsupportedError("vector4-const", `Vector4.${name} 不是函数`);
    throw new UnsupportedError("vector4-const", `Vector4.${name} 还没接（只量过 ZERO / ONE / INF）`);
  }
  return vector4(c[0], c[1], c[2], c[3]);
}

export function vec4Cmp(a: GVector4, b: GVector4): number {
  if (a.x !== b.x) return a.x < b.x ? -1 : 1;
  if (a.y !== b.y) return a.y < b.y ? -1 : 1;
  if (a.z !== b.z) return a.z < b.z ? -1 : 1;
  return a.w === b.w ? 0 : a.w < b.w ? -1 : 1;
}

function vec4Slot(key: Variant): 0 | 1 | 2 | 3 | null {
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

export function vec4ReadIndex(vec: GVector4, key: Variant): Variant {
  if (key.t === Tag.INT) {
    const i = intToNum(key.v as IntPayload);
    if (i < 0 || i > 3) throw new GodotRuntimeError("vector4-index", `Out of bounds get index '${String(i)}' (on base: 'Vector4')`);
    return V.float(i === 0 ? vec.x : i === 1 ? vec.y : i === 2 ? vec.z : vec.w);
  }
  const slot = vec4Slot(key);
  if (slot === null) vecFailKey(key, "read", "Vector4");
  return V.float(slot === 0 ? vec.x : slot === 1 ? vec.y : slot === 2 ? vec.z : vec.w);
}

export function vec4Write(vec: GVector4, key: Variant, value: Variant, via: "prop" | "index"): Variant {
  const slot = vec4Slot(key);
  if (slot === null) {
    if (via === "index" && key.t === Tag.INT) {
      const i = intToNum(key.v as IntPayload);
      throw new UnsupportedError("vector4-index-write", `向量按下标写越界（${String(i)}）的引擎文案没量过`);
    }
    vecFailKey(key, via, "Vector4", value);
  }
  if (value.t !== Tag.INT && value.t !== Tag.FLOAT) vecFailKey(key, via, "Vector4", value);
  const n = value.t === Tag.INT ? intToNum(value.v as IntPayload) : (value.v as number);
  return vector4(slot === 0 ? n : vec.x, slot === 1 ? n : vec.y, slot === 2 ? n : vec.z, slot === 3 ? n : vec.w);
}

export function toVec4(v: Variant): Variant {
  const a = asVec4(v);
  if (a !== null) return v;
  const a4i = v.t === Tag.OBJECT && vec4iParts !== null ? vec4iParts(v.v as object) : null;
  if (a4i !== null) return vector4(a4i[0], a4i[1], a4i[2], a4i[3]);
  throw new UnsupportedError("vector4-slot", `Vector4 槽只收 Vector4 / Vector4i（收到 ${tagName(v.t)}）`);
}

const r4 = Math.fround;
const mul4 = (a: number, b: number) => r4(a * b);
const div4 = (a: number, b: number) => r4(a / b);
const add4 = (a: number, b: number) => r4(a + b);
const sub4 = (a: number, b: number) => r4(a - b);
const lenSq4 = (v: GVector4) => add4(add4(add4(mul4(v.x, v.x), mul4(v.y, v.y)), mul4(v.z, v.z)), mul4(v.w, v.w));
const dot4 = (a: GVector4, b: GVector4) => add4(add4(add4(mul4(a.x, b.x), mul4(a.y, b.y)), mul4(a.z, b.z)), mul4(a.w, b.w));
const flen4 = (x: number, y: number, z: number, w: number) => r4(Math.sqrt(add4(add4(add4(mul4(x, x), mul4(y, y)), mul4(z, z)), mul4(w, w))));
const fposmod4 = (a: number, b: number): number => (b === 0 || !Number.isFinite(a / b) ? NaN : a - b * Math.floor(a / b) + 0);
const isUnit4 = (v: GVector4) => r4(Math.abs(sub4(lenSq4(v), 1))) < NORMALIZED_EPS;

function vecArg4(args: Variant[], i: number, who: string): GVector4 {
  const o = asVec4(args[i] as Variant);
  if (o === null) throw new UnsupportedError("vector4-arg", `Vector4.${who}() 的第 ${i + 1} 个实参需要 Vector4`);
  return o;
}

function arity4(args: Variant[], n: number, who: string): void {
  if (args.length !== n) throw new UnsupportedError("vector4-arity", `Vector4.${who}() 需要 ${n} 个参数（收到 ${args.length} 个）`);
}

function normalized4(x: number, y: number, z: number, w: number): Variant {
  const len = flen4(x, y, z, w);
  if (len === 0) return vector4(0, 0, 0, 0);
  return vector4(div4(x, len), div4(y, len), div4(z, len), div4(w, len));
}

export function vector4Method(v: GVector4, name: string, args: Variant[]): Variant {
  switch (name) {
    case "min_axis_index":
      arity4(args, 0, name);
      return V.int(v.x < v.y ? (v.x < v.z ? (v.x < v.w ? 0 : 3) : v.z < v.w ? 2 : 3) : v.y < v.z ? (v.y < v.w ? 1 : 3) : v.z < v.w ? 2 : 3);
    case "max_axis_index":
      arity4(args, 0, name);
      return V.int(v.x < v.y ? (v.y < v.z ? (v.z < v.w ? 3 : 2) : v.y < v.w ? 3 : 1) : v.x < v.z ? (v.z < v.w ? 3 : 2) : v.x < v.w ? 3 : 0);
    case "length":
      arity4(args, 0, name);
      return V.float(flen4(v.x, v.y, v.z, v.w));
    case "length_squared":
      arity4(args, 0, name);
      return V.float(lenSq4(v));
    case "distance_to": {
      arity4(args, 1, name);
      const o = vecArg4(args, 0, name);
      return V.float(flen4(sub4(o.x, v.x), sub4(o.y, v.y), sub4(o.z, v.z), sub4(o.w, v.w)));
    }
    case "distance_squared_to": {
      arity4(args, 1, name);
      const o = vecArg4(args, 0, name);
      const dx = sub4(o.x, v.x);
      const dy = sub4(o.y, v.y);
      const dz = sub4(o.z, v.z);
      const dw = sub4(o.w, v.w);
      return V.float(add4(add4(add4(mul4(dx, dx), mul4(dy, dy)), mul4(dz, dz)), mul4(dw, dw)));
    }
    case "direction_to": {
      arity4(args, 1, name);
      const o = vecArg4(args, 0, name);
      return normalized4(sub4(o.x, v.x), sub4(o.y, v.y), sub4(o.z, v.z), sub4(o.w, v.w));
    }
    case "normalized":
      arity4(args, 0, name);
      return normalized4(v.x, v.y, v.z, v.w);
    case "dot": {
      arity4(args, 1, name);
      const o = vecArg4(args, 0, name);
      return V.float(dot4(v, o));
    }
    case "abs":
      arity4(args, 0, name);
      return vector4(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z), Math.abs(v.w));
    case "sign": {
      arity4(args, 0, name);
      const s = (n: number) => (n > 0 ? 1 : n < 0 ? -1 : 0);
      return vector4(s(v.x), s(v.y), s(v.z), s(v.w));
    }
    case "floor":
      arity4(args, 0, name);
      return vector4(Math.floor(v.x), Math.floor(v.y), Math.floor(v.z), Math.floor(v.w));
    case "ceil":
      arity4(args, 0, name);
      return vector4(Math.ceil(v.x), Math.ceil(v.y), Math.ceil(v.z), Math.ceil(v.w));
    case "round": {
      arity4(args, 0, name);
      const h = (n: number) => (n < 0 ? Math.ceil(sub4(n, 0.5)) : Math.floor(add4(n, 0.5)));
      return vector4(h(v.x), h(v.y), h(v.z), h(v.w));
    }
    case "snapped": {
      arity4(args, 1, name);
      const o = vecArg4(args, 0, name);
      const snap = (n: number, s: number) => (s === 0 ? n : mul4(s, Math.floor(add4(div4(n, s), 0.5))));
      return vector4(snap(v.x, o.x), snap(v.y, o.y), snap(v.z, o.z), snap(v.w, o.w));
    }
    case "snappedf": {
      arity4(args, 1, name);
      const s = scalar(args[0]);
      const snap = (n: number) => (s === 0 ? n : mul4(s, Math.floor(add4(div4(n, s), 0.5))));
      return vector4(snap(v.x), snap(v.y), snap(v.z), snap(v.w));
    }
    case "minf": {
      arity4(args, 1, name);
      const s = scalar(args[0]);
      return vector4(Math.min(v.x, s), Math.min(v.y, s), Math.min(v.z, s), Math.min(v.w, s));
    }
    case "maxf": {
      arity4(args, 1, name);
      const s = scalar(args[0]);
      return vector4(Math.max(v.x, s), Math.max(v.y, s), Math.max(v.z, s), Math.max(v.w, s));
    }
    case "posmod": {
      arity4(args, 1, name);
      const s = scalar(args[0]);
      return vector4(fposmod4(v.x, s), fposmod4(v.y, s), fposmod4(v.z, s), fposmod4(v.w, s));
    }
    case "posmodv": {
      arity4(args, 1, name);
      const o = vecArg4(args, 0, name);
      return vector4(fposmod4(v.x, o.x), fposmod4(v.y, o.y), fposmod4(v.z, o.z), fposmod4(v.w, o.w));
    }
    case "lerp": {
      arity4(args, 2, name);
      const o = vecArg4(args, 0, name);
      const w = scalar(args[1]);
      return vector4(add4(v.x, mul4(sub4(o.x, v.x), w)), add4(v.y, mul4(sub4(o.y, v.y), w)), add4(v.z, mul4(sub4(o.z, v.z), w)), add4(v.w, mul4(sub4(o.w, v.w), w)));
    }
    case "cubic_interpolate": {
      arity4(args, 4, name);
      const b = vecArg4(args, 0, name);
      const pre = vecArg4(args, 1, name);
      const post = vecArg4(args, 2, name);
      const w = scalar(args[3]);
      const t2 = mul4(w, w);
      const t3 = mul4(w, t2);
      const cubic = (zero: number, one: number, two: number, three: number) => {
        const p0 = mul4(2, one);
        const p1 = mul4(sub4(two, zero), w);
        const p2 = mul4(sub4(add4(sub4(mul4(2, zero), mul4(5, one)), mul4(4, two)), three), t2);
        const p3 = mul4(add4(sub4(mul4(3, sub4(one, two)), zero), three), t3);
        return mul4(0.5, add4(add4(add4(p0, p1), p2), p3));
      };
      return vector4(cubic(pre.x, v.x, b.x, post.x), cubic(pre.y, v.y, b.y, post.y), cubic(pre.z, v.z, b.z, post.z), cubic(pre.w, v.w, b.w, post.w));
    }
    case "cubic_interpolate_in_time": {
      arity4(args, 7, name);
      const b = vecArg4(args, 0, name);
      const pre = vecArg4(args, 1, name);
      const post = vecArg4(args, 2, name);
      const w = scalar(args[3]);
      const toT = scalar(args[4]);
      const preT = scalar(args[5]);
      const postT = scalar(args[6]);
      const lerp32 = (x: number, y: number, k: number) => add4(x, mul4(sub4(y, x), k));
      const t = lerp32(0, toT, w);
      const gapPost = sub4(postT, toT);
      const gapPre = sub4(toT, preT);
      const it = (p0: number, p1: number, p2: number, p3: number) => {
        const a1 = lerp32(p0, p1, preT === 0 ? 0 : div4(sub4(t, preT), -preT));
        const a2 = lerp32(p1, p2, toT === 0 ? 0.5 : div4(t, toT));
        const a3 = lerp32(p2, p3, gapPost === 0 ? 1 : div4(sub4(t, toT), gapPost));
        const b1 = lerp32(a1, a2, gapPre === 0 ? 0 : div4(sub4(t, preT), gapPre));
        const b2 = lerp32(a2, a3, postT === 0 ? 1 : div4(t, postT));
        return lerp32(b1, b2, toT === 0 ? 0.5 : div4(t, toT));
      };
      return vector4(it(pre.x, v.x, b.x, post.x), it(pre.y, v.y, b.y, post.y), it(pre.z, v.z, b.z, post.z), it(pre.w, v.w, b.w, post.w));
    }
    case "min": {
      arity4(args, 1, name);
      const o = vecArg4(args, 0, name);
      return vector4(Math.min(v.x, o.x), Math.min(v.y, o.y), Math.min(v.z, o.z), Math.min(v.w, o.w));
    }
    case "max": {
      arity4(args, 1, name);
      const o = vecArg4(args, 0, name);
      return vector4(Math.max(v.x, o.x), Math.max(v.y, o.y), Math.max(v.z, o.z), Math.max(v.w, o.w));
    }
    case "clamp": {
      arity4(args, 2, name);
      const lo = vecArg4(args, 0, name);
      const hi = vecArg4(args, 1, name);
      return vector4(
        Math.min(Math.max(v.x, lo.x), hi.x),
        Math.min(Math.max(v.y, lo.y), hi.y),
        Math.min(Math.max(v.z, lo.z), hi.z),
        Math.min(Math.max(v.w, lo.w), hi.w),
      );
    }
    case "clampf": {
      arity4(args, 2, name);
      const lo = scalar(args[0]);
      const hi = scalar(args[1]);
      return vector4(Math.min(Math.max(v.x, lo), hi), Math.min(Math.max(v.y, lo), hi), Math.min(Math.max(v.z, lo), hi), Math.min(Math.max(v.w, lo), hi));
    }
    case "inverse":
      arity4(args, 0, name);
      return vector4(div4(1, v.x), div4(1, v.y), div4(1, v.z), div4(1, v.w));
    case "is_equal_approx": {
      arity4(args, 1, name);
      const o = vecArg4(args, 0, name);
      return V.bool(approxEq(v.x, o.x) && approxEq(v.y, o.y) && approxEq(v.z, o.z) && approxEq(v.w, o.w));
    }
    case "is_zero_approx":
      arity4(args, 0, name);
      return V.bool(approxEq(v.x, 0) && approxEq(v.y, 0) && approxEq(v.z, 0) && approxEq(v.w, 0));
    case "is_normalized":
      arity4(args, 0, name);
      return V.bool(isUnit4(v));
    case "is_finite":
      arity4(args, 0, name);
      return V.bool(Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z) && Number.isFinite(v.w));
    default:
      throw new UnsupportedError("vector4-method", `Vector4.${name}() 未实现`);
  }
}
