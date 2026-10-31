import { GodotRuntimeError, UnsupportedError } from "../../errors";
import { HEX_PREFIX_RE, HEX_RE, INT_RE, hashDjb2, strHexToInt, toBool, toFloat, toInt, variantHashNumber,
  abs, lengthOf, range as gRange, sqrt, variantHash, gAngleDifference, gCubic, gClamp, gCeil, gDegToRad, gRadToDeg, gEase, gExp,
  gFloor, gFmod, gFposmod, gInverseLerp, gIsEqualApprox, gIsFinite, gIsInf, gIsNan, gIsZeroApprox, gLerp, gLog,
  gMax, gMaxF, gMaxI, gMin, gMinF, gMinI, gMoveToward, gPosmod, gPow, gRemap, gRound, gSign, gSignF, gSignI,
  gSmoothstep, gSnapped, gSnappedF, gSnappedI, gWrap, gAbsF, gAbsI, gWrapAny, gIsSame,
  gTypeString, gErrorString, gTypeExists,
  gWeakref, gInstanceFromId, gIsInstanceValid, gIsInstanceIdValid, gRidFromInt64, gRidAllocateId, gInstToDict,
  gRandi, gRandf, gRandomize, gSeed, gRandFromSeed, gRandiRange, gRandfRange, gRandfn,
  gSin, gCos, gTan, gAsin, gAcos, gAtan, gAtan2, gSinh, gCosh, gTanh, gAsinh, gAcosh, gAtanh, randNextUint32,
  gDbToLinear, gLinearToDb, gPingpong, gStepDecimals, gNearestPo2, gRotateToward, gLerpAngle,
  gBezierInterpolate, gBezierDerivative, gCubicAngle, gCubicInTime, gCubicAngleInTime } from "../../builtins";
import { stringUnicodeReplaceError, packBswapGuard, packDecodeGuard, packEncodeGuard, packVarOffsetNegative, packVarShort, packSizeMultiple, packDynamicSrcEmpty, packDynamicFailed, packDynamicBadMode } from "../../frames";
import { gVarToBytes, gVarToBytesWithObjects, gVarDecodeAt } from "../../var-bytes";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "../../tags";
import { GVector2 } from "../vector/vector2";
import { GVector3 } from "../vector/vector3";
import { GVector4 } from "../vector/vector4";
import { GColor } from "../color/color";
import { GBytes, packDynamicUnpack, packTypeName } from "./packed";
import { asString, boolArgOr } from "../../method/core";

export function bytesBswap(p: GBytes, kind: 16 | 32 | 64, args: Variant[]): Variant {
  if (p.kind !== "byte") {
    throw new GodotRuntimeError("packed-no-method", `Invalid call. Nonexistent function 'bswap${String(kind)}' in base '${packTypeName(p.kind)}'.`);
  }
  if (args.length > 2) throw new GodotRuntimeError("arity", `bswap${String(kind)}() 需要 0 到 2 个参数（收到 ${args.length} 个）`);
  const width = kind / 8;
  const intOf = (v: Variant | undefined, i: number): number => {
    if (v === undefined) return i === 0 ? 0 : -1;
    if (v.t !== Tag.INT) {
      throw new UnsupportedError("packed-bswap-arg", `bswap${String(kind)}() 的第 ${i + 1} 个参数只量过 int 来源`);
    }
    const n = intToNum(v.v as IntPayload);
    return typeof n === "bigint" ? Number(n) : n;
  };
  const offset = intOf(args[0], 0);
  let count = intOf(args[1], 1);
  const sz = p.length;
  if (sz === 0 || count === 0) return V.nil();
  const chunks = (from: number): number => Math.floor((sz - from) / width);
  if (offset < 0 || offset > sz - width) {
    packBswapGuard(kind, "offset");
    return V.nil();
  }
  if (count < 0) count = chunks(offset);
  if (count > chunks(offset)) {
    packBswapGuard(kind, "count");
    return V.nil();
  }
  const raw = p.raw() as number[];
  for (let i = 0; i < count; i++) {
    const at = offset + i * width;
    for (let j = 0; j < width / 2; j++) {
      const t = raw[at + j] as number;
      raw[at + j] = raw[at + width - 1 - j] as number;
      raw[at + width - 1 - j] = t;
    }
  }
  return V.nil();
}

