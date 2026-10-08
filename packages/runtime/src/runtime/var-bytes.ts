import { UnsupportedError } from "./errors";
import { Tag, V, type Variant } from "./tags";
import { GArray, GDict } from "./values";
import { GBytes } from "./packed";
import { GVector2 } from "./vector2";
import { GVector3 } from "./vector3";
import { GVector2i } from "./vector2i";
import { GColor } from "./color";

/** 引擎 `VariantWriter::encode` 的头部标志：实测到的只有 `1 << 16`（int64 / double / 定型数组都挂它）。 */
const FLAG_WIDE = 1;

/** 实测过的类型码（S224 那张表）：只对得上数的那几支开，其余一律响亮拒。 */
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
/** 实测 `bytes_to_var` 的 `(header & 0xFF) >= VARIANT_MAX` 判据：引擎那句给的是 39 那一格。 */
const VARIANT_MAX = 39;

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

function float32Bits(x: number): number {
  // 实测：`var_to_bytes(-0.0)` 的四个字节是全零（语料 274 的 t29），引擎在这一支把负零的号丢掉。
  SCRATCH.setFloat32(0, x === 0 ? 0 : x, true);
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

/** Godot 的字符串上线是 UTF-8（实测 `héllo` 六个字节、`😀` 四个），这里自己走码点，不碰 TextEncoder。 */
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

/** 一个值能不能编：把没量过的形状在这里一次拦清，别让它们流进式子里。 */
function refuseUnmeasured(v: Variant): void {
  if (v.t === Tag.OBJECT) {
    const o = v.v;
    if (o instanceof GBytes && o.kind !== "byte" && o.kind !== "float64") {
      throw new UnsupportedError("var-to-bytes-pack", `var_to_bytes() 只量过 PackedByteArray 与 PackedFloat64Array 两支 pack（收到 ${o.kind}），其余 pack 的字节布局没实测过，不发`);
    }
    if (!(o instanceof GVector2) && !(o instanceof GVector3) && !(o instanceof GVector2i) && !(o instanceof GColor) && !(o instanceof GBytes)) {
      throw new UnsupportedError("var-to-bytes-object", `var_to_bytes() 的这一支还没量过（收到 ${typeof o === "object" && o !== null ? (o as object).constructor.name : String(o)}）：对象、RID、NodePath、Callable、Signal 与 Vector3i 的编码都没实测，按红线响亮拒`);
    }
    return;
  }
  if (v.t === Tag.FLOAT && Number.isNaN(v.v as number)) {
    throw new UnsupportedError("var-to-bytes-nan", "var_to_bytes() 收到 NaN：引擎那侧头部另挂一位标志，那一格没量过，不猜");
  }
}

class Writer {
  readonly bytes: number[] = [];

  u32(x: number): void {
    const v = x >>> 0;
    this.bytes.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  }

  /** 静态目标上 bigint 只做得加减乘除（`>>=` 是 SC1043），所以走 DataView 取字节。 */
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

  /** 字符串上线形状：UTF-8 字节数（不含填充）+ 补零到 4 的倍数。 */
  str(s: string): void {
    const b = utf8(s);
    this.u32(b.length);
    this.bytes.push(...b);
    while (this.bytes.length % 4 !== 0) this.bytes.push(0);
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
        // 静态目标不比对 `unknown`：先收到 number 格子里（SC1043）。
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
        if (a.elemKind() !== null) {
          throw new UnsupportedError("var-to-bytes-typed", "var_to_bytes() 收到定型数组：头部要再挂一枚 typed_flags（读数记在 §6 第 29 条），实现还没接，响亮拒");
        }
        const items = a.raw();
        this.header(T_ARRAY);
        this.u32(items.length);
        for (const e of items) this.variant(e);
        return;
      }
      case Tag.DICT: {
        const d = v.v as GDict;
        if (d.keyKind !== null || d.valKind !== null) {
          throw new UnsupportedError("var-to-bytes-typed", "var_to_bytes() 收到定型字典：那一形的头部没量过，响亮拒");
        }
        const ks = d.keys();
        const vs = d.values();
        this.header(T_DICTIONARY);
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
          if (o.kind === "byte") {
            this.header(T_PACKED_BYTE_ARRAY);
            this.u32(items.length);
            for (const e of items) this.bytes.push((e as number) & 0xff);
            while (this.bytes.length % 4 !== 0) this.bytes.push(0);
            return;
          }
          this.header(T_PACKED_FLOAT64_ARRAY);
          this.u32(items.length);
          for (const e of items) this.f64(e as number);
          return;
        }
        throw new UnsupportedError("var-to-bytes-object", "var_to_bytes() 的这一支没量过，响亮拒");
      }
    }
  }
}

