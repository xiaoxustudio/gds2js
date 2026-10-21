import { GodotRuntimeError, UnsupportedError } from "./errors";
import { fastlzCompress, fastlzDecompress } from "./fastlz";
import { Tag, V, intToNum, tagName, type Variant } from "./tags";
import { INT64_MIN, TWO_63, hexLower, padZero2, strToInt, strToFloat } from "./numstr";
import { GColor } from "./color";
import { GVector2 } from "./vector2";
import { GVector2i } from "./vector2i";
import { GVector3i } from "./vector3i";
import { GVector3 } from "./vector3";
import type { GArray } from "./values";

export type PackKind = "byte" | "int32" | "int64" | "float32" | "float64" | "string" | "vector2" | "vector3" | "color";

export type PackElem = number | bigint | string | GVector2 | GVector3 | GColor;

const PACK_TYPE_NAME: Record<PackKind, string> = {
  byte: "PackedByteArray",
  int32: "PackedInt32Array",
  int64: "PackedInt64Array",
  float32: "PackedFloat32Array",
  float64: "PackedFloat64Array",
  string: "PackedStringArray",
  vector2: "PackedVector2Array",
  vector3: "PackedVector3Array",
  color: "PackedColorArray",
};
const PACK_TYPEOF: Record<PackKind, number> = {
  byte: 29,
  int32: 30,
  int64: 31,
  float32: 32,
  float64: 33,
  string: 34,
  vector2: 35,
  vector3: 36,
  color: 37,
};

/** String pack 的元素折算用的 show；show 住在 values.ts，由它模块初始化时注进来，两边不互相 import。 */
let stringifier: ((v: Variant) => string) | null = null;
export function registerPackStringifier(fn: (v: Variant) => string): void {
  stringifier = fn;
}

export class GBytes {
  private items: PackElem[];

  constructor(items: PackElem[] = [], readonly kind: PackKind = "byte") {
    this.items = items;
  }

  raw(): PackElem[] {
    return this.items;
  }

  get length(): number {
    return this.items.length;
  }

  static of(values: PackElem[], kind: PackKind = "byte"): GBytes {
    return new GBytes(values, kind);
  }
}

/** 每种 pack 形状的**默认格子**：`resize` 长出来填它、`get` 越界给它、塞错类型也折成它。 */
export function defaultElem(kind: PackKind): PackElem {
  switch (kind) {
    case "int64":
      return 0n;
    case "string":
      return "";
    case "vector2":
      return new GVector2(0, 0);
    case "vector3":
      return new GVector3(0, 0, 0);
    case "color":
      return new GColor(0, 0, 0, 1);
    default:
      return 0;
  }
}

export function packTypeName(kind: PackKind): string {
  return PACK_TYPE_NAME[kind];
}

export function packTypeOfCode(kind: PackKind): number {
  return PACK_TYPEOF[kind];
}

// 「是不是 pack」只交布尔：`GBytes | null` 这种**局部格子**在静态编译目标上要把类实例表示成 checked-dynamic 属性，而 `GBytes.items` 没有静态表示。
export function isBytes(v: Variant): boolean {
  return v.t === Tag.OBJECT && v.v instanceof GBytes;
}

/** 只在 `isBytes(v)` 为真之后调用：交收窄的实例。 */
export function packBytes(v: Variant): GBytes {
  return v.v as GBytes;
}

const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;

function foldInt32(n: number | bigint): number {
  const m = typeof n === "bigint" ? Number(((n % 4294967296n) + 4294967296n) % 4294967296n) : Math.trunc(n) % 4294967296;
  const unsigned = typeof n === "bigint" ? m : ((m % 4294967296) + 4294967296) % 4294967296;
  return unsigned > INT32_MAX ? unsigned - 4294967296 : unsigned;
}

/** 元素折算：int / float（截断或饱和）/ bool / String（前导数解析）/ 与形状对应的值类型，其余来源响亮拒。 */
export function toElem(kind: PackKind, v: Variant): PackElem {
  if (kind === "vector2" || kind === "vector3" || kind === "color") {
    const inner = v.t === Tag.OBJECT ? (v.v as object) : null;
    if (kind === "vector2") {
      if (inner instanceof GVector2) return new GVector2(inner.x, inner.y);
      if (inner instanceof GVector2i) return new GVector2(inner.x, inner.y);
      // Vector3 → Vector2 是**丢掉 z**，不是折成默认元素。
      if (inner instanceof GVector3) return new GVector2(inner.x, inner.y);
      if (inner instanceof GVector3i) return new GVector2(inner.x, inner.y);
      return defaultElem(kind);
    }
    if (kind === "vector3") {
      if (inner instanceof GVector3) return new GVector3(inner.x, inner.y, inner.z);
      // Vector3i → Vector3 在 append / 构造这一侧**升格**，下标写那一侧不升（见 packWriteIndex）。
      if (inner instanceof GVector3i) return new GVector3(inner.x, inner.y, inner.z);
      // Vector2 → Vector3 缺的那一格补 0，同样不是整格默认。
      if (inner instanceof GVector2) return new GVector3(inner.x, inner.y, 0);
      if (inner instanceof GVector2i) return new GVector3(inner.x, inner.y, 0);
      return defaultElem(kind);
    }
    if (inner instanceof GColor) return new GColor(inner.r, inner.g, inner.b, inner.a);
    return defaultElem(kind);
  }
  if (kind === "string") {
    if (stringifier === null) {
      throw new UnsupportedError("packed-string-not-registered", "PackedStringArray 的 show 还没登记（values.ts 的初始化顺序有问题）");
    }
    return stringifier(v);
  }
  if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) {
    // 数值 pack 收 String 走**前导数解析**（与 `to_int()` / `to_float()` 同一条式子），先解析成 Variant 再走下面的数值折算。
    const s = v.v as string;
    if (kind === "float32" || kind === "float64") return toElem(kind, V.float(strToFloat(s)));
    return toElem(kind, V.int(strToInt(s)));
  }
  if (kind === "float32" || kind === "float64") {
    if (v.t === Tag.BOOL) return v.v ? 1 : 0;
    if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
      throw new UnsupportedError("packed-element-kind", `${PACK_TYPE_NAME[kind]} 收 ${tagName(v.t)} 没实测过`);
    }
    const raw = v.v as number | bigint;
    const d = typeof raw === "bigint" ? Number(raw) : raw;
    return kind === "float32" ? Math.fround(d) : d;
  }
  if (v.t === Tag.BOOL) return kind === "int64" ? (v.v as boolean ? 1n : 0n) : v.v ? 1 : 0;
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
    throw new UnsupportedError(
      "packed-byte-element",
      `往 ${PACK_TYPE_NAME[kind]} 塞 ${tagName(v.t)} 没实测过（Godot 对字面量是解析期拒，运行期那一格我们没量）`,
    );
  }
  if (kind === "int64") {
    if (v.t === Tag.FLOAT) {
      const f = v.v as number;
      // 超出 int64 的浮点饱和到 INT64_MIN（与 `builtins.ts` 的 `int()` 同一条式子）；nan / ±inf 这一格响亮拒。
      if (!Number.isFinite(f)) {
        throw new UnsupportedError("packed-element-overflow", `PackedInt64Array 收 ${String(f)}：饱和只量了有限大数（1e30 → INT64_MIN），nan/inf 那一格没实测过`);
      }
      if (Math.abs(f) >= TWO_63) return INT64_MIN;
      return BigInt(Math.trunc(f));
    }
    const n = v.v as number | bigint;
    return typeof n === "bigint" ? n : BigInt(Math.trunc(n));
  }
  if (v.t === Tag.FLOAT) {
    const f = v.v as number;
    if (kind === "int32") {
      if (f > INT32_MAX) return INT32_MIN;
      if (f < INT32_MIN) {
        throw new UnsupportedError("packed-element-overflow", `float → PackedInt32Array 的负向溢出只量了 int 那一侧（-2147483649 → 2147483647 是回绕），float 的下溢没量过`);
      }
      return Math.trunc(f);
    }
    return toByte0(Math.trunc(f));
  }
  const payload = v.v as number | bigint;
  if (kind === "int32") return foldInt32(payload);
  if (typeof payload === "bigint") return Number(((payload % 256n) + 256n) % 256n);
  return toByte0(payload);
}

