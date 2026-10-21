import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToBig, intToNum, wrap64, tagName, type IntPayload, type Variant } from "./tags";
import { INT64_MAX, INT64_MIN, TWO_63, strToInt, strToFloat } from "./numstr";
import { GArray, GDict, intArgBig, registerVarToStrValueHook, show, strLength, truthyOf, valueEq, valueTypeName } from "./values";
import { GBytes, isBytes, packBytes, packCtor, packTypeName } from "./packed";
import { CallableBox, callableEq, isCallableBox, isNullCallable } from "./callable";
import { Signal } from "./signal";
import { ClassDesc, GdScriptObject, dictShapeOf, dictWrittenOf } from "./object";
import { GdNativeClass } from "./native-class";
import { NULL_OBJECT, isNullRefValue, isWeakRefBox, liveObjectOf, weakRefBox } from "./identity";
import { GdRid, allocateRid, rid } from "./rid";
import { GdNodePath, emptyNodePath, nodePathValue, registerNodePathHashHook } from "./node-path";
import { GVector2, vector2, vector2Method } from "./vector2";
import { GVector2i, vector2i, vector2iMethod } from "./vector2i";
import { GVector3, vector3, vector3Method } from "./vector3";
import { GVector3i, vector3i, vector3iMethod } from "./vector3i";
import { GColor, colorMethod } from "./color";
import { typeOf } from "./patterns";
import { rtosFix } from "./grisu2";
import { ENGINE_CLASS_NAMES } from "./engine-classes";

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

/** 把 Variant 取成裸 number（内置函数收数值参数时用）。bool 也折：S362 逐位扫过 64 个函数的 101 个数值位，
 *  其中 97 格引擎照收 bool 并按 false=0 / true=1 参与运算（`absf(false)` 给 0.0、`lerp(1, 2, false)` 给 1.0、
 *  `posmod(5, false)` 给 0），拒 bool 的位全部在解析期就被 `analyze` 那几张表拦下，走不到这里。 */
export function num(v: Variant): number {
  if (v.t === Tag.BOOL) return (v.v as boolean) ? 1 : 0;
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
    throw new UnsupportedError("not-number", `需要数值，收到类型 ${v.t}`);
  }
  return v.t === Tag.INT ? intToNum(v.v as IntPayload) : (v.v as number);
}

/** `abs` / `sign` / `floor` / `ceil` / `round` 的坏型实参（向量分支已让开时）：引擎走运行期
 *  `Error calling utility function "<fn>()": Argument "x" must be "int", "float", …, or "Vector4i".`
 *  （S524，`tmp/d6/s520.py` 五支逐字同句；bool 照收、折 0/1，与 S362 一致）。 */
export function numOrVectorArg(v: Variant, fn: string): number {
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT && v.t !== Tag.BOOL) {
    throw new GodotRuntimeError("utility-arg", `Error calling utility function "${fn}()": Argument "x" must be "int", "float", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", or "Vector4i".`);
  }
  return num(v);
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

/** Godot 的 `Variant.Type` 编号 —— 容器哈希起手混的是引擎那侧的类型标签，不是我们内部的 Tag。 */
const GD_TYPE = { DICTIONARY: 27, ARRAY: 28 } as const;
const MURMUR_SEED = 0x7f07c65;
const MASK64 = (1n << 64n) - 1n;
// 双精度的两个 32 位字：bigint 的 BigUint64Array 在 scriptc 没有 lowering，DataView 有（与 ops.ts 同一套路）。
const F64_VIEW = new DataView(new ArrayBuffer(8));
const F32_VIEW = new DataView(new ArrayBuffer(4));
const I64_VIEW = new DataView(new ArrayBuffer(8));

/** 引擎 `hash_murmur3_one_float`：float32 位型入 murmur，−0 归一成 +0、NaN 换成规范静默 NaN 位型（S542）。纯函数。 */
function hashFloat32(x: number, seed: number): number {
  if (Number.isNaN(x)) return murmurOne32(0x7fc00000, seed);
  F32_VIEW.setFloat32(0, x, true);
  let bits = F32_VIEW.getUint32(0, true);
  if (bits === 0x80000000) bits = 0;
  return murmurOne32(bits, seed);
}

/** 值类型的 `var_to_str()` 构造式：浮点分量走 `rtos_fix`（整数不带 `.0`），整型分量原样。 */
registerVarToStrValueHook((o) => {
  if (o instanceof GVector2) return `Vector2(${rtosFix(o.x, true)}, ${rtosFix(o.y, true)})`;
  if (o instanceof GVector2i) return `Vector2i(${o.x}, ${o.y})`;
  if (o instanceof GVector3) return `Vector3(${rtosFix(o.x, true)}, ${rtosFix(o.y, true)}, ${rtosFix(o.z, true)})`;
  if (o instanceof GVector3i) return `Vector3i(${o.x}, ${o.y}, ${o.z})`;
  if (o instanceof GColor) return `Color(${rtosFix(o.r, true)}, ${rtosFix(o.g, true)}, ${rtosFix(o.b, true)}, ${rtosFix(o.a, true)})`;
  if (o instanceof Signal) return "Signal()";
  return null;
});

/** murmur3 x86_32 的一轮（引擎 `hash_murmur3_one_32`，默认种子 0x7f07c65）。纯函数。 */
function murmurOne32(pIn: number, pSeed: number): number {
  let k = Math.imul(pIn >>> 0, 0xcc9e2d51) >>> 0;
  k = ((k << 15) | (k >>> 17)) >>> 0;
  k = Math.imul(k, 0x1b873593) >>> 0;
  let s = (pSeed ^ k) >>> 0;
  s = ((s << 13) | (s >>> 19)) >>> 0;
  return (Math.imul(s, 5) + 0xe6546b64) >>> 0;
}

/** murmur3 的收尾混合（引擎 `hash_fmix32`）。纯函数。 */
function fmix32(h: number): number {
  let x = (h ^ (h >>> 16)) >>> 0;
  x = Math.imul(x, 0x85ebca6b) >>> 0;
  x = (x ^ (x >>> 13)) >>> 0;
  x = Math.imul(x, 0xc2b2ae35) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}

/** 引擎的 `hash_one_uint64`：SuperFastHash 那段 patter，按 64 位回绕。纯函数。 */
function hashOneUint64(key: bigint): number {
  let v = key & MASK64;
  v = (((~v) & MASK64) + ((v << 18n) & MASK64)) & MASK64;
  v = (v ^ (v >> 31n)) & MASK64;
  v = (v * 21n) & MASK64;
  v = (v ^ (v >> 11n)) & MASK64;
  v = (v + ((v << 6n) & MASK64)) & MASK64;
  v = (v ^ (v >> 22n)) & MASK64;
  return Number(v & 0xffffffffn);
}

/** `hash_murmur3_one_64`：低字先、高字后。纯函数。 */
function murmurOne64Words(lo: number, hi: number, seed: number): number {
  return murmurOne32(hi >>> 0, murmurOne32(lo >>> 0, seed));
}

/** `hash_murmur3_one_double`。纯函数。 */
function hashDoubleInto(d: number, seed: number): number {
  if (Number.isNaN(d)) return murmurOne64Words(0, 0x7ff80000, seed);
  F64_VIEW.setFloat64(0, d === 0 ? 0 : d, true);
  return murmurOne64Words(F64_VIEW.getUint32(0, true), F64_VIEW.getUint32(4, true), seed);
}

/** `hash_murmur3_one_double`：先把 ±0 归一，再按 IEEE754 的两个字折叠。 */
function hashDouble(d: number): number {
  return hashDoubleInto(d, MURMUR_SEED);
}

/** 引擎 `hash_murmur3_buffer`：小端 4 字节块逐轮、尾巴不足一块按字节补进 k1、长度混进收尾。纯函数。 */
function hashBuffer(bytes: readonly number[]): number {
  const len = bytes.length;
  const nblocks = len >> 2;
  let h = MURMUR_SEED;
  const round = (k1: number): void => {
    let k = Math.imul(k1 >>> 0, 0xcc9e2d51) >>> 0;
    k = ((k << 15) | (k >>> 17)) >>> 0;
    k = Math.imul(k, 0x1b873593) >>> 0;
    h = (h ^ k) >>> 0;
    h = ((h << 13) | (h >>> 19)) >>> 0;
    h = (Math.imul(h, 5) + 0xe6546b64) >>> 0;
  };
  for (let i = 0; i < nblocks; i++) {
    const o = i * 4;
    round((bytes[o] as number) | ((bytes[o + 1] as number) << 8) | ((bytes[o + 2] as number) << 16) | ((bytes[o + 3] as number) << 24));
  }
  const tail = nblocks * 4;
  const rem = len & 3;
  if (rem !== 0) {
    let k1 = 0;
    if (rem >= 3) k1 ^= (bytes[tail + 2] as number) << 16;
    if (rem >= 2) k1 ^= (bytes[tail + 1] as number) << 8;
    k1 ^= bytes[tail] as number;
    let k = Math.imul(k1 >>> 0, 0xcc9e2d51) >>> 0;
    k = ((k << 15) | (k >>> 17)) >>> 0;
    k = Math.imul(k, 0x1b873593) >>> 0;
    h = (h ^ k) >>> 0;
  }
  return fmix32((h ^ len) >>> 0);
}