const TWO64 = 1n << 64n;

const TWO63 = 1n << 63n;

export const DECODE_INFO: Record<string, readonly [number, number, boolean]> = {
  decode_u8: [1, 859, false], decode_s8: [1, 865, true],
  decode_u16: [2, 871, false], decode_s16: [2, 877, true],
  decode_u32: [4, 883, false], decode_s32: [4, 889, true],
  decode_u64: [8, 895, true], decode_s64: [8, 901, true],
};

export const ENCODE_INFO: Record<string, readonly [number, number]> = {
  encode_u8: [1, 1073], encode_s8: [1, 1079],
  encode_u16: [2, 1086], encode_s16: [2, 1092],
  encode_u32: [4, 1099], encode_s32: [4, 1105],
  encode_u64: [8, 1112], encode_s64: [8, 1118],
};

export const FLOAT_DECODE_INFO: Record<string, readonly [number, number]> = {
  decode_half: [2, 907], decode_float: [4, 913], decode_double: [8, 920],
};

export const FLOAT_ENCODE_INFO: Record<string, readonly [number, number]> = {
  encode_half: [2, 1125], encode_float: [4, 1131], encode_double: [8, 1137],
};

const F32BIN = new DataView(new ArrayBuffer(4));

const F64BIN = new DataView(new ArrayBuffer(8));

function makeHalfFloat(value: number): number {
  F32BIN.setFloat32(0, value, true);
  const x = F32BIN.getUint32(0, true);
  const sign = x >>> 31;
  let mantissa = x & ((1 << 23) - 1);
  const exponent = x & (0xff << 23);
  if (exponent >= 0x47800000) {
    mantissa = mantissa !== 0 && exponent === 0xff << 23 ? (1 << 23) - 1 : 0;
    return ((sign << 15) | (0x1f << 10) | (mantissa >>> 13)) >>> 0;
  }
  if (exponent <= 0x38000000) return 0;
  return ((sign << 15) | ((exponent - 0x38000000) >>> 13) | (mantissa >>> 13)) >>> 0;
}

function halfToFloat(h: number): number {
  const hExp = h & 0x7c00;
  const fSgn = ((h & 0x8000) << 16) >>> 0;
  let bits: number;
  if (hExp === 0) {
    let sig = h & 0x03ff;
    if (sig === 0) bits = fSgn;
    else {
      sig <<= 1;
      let e = 0;
      while ((sig & 0x0400) === 0) {
        sig <<= 1;
        e++;
      }
      bits = (fSgn + (((127 - 15 - e) << 23) >>> 0) + ((sig & 0x03ff) << 13)) >>> 0;
    }
  } else if (hExp === 0x7c00) {
    bits = (fSgn + 0x7f800000 + ((h & 0x03ff) << 13)) >>> 0;
  } else {
    bits = (fSgn + (((h & 0x7fff) + 0x1c000) << 13)) >>> 0;
  }
  F32BIN.setUint32(0, bits, true);
  return F32BIN.getFloat32(0, true);
}

