import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToBig, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { INT64_MAX, INT64_MIN, TWO_63, strToInt, strToFloat } from "./numstr";
import { GArray, intArgBig, show, strLength, truthyOf } from "./values";
import { GBytes, isBytes, packBytes, packTypeName } from "./packed";

/** `Array(x)`：只支持从 PackedByteArray 转（元素是 int），其余形状响亮拒。 */
export function arrayFromVariant(v: Variant): Variant {
  if (!isBytes(v)) {
    throw new UnsupportedError("array-ctor-from", `Array(...) 只实测过 PackedByteArray 实参（收到 ${tagName(v.t)}）`);
  }
  const b = packBytes(v);
  if (b.kind !== "byte") {
    throw new UnsupportedError("array-ctor-from-kind", `Array(...) 只实测过 PackedByteArray 实参（收到 ${packTypeName(b.kind)}）`);
  }
  return V.array(GArray.of(b.raw().map((x) => V.int(typeof x === "bigint" ? x : x as number))));
}

/** 把 Variant 取成裸 number（内置函数收数值参数时用） */
export function num(v: Variant): number {
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
    throw new UnsupportedError("not-number", `需要数值，收到类型 ${v.t}`);
  }
  return v.t === Tag.INT ? intToNum(v.v as IntPayload) : (v.v as number);
}

/** str() 返回的是 String 变体，不是裸 JS 字符串 —— 否则 print(str(x)) 会炸 */
export function strOf(v: Variant): Variant {
  return V.str(show(v));
}

/** `hex_to_int()`：**整串必须合式**才给值，否则 0 —— 式子是「可选一个 `-`、可选 `0x`/`0X` 前缀、其后全是十六进制位」。溢出**饱和**到 INT64_MAX / INT64_MIN，不回绕。 */
export function strHexToInt(s: string): bigint {
  const m = /^(-?)(0[xX])?([0-9a-fA-F]+)$/.exec(s);
  if (m === null) return 0n;
  const v = BigInt("0x" + (m[3] as string));
  if (v > INT64_MAX) return m[1] === "-" ? INT64_MIN : INT64_MAX;
  return m[1] === "-" ? -v : v;
}

/** `is_valid_int()`：整串 `[+-]?数字+`，**不看范围**（超出 int64 的数字串也算真） */
export const INT_RE = /^[+-]?[0-9]+$/;
/** `is_valid_hex_number()` 默认式子：可带**一个**正负号，**不**带前缀 */
export const HEX_RE = /^[+-]?[0-9a-fA-F]+$/;
/** 参数为真时的式子（Godot 那侧叫 `with_alpha_prefix`）：必须带**小写** `0x`，可再带一个正负号。它与 `hex_to_int()` 不同调：`"+ff"` 在这儿是真。 */
export const HEX_PREFIX_RE = /^[+-]?0x[0-9a-fA-F]+$/;

/** int() / float() 的类型转换：float 向零截断，`nan` / `±inf` / `|x| ≥ 2^63` 饱和成 INT64_MIN，bool 给 1/0，String 走 {@link strToFloat} / {@link strToInt}；其余类型在 Godot 是 Parse Error，这里同样响亮拒绝。 */
export function toFloat(v: Variant): Variant {
  switch (v.t) {
    case Tag.FLOAT:
      return v;
    case Tag.INT:
      return V.float(intToNum(v.v as IntPayload));
    case Tag.BOOL:
      return V.float(v.v ? 1 : 0);
    case Tag.STRING:
      return V.float(strToFloat(v.v as string));
    default:
      throw new UnsupportedError(
        "to-float",
        `float() 不接受 ${tagName(v.t)}（Godot 是 Parse Error: No constructor of "float" matches the signature）`,
      );
  }
}

export function toInt(v: Variant): Variant {
  switch (v.t) {
    case Tag.INT:
      return v;
    case Tag.BOOL:
      return V.int(v.v ? 1 : 0);
    case Tag.STRING:
      return V.int(strToInt(v.v as string));
    case Tag.FLOAT: {
      const x = v.v as number;
      if (!Number.isFinite(x) || Math.abs(x) >= TWO_63) return V.int(INT64_MIN);
      return V.int(BigInt(Math.trunc(x)));
    }
    default:
      throw new UnsupportedError(
        "to-int",
        `int() 不接受 ${tagName(v.t)}（Godot 是 Parse Error: No constructor of "int" matches the signature）`,
      );
  }
}

