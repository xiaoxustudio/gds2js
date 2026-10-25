import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "./tags";

export class GVector2 {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = Math.fround(x);
    this.y = Math.fround(y);
  }
}

const r = Math.fround;

type Vec2iParts = (o: object) => [number, number] | null;

let vec2iParts: Vec2iParts | null = null;

export function registerVec2iParts(f: Vec2iParts): void {
  vec2iParts = f;
}

export function vector2(x: number, y: number): Variant {
  return V.object(new GVector2(x, y));
}

export function asVec2(v: Variant): GVector2 | null {
  return v.t === Tag.OBJECT && v.v instanceof GVector2 ? (v.v as GVector2) : null;
}

/** 声明为 `Vector2` 的变量/字段在**赋值点**的转换：复用 `vector2New` 的单参形态，别的实参响亮报缺。 */
export function toVec2(v: Variant): Variant {
  return vector2New([v]);
}

export function vector2New(args: Variant[]): Variant {
  if (args.length === 0) return vector2(0, 0);
  if (args.length === 1) {
    const a = args[0] as Variant;
    if (a.t === Tag.OBJECT && a.v instanceof GVector2) return vector2(a.v.x, a.v.y);
    const inner = a.t === Tag.OBJECT ? a.v : null;
    const parts = inner !== null && typeof inner === "object" && vec2iParts !== null ? vec2iParts(inner) : null;
    if (parts !== null) return vector2(parts[0] as number, parts[1] as number);
    throw new UnsupportedError("vector2-arg", `Vector2() 单参只收 Vector2 / Vector2i，收到 ${tagName(a.t)}`);
  }
  if (args.length !== 2) {
    throw new UnsupportedError("vector2-arity", `Vector2() 需要 0、1（向量）或 2 个参数（收到 ${args.length} 个）`);
  }
  return vector2(scalar(args[0], "Vector2"), scalar(args[1], "Vector2"));
}

const VEC2_CONST: Record<string, [number, number]> = {
  ZERO: [0, 0],
  ONE: [1, 1],
  INF: [Infinity, Infinity],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
  UP: [0, -1],
  DOWN: [0, 1],
};

const VEC2_CONST_INT: Record<string, number> = { AXIS_X: 0, AXIS_Y: 1 };

export function vector2Const(name: string, args: Variant[] = []): Variant {
  if (args.length > 0 || name === "from_angle") {
    switch (name) {
      case "from_angle": {
        if (args.length !== 1) {
          throw new UnsupportedError("vector2-arity", `Vector2.from_angle() 只收 1 个角度（收到 ${args.length} 个）`);
        }
        return fromAngle(scalar(args[0] as Variant, "from_angle"));
      }
      default:
        throw new UnsupportedError("vector2-static", `Vector2.${name}() 未实现（实测不存在或没探针）`);
    }
  }
  const c = VEC2_CONST[name];
  if (c) return vector2(c[0], c[1]);
  const i = VEC2_CONST_INT[name];
  if (i !== undefined) return V.int(i);
  throw new UnsupportedError(
    "vector2-const",
    `Vector2.${name} 不存在（4.6.3 实测只有 ${[...Object.keys(VEC2_CONST), ...Object.keys(VEC2_CONST_INT)].join("/")}）`,
  );
}

const FROM_ANGLE_LIMIT = 1e12;

function fromAngle(a: number): Variant {
  const x = r(a);
  if (Number.isFinite(x) && Math.abs(x) > FROM_ANGLE_LIMIT) {
    throw new UnsupportedError(
      "trig-large-arg",
      `from_angle() 收到 ${x}：|a| 超过实测的 ${FROM_ANGLE_LIMIT}，引擎的 cos / sin 从这一档开始在末位上裂（没量过的不发）`,
    );
  }
  return vector2(Math.cos(x), Math.sin(x));
}

function scalar(v: Variant | undefined, who: string): number {
  if (v === undefined) throw new UnsupportedError("vector2-arity", `Vector2.${who} 缺少实参`);
  if (v.t === Tag.FLOAT) return r(v.v as number);
  if (v.t === Tag.INT) return intToNum(v.v as number | bigint);
  if (v.t === Tag.BOOL) return v.v ? 1 : 0;
  throw new UnsupportedError("vector2-arg", `Vector2.${who} 需要数值实参，收到 ${v.t}`);
}

