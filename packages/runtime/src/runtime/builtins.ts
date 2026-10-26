import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToBig, intToNum, wrap64, tagName, type IntPayload, type Variant } from "./tags";
import { INT64_MAX, INT64_MIN, TWO_63, strToInt, strToFloat } from "./numstr";
import { GArray, GDict, elemConvert, registerVarToStrValueHook, show, truthyOf, valueEq, type ElemKind} from "./values";
import { intArgBig, strLength, valueTypeName } from "./string-ops";
import { ELEM_TYPE_CODE } from "./methods";
import { GBytes, isBytes, packBytes, packCtor, packItems, packTypeName } from "./packed";
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
import { GVector4, vector4, vector4Method, vec4Cmp } from "./vector4";
import { GVector4i, vector4i, vector4iMethod } from "./vector4i";
import { GColor, colorMethod } from "./color";
import { typeOf } from "./patterns";
import { rtosFix } from "./grisu2";
import { ENGINE_CLASS_NAMES } from "./engine-classes";

export function arrayFromVariant(v: Variant): Variant {
  if (v.t === Tag.ARRAY) {
    return v;
  }
  if (isBytes(v)) {
    return V.array(GArray.of(packItems(packBytes(v))));
  }
  if (v.t === Tag.DICT || v.t === Tag.STRING || v.t === Tag.INT || v.t === Tag.NIL ||
    (v.t === Tag.OBJECT && v.v instanceof GVector2)) {
    throw new GodotRuntimeError("array-ctor", "Invalid call. Nonexistent 'Array' constructor.");
  }
  throw new UnsupportedError("array-ctor-from", `Array(...) 只实测过 pack、Array 与那五种坏源形（收到 ${tagName(v.t)}）`);
}

/** 型码 → 元素标注名：现取 `ELEM_TYPE_CODE` 的反向，免得第二张表漂。 */
function kindByCode(code: number): ElemKind | null {
  for (const [name, c] of Object.entries(ELEM_TYPE_CODE)) {
    if (c === code) return name as ElemKind;
  }
  return null;
}

export function arrayFromArgs(args: Variant[]): Variant {
  if (args.length === 0) return V.array(GArray.of([]));
  if (args.length === 1) return arrayFromVariant(args[0] as Variant);
  if (args.length !== 4) {
    throw new UnsupportedError("array-ctor-arity", `Array(...) 只实测过 0 / 1 / 4 参三形（收到 ${String(args.length)} 参）`);
  }
  const [base, typeArg, classArg] = args as [Variant, Variant, Variant, Variant];
  if (base.t !== Tag.ARRAY) {
    if (isBytes(base)) {
      throw new GodotRuntimeError("array-ctor-base", `Invalid type in 'Array' constructor. Cannot convert argument 1 from ${packTypeName(packBytes(base).kind)} to Array.`);
    }
    throw new UnsupportedError("array-ctor-base", `Array(...) 四参形的第一参只实测过 Array（收到 ${tagName(base.t)}）`);
  }
  if (typeArg.t !== Tag.INT) {
    throw new UnsupportedError("array-ctor-type-arg", `Array(...) 的第二参只实测过 int 型码（收到 ${tagName(typeArg.t)}）`);
  }
  const codeRaw = intToNum(typeArg.v as IntPayload);
  if (typeof codeRaw === "bigint") {
    throw new UnsupportedError("array-ctor-type-arg", `Array(...) 的型码越出 int 范围（收到 ${String(codeRaw)}）`);
  }
  const items = (base.v as GArray).raw();
  if (codeRaw === 0) {
    return V.array(GArray.of([...items]));
  }
  const kind = kindByCode(codeRaw);
  if (kind === null) {
    throw new UnsupportedError("array-ctor-kind", `Array(...) 的定型形只实测过容器标注的那批型名；型码 ${String(codeRaw)} 没量过（类名位收到 ${tagName(classArg.t)}）`);
  }
  const cls = ctorClassName(classArg);
  const convertAll = (): Variant[] | null => {
    const out: Variant[] = [];
    for (const x of items) {
      const converted = elemConvert(kind, x);
      if (converted === null) return null;
      out.push(converted);
    }
    return out;
  };
  if (cls !== null && kind !== "Object") {
    const converted = convertAll();
    return V.array(GArray.of(converted ?? []));
  }
  const built = (list: Variant[]): Variant => {
    const g = GArray.of(list);
    if (kind === "Object" && cls !== null) {
      g.stampElem(kind);
      g.className = cls;
    }
    else g.stampElem(kind);
    return V.array(g);
  };
  const converted = convertAll();
  return built(converted ?? []);
}

function ctorClassName(v: Variant): string | null {
  if (v.t === Tag.STRING_NAME || v.t === Tag.STRING) {
    const text = v.v as string;
    return text === "" ? null : text;
  }
  throw new UnsupportedError("array-ctor-class", `Array(...) 的第三参只实测过 StringName 与 String（收到 ${tagName(v.t)}）`);
}

export function num(v: Variant): number {
  if (v.t === Tag.BOOL) return (v.v as boolean) ? 1 : 0;
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
    throw new UnsupportedError("not-number", `需要数值，收到类型 ${v.t}`);
  }
  return v.t === Tag.INT ? intToNum(v.v as IntPayload) : (v.v as number);
}

function utilFloatArg(v: Variant, fn: string, n: number): number {
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT && v.t !== Tag.BOOL) {
    throw new GodotRuntimeError("utility-convert", `Invalid type in utility function "${fn}()". Cannot convert argument ${n} from ${valueTypeName(v)} to float.`);
  }
  return num(v);
}

function utilIntArg(v: Variant, fn: string, n: number): number {
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT && v.t !== Tag.BOOL) {
    throw new GodotRuntimeError("utility-convert", `Invalid type in utility function "${fn}()". Cannot convert argument ${n} from ${valueTypeName(v)} to int.`);
  }
  return Math.trunc(num(v));
}

export function numOrVectorArg(v: Variant, fn: string): number {
  vec4UtilityGuard(v, fn);
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT && v.t !== Tag.BOOL) {
    throw new GodotRuntimeError("utility-arg", `Error calling utility function "${fn}()": Argument "x" must be "int", "float", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", or "Vector4i".`);
  }
  return num(v);
}