/** NodePath 的哈希（S541）：路径与子路径各折 StringName 哈希，拼成 64 位再过 `hash_one_uint64`；相对路径取反。 */
function nodePathHash(p: GdNodePath): number {
  if (p.empty) return 0;
  const h1 = hashDjb2(p.names.join("/"));
  const h2 = hashDjb2(p.subnames.join(":"));
  const h = hashOneUint64((BigInt(h1) << 32n) | BigInt(h2));
  return p.absolute ? h : ~h >>> 0;
}
registerNodePathHashHook(nodePathHash);

/** pack 九支的哈希（S540）：byte/int32/int64 折小端字节缓冲；float/string/值类型 pack 折元素，收尾与空 pack 各按引擎那一支。 */
function packHash(p: GBytes): number {
  const raw = p.raw();
  const n = raw.length;
  const kind = p.kind;
  if (kind === "byte" || kind === "int32" || kind === "int64") {
    if (n === 0) return murmurOne64Words(0, 0, MURMUR_SEED);
    const bytes: number[] = [];
    if (kind === "byte") {
      for (const e of raw) bytes.push((e as number) & 0xff);
    } else if (kind === "int32") {
      for (const e of raw) {
        const v = e as number;
        bytes.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
      }
    } else {
      for (const e of raw) {
        I64_VIEW.setBigInt64(0, e as bigint, true);
        for (let i = 0; i < 8; i++) bytes.push(I64_VIEW.getUint8(i));
      }
    }
    return hashBuffer(bytes);
  }
  if (kind === "float32") {
    if (n === 0) return hashFloat32(0, MURMUR_SEED);
    let h = MURMUR_SEED;
    for (const e of raw) h = hashFloat32(e as number, h);
    return fmix32(h);
  }
  if (kind === "float64") {
    if (n === 0) return hashDoubleInto(0, MURMUR_SEED);
    let h = MURMUR_SEED;
    for (const e of raw) h = hashDoubleInto(e as number, h);
    return fmix32(h);
  }
  if (n === 0) return MURMUR_SEED;
  let h = MURMUR_SEED;
  if (kind === "string") {
    for (const e of raw) h = murmurOne32(hashDjb2(e as string), h);
  } else if (kind === "vector2") {
    for (const e of raw) {
      const v = e as GVector2;
      h = hashFloat32(v.x, h);
      h = hashFloat32(v.y, h);
    }
  } else if (kind === "vector3") {
    for (const e of raw) {
      const v = e as GVector3;
      h = hashFloat32(v.x, h);
      h = hashFloat32(v.y, h);
      h = hashFloat32(v.z, h);
    }
  } else {
    for (const e of raw) {
      const c = e as GColor;
      h = hashFloat32(c.r, h);
      h = hashFloat32(c.g, h);
      h = hashFloat32(c.b, h);
      h = hashFloat32(c.a, h);
    }
  }
  return fmix32(h);
}

/** 引擎的 `MAX_RECURSION`（100）截住容器哈希：实测数到第 102 层那一支给 0，`ERR_PRINT` 只进 stderr、不进 stdout。 */
const HASH_MAX_RECURSION = 100;

/** 一个 Variant 的 Godot 哈希数：全局 `hash()` 与 `Array.hash()` / `Dictionary.hash()` 共用；容器那一支照引擎的 `recursive_hash`。 */
export function variantHashNumber(v: Variant, depth = 0): number {
  switch (v.t) {
    case Tag.NIL:
      return 0;
    case Tag.BOOL:
      return v.v ? 1 : 0;
    case Tag.INT:
      return hashOneUint64(intToBig(v.v as IntPayload));
    case Tag.FLOAT:
      return hashDouble(v.v as number);
    case Tag.STRING:
    case Tag.STRING_NAME:
      return hashDjb2(v.v as string);
    case Tag.ARRAY: {
      if (depth > HASH_MAX_RECURSION) return 0;
      let h = murmurOne32(GD_TYPE.ARRAY, MURMUR_SEED);
      for (const e of (v.v as GArray).raw()) h = murmurOne32(variantHashNumber(e, depth + 1), h);
      return fmix32(h);
    }
    case Tag.DICT: {
      if (depth > HASH_MAX_RECURSION) return 0;
      const d = v.v as GDict;
      const ks = d.keys();
      const vs = d.values();
      let h = murmurOne32(GD_TYPE.DICTIONARY, MURMUR_SEED);
      for (let i = 0; i < ks.length; i++) {
        h = murmurOne32(variantHashNumber(ks[i] as Variant, depth + 1), h);
        h = murmurOne32(variantHashNumber(vs[i] as Variant, depth + 1), h);
      }
      return fmix32(h);
    }
    case Tag.OBJECT: {
      // 引擎那支是 hash_one_uint64(RID::get_id())（core/variant/variant.cpp 的 RID 分支）；实测 0 / 1 / 5 / -1 / 13241 五格全中
      if (v.v instanceof GdRid) return hashOneUint64(intToBig((v.v as GdRid).id));
      // NodePath 的式子 S541 解出：path / subpath 各折 StringName 哈希 → 64 位 → hash_one_uint64，相对路径取反；空路径给 0
      if (v.v instanceof GdNodePath) return nodePathHash(v.v as GdNodePath);
      // 值类型：引擎按分量逐个折 murmur3 再 fmix32 —— 浮点分量折 float32 位型（−0 归一），整型分量折 int32 位型（S539）
      if (v.v instanceof GVector2) return fmix32(hashFloat32(v.v.y, hashFloat32(v.v.x, MURMUR_SEED)));
      if (v.v instanceof GVector2i) return fmix32(murmurOne32(v.v.y >>> 0, murmurOne32(v.v.x >>> 0, MURMUR_SEED)));
      if (v.v instanceof GVector3) return fmix32(hashFloat32(v.v.z, hashFloat32(v.v.y, hashFloat32(v.v.x, MURMUR_SEED))));
      if (v.v instanceof GVector3i) return fmix32(murmurOne32(v.v.z >>> 0, murmurOne32(v.v.y >>> 0, murmurOne32(v.v.x >>> 0, MURMUR_SEED))));
      if (v.v instanceof GColor) return fmix32(hashFloat32(v.v.a, hashFloat32(v.v.b, hashFloat32(v.v.g, hashFloat32(v.v.r, MURMUR_SEED)))));
      if (v.v instanceof GBytes) return packHash(v.v as GBytes);
      // 空 Signal 的对象号是 0，名字空串 → one_64(0, seed=hash(""))（S547）；带名 Signal 折的是宿主实例号，合成号对不上
      if (v.v instanceof Signal) {
        if ((v.v as Signal).sigName !== "") {
          throw new UnsupportedError("hash-signal", "带对象的 Signal 哈希折的是宿主实例号，那一路复现不了（S547）");
        }
        return murmurOne64Words(0, 0, hashDjb2(""));
      }
      if (!isCallableBox(v.v)) {
        throw new UnsupportedError("hash-type", `hash() 收到 ${tagName(v.t)}：这类值的哈希还没和引擎对上（对象在引擎里是指针号，天生不可复现）`);
      }
      const box = v.v as CallableBox;
      // 实测两条：全局内置那一族折出来就是名字那支 String 哈希（十六支一名一名对上，`tmp/probe-hash-callable/`）；
      // 空 Callable 走引擎非 custom 那条 —— 名字空串 + 对象 0，再 fmix32。
      if (isNullCallable(box)) return fmix32(murmurOne64Words(0, 0, hashDjb2("")));
      if (box.object === null && box.name !== null) return hashDjb2(box.name);
      throw new UnsupportedError(
        "hash-callable",
        "方法 / 静态 / lambda 的 Callable 哈希折的是引擎那侧的函数标识：lambda 两次跑就换数，方法与静态这两轮同值但名字、对象号五支候选式子都对不上（fit.mjs），不猜",
      );
    }
    default:
      throw new UnsupportedError(
        "hash-type",
        `hash() 收到 ${tagName(v.t)}：这类值的哈希还没和引擎对上（对象在引擎里是指针号，天生不可复现）`,
      );
  }
}

/** 全局 `hash()`：Godot 给的是无符号 32 位，宽成 int 印出来。 */
export function variantHash(args: Variant[]): Variant {
  if (args.length !== 1) {
    throw new GodotRuntimeError("arity", `hash() 只接受 1 个参数（收到 ${args.length} 个）`);
  }
  return V.int(variantHashNumber(args[0] as Variant));
}

export function sqrt(v: Variant): Variant {
  return V.float(Math.sqrt(num(v)));
}

