import { UnsupportedError } from "./errors";
import { Tag, V, type Variant } from "./tags";
import { GArray, GDict, type ElemKind } from "./values";
import { GBytes, type PackElem, type PackKind } from "./packed";
import { GVector2 } from "./vector2";
import { GVector3 } from "./vector3";
import { GVector4 } from "./vector4";
import { GVector4i } from "./vector4i";
import { GVector2i } from "./vector2i";
import { GVector3i } from "./vector3i";
import { GColor } from "./color";
import { GdNodePath } from "./node-path";
import { beginBareConstruction, descOf, dictDescOf, endBareConstruction, GdScriptObject, nativeBaseOf } from "./object";
import { encodedObjectIdBox, NULL_OBJECT } from "./identity";
import { CallableBox, nullCallable } from "./callable";
import { GdRid, rid } from "./rid";
import { ENGINE_CLASS_NAMES } from "./engine-classes";

const FLAG_WIDE = 1;

const T_NIL = 0;
const T_BOOL = 1;
const T_INT = 2;
const T_FLOAT = 3;
const T_STRING = 4;
const T_VECTOR2 = 5;
const T_VECTOR2I = 6;
const T_VECTOR3 = 9;
const T_COLOR = 20;
const T_STRING_NAME = 21;
const T_DICTIONARY = 27;
const T_ARRAY = 28;
const T_PACKED_BYTE_ARRAY = 29;
const T_PACKED_FLOAT64_ARRAY = 33;
const VARIANT_MAX = 39;
const T_NODE_PATH = 22;
const T_PACKED_I32 = 30;
const T_PACKED_I64 = 31;
const T_PACKED_F32 = 32;
const T_PACKED_STR = 34;
const T_PACKED_V2 = 35;
const T_PACKED_V3 = 36;
const T_PACKED_V4 = 38;
const T_PACKED_COLOR = 37;
const T_VECTOR3I = 10;
const T_VECTOR4 = 12;
const T_VECTOR4I = 13;
const T_OBJECT = 24;
const T_RID = 23;
const T_CALLABLE = 25;

const CODE_NO_SCRIPT_PATH = "var-to-bytes-no-script-path";
const CODE_CANNOT_BUILD = "bytes-to-var-object-class";

const PACK_TYPE_CODE: Record<PackKind, number> = {
  byte: T_PACKED_BYTE_ARRAY,
  int32: T_PACKED_I32,
  int64: T_PACKED_I64,
  float32: T_PACKED_F32,
  float64: T_PACKED_FLOAT64_ARRAY,
  string: T_PACKED_STR,
  vector2: T_PACKED_V2,
  vector3: T_PACKED_V3,
  vector4: T_PACKED_V4,
  color: T_PACKED_COLOR,
};

const CODE_PACK: Record<number, PackKind> = {};
for (const k of Object.keys(PACK_TYPE_CODE) as PackKind[]) CODE_PACK[PACK_TYPE_CODE[k]] = k;

const ELEM_TYPE: Record<ElemKind, number> = {
  bool: 1,
  int: 2,
  float: 3,
  String: 4,
  Vector2: 5,
  Vector2i: 6,
  Vector3: 9,
  Vector3i: 10,
  Vector4: 12,
  Vector4i: 13,
  Color: 20,
  StringName: 21,
  Dictionary: 27,
  Array: 28,
  Object: 24,
};

const TYPE_ELEM: Record<number, ElemKind> = {};
for (const k of Object.keys(ELEM_TYPE) as ElemKind[]) TYPE_ELEM[ELEM_TYPE[k]] = k;

function elemCode(kind: ElemKind): number {
  const c = ELEM_TYPE[kind];
  if (c === undefined) throw new UnsupportedError("var-to-bytes-elemkind", `var_to_bytes() 的容器元素标注 ${String(kind)} 不在量过的类型码表里，响亮拒`);
  return c;
}

function elemKindOf(code: number): ElemKind {
  const k = TYPE_ELEM[code & 0xff];
  if (k === undefined) throw new UnsupportedError("bytes-to-var-elemkind", `bytes_to_var() 读到没量过的容器元素类型码 ${String(code)}`);
  return k;
}