function vec4UtilityGuard(v: Variant, fn: string): void {
  if (v.t === Tag.OBJECT && (v.v instanceof GVector4 || v.v instanceof GVector4i)) {
    throw new UnsupportedError("utility-vector4", `${fn}() 在 Vector4 / Vector4i 上的语义没实测过（S580 只到核心值类型）`);
  }
}

/** str() 返回的是 String 变体，不是裸 JS 字符串 —— 否则 print(str(x)) 会炸 */
export function strOf(v: Variant): Variant {
  return V.str(show(v));
}

export function strHexToInt(s: string): bigint {
  const m = /^(-?)(0[xX])?([0-9a-fA-F]+)$/.exec(s);
  if (m === null) return 0n;
  const v = BigInt("0x" + (m[3] as string));
  if (v > INT64_MAX) return m[1] === "-" ? INT64_MIN : INT64_MAX;
  return m[1] === "-" ? -v : v;
}

export const INT_RE = /^[+-]?[0-9]+$/;
export const HEX_RE = /^[+-]?[0-9a-fA-F]+$/;
export const HEX_PREFIX_RE = /^[+-]?0x[0-9a-fA-F]+$/;

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

export function hashDjb2(s: string): number {
  let h = 5381;
  for (const ch of s) h = (h * 33 + (ch.codePointAt(0) as number)) % 4294967296;
  return h;
}

const GD_TYPE = { DICTIONARY: 27, ARRAY: 28 } as const;
const MURMUR_SEED = 0x7f07c65;
const MASK64 = (1n << 64n) - 1n;
const F64_VIEW = new DataView(new ArrayBuffer(8));
const F32_VIEW = new DataView(new ArrayBuffer(4));
const I64_VIEW = new DataView(new ArrayBuffer(8));

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
  if (o instanceof GVector4) return `Vector4(${rtosFix(o.x, true)}, ${rtosFix(o.y, true)}, ${rtosFix(o.z, true)}, ${rtosFix(o.w, true)})`;
  if (o instanceof GVector4i) return `Vector4i(${o.x}, ${o.y}, ${o.z}, ${o.w})`;
  if (o instanceof GColor) return `Color(${rtosFix(o.r, true)}, ${rtosFix(o.g, true)}, ${rtosFix(o.b, true)}, ${rtosFix(o.a, true)})`;
  if (o instanceof Signal) return "Signal()";
  return null;
});

function murmurOne32(pIn: number, pSeed: number): number {
  let k = Math.imul(pIn >>> 0, 0xcc9e2d51) >>> 0;
  k = ((k << 15) | (k >>> 17)) >>> 0;
  k = Math.imul(k, 0x1b873593) >>> 0;
  let s = (pSeed ^ k) >>> 0;
  s = ((s << 13) | (s >>> 19)) >>> 0;
  return (Math.imul(s, 5) + 0xe6546b64) >>> 0;
}

function fmix32(h: number): number {
  let x = (h ^ (h >>> 16)) >>> 0;
  x = Math.imul(x, 0x85ebca6b) >>> 0;
  x = (x ^ (x >>> 13)) >>> 0;
  x = Math.imul(x, 0xc2b2ae35) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}

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

function hashDoubleInto(d: number, seed: number): number {
  if (Number.isNaN(d)) return murmurOne64Words(0, 0x7ff80000, seed);
  F64_VIEW.setFloat64(0, d === 0 ? 0 : d, true);
  return murmurOne64Words(F64_VIEW.getUint32(0, true), F64_VIEW.getUint32(4, true), seed);
}

/** `hash_murmur3_one_double`：先把 ±0 归一，再按 IEEE754 的两个字折叠。 */
function hashDouble(d: number): number {
  return hashDoubleInto(d, MURMUR_SEED);
}

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