export function abs(v: Variant): Variant {
  if (v.t === Tag.INT) {
    const x = intToBig(v.v as IntPayload);
    // `abs(INT64_MIN)` 回绕回 INT64_MIN（实测 e13），不是 +2^63。
    return V.int(x < 0n ? wrap64(-x) : x);
  }
  const vec = vectorMath(v, "abs");
  if (vec !== null) return vec;
  return V.float(Math.abs(numOrVectorArg(v, "abs")) + 0);
}

/** 全局数学函数一族：每一条都由 4.6.3 实测边界定住（式子与类型规则见 SEMANTICS）。 */

const INT_MIN_F = -9223372036854775808;

/** int 载荷：2^53 内用 number，越界用 bigint（与装箱轨同一口径）。int 那一侧没有负号零 —— `floori(-0.0)` 实测给的是 `0`（`1.0 / (floori(-0.0) * 1.0)` 给 `inf`），而 JS 的 `Math.floor(-0)` 是 `-0`，进槽之前折掉。 */
function vi(n: number): Variant {
  const v = Object.is(n, -0) ? 0 : n;
  return Number.isSafeInteger(v) ? V.int(v) : V.int(BigInt(Math.trunc(v)));
}

function isInt(v: Variant): boolean {
  return v.t === Tag.INT;
}

/** 数值一族只吃 int / float / bool（bool 折成 1 / 0 是实测 a05 / k01 那一形）：其余形引擎在调用边界上就拒（S339 ⑤ 同一口径），
 *  而先前 `v.v as number` 那一步会拿对象或串算出 NaN —— 那是静默错值，不是拒。 */
function mathNum(v: Variant): number {
  if (v.t === Tag.FLOAT) return v.v as number;
  if (v.t === Tag.INT) return intToNum(v.v as IntPayload);
  if (v.t === Tag.BOOL) return v.v ? 1 : 0;
  throw new UnsupportedError("not-number", `需要 int / float / bool，收到类型 ${v.t}`);
}

function fl(v: Variant): number {
  return mathNum(v);
}

/** 实测 `round` 是**远离零**（`round(2.5)`=3、`round(-2.5)`=-3、`round(-3.5)`=-4），JS 原生对负半数会差一格。 */
function gdRound(x: number): number {
  return x >= 0 ? Math.floor(x + 0.5) : Math.ceil(x - 0.5);
}

function intOf(v: Variant): number {
  return Math.trunc(mathNum(v));
}

function one(x: number): number {
  return Number.isNaN(x) ? 0 : x > 0 ? 1 : x < 0 ? -1 : 0;
}

/** 这一族引擎的形参是 Variant + 向量允许集（`tmp/probe-argtype/matrix.txt` 的名单、`vals.txt` 的结果）：
 *  向量实参逐分量走值类型那一族的同一条式子，int 向量的 floor / ceil / round 原样给回
 *  （实测 `floor(Vector2i(-1, 2))` 给 `(-1, 2)`、`ceil(Vector3i(-1, 2, -3))` 给 `(-1, 2, -3)`）。 */
function vectorMath(v: Variant, name: "abs" | "floor" | "ceil" | "round" | "sign"): Variant | null {
  if (v.t !== Tag.OBJECT) return null;
  const o = v.v;
  if (o instanceof GVector2) return vector2Method(o, name, []);
  if (o instanceof GVector3) return vector3Method(o, name, []);
  if (o instanceof GVector2i) return name === "abs" || name === "sign" ? vector2iMethod(o, name, []) : vector2i(o.x, o.y);
  if (o instanceof GVector3i) return name === "abs" || name === "sign" ? vector3iMethod(o, name, []) : vector3i(o.x, o.y, o.z);
  return null;
}

export function gSign(v: Variant): Variant {
  const vec = vectorMath(v, "sign");
  if (vec !== null) return vec;
  if (isInt(v)) return vi(one(intToNum(v.v as IntPayload)));
  return V.float(one(numOrVectorArg(v, "sign")) + 0);
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
  // 实测 `floor(-0.0)` / `ceil(-0.0)` / `round(-0.0)` 三支都留号（`1.0 / (floor(-0.0) * 1.0)` 给 `-inf`），所以这里不能 `+ 0`
  if (mode === "float") return V.float(fn(x));
  return V.float(fn(x));
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
  if (mode === "auto") {
    const vec = vectorMath(v, "floor");
    if (vec !== null) return vec;
  }
  return roundThree(mode === "auto" ? numOrVectorArg(v, "floor") : num(v), Math.floor, mode);
}

export function gCeil(v: Variant, mode: RoundMode = "auto"): Variant {
  const pas = intPassthrough(v, mode);
  if (pas !== null) return pas;
  if (mode === "auto") {
    const vec = vectorMath(v, "ceil");
    if (vec !== null) return vec;
  }
  return roundThree(mode === "auto" ? numOrVectorArg(v, "ceil") : num(v), Math.ceil, mode);
}

export function gRound(v: Variant, mode: RoundMode = "auto"): Variant {
  const pas = intPassthrough(v, mode);
  if (pas !== null) return pas;
  if (mode === "auto") {
    const vec = vectorMath(v, "round");
    if (vec !== null) return vec;
  }
  // 实测 `round(-0.0)` 留号：`-0 >= 0` 是真的，`gdRound` 那支会绕进 `floor(-0 + 0.5)` 把号折成正零，所以零原样给回。
  // 这条只在 `round` 一支生效 —— `snapped` 实测要的是 `+0.0`（`snapped(-0.0, 1.0)` 那格两侧都是正零），不把保号塞进共用的 `gdRound`。
  return roundThree(mode === "auto" ? numOrVectorArg(v, "round") : num(v), (x: number): number => (x === 0 ? x : gdRound(x)), mode);
}

function floorDiv(a: number, b: number): number {
  return Math.floor(a / b);
}

export function gPosmod(x: Variant, y: Variant): Variant {
  const a = intOf(x);
  const b = intOf(y);
  // 模数为 0 那一支引擎不报错也不夹：推一条 `Division by zero in posmod is undefined. Returning 0 as fallback.`
  // 之后**给 0**（实测 5 / -5 / 0 / 2^31 四形都是 0；那条 ERROR 的 frame 在 `./core/math/`，语料的 normalize 整块滤掉，所以出货只需要发那个值）。
  if (b === 0) return vi(0);
  return vi(a - b * floorDiv(a, b));
}

export function gFposmod(x: Variant, y: Variant): Variant {
  const a = fl(x);
  const b = fl(y);
  // 源是 `fmod` 再把结果按号折回，不是 `a - b*floor(a/b)`：两者的最后一两位 double 会分岔（普查 8/30）。
  let v = a % b;
  if ((v < 0 && b > 0) || (v > 0 && b < 0)) v += b;
  return V.float(v + 0);
}

/** `fmod(-0.0, 1.0)` 实测留号（C 的 `fmod` 就是把被除数的号带下来），所以不 `+ 0`。 */
export function gFmod(x: Variant, y: Variant): Variant {
  return V.float(fl(x) % fl(y));
}

export function gWrap(v: Variant, lo: Variant, hi: Variant, asInt: boolean): Variant {
  if (!asInt) {
    // 引擎的 wrapf **不排序两端**：`range = max - min`，`is_zero_approx(range)` 就回 min；
    // `result = value - range * floor((value - min) / range)`，最后 `is_equal_approx(result, max)` 再回 min。
    const mn = fl(lo);
    const mx = fl(hi);
    const x = fl(v);
    const range = mx - mn;
    if (Math.abs(range) < CMP_EPSILON) return V.float(mn + 0);
    const result = x - range * Math.floor((x - mn) / range);
    return V.float((approxEq(result, mx) ? mn : result) + 0);
  }
  const mn0 = intOf(lo);
  const mx0 = intOf(hi);
  const a = intOf(v);
  const [mn, mx] = mn0 > mx0 ? [mx0, mn0] : [mn0, mx0];
  const range = mx - mn;
  if (range === 0) return vi(mn);
  const inside = a - mn;
  const r = inside - range * floorDiv(inside, range);
  return vi(mn + r);
}

export function gLerp(a: Variant, b: Variant, w: Variant): Variant {
  const weight = floatWeight(w);
  if (weight !== null && sameShape(a, b)) {
    const vec = sameTypeVectorMath("lerp", a, [b, weight]);
    if (vec !== null) return vec;
  }
  const x = num(a);
  return V.float(x + (num(b) - x) * num(w) + 0);
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
  // 引擎那句是 `abs(to - from) <= delta ? to : from + SIGN(to - from) * delta`：上界比的是**带号的 delta**，
  // 所以 delta 为负时永远走后半支，也就是往 `to` 的反方向走（30 格普查里 22 格的分岔全在这条上）。
  if (Math.abs(b - a) <= d) return V.float(b + 0);
  return V.float(a + (b - a > 0 ? 1 : b - a < 0 ? -1 : 0) * d + 0);
}

