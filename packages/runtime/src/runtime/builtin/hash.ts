import { GodotRuntimeError, UnsupportedError } from "../errors";
import { Tag, V, intToBig, tagName, type IntPayload, type Variant } from "../tags";
import { GArray, GDict } from "../values";
import { GBytes } from "../packed";
import { CallableBox, isCallableBox, isNullCallable } from "../callable";
import { Signal } from "../signal";
import { GdRid } from "../rid";
import { GdNodePath } from "../node-path";
import { GVector2, vector2 } from "../vector2";
import { GVector2i } from "../vector2i";
import { GRect2, GRect2i } from "../rect-classes";
import { GVector3, vector3 } from "../vector3";
import { GVector3i } from "../vector3i";
import { GVector4, vector4 } from "../vector4";
import { GVector4i } from "../vector4i";
import { GColor } from "../color";
import { MASK64 } from "./args";

export function hashDjb2(s: string): number {
  let h = 5381;
  for (const ch of s) h = (h * 33 + (ch.codePointAt(0) as number)) % 4294967296;
  return h;
}

const GD_TYPE = { DICTIONARY: 27, ARRAY: 28 } as const;

const MURMUR_SEED = 0x7f07c65;

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

function murmurOne32(pIn: number, pSeed: number): number {
  let k = Math.imul(pIn >>> 0, 0xcc9e2d51) >>> 0;
  k = ((k << 15) | (k >>> 17)) >>> 0;
  k = Math.imul(k, 0x1b873593) >>> 0;
  let s = (pSeed ^ k) >>> 0;
  s = ((s << 13) | (s >>> 19)) >>> 0;
  return (Math.imul(s, 5) + 0xe6546b64) >>> 0;
}

export function fmix32(h: number): number {
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

export function nodePathHash(p: GdNodePath): number {
  if (p.empty) return 0;
  const h1 = hashDjb2(p.names.join("/"));
  const h2 = hashDjb2(p.subnames.join(":"));
  const h = hashOneUint64((BigInt(h1) << 32n) | BigInt(h2));
  return p.absolute ? h : ~h >>> 0;
}

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
      if (v.v instanceof GRect2) return fmix32(hashFloat32(v.v.h, hashFloat32(v.v.w, hashFloat32(v.v.y, hashFloat32(v.v.x, MURMUR_SEED)))));
      if (v.v instanceof GRect2i) return fmix32(murmurOne32(v.v.h >>> 0, murmurOne32(v.v.w >>> 0, murmurOne32(v.v.y >>> 0, murmurOne32(v.v.x >>> 0, MURMUR_SEED)))));
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