function nodePathHash(p: GdNodePath): number {
  if (p.empty) return 0;
  const h1 = hashDjb2(p.names.join("/"));
  const h2 = hashDjb2(p.subnames.join(":"));
  const h = hashOneUint64((BigInt(h1) << 32n) | BigInt(h2));
  return p.absolute ? h : ~h >>> 0;
}
registerNodePathHashHook(nodePathHash);

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
  } else if (kind === "vector4") {
    for (const e of raw) {
      const v = e as GVector4;
      h = hashFloat32(v.x, h);
      h = hashFloat32(v.y, h);
      h = hashFloat32(v.z, h);
      h = hashFloat32(v.w, h);
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

const HASH_MAX_RECURSION = 100;

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
      if (v.v instanceof GdRid) return hashOneUint64(intToBig((v.v as GdRid).id));
      if (v.v instanceof GdNodePath) return nodePathHash(v.v as GdNodePath);
      if (v.v instanceof GVector2) return fmix32(hashFloat32(v.v.y, hashFloat32(v.v.x, MURMUR_SEED)));
      if (v.v instanceof GVector2i) return fmix32(murmurOne32(v.v.y >>> 0, murmurOne32(v.v.x >>> 0, MURMUR_SEED)));
      if (v.v instanceof GVector3) return fmix32(hashFloat32(v.v.z, hashFloat32(v.v.y, hashFloat32(v.v.x, MURMUR_SEED))));
      if (v.v instanceof GVector3i) return fmix32(murmurOne32(v.v.z >>> 0, murmurOne32(v.v.y >>> 0, murmurOne32(v.v.x >>> 0, MURMUR_SEED))));
      if (v.v instanceof GVector4) return fmix32(hashFloat32(v.v.w, hashFloat32(v.v.z, hashFloat32(v.v.y, hashFloat32(v.v.x, MURMUR_SEED)))));
      if (v.v instanceof GVector4i) return fmix32(murmurOne32(v.v.w >>> 0, murmurOne32(v.v.z >>> 0, murmurOne32(v.v.y >>> 0, murmurOne32(v.v.x >>> 0, MURMUR_SEED)))));
      if (v.v instanceof GColor) return fmix32(hashFloat32(v.v.a, hashFloat32(v.v.b, hashFloat32(v.v.g, hashFloat32(v.v.r, MURMUR_SEED)))));
      if (v.v instanceof GBytes) return packHash(v.v as GBytes);
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
      if (isNullCallable(box)) return fmix32(murmurOne64Words(0, 0, hashDjb2("")));
      if (box.invalidMethod) {
        throw new UnsupportedError("hash-callable-invalid-method", "Callable.create(obj, 不存在的方法) 的哈希没拟合出来，不发");
      }
      if (box.detachedOwner !== null) {
        throw new UnsupportedError("hash-callable-detached", `Callable.create(${box.detachedOwner}, name) 的哈希没拟合出来（引擎给 1862405700，名字哈希不中），不发`);
      }
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

export function variantHash(args: Variant[]): Variant {
  if (args.length !== 1) {
    throw new GodotRuntimeError("arity", `hash() 只接受 1 个参数（收到 ${args.length} 个）`);
  }
  return V.int(variantHashNumber(args[0] as Variant));
}

export function sqrt(v: Variant): Variant {
  return V.float(Math.sqrt(utilFloatArg(v, "sqrt", 1)));
}

export function abs(v: Variant): Variant {
  if (v.t === Tag.INT) {
    const x = intToBig(v.v as IntPayload);
    return V.int(x < 0n ? wrap64(-x) : x);
  }
  const vec = vectorMath(v, "abs");
  if (vec !== null) return vec;
  return V.float(Math.abs(numOrVectorArg(v, "abs")) + 0);
}

const INT_MIN_F = -9223372036854775808;

function vi(n: number): Variant {
  const v = Object.is(n, -0) ? 0 : n;
  return Number.isSafeInteger(v) ? V.int(v) : V.int(BigInt(Math.trunc(v)));
}

function isInt(v: Variant): boolean {
  return v.t === Tag.INT;
}

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

function vectorMath(v: Variant, name: "abs" | "floor" | "ceil" | "round" | "sign"): Variant | null {
  if (v.t !== Tag.OBJECT) return null;
  const o = v.v;
  if (o instanceof GVector2) return vector2Method(o, name, []);
  if (o instanceof GVector3) return vector3Method(o, name, []);
  if (o instanceof GVector4) return vector4Method(o, name, []);
  if (o instanceof GVector4i) return name === "abs" || name === "sign" ? vector4iMethod(o, name, []) : vector4i(o.x, o.y, o.z, o.w);
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
  utilIntArg(v, "signi", 1);
  return vi(one(intOf(v)));
}

export function gSignF(v: Variant): Variant {
  return V.float(one(utilFloatArg(v, "signf", 1)) + 0);
}

type RoundMode = "auto" | "float" | "int";

function roundThree(x: number, fn: (n: number) => number, mode: RoundMode): Variant {
  if (mode === "int") {
    if (!Number.isFinite(x)) return V.int(INT64_MIN);
    return vi(fn(x));
  }
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
  return roundThree(mode === "auto" ? numOrVectorArg(v, "floor") : utilFloatArg(v, mode === "float" ? "floorf" : "floori", 1), Math.floor, mode);
}

export function gCeil(v: Variant, mode: RoundMode = "auto"): Variant {
  const pas = intPassthrough(v, mode);
  if (pas !== null) return pas;
  if (mode === "auto") {
    const vec = vectorMath(v, "ceil");
    if (vec !== null) return vec;
  }
  return roundThree(mode === "auto" ? numOrVectorArg(v, "ceil") : utilFloatArg(v, mode === "float" ? "ceilf" : "ceili", 1), Math.ceil, mode);
}

export function gRound(v: Variant, mode: RoundMode = "auto"): Variant {
  const pas = intPassthrough(v, mode);
  if (pas !== null) return pas;
  if (mode === "auto") {
    const vec = vectorMath(v, "round");
    if (vec !== null) return vec;
  }
  return roundThree(mode === "auto" ? numOrVectorArg(v, "round") : utilFloatArg(v, mode === "float" ? "roundf" : "roundi", 1), (x: number): number => (x === 0 ? x : gdRound(x)), mode);
}

function floorDiv(a: number, b: number): number {
  return Math.floor(a / b);
}

export function gPosmod(x: Variant, y: Variant): Variant {
  utilIntArg(x, "posmod", 1);
  utilIntArg(y, "posmod", 2);
  const a = intOf(x);
  const b = intOf(y);
  if (b === 0) return vi(0);
  return vi(a - b * floorDiv(a, b));
}

export function gFposmod(x: Variant, y: Variant): Variant {
  const a = utilFloatArg(x, "fposmod", 1);
  const b = utilFloatArg(y, "fposmod", 2);
  let v = a % b;
  if ((v < 0 && b > 0) || (v > 0 && b < 0)) v += b;
  return V.float(v + 0);
}

/** `fmod(-0.0, 1.0)` 实测留号（C 的 `fmod` 就是把被除数的号带下来），所以不 `+ 0`。 */
export function gFmod(x: Variant, y: Variant): Variant {
  return V.float(utilFloatArg(x, "fmod", 1) % utilFloatArg(y, "fmod", 2));
}

export function gWrap(v: Variant, lo: Variant, hi: Variant, asInt: boolean): Variant {
  if (asInt) {
    utilIntArg(v, "wrapi", 1);
    utilIntArg(lo, "wrapi", 2);
    utilIntArg(hi, "wrapi", 3);
  }
  if (!asInt) {
    const mn = utilFloatArg(lo, "wrapf", 2);
    const mx = utilFloatArg(hi, "wrapf", 3);
    const x = utilFloatArg(v, "wrapf", 1);
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

const LERP_FROM_LIST = 'Error calling utility function "lerp()": Argument "from" must be "int", "float", "Vector2", "Vector3", "Vector4", "Color", "Quaternion", "Basis", "Transform2D", or "Transform3D".';
const SNAPPED_X_LIST = 'Error calling utility function "snapped()": Argument "x" must be "int", "float", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", or "Vector4i".';
const SNAPPED_STEP_MUST = 'Error calling utility function "snapped()": Argument "step" must be "int" or "float".';

/** 值类型的引擎型名（`snapped` / `lerp` 的「跟第一参走」句要用）。 */
function vecClassName(o: object): string | null {
  if (o instanceof GVector2) return "Vector2";
  if (o instanceof GVector3) return "Vector3";
  if (o instanceof GVector2i) return "Vector2i";
  if (o instanceof GVector3i) return "Vector3i";
  if (o instanceof GVector4) return "Vector4";
  if (o instanceof GVector4i) return "Vector4i";
  if (o instanceof GColor) return "Color";
  return null;
}

function utilConvertError(fn: string, src: Variant, target: string, argNo: number): GodotRuntimeError {
  return new GodotRuntimeError("utility-convert", `Invalid type in utility function "${fn}()". Cannot convert argument ${argNo} from ${valueTypeName(src)} to ${target}.`);
}

function weightToFloat(w: Variant): number {
  if (w.t === Tag.INT) {
    const n = intToNum(w.v as IntPayload);
    return typeof n === "bigint" ? Number(n) : n;
  }
  if (w.t === Tag.FLOAT) return w.v as number;
  if (w.t === Tag.BOOL) return w.v ? 1 : 0;
  if (w.t === Tag.STRING) return strToFloat(w.v as string);
  return 0;
}

export function gLerp(a: Variant, b: Variant, w: Variant): Variant {
  const va4 = a.t === Tag.OBJECT && a.v instanceof GVector4 ? (a.v as GVector4) : null;
  const vb4 = b.t === Tag.OBJECT && b.v instanceof GVector4 ? (b.v as GVector4) : null;
  if (va4 !== null && vb4 !== null) {
    const t = weightToFloat(w);
    const mix = (x: number, y: number) => Math.fround(x + Math.fround((y - x) * Math.fround(t)));
    return V.object(new GVector4(mix(va4.x, vb4.x), mix(va4.y, vb4.y), mix(va4.z, vb4.z), mix(va4.w, vb4.w)));
  }
  if (a.t === Tag.OBJECT && a.v instanceof GVector4i) throw new GodotRuntimeError("utility-arg", LERP_FROM_LIST);
  const weight = weightToFloat(w);
  if (sameShape(a, b)) {
    const vec = sameTypeVectorMath("lerp", a, [b, V.float(weight)]);
    if (vec !== null) return vec;
  }
  const listName = a.t === Tag.OBJECT ? vecClassName(a.v as object) : null;
  const aName =
    a.t === Tag.OBJECT
      ? listName === "Vector2" || listName === "Vector3" || listName === "Vector4" || listName === "Color" ? listName : null
      : a.t === Tag.INT ? "int" : a.t === Tag.FLOAT ? "float" : a.t === Tag.BOOL ? "float" : null;
  if (aName === null) throw new GodotRuntimeError("utility-arg", LERP_FROM_LIST);
  if (a.t === Tag.INT || a.t === Tag.FLOAT || a.t === Tag.BOOL) {
    if (b.t !== Tag.INT && b.t !== Tag.FLOAT && b.t !== Tag.BOOL) throw utilConvertError("lerp", b, aName, 2);
    const x = num(a);
    return V.float(x + (num(b) - x) * weight + 0);
  }
  throw utilConvertError("lerp", b, aName, 2);
}

export function gInverseLerp(a: Variant, b: Variant, v: Variant): Variant {
  const aa = utilFloatArg(a, "inverse_lerp", 1);
  const bb = utilFloatArg(b, "inverse_lerp", 2);
  const vv = utilFloatArg(v, "inverse_lerp", 3);
  const den = bb - aa;
  if (den === 0) return V.float((vv - aa) / den);
  return V.float((vv - aa) / den + 0);
}

export function gMoveToward(from: Variant, to: Variant, delta: Variant): Variant {
  const a = utilFloatArg(from, "move_toward", 1);
  const b = utilFloatArg(to, "move_toward", 2);
  const d = utilFloatArg(delta, "move_toward", 3);
  if (Math.abs(b - a) <= d) return V.float(b + 0);
  return V.float(a + (b - a > 0 ? 1 : b - a < 0 ? -1 : 0) * d + 0);
}

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
  if (name === "snapped" && o instanceof GVector2i) return vector2iMethod(o, "snapped", args);
  if (name === "snapped" && o instanceof GVector3i) return vector3iMethod(o, "snapped", args);
  if (o instanceof GColor) return colorMethod(o, name, args);
  return null;
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
  const sx4 = x.t === Tag.OBJECT && x.v instanceof GVector4 ? (x.v as GVector4) : null;
  const st4 = step.t === Tag.OBJECT && step.v instanceof GVector4 ? (step.v as GVector4) : null;
  if (sx4 !== null && st4 !== null) return vector4Method(sx4, "snapped", [step]);
  const sx4i = x.t === Tag.OBJECT && x.v instanceof GVector4i ? (x.v as GVector4i) : null;
  const st4i = step.t === Tag.OBJECT && step.v instanceof GVector4i ? (step.v as GVector4i) : null;
  if (sx4i !== null && st4i !== null) return vector4iMethod(sx4i, "snapped", [step]);
  if (sx4 !== null) throw utilConvertError("snapped", step, "Vector4", 2);
  if (sx4i !== null) throw utilConvertError("snapped", step, "Vector4i", 2);
  vec4UtilityGuard(x, "snapped");
  vec4UtilityGuard(step, "snapped");
  const xName = x.t === Tag.OBJECT ? vecClassName(x.v as object) : null;
  if (xName !== null && xName !== "Color") {
    if (step.t === Tag.OBJECT && vecClassName(step.v as object) === xName) {
      const vec = sameTypeVectorMath("snapped", x, [step]);
      if (vec !== null) return vec;
    }
    throw utilConvertError("snapped", step, xName, 2);
  }
  if (!(x.t === Tag.INT || x.t === Tag.FLOAT || x.t === Tag.BOOL)) throw new GodotRuntimeError("utility-arg", SNAPPED_X_LIST);
  if (!(step.t === Tag.INT || step.t === Tag.FLOAT || step.t === Tag.BOOL)) throw new GodotRuntimeError("utility-arg", SNAPPED_STEP_MUST);
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
  return V.float(utilFloatArg(v, "deg_to_rad", 1) * (PI_D / 180));
}

export function gRadToDeg(v: Variant): Variant {
  return V.float(utilFloatArg(v, "rad_to_deg", 1) * (180 / PI_D));
}

/** 式子是「取差 → 对 TAU 取余 → 折进 [-π, π]」：`angle_difference(6.0, 0.1)` = +0.38318530717959，反过来给负数。 */
export function gAngleDifference(from: Variant, to: Variant): Variant {
  return V.float(angleDiff(utilFloatArg(from, "angle_difference", 1), utilFloatArg(to, "angle_difference", 2)));
}

function approxEq(a: number, b: number): boolean {
  if (a === b) return true;
  const diff = Math.abs(a - b);
  const tol = Math.max(1e-5, 1e-5 * Math.min(Math.abs(a), Math.abs(b)));
  return diff < tol;
}

export function gIsEqualApprox(a: Variant, b: Variant): Variant {
  const x = utilFloatArg(a, "is_equal_approx", 1);
  const y = utilFloatArg(b, "is_equal_approx", 2);
  return V.bool(approxEq(x, y));
}

export function gIsZeroApprox(v: Variant): Variant {
  const x = utilFloatArg(v, "is_zero_approx", 1);
  return V.bool(Number.isFinite(x) && Math.abs(x) < 1e-5);
}

export function gIsNan(v: Variant): Variant {
  return V.bool(Number.isNaN(utilFloatArg(v, "is_nan", 1)));
}

export function gIsInf(v: Variant): Variant {
  const x = utilFloatArg(v, "is_inf", 1);
  return V.bool(x === Infinity || x === -Infinity);
}

export function gIsFinite(v: Variant): Variant {
  return V.bool(Number.isFinite(utilFloatArg(v, "is_finite", 1)));
}

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
  utilIntArg(a, "mini", 1);
  utilIntArg(b, "mini", 2);
  const x = intOf(a);
  const y = intOf(b);
  return vi(x > y ? y : x);
}

export function gMaxI(a: Variant, b: Variant): Variant {
  utilIntArg(a, "maxi", 1);
  utilIntArg(b, "maxi", 2);
  const x = intOf(a);
  const y = intOf(b);
  return vi(x < y ? y : x);
}

export function gMinF(a: Variant, b: Variant): Variant {
  return V.float(Math.min(utilFloatArg(a, "minf", 1), utilFloatArg(b, "minf", 2)) + 0);
}

export function gMaxF(a: Variant, b: Variant): Variant {
  return V.float(Math.max(utilFloatArg(a, "maxf", 1), utilFloatArg(b, "maxf", 2)) + 0);
}

function need2(a: Variant, b: Variant, who: string): void {
  if ((a.t !== Tag.INT && a.t !== Tag.FLOAT) || (b.t !== Tag.INT && b.t !== Tag.FLOAT)) {
    throw new UnsupportedError("math-number", `${who}() 的两个实参都要数值（收到 ${tagName(a.t)} 与 ${tagName(b.t)}）`);
  }
}

function clampTargetName(x: Variant): string {
  if (x.t === Tag.INT) return "int";
  if (x.t === Tag.FLOAT) return "float";
  if (x.t === Tag.BOOL) return "bool";
  if (x.t === Tag.STRING) return "String";
  if (x.t === Tag.STRING_NAME) return "StringName";
  if (x.t === Tag.ARRAY) return "Array";
  if (x.t === Tag.DICT) return "Dictionary";
  if (x.t === Tag.OBJECT) {
    const n = vecClassName(x.v as object);
    if (n !== null) return n;
    if (x.v instanceof GBytes) return packTypeName((x.v as GBytes).kind);
  }
  return valueTypeName(x);
}

function clampAccepts(target: string, y: Variant): boolean {
  if (target === "int" || target === "float") return y.t === Tag.INT || y.t === Tag.FLOAT;
  if (target === "Vector2") return y.t === Tag.OBJECT && y.v instanceof GVector2;
  if (target === "Vector2i") return y.t === Tag.OBJECT && y.v instanceof GVector2i;
  if (target === "Vector3") return y.t === Tag.OBJECT && y.v instanceof GVector3;
  if (target === "Vector3i") return y.t === Tag.OBJECT && y.v instanceof GVector3i;
  if (target === "Color") return y.t === Tag.OBJECT && y.v instanceof GColor;
  if (target === "bool") return y.t === Tag.BOOL;
  if (target === "String") return y.t === Tag.STRING;
  if (target === "StringName") return y.t === Tag.STRING_NAME;
  if (target === "Array") return y.t === Tag.ARRAY;
  if (target === "Dictionary") return y.t === Tag.DICT;
  return valueTypeName(y) === target;
}

export function gClamp(v: Variant, lo: Variant, hi: Variant, mode: RoundMode = "auto"): Variant {
  if (mode === "auto") {
    const target = clampTargetName(v);
    if (!clampAccepts(target, lo)) throw utilConvertError("clamp", lo, target, 2);
    if (!clampAccepts(target, hi)) throw utilConvertError("clamp", hi, target, 3);
  }
  if (mode === "auto" && v.t === Tag.BOOL && lo.t === Tag.BOOL && hi.t === Tag.BOOL) {
    return V.bool(((v.v as boolean) || (lo.v as boolean)) && (hi.v as boolean));
  }
  if (mode === "auto" && v.t === Tag.OBJECT && lo.t === Tag.OBJECT && hi.t === Tag.OBJECT) {
    const g4 = v.v;
    const l4 = lo.v;
    const h4 = hi.v;
    if (g4 instanceof GVector4 && l4 instanceof GVector4 && h4 instanceof GVector4) {
      if (vec4Cmp(g4, l4) < 0) return lo;
      if (vec4Cmp(g4, h4) > 0) return hi;
      return v;
    }
    if (g4 instanceof GVector4i && l4 instanceof GVector4i && h4 instanceof GVector4i) {
      if (vec4Cmp(g4, l4) < 0) return lo;
      if (vec4Cmp(g4, h4) > 0) return hi;
      return v;
    }
  }
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
  if (mode === "float") {
    utilFloatArg(v, "clampf", 1);
    utilFloatArg(lo, "clampf", 2);
    utilFloatArg(hi, "clampf", 3);
  } else if (mode === "int") {
    utilIntArg(v, "clampi", 1);
    utilIntArg(lo, "clampi", 2);
    utilIntArg(hi, "clampi", 3);
  }
  need2(v, lo, "clamp");
  need2(v, hi, "clamp");
  const x = mode === "int" ? intOf(v) : fl(v);
  const mn = mode === "int" ? intOf(lo) : fl(lo);
  const mx = mode === "int" ? intOf(hi) : fl(hi);
  const win = x > mx ? hi : x < mn ? lo : v;
  if (mode === "int") return vi(intOf(win));
  if (mode === "float") return V.float(fl(win));
  if (mode === "auto" && !(x <= x)) return V.float(x);
  return win;
}

export function gSmoothstep(from: Variant, to: Variant, s: Variant): Variant {
  const a = utilFloatArg(from, "smoothstep", 1);
  const b = utilFloatArg(to, "smoothstep", 2);
  const x = utilFloatArg(s, "smoothstep", 3);
  if (approxEq(a, b)) return V.float((a <= b ? (x <= a ? 0.0 : 1.0) : x <= b ? 1.0 : 0.0) + 0);
  const y = Math.min(Math.max((x - a) / (b - a), 0.0), 1.0);
  return V.float(y * y * (3.0 - 2.0 * y) + 0);
}

export function gEase(delta: Variant, curve: Variant): Variant {
  const c = Math.fround(utilFloatArg(curve, "ease", 2));
  let x = Math.fround(utilFloatArg(delta, "ease", 1));
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

export function gCubic(from: Variant, to: Variant, pre: Variant, after: Variant, w: Variant): Variant {
  const p0 = utilFloatArg(from, "cubic_interpolate", 1);
  const p1 = utilFloatArg(to, "cubic_interpolate", 2);
  const p2 = utilFloatArg(pre, "cubic_interpolate", 3);
  const p3 = utilFloatArg(after, "cubic_interpolate", 4);
  const t = utilFloatArg(w, "cubic_interpolate", 5);
  return V.float(cubicNum(p0, p1, p2, p3, t) + 0);
}

export function gRemap(v: Variant, fl0: Variant, fh: Variant, tl: Variant, th: Variant): Variant {
  utilFloatArg(v, "remap", 1);
  utilFloatArg(fl0, "remap", 2);
  utilFloatArg(fh, "remap", 3);
  const a = utilFloatArg(tl, "remap", 4);
  const b = utilFloatArg(th, "remap", 5);
  const t = gInverseLerp(fl0, fh, v).v as number;
  return V.float(a + (b - a) * t + 0);
}

export function gExp(v: Variant): Variant {
  return V.float(Math.exp(utilFloatArg(v, "exp", 1)) + 0);
}

export function gLog(v: Variant): Variant {
  return V.float(Math.log(utilFloatArg(v, "log", 1)) + 0);
}

export function gPow(a: Variant, b: Variant): Variant {
  return V.float(Math.pow(utilFloatArg(a, "pow", 1), utilFloatArg(b, "pow", 2)) + 0);
}

export function gSqrt(v: Variant): Variant {
  return V.float(Math.sqrt(utilFloatArg(v, "sqrt", 1)));
}

export function unsupportedValueDefault(name: string): Variant {
  throw new UnsupportedError("value-default", `${name} 的默认值发不出（D6：那七个值类型不进 Tier 1）`);
}

export function lengthOf(v: Variant): Variant {
  if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) return V.int(strLength(v.v as string));
  if (v.t === Tag.ARRAY) return V.int((v.v as GArray).size());
  if (v.t === Tag.DICT) return V.int((v.v as GDict).size());
  if (v.t === Tag.OBJECT && v.v instanceof GBytes) return V.int((v.v as GBytes).length);
  const tn = v.t === Tag.OBJECT && v.v instanceof Signal ? "Signal" : valueTypeName(v);
  throw new GodotRuntimeError("len", `Error calling GDScript utility function "len()": Value of type '${tn}' can't provide a length.`);
}

/** and / or 是短路的，所以右值延迟求值；两支的值恒为 bool（S398：`1 and 2` 引擎给 `true`，`typeof` 那格给 1）。 */
export function and(l: Variant, right: () => Variant): Variant {
  return truthyOf(l) ? V.bool(truthyOf(right())) : V.bool(false);
}

export function tern(cond: Variant, thenE: () => Variant, elseE: () => Variant): Variant {
  return truthyOf(cond) ? thenE() : elseE();
}

export function or(l: Variant, right: () => Variant): Variant {
  return truthyOf(l) ? V.bool(true) : V.bool(truthyOf(right()));
}

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
    throw new GodotRuntimeError("range-step-zero", `Error calling GDScript utility function "range()": 步长参数为零！`);
  }
  const items: number[] = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) items.push(i);
  } else {
    for (let i = start; i > end; i += step) items.push(i);
  }
  return items;
}

