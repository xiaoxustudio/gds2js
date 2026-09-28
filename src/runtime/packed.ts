import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToNum, tagName, type Variant } from "./tags";
// 只要类型：values.ts 反过来 import 这个模块（打印与相等都要认它），运行时互相引用就成了环
import type { GArray } from "./values";

/**
 * Packed\*Array 的**数值那一半**（S168 ①⑥⑦⑧ + S169 全量）。三种形状共用一套代码，
 * 因为实测下来它们的**行为口径一致、只有元素折算不同**：
 * - 赋值是共享引用，`PackedX(src)` / `duplicate()` / `slice()` 才是独立拷贝；
 * - `append` 取值合法且给 `false`（元素照样加），`insert`/`resize` 给 Error 状态码（0 / 31），
 *   `append_array`/`remove_at`/`fill`/`sort`/`reverse` 是 void（Godot 在解析期就拦，见 analyze.ts）；
 * - `insert` 与 `remove_at` 的负下标和越界一律**原样不动**（JS 的 splice 会当成尾部操作）；
 * - `get` 越界给 0 而 `b[i]` 越界报错；读与写的负下标都从尾部数；
 * - 元素折算：byte 折 0..255、int32 按 2^32 **回绕**（2147483648 → -2147483648、4294967296 → 0、
 *   9007199254740993 → 1），而 float→int32 是**饱和到 INT32_MIN**（1e308 → -2147483648，不是 INT32_MAX，
 *   也不是截断低位）；int64 保精确（`9007199254740993` 原样存 → 元素必须是 BigInt）；
 * - `typeof` 29 / 30 / 31。
 *
 * **还没做也没量**的：`PackedFloat32Array` / `PackedFloat64Array` 的元素打印（float32 的 `0.1` 印成
 * `0.10000000149012`、`1e308` 印成 `inf`，那套文本要单独逆，见 S169 的 ④），以及 String / Vector2 /
 * Vector3 / Color 四种 pack。发射表里它们仍在 `BUILTIN_TODO`，问到就响。
 */
export type PackKind = "byte" | "int32" | "int64";

const PACK_TYPE_NAME: Record<PackKind, string> = {
  byte: "PackedByteArray",
  int32: "PackedInt32Array",
  int64: "PackedInt64Array",
};
const PACK_TYPEOF: Record<PackKind, number> = { byte: 29, int32: 30, int64: 31 };

/** 元素存储：byte 与 int32 用 number（都已折进范围），int64 一律 BigInt（超过 2^53 也得保精确）。 */
export class GBytes {
  private items: (number | bigint)[];

  constructor(items: (number | bigint)[] = [], readonly kind: PackKind = "byte") {
    this.items = items;
  }

  raw(): (number | bigint)[] {
    return this.items;
  }

  get length(): number {
    return this.items.length;
  }

  static of(values: (number | bigint)[], kind: PackKind = "byte"): GBytes {
    return new GBytes(values, kind);
  }
}

export function packTypeName(kind: PackKind): string {
  return PACK_TYPE_NAME[kind];
}

export function packTypeOfCode(kind: PackKind): number {
  return PACK_TYPEOF[kind];
}

export function asBytes(v: Variant): GBytes | null {
  return v.t === Tag.OBJECT && v.v instanceof GBytes ? (v.v as GBytes) : null;
}

const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;

function foldInt32(n: number | bigint): number {
  // 整数是**回绕**（实测 2147483648 → -2147483648、4294967296 → 0、2^53+1 → 1）
  const m = typeof n === "bigint" ? Number(((n % 4294967296n) + 4294967296n) % 4294967296n) : Math.trunc(n) % 4294967296;
  const unsigned = typeof n === "bigint" ? m : ((m % 4294967296) + 4294967296) % 4294967296;
  return unsigned > INT32_MAX ? unsigned - 4294967296 : unsigned;
}

/**
 * 元素折算。只收实测过的来源：int / float（截断）/ bool / String（走 `to_int` 那一族，实测 `"x"` → 0）。
 * float→int32 的**饱和方向**只量了正的一侧（1e308 → INT32_MIN），负的一侧没量 → 响亮拒。
 */