export function packDecodeFloat(p: GBytes, name: string, args: Variant[]): Variant {
  const info = FLOAT_DECODE_INFO[name] as readonly [number, number];
  const width = info[0];
  if (args.length !== 1) throw new GodotRuntimeError("arity", `${name}() 需要 1 个参数（收到 ${args.length} 个）`);
  const off = int64Arg(args[0], name);
  if (off < 0n || off > BigInt(p.length - width)) {
    packDecodeGuard(`func_PackedByteArray_${name}`, info[1], width);
    return V.float(0);
  }
  const at = Number(off);
  const raw = p.raw() as number[];
  if (width === 2) return V.float(halfToFloat(((raw[at] as number) | ((raw[at + 1] as number) << 8)) & 0xffff));
  if (width === 4) {
    F32BIN.setUint8(0, raw[at] as number);
    F32BIN.setUint8(1, raw[at + 1] as number);
    F32BIN.setUint8(2, raw[at + 2] as number);
    F32BIN.setUint8(3, raw[at + 3] as number);
    return V.float(F32BIN.getFloat32(0, true));
  }
  for (let i = 0; i < 8; i++) F64BIN.setUint8(i, raw[at + i] as number);
  return V.float(F64BIN.getFloat64(0, true));
}

export function packEncodeFloat(p: GBytes, name: string, args: Variant[]): Variant {
  const info = FLOAT_ENCODE_INFO[name] as readonly [number, number];
  const width = info[0];
  if (args.length !== 2) throw new GodotRuntimeError("arity", `${name}() 需要 2 个参数（收到 ${args.length} 个）`);
  const off = int64Arg(args[0], name);
  const v = args[1] as Variant;
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
    throw new UnsupportedError("packed-bin-arg", `${name}() 只量过 int / float 来源（收到 ${tagName(v.t)}）`);
  }
  const value = v.t === Tag.INT ? Number(intToNum(v.v as IntPayload)) : (Math.fround(v.v as number));
  if (off < 0n || off > BigInt(p.length - width)) {
    packEncodeGuard(`func_PackedByteArray_${name}`, info[1], width);
    return V.nil();
  }
  const at = Number(off);
  const raw = p.raw() as number[];
  if (width === 2) {
    const h = makeHalfFloat(value);
    raw[at] = h & 0xff;
    raw[at + 1] = (h >>> 8) & 0xff;
  } else if (width === 4) {
    F32BIN.setFloat32(0, value, true);
    for (let i = 0; i < 4; i++) raw[at + i] = F32BIN.getUint8(i);
  } else {
    F64BIN.setFloat64(0, value, true);
    for (let i = 0; i < 8; i++) raw[at + i] = F64BIN.getUint8(i);
  }
  return V.nil();
}

function int64Arg(v: Variant | undefined, who: string): bigint {
  if (v === undefined) throw new GodotRuntimeError("arity", `${who}() 缺少参数`);
  if (v.t !== Tag.INT) throw new UnsupportedError("packed-bin-arg", `${who}() 只量过 int 来源（收到 ${tagName(v.t)}）`);
  const p = v.v as IntPayload;
  return typeof p === "bigint" ? p : BigInt(Math.trunc(p));
}

export function packDecode(p: GBytes, name: string, args: Variant[]): Variant {
  const info = DECODE_INFO[name] as readonly [number, number, boolean];
  const width = info[0];
  if (args.length !== 1) throw new GodotRuntimeError("arity", `${name}() 需要 1 个参数（收到 ${args.length} 个）`);
  const off = int64Arg(args[0], name);
  if (off < 0n || off > BigInt(p.length - width)) {
    packDecodeGuard(`func_PackedByteArray_${name}`, info[1], width);
    return V.int(0);
  }
  const at = Number(off);
  const raw = p.raw() as number[];
  let bits = 0n;
  for (let i = width - 1; i >= 0; i--) bits = (bits << 8n) | BigInt(raw[at + i] as number);
  if (width === 8) return V.int(bits >= TWO63 ? bits - TWO64 : bits);
  let n = Number(bits);
  if (info[2]) {
    const lim = 2 ** (width * 8 - 1);
    if (n >= lim) n -= 2 ** (width * 8);
  }
  return V.int(n);
}

