import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "./tags";
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
  return num(v) < 0 ? V.float(Math.abs(num(v))) : V.float(Math.abs(num(v)));
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
