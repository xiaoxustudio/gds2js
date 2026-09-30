import { UnsupportedError } from "./errors";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { CMP_EPS, NORMALIZED_EPS, approxEq, lerpLen, vecFailKey } from "./vector2";

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

/**
 * Vector3i 的分类标记（与 `vector2.ts` 的 `VEC2I_MARK` 同一手法）：
 * 这一侧要认「单参构造收 Vector3i」，但不能 import `vector3i`（那成环）。
 * 两个符号**必须不同**，否则 `Vector2()` 的单参分支会把 Vector3i 误认成 Vector2i、悄悄少一个分量。
 */
export const VEC3I_MARK = Symbol("gds2js.Vector3i");

/** 取向量实例，不是 Vector3 对象则 null（ops / values 分派用）。 */
export function asVec3(v: Variant): GVector3 | null {
  return v.t === Tag.OBJECT && v.v instanceof GVector3 ? (v.v as GVector3) : null;
}

/** `Vector3(...)`：0 参给零向量，1 参收 Vector3（拷贝）与 Vector3i（逐分量升 float，实测 `tmp/f67 t07`），
 *  其余必须三个数值。实测 1 个数值是 Parse Error
 *  （`No constructor of "Vector3" matches the signature "Vector3(float)"`），`Vector3(Vector2, float)` 同样没有。 */
export function vector3New(args: Variant[]): Variant {
  if (args.length === 0) return vector3(0, 0, 0);
  if (args.length === 1) {
    const o = asVec3(args[0] as Variant);
    if (o !== null) return vector3(o.x, o.y, o.z);
    const a = args[0] as Variant;
    const duck = a.t === Tag.OBJECT ? (a.v as { x?: number; y?: number; z?: number } | null) : null;
    if (duck !== null && VEC3I_MARK in duck) return vector3(duck.x as number, duck.y as number, duck.z as number);
    throw new UnsupportedError("vector3-arg", `Vector3() 单参只收 Vector3 / Vector3i，收到 ${tagName(a.t)}`);
  }
  if (args.length !== 3) {
    throw new UnsupportedError("vector3-arity", `Vector3() 需要 0、1（Vector3）或 3 个参数（收到 ${args.length} 个）`);
  }
  return vector3(scalar(args[0], "Vector3"), scalar(args[1], "Vector3"), scalar(args[2], "Vector3"));
}

/** `Vector3.UP` 这类静态常量。实测 4.6.3 这九个（`Vector3.MAX` / `MIN` 直接是解析错误）。 */
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

export function vector3Const(name: string): Variant {
  const c = VEC3_CONST[name];
  if (!c) {
    throw new UnsupportedError(
      "vector3-const",
      `Vector3.${name} 不存在（4.6.3 实测只有 ${Object.keys(VEC3_CONST).join("/")}）`,
    );
  }
  return vector3(c[0], c[1], c[2]);
}

/** 标量实参：int/float 收成 number，其余响亮报错。 */
function scalar(v: Variant | undefined, who: string): number {
  if (v === undefined) throw new UnsupportedError("vector3-arity", `Vector3.${who} 缺少实参`);
  if (v.t === Tag.FLOAT) return v.v as number;
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
    throw new UnsupportedError("vector3-arity", `Vector3.${who} 需要 ${n} 个实参（收到 ${args.length} 个）`);
  }
}

const lengthSq = (v: GVector3) => add(add(mul(v.x, v.x), mul(v.y, v.y)), mul(v.z, v.z));
const flen = (x: number, y: number, z: number) => r(Math.sqrt(add(add(mul(x, x), mul(y, y)), mul(z, z))));

