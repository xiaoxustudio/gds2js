import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import {
  CMP_EPS,
  NORMALIZED_EPS,
  type GVector2,
  approxEq,
  asVec2,
  clamp,
  lerpLen,
  vecFailKey,
  vector2,
  vector2New,
} from "./vector2";

export class GVector3 {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = Math.fround(x);
    this.y = Math.fround(y);
    this.z = Math.fround(z);
  }
}

const r = Math.fround;
const mul = (a: number, b: number) => r(a * b);
const div = (a: number, b: number) => r(a / b);
const add = (a: number, b: number) => r(a + b);
const sub = (a: number, b: number) => r(a - b);

export function vector3(x: number, y: number, z: number): Variant {
  return V.object(new GVector3(x, y, z));
}

/** 「这个对象是不是 Vector3i、是的话把三个分量交出来」那一格，由 `vector3i` 在自己模块里登记：反向 import 会成环，而交分量而不是布尔是因为判完再收结构视图会丢掉实例身份。两个入口各自认各自的类，所以 `Vector2()` 的单参分支不会把 Vector3i 误认成 Vector2i。 */
type Vec3iParts = (o: object) => [number, number, number] | null;

let vec3iParts: Vec3iParts | null = null;

export function registerVec3iParts(f: Vec3iParts): void {
  vec3iParts = f;
}

/** 取向量实例，不是 Vector3 对象则 null（ops / values 分派用）。 */
export function asVec3(v: Variant): GVector3 | null {
  return v.t === Tag.OBJECT && v.v instanceof GVector3 ? (v.v as GVector3) : null;
}

/** `Vector3(...)`：0 参给零向量，1 参收 Vector3（拷贝）与 Vector3i（逐分量升 float），其余必须三个数值。 */
export function vector3New(args: Variant[]): Variant {
  if (args.length === 0) return vector3(0, 0, 0);
  if (args.length === 1) {
    const o = asVec3(args[0] as Variant);
    if (o !== null) return vector3(o.x, o.y, o.z);
    const a = args[0] as Variant;
    const inner = a.t === Tag.OBJECT ? a.v : null;
    const parts = inner !== null && typeof inner === "object" && vec3iParts !== null ? vec3iParts(inner) : null;
    if (parts !== null) return vector3(parts[0] as number, parts[1] as number, parts[2] as number);
    throw new UnsupportedError("vector3-arg", `Vector3() 单参只收 Vector3 / Vector3i，收到 ${tagName(a.t)}`);
  }
  if (args.length !== 3) {
    throw new UnsupportedError("vector3-arity", `Vector3() 需要 0、1（Vector3）或 3 个参数（收到 ${args.length} 个）`);
  }
  return vector3(scalar(args[0], "Vector3"), scalar(args[1], "Vector3"), scalar(args[2], "Vector3"));
}

/** `Vector3.UP` 这类静态常量（Godot 只有这九个）。 */
const VEC3_CONST: Record<string, [number, number, number]> = {
  ZERO: [0, 0, 0],
  ONE: [1, 1, 1],
  INF: [Infinity, Infinity, Infinity],
  LEFT: [-1, 0, 0],
  RIGHT: [1, 0, 0],
  UP: [0, 1, 0],
  DOWN: [0, -1, 0],
  FORWARD: [0, 0, -1],
  BACK: [0, 0, 1],
};

/** 轴常量（`Vector3i` 那一张同形）：值实测是 int 0 / 1 / 2。 */
const VEC3_CONST_INT: Record<string, number> = { AXIS_X: 0, AXIS_Y: 1, AXIS_Z: 2 };

/** 八面体解码的式子（4.6.3 实测 169 格全中，`tmp/probe-oct/grid.txt`）：`t` 夹在 [0,1]，两个水平分量各走 `>= 0` 那一支。 */
function octaDecode(o: GVector2): Variant {
  const fx = sub(mul(o.x, 2), 1);
  const fy = sub(mul(o.y, 2), 1);
  const fz = sub(sub(1, Math.abs(fx)), Math.abs(fy));
  const t = clamp(-fz, 0, 1);
  return normalized(add(fx, fx >= 0 ? -t : t), add(fy, fy >= 0 ? -t : t), fz);
}

