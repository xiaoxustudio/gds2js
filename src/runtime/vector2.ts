import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "./tags";

/**
 * 二维向量 —— GDScript 内建的数学类型。
 *
 * **分量是 32 位 float**（探针实测，不是打印造成的）：
 *   `Vector2(1e15, 0).x == 1e15` → **false**，`.x` 单独打印给 `999999986991104.0`；
 *   `Vector2(0.1, 0).x` → `0.10000000149012`；`Vector2(0.1,0) == Vector2(0.100000001,0)` → **true**。
 * 所以在构造处统一 `Math.fround`：算术结果也都是"新建一个 GVector2"，于是同样落到 float32，
 * 与 Godot 的 real_t=float 一致（`Vector2(1e15,1)*2` → `(1999999973982208.0, 2.0)` 实测）。
 *
 * **算术也必须每步都 fround**，不能"先用 double 算完再舍入"。判别点：
 * `Vector2(0.1,0.2).dot(Vector2(0.1,0.2))` → Godot 给 `0.05000000447035`，
 * 逐步 float32 正好是这个值，而 double 中间量最后一步舍入会给 `0.05000000074506`。
 * 下面凡是产数值的都写作 `r(...)` 嵌套；标量结果（length/dot/angle/aspect…）同样返回 float32。
 *
 * 注意：打印**不**走通用浮点规则，另有 6 位小数的专用格式（见 values.ts 的 strVec2）。
 */
export class GVector2 {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = Math.fround(x);
    this.y = Math.fround(y);
  }
}

const r = Math.fround;

export function vector2(x: number, y: number): Variant {
  return V.object(new GVector2(x, y));
}

/** 取向量实例，不是 Vector2 对象则 null（ops 里分派用）。 */
export function asVec2(v: Variant): GVector2 | null {
  return v.t === Tag.OBJECT && v.v instanceof GVector2 ? (v.v as GVector2) : null;
}

/** `Vector2(...)` 构造：0 参给零向量（实测 `Vector2()` → `(0.0, 0.0)`），其余必须两参。 */
export function vector2New(args: Variant[]): Variant {
  if (args.length === 0) return vector2(0, 0);
  if (args.length !== 2) {
    throw new UnsupportedError("vector2-arity", `Vector2() 需要 0 或 2 个参数（收到 ${args.length} 个）`);
  }
  return vector2(scalar(args[0], "Vector2"), scalar(args[1], "Vector2"));
}

/** `Vector2.UP` 这类静态常量。实测 4.6.3 只有这七个（`Vector2.NAN` 直接是解析错误）。 */
const VEC2_CONST: Record<string, [number, number]> = {
  ZERO: [0, 0],
  ONE: [1, 1],
  INF: [Infinity, Infinity],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
  UP: [0, -1],
  DOWN: [0, 1],
};

export function vector2Const(name: string): Variant {
  const c = VEC2_CONST[name];
  if (!c) {
    throw new UnsupportedError("vector2-const", `Vector2.${name} 不存在（4.6.3 实测只有 ${Object.keys(VEC2_CONST).join("/")}）`);
  }
  return vector2(c[0], c[1]);
}

/** 标量实参：int/float 收成 number，其余响亮报错。 */
function scalar(v: Variant | undefined, who: string): number {
  if (v === undefined) throw new UnsupportedError("vector2-arity", `Vector2.${who} 缺少实参`);
  if (v.t === Tag.FLOAT) return v.v as number;
  if (v.t === Tag.INT) return intToNum(v.v as number | bigint);
  throw new UnsupportedError("vector2-arg", `Vector2.${who} 需要数值实参，收到 ${v.t}`);
}

function vecArg(args: Variant[], i: number, who: string): GVector2 {
  const a = args[i];
  const v = a === undefined ? null : asVec2(a);
  if (!v) throw new UnsupportedError("vector2-arg", `Vector2.${who} 的第 ${i + 1} 个实参需要 Vector2`);
  return v;
}

function arity(args: Variant[], n: number, who: string): void {
  if (args.length !== n) {
    throw new UnsupportedError("vector2-arity", `Vector2.${who} 需要 ${n} 个实参（收到 ${args.length} 个）`);
  }
}

/** 逐分量 float32 运算的积木（每个中间量都舍回 float32）。 */
const mul = (a: number, b: number) => r(a * b);
const div = (a: number, b: number) => r(a / b);
const add = (a: number, b: number) => r(a + b);
const sub = (a: number, b: number) => r(a - b);
const flen = (x: number, y: number) => r(Math.sqrt(add(mul(x, x), mul(y, y))));