export function toElem(kind: PackKind, v: Variant): number | bigint {
  if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) {
    // 实测 `PackedInt32Array(["x"])` → `[0]`、`PackedFloat32Array(["x"])` → `[0.0]`：**不是**解析期拒
    throw new UnsupportedError(
      "packed-element-string",
      `往 ${PACK_TYPE_NAME[kind]} 塞 String 只量到 "x" → 0 这一格（其余形状的换算没实测过）`,
    );
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
      if (!Number.isFinite(f) || Math.abs(f) >= 9223372036854775808) {
        throw new UnsupportedError("packed-element-overflow", `PackedInt64Array 收 ${String(f)} 这个形状没实测过`);
      }
      return BigInt(Math.trunc(f));
    }
    const n = v.v as number | bigint;
    return typeof n === "bigint" ? n : BigInt(Math.trunc(n));
  }
  if (v.t === Tag.FLOAT) {
    const f = v.v as number;
    if (kind === "int32") {
      // 实测：在 int32 范围内是截断（2.7 → 2、-2.7 → -2、0.1 → 0），越出上界**饱和到 INT32_MIN**
      if (f > INT32_MAX) return INT32_MIN;
      if (f < INT32_MIN) {
        throw new UnsupportedError("packed-element-overflow", `float → PackedInt32Array 的负向溢出只量了 int 那一侧（-2147483649 → 2147483647 是回绕），float 的下溢没量过`);
      }
      return Math.trunc(f);
    }
    return toByte0(Math.trunc(f));
  }
  const payload = v.v as number | bigint;
  // int32 / byte 的折算**按 bigint 走**：先过 intToNum 会把 9007199254740993 折成 9007199254740992，
  // 于是 mod 2^32 从 1 变成 0 —— 实测 Godot 给 1（S169 的 2^53+1 那一格就是为这条钉的）
  if (kind === "int32") return foldInt32(payload);
  if (typeof payload === "bigint") return Number(((payload % 256n) + 256n) % 256n);
  return toByte0(payload);
}

/** byte 那一支的折算：300 → 44、-1 → 255、下标写 700 → 188（回绕）。 */
function toByte0(n: number): number {
  return ((Math.trunc(n) % 256) + 256) % 256;
}

/** 兼容旧调用点（byte 的折算名）。 */
export function toByte(v: Variant): number {
  return toElem("byte", v) as number;
}

function elemVariant(kind: PackKind, e: number | bigint): Variant {
  return kind === "int64" ? V.int(typeof e === "bigint" ? e : BigInt(e)) : V.int(e);
}