export function range(args: Variant[]): GArray {
  return GArray.of(rangeSeq(args).map((i) => V.int(i)));
}

/** `absf` / `absi`：实测只吃 INT / FLOAT / BOOL（String、StringName、Nil、Array、Vector2 那一格引擎报 Invalid type 并掐掉本次调用，实测 f01–f12）。 */
export function gAbsF(v: Variant): Variant {
  return V.float(Math.abs(utilFloatArg(v, "absf", 1)) + 0);
}

export function gAbsI(v: Variant): Variant {
  utilIntArg(v, "absi", 1);
  const x = intArgBig(v, "absi() 的参数");
  return V.int(x < 0n ? wrap64(-x) : x);
}

function numArg(v: Variant, who: string): number {
  if (v.t === Tag.BOOL) return v.v ? 1 : 0;
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
    throw new GodotRuntimeError("arg-float", `${who} 需要 float，收到 ${tagName(v.t)}`);
  }
  return v.t === Tag.FLOAT ? (v.v as number) : intToNum(v.v as IntPayload);
}

const SIN_LIMIT = 1e6;
const COS_LIMIT = 1e5;
const HALF_PI = Math.PI / 2;

function trig(name: string, v: Variant, f: (x: number) => number, limit: number | null): Variant {
  const x = utilFloatArg(v, name, 1);
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
  const x = utilFloatArg(v, "asin", 1);
  if (x < -1) return V.float(-HALF_PI);
  if (x > 1) return V.float(HALF_PI);
  return V.float(Math.asin(x));
}

