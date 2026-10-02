import { UnsupportedError } from "./errors";
import { Tag, V, intToBig, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { vecFailKey } from "./vector2";
import { add32, div32, mod32, mul32, sub32, wrap32 } from "./vector2i";
import { GVector3, registerVec3iParts, vector3 } from "./vector3";

/**
 * Vector3i —— 第三个 int32 值类型（形状照 `vector2i.ts`，口径全部来自 4.6.3 实测：
 * `tmp/f67.txt` 17 支 + `tmp/f69.txt` 170 支 + `tmp/f70.txt` 26 支）。
 *
 * 三条不能从 Vector2i 照抄的结论：
 *  - **构造器没有「一个数」那一形**：`Vector3i(7)` 是解析期错
 *    （`No constructor of "Vector3i" matches the signature "Vector3i(int)".`），
 *    单参只认 Vector3 / Vector3i（`tmp/f67 t07`：`Vector3i(Vector3(1.7,-2.2,3.5))` → `(1, -2, 3)`）；
 *  - 三个分量都**向零截断 + 回绕 int32**（`t02` 写 `v.z = 7000000000` → -1589934592）；
 *  - `PackedVector3Array` 收 Vector3i 会**升成 Vector3**（`t12` 的 `r` 行），
 *    但反过来 `p[0] = Vector3i(...)` 是运行时报错（同一支的 stderr 那句）；
 *  - 静态量与 Vector2i / Vector3 都不同：**没有 `INF`**（Vector3 有），`UP` 是 `(0, 1, 0)`（Vector2i 是 `(0,-1)`），
 *    而 `AXIS_X` / `AXIS_Y` / `AXIS_Z` 是**整数 0/1/2**；配套的是 `axis_get` / `axis_set` 在这里**不存在**（Vector2i 有）。
 *    这三条都是「照隔壁那一族抄就正好错」的形状，别顺手补。
 */
export class GVector3i {
  x: number;
  y: number;
  z: number;
  constructor(x: number | bigint, y: number | bigint, z: number | bigint) {
    this.x = wrap32(x);
    this.y = wrap32(y);
    this.z = wrap32(z);
  }
}

export function vector3i(x: number | bigint, y: number | bigint, z: number | bigint): Variant {
  return V.object(new GVector3i(x, y, z));
}

registerVec3iParts((o: object): [number, number, number] | null => (o instanceof GVector3i ? [o.x, o.y, o.z] : null));

export function asVec3i(v: Variant): GVector3i | null {
  return v.t === Tag.OBJECT && v.v instanceof GVector3i ? (v.v as GVector3i) : null;
}

/** 实参收成 int64：int 原样、bool 当 1/0、float 向零截断（nan / ±inf 折成 0），其余响亮报错。 */
function intArg(v: Variant | undefined, who: string): bigint {
  if (v === undefined) throw new UnsupportedError("vector3i-arity", `Vector3i.${who} 缺少实参`);
  if (v.t === Tag.INT) return intToBig(v.v as IntPayload);
  // bool 也收（`tmp/f69 t70-ctor-bools`：`Vector3i(true, false, true)` → `(1, 0, 1)`）。
  // Vector2i 的同一格没量到，所以那边照旧不收 —— 别把这条搬过去。
  if (v.t === Tag.BOOL) return BigInt(v.v ? 1 : 0);
  if (v.t === Tag.FLOAT) {
    const n = v.v as number;
    // nan / ±inf 折成 **0**（`tmp/f69 t70-ctor-nan` → `(0, 1, 2)`、`t70-ctor-inf` → `(0, 0, 3)`）。
    // 这两格只在构造那一形量到；分量写入走的是同一条 intArg，写入侧没单独复测。
    if (!Number.isFinite(n)) return 0n;
    return BigInt(Math.trunc(n));
  }
  throw new UnsupportedError("vector3i-arg", `Vector3i.${who} 需要整数族实参，收到 ${tagName(v.t)}`);
}

/**
 * `Vector3i(...)`：0 参给零向量；1 参只收 Vector3（逐分量截断）与 Vector3i（拷贝）；
 * 3 参是数值（float 向零截断，`t16` 实测 `Vector3i(1, 2.5, 3)` → `(1, 2, 3)`）。
 * 一个数（`Vector3i(7)`）与两参、四参那几形 Godot 都在解析期就拒，我们编不出产物（响在同侧）。
 */
export function vector3iNew(args: Variant[]): Variant {
  if (args.length === 0) return vector3i(0, 0, 0);
  if (args.length === 1) {
    const a = args[0] as Variant;
    const inner = a.t === Tag.OBJECT ? (a.v as object) : null;
    if (inner instanceof GVector3) return vector3i(inner.x, inner.y, inner.z);
    if (inner instanceof GVector3i) return vector3i(inner.x, inner.y, inner.z);
    throw new UnsupportedError("vector3i-arg", `Vector3i() 单参只收 Vector3 / Vector3i，收到 ${tagName(a.t)}`);
  }
  if (args.length !== 3) {
    throw new UnsupportedError("vector3i-arity", `Vector3i() 需要 0、1（向量）或 3 个参数（收到 ${args.length} 个）`);
  }
  return vector3i(intArg(args[0], "Vector3i"), intArg(args[1], "Vector3i"), intArg(args[2], "Vector3i"));
}

/**
 * 声明成 `Vector3` 的槽收到 Vector3i：升成 float（`tmp/f67 t08` 的 `r3` 行 → `(4.0, 5.0, 6.0)`）。
 * `Vector2` 那一格也顺手接住（`tmp/f69` 的 w01/w02 量的是它，量到之前发的是报缺，不算静默）。
 */
export function toVec3(v: Variant): Variant {
  const inner = v.t === Tag.OBJECT ? (v.v as object) : null;
  if (inner instanceof GVector3) return V.object(new GVector3(inner.x, inner.y, inner.z));
  if (inner instanceof GVector3i) return V.object(new GVector3(inner.x, inner.y, inner.z));
  throw new UnsupportedError("vector3-slot", `Vector3 槽只量过收 Vector3 / Vector3i，收到 ${tagName(v.t)}`);
}

/** 声明成 `Vector3i` 的槽：只量过收 Vector3（逐分量向零截断，`t08` 的 `r2` 行）与 Vector3i。 */
export function toVec3i(v: Variant): Variant {
  const g = asVec3i(v);
  if (g !== null) return vector3i(g.x, g.y, g.z);
  const inner = v.t === Tag.OBJECT ? (v.v as object) : null;
  if (inner instanceof GVector3) return vector3i(inner.x, inner.y, inner.z);
  throw new UnsupportedError("vector3i-slot", `Vector3i 槽只量过收 Vector3 / Vector3i，收到 ${tagName(v.t)}`);
}

/**
 * 静态常量表（`tmp/f69 t40` 的 16 支一格一支量完）。两条要点：
 *  - **没有 `INF`**（`Cannot find member "INF" in base "Vector3i".`），而 Vector3 有 —— 别照抄；
 *  - **`AXIS_X` / `AXIS_Y` / `AXIS_Z` 是整数 0 / 1 / 2，不是向量**（实测 `print(Vector3i.AXIS_X)` 给 `0`、
 *    `typeof` 给 2）。这与 `Vector3i.axis_get(...)` 不存在配套：这一族的「轴」是下标常量。
 *  `UP` 是 (0, 1, 0)、`DOWN` 是 (0, -1, 0) —— 与 Vector3 同向（3D 的 y 轴朝上）。
 */
const VEC3I_CONST_VEC: Record<string, [number, number, number]> = {
  ZERO: [0, 0, 0],
  ONE: [1, 1, 1],
  LEFT: [-1, 0, 0],
  RIGHT: [1, 0, 0],
  UP: [0, 1, 0],
  DOWN: [0, -1, 0],
  FORWARD: [0, 0, -1],
  BACK: [0, 0, 1],
  MAX: [2147483647, 2147483647, 2147483647],
  MIN: [-2147483648, -2147483648, -2147483648],
};
const VEC3I_CONST_INT: Record<string, number> = { AXIS_X: 0, AXIS_Y: 1, AXIS_Z: 2 };

export function vector3iConst(name: string): Variant {
  const v = VEC3I_CONST_VEC[name];
  if (v) return vector3i(v[0], v[1], v[2]);
  const i = VEC3I_CONST_INT[name];
  if (i !== undefined) return V.int(i);
  throw new UnsupportedError(
    "vector3i-const",
    `Vector3i.${name} 不存在（4.6.3 实测只有 ${[...Object.keys(VEC3I_CONST_VEC), ...Object.keys(VEC3I_CONST_INT)].join("/")}，INF 也没有）`,
  );
}

/** 字典序（x → y → z），与 Vector2 / Vector3 / Vector2i 同一口径。 */
export function vec3iCmp(a: GVector3i, b: GVector3i): number {
  if (a.x !== b.x) return a.x < b.x ? -1 : 1;
  if (a.y !== b.y) return a.y < b.y ? -1 : 1;
  return a.z === b.z ? 0 : a.z < b.z ? -1 : 1;
}

/** 键 → 槽位：0/1/2 与 "x"/"y"/"z"。 */
function vec3iSlot(key: Variant): 0 | 1 | 2 | null {
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

/** 下标读（`tmp/f67 t17` 实测 `v[1]` → 2；越界与负下标沿用 Vector2i 那两条实测文本口径）。 */
export function vec3iReadIndex(vec: GVector3i, key: Variant): Variant {
  const slot = vec3iSlot(key);
  if (slot === null) vecFailKey(key, "read", "Vector3i");
  return V.int(slot === 0 ? vec.x : slot === 1 ? vec.y : vec.z);
}

/**
 * 写分量：整数族实参，float 向零截断、超出 int32 回绕（`tmp/f67 t02`：
 * `v.x = 2.7` → 2、`v.y = -2.7` → -2、`v.z = 7000000000` → -1589934592）。
 */
export function vec3iWrite(vec: GVector3i, key: Variant, value: Variant, via: "prop" | "index"): Variant {
  const slot = vec3iSlot(key);
  if (slot === null) vecFailKey(key, via, "Vector3i", value);
  if (value.t !== Tag.INT && value.t !== Tag.FLOAT) vecFailKey(key, via, "Vector3i", value);
  const n = intArg(value, "分量写入");
  if (slot === 0) return vector3i(n, vec.y, vec.z);
  if (slot === 1) return vector3i(vec.x, n, vec.z);
  return vector3i(vec.x, vec.y, n);
}

/**
 * 逐分量的 int32 算式。回绕、向零截断、除零与取模零那四套口径**全部复用 `vector2i.ts` 的那一份**
 * （`tmp/f67 t03` 的六行与 `t14`/`t15` 的两句文本都与之逐字对上）：
 * 两处各写一遍正是 S154 警告的分叉温床。
 */
export const v3iAdd = (a: GVector3i, b: GVector3i): Variant =>
  vector3i(add32(a.x, b.x), add32(a.y, b.y), add32(a.z, b.z));
export const v3iSub = (a: GVector3i, b: GVector3i): Variant =>
  vector3i(sub32(a.x, b.x), sub32(a.y, b.y), sub32(a.z, b.z));
export const v3iMul = (a: GVector3i, b: GVector3i): Variant =>
  vector3i(mul32(a.x, b.x), mul32(a.y, b.y), mul32(a.z, b.z));
export const v3iDiv = (a: GVector3i, b: GVector3i): Variant =>
  vector3i(div32(a.x, b.x), div32(a.y, b.y), div32(a.z, b.z));
export const v3iMod = (a: GVector3i, b: GVector3i): Variant =>
  vector3i(mod32(a.x, b.x), mod32(a.y, b.y), mod32(a.z, b.z));
/** 标量那一侧（实测 `a * 2` / `2 * a` / `a / 2` / `a % -2` 都逐分量同式）。 */
export const v3iMulK = (a: GVector3i, k: number): Variant => vector3i(mul32(a.x, k), mul32(a.y, k), mul32(a.z, k));
export const v3iDivK = (a: GVector3i, k: number): Variant => vector3i(div32(a.x, k), div32(a.y, k), div32(a.z, k));
export const v3iModK = (a: GVector3i, k: number): Variant => vector3i(mod32(a.x, k), mod32(a.y, k), mod32(a.z, k));
/** 取负走「0 减」，于是 `MIN` 取负按同一规则回绕（`tmp/f69 t80` 钉这一格）。 */
export const v3iNeg = (a: GVector3i): Variant => vector3i(sub32(0, a.x), sub32(0, a.y), sub32(0, a.z));

/**
 * 掺 float 标量升级成 Vector3（`tmp/f70 p21`：`Vector3i(6, 4, 2) / 4.0` → `(1.5, 1.0, 0.5)`、typeof 9；
 * `p22`：`* 0.5` → `(3.0, 2.0, 1.0)`）。与 Vector2i 同一形状。**左边**放 float 标量那一格没量到
 * （`p23` 只量到 `4 / Vector3i` 是解析期拒），所以 ops 那侧只接右边。
 */
export function vec3iToFloat(a: GVector3i, k: number, op: "mul" | "div"): Variant {
  return op === "mul" ? vector3(a.x * k, a.y * k, a.z * k) : vector3(a.x / k, a.y / k, a.z / k);
}

/**
 * 方法面（`tmp/f69` 的 ①–④ 组逐格量，46 个名字里 **30 个不存在**）。
 *
 * 实测**不存在**的（问到就报缺，别按 Vector2i / Vector3 的表照抄）：
 * `axis_get` / `axis_set`（**Vector2i 有、Vector3i 没有**）、`hash`、`dot`、`cross`、`normalized`、
 * `direction_to`、`move_toward`、`lerp`、`bounce`、`reflect`、`same_sign`、`is_equal_approx`、
 * `is_zero_approx`、`angle_to`、`aspect`、`octant`、`count_zeros`、`to_vector3`、`floor`/`ceil`/`round`、
 * `floorf`/`ceilf`/`roundf`、`snappedf`、`snapn`、`posmod`/`posmodv`、`floordiv`/`ceildiv`、`signwrapping`、`pow`。
 * `max()` / `min()` 与 `clamp()` **都要实参**（零参是解析期 `Too few arguments for "max()" call.`，
 * 两个实参是解析期 `Too many arguments for "max()" call. Expected at most 1 but received 2.`）。
 */
export function vector3iMethod(v: GVector3i, name: string, args: Variant[]): Variant {
  switch (name) {
    case "abs": {
      arity(args, 0, "abs");
      // 实测 `Vector3i(3, -4, 12).abs()` → `(3, 4, 12)`（`t00`）。MIN 那一格的 abs 会回绕，
      // 用的就是 wrap32；`-2147483648` 那一格本身没量 → Math.abs 后仍走回绕，不静默给正数。
      const a = (n: number) => wrap32(Math.abs(n));
      return vector3i(a(v.x), a(v.y), a(v.z));
    }
    case "sign": {
      arity(args, 0, "sign");
      const s = (n: number) => (n > 0 ? 1 : n < 0 ? -1 : 0);
      // `t00` 实测 `Vector3i(3, -4, 12).sign()` → `(1, -1, 1)`
      return vector3i(s(v.x), s(v.y), s(v.z));
    }
    case "min": {
      arity(args, 1, "min");
      const o = vecArg(args, 0, "min");
      // `t20` 实测 `Vector3i(3, -4, 12).min(Vector3i(1, 2, 3))` → `(1, -4, 3)`：逐分量取小
      return vector3i(Math.min(v.x, o.x), Math.min(v.y, o.y), Math.min(v.z, o.z));
    }
    case "max": {
      arity(args, 1, "max");
      const o = vecArg(args, 0, "max");
      // 同上的取大那一格 → `(3, 2, 12)`
      return vector3i(Math.max(v.x, o.x), Math.max(v.y, o.y), Math.max(v.z, o.z));
    }
    case "clamp": {
      arity(args, 2, "clamp");
      const lo = vecArg(args, 0, "clamp");
      const hi = vecArg(args, 1, "clamp");
      // `t30` 实测 `Vector3i(3, -4, 12).clamp(Vector3i(0,0,0), Vector3i(5,5,5))` → `(3, 0, 5)`
      return vector3i(
        Math.max(lo.x, Math.min(hi.x, v.x)),
        Math.max(lo.y, Math.min(hi.y, v.y)),
        Math.max(lo.z, Math.min(hi.z, v.z)),
      );
    }
    case "length":
      arity(args, 0, "length");
      // `t00`：(3, -4, 12) → 13.0（float，typeof 3）
      return V.float(Math.sqrt(Number(sq64v3(v))));
    case "length_squared":
      arity(args, 0, "length_squared");
      // `t00`：→ 169（int，不回绕的 int64，与 Vector2i 的 m11 同一口径）
      return V.int(sq64v3(v));
    case "min_axis_index":
      arity(args, 0, "min_axis_index");
      // `t10`：(3, -4, 12) → 1（最小的分量是 y）
      return V.int(v.x <= v.y && v.x <= v.z ? 0 : v.y <= v.z ? 1 : 2);
    case "max_axis_index":
      arity(args, 0, "max_axis_index");
      // `t10` 重跑：→ 2（最大的分量是 z）
      return V.int(v.x >= v.y && v.x >= v.z ? 0 : v.y >= v.z ? 1 : 2);
    case "distance_to": {
      arity(args, 1, "distance_to");
      const o = vecArg(args, 0, "distance_to");
      // `t20`：到 (0,0,0) → 13.0（float）
      return V.float(Math.sqrt(Number(sq64d3(v, o))));
    }
    case "distance_squared_to": {
      arity(args, 1, "distance_squared_to");
      const o = vecArg(args, 0, "distance_squared_to");
      // `t20`：到 (1,1,1) → 150（**int**，与 length_squared 同一口径）
      return V.int(sq64d3(v, o));
    }
    case "snapped": {
      arity(args, 1, "snapped");
      const o = vecArg(args, 0, "snapped");
      // `tmp/f70 p10–p13`：`Vector3i(3, -4, 12).snapped(Vector3i(5, 5, 5))` → `(5, -5, 10)`，
      // 步长为 0 的那一维原样不动（p12），步长 1 就是恒等（p13），负步长同样成立（p11 的 x 给 5）。
      // 式子与 Vector2i 的 snapped 同一条（先除、+0.5 再 floor、乘回步长）。
      const snap = (n: number, s: number) => (s === 0 ? n : wrap32(s * Math.floor(n / s + 0.5)));
      return vector3i(snap(v.x, o.x), snap(v.y, o.y), snap(v.z, o.z));
    }
    case "axis_get":
    case "axis_set":
    case "hash":
    case "dot":
    case "cross":
    case "normalized":
    case "direction_to":
    case "move_toward":
    case "lerp":
    case "bounce":
    case "reflect":
    case "same_sign":
    case "is_equal_approx":
    case "is_zero_approx":
    case "angle_to":
    case "aspect":
    case "octant":
    case "count_zeros":
    case "to_vector3":
    case "floor":
    case "ceil":
    case "round":
    case "floorf":
    case "ceilf":
    case "roundf":
    case "snappedf":
    case "snapn":
    case "posmod":
    case "posmodv":
    case "floordiv":
    case "ceildiv":
    case "signwrapping":
    case "pow":
      throw new UnsupportedError("vector3i-method", `Vector3i.${name}() 实测不存在（4.6.3 探针 tmp/f69）`);
    default:
      throw new UnsupportedError("vector3i-method", `Vector3i.${name}() 未实现`);
  }
}

/** 实参个数（对不上是运行期那句 `Invalid call. ...`，这里先按报缺挡；实测文本只有零参那一族量过）。 */
function arity(args: Variant[], n: number, who: string): void {
  if (args.length !== n) {
    throw new UnsupportedError("vector3i-arity", `Vector3i.${who} 需要 ${n} 个实参（收到 ${args.length} 个）`);
  }
}

function vecArg(args: Variant[], i: number, who: string): GVector3i {
  const a = args[i];
  const v = a === undefined ? null : asVec3i(a);
  if (!v) throw new UnsupportedError("vector3i-arg", `Vector3i.${who} 的第 ${i + 1} 个实参需要 Vector3i`);
  return v;
}

/** 精确 int64 的平方和（`length_squared` / `distance_squared_to` 都不回绕，实测 150 / 169 是 int）。 */
const sq64v3 = (v: GVector3i) => BigInt(v.x) * BigInt(v.x) + BigInt(v.y) * BigInt(v.y) + BigInt(v.z) * BigInt(v.z);
const sq64d3 = (a: GVector3i, b: GVector3i) => {
  const dx = BigInt(a.x) - BigInt(b.x);
  const dy = BigInt(a.y) - BigInt(b.y);
  const dz = BigInt(a.z) - BigInt(b.z);
  return dx * dx + dy * dy + dz * dz;
};