const SCRATCH = new DataView(new ArrayBuffer(8));
const U64 = 18446744073709551616n;
const U32 = 4294967296n;

/** 回绕只做取模与加法：bigint 的位运算在静态目标上没有 lowering（SC1043）。纯函数。 */
function u64Mask(x: bigint): bigint {
  return ((x % U64) + U64) % U64;
}

function low32(x: bigint): number {
  return Number(((x % U32) + U32) % U32);
}

/** float32 的四个字节：符号位照 IEEE 写（实测 `-z` 那一支给 `0,0,0,128`，`0.0` 给全零）。纯函数。 */
function float32Bits(x: number): number {
  SCRATCH.setFloat32(0, x, true);
  return SCRATCH.getUint32(0, true);
}

function bitsToFloat32(b: number): number {
  SCRATCH.setUint32(0, b >>> 0, true);
  return SCRATCH.getFloat32(0, true);
}

function float64Bits(x: number): bigint {
  SCRATCH.setFloat64(0, x, true);
  return SCRATCH.getBigUint64(0, true);
}

function bitsToFloat64(b: bigint): number {
  SCRATCH.setBigUint64(0, b, true);
  return SCRATCH.getFloat64(0, true);
}

function utf8(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; ) {
    const cp = s.codePointAt(i) as number;
    i += cp > 0xffff ? 2 : 1;
    if (cp < 0x80) out.push(cp);
    else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    else if (cp < 0x10000) out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    else out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
  }
  return out;
}

function fromUtf8(bytes: number[]): string {
  let s = "";
  for (let i = 0; i < bytes.length; ) {
    const b0 = bytes[i] as number;
    let cp = 0;
    let n = 1;
    if (b0 < 0x80) {
      cp = b0;
    } else if (b0 < 0xe0) {
      cp = ((b0 & 0x1f) << 6) | ((bytes[i + 1] as number) & 0x3f);
      n = 2;
    } else if (b0 < 0xf0) {
      cp = ((b0 & 0x0f) << 12) | (((bytes[i + 1] as number) & 0x3f) << 6) | ((bytes[i + 2] as number) & 0x3f);
      n = 3;
    } else {
      cp =
        ((b0 & 0x07) << 18) |
        (((bytes[i + 1] as number) & 0x3f) << 12) |
        (((bytes[i + 2] as number) & 0x3f) << 6) |
        ((bytes[i + 3] as number) & 0x3f);
      n = 4;
    }
    if (n > 1 && (bytes[i + 1] as number) < 0x80) {
      throw new UnsupportedError("bytes-to-var-utf8", `bytes_to_var() 收到不合式的 UTF-8（第 ${String(i)} 字节 0x${(bytes[i] as number).toString(16)} 后面的续字节没到位）—— 这一形没量过，不猜`);
    }
    s += String.fromCodePoint(cp);
    i += n;
  }
  return s;
}

function refuseUnmeasured(v: Variant): void {
  if (v.t !== Tag.OBJECT) return;
  const o = v.v;
  if (
    o instanceof GVector2 ||
    o instanceof GVector3 ||
    o instanceof GVector2i ||
    o instanceof GVector3i ||
    o instanceof GVector4 ||
    o instanceof GVector4i ||
    o instanceof GColor ||
    o instanceof GBytes ||
    o instanceof GdNodePath ||
    o instanceof GdScriptObject ||
    o instanceof CallableBox ||
    o instanceof GdRid
  ) {
    return;
  }
  const name = typeof o === "object" && o !== null ? (o as object).constructor.name : String(o);
  throw new UnsupportedError("var-to-bytes-object", `var_to_bytes() 收到 ${name}：Signal 那一支量过了（尺 tmp/probe709/bytes.mts），编码里带对象的实例号，合成号对不上引擎那句，按红线响亮拒`);
}

class Writer {
  readonly bytes: number[] = [];