/** `var_to_bytes(值)`：PackedByteArray，照 4.6.3 实测的 `VariantWriter::encode` 形状（语料 274 / §6 第 29 条）。 */
export function gVarToBytes(v: Variant): Variant {
  const w = new Writer();
  w.variant(v);
  return V.object(GBytes.of(w.bytes, "byte"));
}

class Reader {
  i = 0;

  constructor(readonly b: readonly number[]) {}

  get left(): number {
    return this.b.length - this.i;
  }

  /** 读不满就是截断：引擎那句 `Condition "len < 4" is true` 之后返回 NIL，我们照这一形走（语料 274 的 t33）。 */
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
    // 字节进 DataView、从有符号那头出来：bigint 的移位与按位或在静态目标上没有 lowering。
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
      case T_VECTOR3: {
        const x = this.f32();
        const y = this.f32();
        const z = this.f32();
        return V.object(new GVector3(x, y, z));
      }
      case T_COLOR: {
        const r = this.f32();
        const g = this.f32();
        const b = this.f32();
        const a = this.f32();
        return V.object(new GColor(r, g, b, a));
      }
      case T_ARRAY: {
        if ((flags & FLAG_WIDE) !== 0) throw new UnsupportedError("bytes-to-var-typed", "bytes_to_var() 读到定型数组：那一支的 stampElem 复位没量过，响亮拒");
        const n = this.u32();
        const items: Variant[] = [];
        for (let k = 0; k < n; k++) items.push(this.variant());
        return V.array(GArray.of(items));
      }
      case T_DICTIONARY: {
        const n = this.u32();
        const d = new GDict();
        for (let k = 0; k < n; k++) {
          const key = this.variant();
          d.set(key, this.variant());
        }
        return V.dict(d);
      }
      case T_PACKED_BYTE_ARRAY: {
        const n = this.u32();
        const pad = n + ((4 - (n % 4)) % 4);
        this.need(pad);
        const items = this.b.slice(this.i, this.i + n);
        this.i += pad;
        return V.object(GBytes.of(items, "byte"));
      }
      case T_PACKED_FLOAT64_ARRAY: {
        const n = this.u32();
        const items: number[] = [];
        for (let k = 0; k < n; k++) items.push(this.f64());
        return V.object(GBytes.of(items, "float64"));
      }
      default:
        throw new UnsupportedError("bytes-to-var-type", `bytes_to_var() 读到没量过的类型码 ${String(type)}`);
    }
  }
}

/** `bytes_to_var(字节)`：读不通就按实测那几格给 `<null>`（坏头部、截断、类型码越界三形都量过是 NIL，不抛）。 */
export function gBytesToVar(v: Variant): Variant {
  if (v.t !== Tag.OBJECT || !(v.v instanceof GBytes)) {
    throw new UnsupportedError("bytes-to-var-arg", `bytes_to_var() 的第一参要的是 PackedByteArray（收到的是别的东西），这一形没量过`);
  }
  const bytes = (v.v as GBytes).raw().map((x) => Number(x) & 0xff);
  const r = new Reader(bytes);
  try {
    return r.variant();
  } catch {
    return V.nil();
  }
}