/** 越界读的文本是实测的；**负下标从尾部数**（读与写都是，d6 / f52）。 */
function elemAt(p: GBytes, idx: Variant): number | bigint {
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

/** 实测过的 pack 构造器：byte（0/1 个实参，源是 Array 字面量或另一个 pack）与 int32 / int64。 */
export function packCtor(kind: PackKind, args: Variant[]): Variant {
  if (args.length > 1) {
    throw new GodotRuntimeError("arity", `${PACK_TYPE_NAME[kind]}() 最多 1 个参数（收到 ${args.length} 个）`);
  }
  if (args.length === 0) return V.object(new GBytes([], kind));
  const src = args[0] as Variant;
  const out = new GBytes([], kind);
  if (src.t === Tag.ARRAY) {
    for (const item of (src.v as GArray).raw()) out.raw().push(toElem(kind, item));
  } else {
    const sb = asBytes(src);
    if (sb === null) {
      throw new UnsupportedError("packed-ctor", `${PACK_TYPE_NAME[kind]}(${tagName(src.t)}) 这个初值形状没实测过`);
    }
    // 跨种形状的拷贝没量过（`PackedInt32Array(bytes)` 之类），照旧响着拒
    if (sb.kind !== kind) {
      throw new UnsupportedError("packed-ctor-kind", `${PACK_TYPE_NAME[kind]}(${packTypeName(sb.kind)}) 这种跨 pack 的拷贝没实测过`);
    }
    for (const item of sb.raw()) out.raw().push(item);
  }
  return V.object(out);
}

export function bytesCtor(args: Variant[]): Variant {
  return packCtor("byte", args);
}

/** 4.6.3 里**不存在**的那批（运行期 `Nonexistent function`，f41 / f42 / f49 / 用例 135 / S169 实测）。 */
const NO_SUCH_METHOD = new Set([
  "min",
  "max",
  "sum",
  "pop_back",
  "pop_front",
  "subarray",
  "to_string",
  "to_byte_array",
  "decode_utf8",
  "decode_ascii",
  "hash",
  "push_back",
  "push_front",
  // 旧文档里的写时复制入口对这个类型不存在（e3 实测：运行期错且打断脚本，进不了语料）
  "copy_on_write",
]);
/** 存在但这一轮没做 / 没实测的形状 —— 响亮拒，不拿别的 pack 的结论凑。 */
const NOT_YET = new Set(["bsearch", "to_hex_string", "to_raw_string", "compress", "decompress", "search_sorted", "set", "get_bytes", "remove_at_copy"]);
/** 只有 byte 那一支量过的方法（int pack 上 `hex_encode` 实测是 Nonexistent，另两个没量）。 */
const BYTE_ONLY = new Set(["get_string_from_utf8", "get_string_from_ascii"]);
const NON_BYTE_MISSING = new Set(["hex_encode"]);

function arity(name: string, args: Variant[], n: number): void {
  if (args.length !== n) throw new GodotRuntimeError("arity", `${name}() 需要 ${n} 个参数（收到 ${args.length} 个）`);
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
  if (NOT_YET.has(name)) {
    throw new UnsupportedError("packed-method", `${PACK_TYPE_NAME[kind]}.${name}() 还没实测过，不发出去`);
  }
  if (BYTE_ONLY.has(name) && kind !== "byte") {
    throw new UnsupportedError("packed-method", `${PACK_TYPE_NAME[kind]}.${name}() 只在 PackedByteArray 上量过`);
  }
  switch (name) {
    case "size":
      return V.int(items.length);
    case "is_empty":
      return V.bool(items.length === 0);
    case "append": {
      arity("append", args, 1);
      items.push(toElem(kind, args[0] as Variant));
      // 实测 `print(a.append(9))` 给 **false**（元素照样追加），三种形状都是这一句（e1 / k-*）
      return V.bool(false);
    }
    case "append_array": {
      arity("append_array", args, 1);
      const src = asBytes(args[0] as Variant);
      if (src === null) {
        throw new UnsupportedError("append-array-element", `append_array() 只实测过 pack 实参（收到 ${tagName((args[0] as Variant).t)}）`);
      }
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
      // 实测：负下标与越界都是**原样不动 + 返回 31**（不是尾部插入！JS 的 splice(-1) 会插到末尾，
      // 那是静默错），合法区间 0..len 给 0（e5 / d7 / g7，三种 pack 同形）
      if (!(pos >= 0 && pos <= items.length)) {
        return V.int(31);
      }
      items.splice(pos, 0, toElem(kind, args[1] as Variant));
      return V.int(0);
    }
    case "remove_at": {
      arity("remove_at", args, 1);
      const at = intToNum((args[0] as Variant).v as number | bigint);
      const pos = typeof at === "bigint" ? Number(at) : at;
      // 实测：负下标与越界**原样不动**（e7 / e8），splice(-1,1) 在 JS 是删最后一个 —— 必须挡
      if (pos >= 0 && pos < items.length) items.splice(pos, 1);
      return V.nil();
    }
    case "resize": {
      arity("resize", args, 1);
      const n = intToNum((args[0] as Variant).v as number | bigint);
      const want = typeof n === "bigint" ? Number(n) : n;
      // 实测：负数给 **31** 且长度不变；缩回去是截断；长出来的格子按**元素类型**填
      // 0 / 0 / 0n（k-*resgrow），成功一律 0（g2 / g3 / e4）
      if (want < 0) return V.int(31);
      const filler: number | bigint = kind === "int64" ? 0n : 0;
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
      arity("has", args, 1);
      return V.bool(items.includes(toElem(kind, args[0] as Variant)));
    case "count":
      arity("count", args, 1);
      return V.int(items.filter((x) => x === toElem(kind, args[0] as Variant)).length);
    case "find":
      arity("find", args, 1);
      return V.int(items.indexOf(toElem(kind, args[0] as Variant)));
    case "sort":
      items.sort(kind === "int64" ? (x, y) => (BigInt(x) < BigInt(y) ? -1 : BigInt(x) > BigInt(y) ? 1 : 0) : (x, y) => (x as number) - (y as number));
      return V.nil();
    case "reverse":
      items.reverse();
      return V.nil();
    case "duplicate":
      return V.object(new GBytes([...items], kind));
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
      // 实测：越界**不报错**、给 0（g4 / 三种 pack 的 line 8），与 `b[5]` 那句是全然两套口径。
      // 负下标的 `get` 没量过（下标读实测是从尾部数）→ 响着拒
      if (n < 0) {
        throw new UnsupportedError("packed-get-neg", "get() 的负下标没实测过（下标读实测是从尾部数）");
      }
      return n < items.length ? elemVariant(kind, items[n] as number | bigint) : V.int(0);
    }
    case "hex_encode":
      return V.str((items as number[]).map((x) => x.toString(16).padStart(2, "0")).join(""));
    case "get_string_from_utf8": {
      // f40 t4：字节 → UTF-8 文本，`[104,105]` → "hi"、`héllo` 的六字节回原样
      return V.str(new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(items as number[])));
    }
    case "get_string_from_ascii": {
      // f40 t12 只测过纯 ASCII（[104,105] → "hi"）；带高位字节的那一格没量（d8 实测给的是把 195 变成 **32**
      // 再加一句 stderr 的「Invalid unicode codepoint」，那条换算规则不是一套通用口径，先不套）
      if (items.some((x) => (x as number) > 127)) {
        throw new UnsupportedError("packed-ascii", "get_string_from_ascii() 只实测过纯 ASCII 的字节");
      }
      return V.str(String.fromCharCode(...(items as number[])));
    }
    default:
      throw new UnsupportedError("packed-method", `${PACK_TYPE_NAME[kind]}.${name}() 未实现`);
  }
}