/** 解码的实参口：`Vector2` 直接收，`Vector2i` 走 `Vector2()` 那条升 float 的支（4.6.3 实测 `Vector3.octahedron_decode(Vector2i(0, 0))` 给 (0.0, 0.0, -1.0)），其余响亮报错。 */
function octArg(args: Variant[], i: number, who: string): GVector2 {
  const a = args[i];
  if (a === undefined) throw new UnsupportedError("vector3-arg", `Vector3.${who} 缺少实参`);
  const v = asVec2(a);
  if (v !== null) return v;
  const conv = asVec2(vector2New([a]));
  if (conv === null) throw new UnsupportedError("vector3-arg", `Vector3.${who} 的第 ${i + 1} 个实参需要 Vector2`);
  return conv;
}

/** `Vector3.` 上的静态成员：九个常量，加上 `octahedron_decode`（静态式与实例式共用一条式子，实例被忽略，实测过）。 */
export function vector3Const(name: string, args: Variant[] = []): Variant {
  if (args.length > 0 || name === "octahedron_decode") {
    switch (name) {
      case "octahedron_decode": {
        if (args.length !== 1) {
          throw new UnsupportedError(
            "vector3-arity",
            `Vector3.octahedron_decode() 只收 1 个 Vector2（收到 ${args.length} 个）`,
          );
        }
        return octaDecode(octArg(args, 0, "octahedron_decode"));
      }
      default:
        throw new UnsupportedError("vector3-static", `Vector3.${name}() 未实现（实测不存在或没探针）`);
    }
  }
  const c = VEC3_CONST[name];
  if (c) return vector3(c[0], c[1], c[2]);
  const i = VEC3_CONST_INT[name];
  if (i !== undefined) return V.int(i);
  throw new UnsupportedError(
    "vector3-const",
    `Vector3.${name} 不存在（4.6.3 实测只有 ${[...Object.keys(VEC3_CONST), ...Object.keys(VEC3_CONST_INT)].join("/")}）`,
  );
}

/** 标量实参：int/float 收成 number，其余响亮报错。 */
/** 数值实参在调用边界上就是 `real_t`：float 折回 float32（S313，与 `Vector2` 同一条）。 */
function scalar(v: Variant | undefined, who: string): number {
  if (v === undefined) throw new UnsupportedError("vector3-arity", `Vector3.${who} 缺少实参`);
  if (v.t === Tag.FLOAT) return r(v.v as number);
  if (v.t === Tag.INT) return intToNum(v.v as IntPayload);
  throw new UnsupportedError("vector3-arg", `Vector3.${who} 需要数值实参，收到 ${v.t}`);
}

function vecArg(args: Variant[], i: number, who: string): GVector3 {
  const a = args[i];
  const v = a === undefined ? null : asVec3(a);
  if (!v) throw new UnsupportedError("vector3-arg", `Vector3.${who} 的第 ${i + 1} 个实参需要 Vector3`);
  return v;
}

function arity(args: Variant[], n: number, who: string): void {
  if (args.length !== n) {
    // 运行期这一句的 N 取的是**声明的形参数**（带默认实参那族也报上界，实测 `a[2].from_hsv(0)` 给 4 而非 3；S305）
    throw new GodotRuntimeError("vector3-arity", `Invalid call to function '${who}' in base 'Vector3'. Expected ${n} argument(s).`);
  }
}

const lengthSq = (v: GVector3) => add(add(mul(v.x, v.x), mul(v.y, v.y)), mul(v.z, v.z));
const dot3 = (a: GVector3, b: GVector3) => add(add(mul(a.x, b.x), mul(a.y, b.y)), mul(a.z, b.z));
const flen = (x: number, y: number, z: number) => r(Math.sqrt(add(add(mul(x, x), mul(y, y)), mul(z, z))));

/** 与全局 `fposmod` 同一条实测口径：模数为 0 或商不有限都给 nan，负模数也走 `a - b*floor(a/b)` 这一支。 */
const fposmod = (a: number, b: number): number => (b === 0 || !Number.isFinite(a / b) ? NaN : a - b * Math.floor(a / b) + 0);

/** `is_normalized()` 那一条判据，与 Vector2 同一口径（epsilon 两侧实测过）。 */
const isUnit = (v: GVector3) => r(Math.abs(sub(lengthSq(v), 1))) < NORMALIZED_EPS;