export function toBool(v: Variant): Variant {
  return V.bool(truthyOf(v));
}

/** Godot 的字符串哈希：**djb2、按 UTF-32 码点走、每步回绕 32 位、结果按无符号印** —— `h = 5381; h = (h * 33 + codepoint) mod 2³²`。 */
export function hashDjb2(s: string): number {
  let h = 5381;
  for (const ch of s) h = (h * 33 + (ch.codePointAt(0) as number)) % 4294967296;
  return h;
}

/** 全局 `hash()`：字符串族走 djb2（StringName 就是内容的 hash）、bool 给 1/0、null 给 0；其余类型是 Godot 的 murmur3 链，算式未逆出 → 响亮报缺，不拿 JS 自己的一套顶替。 */
export function variantHash(args: Variant[]): Variant {
  if (args.length !== 1) {
    throw new GodotRuntimeError("arity", `hash() 只接受 1 个参数（收到 ${args.length} 个）`);
  }
  const v = args[0] as Variant;
  if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) return V.int(hashDjb2(v.v as string));
  if (v.t === Tag.BOOL) return V.int(v.v ? 1 : 0);
  if (v.t === Tag.NIL) return V.int(0);
  throw new UnsupportedError("hash-type", `hash() 收到 ${tagName(v.t)}：Godot 那侧是非字符串的 murmur3 链，算式未逆出`);
}

export function sqrt(v: Variant): Variant {
  return V.float(Math.sqrt(num(v)));
}

export function abs(v: Variant): Variant {
  if (v.t === Tag.INT) {
    const x = intToBig(v.v as IntPayload);
    return V.int(x < 0n ? -x : x);
  }
  return V.float(Math.abs(num(v)) + 0);
}

/** 全局数学函数一族：每一条都由 4.6.3 实测边界定住（式子与类型规则见 SEMANTICS）。 */

const INT_MIN_F = -9223372036854775808;

/** int 载荷：2^53 内用 number，越界用 bigint（与装箱轨同一口径）。 */
function vi(n: number): Variant {
  return Number.isSafeInteger(n) ? V.int(n) : V.int(BigInt(Math.trunc(n)));
}

function isInt(v: Variant): boolean {
  return v.t === Tag.INT;
}

function fl(v: Variant): number {
  return v.t === Tag.FLOAT ? (v.v as number) : intToNum(v.v as IntPayload);
}

/** 实测 `round` 是**远离零**（`round(2.5)`=3、`round(-2.5)`=-3、`round(-3.5)`=-4），JS 原生对负半数会差一格。 */
function gdRound(x: number): number {
  return x >= 0 ? Math.floor(x + 0.5) : Math.ceil(x - 0.5);
}

function intOf(v: Variant): number {
  return v.t === Tag.INT ? intToNum(v.v as IntPayload) : Math.trunc(v.v as number);
}

function one(x: number): number {
  return Number.isNaN(x) ? 0 : x > 0 ? 1 : x < 0 ? -1 : 0;
}

export function gSign(v: Variant): Variant {
  if (isInt(v)) return vi(one(intToNum(v.v as IntPayload)));
  const x = v.v as number;
  return V.float(one(x) + 0);
}

export function gSignI(v: Variant): Variant {
  return vi(one(intOf(v)));
}

export function gSignF(v: Variant): Variant {
  return V.float(one(fl(v)) + 0);
}

/** 实参是 int 时 `floor`/`ceil`/`round` 原样给回 int（实测 `floor(3)` 的 typeof 是 2），而 `floorf` 一族恒给 float、`floori` 一族恒给 int 且 NaN/INF 折成 INT64_MIN。 */
type RoundMode = "auto" | "float" | "int";

function roundThree(x: number, fn: (n: number) => number, mode: RoundMode): Variant {
  if (mode === "int") {
    if (!Number.isFinite(x)) return V.int(INT64_MIN);
    return vi(fn(x));
  }
  if (mode === "float") return V.float(fn(x) + 0);
  return V.float(fn(x) + 0);
}

function intPassthrough(v: Variant, mode: RoundMode): Variant | null {
  if (!isInt(v)) return null;
  const x = intToNum(v.v as IntPayload);
  if (mode === "auto") return v;
  if (mode === "int") return vi(x);
  return V.float(x + 0);
}