  constructor(readonly allowObjects: boolean = false) {}

  u32(x: number): void {
    const v = x >>> 0;
    this.bytes.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  }

  u64(x: bigint): void {
    SCRATCH.setBigUint64(0, u64Mask(x), true);
    for (let k = 0; k < 8; k++) this.bytes.push(SCRATCH.getUint8(k));
  }

  f32(x: number): void {
    this.u32(float32Bits(x));
  }

  f64(x: number): void {
    this.u64(float64Bits(x));
  }

  /** 头部：类型在最低字节，`1 << 16` 是实测到的「宽payload」位。 */
  header(type: number, wide = false): void {
    this.u32((type & 0xff) | (wide ? FLAG_WIDE << 16 : 0));
  }

  str(s: string): void {
    const b = utf8(s);
    this.u32(b.length);
    this.bytes.push(...b);
    while (this.bytes.length % 4 !== 0) this.bytes.push(0);
  }

  strPacked(s: string): void {
    const b = utf8(s);
    this.u32(b.length + 1);
    this.bytes.push(...b);
    while (this.bytes.length % 4 !== 0) this.bytes.push(0);
  }

  packElem(kind: PackKind, e: PackElem): void {
    switch (kind) {
      case "byte":
        this.bytes.push(Number(e) & 0xff);
        return;
      case "int32":
        this.u32(Number(e));
        return;
      case "int64":
        this.u64(typeof e === "bigint" ? e : BigInt(Number(e)));
        return;
      case "float32":
        this.f32(Number(e));
        return;
      case "float64":
        this.f64(Number(e));
        return;
      case "string":
        this.strPacked(typeof e === "string" ? e : "");
        return;
      case "vector2":
        this.f32((e as GVector2).x);
        this.f32((e as GVector2).y);
        return;
      case "vector3":
        this.f32((e as GVector3).x);
        this.f32((e as GVector3).y);
        this.f32((e as GVector3).z);
        return;
      case "vector4":
        this.f32((e as GVector4).x);
        this.f32((e as GVector4).y);
        this.f32((e as GVector4).z);
        this.f32((e as GVector4).w);
        return;
      case "color":
        this.f32((e as GColor).r);
        this.f32((e as GColor).g);
        this.f32((e as GColor).b);
        this.f32((e as GColor).a);
        return;
    }
  }

  objectEntry(o: GdScriptObject): void {
    const desc = descOf(o);
    if (desc === null || desc.dictResPath === null || desc.dictClassPath !== "") {
      throw new UnsupportedError(CODE_NO_SCRIPT_PATH, "这一支拿不出可上线的脚本路径");
    }
    const base = nativeBaseOf(o);
    if (base !== "RefCounted") {
      throw new UnsupportedError("var-to-bytes-object-class", `var_to_bytes_with_objects() 只量过宿主基类 RefCounted 的实例（收到 ${String(base)}）：表里的类名与属性没实测，响亮拒`);
    }
    this.header(T_OBJECT);
    this.str(base);
    this.u32(1);
    this.str("script");
    this.header(T_STRING);
    this.str(desc.dictResPath);
  }

