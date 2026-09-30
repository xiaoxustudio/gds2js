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

/** Vector2i 的分类标记：靠它认「单参构造」，不必 import vector2i（那会形成模块环）。 */
export const VEC2I_MARK = Symbol("gds2js.Vector2i");

export function vector2(x: number, y: number): Variant {
  return V.object(new GVector2(x, y));
}

/** 取向量实例，不是 Vector2 对象则 null（ops 里分派用）。 */
export function asVec2(v: Variant): GVector2 | null {
  return v.t === Tag.OBJECT && v.v instanceof GVector2 ? (v.v as GVector2) : null;
}

/**
 * 声明为 `Vector2` 的变量/字段在**赋值点**的转换（实测 f5：`var mv: Vector2` 之后
 * `mv = Vector2i(1, 2)` 给 `(1.0, 2.0)`，`p.v = Vector2i(3, 4)` 同值）。
 * 直接复用 `vector2New` 的单参形态：Vector2 拷一份（值类型写点必须拷贝，见 step 38）、
 * Vector2i 升成 float，别的实参响亮报缺 —— 那种组合 Godot 在解析期就拒（`mv = 5` 实测），
 * 走到这里说明是推不出静态类型的动态路径，宁可抛也不要静默存错形状。
 */
export function toVec2(v: Variant): Variant {
  return vector2New([v]);
}

/** `Vector2(...)` 构造：0 参给零向量（实测 `Vector2()` → `(0.0, 0.0)`），其余必须两参。 */
export function vector2New(args: Variant[]): Variant {
  if (args.length === 0) return vector2(0, 0);
  if (args.length === 1) {
    const a = args[0] as Variant;
    if (a.t === Tag.OBJECT && a.v instanceof GVector2) return vector2(a.v.x, a.v.y);
    const o = a.v as { x?: number; y?: number } | null;
    if (a.t === Tag.OBJECT && o !== null && VEC2I_MARK in o) return vector2(o.x as number, o.y as number);
    throw new UnsupportedError("vector2-arg", `Vector2() 单参只收 Vector2 / Vector2i，收到 ${tagName(a.t)}`);
  }
  if (args.length !== 2) {
    throw new UnsupportedError("vector2-arity", `Vector2() 需要 0、1（向量）或 2 个参数（收到 ${args.length} 个）`);
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
      arity(args, 0, "round");
      const h = (n: number) => (n < 0 ? -Math.round(-n) : Math.round(n));
      return vector2(h(v.x), h(v.y));
    }
    case "snapped": {
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
    case "slide":
    case "bounce":
      throw new UnsupportedError("vector2-method", `Vector2.${name}() 未实现（法向不是单位向量时 Godot 除了给零向量还往 stderr 打一行，产物复现不了）`);
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

/**
 * Godot 单精度构建里的 `CMP_EPSILON`。两个谓词都用到，且都是**严格小于**：
 *  - `is_zero_approx`：逐分量 `|v| < 1e-5`（实测 9e-6 真、1e-5 假、2e-5 假，Vector2/Vector3 一样）
 *  - `is_equal_approx`：逐分量 `|a-b| < max(1e-5, 1e-5*|a|)`（Vector2 与 Vector3 共用，实测 13 个点）
 */
export const CMP_EPS = r(1e-5);

/** 实测阈值：`|length_squared() - 1| < 1e-3`。20 个点夹出来的（0.9995 真 / 0.9992 假、
 *  (1, 0.045) 假、(0.5774,0.5774,0.5774) 真……），Vector2 与 Vector3 完全同一条。 */
export const NORMALIZED_EPS = r(1e-3);

/** 逐分量容差比较，口径见上面的 `CMP_EPS`。分量已经先过 float32，所以边界点会跟着 fround 挪位，
 *  这正是当初 Vector2 探针把阈值「夹在 6.7e-6–9.9e-6」的原因。 */
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

export function vecFailKey(key: Variant, via: "prop" | "index" | "read", base: string, value?: Variant): never {
  /**
   * 实测下来字符串键**不加引号**，而且读的那一句会换形状：
   *  - `v["w"]` 读 → `Invalid access to property or key 'w' on a base object of type 'Vector3i'.`（f69 t53，`type` 后**没有**冒号）
   *  - `v[3]` 读 → `Invalid access of index '3' on a base object of type: 'Vector3i'.`（t51/t52 与用例 092/097，**有**冒号）
   *  - `v.y = …` 写 → `Invalid assignment of property or key 'y' with value of type '…' on a base object of type 'Vector2'.`（用例 088 与 f69 t56）
   *  - `v[5] = …` 写 → `Invalid assignment of index '5' (on base: 'Vector3i') with value of type 'int'.`（t55）
   */
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
  if (slot === null) vecFailKey(key, via, "Vector2", value);
  if (value.t !== Tag.INT && value.t !== Tag.FLOAT) vecFailKey(key, via, "Vector2", value);
  const num = value.t === Tag.INT ? intToNum(value.v as IntPayload) : (value.v as number);
  return V.object(slot === 0 ? new GVector2(num, vec.y) : new GVector2(vec.x, num));
}

/** 下标读：越界或键型不对都按实测口径报错（`v[2]` → Invalid access of index …）。 */
export function vecReadIndex(vec: GVector2, key: Variant): Variant {
  const slot = vecSlot(key);
  if (slot === null) vecFailKey(key, "read", "Vector2");
  return V.float(slot === 0 ? vec.x : vec.y);
}