/** `snapped` 的结果类型跟步长那一侧，但**商按 float 算**：`snapped(7.5, 3)` = 9、`snappedi(7, 3)` = 6。折半的方向是 `floor(v / step + 0.5)`（往 +∞），不是 `round()` 的远离零 —— 实测 `snapped(-0.5, 1.0)` 给 `0.0`、`snapped(-7.5, 3.0)` 给 `-6.0`。 */
/** `snapped` 与 `lerp` 的向量那一支：两支都只量过**两端同型**那一形（`vals.txt`：
 *  `snapped(Vector2(-1.5, 2), Vector2(1, 1))` 给 `(-1.0, 2.0)`、`snapped(Vector3(-1.5, 2, -3), Vector3(1, 1, 1))` 给 `(-1.0, 2.0, -3.0)`、
 *  `lerp(Vector2(-1, 0), Vector2(3, 8), 0.25)` 给 `(0.0, 2.0)`、`lerp(Color(0, 0, 0, 1), Color(1, 0.5, 0.25, 0.5), 0.5)` 给 `(0.5, 0.25, 0.125, 0.75)`）。
 *  异型那一侧引擎是解析期「跟第一参走」那一句（§6 第 51 条①），运行期这一族没量全，所以不在此列的一律往下走、由数值那一支响亮拒。 */
/** 同型向量的分量数组（`clamp` 的字典序比较用）：V2 / V2i 取 2 个、V3 / V3i 取 3 个，其余给 null。 */
function vecComponents3(o: object): number[] | null {
  if (o instanceof GVector2) return [o.x, o.y];
  if (o instanceof GVector3) return [o.x, o.y, o.z];
  if (o instanceof GVector2i) return [o.x, o.y];
  if (o instanceof GVector3i) return [o.x, o.y, o.z];
  return null;
}

function sameTypeVectorMath(name: "snapped" | "lerp", a: Variant, args: Variant[]): Variant | null {
  if (a.t !== Tag.OBJECT) return null;
  const o = a.v;
  if (o instanceof GVector2) return vector2Method(o, name, args);
  if (o instanceof GVector3) return vector3Method(o, name, args);
  // S536：`snapped` 的 x 还收 `Vector2i` / `Vector3i`（引擎 x 列表里有）；`lerp` 不收（解析期那句的 from 列表没有它们）。
  if (name === "snapped" && o instanceof GVector2i) return vector2iMethod(o, "snapped", args);
  if (name === "snapped" && o instanceof GVector3i) return vector3iMethod(o, "snapped", args);
  if (o instanceof GColor) return colorMethod(o, name, args);
  return null;
}

function floatWeight(w: Variant): Variant | null {
  return w.t === Tag.FLOAT || w.t === Tag.INT ? w : null;
}

function sameShape(a: Variant, b: Variant): boolean {
  if (a.t !== Tag.OBJECT || b.t !== Tag.OBJECT) return false;
  const x = a.v;
  const y = b.v;
  return (
    (x instanceof GVector2 && y instanceof GVector2) ||
    (x instanceof GVector3 && y instanceof GVector3) ||
    (x instanceof GColor && y instanceof GColor)
  );
}

export function gSnapped(x: Variant, step: Variant): Variant {
  const vec = sameTypeVectorMath("snapped", x, [step]);
  if (vec !== null) return vec;
  const s = num(step);
  const a = num(x);
  if (isInt(step)) {
    if (s === 0) return vi(intOf(x));
    return vi(Math.trunc(Math.floor(a / s + 0.5) * s));
  }
  if (s === 0) return V.float(a + 0);
  return V.float(Math.floor(a / s + 0.5) * s + 0);
}

export function gSnappedF(x: Variant, step: Variant): Variant {
  const a = fl(x);
  const s = fl(step);
  if (s === 0) return V.float(a + 0);
  return V.float(Math.floor(a / s + 0.5) * s + 0);
}

/** `snappedi` 只在**结果**上取 int，实参不先截断（实测 `snappedi(7.5, 3.0)` 给 9 而不是 6；`snappedi(7, 0)` = 7）。 */
export function gSnappedI(x: Variant, step: Variant): Variant {
  const a = fl(x);
  const s = fl(step);
  if (s === 0) return vi(Math.trunc(a));
  return vi(Math.trunc(Math.floor(a / s + 0.5) * s));
}

const PI_D = 3.14159265358979323846;
const TAU_D = 2 * PI_D;

/** `deg_to_rad(-0.0)` 与 `rad_to_deg(-0.0)` 实测都留号（乘法在 IEEE 里就把号带过去），所以不 `+ 0`。 */
export function gDegToRad(v: Variant): Variant {
  return V.float(fl(v) * (PI_D / 180));
}

export function gRadToDeg(v: Variant): Variant {
  return V.float(fl(v) * (180 / PI_D));
}

/** 式子是「取差 → 对 TAU 取余 → 折进 [-π, π]」：`angle_difference(6.0, 0.1)` = +0.38318530717959，反过来给负数。 */
export function gAngleDifference(from: Variant, to: Variant): Variant {
  return V.float(angleDiff(fl(from), fl(to)));
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

/** `min`/`max` 返回的是**赢的那个实参**（类型跟着它走），且比较式子对 NaN 是「留第一个」：`max(NAN, 1)` 给 nan。
 *  三元以上是**左折**：`max(1, NAN, 2)` 给 2、`max(1.0, 2, 3)` 给 int 3、`max(1, 2, NAN)` 给 2（读数 `tmp/maxmin/{maxmin,maxmin2}.txt`，尺 `fold46.mts` / `fold47.mts`）。
 *  实参按**左到右逐位**转 float，只认 int 与 float：其余形（装箱的 bool / null / String / StringName / NodePath /
 *  Array / Dictionary / pack / Callable / Color / Vector2 十四形各测两支）都在运行期打断脚本，
 *  句里点名的是**第一个转不动的位**（`tmp/probe-maxrt/compare53.txt`，S393）。 */
function maxMinFloat(xs: Variant[], i: number, who: string): number {
  const v = xs[i] as Variant;
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
    throw new GodotRuntimeError(
      `${who}-arg`,
      `Invalid type in utility function "${who}()". Cannot convert argument ${String(i + 1)} from ${utilityArgLabel(v)} to float.`,
    );
  }
  return fl(v);
}

export function gMin(...xs: Variant[]): Variant {
  let best = xs[0] as Variant;
  let bestN = maxMinFloat(xs, 0, "min");
  for (let i = 1; i < xs.length; i++) {
    const x = maxMinFloat(xs, i, "min");
    if (bestN > x) {
      best = xs[i] as Variant;
      bestN = x;
    }
  }
  return best;
}

export function gMax(...xs: Variant[]): Variant {
  let best = xs[0] as Variant;
  let bestN = maxMinFloat(xs, 0, "max");
  for (let i = 1; i < xs.length; i++) {
    const x = maxMinFloat(xs, i, "max");
    if (bestN < x) {
      best = xs[i] as Variant;
      bestN = x;
    }
  }
  return best;
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
  // 三支都是 bool 时不走数值那一序：六格真值表只合「先并下界、再截上界」（S362，读数 `tmp/probe-argtype/bool-slot.txt` 与 `fold39.mts`）——
  // `clamp(false, true, false)` 给 false，而数值那一序（先比上界）会落到下界 true
  if (mode === "auto" && v.t === Tag.BOOL && lo.t === Tag.BOOL && hi.t === Tag.BOOL) {
    return V.bool(((v.v as boolean) || (lo.v as boolean)) && (hi.v as boolean));
  }
  // S537：向量 clamp 走引擎的**字典序**比较（先 x、再 y、再 z），整支返回 v / lo / hi（`CLAMP` 用 Variant `<`/`>`，
  // Vector 的这两个运算符是字典序）——实测 `clamp(Vector2(1,-5),(0,0),(2,2))` 给 `(1.0,-5.0)` 原样、
  // `(0,-5)` 给 min、`(2,5)` 给 max；Vector3 / Vector2i / Vector3i 同一条（18 格读数）。
  if (mode === "auto" && v.t === Tag.OBJECT && lo.t === Tag.OBJECT && hi.t === Tag.OBJECT) {
    const a = v.v as object;
    const b = lo.v as object;
    const c = hi.v as object;
    const av = vecComponents3(a);
    const bv = vecComponents3(b);
    const cv = vecComponents3(c);
    if (av !== null && bv !== null && cv !== null &&
        Object.getPrototypeOf(a) === Object.getPrototypeOf(b) && Object.getPrototypeOf(a) === Object.getPrototypeOf(c)) {
      const cmp = (x: readonly number[], y: readonly number[]): number => {
        for (let i = 0; i < x.length; i++) {
          const d = x[i]! - y[i]!;
          if (d !== 0) return d;
        }
        return 0;
      };
      if (cmp(av, bv) < 0) return lo;
      if (cmp(av, cv) > 0) return hi;
      return v;
    }
  }
  need2(v, lo, "clamp");
  need2(v, hi, "clamp");
  const x = mode === "int" ? intOf(v) : fl(v);
  const mn = mode === "int" ? intOf(lo) : fl(lo);
  const mx = mode === "int" ? intOf(hi) : fl(hi);
  const win = x > mx ? hi : x < mn ? lo : v;
  if (mode === "int") return vi(intOf(win));
  // `clampf(-0.0, 0.0, 1.0)` 实测留号（下界判的是 `<`，`-0.0 < 0.0` 假，落回原值），所以不 `+ 0`
  if (mode === "float") return V.float(fl(win));
  if (mode === "auto" && !(x <= x)) return V.float(x);
  return win;
}