/**
 * Vector3 的方法面。**只实现探针钉住的语义**，其余响亮报缺：
 *  - `bounce` / `slide`：实参必须已是单位法向，否则 Godot 返回零向量并往 stderr 打
 *    `ERROR: The normal ... must be normalized.`（实测 f4 用 (0.1,0.2,0.3) 与 (1,1,1) 都给 (0,0,0)），
 *    那行文本产物复现不了 —— 与 Vector2 同一个拒绝理由；
 *  - `reflect`：六个实测点（(1,0,0)→(1,-2,-3)、(0,1,0)→(-1,2,-3)、(0,0,1)→(-1,-2,3)
 *    对上「2·proj−v」，可 (1,1,0)、(2,2,0)、(1,1,1)、(3,6,9) 全给 (0,0,0) 就对不上了），
 *    逆不出唯一公式，不猜；
 *  - `slerp`：标准球面插值 + 长度线性插值能复现到小数点后四位，但最后一位在 6 位小数打印下
 *    不足信（同 Vector2 的教训），报缺；
 *  - `is_zero_approx` / `clampf`：没探针，报缺；
 *  - 实测**不存在**的成员（`orthogonal`、`nlerp`、`from_size`、`lerpf`、`angle_to_signed`、
 *    `to_float32`、`to_double`、`to_int8_array`）走 default 那条报缺，别臆造。
 */
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
      const h = (n: number) => (n < 0 ? -Math.round(-n) : Math.round(n));
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
    case "lerp": {
      arity(args, 2, "lerp");
      const o = vecArg(args, 0, "lerp");
      const w = scalar(args[1], "lerp");
      return vector3(add(v.x, mul(sub(o.x, v.x), w)), add(v.y, mul(sub(o.y, v.y), w)), add(v.z, mul(sub(o.z, v.z), w)));
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
        const p2 = mul(sub(sub(add(mul(2, zero), mul(4, two)), mul(5, one)), three), t2);
        const p3 = mul(sub(sub(add(mul(3, one), three), zero), mul(3, two)), t3);
        return mul(0.5, add(add(add(p0, p1), p2), p3));
      };
      return vector3(cubic(pre.x, v.x, b.x, post.x), cubic(pre.y, v.y, b.y, post.y), cubic(pre.z, v.z, b.z, post.z));
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
        Math.max(lo.x, Math.min(hi.x, v.x)),
        Math.max(lo.y, Math.min(hi.y, v.y)),
        Math.max(lo.z, Math.min(hi.z, v.z)),
      );
    }
    case "limit_length": {
      arity(args, 1, "limit_length");
      const max = scalar(args[0], "limit_length");
      const len = flen(v.x, v.y, v.z);
      if (!(len > max)) return vector3(v.x, v.y, v.z);
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
    case "min_axis_index": {
      arity(args, 0, "min_axis_index");
      return V.int(v.x <= v.y ? (v.x <= v.z ? 0 : 2) : v.y <= v.z ? 1 : 2);
    }
    case "max_axis_index": {
      arity(args, 0, "max_axis_index");
      return V.int(v.x >= v.y ? (v.x >= v.z ? 0 : 2) : v.y >= v.z ? 1 : 2);
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
        Math.max(lo, Math.min(hi, v.x)),
        Math.max(lo, Math.min(hi, v.y)),
        Math.max(lo, Math.min(hi, v.z)),
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
    case "bounce":
    case "slide":
      throw new UnsupportedError("vector3-method", `Vector3.${name}() 未实现（法向不是单位向量时 Godot 给零向量还往 stderr 打一行，产物复现不了）`);
    case "reflect":
      throw new UnsupportedError("vector3-method", "Vector3.reflect() 未实现（六个实测点互相矛盾，逆不出唯一公式）");
    default:
      throw new UnsupportedError("vector3-method", `Vector3.${name}() 未实现（实测不存在或没探针）`);
  }
}

/** 归一化：零向量原样返回（实测 `Vector3.ZERO.normalized()` → (0.0, 0.0, 0.0)；INF 给 nan） */
function normalized(x: number, y: number, z: number): Variant {
  const l = flen(x, y, z);
  if (l === 0) return vector3(0, 0, 0);
  return vector3(div(x, l), div(y, l), div(z, l));
}

/**
 * 比较的唯一口径：**字典序**（先 x 再 y 再 z），不是「每个分量都更大」。
 * 实测：(1,2,3)<(1,2,4) 真、(1,3,0)<(2,0,0) 真、(0,1,9)<(0,2,0) 真、(1,2,3)<=(1,2,3) 真、
 * (1,2,3)>=(1,2,4) 假。ops 的比较与 Array.sort() 都走这里。
 */
export function vec3Cmp(a: GVector3, b: GVector3): number {
  if (a.x !== b.x) return a.x < b.x ? -1 : 1;
  if (a.y !== b.y) return a.y < b.y ? -1 : 1;
  return a.z === b.z ? 0 : a.z < b.z ? -1 : 1;
}

/** 键 → 分量槽位：0/1/2 与 "x"/"y"/"z" 都认（实测 `v["z"]` → 3.0、`v[2] = 8` → (1.0, 2.0, 8.0)）。 */
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

/** 下标读：`v[0]` / `v["z"]`，越界报错（实测 `v[3]`、`v[-1]` 都是 `Invalid access of index …`）。 */
export function vec3ReadIndex(vec: GVector3, key: Variant): Variant {
  const slot = vec3Slot(key);
  if (slot === null) vecFailKey(key, "read", "Vector3");
  return V.float(slot === 0 ? vec.x : slot === 1 ? vec.y : vec.z);
}