export function gFloor(v: Variant, mode: RoundMode = "auto"): Variant {
  const pas = intPassthrough(v, mode);
  if (pas !== null) return pas;
  return roundThree(v.v as number, Math.floor, mode);
}

export function gCeil(v: Variant, mode: RoundMode = "auto"): Variant {
  const pas = intPassthrough(v, mode);
  if (pas !== null) return pas;
  return roundThree(v.v as number, Math.ceil, mode);
}

export function gRound(v: Variant, mode: RoundMode = "auto"): Variant {
  const pas = intPassthrough(v, mode);
  if (pas !== null) return pas;
  return roundThree(v.v as number, gdRound, mode);
}

function floorDiv(a: number, b: number): number {
  return Math.floor(a / b);
}

export function gPosmod(x: Variant, y: Variant): Variant {
  const a = intOf(x);
  const b = intOf(y);
  if (b === 0) {
    throw new UnsupportedError("posmod-zero", "posmod() 的模数为 0（Godot 那侧这一格没量过）");
  }
  return vi(a - b * floorDiv(a, b));
}

export function gFposmod(x: Variant, y: Variant): Variant {
  const a = fl(x);
  const b = fl(y);
  if (b === 0 || !Number.isFinite(a / b)) return V.float(NaN);
  return V.float(a - b * Math.floor(a / b) + 0);
}

export function gFmod(x: Variant, y: Variant): Variant {
  return V.float(fl(x) % fl(y) + 0);
}

export function gWrap(v: Variant, lo: Variant, hi: Variant, asInt: boolean): Variant {
  const mn0 = asInt ? intOf(lo) : fl(lo);
  const mx0 = asInt ? intOf(hi) : fl(hi);
  const a = asInt ? intOf(v) : fl(v);
  const [mn, mx] = mn0 > mx0 ? [mx0, mn0] : [mn0, mx0];
  const range = mx - mn;
  if (range === 0) return asInt ? vi(mn) : V.float(mn + 0);
  const inside = a - mn;
  const r = asInt ? inside - range * floorDiv(inside, range) : inside - range * Math.floor(inside / range);
  return asInt ? vi(mn + r) : V.float(mn + r + 0);
}

export function gLerp(a: Variant, b: Variant, w: Variant): Variant {
  const x = fl(a);
  return V.float(x + (fl(b) - x) * fl(w) + 0);
}

export function gInverseLerp(a: Variant, b: Variant, v: Variant): Variant {
  const den = fl(b) - fl(a);
  if (den === 0) return V.float((fl(v) - fl(a)) / den);
  return V.float((fl(v) - fl(a)) / den + 0);
}

export function gMoveToward(from: Variant, to: Variant, delta: Variant): Variant {
  const a = fl(from);
  const b = fl(to);
  const d = fl(delta);
  if (Math.abs(b - a) <= Math.abs(d)) return V.float(b + 0);
  const step = Math.min(Math.abs(d), Math.abs(b - a));
  return V.float(a + (b < a ? -step : step) + 0);
}

/** `snapped` 的结果类型跟步长那一侧，但**商按 float 算**：`snapped(7.5, 3)` = round(2.5)·3 = 9，而 `snappedi(7, 3)` = round(2.33)·3 = 6。 */
export function gSnapped(x: Variant, step: Variant): Variant {
  const s = fl(step);
  const a = fl(x);
  if (isInt(step)) {
    if (s === 0) return vi(intOf(x));
    return vi(Math.trunc(gdRound(a / s) * s));
  }
  if (s === 0) return V.float(a + 0);
  return V.float(gdRound(a / s) * s + 0);
}

export function gSnappedF(x: Variant, step: Variant): Variant {
  const a = fl(x);
  const s = fl(step);
  if (s === 0) return V.float(a + 0);
  return V.float(gdRound(a / s) * s + 0);
}

/** `snappedi` 两端都先折成 int（`snappedi(7, 3)` = 6、`snappedi(7, 0)` = 7）。 */
export function gSnappedI(x: Variant, step: Variant): Variant {
  const a = intOf(x);
  const s = intOf(step);
  if (s === 0) return vi(a);
  return vi(gdRound(a / s) * s);
}

