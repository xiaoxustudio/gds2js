import { UnsupportedError } from "./errors";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { GArray, show, strLength, truthyOf } from "./values";

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
function strToFloat(s: string): number {
  const m = /^\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(s);
  return m ? Number(m[0]) : 0;
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

export function sqrt(v: Variant): Variant {
  return V.float(Math.sqrt(num(v)));
}

export function abs(v: Variant): Variant {
  return num(v) < 0 ? V.float(Math.abs(num(v))) : V.float(Math.abs(num(v)));
}

export function lengthOf(v: Variant): Variant {
  if (v.t === Tag.STRING) return V.int(strLength(v.v as string));
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
 * range 序列的唯一算式，返回**裸 number 数组**：`range()` 用它再逐个装箱，
 * `for x in range(...)` 的裸循环节直接迭代它（省掉整批 Variant 分配）。
 * 两边共用一份，免得循环展开悄悄跑出与 range() 不同的序列。
 */
export function rangeSeq(a: number, b?: number, step = 1): number[] {
  let start = 0;
  let end = a;
  if (b !== undefined) {
    start = a;
    end = b;
  }
  if (step === 0) throw new Error("range 的步长不能为 0");
  // 非整数的界/步长：Godot 走 int 重载会退化（实测 `range(0, 3, 0.5)` 什么都不输出），我们不去
  // 复刻这种未文档化的退化，改为响亮拒绝 —— 否则会一路走到 `V.int(0.5)`，报出「0.5 超出 2^53」
  // 这种指错地方的误导错误。整数值的 float（如 range(0.0, 3.0)）不受影响，实测与 Godot 同为 0/1/2。
  for (const [what, v] of [
    ["起点", start],
    ["终点", end],
    ["步长", step],
  ] as const) {
    if (!Number.isInteger(v)) {
      throw new UnsupportedError(
        "range-non-integer",
        `range 的${what}不是整数（${v}）：Godot 此处退化为空数组，语义未定，拒绝生成可能静默错位的代码`,
      );
    }
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
export function range(a: number, b?: number, step = 1): GArray {
  return GArray.of(rangeSeq(a, b, step).map((i) => V.int(i)));
}