export function packEncode(p: GBytes, name: string, args: Variant[]): Variant {
  const info = ENCODE_INFO[name] as readonly [number, number];
  const width = info[0];
  if (args.length !== 2) throw new GodotRuntimeError("arity", `${name}() 需要 2 个参数（收到 ${args.length} 个）`);
  const off = int64Arg(args[0], name);
  const value = int64Arg(args[1], name);
  if (off < 0n || off > BigInt(p.length - width)) {
    packEncodeGuard(`func_PackedByteArray_${name}`, info[1], width);
    return V.nil();
  }
  const at = Number(off);
  const bits = ((value % TWO64) + TWO64) % TWO64;
  const raw = p.raw() as number[];
  for (let i = 0; i < width; i++) raw[at + i] = Number((bits >> BigInt(i * 8)) & 0xffn);
  return V.nil();
}

export const VAR_CODEC_GUARD: Record<string, readonly [string, number]> = {
  has_encoded_var: ["false", 927], decode_var: ["Variant()", 936], decode_var_size: ["0", 948], encode_var: ["-1", 1143],
};

export function packVarCodec(p: GBytes, name: string, args: Variant[]): Variant {
  const guard = VAR_CODEC_GUARD[name] as readonly [string, number];
  const negative = (): Variant => {
    packVarOffsetNegative(`func_PackedByteArray_${name}`, guard[1], guard[0]);
    if (name === "has_encoded_var") return V.bool(false);
    if (name === "decode_var_size") return V.int(0);
    if (name === "encode_var") return V.int(-1);
    return V.nil();
  };
  if (name === "encode_var") {
    if (args.length < 2 || args.length > 3) throw new GodotRuntimeError("arity", `encode_var() 需要 2 或 3 个参数（收到 ${args.length} 个）`);
    const off = int64Arg(args[0], name);
    if (off < 0n) return negative();
    const allow = boolArgOr(args, 2, false);
    const encVar = allow ? gVarToBytesWithObjects(args[1] as Variant) : gVarToBytes(args[1] as Variant);
    const enc = (encVar.v as GBytes).raw() as number[];
    if (off + BigInt(enc.length) > BigInt(p.length)) return V.int(-1);
    const at = Number(off);
    const raw = p.raw() as number[];
    for (let i = 0; i < enc.length; i++) raw[at + i] = Number(enc[i]) & 0xff;
    return V.int(enc.length);
  }
  if (args.length < 1 || args.length > 2) throw new GodotRuntimeError("arity", `${name}() 需要 1 或 2 个参数（收到 ${args.length} 个）`);
  const off = int64Arg(args[0], name);
  if (off < 0n) return negative();
  const allow = boolArgOr(args, 1, false);
  const r = gVarDecodeAt(V.object(p), Number(off), allow);
  if (r === null || "short" in r) {
    if (r !== null) packVarShort();
    if (name === "has_encoded_var") return V.bool(false);
    if (name === "decode_var_size") return V.int(0);
    return V.nil();
  }
  if (name === "has_encoded_var") return V.bool(true);
  if (name === "decode_var_size") return V.int(r.size);
  return r.value;
}

export const CONVERT_INFO: Record<string, readonly [number, string, number, "vector2" | "vector3" | "vector4" | "color"]> = {
  to_vector2_array: [8, "PackedByteArray size must be a multiple of 8 (size of Vector2) to convert to PackedVector2Array.", 1021, "vector2"],
  to_vector3_array: [12, "PackedByteArray size must be a multiple of 12 (size of Vector3) to convert to PackedVector3Array.", 1035, "vector3"],
  to_vector4_array: [16, "PackedByteArray size must be a multiple of 16 (size of Vector4) to convert to PackedVector4Array.", 1049, "vector4"],
  to_color_array: [16, "PackedByteArray size must be a multiple of 16 (size of Color variant) to convert to PackedColorArray.", 1063, "color"],
};