export function gAcos(v: Variant): Variant {
  const x = utilFloatArg(v, "acos", 1);
  if (x < -1) return V.float(Math.PI);
  if (x > 1) return V.float(0);
  return V.float(Math.acos(x));
}

export function gAcosh(v: Variant): Variant {
  const x = utilFloatArg(v, "acosh", 1);
  if (x < 1) return V.float(0);
  return V.float(Math.acosh(x));
}

export function gAtanh(v: Variant): Variant {
  const x = utilFloatArg(v, "atanh", 1);
  if (x <= -1) return V.float(-Infinity);
  if (x >= 1) return V.float(Infinity);
  return V.float(Math.atanh(x));
}

export function gAtan2(y: Variant, x: Variant): Variant {
  return V.float(Math.atan2(utilFloatArg(y, "atan2", 1), utilFloatArg(x, "atan2", 2)));
}

const DB_TO_LINEAR_K = 0.11512925464970228420089957273422;
const LINEAR_TO_DB_K = 8.6858896380650365530225783783321;

export function gDbToLinear(v: Variant): Variant {
  return V.float(Math.exp(utilFloatArg(v, "db_to_linear", 1) * DB_TO_LINEAR_K) + 0);
}

export function gLinearToDb(v: Variant): Variant {
  return V.float(Math.log(utilFloatArg(v, "linear_to_db", 1)) * LINEAR_TO_DB_K);
}