export function gSmoothstep(from: Variant, to: Variant, s: Variant): Variant {
  const a = fl(from);
  const b = fl(to);
  const x = fl(s);
  if (approxEq(a, b)) return V.float((a <= b ? (x <= a ? 0.0 : 1.0) : x <= b ? 1.0 : 0.0) + 0);
  // 降序那一侧没有早退支：源里只有 `s = CLAMP((p_s - p_from) / (p_to - p_from), 0, 1)` 再走 `s*s*(3-2s)`，
  // 原来那两条 `x <= a / x >= b` 早退在 a > b 时把 0 与 1 交错了（普查 30 格里 9 格分岔）。
  const y = Math.min(Math.max((x - a) / (b - a), 0.0), 1.0);
  return V.float(y * y * (3.0 - 2.0 * y) + 0);
}

/** 绑定签名是 `ease(float x, float curve)`：两个实参先在调用边界折回 float32，式子本身走 `Math::ease` 的 double 那一支（168 格读数含负曲线）。 */
export function gEase(delta: Variant, curve: Variant): Variant {
  const c = Math.fround(fl(curve));
  let x = Math.fround(fl(delta));
  if (x < 0) x = 0;
  else if (x > 1.0) x = 1.0;
  if (c > 0) {
    if (c < 1.0) return V.float(1.0 - Math.pow(1.0 - x, 1.0 / c) + 0);
    return V.float(Math.pow(x, c) + 0);
  }
  if (c < 0) {
    if (x < 0.5) return V.float(Math.pow(x * 2.0, -c) * 0.5 + 0);
    return V.float((1.0 - Math.pow(1.0 - (x - 0.5) * 2.0, -c)) * 0.5 + 0.5 + 0);
  }
  return V.float(0.0);
}

/** 实参顺序是 `(from, to, pre, after, weight)`：`cubic_interpolate(0,1,2,3,0.5)` 给 0.25、`(1,2,3,4,0.5)` 给 1.25。 */
export function gCubic(from: Variant, to: Variant, pre: Variant, after: Variant, w: Variant): Variant {
  const p0 = fl(from);
  const p1 = fl(to);
  const p2 = fl(pre);
  const p3 = fl(after);
  const t = fl(w);
  return V.float(cubicNum(p0, p1, p2, p3, t) + 0);
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


/** D6 那七个值类型不进 Tier 1：它们各自的默认值发不出来，声明与接住点那两站要的是响亮拒，不是 null 盒子（21 格读数量的是各型自己的默认值，`tmp/probe-valuedefault/compare96.txt`）。 */
export function unsupportedValueDefault(name: string): Variant {
  throw new UnsupportedError("value-default", `${name} 的默认值发不出（D6：那七个值类型不进 Tier 1）`);
}

export function lengthOf(v: Variant): Variant {
  if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) return V.int(strLength(v.v as string));
  if (v.t === Tag.ARRAY) return V.int((v.v as GArray).size());
  throw new UnsupportedError("len", `len() 不支持类型 ${v.t}`);
}

/** and / or 是短路的，所以右值延迟求值；两支的值恒为 bool（S398：`1 and 2` 引擎给 `true`，`typeof` 那格给 1）。 */
export function and(l: Variant, right: () => Variant): Variant {
  return truthyOf(l) ? V.bool(truthyOf(right())) : V.bool(false);
}

export function or(l: Variant, right: () => Variant): Variant {
  return truthyOf(l) ? V.bool(true) : V.bool(truthyOf(right()));
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

/** `absf` / `absi`：实测只吃 INT / FLOAT / BOOL（String、StringName、Nil、Array、Vector2 那一格引擎报 Invalid type 并掐掉本次调用，实测 f01–f12）。 */
export function gAbsF(v: Variant): Variant {
  return V.float(Math.abs(numArg(v, "absf() 的参数")) + 0);
}

export function gAbsI(v: Variant): Variant {
  const x = intArgBig(v, "absi() 的参数");
  return V.int(x < 0n ? wrap64(-x) : x);
}

/** 这一族「float 形参」的取数：bool 折成 1/0（实测 a05 / k01），其余非数值同 intArgBig 那侧报运行时错（f01–f12 / k02–k03）。 */
function numArg(v: Variant, who: string): number {
  if (v.t === Tag.BOOL) return v.v ? 1 : 0;
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
    throw new GodotRuntimeError("arg-float", `${who} 需要 float，收到 ${tagName(v.t)}`);
  }
  return v.t === Tag.FLOAT ? (v.v as number) : intToNum(v.v as IntPayload);
}

/**
 * 三角与双曲那一族（实测 h.log 435 格 + l.log 56 格逐格比对）：式子就是引擎那句 `::sin` / `::cos`，
 * 但引擎那侧的幅度归约从某一刻开始丢有效位 —— `cos` 在 1e6、`sin` 在 1e7 就与本机的式子差在第 12~14 位，
 * 所以两支只发到量过的那一格，再大响亮拒；`tan` 一路到 1e300 都对得上，不设限。
 */
const SIN_LIMIT = 1e6;
const COS_LIMIT = 1e5;
const HALF_PI = Math.PI / 2;

function trig(name: string, v: Variant, f: (x: number) => number, limit: number | null): Variant {
  const x = numArg(v, `${name}() 的参数`);
  if (limit !== null && Number.isFinite(x) && Math.abs(x) > limit) {
    throw new UnsupportedError("trig-large-arg", `${name}() 收到 ${show(V.float(x))}：|x| 超过实测的 ${String(limit)}，引擎那侧的归约从这一档开始丢有效位（没量过的不发）`);
  }
  return V.float(f(x));
}

export const gSin = (v: Variant): Variant => trig("sin", v, Math.sin, SIN_LIMIT);
export const gCos = (v: Variant): Variant => trig("cos", v, Math.cos, COS_LIMIT);
export const gTan = (v: Variant): Variant => trig("tan", v, Math.tan, null);
export const gAtan = (v: Variant): Variant => trig("atan", v, Math.atan, null);
export const gSinh = (v: Variant): Variant => trig("sinh", v, Math.sinh, null);
export const gCosh = (v: Variant): Variant => trig("cosh", v, Math.cosh, null);
export const gTanh = (v: Variant): Variant => trig("tanh", v, Math.tanh, null);
export const gAsinh = (v: Variant): Variant => trig("asinh", v, Math.asinh, null);

/** `asin` / `acos` / `acosh` / `atanh` 引擎都先夹再算（`core/math/math_funcs.h` 那四行「Always does clamping」+ 实测 k04–k08 / j.log / e.log），夹出来的是常量。 */
export function gAsin(v: Variant): Variant {
  const x = numArg(v, "asin() 的参数");
  if (x < -1) return V.float(-HALF_PI);
  if (x > 1) return V.float(HALF_PI);
  return V.float(Math.asin(x));
}

export function gAcos(v: Variant): Variant {
  const x = numArg(v, "acos() 的参数");
  if (x < -1) return V.float(Math.PI);
  if (x > 1) return V.float(0);
  return V.float(Math.acos(x));
}

export function gAcosh(v: Variant): Variant {
  const x = numArg(v, "acosh() 的参数");
  if (x < 1) return V.float(0);
  return V.float(Math.acosh(x));
}

export function gAtanh(v: Variant): Variant {
  const x = numArg(v, "atanh() 的参数");
  if (x <= -1) return V.float(-Infinity);
  if (x >= 1) return V.float(Infinity);
  return V.float(Math.atanh(x));
}

export function gAtan2(y: Variant, x: Variant): Variant {
  return V.float(Math.atan2(numArg(y, "atan2() 的第一参"), numArg(x, "atan2() 的第二参")));
}

/** 引擎的两个 dB 常数（4.3 树 `core/math/math_funcs.h`：`ln(10)/20` 与 `20/ln(10)`）。 */
const DB_TO_LINEAR_K = 0.11512925464970228420089957273422;
const LINEAR_TO_DB_K = 8.6858896380650365530225783783321;

export function gDbToLinear(v: Variant): Variant {
  return V.float(Math.exp(numArg(v, "db_to_linear() 的参数") * DB_TO_LINEAR_K) + 0);
}

