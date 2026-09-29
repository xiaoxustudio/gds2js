import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToNum, tagName, type Variant } from "./tags";
import { GColor } from "./color";
import { GVector2 } from "./vector2";
import { GVector2i } from "./vector2i";
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

/**
 * String pack 的元素折算是**取 show**（S171 实测：`[1, 2.5, true, null, &"nm"]` →
 * `["1", "2.5", "true", "<null>", "nm"]`）。show 住在 values.ts，而 values.ts 已经 import
 * 这个模块，所以不互相 import：由 values.ts 在模块初始化时把函数注进来。
 */
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

/**
 * 每种形状的**默认格子**：`resize` 长出来填它、`get` 越界给它、塞错类型也折成它。
 * 三条都是实测的（S173：向量与颜色 pack 的 `resize(3)` 补 `(0.0, 0.0)` / `(0.0, 0.0, 0.0)` /
 * `(0.0, 0.0, 0.0, 1.0)`，`get(9)` 同值；S171 ④：`PackedVector2Array([1])` → `[(0.0, 0.0)]`）。
 */
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

export function asBytes(v: Variant): GBytes | null {
  return v.t === Tag.OBJECT && v.v instanceof GBytes ? (v.v as GBytes) : null;
}

const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;

function foldInt32(n: number | bigint): number {
  const m = typeof n === "bigint" ? Number(((n % 4294967296n) + 4294967296n) % 4294967296n) : Math.trunc(n) % 4294967296;
  const unsigned = typeof n === "bigint" ? m : ((m % 4294967296) + 4294967296) % 4294967296;
  return unsigned > INT32_MAX ? unsigned - 4294967296 : unsigned;
}

/**
 * 元素折算。只收实测过的来源：int / float（截断）/ bool / String（走 `to_int` 那一族，实测 `"x"` → 0）。
 * float→int32 的**饱和方向**只量了正的一侧（1e308 → INT32_MIN），负的一侧没量 → 响亮拒。
 */
export function toElem(kind: PackKind, v: Variant): PackElem {
  if (kind === "vector2" || kind === "vector3" || kind === "color") {
    const inner = v.t === Tag.OBJECT ? (v.v as object) : null;
    if (kind === "vector2") {
      if (inner instanceof GVector2) return new GVector2(inner.x, inner.y);
      if (inner instanceof GVector2i) return new GVector2(inner.x, inner.y);
      return defaultElem(kind);
    }
    if (kind === "vector3") {
      if (inner instanceof GVector3) return new GVector3(inner.x, inner.y, inner.z);
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
    throw new UnsupportedError(
      "packed-element-string",
      `往 ${PACK_TYPE_NAME[kind]} 塞 String 只量到 "x" → 0 这一格（其余形状的换算没实测过）`,
    );
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

/** byte 那一支的折算：300 → 44、-1 → 255、下标写 700 → 188（回绕）。 */
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

/** 码点比较（step 19 的量在字符串比较上通用的那条），不是 JS 默认的 UTF-16 码元比较。 */
function cmpStrings(a: string, b: string): number {
  const x = Array.from(a);
  const y = Array.from(b);
  const n = Math.min(x.length, y.length);
  for (let i = 0; i < n; i++) {
    const ca = x[i] as string;
    const cb = y[i] as string;
    if (ca !== cb) return (ca.codePointAt(0) as number) < (cb.codePointAt(0) as number) ? -1 : 1;
  }
  return x.length === y.length ? 0 : x.length < y.length ? -1 : 1;
}

/**
 * 向量 pack 的 sort 比较：实测 `[(3,3), (1,1), (2,2)]` → `[(1,1), (2,2), (3,3)]`，
 * Vector3 同样按 x 再按 y（再按 z）—— 与值类型那条字典序一致（S173）。
 */
function cmpVec(a: GVector2 | GVector3, b: GVector2 | GVector3, keys: readonly string[]): number {
  for (const k of keys) {
    const av = (a as unknown as Record<string, number>)[k] as number;
    const bv = (b as unknown as Record<string, number>)[k] as number;
    if (av !== bv) return av < bv ? -1 : 1;
  }
  return 0;
}

/** 数值的相等（int64 走 bigint，其余 ===）。 */
function scalarSame(a: PackElem, b: PackElem): boolean {
  if (typeof a === "string" || typeof b === "string") return a === b;
  if (typeof a === "bigint" || typeof b === "bigint") return BigInt(a as number | bigint) === BigInt(b as number | bigint);
  return a === b;
}

/** 一格的相等：向量与颜色按**分量内容**比（S173 实测 `a == PackedVector2Array([Vector2(1, 2)])` 真）。 */
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

/** 越界读的文本是实测的；**负下标从尾部数**（读与写都是，d6 / f52）。 */
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
  const out = new GBytes([], kind);
  if (src.t === Tag.ARRAY) {
    for (const item of (src.v as GArray).raw()) out.raw().push(toElem(kind, item));
  } else {
    const sb = asBytes(src);
    if (sb === null) {
      throw new UnsupportedError("packed-ctor", `${PACK_TYPE_NAME[kind]}(${tagName(src.t)}) 这个初值形状没实测过`);
    }
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
  "copy_on_write",
  "join",
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
    case "find": {
      arity(name, args, 1);
      const want = toElem(kind, args[0] as Variant);
      if (kind === "vector2" || kind === "vector3" || kind === "color") {
        throw new UnsupportedError("packed-search", `${PACK_TYPE_NAME[kind]}.${name}() 的元素比较口径没实测过（值类型按引用比会错）`);
      }
      if (name === "has") return V.bool(items.includes(want));
      if (name === "count") return V.int(items.filter((x) => x === want).length);
      return V.int(items.indexOf(want));
    }
    case "sort": {
      if (kind === "color") {
        throw new UnsupportedError("packed-sort-color", "PackedColorArray.sort() 的比较依据没实测过（2 个元素的样本分不出来）");
      }
      if (kind === "vector2") items.sort((x, y) => cmpVec(x as GVector2, y as GVector2, ["x", "y"]));
      else if (kind === "vector3") items.sort((x, y) => cmpVec(x as GVector3, y as GVector3, ["x", "y", "z"]));
      else if (kind === "string") items.sort((x, y) => cmpStrings(x as string, y as string));
      else items.sort(kind === "int64" ? (x, y) => (BigInt(x as number | bigint) < BigInt(y as number | bigint) ? -1 : BigInt(x as number | bigint) > BigInt(y as number | bigint) ? 1 : 0) : (x, y) => (x as number) - (y as number));
      return V.nil();
    }
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
      if (n < 0) {
        throw new UnsupportedError("packed-get-neg", "get() 的负下标没实测过（下标读实测是从尾部数）");
      }
      return n < items.length ? elemVariant(kind, items[n] as PackElem) : elemVariant(kind, defaultElem(kind));
    }
    case "hex_encode":
      return V.str((items as number[]).map((x) => x.toString(16).padStart(2, "0")).join(""));
    case "get_string_from_utf8": {
      return V.str(new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(items as number[])));
    }
    case "get_string_from_ascii": {
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
  if (a.kind !== b.kind) {
    throw new UnsupportedError("packed-concat-kind", `${packTypeName(a.kind)} + ${packTypeName(b.kind)} 没实测过`);
  }
  return V.object(new GBytes([...a.raw(), ...b.raw()], a.kind));
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