function vecArg(args: Variant[], i: number, who: string): GVector2 {
  const a = args[i];
  const v = a === undefined ? null : asVec2(a);
  if (v) return v;
  const inner = a !== undefined && a.t === Tag.OBJECT ? a.v : null;
  const parts = inner !== null && typeof inner === "object" && vec2iParts !== null ? vec2iParts(inner) : null;
  if (parts !== null) return new GVector2(parts[0] as number, parts[1] as number);
  throw new UnsupportedError("vector2-arg", `Vector2.${who} 的第 ${i + 1} 个实参需要 Vector2`);
}

function arity(args: Variant[], n: number, who: string): void {
  if (args.length !== n) {
    throw new GodotRuntimeError("vector2-arity", `Invalid call to function '${who}' in base 'Vector2'. Expected ${n} argument(s).`);
  }
}

const mul = (a: number, b: number) => r(a * b);
const div = (a: number, b: number) => r(a / b);
const add = (a: number, b: number) => r(a + b);
const sub = (a: number, b: number) => r(a - b);
const flen = (x: number, y: number) => r(Math.sqrt(add(mul(x, x), mul(y, y))));

const fposmod = (a: number, b: number): number => (b === 0 || !Number.isFinite(a / b) ? NaN : a - b * Math.floor(a / b) + 0);

export const clamp = (n: number, lo: number, hi: number): number => (n < lo ? lo : n > hi ? hi : n);

const isUnit = (x: number, y: number) => r(Math.abs(sub(add(mul(x, x), mul(y, y)), 1))) < NORMALIZED_EPS;

