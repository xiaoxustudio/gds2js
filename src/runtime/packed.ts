import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToNum, tagName, type Variant } from "./tags";
import { INT64_MIN, TWO_63, strToInt, strToFloat } from "./numstr";
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
 * 元素折算。实测过的来源：int / float（截断或饱和）/ bool / String（**前导数解析**，与 `to_int()` /
 * `to_float()` 同一条式子）/ 与形状对应的值类型。没量过的组合一律响亮拒，不拿相邻形状的结论凑。
 * float→int32 的**饱和方向**只量了正的一侧（1e30 与 2147483648.0 → INT32_MIN），负的一侧没量 → 响亮拒；
 * float→int64 正的一侧量到了 INT64_MIN（1e30），nan / ±inf 那一格仍响。
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
    // S177 ④：数值 pack 收 String 是**前导数解析**，与 `to_int()` / `to_float()` 同一条式子（f57 / f58 实测：
    // `PackedByteArray(["x"])` → `[0]`、`(["12abc"])` → `[12]`、`PackedInt32Array(["-7xyz"])` → `[-7]`、
    // `PackedFloat64Array(["1.5abc"])` → `[1.5]`、`PackedFloat32Array(["abc"])` → `[0.0]`）。
    // 先按数值解析成 Variant，再走下面那条已经量过的数值折算 —— 所以 `"70000"` 塞 byte 就是 70000 的 byte 回绕。
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
      // 实测 `PackedInt64Array([1e30, 2.7, -2.7])` → `[-9223372036854775808, 2, -2]`：正向溢出饱和到 INT64_MIN，
      // 与 `builtins.ts` 里 `int()` 那条（26 点探针：nan / ±inf / |x| ≥ 2^63 同给 INT64_MIN）同一式子。
      // nan / ±inf 在 pack 这一格没量过 → 继续响。
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

/** 一格的比较：与 `sort` / `bsearch` 共用这一条口径（数值、String 码点、向量与颜色按分量字典序）。 */
function cmpElem(kind: PackKind, a: PackElem, b: PackElem): number {
  if (kind === "color") return cmpVec(a as unknown as GVector2, b as unknown as GVector2, ["r", "g", "b", "a"]);
  if (kind === "vector2") return cmpVec(a as GVector2, b as GVector2, ["x", "y"]);
  if (kind === "vector3") return cmpVec(a as GVector3, b as GVector3, ["x", "y", "z"]);
  if (kind === "string") return cmpStrings(a as string, b as string);
  if (kind === "int64") {
    const x = BigInt(a as number | bigint);
    const y = BigInt(b as number | bigint);
    return x < y ? -1 : x > y ? 1 : 0;
  }
  const x = a as number;
  const y = b as number;
  return x < y ? -1 : x > y ? 1 : 0;
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
  "decode_utf8",
  "decode_ascii",
  "hash",
  "push_back",
  "push_front",
  "copy_on_write",
  "join",
]);
/** 存在但这一轮没做 / 没实测的形状 —— 响亮拒，不拿别的 pack 的结论凑。 */
const NOT_YET = new Set(["to_hex_string", "compress", "decompress", "search_sorted", "remove_at_copy"]);
/**
 * 只在**某一种 pack** 上量到「4.6.3 里根本没有这个方法」（f57 / f61 / f62：`Nonexistent function 'X' in base 'Y'`）。
 * 同名的格子在别的形状上没量过，所以只在量过的那一支给实测文本，其余仍走 NOT_YET / 未实现那条响亮拒。
 */
const MISSING_ON: Partial<Record<PackKind, Set<string>>> = {
  byte: new Set(["to_hex_string", "search_sorted", "to_base64", "decode_string", "to_byte_array", "to_raw_string", "get_bytes"]),
  string: new Set(["index_of"]),
  int32: new Set(["to_float32_array", "to_int32_array"]),
};
/** byte 那一支独有的四个 `to_*_array`（f61 / f62 量到 int32 上至少两个是 Nonexistent，其余形状没量）。 */
const BYTE_ONLY = new Set(["get_string_from_utf8", "get_string_from_ascii", "to_int32_array", "to_int64_array", "to_float32_array", "to_float64_array"]);
const NON_BYTE_MISSING = new Set(["hex_encode"]);

function arity(name: string, args: Variant[], n: number): void {
  if (args.length !== n) throw new GodotRuntimeError("arity", `${name}() 需要 ${n} 个参数（收到 ${args.length} 个）`);
}

/**
 * byte → 别的形状：**小端**逐组读（f61 / f62 量的方向：`[0, 0, 128, 63]` → `[1.0]`、
 * `[205, 204, 204, 61]` → `[0.10000000149012]`、`[0,0,0,0,0,0,0,1]` → `[72057594037927936]`、
 * `[0,0,0,0,0,0,0,128]` → `[-9223372036854775808]`）。长度**不是整数倍时给空 pack**（不是「有几个整组读几个」：
 * f62 t09 的六字节给的是 `[]`），Godot 那句 `size must be a multiple of …` 是引擎 stderr、不进语料。
 */