  variant(v: Variant): void {
    refuseUnmeasured(v);
    switch (v.t) {
      case Tag.NIL:
        this.header(T_NIL);
        return;
      case Tag.BOOL:
        this.header(T_BOOL);
        this.u32(v.v as boolean ? 1 : 0);
        return;
      case Tag.INT: {
        const big = typeof v.v === "bigint" ? v.v : BigInt(Math.trunc(v.v as number));
        if (big >= -2147483648n && big <= 2147483647n) {
          this.header(T_INT);
          this.u32(low32(big));
        } else {
          this.header(T_INT, true);
          this.u64(big);
        }
        return;
      }
      case Tag.FLOAT: {
        const f = v.v as number;
        if (bitsToFloat32(float32Bits(f)) === f) {
          this.header(T_FLOAT);
          this.f32(f);
        } else {
          this.header(T_FLOAT, true);
          this.f64(f);
        }
        return;
      }
      case Tag.STRING:
        this.header(T_STRING);
        this.str(v.v as string);
        return;
      case Tag.STRING_NAME:
        this.header(T_STRING_NAME);
        this.str(v.v as string);
        return;
      case Tag.ARRAY: {
        const a = v.v as GArray;
        const items = a.raw();
        const kind = a.elemKind();
        if (a.classNamed() !== "") {
          this.u32(T_ARRAY | (2 << 16));
          this.str("EncodedObjectAsID");
          this.u32(items.length);
          for (const e of items) this.variant(e);
          return;
        }
        this.header(T_ARRAY, kind !== null);
        if (kind !== null) this.u32(elemCode(kind));
        this.u32(items.length);
        for (const e of items) this.variant(e);
        return;
      }
      case Tag.DICT: {
        const d = v.v as GDict;
        if (d.keyKind === null && d.valKind !== null) {
          throw new UnsupportedError("var-to-bytes-typed", "var_to_bytes() 收到「只有值类型」的字典：引擎那侧的头部位（键 1、值 4）没量过这一形，响亮拒");
        }
        const ks = d.keys();
        const vs = d.values();
        this.u32(T_DICTIONARY | ((d.keyKind !== null ? (d.valKind !== null ? 5 : 1) : 0) << 16));
        if (d.keyKind !== null) this.u32(elemCode(d.keyKind));
        if (d.valKind !== null) this.u32(elemCode(d.valKind));
        this.u32(ks.length);
        for (let i = 0; i < ks.length; i++) {
          this.variant(ks[i] as Variant);
          this.variant(vs[i] as Variant);
        }
        return;
      }
      case Tag.OBJECT: {
        const o = v.v;
        if (o instanceof GVector2) {
          this.header(T_VECTOR2);
          this.f32(o.x);
          this.f32(o.y);
          return;
        }
        if (o instanceof GVector3) {
          this.header(T_VECTOR3);
          this.f32(o.x);
          this.f32(o.y);
          this.f32(o.z);
          return;
        }
        if (o instanceof GVector2i) {
          this.header(T_VECTOR2I);
          this.u32(o.x);
          this.u32(o.y);
          return;
        }
        if (o instanceof GVector3i) {
          this.header(T_VECTOR3I);
          this.u32(o.x);
          this.u32(o.y);
          this.u32(o.z);
          return;
        }
        if (o instanceof GVector4) {
          this.header(T_VECTOR4);
          this.f32(o.x);
          this.f32(o.y);
          this.f32(o.z);
          this.f32(o.w);
          return;
        }
        if (o instanceof GVector4i) {
          this.header(T_VECTOR4I);
          this.u32(o.x);
          this.u32(o.y);
          this.u32(o.z);
          this.u32(o.w);
          return;
        }
        if (o instanceof GColor) {
          this.header(T_COLOR);
          this.f32(o.r);
          this.f32(o.g);
          this.f32(o.b);
          this.f32(o.a);
          return;
        }
        if (o instanceof GBytes) {
          const items = o.raw();
          this.header(PACK_TYPE_CODE[o.kind]);
          this.u32(items.length);
          for (const e of items) this.packElem(o.kind, e);
          if (o.kind === "byte") while (this.bytes.length % 4 !== 0) this.bytes.push(0);
          return;
        }
        if (o instanceof GdNodePath) {
          this.header(T_NODE_PATH);
          this.u32(0x80000000 | o.names.length);
          this.u32(o.subnames.length);
          this.u32(o.absolute ? 1 : 0);
          for (const n of o.names) this.str(n);
          for (const n of o.subnames) this.str(n);
          return;
        }
        if (o instanceof CallableBox) {
          this.header(T_CALLABLE);
          return;
        }
        if (o instanceof GdRid) {
          this.header(T_RID);
          this.u64(typeof o.id === "bigint" ? o.id : BigInt(o.id as number));
          return;
        }
        if (o instanceof GdScriptObject) {
          if (this.allowObjects) {
            this.objectEntry(o);
            return;
          }
          this.header(T_OBJECT, true);
          this.u64(BigInt(o.gdObjectId));
          return;
        }
        throw new UnsupportedError("var-to-bytes-object", "var_to_bytes() 的这一支没量过，响亮拒");
      }
    }
  }
}