export function vector2Method(v: GVector2, name: string, args: Variant[]): Variant {
  switch (name) {
    case "length":
      arity(args, 0, "length");
      return V.float(flen(v.x, v.y));
    case "length_squared": {
      arity(args, 0, "length_squared");
      return V.float(add(mul(v.x, v.x), mul(v.y, v.y)));
    }
    case "distance_to": {
      arity(args, 1, "distance_to");
      const o = vecArg(args, 0, "distance_to");
      return V.float(flen(sub(o.x, v.x), sub(o.y, v.y)));
    }
    case "distance_squared_to": {
      arity(args, 1, "distance_squared_to");
      const o = vecArg(args, 0, "distance_squared_to");
      const dx = sub(o.x, v.x);
      const dy = sub(o.y, v.y);
      return V.float(add(mul(dx, dx), mul(dy, dy)));
    }
    case "direction_to": {
      arity(args, 1, "direction_to");
      const o = vecArg(args, 0, "direction_to");
      return normalized(sub(o.x, v.x), sub(o.y, v.y));
    }
    case "normalized":
      arity(args, 0, "normalized");
      return normalized(v.x, v.y);
    case "dot": {
      arity(args, 1, "dot");
      const o = vecArg(args, 0, "dot");
      return V.float(add(mul(v.x, o.x), mul(v.y, o.y)));
    }
    case "cross": {
      arity(args, 1, "cross");
      const o = vecArg(args, 0, "cross");
      return V.float(sub(mul(v.x, o.y), mul(v.y, o.x)));
    }
    case "abs":
      arity(args, 0, "abs");
      return vector2(Math.abs(v.x), Math.abs(v.y));
    case "sign": {
      arity(args, 0, "sign");
      const s = (n: number) => (n > 0 ? 1 : n < 0 ? -1 : 0);
      return vector2(s(v.x), s(v.y));
    }
    case "floor":
      arity(args, 0, "floor");
      return vector2(Math.floor(v.x), Math.floor(v.y));
    case "ceil":
      arity(args, 0, "ceil");
      return vector2(Math.ceil(v.x), Math.ceil(v.y));
    case "round": {
      arity(args, 0, "round");
      const h = (n: number) => (n < 0 ? Math.ceil(sub(n, 0.5)) : Math.floor(add(n, 0.5)));
      return vector2(h(v.x), h(v.y));
    }
    case "snapped": {
      arity(args, 1, "snapped");
      const o = vecArg(args, 0, "snapped");
      const snap = (n: number, s: number) => (s === 0 ? n : mul(s, Math.floor(add(div(n, s), 0.5))));
      return vector2(snap(v.x, o.x), snap(v.y, o.y));
    }
    case "min": {
      arity(args, 1, "min");
      const o = vecArg(args, 0, "min");
      return vector2(Math.min(v.x, o.x), Math.min(v.y, o.y));
    }
    case "max": {
      arity(args, 1, "max");
      const o = vecArg(args, 0, "max");
      return vector2(Math.max(v.x, o.x), Math.max(v.y, o.y));
    }
    case "minf": {
      arity(args, 1, "minf");
      const s = scalar(args[0], "minf");
      return vector2(Math.min(v.x, s), Math.min(v.y, s));
    }
    case "maxf": {
      arity(args, 1, "maxf");
      const s = scalar(args[0], "maxf");
      return vector2(Math.max(v.x, s), Math.max(v.y, s));
    }
    case "clamp": {
      arity(args, 2, "clamp");
      const lo = vecArg(args, 0, "clamp");
      const hi = vecArg(args, 1, "clamp");
      return vector2(clamp(v.x, lo.x, hi.x), clamp(v.y, lo.y, hi.y));
    }
    case "clampf": {
      arity(args, 2, "clampf");
      const lo = scalar(args[0], "clampf");
      const hi = scalar(args[1], "clampf");
      return vector2(clamp(v.x, lo, hi), clamp(v.y, lo, hi));
    }
    case "snappedf": {
      arity(args, 1, "snappedf");
      const s = scalar(args[0], "snappedf");
      const snap = (n: number, k: number) => (k === 0 ? n : mul(k, Math.floor(add(div(n, k), 0.5))));
      return vector2(snap(v.x, s), snap(v.y, s));
    }
    case "posmod": {
      arity(args, 1, "posmod");
      const s = scalar(args[0], "posmod");
      return vector2(fposmod(v.x, s), fposmod(v.y, s));
    }
    case "posmodv": {
      arity(args, 1, "posmodv");
      const o = vecArg(args, 0, "posmodv");
      return vector2(fposmod(v.x, o.x), fposmod(v.y, o.y));
    }
    case "bezier_interpolate": {
      arity(args, 4, "bezier_interpolate");
      const c1 = vecArg(args, 0, "bezier_interpolate");
      const c2 = vecArg(args, 1, "bezier_interpolate");
      const e = vecArg(args, 2, "bezier_interpolate");
      const t = scalar(args[3], "bezier_interpolate");
      const u = sub(1, t);
      const u2 = mul(u, u);
      const u3 = mul(u2, u);
      const t2 = mul(t, t);
      const t3 = mul(t2, t);
      const bz = (a: number, b: number, c: number, d: number) =>
        add(add(add(mul(a, u3), mul(mul(mul(3, u2), t), b)), mul(mul(mul(3, u), t2), c)), mul(d, t3));
      return vector2(bz(v.x, c1.x, c2.x, e.x), bz(v.y, c1.y, c2.y, e.y));
    }
    case "bezier_derivative": {
      arity(args, 4, "bezier_derivative");
      const c1 = vecArg(args, 0, "bezier_derivative");
      const c2 = vecArg(args, 1, "bezier_derivative");
      const e = vecArg(args, 2, "bezier_derivative");
      const t = scalar(args[3], "bezier_derivative");
      const omt = sub(1, t);
      const omt2 = mul(omt, omt);
      const t2 = mul(t, t);
      const bd = (s: number, a: number, b: number, c: number) =>
        add(add(mul(mul(sub(a, s), 3), omt2), mul(mul(mul(sub(b, a), 6), omt), t)), mul(mul(sub(c, b), 3), t2));
      return vector2(bd(v.x, c1.x, c2.x, e.x), bd(v.y, c1.y, c2.y, e.y));
    }
    case "cubic_interpolate": {
      arity(args, 4, "cubic_interpolate");
      const b = vecArg(args, 0, "cubic_interpolate");
      const pre = vecArg(args, 1, "cubic_interpolate");
      const post = vecArg(args, 2, "cubic_interpolate");
      const t = scalar(args[3], "cubic_interpolate");
      const t2 = mul(t, t);
      const t3 = mul(t, t2);
      const ci = (p0: number, p1: number, p2: number, p3: number) => {
        const c2 = sub(add(sub(mul(2, p0), mul(5, p1)), mul(4, p2)), p3);
        const c3 = add(sub(mul(3, sub(p1, p2)), p0), p3);
        return mul(0.5, add(add(add(mul(2, p1), mul(sub(p2, p0), t)), mul(c2, t2)), mul(c3, t3)));
      };
      return vector2(ci(pre.x, v.x, b.x, post.x), ci(pre.y, v.y, b.y, post.y));
    }
    case "cubic_interpolate_in_time": {
      arity(args, 7, "cubic_interpolate_in_time");
      const b = vecArg(args, 0, "cubic_interpolate_in_time");
      const pre = vecArg(args, 1, "cubic_interpolate_in_time");
      const post = vecArg(args, 2, "cubic_interpolate_in_time");
      const w = scalar(args[3], "cubic_interpolate_in_time");
      const toT = scalar(args[4], "cubic_interpolate_in_time");
      const preT = scalar(args[5], "cubic_interpolate_in_time");
      const postT = scalar(args[6], "cubic_interpolate_in_time");
      const lerp32 = (x: number, y: number, k: number) => add(x, mul(sub(y, x), k));
      const t = lerp32(0, toT, w);
      const gapPost = sub(postT, toT);
      const gapPre = sub(toT, preT);
      const it = (p0: number, p1: number, p2: number, p3: number) => {
        const a1 = lerp32(p0, p1, preT === 0 ? 0 : div(sub(t, preT), -preT));
        const a2 = lerp32(p1, p2, toT === 0 ? 0.5 : div(t, toT));
        const a3 = lerp32(p2, p3, gapPost === 0 ? 1 : div(sub(t, toT), gapPost));
        const b1 = lerp32(a1, a2, gapPre === 0 ? 0 : div(sub(t, preT), gapPre));
        const b2 = lerp32(a2, a3, postT === 0 ? 1 : div(t, postT));
        return lerp32(b1, b2, toT === 0 ? 0.5 : div(t, toT));
      };
      return vector2(it(pre.x, v.x, b.x, post.x), it(pre.y, v.y, b.y, post.y));
    }
    case "lerp": {
      arity(args, 2, "lerp");
      const o = vecArg(args, 0, "lerp");
      const w = scalar(args[1], "lerp");
      return vector2(add(v.x, mul(sub(o.x, v.x), w)), add(v.y, mul(sub(o.y, v.y), w)));
    }
    case "move_toward": {
      arity(args, 2, "move_toward");
      const o = vecArg(args, 0, "move_toward");
      const d = scalar(args[1], "move_toward");
      const vx = sub(o.x, v.x);
      const vy = sub(o.y, v.y);
      const len = flen(vx, vy);
      if (len === 0 || len <= d) return vector2(o.x, o.y);
      return vector2(add(v.x, mul(div(vx, len), d)), add(v.y, mul(div(vy, len), d)));
    }
    case "limit_length": {
      if (args.length > 1) arity(args, 1, "limit_length");
      const max = args.length === 0 ? 1 : scalar(args[0], "limit_length");
      const len = flen(v.x, v.y);
      if (!(len > max)) return vector2(v.x, v.y);
      if (len === 0) return vector2(v.x, v.y);
      return vector2(mul(div(v.x, len), max), mul(div(v.y, len), max));
    }
    case "from_angle": {
      arity(args, 1, "from_angle");
      const t = r(scalar(args[0], "from_angle"));
      return vector2(r(Math.cos(t)), r(Math.sin(t)));
    }
    case "min_axis_index":
      arity(args, 0, "min_axis_index");
      return V.int(v.x < v.y ? 0 : 1);
    case "max_axis_index":
      arity(args, 0, "max_axis_index");
      return V.int(v.x < v.y ? 1 : 0);
    case "orthogonal":
      arity(args, 0, "orthogonal");
      return vector2(v.y, -v.x);
    case "rotated": {
      arity(args, 1, "rotated");
      const a = scalar(args[0], "rotated");
      const c = r(Math.cos(a));
      const s = r(Math.sin(a));
      return vector2(sub(mul(v.x, c), mul(v.y, s)), add(mul(v.x, s), mul(v.y, c)));
    }
    case "angle":
      arity(args, 0, "angle");
      return V.float(r(Math.atan2(v.y, v.x)));
    case "angle_to": {
      arity(args, 1, "angle_to");
      const o = vecArg(args, 0, "angle_to");
      const cross = sub(mul(v.x, o.y), mul(v.y, o.x));
      const dot = add(mul(v.x, o.x), mul(v.y, o.y));
      return V.float(r(Math.atan2(cross, dot)));
    }
    case "angle_to_point": {
      arity(args, 1, "angle_to_point");
      const o = vecArg(args, 0, "angle_to_point");
      return V.float(r(Math.atan2(sub(o.y, v.y), sub(o.x, v.x))));
    }
    case "aspect":
      arity(args, 0, "aspect");
      return V.float(div(v.x, v.y));
    case "is_finite":
      arity(args, 0, "is_finite");
      return V.bool(Number.isFinite(v.x) && Number.isFinite(v.y));
    case "slerp": {
      arity(args, 2, "slerp");
      const o = vecArg(args, 0, "slerp");
      const w = scalar(args[1], "slerp");
      const lsq = add(mul(v.x, v.x), mul(v.y, v.y));
      const osq = add(mul(o.x, o.x), mul(o.y, o.y));
      if (lsq === 0 || osq === 0) {
        return vector2(add(v.x, mul(sub(o.x, v.x), w)), add(v.y, mul(sub(o.y, v.y), w)));
      }
      const aa = Math.atan2(v.y, v.x);
      const ab = Math.atan2(o.y, o.x);
      let d = ab - aa;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d <= -Math.PI) d += 2 * Math.PI;
      const ang = r(aa + d * w);
      const len = lerpLen(flen(v.x, v.y), flen(o.x, o.y), w);
      return vector2(mul(len, r(Math.cos(ang))), mul(len, r(Math.sin(ang))));
    }
    case "is_equal_approx":
      arity(args, 1, "is_equal_approx");
      {
        const o = vecArg(args, 0, "is_equal_approx");
        return V.bool(approxEq(v.x, o.x) && approxEq(v.y, o.y));
      }
    case "is_zero_approx":
      arity(args, 0, "is_zero_approx");
      return V.bool(Math.abs(v.x) < CMP_EPS && Math.abs(v.y) < CMP_EPS);
    case "is_normalized": {
      arity(args, 0, "is_normalized");
      const ls = add(mul(v.x, v.x), mul(v.y, v.y));
      return V.bool(r(Math.abs(sub(ls, 1))) < NORMALIZED_EPS);
    }
    case "slide": {
      arity(args, 1, "slide");
      const n = vecArg(args, 0, "slide");
      if (!isUnit(n.x, n.y)) return vector2(0, 0);
      const d = add(mul(v.x, n.x), mul(v.y, n.y));
      return vector2(sub(v.x, mul(n.x, d)), sub(v.y, mul(n.y, d)));
    }
    case "reflect": {
      arity(args, 1, "reflect");
      const n = vecArg(args, 0, "reflect");
      if (!isUnit(n.x, n.y)) return vector2(0, 0);
      const k = mul(2, add(mul(v.x, n.x), mul(v.y, n.y)));
      return vector2(sub(mul(k, n.x), v.x), sub(mul(k, n.y), v.y));
    }
    case "bounce": {
      arity(args, 1, "bounce");
      const n = vecArg(args, 0, "bounce");
      if (!isUnit(n.x, n.y)) return vector2(0, 0);
      const k = mul(2, add(mul(v.x, n.x), mul(v.y, n.y)));
      return vector2(sub(v.x, mul(k, n.x)), sub(v.y, mul(k, n.y)));
    }
    case "project": {
      arity(args, 1, "project");
      const n = vecArg(args, 0, "project");
      const k = div(add(mul(v.x, n.x), mul(v.y, n.y)), add(mul(n.x, n.x), mul(n.y, n.y)));
      return vector2(mul(n.x, k), mul(n.y, k));
    }
    case "from_angle": {
      arity(args, 1, "from_angle");
      return fromAngle(scalar(args[0] as Variant, "from_angle"));
    }
    case "inverse":
      throw new GodotRuntimeError("vector2-method", `Invalid call. Nonexistent function 'inverse' in base 'Vector2'.`);
    default:
      throw new UnsupportedError("vector2-method", `Vector2.${name}() 未实现`);
  }
}