export function gLinearToDb(v: Variant): Variant {
  return V.float(Math.log(numArg(v, "linear_to_db() 的参数")) * LINEAR_TO_DB_K);
}

/** `pingpong(值, 周期)`：`length == 0` 那格实测给 0.0（n.log pp|1.5,0.0），式子是引擎那句 `abs(fract((v-l)/(2l))*2l - l)`。 */
export function gPingpong(v: Variant, length: Variant): Variant {
  const value = numArg(v, "pingpong() 的值");
  const l = numArg(length, "pingpong() 的周期");
  if (l === 0) return V.float(0);
  const x = (value - l) / (l * 2);
  return V.float(Math.abs((x - Math.floor(x)) * l * 2 - l) + 0);
}

/** `step_decimals()` 不是对数式的：引擎拿小数部分去比那张 10 格的门槛表（`math_funcs.cpp`），门槛是 `0.9999 / 0.09999 / …`。 */
const STEP_THRESHOLDS = [0.9999, 0.09999, 0.009999, 0.0009999, 0.00009999, 0.000009999, 0.0000009999, 0.00000009999, 0.000000009999, 0.0000000009999];

export function gStepDecimals(v: Variant): Variant {
  // 绑定签名是 `step_decimals(float step)`：实参先在调用边界折回 float32，再进这张 double 门槛表
  // （`0.9999` 折成 float32 是 `0.99989998…`，掉到门槛下面，实测 `step_decimals(0.9999)` 给 1）。
  const x = Math.abs(Math.fround(numArg(v, "step_decimals() 的参数")));
  const decs = x - Math.trunc(x);
  let i = 0;
  for (const t of STEP_THRESHOLDS) {
    if (decs >= t) return V.int(i);
    i++;
  }
  return V.int(0);
}

/** `nearest_po2()`：无符号那侧「进一位再抹平」的式子（`typedefs.h` 的 `nearest_power_of_2_templated`），回绕都按 64 位走 —— 实测 `0 → 0`、`-3 → 0`、`3 → 4`、`5 → 8`。 */
export function gNearestPo2(v: Variant): Variant {
  let u = intArgBig(v, "nearest_po2() 的参数") & MASK64;
  u = (u - 1n) & MASK64;
  for (const s of [1, 2, 4, 8, 16, 32]) u = (u | (u >> BigInt(s))) & MASK64;
  return V.int(wrap64((u + 1n) & MASK64));
}

/** 引擎那句 `fmod(2*fmod(to-from, TAU), TAU)` 折出来的最短弧（实测 q01–q03：正好 ±π 才翻，差 1e-9 都不翻）。 */
function angleDiff(from: number, to: number): number {
  const d = (to - from) % TAU_D;
  return ((2 * d) % TAU_D - d) + 0;
}

export function gLerpAngle(from: Variant, to: Variant, w: Variant): Variant {
  const a = numArg(from, "lerp_angle() 的起点");
  return V.float(a + angleDiff(a, numArg(to, "lerp_angle() 的终点")) * numArg(w, "lerp_angle() 的权重") + 0);
}

/** `rotate_toward`：实参先夹进 `|差| - π … |差|` 再按弧的符号走（负 delta 那格没量过，照式子给，语料里不钉）。 */
export function gRotateToward(from: Variant, to: Variant, delta: Variant): Variant {
  const a = numArg(from, "rotate_toward() 的起点");
  const diff = angleDiff(a, numArg(to, "rotate_toward() 的终点"));
  const absDiff = Math.abs(diff);
  const d = Math.min(Math.max(numArg(delta, "rotate_toward() 的步长"), absDiff - PI_D), absDiff);
  return V.float(a + d * (diff >= 0 ? 1 : -1) + 0);
}

export function gBezierInterpolate(s1: Variant, c1: Variant, c2: Variant, e: Variant, t: Variant): Variant {
  const p = numArg(s1, "bezier_interpolate() 的起点");
  const a = numArg(c1, "bezier_interpolate() 的第一控制点");
  const b = numArg(c2, "bezier_interpolate() 的第二控制点");
  const q = numArg(e, "bezier_interpolate() 的终点");
  const w = numArg(t, "bezier_interpolate() 的 t");
  const omt = 1 - w;
  const omt2 = omt * omt;
  const omt3 = omt2 * omt;
  const t2 = w * w;
  const t3 = t2 * w;
  return V.float(p * omt3 + a * omt2 * w * 3 + b * omt * t2 * 3 + q * t3 + 0);
}

export function gBezierDerivative(s1: Variant, c1: Variant, c2: Variant, e: Variant, t: Variant): Variant {
  const p = numArg(s1, "bezier_derivative() 的起点");
  const a = numArg(c1, "bezier_derivative() 的第一控制点");
  const b = numArg(c2, "bezier_derivative() 的第二控制点");
  const q = numArg(e, "bezier_derivative() 的终点");
  const w = numArg(t, "bezier_derivative() 的 t");
  const omt = 1 - w;
  const omt2 = omt * omt;
  const t2 = w * w;
  return V.float((a - p) * 3 * omt2 + (b - a) * 6 * omt * w + (q - b) * 3 * t2 + 0);
}

/** 角度版先把四个控制点折到 `from` 附近（引擎那六行 `fmod` 的式子），再走 `cubic_interpolate`。 */
function angleRots(from: number, to: number, pre: number, post: number): [number, number, number, number] {
  const fromRot = from % TAU_D;
  const preDiff = (pre - fromRot) % TAU_D;
  const preRot = fromRot + ((2 * preDiff) % TAU_D) - preDiff;
  const toDiff = (to - fromRot) % TAU_D;
  const toRot = fromRot + ((2 * toDiff) % TAU_D) - toDiff;
  const postDiff = (post - toRot) % TAU_D;
  const postRot = toRot + ((2 * postDiff) % TAU_D) - postDiff;
  return [fromRot, toRot, preRot, postRot];
}

function cubicNum(from: number, to: number, pre: number, post: number, t: number): number {
  const t2 = t * t;
  return 0.5 * (from * 2 + (to - pre) * t + (pre * 2 - from * 5 + to * 4 - post) * t2 + (pre * -1 + from * 3 - to * 3 + post) * (t2 * t));
}

function lerpNum(a: number, b: number, w: number): number {
  return a + (b - a) * w;
}

function cubicInTimeNum(from: number, to: number, pre: number, post: number, w: number, toT: number, preT: number, postT: number): number {
  const t = lerpNum(0, toT, w);
  const a1 = lerpNum(pre, from, preT === 0 ? 0 : (t - preT) / -preT);
  const a2 = lerpNum(from, to, toT === 0 ? 0.5 : t / toT);
  const a3 = lerpNum(to, post, postT - toT === 0 ? 1 : (t - toT) / (postT - toT));
  const b1 = lerpNum(a1, a2, toT - preT === 0 ? 0 : (t - preT) / (toT - preT));
  const b2 = lerpNum(a2, a3, postT === 0 ? 1 : t / postT);
  return lerpNum(b1, b2, toT === 0 ? 0.5 : t / toT);
}

export function gCubicAngle(from: Variant, to: Variant, pre: Variant, post: Variant, w: Variant): Variant {
  const a = numArg(from, "cubic_interpolate_angle() 的起点");
  const r = angleRots(a, numArg(to, "cubic_interpolate_angle() 的终点"), numArg(pre, "cubic_interpolate_angle() 的前一控制点"), numArg(post, "cubic_interpolate_angle() 的后一控制点"));
  return V.float(cubicNum(r[0], r[1], r[2], r[3], numArg(w, "cubic_interpolate_angle() 的权重")) + 0);
}

export function gCubicInTime(from: Variant, to: Variant, pre: Variant, post: Variant, w: Variant, toT: Variant, preT: Variant, postT: Variant): Variant {
  return V.float(cubicInTimeNum(
    numArg(from, "cubic_interpolate_in_time() 的起点"), numArg(to, "cubic_interpolate_in_time() 的终点"),
    numArg(pre, "cubic_interpolate_in_time() 的前一控制点"), numArg(post, "cubic_interpolate_in_time() 的后一控制点"),
    numArg(w, "cubic_interpolate_in_time() 的权重"), numArg(toT, "cubic_interpolate_in_time() 的 to_t"),
    numArg(preT, "cubic_interpolate_in_time() 的 pre_t"), numArg(postT, "cubic_interpolate_in_time() 的 post_t")) + 0);
}

export function gCubicAngleInTime(from: Variant, to: Variant, pre: Variant, post: Variant, w: Variant, toT: Variant, preT: Variant, postT: Variant): Variant {
  const a = numArg(from, "cubic_interpolate_angle_in_time() 的起点");
  const r = angleRots(a, numArg(to, "cubic_interpolate_angle_in_time() 的终点"), numArg(pre, "cubic_interpolate_angle_in_time() 的前一控制点"), numArg(post, "cubic_interpolate_angle_in_time() 的后一控制点"));
  return V.float(cubicInTimeNum(r[0], r[1], r[2], r[3],
    numArg(w, "cubic_interpolate_angle_in_time() 的权重"), numArg(toT, "cubic_interpolate_angle_in_time() 的 to_t"),
    numArg(preT, "cubic_interpolate_angle_in_time() 的 pre_t"), numArg(postT, "cubic_interpolate_angle_in_time() 的 post_t")) + 0);
}