const PI_D = 3.14159265358979323846;

export function gDegToRad(v: Variant): Variant {
  return V.float(fl(v) * (PI_D / 180) + 0);
}

export function gRadToDeg(v: Variant): Variant {
  return V.float(fl(v) * (180 / PI_D) + 0);
}

/** 式子是「取差 → 对 TAU 取余 → 折进 [-π, π]」：`angle_difference(6.0, 0.1)` = +0.38318530717959，反过来给负数。 */
export function gAngleDifference(from: Variant, to: Variant): Variant {
  const TAU = 2 * PI_D;
  let d = (fl(to) - fl(from)) % TAU;
  if (d > PI_D) d -= TAU;
  else if (d < -PI_D) d += TAU;
  if (approxEq(d, PI_D)) d = -PI_D;
  return V.float(d + 0);
}

function approxEq(a: number, b: number): boolean {
  if (a === b) return true;
  const diff = Math.abs(a - b);
  const tol = Math.max(1e-5, 1e-5 * Math.min(Math.abs(a), Math.abs(b)));
  return diff < tol;
}

export function gIsEqualApprox(a: Variant, b: Variant): Variant {
  const x = fl(a);
  const y = fl(b);
  return V.bool(approxEq(x, y));
}

export function gIsZeroApprox(v: Variant): Variant {
  const x = fl(v);
  return V.bool(Number.isFinite(x) && Math.abs(x) < 1e-5);
}

export function gIsNan(v: Variant): Variant {
  return V.bool(Number.isNaN(fl(v)));
}

export function gIsInf(v: Variant): Variant {
  const x = fl(v);
  return V.bool(x === Infinity || x === -Infinity);
}

export function gIsFinite(v: Variant): Variant {
  return V.bool(Number.isFinite(fl(v)));
}

/** `min`/`max` 返回的是**赢的那个实参**（类型跟着它走），且比较式子对 NaN 是「留第一个」：`max(NAN, 1.0)` 给 nan。 */
export function gMin(a: Variant, b: Variant): Variant {
  need2(a, b, "min");
  return fl(a) > fl(b) ? b : a;
}

export function gMax(a: Variant, b: Variant): Variant {
  need2(a, b, "max");
  return fl(a) < fl(b) ? b : a;
}

export function gMinI(a: Variant, b: Variant): Variant {
  const x = intOf(a);
  const y = intOf(b);
  return vi(x > y ? y : x);
}

export function gMaxI(a: Variant, b: Variant): Variant {
  const x = intOf(a);
  const y = intOf(b);
  return vi(x < y ? y : x);
}

export function gMinF(a: Variant, b: Variant): Variant {
  return V.float(Math.min(fl(a), fl(b)) + 0);
}

export function gMaxF(a: Variant, b: Variant): Variant {
  return V.float(Math.max(fl(a), fl(b)) + 0);
}

function need2(a: Variant, b: Variant, who: string): void {
  if ((a.t !== Tag.INT && a.t !== Tag.FLOAT) || (b.t !== Tag.INT && b.t !== Tag.FLOAT)) {
    throw new UnsupportedError("math-number", `${who}() 的两个实参都要数值（收到 ${tagName(a.t)} 与 ${tagName(b.t)}）`);
  }
}

/** 实测口径：先看上界再看下界（`clamp(1, 2, 0)` 给 0、`clamp(NAN, 0, 1)` 给 nan），返回的那一侧带自己的类型；`clampf` 恒给 float、`clampi` 恒给 int。 */
export function gClamp(v: Variant, lo: Variant, hi: Variant, mode: RoundMode = "auto"): Variant {
  need2(v, lo, "clamp");
  need2(v, hi, "clamp");
  const x = mode === "int" ? intOf(v) : fl(v);
  const mn = mode === "int" ? intOf(lo) : fl(lo);
  const mx = mode === "int" ? intOf(hi) : fl(hi);
  const win = x > mx ? hi : x < mn ? lo : v;
  if (mode === "int") return vi(intOf(win));
  if (mode === "float") return V.float(fl(win) + 0);
  if (mode === "auto" && !(x <= x)) return V.float(x);
  return win;
}