export function packConvert(p: GBytes, name: string): Variant {
  const info = CONVERT_INFO[name] as readonly [number, string, number, "vector2" | "vector3" | "vector4" | "color"];
  const width = info[0];
  const kind = info[3];
  if (p.length !== 0 && p.length % width !== 0) {
    packSizeMultiple(`func_PackedByteArray_decode_${kind}_array`, info[2], info[1]);
    return V.object(new GBytes([], kind));
  }
  const raw = p.raw() as number[];
  const f32 = (at: number): number => {
    for (let k = 0; k < 4; k++) F32BIN.setUint8(k, raw[at + k] as number);
    return F32BIN.getFloat32(0, true);
  };
  const items: object[] = [];
  for (let at = 0; at + width <= raw.length; at += width) {
    items.push(
      kind === "vector2" ? new GVector2(f32(at), f32(at + 4))
      : kind === "vector3" ? new GVector3(f32(at), f32(at + 4), f32(at + 8))
      : kind === "vector4" ? new GVector4(f32(at), f32(at + 4), f32(at + 8), f32(at + 12))
      : new GColor(f32(at), f32(at + 4), f32(at + 8), f32(at + 12)),
    );
  }
  return V.object(new GBytes(items as never[], kind));
}

export function bytesUtf32(p: GBytes): Variant {
  const raw = p.raw() as number[];
  const n = Math.floor(raw.length / 4);
  let out = "";
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const cp = (((raw[o] as number) | ((raw[o + 1] as number) << 8) | ((raw[o + 2] as number) << 16) | ((raw[o + 3] as number) << 24)) >>> 0);
    if (cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) {
      stringUnicodeReplaceError(cp >= 0xd800 && cp <= 0xdfff ? `Unpaired surrogate (${cp.toString(16)})` : `Invalid unicode codepoint (${cp.toString(16)})`);
      out += "\ufffd";
      continue;
    }
    out += String.fromCodePoint(cp);
  }
  return V.str(out);
}

const CP1252_HIGH: readonly number[] = [
  0x20ac, 0x0081, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021,
  0x02c6, 0x2030, 0x0160, 0x2039, 0x0152, 0x008d, 0x017d, 0x008f,
  0x0090, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014,
  0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x009d, 0x017e, 0x0178,
];

export function cp1252EncodeBytes(s: string): number[] {
  const rev: Record<number, number> = {};
  for (let i = 0; i < CP1252_HIGH.length; i++) rev[CP1252_HIGH[i] as number] = 0x80 + i;
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const cu = s.charCodeAt(i);
    const special = rev[cu];
    if (special !== undefined) out.push(special);
    else if (cu <= 0x7f || (cu >= 0xa0 && cu <= 0xff) || cu === 0x8d || cu === 0x8f || cu === 0x90 || cu === 0x9d) out.push(cu);
    else out.push(0x3f);
  }
  return out;
}

function cp1252DecodeBytes(xs: number[]): string {
  let out = "";
  for (const b of xs) out += String.fromCodePoint(b >= 0x80 && b <= 0x9f ? (CP1252_HIGH[b - 0x80] as number) : b);
  return out;
}

export function bytesMultibyte(p: GBytes, args: Variant[]): Variant {
  if (args.length > 1) throw new GodotRuntimeError("arity", `get_string_from_multibyte_char() 最多 1 个参数（收到 ${args.length} 个）`);
  const enc = args.length === 0 ? "" : asString(args[0] as Variant, "get_string_from_multibyte_char");
  const upper = enc.toUpperCase();
  if (upper === "") {
    throw new UnsupportedError("packed-multibyte-acp", "get_string_from_multibyte_char() 的空编码走宿主 ANSI 代码页（实测这台是 CP936），跨宿主不可复现，不发");
  }
  if (upper !== "UTF-8" && upper !== "ISO-8859-1" && upper !== "WINDOWS-1252") {
    throw new UnsupportedError("packed-multibyte-encoding", `get_string_from_multibyte_char() 的编码 "${enc}" 没接（只量过 UTF-8 / ISO-8859-1 / WINDOWS-1252；引擎代码页表里其余名字没量）`);
  }
  if (p.length === 0) return V.str("");
  const raw = p.raw() as number[];
  const nul = raw.indexOf(0);
  const end = nul < 0 ? raw.length : nul;
  if (upper === "ISO-8859-1") {
    let out = "";
    for (let i = 0; i < end; i++) out += String.fromCharCode(raw[i] as number);
    return V.str(out);
  }
  if (upper === "WINDOWS-1252") return V.str(cp1252DecodeBytes(raw.slice(0, end)));
  return V.str(windowsUtf8Decode(raw, end));
}