/** byte 那一支的折算：按 256 回绕（300 → 44、-1 → 255）。 */
function toByte0(n: number): number {
  return ((Math.trunc(n) % 256) + 256) % 256;
}

/** 兼容旧调用点（byte 的折算名）。 */
export function toByte(v: Variant): number {
  return toElem("byte", v) as number;
}

function elemVariant(kind: PackKind, e: PackElem): Variant {
  if (kind === "string") return V.str(e as string);
  if (kind === "vector2" || kind === "vector3" || kind === "color") return V.object(e as object);
  if (kind === "float32" || kind === "float64") return V.float(e as number);
  return kind === "int64" ? V.int(typeof e === "bigint" ? e : BigInt(e as number)) : V.int(e as number | bigint);
}

/** 码点切分：`Array.from(string)` 在静态编译目标上没有 lowering，自己按代理对走。 */
function toCodepoints(s: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const hi = s.charCodeAt(i);
    const lo = i + 1 < s.length ? s.charCodeAt(i + 1) : 0;
    if (hi >= 0xd800 && hi <= 0xdbff && lo >= 0xdc00 && lo <= 0xdfff) {
      out.push(s.slice(i, i + 2));
      i++;
      continue;
    }
    out.push(s.charAt(i));
  }
  return out;
}

/** 码点比较，不是 JS 默认的 UTF-16 码元比较。 */
function cmpStrings(a: string, b: string): number {
  const x = toCodepoints(a);
  const y = toCodepoints(b);
  const n = Math.min(x.length, y.length);
  for (let i = 0; i < n; i++) {
    const ca = x[i] as string;
    const cb = y[i] as string;
    if (ca !== cb) return (ca.codePointAt(0) as number) < (cb.codePointAt(0) as number) ? -1 : 1;
  }
  return x.length === y.length ? 0 : x.length < y.length ? -1 : 1;
}

/** 分量字典序（先 x 再 y 再 z）；「按名字取分量」在静态编译目标上不可编，所以调用方把分量摆齐了给进来。 */
function cmpNums(xs: number[], ys: number[]): number {
  const n = xs.length < ys.length ? xs.length : ys.length;
  for (let i = 0; i < n; i++) {
    const av = xs[i] as number;
    const bv = ys[i] as number;
    if (av !== bv) return av < bv ? -1 : 1;
  }
  return 0;
}

/** int64 家族里 number 与 bigint 混着存，比较前先各自归到 bigint；归不了的（向量/颜色）交给上层。 */
function asBig(x: PackElem): bigint | null {
  if (typeof x === "bigint") return x;
  if (typeof x !== "number") return null;
  const n: number = x;
  return BigInt(n);
}

/** int64 那一格归成 bigint（`BigInt(union)` 在静态目标上没有 lowering，先按 `asBig` 收窄）。 */
function bigElem(x: PackElem): bigint {
  const b = asBig(x);
  if (b !== null) return b;
  throw new UnsupportedError("packed-int64", `int64 pack 里出现了 ${typeof x} 元素`);
}

/** int64 的两个 int64 比大小。 */
function bigCmp(x: bigint, y: bigint): number {
  // bigint 的比较与转换在静态目标上没有 lowering，`DataView` 的读写都有 —— 拆成带符号的高 32 位 + 无符号的低 32 位按 number 比。
  const buf = new ArrayBuffer(8);
  const dv = new DataView(buf);
  dv.setBigInt64(0, x);
  const xHi = dv.getInt32(0);
  const xLo = dv.getUint32(4);
  dv.setBigInt64(0, y);
  const yHi = dv.getInt32(0);
  if (yHi !== xHi) return xHi < yHi ? -1 : 1;
  const yLo = dv.getUint32(4);
  return xLo === yLo ? 0 : xLo < yLo ? -1 : 1;
}