function normalized(x: number, y: number): Variant {
  const l = flen(x, y);
  if (l === 0) return vector2(0, 0);
  return vector2(div(x, l), div(y, l));
}

export function vecCmp(a: GVector2, b: GVector2): number {
  if (a.x !== b.x) return a.x < b.x ? -1 : 1;
  return a.y === b.y ? 0 : a.y < b.y ? -1 : 1;
}

export const CMP_EPS = r(1e-5);

export const NORMALIZED_EPS = r(1e-3);

export function approxEq(a: number, b: number): boolean {
  if (a === b) return true;
  const eps = mul(CMP_EPS, Math.abs(a));
  const minEps = eps < CMP_EPS ? CMP_EPS : eps;
  return r(Math.abs(sub(a, b))) < minEps;
}

/** 长度线性插值（float32 步进），slerp 与 lerp 都用它。 */
export function lerpLen(la: number, lb: number, w: number): number {
  return add(la, mul(sub(lb, la), w));
}

function vecSlot(key: Variant): 0 | 1 | null {
  if (key.t === Tag.INT) {
    const i = intToNum(key.v as IntPayload);
    return i === 0 ? 0 : i === 1 ? 1 : null;
  }
  if (key.t === Tag.STRING || key.t === Tag.STRING_NAME) {
    const s = key.v as string;
    return s === "x" ? 0 : s === "y" ? 1 : null;
  }
  return null;
}

