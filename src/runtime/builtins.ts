import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { decimalToDouble } from "../lower/double";
import { GArray, intArgBig, show, strLength, truthyOf } from "./values";

/** 把 Variant 取成裸 number（内置函数收数值参数时用） */
export function num(v: Variant): number {
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
    throw new UnsupportedError("not-number", `需要数值，收到类型 ${v.t}`);
  }
  // int 载荷可能是 bigint：这里收成 number，float(大整数) 的精度损失与 Godot 一致。
  return v.t === Tag.INT ? intToNum(v.v as IntPayload) : (v.v as number);
}

/** str() 返回的是 String 变体，不是裸 JS 字符串 —— 否则 print(str(x)) 会炸 */
export function strOf(v: Variant): Variant {
  return V.str(show(v));
}

/**
 * int() / float() 的类型转换。旧实现是 `V.int(Math.trunc(num(v)))` / `V.float(num(v))`，
 * 而 `num()` 只收数值 —— 于是 `int("42")`、`int(true)`、`float("1.5")` 全部**拒编**（Godot 都合法），
 * `int(1e20)` 更是抛「超出 2^53」（Godot 饱和到 int64 min）。26 条单表达式探针实测出的规则：
 *
 *   int(float) 向零截断（3.7→3、-3.7→-3、-0.5→0）；**2^53 以上仍精确**（`9007199254740993.0`→`9007199254740994`，
 *   该 double 本身就是 ...994）；`nan` / `±inf` / `|x| ≥ 2^63` 一律**饱和成 -9223372036854775808**（5 种输入同值）。
 *   int(bool)→1/0；float(bool)→1.0/0.0；float(int)→`.0` 形式。
 *   int(String) 走 Godot 的 `to_int()` 规则：跳前导空白与符号，之后**数字累加、非数字忽略、遇 `.` 停止**
 *     —— 所以 `0x10`→10（x 被忽略）、`1e3`→13（e 被忽略）、`3.9`→3（. 停止）、`12x`→12、`abc`/`""`→0、` 42 `→42。
 *   float(String) 是普通浮点前缀解析（`.5`→0.5、`-2.5e2`→-250.0、`1e3`→1000.0、`0x10`→0.0、`abc`→0.0）。
 *   Vector2 / Array 等传给 int()/float() 在 Godot 是 Parse Error，我们保持响亮拒绝。
 */
const INT64_MIN = BigInt("-9223372036854775808");
const TWO_63 = 2 ** 63;

/** 见上方 int(String) 规则注释。 */
function strToInt(s: string): bigint {
  let i = 0;
  while (i < s.length && (s[i] === " " || s[i] === "\t" || s[i] === "\n" || s[i] === "\r")) i++;
  let neg = false;
  if (s[i] === "-") {
    neg = true;
    i++;
  } else if (s[i] === "+") {
    i++;
  }
  let acc = 0n;
  for (; i < s.length; i++) {
    const ch = s[i]!;
    if (ch === ".") break;
    if (ch >= "0" && ch <= "9") acc = acc * 10n + BigInt(ch.charCodeAt(0) - 48);
  }
  return neg ? -acc : acc;
}

/** float(String)：取前导浮点数，取不到就是 0（实测 `0x10`→0.0、`abc`→0.0）。 */
export function strToFloat(s: string): number {
  const m = /^\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d*)?/.exec(s);
  // 前缀截断之后交给 decimalToDouble：实测 `("9007199254740993.0").to_float()` 与字面量
  // 同值（都是 …994），说明运行时这条路走的是同一个 String::to_double；下划线**不算**数字
  // （`("1_000_000.25").to_float()` → 1.0），所以这条正则不吃下划线、也不做剥离
  return m ? decimalToDouble(m[0]) : 0;
}

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
      // BigInt 精确展开，2^53 以上不丢位（旧实现走 Number 会在边界上错一位）
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

/**
 * Godot 的字符串哈希（实测逆出的算式）：**djb2、按 UTF-32 码点走、每步回绕 32 位、结果按无符号印**。
 * `h = 5381; h = (h * 33 + codepoint) mod 2³²`。15 个实测点 0 处不一致，其中三条是关键判别：
 *  - `"你好"` → `6553378`、`"\u{1F600}"` → `306085`、`"\u{10000}"` → `243109`：
 *    吃的是**码点**而不是 UTF-16 码元（代理对会被合成一个 0x1F600）；
 *  - 26 个字母 → `3927029252`（> 2³¹ 仍印正数）→ 无符号 32 位；
 *  - `""` → `5381`（种子原样），`&"abc".hash()` 与 `"abc".hash()` 同为 `193485963`（StringName 就是内容的 hash）。
 * 乘法最大到 `(2³²−1)*33 + 0x10FFFF ≈ 1.4e11`，远小于 2⁵³，所以 double 里逐步取模是精确的。
 */
export function hashDjb2(s: string): number {
  let h = 5381;
  for (const ch of s) h = (h * 33 + (ch.codePointAt(0) as number)) % 4294967296;
  return h;
}

/**
 * 全局 `hash()`。实测：字符串族走上面那条 djb2、`hash(true)` → 1、`hash(false)` → 0、`hash(null)` → 0。
 * 其余类型（int / float / 数组 / 字典 / 向量 / Color / 对象）走的是 Godot 的 murmur3 那条链 ——
 * 实测 `hash(5)` → 1788267159、`hash(0)` → 720020139、`hash(2.5)` → 2779676868，算式还没逆出来，
 * 所以这里响亮报缺，不拿 JS 自己的一套顶替。
 */
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
  return num(v) < 0 ? V.float(Math.abs(num(v))) : V.float(Math.abs(num(v)));
}

export function lengthOf(v: Variant): Variant {
  // StringName 与 String 同一个口径（实测 len(&"abc") → 3）
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

/**
 * `range()` 的实参归一 —— 它只吃 int，所以每个实参都先「转 int」。实测（Godot 4.6.3）：
 *   - **float 向零截断**：`range(0.5, 2.5)` → `[0, 1]`、`range(2.5)` → `[0, 1]`、
 *     `range(0, 3.9)` → `[0, 1, 2]`、`range(0, 3, 2.5)` → `[0, 2]`；
 *   - **bool 当 0/1**：`range(0, 3, true)` → `[0, 1, 2]`；
 *   - String / Vector2 等报运行错：`Cannot convert argument 2 from String to int`；
 *   - 截断后步长为 0 也报运行错：`range(0, 1, 0.0)` 与 `range(3, 0, -0.5)` 都是「步长参数为零」。
 * 旧实现遇到非整数就响亮拒绝，理由是"退化语义未定"；现在语义测清了，照 Godot 截断。
 */
export function rangeInt(v: Variant | undefined, n: number): number {
  if (v === undefined) {
    throw new GodotRuntimeError("range-arity", `range 缺少第 ${n} 个参数`);
  }
  return Number(intArgBig(v, `range 的第 ${n} 个参数`));
}

/**
 * range 序列的唯一算式，返回**裸 number 数组**：`range()` 用它再逐个装箱，
 * `for x in range(...)` 的裸循环节直接迭代它（省掉整批 Variant 分配）。
 * 两边共用一份，免得循环展开悄悄跑出与 range() 不同的序列。
 */
export function rangeSeq(args: Variant[]): number[] {
  // 一个参数是 end，两个是 start/end，三个带 step；range() 无参在 Godot 也是运行错
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
