import { Tag, V, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GBytes, utf8Decode } from "../bytes/packed";
import { gBytesToVar, gBytesToVarWithObjects, gVarToBytes, gVarToBytesWithObjects } from "../../var-bytes";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const INVERSE: Readonly<Record<string, number>> = Object.fromEntries([...ALPHABET].map((c, i) => [c, i]));

export function base64Encode(bytes: readonly number[]): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] as number;
    const b1 = i + 1 < bytes.length ? (bytes[i + 1] as number) : 0;
    const b2 = i + 2 < bytes.length ? (bytes[i + 2] as number) : 0;
    out += ALPHABET[(b0 >> 2) & 63];
    out += ALPHABET[((b0 & 3) << 4) | ((b1 >> 4) & 15)];
    out += i + 1 < bytes.length ? ALPHABET[((b1 & 15) << 2) | ((b2 >> 6) & 3)] : "=";
    out += i + 2 < bytes.length ? ALPHABET[b2 & 63] : "=";
  }
  return out;
}

export function base64Decode(text: string): number[] {
  const out: number[] = [];
  let acc = 0;
  let bits = 0;
  for (const c of text) {
    if (c === "=") break;
    const v = INVERSE[c];
    if (v === undefined) continue;
    acc = (acc << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((acc >> bits) & 255);
    }
  }
  return out;
}

function bytesArg(v: Variant, who: string): number[] {
  if (v.t !== Tag.OBJECT || !(v.v instanceof GBytes)) throw new UnsupportedError("marshalls-arg", `Marshalls.${who}() 只量过 PackedByteArray`);
  return (v.v as GBytes).raw().map((x) => Number(x) & 255);
}

function textArg(v: Variant, who: string): string {
  if (v.t !== Tag.STRING) throw new UnsupportedError("marshalls-arg", `Marshalls.${who}() 只量过 String`);
  return String(v.v);
}

function boolArg(v: Variant | undefined): boolean {
  return v !== undefined && v.t === Tag.BOOL && v.v === true;
}

export function marshallsStatic(name: string, args: Variant[]): Variant {
  switch (name) {
    case "raw_to_base64":
      return V.str(base64Encode(bytesArg(args[0] as Variant, name)));
    case "base64_to_raw":
      return V.object(GBytes.of(base64Decode(textArg(args[0] as Variant, name)), "byte"));
    case "utf8_to_base64": {
      const bytes = Array.from(new TextEncoder().encode(textArg(args[0] as Variant, name)));
      return V.str(base64Encode(bytes));
    }
    case "base64_to_utf8":
      return V.str(utf8Decode(base64Decode(textArg(args[0] as Variant, name))));
    case "variant_to_base64": {
      const encoded = boolArg(args[1]) ? gVarToBytesWithObjects(args[0] as Variant) : gVarToBytes(args[0] as Variant);
      return V.str(base64Encode(bytesArg(encoded, name)));
    }
    case "base64_to_variant": {
      const bytes = V.object(GBytes.of(base64Decode(textArg(args[0] as Variant, name)), "byte"));
      return boolArg(args[1]) ? gBytesToVarWithObjects(bytes) : gBytesToVar(bytes);
    }
    default:
      throw new UnsupportedError("marshalls-member", `Marshalls.${name}() 这一支没量过`);
  }
}