export function gVarToBytes(v: Variant): Variant {
  const w = new Writer();
  w.variant(v);
  return V.object(GBytes.of(w.bytes, "byte"));
}

export function gVarToBytesWithObjects(v: Variant): Variant {
  const w = new Writer(true);
  try {
    w.variant(v);
  } catch (e) {
    if (e instanceof UnsupportedError && e.code === CODE_NO_SCRIPT_PATH) return V.object(GBytes.of([], "byte"));
    throw e;
  }
  return V.object(GBytes.of(w.bytes, "byte"));
}

class Reader {
  i = 0;

  constructor(readonly b: readonly number[], readonly allowObjects: boolean = false) {}

  get left(): number {
    return this.b.length - this.i;
  }

  need(n: number): void {
    if (this.left < n) throw new UnsupportedError("bytes-to-var-truncated", "截了");
  }

  u32(): number {
    this.need(4);
    const o = this.i;
    this.i += 4;
    return (this.b[o] as number) | ((this.b[o + 1] as number) << 8) | ((this.b[o + 2] as number) << 16) | ((this.b[o + 3] as number) * 0x1000000);
  }

  u64(): bigint {
    this.need(8);
    for (let k = 0; k < 8; k++) SCRATCH.setUint8(k, this.b[this.i + k] as number);
    this.i += 8;
    return SCRATCH.getBigInt64(0, true);
  }

  f32(): number {
    return bitsToFloat32(this.u32() >>> 0);
  }

  i32(): number {
    const u = this.u32() >>> 0;
    return u >= 0x80000000 ? u - 0x100000000 : u;
  }

  f64(): number {
    return bitsToFloat64(this.u64());
  }

  str(): string {
    const n = this.u32();
    const pad = n + ((4 - (n % 4)) % 4);
    this.need(pad);
    const slice = this.b.slice(this.i, this.i + n);
    this.i += pad;
    return fromUtf8(slice);
  }

  strPacked(): string {
    const n = this.u32() - 1;
    const pad = n + ((4 - (n % 4)) % 4);
    this.need(pad);
    const slice = this.b.slice(this.i, this.i + n);
    this.i += pad;
    return fromUtf8(slice);
  }

  packElem(kind: PackKind): PackElem {
    switch (kind) {
      case "byte":
        return this.b[this.i++] as number;
      case "int32":
        return this.i32();
      case "int64":
        return this.u64();
      case "float32":
        return this.f32();
      case "float64":
        return this.f64();
      case "string":
        return this.strPacked();
      case "vector2": {
        const x = this.f32();
        const y = this.f32();
        return new GVector2(x, y);
      }
      case "vector3": {
        const x = this.f32();
        const y = this.f32();
        const z = this.f32();
        return new GVector3(x, y, z);
      }
      case "vector4": {
        const x = this.f32();
        const y = this.f32();
        const z = this.f32();
        const w = this.f32();
        return new GVector4(x, y, z, w);
      }
      case "color": {
        const r = this.f32();
        const g = this.f32();
        const b = this.f32();
        const a = this.f32();
        return new GColor(r, g, b, a);
      }
    }
  }

  objectEntry(): Variant {
    const cls = this.str();
    const n = this.u32();
    const names: string[] = [];
    const values: Variant[] = [];
    for (let k = 0; k < n; k++) {
      names.push(this.str());
      values.push(this.variant());
    }
    return builtObject(cls, names, values);
  }

