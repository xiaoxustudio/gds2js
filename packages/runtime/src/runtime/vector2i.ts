import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToBig, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { GVector2, clamp, registerVec2iParts, vecFailKey, vector2 } from "./vector2";

export class GVector2i {
  x: number;
  y: number;
  constructor(x: number | bigint, y: number | bigint) {
    this.x = wrap32(x);
    this.y = wrap32(y);
  }
}

registerVec2iParts((o: object): [number, number] | null => (o instanceof GVector2i ? [o.x, o.y] : null));

const U32 = 4294967296n;
const S32 = 2147483648n;

/** 先向零截断（float 实参），再按 int64 精确取模回绕到 int32。 */
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
/** `snapped` 那一族给的是**饱和**而不是回绕：`Vector2i(2147483647, -2147483648).snapped(Vector2i(5, 5))` 的第二支引擎留 `INT32_MIN`，回绕写法会给 `2147483646`（S306 的 SNAP 行）。 */
export function sat32(v: number | bigint): number {
  const b = typeof v === "bigint" ? v : BigInt(Math.trunc(v));
  if (b > 2147483647n) return 2147483647;
  if (b < -2147483648n) return -2147483648;
  return Number(b);
}

/** 不回绕的那一条：`length_squared` 给的是精确 int64。 */
const sq64 = (a: number, b: number) => BigInt(a) * BigInt(a) + BigInt(b) * BigInt(b);

export function vector2i(x: number | bigint, y: number | bigint): Variant {
  return V.object(new GVector2i(x, y));
}

export function asVec2i(v: Variant): GVector2i | null {
  return v.t === Tag.OBJECT && v.v instanceof GVector2i ? (v.v as GVector2i) : null;
}

/** 实参收成 int64：int 原样、float 向零截断，其余（包括 bool）响亮报错。 */
function intArg(v: Variant | undefined, who: string): number | bigint {
  if (v === undefined) throw new UnsupportedError("vector2i-arity", `Vector2i.${who} 缺少实参`);
  if (v.t === Tag.INT) return intToBig(v.v as IntPayload);
  // bool 在整数位上折 0 / 1（`Vector2i(1, 2).clampi(true, 1)` 实测照算，与 `Vector3i` 那一支同一条）
  if (v.t === Tag.BOOL) return BigInt(v.v ? 1 : 0);
  if (v.t === Tag.FLOAT) {
    const n = v.v as number;
    if (!Number.isFinite(n)) {
      throw new UnsupportedError("vector2i-arg", `Vector2i.${who} 收到非有限浮点，Godot 侧口径未探针`);
    }
    return BigInt(Math.trunc(n));
  }
  throw new UnsupportedError("vector2i-arg", `Vector2i.${who} 需要整数族实参，收到 ${tagName(v.t)}`);
}

/** `Vector2i()` → (0, 0)；一个实参收 Vector2 / Vector2i（逐分量截断）；两个实参是数值。 */
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

/** 声明成 `Vector2i` 的槽（变量初值、后续赋值、字段）：逐分量向零截断。 */
export function toVec2i(v: Variant): Variant {
  return vector2iNew([v]);
}

/** 常量表：有 ONE/ZERO/LEFT/RIGHT/UP/DOWN/MAX/MIN，**没有 INF**；`UP` 是 (0, -1)，与 Vector2 同向（2D 的 y 轴朝下）。 */
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

/** 轴常量：与 `Vector2` 同一组（实测 `AXIS_X` = 0、`AXIS_Y` = 1，`AXIS_Z` 解析期就拒），值也是 int。 */
const VEC2I_CONST_INT: Record<string, number> = { AXIS_X: 0, AXIS_Y: 1 };

export function vector2iConst(name: string): Variant {
  const c = VEC2I_CONST[name];
  if (c) return vector2i(c[0], c[1]);
  const i = VEC2I_CONST_INT[name];
  if (i !== undefined) return V.int(i);
  throw new UnsupportedError(
    "vector2i-const",
    `Vector2i.${name} 不存在（4.6.3 实测只有 ${[...Object.keys(VEC2I_CONST), ...Object.keys(VEC2I_CONST_INT)].join("/")}，INF 也没有）`,
  );
}

function vecArg(args: Variant[], i: number, who: string): GVector2i {
  const a = args[i];
  const v = a === undefined ? null : asVec2i(a);
  if (v) return v;
  // Vector2 交在 Vector2i 位上引擎逐分量折整数（`Vector2i(1, 2).max(Vector2(1, 2))` 实测 `(1, 2)`），与 `Vector2i(Vector2)` 构造式同一折法
  if (a !== undefined && a.t === Tag.OBJECT && a.v instanceof GVector2) {
    return new GVector2i(Math.trunc(a.v.x), Math.trunc(a.v.y));
  }
  throw new UnsupportedError("vector2i-arg", `Vector2i.${who} 的第 ${i + 1} 个实参需要 Vector2i`);
}