/**
 * Vector2 的方法面。**只实现探针钉住的语义**；测不准的（slerp / slide / bounce /
 * is_equal_approx / is_normalized）一律响亮报缺，宁可编不过也不要静默给错值：
 *  - `slerp`：三种候选实现（角度+长度 lerp、归一化后旋转）在 6 位小数打印的最后一位上
 *    各自与实测差 1 ulp，逆不出 Godot 的确切算法；
 *  - `slide`/`bounce`：要求法向量已归一，否则 Godot 除了返回零向量还往 stderr 打
 *    `ERROR: The normal ... must be normalized.`，那行文本我们复现不了；
 *  - `is_equal_approx`/`is_normalized`：容差阈值按实测落在两个候选之间（相对 8e-6 与 1e-5 之间、
 *    绝对 1.1e-4 与 2e-4 之间），现有数据不足以钉死。
 */
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
      // Godot 用 C 的 roundf：半数**远离零**。JS 的 Math.round 是半数向正无穷（-2.5 → -2），照抄会静默错。
      arity(args, 0, "round");
      const h = (n: number) => (n < 0 ? -Math.round(-n) : Math.round(n));
      return vector2(h(v.x), h(v.y));
    }
    case "snapped": {
      // 实测 = `step * floor(value / step + 0.5)`，且 step 分量为 0 时**原样返回**该分量
      // （(3,4).snapped(Vector2(0,1)) → (3.0, 4.0)，不是 nan）。
      arity(args, 1, "snapped");
      const o = vecArg(args, 0, "snapped");
      const snap = (n: number, s: number) => (s === 0 ? n : mul(s, Math.floor(add(div(n, s), 0.5))));
      return vector2(snap(v.x, o.x), snap(v.y, o.y));
    }
    case "lerp": {
      arity(args, 2, "lerp");
      const o = vecArg(args, 0, "lerp");
      const w = scalar(args[1], "lerp");
      return vector2(add(v.x, mul(sub(o.x, v.x), w)), add(v.y, mul(sub(o.y, v.y), w)));
    }
    case "move_toward": {
      // 实测：`len <= delta` 或 len 为 0 就直接给目标点；否则沿方向走 delta（delta 为负会**倒退**）。
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
      arity(args, 1, "limit_length");
      const max = scalar(args[0], "limit_length");
      const len = flen(v.x, v.y);
      if (!(len > max)) return vector2(v.x, v.y);
      return vector2(mul(div(v.x, len), max), mul(div(v.y, len), max));
    }
    case "orthogonal":
      // 实测 (3,4) → (4.0, -3.0)、(-3,4) → (4.0, 3.0)、(0,-5) → (-5.0, 0.0)，即 (y, -x)
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
      // (0,0).angle() → 0.0（atan2(0,0) 本来就是 +0），实测无需特判
      arity(args, 0, "angle");
      return V.float(r(Math.atan2(v.y, v.x)));
    case "angle_to": {
      // 实测 (3,4).angle_to(Vector2(0,0)) → 0.0、angle_to(自身) → 0.0：atan2(cross, dot) 自然给出，
      // 不需要零向量特判（Godot 就是 `atan2(cross, dot)`）。
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
      // 实测 (1.5,-2.5).aspect() → -0.60000002384186（float32 的 -0.6），(0,0) → nan
      arity(args, 0, "aspect");
      return V.float(div(v.x, v.y));
    case "is_finite":
      arity(args, 0, "is_finite");
      return V.bool(Number.isFinite(v.x) && Number.isFinite(v.y));
    case "slerp":
    case "slide":
    case "bounce":
    case "is_equal_approx":
    case "is_normalized":
      throw new UnsupportedError("vector2-method", `Vector2.${name}() 未实现（探针未能钉死语义，见 docs/ROADMAP.md 待做）`);
    default:
      throw new UnsupportedError("vector2-method", `Vector2.${name}() 未实现`);
  }
}

/** 归一化：零向量原样返回（实测 (0,0).normalized() → (0.0, 0.0)，不是 nan）。 */
function normalized(x: number, y: number): Variant {
  const l = flen(x, y);
  if (l === 0) return vector2(0, 0);
  return vector2(div(x, l), div(y, l));
}

/**
 * 比较的唯一口径：**字典序**（先 x 再 y），不是「每个分量都更大」。
 * 判别点实测：`Vector2(3,4) > Vector2(2,5)` → true（x 已决出，y 更小不影响）、
 * `Vector2(3,4) < Vector2(4,3)` → true、`Vector2(1,2) < Vector2(1,3)` → true。
 * ops 的比较与 Array.sort() 都走这里，别在别处再写一份。
 */
export function vecCmp(a: GVector2, b: GVector2): number {
  if (a.x !== b.x) return a.x < b.x ? -1 : 1;
  return a.y === b.y ? 0 : a.y < b.y ? -1 : 1;
}

/** 下标/属性键 → 分量槽位：0/1 与 "x"/"y" 都认（实测 `v["x"]` 读到 1.0、`v["x"] = 7` 写进 x）。 */
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

function failKey(key: Variant, via: "prop" | "index" | "read", base: string, value?: Variant): never {
  const shown = key.t === Tag.STRING || key.t === Tag.STRING_NAME ? `"${key.v as string}"` : String(key.v);
  const vt = value ? tagName(value.t) : "?";
  if (via === "read") {
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

/**
 * 向量写（实测 `v.x = 9`、`v[0] = 9`、`v["x"] = 7` 都合法）。
 *
 * Vector2 是**值类型**，所以绝不原地改：产出新值，由调用方写回它来的那个存储位 ——
 * 实测 `var w = v; w.x = 100` 不动 v，而 `a[0].x = 5`、`d["k"].y = 8` 确实改到容器里那一格
 * （写回哪一格由发射器生成的路径决定，见 emitter 的 emitMemberAssign）。
 * 实参只收 int/float（`v.x = true` / `"s"` / `Vector2(...)` 实测都是运行时报错，不是截断），
 * 存下照旧过 float32（构造即 fround）。
 */
export function vecWrite(vec: GVector2, key: Variant, value: Variant, via: "prop" | "index"): Variant {
  const slot = vecSlot(key);
  if (slot === null) failKey(key, via, "Vector2", value);
  if (value.t !== Tag.INT && value.t !== Tag.FLOAT) failKey(key, via, "Vector2", value);
  const num = value.t === Tag.INT ? intToNum(value.v as IntPayload) : (value.v as number);
  return V.object(slot === 0 ? new GVector2(num, vec.y) : new GVector2(vec.x, num));
}

/** 下标读：越界或键型不对都按实测口径报错（`v[2]` → Invalid access of index …）。 */
export function vecReadIndex(vec: GVector2, key: Variant): Variant {
  const slot = vecSlot(key);
  if (slot === null) failKey(key, "read", "Vector2");
  return V.float(slot === 0 ? vec.x : vec.y);
}