export function gPingpong(v: Variant, length: Variant): Variant {
  const value = utilFloatArg(v, "pingpong", 1);
  const l = utilFloatArg(length, "pingpong", 2);
  if (l === 0) return V.float(0);
  const x = (value - l) / (l * 2);
  return V.float(Math.abs((x - Math.floor(x)) * l * 2 - l) + 0);
}

const STEP_THRESHOLDS = [0.9999, 0.09999, 0.009999, 0.0009999, 0.00009999, 0.000009999, 0.0000009999, 0.00000009999, 0.000000009999, 0.0000000009999];

export function gStepDecimals(v: Variant): Variant {
  const x = Math.abs(Math.fround(utilFloatArg(v, "step_decimals", 1)));
  const decs = x - Math.trunc(x);
  let i = 0;
  for (const t of STEP_THRESHOLDS) {
    if (decs >= t) return V.int(i);
    i++;
  }
  return V.int(0);
}

export function gNearestPo2(v: Variant): Variant {
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT && v.t !== Tag.BOOL) {
    throw new GodotRuntimeError("utility-convert", `Invalid type in utility function "nearest_po2()". Cannot convert argument 1 from ${valueTypeName(v)} to int.`);
  }
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
  const a = utilFloatArg(from, "lerp_angle", 1);
  return V.float(a + angleDiff(a, utilFloatArg(to, "lerp_angle", 2)) * utilFloatArg(w, "lerp_angle", 3) + 0);
}