/** UTF-8 解码（`get_string_from_utf8()`）：`new TextDecoder(标签, 选项)` 在静态编译目标上没有 lowering，照 WHATWG 的 utf-8 状态机自己走 —— 非法序列给**一个** U+FFFD 并从下一个字节重扫。 */
export function utf8Decode(items: number[]): string {
  const out: string[] = [];
  const len = items.length;
  let i = 0;
  while (i < len) {
    const b0 = items[i] as number;
    if (b0 <= 0x7f) {
      out.push(String.fromCharCode(b0));
      i++;
      continue;
    }
    const need = b0 >= 0xc2 && b0 <= 0xdf ? 2 : b0 >= 0xe0 && b0 <= 0xef ? 3 : b0 >= 0xf0 && b0 <= 0xf4 ? 4 : 0;
    if (need === 0) {
      out.push("\uFFFD");
      i++;
      continue;
    }
    // 第二个字节的有效区间就是「最短形式 + 不落在代理区 + 不超 U+10FFFF」那三条界，往后的后续字节回到 80..BF；违界的字节**不消费**，下一轮重新当引导字节看。
    let lo = 0x80;
    let hi = 0xbf;
    if (b0 === 0xe0) lo = 0xa0;
    else if (b0 === 0xed) hi = 0x9f;
    else if (b0 === 0xf0) lo = 0x90;
    else if (b0 === 0xf4) hi = 0x8f;
    let code = need === 2 ? b0 & 0x1f : need === 3 ? b0 & 0x0f : b0 & 0x07;
    let k = 1;
    for (; k < need; k++) {
      const at = i + k;
      if (at >= len) {
        out.push("\uFFFD");
        return out.join("");
      }
      const bk = items[at] as number;
      if (bk < lo || bk > hi) {
        out.push("\uFFFD");
        i += k;
        break;
      }
      code = (code << 6) | (bk & 0x3f);
      lo = 0x80;
      hi = 0xbf;
    }
    if (k === need) {
      if (code <= 0xffff) out.push(String.fromCharCode(code));
      else {
        const c = code - 0x10000;
        out.push(String.fromCharCode(0xd800 + (c >> 10), 0xdc00 + (c & 0x3ff)));
      }
      i += need;
    }
  }
  return out.join("");
}

/** 数值的相等（int64 走 bigint，其余 ===）。 */
function scalarSame(a: PackElem, b: PackElem): boolean {
  if (typeof a === "string" || typeof b === "string") return a === b;
  if (typeof a === "bigint" || typeof b === "bigint") {
    const ba = asBig(a);
    const bb = asBig(b);
    if (ba !== null && bb !== null) return ba === bb;
  }
  return a === b;
}

/** 一格的比较：与 `sort` / `bsearch` 共用这一条口径（数值、String 码点、向量与颜色按分量字典序）。 */
function cmpElem(kind: PackKind, a: PackElem, b: PackElem): number {
  if (kind === "color") {
    const x = a as GColor;
    const y = b as GColor;
    return cmpNums([x.r, x.g, x.b, x.a], [y.r, y.g, y.b, y.a]);
  }
  if (kind === "vector2") {
    const x = a as GVector2;
    const y = b as GVector2;
    return cmpNums([x.x, x.y], [y.x, y.y]);
  }
  if (kind === "vector3") {
    const x = a as GVector3;
    const y = b as GVector3;
    return cmpNums([x.x, x.y, x.z], [y.x, y.y, y.z]);
  }
  if (kind === "string") return cmpStrings(a as string, b as string);
  if (kind === "int64") return bigCmp(bigElem(a), bigElem(b));
  const x = a as number;
  const y = b as number;
  return x < y ? -1 : x > y ? 1 : 0;
}

/** 一格的相等：向量与颜色按**分量内容**比，不是 JS 的引用等。 */
function elemSame(kind: PackKind, a: PackElem, b: PackElem): boolean {
  if (kind === "vector2") return (a as GVector2).x === (b as GVector2).x && (a as GVector2).y === (b as GVector2).y;
  if (kind === "vector3")
    return (a as GVector3).x === (b as GVector3).x && (a as GVector3).y === (b as GVector3).y && (a as GVector3).z === (b as GVector3).z;
  if (kind === "color")
    return (
      (a as GColor).r === (b as GColor).r &&
      (a as GColor).g === (b as GColor).g &&
      (a as GColor).b === (b as GColor).b &&
      (a as GColor).a === (b as GColor).a
    );
  return scalarSame(a, b);
}

/** 元素按形状取成 Variant —— values.ts 的打印用它，逐个走各自类型的 print 口径（浮点那套不是字符串插值）。 */
export function packItems(p: GBytes): Variant[] {
  return p.raw().map((e) => elemVariant(p.kind, e));
}

/** 按下标取一格：**负下标从尾部数**（读与写都是），越界给与 Godot 一致的报错文本。 */
function elemAt(p: GBytes, idx: Variant): PackElem {
  const n = intToNum(idx.v as number | bigint);
  const at = typeof n === "bigint" ? Number(n) : Math.trunc(n);
  const real = at < 0 ? p.length + at : at;
  if (real < 0 || real >= p.length) {
    throw new GodotRuntimeError(
      "packed-index",
      `Invalid access of index '${String(at)}' on a base object of type: '${PACK_TYPE_NAME[p.kind]}'.`,
    );
  }
  return p.raw()[real] as number | bigint;
}

export function packCtor(kind: PackKind, args: Variant[]): Variant {
  if (args.length > 1) {
    throw new GodotRuntimeError("arity", `${PACK_TYPE_NAME[kind]}() 最多 1 个参数（收到 ${args.length} 个）`);
  }
  if (args.length === 0) return V.object(new GBytes([], kind));
  const src = args[0] as Variant;
  // 元素先攒在局部数组里再交给构造器：静态编译目标上「往方法返回的数组里 push」是空操作（S289 的 scriptc 读数）。
  const items: PackElem[] = [];
  if (src.t === Tag.ARRAY) {
    for (const item of (src.v as GArray).raw()) items.push(toElem(kind, item));
  } else if (isBytes(src)) {
    const sb = packBytes(src);
    if (sb.kind !== kind) {
      throw new UnsupportedError("packed-ctor-kind", `${PACK_TYPE_NAME[kind]}(${packTypeName(sb.kind)}) 这种跨 pack 的拷贝没实测过`);
    }
    for (const item of sb.raw()) items.push(item);
  }
  return V.object(new GBytes(items, kind));
}

export function bytesCtor(args: Variant[]): Variant {
  return packCtor("byte", args);
}

/** Godot 里**不存在**的那批方法名：调用给与 `Nonexistent function` 一致的那句。 */
const NO_SUCH_METHOD = new Set([
  "min",
  "max",
  "sum",
  "pop_back",
  "pop_front",
  "subarray",
  "to_string",
  "decode_utf8",
  "decode_ascii",
  "hash",
  "push_front",
  "copy_on_write",
  "join",
  // 九支逐支量过都说没这名字（`tmp/probe-pack/arity2.log` 11/13/…/27 格）：pack 只有 `sort`，`sort_custom` 是 Array 那侧的
  "sort_custom",
]);
/** 存在但还没实现的形状 —— 响亮拒，不拿别的 pack 的结论凑。 */
const NOT_YET = new Set(["to_hex_string", "search_sorted"]);
/** int64 / float32 / float64 / vector2 / vector3 / color 六支上量到「引擎没这名字」的那一批 —— 六支读数一字不差
 *  （`tmp/probe-pack/sweep.json`，312 格里引擎说无的 180 格）。名字里混着几个根本不是方法的串（`int32` / `vector2` 那一族，
 *  是扫描时从本文件的表里连出来的），引擎对它们同样给 Nonexistent，所以一并登进来 —— 此前它们落到 switch 的兜底，发的是中文自述。 */