/** Vector3 的方法面：未知成员响亮报缺。 */
export function vector3Method(v: GVector3, name: string, args: Variant[]): Variant {
  switch (name) {
    case "length":
      arity(args, 0, "length");
      return V.float(flen(v.x, v.y, v.z));
    case "length_squared":
      arity(args, 0, "length_squared");
      return V.float(lengthSq(v));
    case "distance_to": {
      arity(args, 1, "distance_to");
      const o = vecArg(args, 0, "distance_to");
      return V.float(flen(sub(o.x, v.x), sub(o.y, v.y), sub(o.z, v.z)));
    }
    case "distance_squared_to": {
      arity(args, 1, "distance_squared_to");
      const o = vecArg(args, 0, "distance_squared_to");
      const dx = sub(o.x, v.x);
      const dy = sub(o.y, v.y);
      const dz = sub(o.z, v.z);
      return V.float(add(add(mul(dx, dx), mul(dy, dy)), mul(dz, dz)));
    }
    case "direction_to": {
      arity(args, 1, "direction_to");
      const o = vecArg(args, 0, "direction_to");
      return normalized(sub(o.x, v.x), sub(o.y, v.y), sub(o.z, v.z));
    }
    case "normalized":
      arity(args, 0, "normalized");
      return normalized(v.x, v.y, v.z);
    case "dot": {
      arity(args, 1, "dot");
      const o = vecArg(args, 0, "dot");
      return V.float(add(add(mul(v.x, o.x), mul(v.y, o.y)), mul(v.z, o.z)));
    }
    case "cross": {
      arity(args, 1, "cross");
      const o = vecArg(args, 0, "cross");
      return vector3(
        sub(mul(v.y, o.z), mul(v.z, o.y)),
        sub(mul(v.z, o.x), mul(v.x, o.z)),
        sub(mul(v.x, o.y), mul(v.y, o.x)),
      );
    }
    case "abs":
      arity(args, 0, "abs");
      return vector3(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
    case "sign": {
      arity(args, 0, "sign");
      const s = (n: number) => (n > 0 ? 1 : n < 0 ? -1 : 0);
      return vector3(s(v.x), s(v.y), s(v.z));
    }
    case "floor":
      arity(args, 0, "floor");
      return vector3(Math.floor(v.x), Math.floor(v.y), Math.floor(v.z));
    case "ceil":
      arity(args, 0, "ceil");
      return vector3(Math.ceil(v.x), Math.ceil(v.y), Math.ceil(v.z));
    case "round": {
      arity(args, 0, "round");
      // 与 Vector2 同一条：先舍回 float32 再取整（S311）
      const h = (n: number) => (n < 0 ? Math.ceil(sub(n, 0.5)) : Math.floor(add(n, 0.5)));
      return vector3(h(v.x), h(v.y), h(v.z));
    }
    case "snapped": {
      arity(args, 1, "snapped");
      const o = vecArg(args, 0, "snapped");
      const snap = (n: number, s: number) => (s === 0 ? n : mul(s, Math.floor(add(div(n, s), 0.5))));
      return vector3(snap(v.x, o.x), snap(v.y, o.y), snap(v.z, o.z));
    }
    case "snappedf": {
      arity(args, 1, "snappedf");
      const s = scalar(args[0], "snappedf");
      const snap = (n: number) => (s === 0 ? n : mul(s, Math.floor(add(div(n, s), 0.5))));
      return vector3(snap(v.x), snap(v.y), snap(v.z));
    }
    case "minf": {
      arity(args, 1, "minf");
      const s = scalar(args[0], "minf");
      return vector3(Math.min(v.x, s), Math.min(v.y, s), Math.min(v.z, s));
    }
    case "maxf": {
      arity(args, 1, "maxf");
      const s = scalar(args[0], "maxf");
      return vector3(Math.max(v.x, s), Math.max(v.y, s), Math.max(v.z, s));
    }
    case "posmod": {
      arity(args, 1, "posmod");
      const s = scalar(args[0], "posmod");
      return vector3(fposmod(v.x, s), fposmod(v.y, s), fposmod(v.z, s));
    }
    case "posmodv": {
      arity(args, 1, "posmodv");
      const o = vecArg(args, 0, "posmodv");
      return vector3(fposmod(v.x, o.x), fposmod(v.y, o.y), fposmod(v.z, o.z));
    }
    case "lerp": {
      arity(args, 2, "lerp");
      const o = vecArg(args, 0, "lerp");
      const w = scalar(args[1], "lerp");
      return vector3(add(v.x, mul(sub(o.x, v.x), w)), add(v.y, mul(sub(o.y, v.y), w)), add(v.z, mul(sub(o.z, v.z), w)));
    }
    case "move_toward": {
      // 与 `Vector2` 那一条同形：`v + ((o - v) / len) * delta`，`len` 为零或不超过 `delta` 时直接落到目标（S313 的第 46 格：
      // 19 支 MT3 全合，之前那两格「差 1～3 ULP」是旧打印口径固定 6 位小数造成的假分岔 —— `|x| ≈ 14` 引擎只印 5 位）
      arity(args, 2, "move_toward");
      const o = vecArg(args, 0, "move_toward");
      const d = scalar(args[1], "move_toward");
      const vx = sub(o.x, v.x);
      const vy = sub(o.y, v.y);
      const vz = sub(o.z, v.z);
      const len = flen(vx, vy, vz);
      if (len === 0 || len <= d) return vector3(o.x, o.y, o.z);
      return vector3(add(v.x, mul(div(vx, len), d)), add(v.y, mul(div(vy, len), d)), add(v.z, mul(div(vz, len), d)));
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
      return vector3(bz(v.x, c1.x, c2.x, e.x), bz(v.y, c1.y, c2.y, e.y), bz(v.z, c1.z, c2.z, e.z));
    }
    case "bezier_derivative": {
      // 与 `Vector2` 同一支式子，每步折回 float32（`math_funcs.h` 的 float 那一支，134 格全合）
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
      return vector3(bd(v.x, c1.x, c2.x, e.x), bd(v.y, c1.y, c2.y, e.y), bd(v.z, c1.z, c2.z, e.z));
    }
    case "cubic_interpolate": {
      arity(args, 4, "cubic_interpolate");
      const b = vecArg(args, 0, "cubic_interpolate");
      const pre = vecArg(args, 1, "cubic_interpolate");
      const post = vecArg(args, 2, "cubic_interpolate");
      const w = scalar(args[3], "cubic_interpolate");
      const t2 = mul(w, w);
      const t3 = mul(w, t2);
      const cubic = (zero: number, one: number, two: number, three: number) => {
        const p0 = mul(2, one);
        const p1 = mul(sub(two, zero), w);
        // 两项系数按 C++ 源码的从左到右结合：`2p0 - 5p1 + 4p2 - p3` 与 `3*(p1 - p2) - p0 + p3`（S313：
        // 原来的 `(2p0+4p2)-5p1-p3` 与 `(3p1+p3)-p0-3p2` 在 3573.422 / 9058.08 / 1e7 那三格上各差 1 个 float32 ULP）
        const p2 = mul(sub(add(sub(mul(2, zero), mul(5, one)), mul(4, two)), three), t2);
        const p3 = mul(add(sub(mul(3, sub(one, two)), zero), three), t3);
        return mul(0.5, add(add(add(p0, p1), p2), p3));
      };
      return vector3(cubic(pre.x, v.x, b.x, post.x), cubic(pre.y, v.y, b.y, post.y), cubic(pre.z, v.z, b.z, post.z));
    }
    case "cubic_interpolate_in_time": {
      // 与 `Vector2` 那一条同形（S315）：段 [0,1] 的三次 Hermite，两端切线 = 相邻两段割线按另一侧跨度加权。
      // 跨度退化那一支同样响亮拒（引擎给有限值而这里要除零，式子没量出来）。
      arity(args, 7, "cubic_interpolate_in_time");
      const b = vecArg(args, 0, "cubic_interpolate_in_time");
      const pre = vecArg(args, 1, "cubic_interpolate_in_time");
      const post = vecArg(args, 2, "cubic_interpolate_in_time");
      const w = scalar(args[3], "cubic_interpolate_in_time");
      const g0 = sub(0, scalar(args[5], "cubic_interpolate_in_time"));
      const g1 = scalar(args[4], "cubic_interpolate_in_time");
      const g2 = sub(scalar(args[6], "cubic_interpolate_in_time"), g1);
      if (g0 === 0 || g1 === 0 || g2 === 0 || add(g0, g1) === 0 || add(g1, g2) === 0) {
        throw new UnsupportedError("vector3-method", "Vector3.cubic_interpolate_in_time() 的退化时间跨度（某段为零或相邻两段相消）没量出式子");
      }
      const t2 = mul(w, w);
      const t3 = mul(w, t2);
      const h00 = sub(sub(mul(2, t3), mul(3, t2)), -1);
      const h10 = sub(sub(t3, mul(2, t2)), -w);
      const h01 = add(mul(-2, t3), mul(3, t2));
      const h11 = sub(t3, t2);
      // 跨度按段长 g1 归一之后，切线才是「按 weight 那一段」的斜率（S315，与 Vector2 同一条）
      const a = div(g0, g1);
      const c = div(g2, g1);
      const one = 1;
      const it = (p0: number, p1: number, p2: number, p3: number) => {
        const d0 = div(sub(p1, p0), a);
        const d1 = sub(p2, p1);
        const d2 = div(sub(p3, p2), c);
        const m1 = div(add(mul(d0, one), mul(d1, a)), add(a, one));
        const m2 = div(add(mul(d1, c), mul(d2, one)), add(one, c));
        return add(add(add(mul(h00, p1), mul(h10, m1)), mul(h01, p2)), mul(h11, m2));
      };
      return vector3(it(pre.x, v.x, b.x, post.x), it(pre.y, v.y, b.y, post.y), it(pre.z, v.z, b.z, post.z));
    }
    case "min": {
      arity(args, 1, "min");
      const o = vecArg(args, 0, "min");
      return vector3(Math.min(v.x, o.x), Math.min(v.y, o.y), Math.min(v.z, o.z));
    }
    case "max": {
      arity(args, 1, "max");
      const o = vecArg(args, 0, "max");
      return vector3(Math.max(v.x, o.x), Math.max(v.y, o.y), Math.max(v.z, o.z));
    }
    case "clamp": {
      arity(args, 2, "clamp");
      const lo = vecArg(args, 0, "clamp");
      const hi = vecArg(args, 1, "clamp");
      return vector3(
        clamp(v.x, lo.x, hi.x),
        clamp(v.y, lo.y, hi.y),
        clamp(v.z, lo.z, hi.z),
      );
    }
    case "limit_length": {
      // 与 Vector2 同：`limit_length(length = 1.0)` 带默认实参，0 支也收（S304）
      if (args.length > 1) arity(args, 1, "limit_length");
      const max = args.length === 0 ? 1 : scalar(args[0], "limit_length");
      const len = flen(v.x, v.y, v.z);
      if (!(len > max)) return vector3(v.x, v.y, v.z);
      // 与 Vector2 同一条零长保护，门槛同样是「长度非零」（S304 的 LL3 / LLS 行）
      if (len === 0) return vector3(v.x, v.y, v.z);
      return vector3(mul(div(v.x, len), max), mul(div(v.y, len), max), mul(div(v.z, len), max));
    }
    case "angle_to": {
      arity(args, 1, "angle_to");
      const o = vecArg(args, 0, "angle_to");
      const cx = sub(mul(v.y, o.z), mul(v.z, o.y));
      const cy = sub(mul(v.z, o.x), mul(v.x, o.z));
      const cz = sub(mul(v.x, o.y), mul(v.y, o.x));
      const dot = add(add(mul(v.x, o.x), mul(v.y, o.y)), mul(v.z, o.z));
      return V.float(r(Math.atan2(flen(cx, cy, cz), dot)));
    }
    case "signed_angle_to": {
      arity(args, 2, "signed_angle_to");
      const o = vecArg(args, 0, "signed_angle_to");
      const ax = vecArg(args, 1, "signed_angle_to");
      const cx = sub(mul(v.y, o.z), mul(v.z, o.y));
      const cy = sub(mul(v.z, o.x), mul(v.x, o.z));
      const cz = sub(mul(v.x, o.y), mul(v.y, o.x));
      const signed = add(add(mul(cx, ax.x), mul(cy, ax.y)), mul(cz, ax.z));
      // 反平行那一格（`Vector3(1, 2, 3).signed_angle_to(Vector3(-1, -2, -3), Vector3(0, 0, 1))`）实测给 `pi`：
      // 既没有「叉积为零就先返 0」那道判据，`sign(0)` 也取 `+1`（S308）
      const dot = add(add(mul(v.x, o.x), mul(v.y, o.y)), mul(v.z, o.z));
      const ang = r(Math.atan2(flen(cx, cy, cz), dot));
      return V.float(r((signed < 0 ? -1 : 1) * ang));
    }
    case "min_axis_index": {
      // 式子照 4.6.3 的**严格** `<` 嵌套：并列时 min 给后面的下标、max 给前面的，NaN 走 else 分支（S304 的 21 格；镜像写法在两形上给出不同下标）
      arity(args, 0, "min_axis_index");
      return V.int(v.x < v.y ? (v.x < v.z ? 0 : 2) : v.y < v.z ? 1 : 2);
    }
    case "max_axis_index": {
      arity(args, 0, "max_axis_index");
      return V.int(v.x < v.y ? (v.y < v.z ? 2 : 1) : v.x < v.z ? 2 : 0);
    }
    case "inverse": {
      // 实测逐分量 1/x，**没有零保护**：(0,0,0) 给 (inf, inf, inf)、(INF,0,0) 给 (0.0, inf, inf)、(NAN,0,1) 给 (nan, inf, 1.0)
      arity(args, 0, "inverse");
      return vector3(div(1, v.x), div(1, v.y), div(1, v.z));
    }
    case "is_equal_approx": {
      arity(args, 1, "is_equal_approx");
      const o = vecArg(args, 0, "is_equal_approx");
      return V.bool(approxEq(v.x, o.x) && approxEq(v.y, o.y) && approxEq(v.z, o.z));
    }
    case "is_normalized": {
      arity(args, 0, "is_normalized");
      return V.bool(r(Math.abs(sub(lengthSq(v), 1))) < NORMALIZED_EPS);
    }
    case "is_zero_approx":
      arity(args, 0, "is_zero_approx");
      return V.bool(Math.abs(v.x) < CMP_EPS && Math.abs(v.y) < CMP_EPS && Math.abs(v.z) < CMP_EPS);
    case "clampf": {
      arity(args, 2, "clampf");
      const lo = scalar(args[0], "clampf");
      const hi = scalar(args[1], "clampf");
      return vector3(
        clamp(v.x, lo, hi),
        clamp(v.y, lo, hi),
        clamp(v.z, lo, hi),
      );
    }
    case "slerp": {
      arity(args, 2, "slerp");
      const o = vecArg(args, 0, "slerp");
      const w = scalar(args[1], "slerp");
      const la = flen(v.x, v.y, v.z);
      const lb = flen(o.x, o.y, o.z);
      const plain = () =>
        vector3(
          add(v.x, mul(sub(o.x, v.x), w)),
          add(v.y, mul(sub(o.y, v.y), w)),
          add(v.z, mul(sub(o.z, v.z), w)),
        );
      if (la === 0 || lb === 0) return plain();
      const sax = div(v.x, la);
      const say = div(v.y, la);
      const saz = div(v.z, la);
      const sbx = div(o.x, lb);
      const sby = div(o.y, lb);
      const sbz = div(o.z, lb);
      const d = add(add(mul(sax, sbx), mul(say, sby)), mul(saz, sbz));
      const dt = d < -1 ? -1 : d > 1 ? 1 : d;
      const theta = Math.acos(dt);
      const s = Math.sin(theta);
      if (Math.abs(s) < 1e-5) return plain();
      const t1 = Math.sin((1 - w) * theta) / s;
      const t2 = Math.sin(w * theta) / s;
      const len = lerpLen(la, lb, w);
      const ux = r(sax * t1 + sbx * t2);
      const uy = r(say * t1 + sby * t2);
      const uz = r(saz * t1 + sbz * t2);
      return vector3(mul(ux, len), mul(uy, len), mul(uz, len));
    }
    case "is_finite":
      arity(args, 0, "is_finite");
      return V.bool(Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z));
    case "slide": {
      arity(args, 1, "slide");
      const n = vecArg(args, 0, "slide");
      if (!isUnit(n)) return vector3(0, 0, 0);
      const d = dot3(v, n);
      return vector3(sub(v.x, mul(n.x, d)), sub(v.y, mul(n.y, d)), sub(v.z, mul(n.z, d)));
    }
    case "reflect": {
      arity(args, 1, "reflect");
      const n = vecArg(args, 0, "reflect");
      if (!isUnit(n)) return vector3(0, 0, 0);
      const k = mul(2, dot3(v, n));
      return vector3(sub(mul(k, n.x), v.x), sub(mul(k, n.y), v.y), sub(mul(k, n.z), v.z));
    }
    case "bounce": {
      arity(args, 1, "bounce");
      const n = vecArg(args, 0, "bounce");
      if (!isUnit(n)) return vector3(0, 0, 0);
      const k = mul(2, dot3(v, n));
      return vector3(sub(v.x, mul(k, n.x)), sub(v.y, mul(k, n.y)), sub(v.z, mul(k, n.z)));
    }
    case "project": {
      arity(args, 1, "project");
      const n = vecArg(args, 0, "project");
      const k = div(dot3(v, n), lengthSq(n));
      return vector3(mul(n.x, k), mul(n.y, k), mul(n.z, k));
    }
    case "octahedron_encode": {
      arity(args, 0, "octahedron_encode");
      const l1 = add(add(Math.abs(v.x), Math.abs(v.y)), Math.abs(v.z));
      const u = div(v.x, l1);
      const w = div(v.y, l1);
      let ou = u;
      let ow = w;
      if (v.z < 0) {
        ou = mul(sub(1, Math.abs(w)), u >= 0 ? 1 : -1);
        ow = mul(sub(1, Math.abs(u)), w >= 0 ? 1 : -1);
      }
      return vector2(add(mul(ou, 0.5), 0.5), add(mul(ow, 0.5), 0.5));
    }
    case "octahedron_decode": {
      arity(args, 1, "octahedron_decode");
      return octaDecode(octArg(args, 0, "octahedron_decode"));
    }
    default:
      throw new UnsupportedError("vector3-method", `Vector3.${name}() 未实现（实测不存在或没探针）`);
  }
}