export function vecFailKey(key: Variant, via: "prop" | "index" | "read", base: string, value?: Variant): never {
  const isName = key.t === Tag.STRING || key.t === Tag.STRING_NAME;
  const shown = isName ? (key.v as string) : String(key.v);
  const vt = value ? tagName(value.t) : "?";
  if (via === "read") {
    if (isName) {
      throw new GodotRuntimeError("vector2-index", `Invalid access to property or key '${shown}' on a base object of type '${base}'.`);
    }
    throw new GodotRuntimeError("vector2-index", `Invalid access of index '${shown}' on a base object of type: '${base}'.`);
  }
  if (via === "prop") {
    throw new GodotRuntimeError(
      "vector2-write",
      `Invalid assignment of property or key '${shown}' with value of type '${vt}' on a base object of type '${base}'.`,
    );
  }
  throw new GodotRuntimeError(
    "vector2-write",
    `Invalid assignment of index '${shown}' (on base: '${base}') with value of type '${vt}'.`,
  );
}

export function vecWrite(vec: GVector2, key: Variant, value: Variant, via: "prop" | "index"): Variant {
  const slot = vecSlot(key);
  if (slot === null) vecFailKey(key, via, "Vector2", value);
  if (value.t !== Tag.INT && value.t !== Tag.FLOAT) vecFailKey(key, via, "Vector2", value);
  const num = value.t === Tag.INT ? intToNum(value.v as IntPayload) : (value.v as number);
  return V.object(slot === 0 ? new GVector2(num, vec.y) : new GVector2(vec.x, num));
}

export function vecReadIndex(vec: GVector2, key: Variant): Variant {
  const slot = vecSlot(key);
  if (slot === null) vecFailKey(key, "read", "Vector2");
  return V.float(slot === 0 ? vec.x : vec.y);
}