const MISSING_ON_SIX = new Set([
  "arity",
  "bigint",
  "bsearch_custom",
  "color",
  "compress",
  "decode_string",
  "decompress",
  "empty",
  "float32",
  "float64",
  "get_bytes",
  "get_string_from_ascii",
  "get_string_from_utf8",
  "hex_encode",
  "index_of",
  "int32",
  "int64",
  "remove_at_copy",
  "search_sorted",
  "string",
  "to_base64",
  "to_float32_array",
  "to_float64_array",
  "to_hex_string",
  "to_int32_array",
  "to_int64_array",
  "to_raw_string",
  "vector2",
  "vector3",
]);
/** 只在**某一种 pack** 上确认过「没有这个方法」的名字：只在确认的那一支给报错文本，其余仍走响亮拒。 */
const MISSING_ON: Partial<Record<PackKind, Set<string>>> = {
  byte: new Set(["to_hex_string", "search_sorted", "to_base64", "decode_string", "to_byte_array", "to_raw_string", "get_bytes", "remove_at_copy", "bsearch_custom"]),
  string: new Set(["index_of"]),
  int32: new Set(["to_float32_array", "to_int32_array", "remove_at_copy"]),
  int64: MISSING_ON_SIX,
  float32: MISSING_ON_SIX,
  float64: MISSING_ON_SIX,
  vector2: MISSING_ON_SIX,
  vector3: MISSING_ON_SIX,
  color: MISSING_ON_SIX,
};
/** byte 那一支独有的方法（`to_*_array` 与压缩这一族）。 */
const BYTE_ONLY = new Set([
  "get_string_from_utf8",
  "get_string_from_ascii",
  "get_string_from_utf16",
  "get_string_from_wchar",
  "to_int32_array",
  "to_int64_array",
  "to_float32_array",
  "to_float64_array",
]);
/** 非 byte 形状上给与 `Nonexistent function` 一致的那句的那批名字。 */
const NON_BYTE_MISSING = new Set(["hex_encode", "compress", "decompress"]);

/** S414 的读数：180 个候选名在九支的构造位逐名过裁判，引擎开口的就是这些（尺 `tmp/probe-slice/round8.mts`，读数 `compare110.txt`）。
 *  方向是「裁判说没有的才发那句」—— 名单外的名字我们没量过，照旧响亮抛，不拿它冒充引擎的拒。 */
export const PACK_ABSENT_ALL = [
  "all", "any", "assign", "at", "back", "begins_with", "bigrams", "bin_to_int", "binary_search",
  "bsearch_custom", "c_escape", "c_unescape", "capitalize", "casecmp_to", "chr", "contains",
  "containsn", "countn", "dedent", "each", "ends_with", "filecasecmp_to", "filenocasecmp_to", "filter",
  "find_custom", "find_key", "findn", "format", "front", "get_base_dir", "get_basename",
  "get_extension", "get_file", "get_index", "get_or_add", "get_pointer", "get_slice",
  "get_slice_count", "get_slicec", "get_typed_builtin", "get_typed_class_name", "get_typed_script",
  "has_all", "hash", "hex_decode", "hex_to_int", "humanize_size", "indent", "insert_array",
  "is_absolute_path", "is_null", "is_read_only", "is_relative_path", "is_same_typed",
  "is_subsequence_of", "is_subsequence_ofn", "is_typed", "is_valid_filename", "is_valid_float",
  "is_valid_hex_number", "is_valid_html_color", "is_valid_identifier", "is_valid_int",
  "is_valid_ip_address", "join", "json_escape", "keys", "left", "length", "lpad", "lstrip",
  "make_read_only", "map", "match", "matchn", "max", "md5_buffer", "md5_text", "merge", "merged",
  "min", "naturalcasecmp_to", "naturalnocasecmp_to", "nocasecmp_to", "num", "num_int64",
  "num_scientific", "num_uint64", "pad_decimals", "pad_zeros", "path_join", "pick_random", "pop_at",
  "pop_back", "pop_front", "push_front", "recursive_equal", "reduce", "repeat", "replace", "replacen",
  "rfind_custom", "rfindn", "right", "rpad", "rsplit", "rstrip", "same_type", "sha1_buffer",
  "sha1_text", "sha256_buffer", "sha256_text", "shuffle", "similarity", "simplify_path", "sort_custom",
  "sort_flags", "split", "split_floats", "strip_edges", "strip_escapes", "substr", "to_ascii_buffer",
  "to_camel_case", "to_float", "to_int", "to_kebab_case", "to_lower", "to_pascal_case",
  "to_snake_case", "to_upper", "to_utf16_buffer", "to_utf32_buffer", "to_utf8_buffer",
  "to_wchar_buffer", "trim_prefix", "trim_suffix", "unicode_at", "uri_decode", "uri_encode",
  "validate_filename", "validate_node_name", "values", "xml_escape", "xml_unescape",
];

/** byte 之外那八支还多开口这 11 名（byte 自己都有）。 */
export const PACK_ABSENT_NOT_BYTE = [
  "compress", "decompress", "get_string_from_ascii", "get_string_from_utf16", "get_string_from_utf8",
  "get_string_from_wchar", "hex_encode", "to_float32_array", "to_float64_array", "to_int32_array",
  "to_int64_array",
];

/** 反过来：`to_byte_array` 其余八支都有，唯独 byte 自己开口。 */
export const PACK_ABSENT_BYTE_ONLY = ["to_byte_array"];

export function packNameAbsent(kind: PackKind, name: string): boolean {
  return PACK_ABSENT_ALL.includes(name) || (kind === "byte" ? PACK_ABSENT_BYTE_ONLY : PACK_ABSENT_NOT_BYTE).includes(name);
}

function arity(name: string, args: Variant[], n: number): void {
  if (args.length !== n) throw new GodotRuntimeError("arity", `${name}() 需要 ${n} 个参数（收到 ${args.length} 个）`);
}

/** 压缩这一族的编解码器形状：runtime **自己不去找** node 的 zlib（`globalThis.process` 那种取法在静态编译目标上不可编），只留槽由宿主注册，没注册就响亮拒、不用近似。 */
type Codec = { pack: (b: Uint8Array) => Uint8Array; unpack: (b: Uint8Array) => Uint8Array };