/** `wrap(值, 起, 止)`：三支全是 int 才走整数那条道，混进浮点就一律浮点（实测 c02 给 1、c03 给 1.5）。 */
export function gWrapAny(v: Variant, lo: Variant, hi: Variant): Variant {
  return gWrap(v, lo, hi, v.t === Tag.INT && lo.t === Tag.INT && hi.t === Tag.INT);
}

/**
 * `is_same(a, b)`：先比引擎那侧的类型，再按类型走「同一性」。
 * 容器 / pack / 信号 / 对象与类值看身份，Callable 看等式（绑过没绑过算不等），
 * 结构体与标量看值 —— 浮点的 NaN 自己相等、0.0 与 -0.0 相等（实测 d06 / e08）。
 */
export function gIsSame(a: Variant, b: Variant): Variant {
  const ta = (typeOf(a) as Variant).v as number;
  if ((typeOf(b) as Variant).v !== ta) return V.bool(false);
  if (ta === 2) {
    return V.bool(intToBig(a.v as IntPayload) === intToBig(b.v as IntPayload));
  }
  if (ta === 3) {
    const x = a.v as number;
    const y = b.v as number;
    return V.bool(x === y || (Number.isNaN(x) && Number.isNaN(y)));
  }
  if (ta === 25) return V.bool(callableEq(a.v as CallableBox, b.v as CallableBox));
  if (ta === 24 || ta === 26 || ta === 27 || ta === 28 || isBytes(a)) return V.bool(a.v === b.v);
  return V.bool(valueEq(a, b));
}

/** `type_string()` 的 0–38 号名表（实测 `tmp/probe-small-builtins/r.log`；39 往上给 `<invalid type>`）。 */
const TYPE_NAMES = ["Nil", "bool", "int", "float", "String", "Vector2", "Vector2i", "Rect2", "Rect2i", "Vector3",
  "Vector3i", "Transform2D", "Vector4", "Vector4i", "Plane", "Quaternion", "AABB", "Basis", "Transform3D",
  "Projection", "Color", "StringName", "NodePath", "RID", "Object", "Callable", "Signal", "Dictionary", "Array",
  "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array",
  "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray", "PackedVector4Array"];

/** `error_string()` 的 0–48 号名表（同探头；49 往上、负数与 INT64_MAX 都给 `(invalid error code)`）。 */
const ERROR_NAMES = ["OK", "Failed", "Unavailable", "Unconfigured", "Unauthorized", "Parameter out of range",
  "Out of memory", "File not found", "File: Bad drive", "File: Bad path", "File: Permission denied",
  "File already in use", "Can't open file", "Can't write file", "Can't read file", "File unrecognized",
  "File corrupt", "Missing dependencies for file", "End of file", "Can't open", "Can't create", "Query failed",
  "Already in use", "Locked", "Timeout", "Can't connect", "Can't resolve", "Connection error",
  "Can't acquire resource", "Can't fork", "Invalid data", "Invalid parameter", "Already exists",
  "Does not exist", "Can't read database", "Can't write database", "Compilation failed", "Method not found",
  "Link failed", "Script failed", "Cyclic link detected", "Invalid declaration", "Duplicate symbol",
  "Parse error", "Busy", "Skip", "Help", "Bug", "Printer on fire"];

/** 引擎这两支的形参是 int32：先按 32 位回绕再查表 —— 实测 `error_string(INT64_MIN)` 给 **OK**（低 32 位是 0），`error_string(-1)` 给 `(invalid error code)`。 */
function nameById(v: Variant, who: string, names: string[], fallback: string): Variant {
  // 折成 int32 走 BigInt.asIntN：scriptc 对下面那种 bigint 关系运算没有 lowering（报 SC1043），语义与实测读数一致。
  const x = Number(BigInt.asIntN(32, intArgBig(v, who)));
  return x >= 0 && x < names.length ? V.str(names[x] as string) : V.str(fallback);
}

export function gTypeString(v: Variant): Variant {
  return nameById(v, "type_string() 的参数", TYPE_NAMES, "<invalid type>");
}

export function gErrorString(v: Variant): Variant {
  return nameById(v, "error_string() 的参数", ERROR_NAMES, "(invalid error code)");
}

/** `type_exists()`：判据就是这张 ClassDB 名单；实参只量过 String，其余类型响亮拒（连 StringName 都没量）。 */
export function gTypeExists(v: Variant): Variant {
  if (v.t !== Tag.STRING) {
    throw new UnsupportedError("type-exists-arg", `type_exists() 的实参只量过 String（收到 ${tagName(v.t)}）`);
  }
  return V.bool(ENGINE_CLASS_NAMES.has(v.v as string));
}

const PCG_MUL = 6364136223846793005n;
const PCG_INC = 1442695040888963407n;
const PCG_MASK = 18446744073709551615n;
const PCG_DEFAULT_SEED = 12047754176567800795n;
const CMP_EPSILON = 0.00001;
const MATH_TAU = 6.283185307179586;

type Pcg = { state: bigint; inc: bigint };

const DEFAULT_RAND: Pcg = { state: 0n, inc: 1n };

/** pcg32 的那一步：先推进状态，再用**旧**状态算 XSH-RR 输出。 */
function pcgNext(rng: Pcg): number {
  const old = rng.state;
  rng.state = (old * PCG_MUL + (rng.inc | 1n)) & PCG_MASK;
  const xs = Number((((old >> 18n) ^ old) >> 27n) & 0xffffffffn);
  const rot = Number(old >> 59n);
  return ((xs >>> rot) | (xs << ((-rot) & 31))) >>> 0;
}

/** `pcg32_srandom_r`：inc 走 `(seq<<1)|1`，再预热两步、中间把 seed 加进 state。 */
function pcgSeedTo(rng: Pcg, seed: bigint): void {
  rng.state = 0n;
  rng.inc = ((PCG_INC << 1n) | 1n) & PCG_MASK;
  pcgNext(rng);
  rng.state = (rng.state + (seed & PCG_MASK)) & PCG_MASK;
  pcgNext(rng);
}

function pcgClz32(x: number): number {
  let n = x >>> 0;
  if (n === 0) return 32;
  let c = 0;
  while ((n & 0x80000000) === 0) {
    c++;
    n = (n << 1) >>> 0;
  }
  return c;
}

/** `randd()`：第一发当指数种子（0 就直接给 0），后两发拼 53 位尾数并硬塞 MSB/LSB，再按 `ldexp(值, -64-CLZ)` 落地。 */
function pcgRandd(rng: Pcg): number {
  const proto = pcgNext(rng);
  if (proto === 0) return 0;
  const hi = BigInt(pcgNext(rng));
  const lo = BigInt(pcgNext(rng));
  const sig = (((hi << 32n) | lo) | 0x8000000000000001n) & PCG_MASK;
  return Number(sig) * Math.pow(2, -64 - pcgClz32(proto));
}

/** `pcg32_boundedrand_r`：拒绝采样，门槛是 C 那句 `(0x100000000 - bound) % bound`。 */
function pcgBounded(rng: Pcg, bound: number): number {
  const threshold = bound >= 4294967296 ? 0 : (4294967296 - bound) % bound;
  for (;;) {
    const r = pcgNext(rng);
    if (r >= threshold) return r % bound;
  }
}

let BOOTED = false;

function pcgTimeSeed(): bigint {
  const ms = BigInt(Date.now());
  return BigInt.asUintN(64, (ms / 1000n + (ms % 1000n) * 1000n) * DEFAULT_RAND.state + PCG_INC);
}

function bootRand(): void {
  if (BOOTED) return;
  BOOTED = true;
  pcgSeedTo(DEFAULT_RAND, PCG_DEFAULT_SEED);
  pcgSeedTo(DEFAULT_RAND, pcgTimeSeed());
}

export function gSeed(v: Variant): Variant {
  bootRand();
  pcgSeedTo(DEFAULT_RAND, intArgBig(v, "seed() 的实参"));
  return V.nil();
}

export function gRandomize(): Variant {
  bootRand();
  pcgSeedTo(DEFAULT_RAND, pcgTimeSeed());
  return V.nil();
}

export function gRandi(): Variant {
  bootRand();
  return V.int(BigInt(pcgNext(DEFAULT_RAND)));
}

export function gRandf(): Variant {
  bootRand();
  return V.float(Math.fround(pcgNext(DEFAULT_RAND) / 4294967296));
}