/** 旧名保留（methods.ts 的 byte 分派点），行为已经是全 pack 通用的。 */
export function bytesMethod(p: GBytes, name: string, args: Variant[]): Variant {
  return packMethod(p, name, args);
}

export function packReadIndex(p: GBytes, idx: Variant): Variant {
  return elemVariant(p.kind, elemAt(p, idx));
}

export function packWriteIndex(p: GBytes, idx: Variant, value: Variant): Variant | null {
  const atRaw = intToNum(idx.v as number | bigint);
  const at = typeof atRaw === "bigint" ? Number(atRaw) : Math.trunc(atRaw);
  // 实测：**写**的负下标与读一样从尾部数（`b[-1] = 9` → `[1, 2, 9]`，d6；int pack 同形，k-*negwrite）
  const real = at < 0 ? p.length + at : at;
  if (real < 0 || real >= p.length) {
    throw new GodotRuntimeError(
      "packed-index-write",
      `Invalid assignment of index '${String(at)}' (on base: '${PACK_TYPE_NAME[p.kind]}') with value of type '${tagName(value.t)}'.`,
    );
  }
  p.raw()[real] = toElem(p.kind, value);
  return null;
}

export function bytesReadIndex(b: GBytes, idx: Variant): Variant {
  return packReadIndex(b, idx);
}

export function bytesWriteIndex(b: GBytes, idx: Variant, value: Variant, _who?: string): Variant | null {
  return packWriteIndex(b, idx, value);
}

export function packConcat(a: GBytes, b: GBytes): Variant {
  // f51 t1：`+` 是拼接且返回新的 pack。跨形状（byte + int32）没实测过 → 响
  if (a.kind !== b.kind) {
    throw new UnsupportedError("packed-concat-kind", `${packTypeName(a.kind)} + ${packTypeName(b.kind)} 没实测过`);
  }
  return V.object(new GBytes([...a.raw(), ...b.raw()], a.kind));
}

export function bytesConcat(a: GBytes, b: GBytes): Variant {
  return packConcat(a, b);
}

export function packEq(a: GBytes, b: GBytes): boolean {
  // f51 t2：逐元素比内容（`b == c` 假、与同内容的新 pack 相等真）
  const x = a.raw();
  const y = b.raw();
  if (a.kind !== b.kind) {
    throw new UnsupportedError("packed-eq-kind", `${packTypeName(a.kind)} == ${packTypeName(b.kind)} 没实测过`);
  }
  if (x.length !== y.length) return false;
  return x.every((v, i) => BigInt(v) === BigInt(y[i] as number | bigint));
}

export function bytesEq(a: GBytes, b: GBytes): boolean {
  return packEq(a, b);
}