let zip1: Codec | null = null;
let zip2: Codec | null = null;
let zip3: Codec | null = null;

/** `decompress()` 的三块失败文案：packed 不能 import frames（frames → values → packed 会成环），由 methods.ts 注入。 */
type PackErrSink = { bufferZero: () => void; srcZero: () => void; inflateErr: () => void };
let packErrSink: PackErrSink | null = null;

export function registerPackErrorSink(s: PackErrSink): void {
  packErrSink = s;
}

/** 宿主把某个模式的编解码器挂进来（`mode` 只认 1 / 2 / 3）。 */
export function registerZipCodec(mode: number, codec: Codec): void {
  if (mode === 1) zip1 = codec;
  else if (mode === 2) zip2 = codec;
  else if (mode === 3) zip3 = codec;
}

/** `compress()` / `decompress()` 的模式：1 = zlib deflate、2 = zstd、3 = gzip；0 是不写模式时的默认值、交 null 表示发不出去，越界模式交 `"empty"`（给空 pack）。 */
function codecFor(mode: number): Codec | "empty" | null {
  if (mode === 1) return zip1;
  if (mode === 3) return zip3;
  if (mode === 2) return zip2;
  if (mode === 0) return null;
  return "empty";
}

/** 模式实参：只收 int，别的来源响亮拒。 */
function modeOf(v: Variant): number {
  if (v.t !== Tag.INT) {
    throw new UnsupportedError("compress-mode-kind", `compress() / decompress() 的模式只实测过 int（收到 ${tagName(v.t)}）`);
  }
  const n = intToNum(v.v as number | bigint);
  return typeof n === "bigint" ? Number(n) : n;
}

/** `decompress_dynamic()` 的宿主编解码槽（S557）：只分派并吞解压异常；ERROR 块与返回值由调用方（methods.ts）发。 */
export function packDynamicUnpack(bytes: number[], mode: number): Uint8Array | "empty" | "n/a" | "failed" {
  const codec = codecFor(mode);
  if (codec === "empty") return "empty";
  if (codec === null) return "n/a";
  try {
    return codec.unpack(byteBuf(bytes as PackElem[]));
  } catch {
    return "failed";
  }
}

/** pack 的格子 → 字节缓冲（byte pack 的元素在 `toElem` 那侧已经折到 0..255）。 */
function byteBuf(items: PackElem[]): Uint8Array {
  const buf = new Uint8Array(items.length);
  for (let i = 0; i < items.length; i++) {
    const e = items[i] as number | bigint;
    buf[i] = (typeof e === "bigint" ? Number(e) : e) & 255;
  }
  return buf;
}

/** byte → 别的形状：**小端**逐组读；长度**不是整数倍时给空 pack**（不是「有几个整组读几个」）。 */
function bytesToPack(items: PackElem[], kind: PackKind, width: number, read: (dv: DataView, off: number) => PackElem): Variant {
  const buf = byteBuf(items);
  if (buf.length % width !== 0) return V.object(new GBytes([], kind));
  const dv = new DataView(buf.buffer);
  const out: PackElem[] = [];
  for (let off = 0; off + width <= buf.length; off += width) out.push(read(dv, off));
  return V.object(new GBytes(out, kind));
}

/** 别的形状 → byte：**小端**逐格铺平（向量与颜色按分量各一个 float32）；String 那一支是**每个元素一份 UTF-8 再接一个 0**。 */
function packToBytes(kind: PackKind, items: PackElem[]): number[] {
  const out: number[] = [];
  const one = (width: number, fill: (dv: DataView) => void): void => {
    const buf = new ArrayBuffer(width);
    const dv = new DataView(buf);
    fill(dv);
    // `out.push(...new Uint8Array(buf))` 那种展开在静态目标上没有 lowering，逐格读。
    for (let i = 0; i < width; i++) out.push(dv.getUint8(i));
  };
  for (const e of items) {
    if (kind === "string") {
      const enc = new TextEncoder().encode(e as string);
      for (let i = 0; i < enc.length; i++) out.push(enc[i] as number);
      out.push(0);
    } else if (kind === "int32") {
      one(4, (dv) => dv.setInt32(0, e as number, true));
    } else if (kind === "int64") {
      one(8, (dv) => dv.setBigInt64(0, bigElem(e), true));
    } else if (kind === "float32") {
      one(4, (dv) => dv.setFloat32(0, e as number, true));
    } else if (kind === "float64") {
      one(8, (dv) => dv.setFloat64(0, e as number, true));
    } else {
      const vs =
        kind === "vector2" ? [(e as GVector2).x, (e as GVector2).y]
        : kind === "vector3" ? [(e as GVector3).x, (e as GVector3).y, (e as GVector3).z]
        : [(e as GColor).r, (e as GColor).g, (e as GColor).b, (e as GColor).a];
      one(vs.length * 4, (dv) => vs.forEach((v, i) => dv.setFloat32(i * 4, v, true)));
    }
  }
  return out;
}