export function gRotateToward(from: Variant, to: Variant, delta: Variant): Variant {
  const a = utilFloatArg(from, "rotate_toward", 1);
  const diff = angleDiff(a, utilFloatArg(to, "rotate_toward", 2));
  const absDiff = Math.abs(diff);
  const d = Math.min(Math.max(utilFloatArg(delta, "rotate_toward", 3), absDiff - PI_D), absDiff);
  return V.float(a + d * (diff >= 0 ? 1 : -1) + 0);
}

export function gBezierInterpolate(s1: Variant, c1: Variant, c2: Variant, e: Variant, t: Variant): Variant {
  const p = utilFloatArg(s1, "bezier_interpolate", 1);
  const a = utilFloatArg(c1, "bezier_interpolate", 2);
  const b = utilFloatArg(c2, "bezier_interpolate", 3);
  const q = utilFloatArg(e, "bezier_interpolate", 4);
  const w = utilFloatArg(t, "bezier_interpolate", 5);
  const omt = 1 - w;
  const omt2 = omt * omt;
  const omt3 = omt2 * omt;
  const t2 = w * w;
  const t3 = t2 * w;
  return V.float(p * omt3 + a * omt2 * w * 3 + b * omt * t2 * 3 + q * t3 + 0);
}

export function gBezierDerivative(s1: Variant, c1: Variant, c2: Variant, e: Variant, t: Variant): Variant {
  const p = utilFloatArg(s1, "bezier_derivative", 1);
  const a = utilFloatArg(c1, "bezier_derivative", 2);
  const b = utilFloatArg(c2, "bezier_derivative", 3);
  const q = utilFloatArg(e, "bezier_derivative", 4);
  const w = utilFloatArg(t, "bezier_derivative", 5);
  const omt = 1 - w;
  const omt2 = omt * omt;
  const t2 = w * w;
  return V.float((a - p) * 3 * omt2 + (b - a) * 6 * omt * w + (q - b) * 3 * t2 + 0);
}

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
  const a = utilFloatArg(from, "cubic_interpolate_angle", 1);
  const r = angleRots(a, utilFloatArg(to, "cubic_interpolate_angle", 2), utilFloatArg(pre, "cubic_interpolate_angle", 3), utilFloatArg(post, "cubic_interpolate_angle", 4));
  return V.float(cubicNum(r[0], r[1], r[2], r[3], utilFloatArg(w, "cubic_interpolate_angle", 5)) + 0);
}

export function gCubicInTime(from: Variant, to: Variant, pre: Variant, post: Variant, w: Variant, toT: Variant, preT: Variant, postT: Variant): Variant {
  return V.float(cubicInTimeNum(
    utilFloatArg(from, "cubic_interpolate_in_time", 1), utilFloatArg(to, "cubic_interpolate_in_time", 2),
    utilFloatArg(pre, "cubic_interpolate_in_time", 3), utilFloatArg(post, "cubic_interpolate_in_time", 4),
    utilFloatArg(w, "cubic_interpolate_in_time", 5), utilFloatArg(toT, "cubic_interpolate_in_time", 6),
    utilFloatArg(preT, "cubic_interpolate_in_time", 7), utilFloatArg(postT, "cubic_interpolate_in_time", 8)) + 0);
}

export function gCubicAngleInTime(from: Variant, to: Variant, pre: Variant, post: Variant, w: Variant, toT: Variant, preT: Variant, postT: Variant): Variant {
  const a = utilFloatArg(from, "cubic_interpolate_angle_in_time", 1);
  const r = angleRots(a, utilFloatArg(to, "cubic_interpolate_angle_in_time", 2), utilFloatArg(pre, "cubic_interpolate_angle_in_time", 3), utilFloatArg(post, "cubic_interpolate_angle_in_time", 4));
  return V.float(cubicInTimeNum(r[0], r[1], r[2], r[3],
    utilFloatArg(w, "cubic_interpolate_angle_in_time", 5), utilFloatArg(toT, "cubic_interpolate_angle_in_time", 6),
    utilFloatArg(preT, "cubic_interpolate_angle_in_time", 7), utilFloatArg(postT, "cubic_interpolate_angle_in_time", 8)) + 0);
}