  variant(): Variant {
    if (this.left < 4) throw new UnsupportedError("bytes-to-var-truncated", "截了");
    const h = this.u32() >>> 0;
    const type = h & 0xff;
    const flags = (h >>> 16) & 0xff;
    switch (type) {
      case T_NIL:
        return V.nil();
      case T_BOOL:
        return V.bool(this.u32() !== 0);
      case T_INT: {
        if ((flags & FLAG_WIDE) !== 0) return V.int(this.u64());
        const u = this.u32() >>> 0;
        return V.int(u >= 0x80000000 ? u - 0x100000000 : u);
      }
      case T_FLOAT:
        return V.float((flags & FLAG_WIDE) !== 0 ? this.f64() : this.f32());
      case T_STRING:
        return V.str(this.str());
      case T_STRING_NAME:
        return V.stringName(this.str());
      case T_VECTOR2: {
        const x = this.f32();
        const y = this.f32();
        return V.object(new GVector2(x, y));
      }
      case T_VECTOR2I: {
        const x = this.i32();
        const y = this.i32();
        return V.object(new GVector2i(x, y));
      }
      case T_VECTOR3I: {
        const x = this.i32();
        const y = this.i32();
        const z = this.i32();
        return V.object(new GVector3i(x, y, z));
      }
      case T_VECTOR3: {
        const x = this.f32();
        const y = this.f32();
        const z = this.f32();
        return V.object(new GVector3(x, y, z));
      }
      case T_VECTOR4: {
        const x = this.f32();
        const y = this.f32();
        const z = this.f32();
        const w = this.f32();
        return V.object(new GVector4(x, y, z, w));
      }
      case T_VECTOR4I: {
        const x = this.i32();
        const y = this.i32();
        const z = this.i32();
        const w = this.i32();
        return V.object(new GVector4i(x, y, z, w));
      }
      case T_COLOR: {
        const r = this.f32();
        const g = this.f32();
        const b = this.f32();
        const a = this.f32();
        return V.object(new GColor(r, g, b, a));
      }
      case T_ARRAY: {
        if ((flags & 2) !== 0) {
          const cls = this.str();
          const cn = this.u32();
          const citems: Variant[] = [];
          for (let k = 0; k < cn; k++) citems.push(this.variant());
          const carr = GArray.of(citems);
          carr.stampElem("Object");
          carr.className = cls;
          return V.array(carr);
        }
        const kind = (flags & FLAG_WIDE) !== 0 ? elemKindOf(this.u32()) : null;
        const n = this.u32();
        const items: Variant[] = [];
        for (let k = 0; k < n; k++) items.push(this.variant());
        const arr = GArray.of(items);
        if (kind !== null) arr.stampElem(kind);
        return V.array(arr);
      }
      case T_DICTIONARY: {
        const keyKind = (flags & 1) !== 0 ? elemKindOf(this.u32()) : null;
        const valKind = (flags & 4) !== 0 ? elemKindOf(this.u32()) : null;
        const n = this.u32();
        const d = new GDict();
        if (keyKind !== null && valKind !== null) d.stampElem(keyKind, valKind);
        for (let k = 0; k < n; k++) {
          const key = this.variant();
          d.set(key, this.variant());
        }
        return V.dict(d);
      }
      case T_OBJECT: {
        if ((flags & FLAG_WIDE) !== 0) return V.object(encodedObjectIdBox(this.u64()));
        if (!this.allowObjects) throw new UnsupportedError("bytes-to-var-object", "对象表那一支要的是 bytes_to_var_with_objects()");
        return this.objectEntry();
      }
      case T_RID:
        return rid(this.u64());
      case T_CALLABLE:
        return nullCallable();
      case T_NODE_PATH: {
        const names = (this.u32() >>> 0) & 0x7fffffff;
        const subs = this.u32();
        const absolute = this.u32() !== 0;
        const ns: string[] = [];
        const ss: string[] = [];
        for (let k = 0; k < names; k++) ns.push(this.str());
        for (let k = 0; k < subs; k++) ss.push(this.str());
        return V.object(new GdNodePath(absolute, ns, ss, names === 0 && subs === 0 && !absolute));
      }
      default: {
        const kind = CODE_PACK[type];
        if (kind === undefined) throw new UnsupportedError("bytes-to-var-type", `bytes_to_var() 读到没量过的类型码 ${String(type)}`);
        const n = this.u32();
        const items: PackElem[] = [];
        for (let k = 0; k < n; k++) items.push(this.packElem(kind));
        if (kind === "byte") this.i += (4 - (this.i % 4)) % 4;
        return V.object(GBytes.of(items, kind));
      }
    }
  }
}