export function packMethod(p: GBytes, name: string, args: Variant[]): Variant {
  const items = p.raw();
  const kind = p.kind;
  if (NON_BYTE_MISSING.has(name) && kind !== "byte") {
    throw new GodotRuntimeError("packed-no-method", `Invalid call. Nonexistent function '${name}' in base '${PACK_TYPE_NAME[kind]}'.`);
  }
  if (NO_SUCH_METHOD.has(name)) {
    throw new GodotRuntimeError("packed-no-method", `Invalid call. Nonexistent function '${name}' in base '${PACK_TYPE_NAME[kind]}'.`);
  }
  if (MISSING_ON[kind]?.has(name) === true) {
    throw new GodotRuntimeError("packed-no-method", `Invalid call. Nonexistent function '${name}' in base '${PACK_TYPE_NAME[kind]}'.`);
  }
  if (NOT_YET.has(name)) {
    throw new UnsupportedError("packed-method", `${PACK_TYPE_NAME[kind]}.${name}() 还没实测过，不发出去`);
  }
  if (BYTE_ONLY.has(name) && kind !== "byte") {
    // 这一组此前发的是中文自述；S302 一名一名过了裁判：引擎给的就是那句 Nonexistent function（`compress` / `to_int64_array` 等 11 格实测）
    throw new GodotRuntimeError("packed-no-method", `Invalid call. Nonexistent function '${name}' in base '${PACK_TYPE_NAME[kind]}'.`);
  }
  switch (name) {
    case "size":
      return V.int(items.length);
    case "is_empty":
      return V.bool(items.length === 0);
    case "append": {
      arity("append", args, 1);
      items.push(toElem(kind, args[0] as Variant));
      return V.bool(false);
    }
    // `push_back` 与 `append` 是同一支读数：九支都收下、元素照槽转、返回 bool 且实测值是 false（`tmp/probe-pack/compare15.txt`）。
    // 它此前挂在 `NO_SUCH_METHOD` 那张表上，发的是「引擎没这名字」—— 名单污染，九支逐支过裁判后摘掉（`tmp/probe-pack/nosuch.json`）。
    case "push_back": {
      arity("push_back", args, 1);
      items.push(toElem(kind, args[0] as Variant));
      return V.bool(false);
    }
    case "clear": {
      arity("clear", args, 0);
      items.length = 0;
      return V.nil();
    }
    case "append_array": {
      arity("append_array", args, 1);
      const arg = args[0] as Variant;
      if (!isBytes(arg)) {
        throw new UnsupportedError("append-array-element", `append_array() 只实测过 pack 实参（收到 ${tagName(arg.t)}）`);
      }
      const src = packBytes(arg);
      if (src.kind !== kind) {
        throw new UnsupportedError("append-array-kind", `append_array() 跨 pack 形状（${packTypeName(src.kind)} → ${PACK_TYPE_NAME[kind]}）没实测过`);
      }
      for (const v of src.raw()) items.push(v);
      return V.nil();
    }
    case "insert": {
      arity("insert", args, 2);
      const at = intToNum((args[0] as Variant).v as number | bigint);
      const pos = typeof at === "bigint" ? Number(at) : at;
      if (!(pos >= 0 && pos <= items.length)) {
        return V.int(31);
      }
      items.splice(pos, 0, toElem(kind, args[1] as Variant));
      return V.int(0);
    }
    // `erase(value)`（S562）：把实参按元素槽折算后删**第一处**命中，返回是否删了；向量/颜色按分量比
    case "erase": {
      arity("erase", args, 1);
      const want = toElem(kind, args[0] as Variant);
      for (let i = 0; i < items.length; i++) {
        if (elemSame(kind, items[i] as PackElem, want)) {
          items.splice(i, 1);
          return V.bool(true);
        }
      }
      return V.bool(false);
    }
    case "remove_at": {
      arity("remove_at", args, 1);
      const at = intToNum((args[0] as Variant).v as number | bigint);
      const pos = typeof at === "bigint" ? Number(at) : at;
      if (pos >= 0 && pos < items.length) items.splice(pos, 1);
      return V.nil();
    }
    case "resize": {
      arity("resize", args, 1);
      const n = intToNum((args[0] as Variant).v as number | bigint);
      const want = typeof n === "bigint" ? Number(n) : n;
      if (want < 0) return V.int(31);
      const filler = defaultElem(kind);
      while (items.length < want) items.push(filler);
      if (want < items.length) items.length = want;
      return V.int(0);
    }
    case "fill": {
      arity("fill", args, 1);
      const v = toElem(kind, args[0] as Variant);
      items.fill(v);
      return V.nil();
    }
    case "has":
    case "count":
    case "find":
    case "rfind": {
      arity(name, args, 1);
      const want = toElem(kind, args[0] as Variant);
      // 值类型 pack 的检索按**分量内容**比：JS 的 includes / indexOf 对这些载荷是引用等，所以三种形状都走 elemSame。
      const same = (x: PackElem): boolean => elemSame(kind, x, want);
      if (name === "has") return V.bool(items.some(same));
      if (name === "count") return V.int(items.filter(same).length);
      if (name === "find") return V.int(items.findIndex(same));
      // rfind 只在 byte 那一支支持，其余形状响亮拒，不照 find 推
      if (kind !== "byte") throw new UnsupportedError("packed-rfind", `${kind} 的 rfind() 没实测过，只在 PackedByteArray 上量过`);
      for (let i = items.length - 1; i >= 0; i--) if (same(items[i] as PackElem)) return V.int(i);
      return V.int(-1);
    }
    case "sort":
      items.sort((x, y) => cmpElem(kind, x, y));
      return V.nil();
    case "bsearch": {
      if (args.length < 1 || args.length > 2) {
        throw new GodotRuntimeError("arity", `bsearch() 最多 2 个参数（收到 ${args.length} 个）`);
      }
      // `bsearch()` 返回的**永远是下标**（找不到不给 -1）：`before` 默认真 = lower_bound、假 = upper_bound，未排序的 pack 上也是确定结果。
      // 第二参取之前先看清有没有 —— 缺位时是 undefined，断言进非空类型在静态目标上运行期就拒。
      const second = args.length === 2 ? (args[1] as Variant) : null;
      if (second !== null && second.t !== Tag.BOOL) {
        throw new UnsupportedError("bsearch-before", `bsearch() 的第二个参数只实测过 bool（收到 ${tagName(second.t)}）`);
      }
      const before = second === null ? true : (second.v as boolean);
      const want = toElem(kind, args[0] as Variant);
      let first = 0;
      let len = items.length;
      while (len > 0) {
        const half = len >> 1;
        const mid = first + half;
        const c = cmpElem(kind, items[mid] as PackElem, want);
        if (before ? c < 0 : c <= 0) {
          first = mid + 1;
          len -= half + 1;
        } else {
          len = half;
        }
      }
      return V.int(first);
    }
    case "reverse":
      items.reverse();
      return V.nil();
    case "duplicate":
      return V.object(new GBytes(copyElems(items), kind));
    case "slice": {
      if (args.length < 1 || args.length > 2) {
        throw new GodotRuntimeError("arity", `slice() 需要 1 或 2 个参数（收到 ${args.length} 个）`);
      }
      const from = intToNum((args[0] as Variant).v as number | bigint);
      const begin = typeof from === "bigint" ? Number(from) : from;
      const to = args[1];
      const end = to === undefined ? items.length : intToNum(to.v as number | bigint);
      return V.object(new GBytes(items.slice(begin, typeof end === "bigint" ? Number(end) : end), kind));
    }
    case "get": {
      arity("get", args, 1);
      const gv = intToNum((args[0] as Variant).v as number | bigint);
      const n = typeof gv === "bigint" ? Number(gv) : Math.trunc(gv);
      // `get()` 的负下标**不从尾部数**（与 `p[-1]` 相反）：它算越界、给默认元素值。
      return n >= 0 && n < items.length ? elemVariant(kind, items[n] as PackElem) : elemVariant(kind, defaultElem(kind));
    }
    case "set": {
      arity("set", args, 2);
      const sv = intToNum((args[0] as Variant).v as number | bigint);
      const at = typeof sv === "bigint" ? Number(sv) : Math.trunc(sv);
      // `set()` 的元素走与字面量同一套折算，**负下标与越界一律静默不动**（与 `p[i] = v` 的下标写相反）；它的返回是 void，取那个值在解析期就拒。
      if (at >= 0 && at < items.length) items[at] = toElem(kind, args[1] as Variant);
      return V.nil();
    }
    case "hex_encode":
      return V.str((items as number[]).map((x) => padZero2(hexLower(x))).join(""));
    case "to_int32_array":
      return bytesToPack(items, "int32", 4, (dv, off) => dv.getInt32(off, true));
    case "to_float32_array":
      return bytesToPack(items, "float32", 4, (dv, off) => dv.getFloat32(off, true));
    case "to_int64_array":
      return bytesToPack(items, "int64", 8, (dv, off) => dv.getBigInt64(off, true));
    case "to_float64_array":
      return bytesToPack(items, "float64", 8, (dv, off) => dv.getFloat64(off, true));
    case "to_byte_array":
      return V.object(new GBytes(packToBytes(kind, items), "byte"));
    case "compress": {
      if (args.length > 1) {
        throw new GodotRuntimeError("arity", `compress() 最多 1 个参数（收到 ${args.length} 个）`);
      }
      const mode = args.length === 0 ? 0 : modeOf(args[0] as Variant);
      if (mode === 0) {
        // FastLZ（S558）：引擎对 <16 字节的输入先补零到 16 再压（解回来是 16 字节），空输入在 PackedByteArray 层就短路成空
        const bytes = byteBuf(items);
        if (bytes.length === 0) return V.object(new GBytes([], "byte"));
        const src = bytes.length < 16 ? new Uint8Array(16) : bytes;
        if (bytes.length < 16) src.set(bytes);
        return V.object(new GBytes(bytesOf(fastlzCompress(src)), "byte"));
      }
      const codec = codecFor(mode);
      // 越界模式给空 pack；空 pack 压任何模式也还是空 pack（node 的 deflateSync 反倒给 8 字节，这一格必须照 Godot）
      if (codec === "empty" || items.length === 0) return V.object(new GBytes([], "byte"));
      if (codec === null) {
        throw new UnsupportedError("packed-compress-mode", `compress() 的 mode ${mode} 发不出去：0 是不写模式时的默认值，4.6.3 那侧给的是「头部字节 + 原字节 + 补零」那种形状，node 侧没有对得上的编解码器；1 / 2 / 3 要靠 process.getBuiltinModule("node:zlib")（这一版取不到，或 2 需要而它没有 zstd）。都不发近似值；要这一格改走 gds2js export --pack node，或直接用 node 跑产物（node ≥ 24 有 zstd）`);
      }
      return V.object(new GBytes(bytesOf(codec.pack(byteBuf(items))), "byte"));
    }
    case "decompress": {
      if (args.length < 1 || args.length > 2) {
        throw new GodotRuntimeError("arity", `decompress() 需要 1 或 2 个参数（收到 ${args.length} 个）`);
      }
      const mode = args.length === 2 ? modeOf(args[1] as Variant) : 0;
      if (mode === 0) {
        // FastLZ（S558）：buffer_size ≥ 16 当输出上限；< 16 时引擎只解到 16 字节临时缓冲再拷前 buffer_size 字节
        const sv0 = intToNum((args[0] as Variant).v as number | bigint);
        const want0 = typeof sv0 === "bigint" ? Number(sv0) : sv0;
        if (!(want0 > 0) || items.length === 0) return V.object(new GBytes([], "byte"));
        const plain0 = fastlzDecompress(byteBuf(items), want0 < 16 ? 16 : want0);
        if (want0 < 16) {
          // <16 时引擎把 16 字节临时缓冲原样拷出来；只有「正好解出 16 字节」（压缩端补零那条合法路）可复刻
          if (plain0 === null || plain0.length !== 16) {
            throw new UnsupportedError("fastlz-short-fail", "FastLZ 解压在 buffer_size<16 下没解出整 16 字节：引擎拷的是未初始化的临时缓冲（实测每次不同），这一形不发");
          }
          return V.object(new GBytes(bytesOf(plain0.slice(0, want0)), "byte"));
        }
        if (plain0 === null) return V.object(new GBytes([], "byte"));
        return V.object(new GBytes(bytesOf(plain0), "byte"));
      }
      const codec = codecFor(mode);
      if (codec === "empty") return V.object(new GBytes([], "byte"));
      if (codec === null) {
        throw new UnsupportedError("packed-compress-mode", `decompress() 的 mode ${mode} 没法逐字节对上（同 compress()：0 是默认模式、node 侧没对应编解码器），不发近似值；要这一格改走 gds2js export --pack node，或直接用 node 跑产物（node ≥ 24 有 zstd）`);
      }
      const sv = intToNum((args[0] as Variant).v as number | bigint);
      const want = typeof sv === "bigint" ? Number(sv) : sv;
      // `expected` ≤ 0 或比真身小都给空 pack（不是截断）；比真身大也不补零，给的就是真身。
      if (!(want > 0)) {
        if (packErrSink !== null) packErrSink.bufferZero();
        return V.object(new GBytes([], "byte"));
      }
      if (items.length === 0) {
        if (packErrSink !== null) packErrSink.srcZero();
        return V.object(new GBytes([], "byte"));
      }
      let plain: Uint8Array;
      try {
        plain = codec.unpack(byteBuf(items));
      } catch {
        // zlib 的两支解不开时引擎在 compression 层打 `err != 1`；zstd 那支不打块
        if ((mode === 1 || mode === 3) && packErrSink !== null) packErrSink.inflateErr();
        return V.object(new GBytes([], "byte"));
      }
      if (plain.length > want) {
        if ((mode === 1 || mode === 3) && packErrSink !== null) packErrSink.inflateErr();
        return V.object(new GBytes([], "byte"));
      }
      return V.object(new GBytes(bytesOf(plain), "byte"));
    }
    case "get_string_from_utf16":
    case "get_string_from_wchar": {
      // S561：Windows 那侧 wchar 就是 UTF-16；带 BOM 时跟 BOM 走字节序（FF FE 小端 / FE FF 大端），BOM 不进食
      const bytes = items as number[];
      let le = true;
      let start = 0;
      if (bytes.length >= 2) {
        if ((bytes[0] as number) === 0xff && (bytes[1] as number) === 0xfe) start = 2;
        else if ((bytes[0] as number) === 0xfe && (bytes[1] as number) === 0xff) {
          le = false;
          start = 2;
        }
      }
      const units: number[] = [];
      for (let i = start; i + 1 < bytes.length; i += 2) {
        units.push(le ? ((bytes[i] as number) | ((bytes[i + 1] as number) << 8)) : (((bytes[i] as number) << 8) | (bytes[i + 1] as number)));
      }
      let text = "";
      for (let i = 0; i < units.length; i++) {
        const u = units[i] as number;
        if (u >= 0xd800 && u <= 0xdbff) {
          const next = units[i + 1];
          if (next === undefined) {
            text += String.fromCharCode(u);
            continue;
          }
          if (next >= 0xdc00 && next <= 0xdfff) {
            text += String.fromCharCode(u, next);
            i++;
            continue;
          }
          throw new UnsupportedError("packed-utf16", "get_string_from_utf16() 里高位代理后跟的不是低位代理：引擎那形给的是 [65, 0] 这类怪值，没逆出来，不发");
        }
        text += String.fromCharCode(u);
      }
      return V.str(text);
    }
    case "get_string_from_utf8": {
      return V.str(utf8Decode(items as number[]));
    }
    case "get_string_from_ascii": {
      if (items.some((x) => (x as number) > 127)) {
        throw new UnsupportedError("packed-ascii", "get_string_from_ascii() 只实测过纯 ASCII 的字节");
      }
      return V.str(String.fromCharCode(...(items as number[])));
    }
    default:
      if (packNameAbsent(kind, name)) {
        throw new GodotRuntimeError("packed-no-method", `Invalid call. Nonexistent function '${name}' in base '${PACK_TYPE_NAME[kind]}'.`);
      }
      throw new UnsupportedError("packed-method", `${PACK_TYPE_NAME[kind]}.${name}() 未实现`);
  }
}