function bytesToPack(items: PackElem[], kind: PackKind, width: number, read: (dv: DataView, off: number) => PackElem): Variant {
  const buf = new Uint8Array(items.length);
  for (let i = 0; i < items.length; i++) {
    const e = items[i] as number | bigint;
    buf[i] = (typeof e === "bigint" ? Number(e) : e) & 255;
  }
  if (buf.length % width !== 0) return V.object(new GBytes([], kind));
  const dv = new DataView(buf.buffer);
  const out: PackElem[] = [];
  for (let off = 0; off + width <= buf.length; off += width) out.push(read(dv, off));
  return V.object(new GBytes(out, kind));
}

/**
 * 别的形状 → byte：**小端**逐格铺平（f61 八种形状全量过：int32 `[1, -2]` → `[1,0,0,0,254,255,255,255]`、
 * float32 `[1.5, -1.0, 0.1]` → `[0,0,192,63, 0,0,128,191, 205,204,204,61]`、Vector2 八字节、Vector3 十二字节、
 * Color 十六字节 r→g→b→a）。String 那一支是**每个元素一份 UTF-8 再接一个 0**（f61 / f62：`["ab","c"]` →
 * `[97,98,0,99,0]`、`[""]` → `[0]`、`[]` → `[]`、`["éA"]` → `[195,169,65,0]`）。
 */
function packToBytes(kind: PackKind, items: PackElem[]): number[] {
  const out: number[] = [];
  const one = (width: number, fill: (dv: DataView) => void): void => {
    const buf = new ArrayBuffer(width);
    fill(new DataView(buf));
    out.push(...new Uint8Array(buf));
  };
  for (const e of items) {
    if (kind === "string") {
      out.push(...new TextEncoder().encode(e as string), 0);
    } else if (kind === "int32") {
      one(4, (dv) => dv.setInt32(0, e as number, true));
    } else if (kind === "int64") {
      one(8, (dv) => dv.setBigInt64(0, BigInt(e as number | bigint), true));
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
      // S177 ①：值类型 pack 的检索按**分量内容**比（实测 `PackedVector2Array([(1,2),(3,4)]).has((1,2))` 真，
      // 而两格 `(1.0000001, 2)` 与 `(1, 2)` 在 float32 储存下**仍不是**同一格（`count` 给 1）；
      // Color 的 0.1 与 0.10000001 同理不是同一格）。JS 的 includes / indexOf 对这些载荷是引用等，所以三种形状都走 elemSame。
      const same = (x: PackElem): boolean => elemSame(kind, x, want);
      if (name === "has") return V.bool(items.some(same));
      if (name === "count") return V.int(items.filter(same).length);
      return V.int(items.findIndex(same));
    }
    case "sort":
      items.sort((x, y) => cmpElem(kind, x, y));
      return V.nil();
    case "bsearch": {
      if (args.length < 1 || args.length > 2) {
        throw new GodotRuntimeError("arity", `bsearch() 最多 2 个参数（收到 ${args.length} 个）`);
      }
      // S178 ①：九种形状都有 `bsearch`，返回的**永远是下标**（找不到不给 -1，与旧文档那句相反）：
      // `before` 默认真 = lower_bound（第一格 `>=` 目标），假 = upper_bound（第一格 `>` 目标）。
      // 走的是「折半 + `len -= half + 1`」那套二进制查找，所以在**未排序**的 pack 上也是确定结果 ——
      // f60 的 12 个数组 × 17 个目标、f61 / f62 的补格全部按这条对上，照抄而不是「JS 手写个二分」。
      const flag = args[1] as Variant;
      if (args.length === 2 && flag.t !== Tag.BOOL) {
        throw new UnsupportedError("bsearch-before", `bsearch() 的第二个参数只实测过 bool（收到 ${tagName(flag.t)}）`);
      }
      const before = args.length === 2 ? (flag.v as boolean) : true;
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
      // S177 ③：`get()` 的负下标**不从尾部数**（与 `p[-1]` 相反，那个实测从尾部数）——
      // 它算越界，给默认元素值。Godot 同时往 stderr 打一条引擎 ERROR（`Index p_index = -1 is out of bounds`），
      // 那是 stderr 的形状、不进语料，所以这里只把 stdout 那半对齐。
      return n >= 0 && n < items.length ? elemVariant(kind, items[n] as PackElem) : elemVariant(kind, defaultElem(kind));
    }
    case "set": {
      arity("set", args, 2);
      const sv = intToNum((args[0] as Variant).v as number | bigint);
      const at = typeof sv === "bigint" ? Number(sv) : Math.trunc(sv);
      // S177 ⑤：`set()` 九边同形（byte / int32 / int64 / float32 / float64 / String / Vector2 / Vector3 / Color
      // 都量了，f58 + f59）：元素走与字面量同一套折算（`set(0, 300)` → `[44, 2, 3]`、f32 的 `set(1, 0.1)` →
      // `0.10000000149012`），**负下标与越界一律静默不动**（`set(-1, 9)`、`set(5, 9)` 都不改内容也不改长度，
      // 只多一句引擎 stderr，那条形状不进语料）—— 与 `p[i] = v` 的下标写相反，那句是 `Invalid assignment …`。
      // 返回值是 void，取它的值在解析期就拒（analyze 的 VOID_BYTES_METHODS）。
      if (at >= 0 && at < items.length) items[at] = toElem(kind, args[1] as Variant);
      return V.nil();
    }
    case "hex_encode":
      return V.str((items as number[]).map((x) => x.toString(16).padStart(2, "0")).join(""));
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