function builtObject(cls: string, names: string[], values: Variant[]): Variant {
  if (cls === "") return V.object(NULL_OBJECT);
  if (!ENGINE_CLASS_NAMES.has(cls)) return V.nil();
  let script: Variant | null = null;
  for (let k = 0; k < names.length; k++) {
    if (names[k] === "script") script = values[k] as Variant;
  }
  if (script === null || script.t !== Tag.STRING) {
    throw new UnsupportedError(CODE_CANNOT_BUILD, `bytes_to_var_with_objects() 读到宿主类 ${cls} 的条目：Tier 1 造不出宿主实例，响亮拒`);
  }
  if (names.length !== 1) {
    throw new UnsupportedError("bytes-to-var-object-prop", `bytes_to_var_with_objects() 读到 ${cls} 带 ${String(names.length)} 格属性的条目：除 script 之外那几格怎么落没量过，响亮拒`);
  }
  const desc = dictDescOf(script.v as string, "");
  if (desc === null) return V.nil();
  beginBareConstruction();
  let inst: object;
  try {
    inst = desc.make([]);
  } finally {
    endBareConstruction();
  }
  return V.object(inst);
}

const LOUD_WITH_OBJECTS: ReadonlySet<string> = new Set([CODE_CANNOT_BUILD, "bytes-to-var-object-prop", "bytes-to-var-elemkind"]);
const LOUD_NONE: ReadonlySet<string> = new Set<string>([]);

function readBytes(v: Variant, allowObjects: boolean, loud: ReadonlySet<string>): Variant {
  if (v.t !== Tag.OBJECT || !(v.v instanceof GBytes)) {
    throw new UnsupportedError("bytes-to-var-arg", `bytes_to_var() 的第一参要的是 PackedByteArray（收到的是别的东西），这一形没量过`);
  }
  const bytes = (v.v as GBytes).raw().map((x) => Number(x) & 0xff);
  const r = new Reader(bytes, allowObjects);
  try {
    return r.variant();
  } catch (e) {
    if (e instanceof UnsupportedError && loud.has(e.code)) throw e;
    return V.nil();
  }
}

/** `bytes_to_var(字节)`：读不通就按实测那几格给 `<null>`（坏头部、截断、类型码越界三形都量过是 NIL，不抛）。 */
export function gBytesToVar(v: Variant): Variant {
  return readBytes(v, false, LOUD_NONE);
}

/** `bytes_to_var_with_objects(字节)`：同一条解码器，只是开了对象表那一支（S284 ②）。 */
export function gBytesToVarWithObjects(v: Variant): Variant {
  return readBytes(v, true, LOUD_WITH_OBJECTS);
}

/** `PackedByteArray.decode_var` 那一族（S552）：从 offset 起解一个 Variant，交值与消费字节数；
 *  剩余不足 4 字节那一形给 `{ short: true }`（引擎在 marshalls 打一块 len<4），其余读不通给 null。 */
export function gVarDecodeAt(v: Variant, offset: number, allowObjects: boolean): { value: Variant; size: number } | { short: true } | null {
  if (v.t !== Tag.OBJECT || !(v.v instanceof GBytes)) {
    throw new UnsupportedError("bytes-to-var-arg", `decode_var() 的接收者要的是 PackedByteArray（收到的是别的东西），这一形没量过`);
  }
  const all = (v.v as GBytes).raw().map((x) => Number(x) & 0xff);
  if (offset > all.length - 4) return { short: true };
  const r = new Reader(all.slice(offset), allowObjects);
  try {
    const value = r.variant();
    return { value, size: r.i };
  } catch (e) {
    if (e instanceof UnsupportedError && (allowObjects ? LOUD_WITH_OBJECTS : LOUD_NONE).has(e.code)) throw e;
    return null;
  }
}