/** byte 的旧名入口（methods.ts 的分派点），转发到 packMethod。 */
export function bytesMethod(p: GBytes, name: string, args: Variant[]): Variant {
  return packMethod(p, name, args);
}

export function packReadIndex(p: GBytes, idx: Variant): Variant {
  return elemVariant(p.kind, elemAt(p, idx));
}

export function packWriteIndex(p: GBytes, idx: Variant, value: Variant): Variant | null {
  const atRaw = intToNum(idx.v as number | bigint);
  const at = typeof atRaw === "bigint" ? Number(atRaw) : Math.trunc(atRaw);
  const real = at < 0 ? p.length + at : at;
  if (real < 0 || real >= p.length) {
    throw new GodotRuntimeError(
      "packed-index-write",
      `Invalid assignment of index '${String(at)}' (on base: '${PACK_TYPE_NAME[p.kind]}') with value of type '${tagName(value.t)}'.`,
    );
  }
  // 下标写这一侧**只收同形状**：同一个值走 append / insert / set / 构造会升格，而 `p[0] = <别的东西>` 全是运行时报错；没确认过这一格的形状照旧走折算。
  const exact = PACK_WRITE_EXACT[p.kind];
  if (exact !== null) {
    const inner = value.t === Tag.OBJECT ? (value.v as object) : null;
    if (inner === null || !exact(inner)) {
      throw new GodotRuntimeError(
        "packed-index-write-type",
        `Invalid assignment of property or key '${String(at)}' with value of type '${writeValueName(value, inner)}' on a base object of type '${PACK_TYPE_NAME[p.kind]}'.`,
      );
    }
  }
  p.raw()[real] = toElem(p.kind, value);
  return null;
}