export function gRandiRange(from: Variant, to: Variant): Variant {
  bootRand();
  const a = Number(BigInt.asIntN(32, intArgBig(from, "randi_range() 的第一参")));
  const b = Number(BigInt.asIntN(32, intArgBig(to, "randi_range() 的第二参")));
  if (a === b) return V.int(BigInt(a));
  const bound = Math.abs(a - b) + 1;
  return V.int(BigInt(pcgBounded(DEFAULT_RAND, bound) + Math.min(a, b)));
}

export function gRandfRange(from: Variant, to: Variant): Variant {
  bootRand();
  const a = numArg(from, "randf_range() 的第一参");
  const b = numArg(to, "randf_range() 的第二参");
  return V.float(pcgRandd(DEFAULT_RAND) * (b - a) + a);
}

export function gRandfn(mean: Variant, dev: Variant): Variant {
  bootRand();
  const m = numArg(mean, "randfn() 的均值");
  const d = numArg(dev, "randfn() 的标准差");
  let temp = pcgRandd(DEFAULT_RAND);
  if (temp < CMP_EPSILON) temp += CMP_EPSILON;
  return V.float(m + d * (Math.cos(MATH_TAU * pcgRandd(DEFAULT_RAND)) * Math.sqrt(-2.0 * Math.log(temp))));
}

/** 实测为真的那四类：脚本实例、脚本类值、引擎类值、weakref 本身。空对象引用与 Callable / Signal / 结构体 / 容器 / nil 都是假。 */
export function gIsInstanceValid(v: Variant): Variant {
  if (v.t !== Tag.OBJECT) return V.bool(false);
  const inner = v.v;
  if (isNullRefValue(inner) || isCallableBox(inner) || inner instanceof Signal) return V.bool(false);
  return V.bool(
    inner instanceof GdScriptObject || inner instanceof ClassDesc || inner instanceof GdNativeClass || isWeakRefBox(inner),
  );
}

/** 号还在就返回那个对象，不在返回空对象引用（typeof 24、与 null 相等、印 `<Object#null>`）。 */
export function gInstanceFromId(v: Variant): Variant {
  const live = liveObjectOf(Number(BigInt.asIntN(64, intArgBig(v, "instance_from_id() 的实参"))));
  return live === null ? V.object(NULL_OBJECT) : V.object(live);
}

export function gIsInstanceIdValid(v: Variant): Variant {
  return V.bool(liveObjectOf(Number(BigInt.asIntN(64, intArgBig(v, "is_instance_id_valid() 的实参")))) !== null);
}

/** 只有对象与 null 量过（`weakref(null).get_ref()` 给 `<null>`），其余实参这一族没依据就拒。 */
export function gWeakref(v: Variant): Variant {
  if (v.t === Tag.NIL) return V.object(weakRefBox(null));
  if (!gIsInstanceValid(v).v) {
    throw new UnsupportedError("weakref-arg", `weakref() 只量过对象与 null（收到 ${tagName(v.t)}）`);
  }
  return V.object(weakRefBox(v));
}

/** 报错文本里的来源名：Godot 管 null 叫 Nil，其余走 valueTypeName（它认得 RID / Vector2 这些结构体）。 */
function utilityArgLabel(v: Variant): string {
  return v.t === Tag.NIL ? "Nil" : valueTypeName(v);
}

/** 实测收 int / float（向零截断：1.7 → RID(1)）/ bool（true → RID(1)）；String 与 Nil 两格量过引擎那句原文，其余来源按同一条式子代入。 */
function ridArgBig(v: Variant): bigint {
  if (v.t === Tag.INT) return intToBig(v.v as IntPayload);
  if (v.t === Tag.BOOL) return v.v ? 1n : 0n;
  if (v.t === Tag.FLOAT) {
    const n = v.v as number;
    if (!Number.isFinite(n)) {
      throw new UnsupportedError("rid-arg-float", `rid_from_int64() 的非有限浮点实参没量过（收到 ${String(n)}）`);
    }
    return BigInt(Math.trunc(n));
  }
  throw new GodotRuntimeError(
    "rid-arg",
    `Invalid type in utility function "rid_from_int64()". Cannot convert argument 1 from ${utilityArgLabel(v)} to int.`,
  );
}

/** `RID` 只能从这两支来：实测 `RID(int)` 是解析期那句「No constructor of "RID" matches the signature "RID(int)"」，所以不发构造函数。 */
export function gRidFromInt64(v: Variant): Variant {
  return rid(ridArgBig(v));
}

/** 实测新进程里连读 13241 / 13242 / 13243，另一份脚本首格同为 13241 —— 起点固定、每调一次加一。 */
export function gRidAllocateId(): Variant {
  return V.int(allocateRid());
}

/**
 * `inst_to_dict` 里带 get/set 的属性出门的默认值：引擎**不调 getter**（S269 ④ 十六格实测），
 * 与「声明了类型却没赋值的普通 var」那一格一字不差。表外的类型名（Rect2 / Callable / 脚本类名…）响亮拒。
 */
function dictTypeDefault(t: string | null): Variant {
  if (t === null) return V.nil();
  switch (t) {
    case "int":
      return V.int(0);
    case "float":
      return V.float(0);
    case "bool":
      return V.bool(false);
    case "String":
      return V.str("");
    case "StringName":
      return V.stringName("");
    case "Vector2":
      return V.object(new GVector2(0, 0));
    case "Vector2i":
      return V.object(new GVector2i(0, 0));
    case "Vector3":
      return V.object(new GVector3(0, 0, 0));
    case "Vector3i":
      return V.object(new GVector3i(0, 0, 0));
    case "Color":
      return V.object(new GColor(0, 0, 0, 1));
    case "NodePath":
      return emptyNodePath();
    case "Array":
      return V.array(GArray.of([]));
    case "Dictionary":
      return V.dict(new GDict());
    case "PackedByteArray":
      return V.object(new GBytes([], "byte"));
    case "PackedStringArray":
      return V.object(new GBytes([], "string"));
    default:
      throw new UnsupportedError(
        "inst-to-dict-acc-type",
        `inst_to_dict() 里 ${t} 类型的 get/set 属性没量过出门值（S269 ④ 量齐的是十六种形状），不猜`,
      );
  }
}

/**
 * `inst_to_dict(obj)`（S269）：`{ "@subpath": 类路径的 NodePath, "@path": 模块 res 路径, <字段名 StringName>: 值 }`。
 * 三段都有读数：`null` 实参给 null、类值给运行期那一句、字段序是**基类在前**（与 `String.format()` 反着走），
 * 对象与容器出门的是引用而不是序列化。
 */
export function gInstToDict(v: Variant): Variant {
  if (v.t === Tag.NIL) return V.nil();
  if (v.t !== Tag.OBJECT) {
    throw new UnsupportedError(
      "inst-to-dict-arg",
      `inst_to_dict() 的实参只量过脚本实例、类值与 null（收到 ${valueTypeName(v)}）：静态不合式的来源在引擎是解析期那句 argument 1 should be "Object"`,
    );
  }
  const inner = v.v as object;
  if (inner instanceof ClassDesc || inner instanceof GdNativeClass) {
    throw new GodotRuntimeError(
      "inst-to-dict",
      `Error calling GDScript utility function "inst_to_dict()": Not a script with an instance.`,
    );
  }
  const shape = dictShapeOf(inner);
  if (shape === null) {
    throw new UnsupportedError("inst-to-dict-arg", `inst_to_dict() 的实参是 ${valueTypeName(v)}：只有脚本实例量过这一支`);
  }
  if (shape.resPath === null) {
    throw new UnsupportedError("inst-to-dict-path", "inst_to_dict() 发不出 @path：这份产物没有模块的 res 路径（单文件模式），那一格没量过");
  }
  const d = new GDict();
  d.set(V.str("@subpath"), nodePathValue(shape.classPath));
  d.set(V.str("@path"), V.str(shape.resPath));
  const acc = shape.accessors;
  const written = Object.keys(acc).length === 0 ? null : dictWrittenOf(inner);
  for (let i = 0; i < shape.names.length; i++) {
    const name = shape.names[i] as string;
    // `undefined` = 普通字段（读数器已经按同一顺序把值取好了）；`null` = 无类型的 get/set 属性（出门 `<null>`）。
    const declared = acc[name] as string | null | undefined;
    // 带 get/set 的属性：引擎不调 getter，出门的是声明类型的默认值（S269 ④）；但 `dict_to_inst` 灌过那一格就改出门灌进去的原值（S272 ③）。
    const carried = declared === undefined || written === null ? undefined : written[name];
    const value = declared === undefined ? (shape.values[i] as Variant) : carried === undefined ? dictTypeDefault(declared) : carried;
    d.set(V.stringName(name), value);
  }
  return V.dict(d);
}

export function gRandFromSeed(v: Variant): Variant {
  const s = intArgBig(v, "rand_from_seed() 的实参");
  const local: Pcg = { state: 0n, inc: 1n };
  pcgSeedTo(local, s);
  return packCtor("int64", [V.array(GArray.of([V.int(BigInt(pcgNext(local))), V.int(s)]))]);
}