function windowsUtf8Decode(raw: number[], end: number): string {
  let out = "";
  let i = 0;
  while (i < end) {
    const b0 = raw[i] as number;
    if (b0 < 0x80) {
      out += String.fromCharCode(b0);
      i += 1;
      continue;
    }
    let need: number;
    let cp: number;
    if (b0 >= 0xc2 && b0 <= 0xdf) {
      need = 1;
      cp = b0 & 0x1f;
    } else if (b0 >= 0xe0 && b0 <= 0xef) {
      need = 2;
      cp = b0 & 0x0f;
    } else if (b0 >= 0xf0 && b0 <= 0xf4) {
      need = 3;
      cp = b0 & 0x07;
    } else {
      out += "\ufffd";
      i += 1;
      continue;
    }
    let j = i + 1;
    let ok = true;
    for (let k = 0; k < need; k++, j++) {
      const b = raw[j];
      if (b === undefined || (b & 0xc0) !== 0x80) {
        ok = false;
        break;
      }
      cp = (cp << 6) | (b & 0x3f);
    }
    const bad = need === 2 ? cp < 0x800 || (cp >= 0xd800 && cp <= 0xdfff) : need === 3 ? cp < 0x10000 || cp > 0x10ffff : false;
    if (!ok || bad) {
      out += "\ufffd";
      i += 1;
      continue;
    }
    out += String.fromCodePoint(cp);
    i = j;
  }
  return out;
}

export function bytesDecompressDynamic(p: GBytes, args: Variant[]): Variant {
  if (args.length < 1 || args.length > 2) {
    throw new GodotRuntimeError("arity", `decompress_dynamic() 需要 1 或 2 个参数（收到 ${args.length} 个）`);
  }
  const want = int64Arg(args[0], "decompress_dynamic");
  const mode = args[1] === undefined ? 0 : Number(int64Arg(args[1], "decompress_dynamic"));
  const emptyPack = (): Variant => V.object(new GBytes([], "byte"));
  const raw = p.raw() as number[];
  if (raw.length === 0) {
    packDynamicSrcEmpty();
    packDynamicFailed();
    return emptyPack();
  }
  if (mode !== 1 && mode !== 3) {
    packDynamicBadMode();
    packDynamicFailed();
    return emptyPack();
  }
  const r = packDynamicUnpack(raw, mode);
  if (r === "n/a") {
    throw new UnsupportedError("packed-compress-mode", `decompress_dynamic() 的 mode ${mode} 没有宿主编解码器（同 compress / decompress），不发近似值`);
  }
  if (r === "empty") return emptyPack();
  if (r === "failed" || want <= 0n || BigInt(r.length) > want) {
    packDynamicFailed();
    return emptyPack();
  }
  const out: number[] = [];
  for (let i = 0; i < r.length; i++) out.push(r[i] as number);
  return V.object(new GBytes(out, "byte"));
}

export function charReplacement(n: number, who: string): number {
  if (n < 0 || n > 0x10ffff || (n >= 0xd800 && n <= 0xdfff)) {
    throw new UnsupportedError("string-char-invalid", `${who}() 的替换码点 ${String(n)} 引擎按 uint32 回绕存成 char32（实测 unicode_at 给 4294967295、length 照旧），宿主的 UTF-16 串装不下，不发近似值`);
  }
  return n;
}