/** 下标写要求同形状的那几支；null 表示这一格没口径，照旧走折算。 */
const PACK_WRITE_EXACT: Record<PackKind, ((v: object) => boolean) | null> = {
  byte: null,
  int32: null,
  int64: null,
  float32: null,
  float64: null,
  string: null,
  color: null,
  vector2: (v) => v instanceof GVector2,
  vector3: (v) => v instanceof GVector3,
};

/** 报错文本里的类型名：值类型要说得出 `Vector3i`，`tagName` 只会给 `Object`。 */
function writeValueName(value: Variant, inner: object | null): string {
  if (inner instanceof GVector2) return "Vector2";
  if (inner instanceof GVector2i) return "Vector2i";
  if (inner instanceof GVector3) return "Vector3";
  if (inner instanceof GVector3i) return "Vector3i";
  if (inner instanceof GColor) return "Color";
  return tagName(value.t);
}

export function bytesReadIndex(b: GBytes, idx: Variant): Variant {
  return packReadIndex(b, idx);
}

export function bytesWriteIndex(b: GBytes, idx: Variant, value: Variant, _who?: string): Variant | null {
  return packWriteIndex(b, idx, value);
}

export /** 拼两段 PackElem：`[...a, ...b]` 那种展开在**含类实例的联合**数组上运行期会撞，所以一格一格 push。 */
function concatElems(xs: PackElem[], ys: PackElem[]): PackElem[] {
  const out: PackElem[] = [];
  for (let i = 0; i < xs.length; i++) out.push(xs[i] as PackElem);
  for (let i = 0; i < ys.length; i++) out.push(ys[i] as PackElem);
  return out;
}

function bytesOf(xs: Uint8Array): PackElem[] {
  const out: PackElem[] = [];
  for (let i = 0; i < xs.length; i++) out.push(xs[i] as number);
  return out;
}

function copyElems(xs: PackElem[]): PackElem[] {
  const out: PackElem[] = [];
  for (let i = 0; i < xs.length; i++) out.push(xs[i] as PackElem);
  return out;
}

function packConcat(a: GBytes, b: GBytes): Variant {
  if (a.kind !== b.kind) {
    throw new UnsupportedError("packed-concat-kind", `${packTypeName(a.kind)} + ${packTypeName(b.kind)} 没实测过`);
  }
  return V.object(new GBytes(concatElems(a.raw(), b.raw()), a.kind));
}

export function bytesConcat(a: GBytes, b: GBytes): Variant {
  return packConcat(a, b);
}

export function packEq(a: GBytes, b: GBytes): boolean {
  const x = a.raw();
  const y = b.raw();
  if (a.kind !== b.kind) {
    throw new UnsupportedError("packed-eq-kind", `${packTypeName(a.kind)} == ${packTypeName(b.kind)} 没实测过`);
  }
  if (x.length !== y.length) return false;
  return x.every((v, i) => elemSame(a.kind, v, y[i] as PackElem));
}

export function bytesEq(a: GBytes, b: GBytes): boolean {
  return packEq(a, b);
}