export function gSmoothstep(from: Variant, to: Variant, s: Variant): Variant {
  const a = fl(from);
  const b = fl(to);
  const x = fl(s);
  if (approxEq(a, b)) return V.float(a <= x ? 1.0 : 0.0);
  if (a < b ? x <= a : x >= a) return V.float(a < b ? 0.0 : 1.0);
  if (a < b ? x >= b : x <= b) return V.float(a < b ? 1.0 : 0.0);
  const y = (x - a) / (b - a);
  return V.float(y * y * (3.0 - 2.0 * y) + 0);
}

/** 只有正曲线实测过（`ease(0.5, 2)`=0.25、`ease(0.5, 3.5)`=0.08838834764832），负曲线那一格没量出式子，响亮拒。 */
export function gEase(delta: Variant, curve: Variant): Variant {
  const c = fl(curve);
  if (c === 0) return V.float(0.0);
  if (c < 0) throw new UnsupportedError("ease-curve", "ease() 的负曲线值没量出式子");
  let x = fl(delta);
  if (approxEq(x, 0)) return V.float(0.0);
  if (approxEq(x, 1)) return V.float(1.0);
  if (x < 0) x = 0;
  if (x > 1) x = 1;
  return V.float(Math.pow(x, c) + 0);
}

/** 实参顺序是 `(from, to, pre, after, weight)`：`cubic_interpolate(0,1,2,3,0.5)` 给 0.25、`(1,2,3,4,0.5)` 给 1.25。 */
export function gCubic(from: Variant, to: Variant, pre: Variant, after: Variant, w: Variant): Variant {
  const p0 = fl(from);
  const p1 = fl(to);
  const p2 = fl(pre);
  const p3 = fl(after);
  const t = fl(w);
  const ret = 0.5 * (p0 * 2 + (p1 - p2) * t + (p2 * 2 - p0 * 5 + p1 * 4 - p3) * t * t + (p2 * -1 + p0 * 3 - p1 * 3 + p3) * t * t * t);
  return V.float(ret + 0);
}

export function gRemap(v: Variant, fl0: Variant, fh: Variant, tl: Variant, th: Variant): Variant {
  const t = gInverseLerp(fl0, fh, v).v as number;
  const a = fl(tl);
  return V.float(a + (fl(th) - a) * t + 0);
}

export function gExp(v: Variant): Variant {
  return V.float(Math.exp(fl(v)) + 0);
}

export function gLog(v: Variant): Variant {
  return V.float(Math.log(fl(v)) + 0);
}

export function gPow(a: Variant, b: Variant): Variant {
  return V.float(Math.pow(fl(a), fl(b)) + 0);
}

export function gSqrt(v: Variant): Variant {
  return V.float(Math.sqrt(fl(v)) + 0);
}


export function lengthOf(v: Variant): Variant {
  if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) return V.int(strLength(v.v as string));
  if (v.t === Tag.ARRAY) return V.int((v.v as GArray).size());
  throw new UnsupportedError("len", `len() 不支持类型 ${v.t}`);
}

/** and / or 是短路的，所以右值延迟求值 */
export function and(l: Variant, right: () => Variant): Variant {
  return truthyOf(l) ? right() : l;
}

export function or(l: Variant, right: () => Variant): Variant {
  return truthyOf(l) ? l : right();
}

/** `range()` 的实参归一 —— 它只吃 int：float 向零截断、bool 当 0/1，String / Vector2 等报运行错。 */
export function rangeInt(v: Variant | undefined, n: number): number {
  if (v === undefined) {
    throw new GodotRuntimeError("range-arity", `range 缺少第 ${n} 个参数`);
  }
  return Number(intArgBig(v, `range 的第 ${n} 个参数`));
}

export function rangeSeq(args: Variant[]): number[] {
  const end = rangeInt(args.length >= 2 ? args[1] : args[0], args.length >= 2 ? 2 : 1);
  const start = args.length >= 2 ? rangeInt(args[0], 1) : 0;
  const step = args.length >= 3 ? rangeInt(args[2], 3) : 1;
  if (step === 0) {
    throw new GodotRuntimeError("range-step-zero", "range 的步长参数为零");
  }
  const items: number[] = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) items.push(i);
  } else {
    for (let i = start; i > end; i += step) items.push(i);
  }
  return items;
}

/** range(end) / range(start, end) / range(start, end, step) */
export function range(args: Variant[]): GArray {
  return GArray.of(rangeSeq(args).map((i) => V.int(i)));
}
