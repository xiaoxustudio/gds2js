import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToBig, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { GVector2, VEC2I_MARK, vecFailKey, vector2 } from "./vector2";

export class GVector2i {
  readonly [VEC2I_MARK] = true;
  x: number;
  y: number;
  constructor(x: number | bigint, y: number | bigint) {
    this.x = wrap32(x);
    this.y = wrap32(y);
  }
}

const U32 = 4294967296n;
const S32 = 2147483648n;

/** 先向零截断（float 实参），再按 int64 精确取模回绕到 int32（实测 p9/p10/n2/n4/m12）。 */
export function wrap32(v: number | bigint): number {
  const b = typeof v === "bigint" ? v : BigInt(Math.trunc(v));
  const m = ((b % U32) + U32) % U32;
  return Number(m >= S32 ? m - U32 : m);
}

/** int32 相加/相乘后立即回绕；除法与取模按 int64 算（除零另外拦），结果同样回绕。 */
const iadd = (a: number, b: number) => wrap32(BigInt(a) + BigInt(b));
const isub = (a: number, b: number) => wrap32(BigInt(a) - BigInt(b));
const imul = (a: number, b: number) => wrap32(BigInt(a) * BigInt(b));
const idiv = (a: number, b: number) => wrap32(BigInt(a) / BigInt(b));
const imod = (a: number, b: number) => wrap32(BigInt(a) % BigInt(b));
/** 不回绕的那两条（实测 m11：length_squared 给的是精确 int64） */
const sq64 = (a: number, b: number) => BigInt(a) * BigInt(a) + BigInt(b) * BigInt(b);

export function vector2i(x: number | bigint, y: number | bigint): Variant {
  return V.object(new GVector2i(x, y));
}

export function asVec2i(v: Variant): GVector2i | null {
  return v.t === Tag.OBJECT && v.v instanceof GVector2i ? (v.v as GVector2i) : null;
}

/** 实参收成 int64：int 原样、float 向零截断、Vector2/Vector2i 取分量，其余响亮报错。
 *  实测 `w.x = true` 是运行时报错（bool 不收），所以这里也不能放过 bool。 */
function intArg(v: Variant | undefined, who: string): number | bigint {
  if (v === undefined) throw new UnsupportedError("vector2i-arity", `Vector2i.${who} 缺少实参`);
  if (v.t === Tag.INT) return intToBig(v.v as IntPayload);
  if (v.t === Tag.FLOAT) {
    const n = v.v as number;
    if (!Number.isFinite(n)) {
      throw new UnsupportedError("vector2i-arg", `Vector2i.${who} 收到非有限浮点，Godot 侧口径未探针`);
    }
    return BigInt(Math.trunc(n));
  }
  throw new UnsupportedError("vector2i-arg", `Vector2i.${who} 需要整数族实参，收到 ${tagName(v.t)}`);
}

/** `Vector2i()` → (0, 0)；一个实参收 Vector2 / Vector2i（逐分量截断，实测 m1）；两个实参是数值。 */
export function vector2iNew(args: Variant[]): Variant {
  if (args.length === 0) return vector2i(0, 0);
  if (args.length === 1) {
    const a = args[0] as Variant;
    const f = a.t === Tag.OBJECT && a.v instanceof GVector2 ? (a.v as GVector2) : null;
    const g = asVec2i(a);
    if (f) return vector2i(f.x, f.y);
    if (g) return vector2i(g.x, g.y);
    throw new UnsupportedError("vector2i-arg", `Vector2i() 单参只收 Vector2 / Vector2i，收到 ${tagName(a.t)}`);
  }
  if (args.length !== 2) {
    throw new UnsupportedError("vector2i-arity", `Vector2i() 需要 0、1（向量）或 2 个参数（收到 ${args.length} 个）`);
  }
  return vector2i(intArg(args[0], "Vector2i"), intArg(args[1], "Vector2i"));
}