export function gWrapAny(v: Variant, lo: Variant, hi: Variant): Variant {
  utilFloatArg(v, "wrap", 1);
  utilIntArg(lo, "wrap", 2);
  utilIntArg(hi, "wrap", 3);
  return gWrap(v, lo, hi, v.t === Tag.INT && lo.t === Tag.INT && hi.t === Tag.INT);
}

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

const TYPE_NAMES = ["Nil", "bool", "int", "float", "String", "Vector2", "Vector2i", "Rect2", "Rect2i", "Vector3",
  "Vector3i", "Transform2D", "Vector4", "Vector4i", "Plane", "Quaternion", "AABB", "Basis", "Transform3D",
  "Projection", "Color", "StringName", "NodePath", "RID", "Object", "Callable", "Signal", "Dictionary", "Array",
  "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array",
  "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray", "PackedVector4Array"];

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
  const x = Number(BigInt.asIntN(32, intArgBig(v, who)));
  return x >= 0 && x < names.length ? V.str(names[x] as string) : V.str(fallback);
}

export function gTypeString(v: Variant): Variant {
  return nameById(v, "type_string() 的参数", TYPE_NAMES, "<invalid type>");
}

export function gErrorString(v: Variant): Variant {
  return nameById(v, "error_string() 的参数", ERROR_NAMES, "(invalid error code)");
}

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

function pcgNext(rng: Pcg): number {
  const old = rng.state;
  rng.state = (old * PCG_MUL + (rng.inc | 1n)) & PCG_MASK;
  const xs = Number((((old >> 18n) ^ old) >> 27n) & 0xffffffffn);
  const rot = Number(old >> 59n);
  return ((xs >>> rot) | (xs << ((-rot) & 31))) >>> 0;
}

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

function pcgRandd(rng: Pcg): number {
  const proto = pcgNext(rng);
  if (proto === 0) return 0;
  const hi = BigInt(pcgNext(rng));
  const lo = BigInt(pcgNext(rng));
  const sig = (((hi << 32n) | lo) | 0x8000000000000001n) & PCG_MASK;
  return Number(sig) * Math.pow(2, -64 - pcgClz32(proto));
}

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

/** `Math::rand()` 的原样 32 位输出：`Array.pick_random()` / `shuffle()` 的取模源（S572）。 */
export function randNextUint32(): number {
  bootRand();
  return pcgNext(DEFAULT_RAND);
}

export function gRandf(): Variant {
  bootRand();
  return V.float(Math.fround(pcgNext(DEFAULT_RAND) / 4294967296));
}

export function gRandiRange(from: Variant, to: Variant): Variant {
  utilIntArg(from, "randi_range", 1);
  utilIntArg(to, "randi_range", 2);
  bootRand();
  const a = Number(BigInt.asIntN(32, intArgBig(from, "randi_range() 的第一参")));
  const b = Number(BigInt.asIntN(32, intArgBig(to, "randi_range() 的第二参")));
  if (a === b) return V.int(BigInt(a));
  const bound = Math.abs(a - b) + 1;
  return V.int(BigInt(pcgBounded(DEFAULT_RAND, bound) + Math.min(a, b)));
}

export function gRandfRange(from: Variant, to: Variant): Variant {
  bootRand();
  const a = utilFloatArg(from, "randf_range", 1);
  const b = utilFloatArg(to, "randf_range", 2);
  return V.float(pcgRandd(DEFAULT_RAND) * (b - a) + a);
}

export function gRandfn(mean: Variant, dev: Variant): Variant {
  bootRand();
  const m = utilFloatArg(mean, "randfn", 1);
  const d = utilFloatArg(dev, "randfn", 2);
  let temp = pcgRandd(DEFAULT_RAND);
  if (temp < CMP_EPSILON) temp += CMP_EPSILON;
  return V.float(m + d * (Math.cos(MATH_TAU * pcgRandd(DEFAULT_RAND)) * Math.sqrt(-2.0 * Math.log(temp))));
}

export function gIsInstanceValid(v: Variant): Variant {
  if (v.t !== Tag.OBJECT) return V.bool(false);
  const inner = v.v;
  if (isNullRefValue(inner) || isCallableBox(inner) || inner instanceof Signal) return V.bool(false);
  return V.bool(
    inner instanceof GdScriptObject || inner instanceof ClassDesc || inner instanceof GdNativeClass || isWeakRefBox(inner),
  );
}

export function gInstanceFromId(v: Variant): Variant {
  const live = liveObjectOf(Number(BigInt.asIntN(64, intArgBig(v, "instance_from_id() 的实参"))));
  return live === null ? V.object(NULL_OBJECT) : V.object(live);
}

export function gIsInstanceIdValid(v: Variant): Variant {
  return V.bool(liveObjectOf(Number(BigInt.asIntN(64, intArgBig(v, "is_instance_id_valid() 的实参")))) !== null);
}

export function gWeakref(v: Variant): Variant {
  if (v.t === Tag.NIL) return V.object(weakRefBox(null));
  if (!gIsInstanceValid(v).v) {
    throw new UnsupportedError("weakref-arg", `weakref() 只量过对象与 null（收到 ${tagName(v.t)}）`);
  }
  return V.object(weakRefBox(v));
}

function utilityArgLabel(v: Variant): string {
  return v.t === Tag.NIL ? "Nil" : valueTypeName(v);
}

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
    case "Vector4":
      return V.object(new GVector4(0, 0, 0, 0));
    case "Vector4i":
      return V.object(new GVector4i(0, 0, 0, 0));
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
    case "PackedVector4Array":
      return V.object(new GBytes([], "vector4"));
    default:
      throw new UnsupportedError(
        "inst-to-dict-acc-type",
        `inst_to_dict() 里 ${t} 类型的 get/set 属性没量过出门值（S269 ④ 量齐的是十六种形状），不猜`,
      );
  }
}

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
    const declared = acc[name] as string | null | undefined;
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