function arity(args: Variant[], n: number, who: string): void {
  if (args.length !== n) {
    throw new GodotRuntimeError("vector2i-arity", `Invalid call to function '${who}' in base 'Vector2i'. Expected ${n} argument(s).`);
  }
}

/** Vector2i 的方法面：Godot 里没有的成员（下面那一串 case）一律响亮报缺，别按 Vector2 的表照抄。 */
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
      return vector2i(clamp(v.x, lo.x, hi.x), clamp(v.y, lo.y, hi.y));
    }
    case "snapped": {
      arity(args, 1, "snapped");
      const o = vecArg(args, 0, "snapped");
      const snap = (n: number, s: number) => (s === 0 ? n : sat32(s * Math.floor(n / s + 0.5)));
      return vector2i(snap(v.x, o.x), snap(v.y, o.y));
    }
    case "mini": {
      arity(args, 1, "mini");
      const s = wrap32(intArg(args[0], "mini"));
      return vector2i(Math.min(v.x, s), Math.min(v.y, s));
    }
    case "maxi": {
      arity(args, 1, "maxi");
      const s = wrap32(intArg(args[0], "maxi"));
      return vector2i(Math.max(v.x, s), Math.max(v.y, s));
    }
    case "clampi": {
      arity(args, 2, "clampi");
      const lo = wrap32(intArg(args[0], "clampi"));
      const hi = wrap32(intArg(args[1], "clampi"));
      return vector2i(clamp(v.x, lo, hi), clamp(v.y, lo, hi));
    }
    case "snappedi": {
      arity(args, 1, "snappedi");
      const s = wrap32(intArg(args[0], "snappedi"));
      const snap = (n: number) => (s === 0 ? n : sat32(s * Math.floor(n / s + 0.5)));
      return vector2i(snap(v.x), snap(v.y));
    }
    case "length":
      arity(args, 0, "length");
      return V.float(Math.sqrt(Number(sq64(v.x, v.y))));
    case "length_squared":
      arity(args, 0, "length_squared");
      return V.int(sq64(v.x, v.y));
    case "aspect":
      arity(args, 0, "aspect");
      // 除法要折回 float32（`Vector2i(2147483647, -2147483648).aspect()` 引擎给 `-1.0`，double 那条给 `-0.99999999953434`；S311）
      return V.float(Math.fround(v.x / v.y));
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
      // 引擎是 `x < y ? 0 : 1`：并列给**后面**那个下标（(2,2) 给 1），`<=` 的写法会给 0 —— S304
      arity(args, 0, "min_axis_index");
      return V.int(v.x < v.y ? 0 : 1);
    case "max_axis_index":
      arity(args, 0, "max_axis_index");
      return V.int(v.x < v.y ? 1 : 0);
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
    case "inverse":
      throw new GodotRuntimeError("vector2i-method", `Invalid call. Nonexistent function '${name}' in base 'Vector2i'.`);
    default:
      throw new UnsupportedError("vector2i-method", `Vector2i.${name}() 未实现`);
  }
}

/** 字典序（先 x 再 y），与 Vector2/Vector3 同一口径。 */
export function vec2iCmp(a: GVector2i, b: GVector2i): number {
  if (a.x !== b.x) return a.x < b.x ? -1 : 1;
  return a.y === b.y ? 0 : a.y < b.y ? -1 : 1;
}

/** 键 → 槽位：0/1 与 `"x"`/`"y"` 都认。 */
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

/** 下标读：越界与负下标都报 `Invalid access of index …`。 */
export function vec2iReadIndex(vec: GVector2i, key: Variant): Variant {
  const slot = vec2iSlot(key);
  if (slot === null) vecFailKey(key, "read", "Vector2i");
  return V.int(slot === 0 ? vec.x : vec.y);
}

/** 写分量：实参必须是整数族（bool 报错），float **向零截断**，超出 int32 回绕。 */
export function vec2iWrite(vec: GVector2i, key: Variant, value: Variant, via: "prop" | "index"): Variant {
  const slot = vec2iSlot(key);
  if (slot === null) vecFailKey(key, via, "Vector2i", value);
  if (value.t !== Tag.INT && value.t !== Tag.FLOAT) vecFailKey(key, via, "Vector2i", value);
  const n = intArg(value, "分量写入");
  if (slot === 0) return vector2i(n, vec.y);
  return vector2i(vec.x, n);
}

/** 逐分量的整数除（向零截断、符号跟被除数、回绕 int32），除零报运行错。 */
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

/** 掺 float 标量会升级成 Vector2。 */
export function vec2iToFloat(a: GVector2i, k: number, op: "mul" | "div"): Variant {
  return op === "mul" ? vector2(a.x * k, a.y * k) : vector2(a.x / k, a.y / k);
}