/** 归一化：零向量原样返回，INF 给 nan。 */
function normalized(x: number, y: number, z: number): Variant {
  const l = flen(x, y, z);
  if (l === 0) return vector3(0, 0, 0);
  return vector3(div(x, l), div(y, l), div(z, l));
}

/** 比较的唯一口径：**字典序**（x → y → z），不是「每个分量都更大」；ops 的比较与 `Array.sort()` 都走这里。 */
export function vec3Cmp(a: GVector3, b: GVector3): number {
  if (a.x !== b.x) return a.x < b.x ? -1 : 1;
  if (a.y !== b.y) return a.y < b.y ? -1 : 1;
  return a.z === b.z ? 0 : a.z < b.z ? -1 : 1;
}

/** 键 → 分量槽位：0/1/2 与 `"x"`/`"y"`/`"z"` 都认。 */
function vec3Slot(key: Variant): 0 | 1 | 2 | null {
  if (key.t === Tag.INT) {
    const i = intToNum(key.v as IntPayload);
    return i === 0 ? 0 : i === 1 ? 1 : i === 2 ? 2 : null;
  }
  if (key.t === Tag.STRING || key.t === Tag.STRING_NAME) {
    const s = key.v as string;
    return s === "x" ? 0 : s === "y" ? 1 : s === "z" ? 2 : null;
  }
  return null;
}

/** 写分量：与 Vector2 同口径（只收 int/float、存下过 float32、越界与未知键都报错、不做尾部折算）。 */
export function vec3Write(vec: GVector3, key: Variant, value: Variant, via: "prop" | "index"): Variant {
  const slot = vec3Slot(key);
  if (slot === null) vecFailKey(key, via, "Vector3", value);
  if (value.t !== Tag.INT && value.t !== Tag.FLOAT) vecFailKey(key, via, "Vector3", value);
  const num = value.t === Tag.INT ? intToNum(value.v as IntPayload) : (value.v as number);
  if (slot === 0) return vector3(num, vec.y, vec.z);
  if (slot === 1) return vector3(vec.x, num, vec.z);
  return vector3(vec.x, vec.y, num);
}

/** 下标读：`v[0]` / `v["z"]` 都认，越界报 `Invalid access of index …`。 */
export function vec3ReadIndex(vec: GVector3, key: Variant): Variant {
  const slot = vec3Slot(key);
  if (slot === null) vecFailKey(key, "read", "Vector3");
  return V.float(slot === 0 ? vec.x : slot === 1 ? vec.y : vec.z);
}