/**
 * 声明成 `Vector2i` 的槽（变量初值、后续赋值、字段）：`var v: Vector2i = Vector2(1.7, -2.9)`
 * 实测给 `(1, -2)` 且 `typeof` 仍是 6（`tmp/f69 w01` / `w03`，局部与字段同式）—— 逐分量向零截断。
 * 这条转换缺席时槽里存的就是 Vector2，于是打印与 `typeof` 一起错（我们旧行为是 `(1.7, -2.9)` / 5），
 * 那一格与 Vector3/Vector3i 同族，记在 S181。`Vector3 → Vector2i` 实测是解析期拒，走 `vector2iNew` 的报缺。
 */
export function toVec2i(v: Variant): Variant {
  return vector2iNew([v]);
}

/** 常量表：实测有 ONE/ZERO/LEFT/RIGHT/UP/DOWN/MAX/MIN，**没有 INF**（`Vector2i.INF` 是 Parse Error）。
 *  `UP` 是 (0, -1)，与 Vector2 同向（2D 的 y 轴朝下）。 */
const VEC2I_CONST: Record<string, [number, number]> = {
  ZERO: [0, 0],
  ONE: [1, 1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
  UP: [0, -1],
  DOWN: [0, 1],
  MAX: [2147483647, 2147483647],
  MIN: [-2147483648, -2147483648],
};

export function vector2iConst(name: string): Variant {
  const c = VEC2I_CONST[name];
  if (!c) {
    throw new UnsupportedError(
      "vector2i-const",
      `Vector2i.${name} 不存在（4.6.3 实测只有 ${Object.keys(VEC2I_CONST).join("/")}，INF 也没有）`,
    );
  }
  return vector2i(c[0], c[1]);
}

function vecArg(args: Variant[], i: number, who: string): GVector2i {
  const a = args[i];
  const v = a === undefined ? null : asVec2i(a);
  if (!v) throw new UnsupportedError("vector2i-arg", `Vector2i.${who} 的第 ${i + 1} 个实参需要 Vector2i`);
  return v;
}

function arity(args: Variant[], n: number, who: string): void {
  if (args.length !== n) {
    throw new UnsupportedError("vector2i-arity", `Vector2i.${who} 需要 ${n} 个实参（收到 ${args.length} 个）`);
  }
}

/**
 * Vector2i 的方法面。实测**不存在**的（问到即报缺，别按 Vector2 的表照抄）：
 * `is_normalized`、`is_equal_approx`、`normalized`、`direction_to`、`move_toward`、`floor`/`ceil`/`round`、
 * `clampf`/`snappedf`/`ceildiv`/`floordiv`/`posmod`/`signwrapping`。
 */
export function vector2iMethod(v: GVector2i, name: string, args: Variant[]): Variant {
  switch (name) {
    case "abs":
      arity(args, 0, "abs");
      return vector2i(wrap32(Math.abs(v.x)), wrap32(Math.abs(v.y)));
    case "sign": {
      arity(args, 0, "sign");
      const s = (n: number) => (n > 0 ? 1 : n < 0 ? -1 : 0);
      return vector2i(s(v.x), s(v.y));
    }
    case "min": {
      arity(args, 1, "min");
      const o = vecArg(args, 0, "min");
      return vector2i(Math.min(v.x, o.x), Math.min(v.y, o.y));
    }
    case "max": {
      arity(args, 1, "max");
      const o = vecArg(args, 0, "max");
      return vector2i(Math.max(v.x, o.x), Math.max(v.y, o.y));
    }
    case "clamp": {
      arity(args, 2, "clamp");
      const lo = vecArg(args, 0, "clamp");
      const hi = vecArg(args, 1, "clamp");
      return vector2i(Math.max(lo.x, Math.min(hi.x, v.x)), Math.max(lo.y, Math.min(hi.y, v.y)));
    }
    case "snapped": {
      arity(args, 1, "snapped");
      const o = vecArg(args, 0, "snapped");
      const snap = (n: number, s: number) => (s === 0 ? n : wrap32(s * Math.floor(n / s + 0.5)));
      return vector2i(snap(v.x, o.x), snap(v.y, o.y));
    }
    case "length":
      arity(args, 0, "length");
      return V.float(Math.sqrt(Number(sq64(v.x, v.y))));
    case "length_squared":
      arity(args, 0, "length_squared");
      return V.int(sq64(v.x, v.y));
    case "aspect":
      arity(args, 0, "aspect");
      return V.float(v.x / v.y);
    case "distance_to": {
      arity(args, 1, "distance_to");
      const o = vecArg(args, 0, "distance_to");
      const dx = isub(o.x, v.x);
      const dy = isub(o.y, v.y);
      return V.float(Math.hypot(dx, dy));
    }
    case "distance_squared_to": {
      arity(args, 1, "distance_squared_to");
      const o = vecArg(args, 0, "distance_squared_to");
      const dx = isub(o.x, v.x);
      const dy = isub(o.y, v.y);
      return V.int(BigInt(dx) * BigInt(dx) + BigInt(dy) * BigInt(dy));
    }
    case "min_axis_index":
      arity(args, 0, "min_axis_index");
      return V.int(v.x <= v.y ? 0 : 1);
    case "max_axis_index":
      arity(args, 0, "max_axis_index");
      return V.int(v.x >= v.y ? 0 : 1);
    case "is_normalized":
    case "is_equal_approx":
    case "normalized":
    case "direction_to":
    case "move_toward":
    case "floor":
    case "ceil":
    case "round":
    case "clampf":
    case "snappedf":
    case "ceildiv":
    case "floordiv":
    case "posmod":
    case "signwrapping":
      throw new UnsupportedError("vector2i-method", `Vector2i.${name}() 实测不存在（4.6.3 探针）`);
    default:
      throw new UnsupportedError("vector2i-method", `Vector2i.${name}() 未实现`);
  }
}

/** 字典序（先 x 再 y），与 Vector2/Vector3 同一口径（实测 n25）。 */
export function vec2iCmp(a: GVector2i, b: GVector2i): number {
  if (a.x !== b.x) return a.x < b.x ? -1 : 1;
  return a.y === b.y ? 0 : a.y < b.y ? -1 : 1;
}

/** 键 → 槽位：0/1 与 "x"/"y"（实测 `w["y"]` 读到 2；`w["z"]` 报 `Invalid access to property or key`）。 */
function vec2iSlot(key: Variant): 0 | 1 | null {
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

/** 下标读：实测越界与负下标都是 `Invalid access of index '5' on a base object of type: 'Vector2i'.` */
export function vec2iReadIndex(vec: GVector2i, key: Variant): Variant {
  const slot = vec2iSlot(key);
  if (slot === null) vecFailKey(key, "read", "Vector2i");
  return V.int(slot === 0 ? vec.x : vec.y);
}

/**
 * 写分量：实参必须是整数族（实测 bool 报错），float **向零截断**，超出 int32 回绕
 * （`w.x = 2.7` → 2、`w.x = -0.9` → 0、`w.x = 2147483648` → -2147483648）。
 */
export function vec2iWrite(vec: GVector2i, key: Variant, value: Variant, via: "prop" | "index"): Variant {
  const slot = vec2iSlot(key);
  if (slot === null) vecFailKey(key, via, "Vector2i", value);
  if (value.t !== Tag.INT && value.t !== Tag.FLOAT) vecFailKey(key, via, "Vector2i", value);
  const n = intArg(value, "分量写入");
  if (slot === 0) return vector2i(n, vec.y);
  return vector2i(vec.x, n);
}

/** 逐分量的整数除/取模（向零截断、符号跟被除数、回绕 int32）。
 *  除零实测文本：`Division by zero error in operator '/'.` 与 `Modulo by zero error in operator '%'.` */
export function div32(x: number, y: number): number {
  if (y === 0) throw new GodotRuntimeError("vector2i-div-zero", "Division by zero error in operator '/'.");
  return idiv(x, y);
}

export function mod32(x: number, y: number): number {
  if (y === 0) throw new GodotRuntimeError("vector2i-mod-zero", "Modulo by zero error in operator '%'.");
  return imod(x, y);
}

/** 加减乘的逐分量回绕版本（ops 用）。 */
export const add32 = iadd;
export const sub32 = isub;
export const mul32 = imul;

/** 掺 float 标量会升级成 Vector2（实测 p14：`/4.0` → (1.5, 1.5)、`*0.5` → (3.0, 3.0)）。 */
export function vec2iToFloat(a: GVector2i, k: number, op: "mul" | "div"): Variant {
  return op === "mul" ? vector2(a.x * k, a.y * k) : vector2(a.x / k, a.y / k);
}
