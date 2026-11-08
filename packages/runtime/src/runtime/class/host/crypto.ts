import { Tag, V, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GBytes } from "../bytes/packed";
import { GdScriptObject } from "../object/script-object";
import { registerEngineCtor } from "../object/node";
import { digestBytes } from "../../digest";

const ZERO = 0n;
const ONE = 1n;
const TWO = 2n;
const E = 65537n;

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = ONE;
  let b = base % mod;
  let e = exp;
  while (e > ZERO) {
    if ((e & ONE) === ONE) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= ONE;
  }
  return result;
}

function modInv(a: bigint, m: bigint): bigint {
  let old_r = a % m;
  let r = m;
  let old_s = ONE;
  let s = ZERO;
  while (r !== ZERO) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return ((old_s % m) + m) % m;
}

function randomBytes(n: number): number[] {
  const out: number[] = [];
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } }).crypto;
  if (c?.getRandomValues !== undefined) {
    const buf = new Uint8Array(n);
    c.getRandomValues(buf);
    for (const b of buf) out.push(b);
    return out;
  }
  for (let i = 0; i < n; i++) out.push(Math.floor(Math.random() * 256));
  return out;
}

function bytesToBig(bytes: readonly number[]): bigint {
  let n = ZERO;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  return n;
}

function bigToBytes(n: bigint, length: number): number[] {
  const out = new Array<number>(length).fill(0);
  let v = n;
  for (let i = length - 1; i >= 0 && v > ZERO; i--) {
    out[i] = Number(v & 0xffn);
    v >>= 8n;
  }
  return out;
}

function bitLength(n: bigint): number {
  return n.toString(2).length;
}

const SMALL_PRIMES = [3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n, 53n, 59n, 61n, 67n, 71n, 73n, 79n, 83n, 89n, 97n];

function randomBelow(n: bigint): bigint {
  const bytes = Math.ceil(bitLength(n) / 8);
  return bytesToBig(randomBytes(bytes)) % n;
}

function isProbablePrime(n: bigint): boolean {
  if (n < TWO) return false;
  for (const p of SMALL_PRIMES) {
    if (n === p) return true;
    if (n % p === ZERO) return false;
  }
  let d = n - ONE;
  let s = 0;
  while ((d & ONE) === ZERO) {
    d >>= ONE;
    s++;
  }
  for (let round = 0; round < 16; round++) {
    const a = randomBelow(n - 3n) + 2n;
    let x = modPow(a, d, n);
    if (x === ONE || x === n - ONE) continue;
    let composite = true;
    for (let r = 1; r < s; r++) {
      x = modPow(x, TWO, n);
      if (x === n - ONE) {
        composite = false;
        break;
      }
    }
    if (composite) return false;
  }
  return true;
}

function randomPrime(bits: number): bigint {
  for (;;) {
    const bytes = randomBytes(Math.ceil(bits / 8));
    bytes[0] = ((bytes[0] as number) | 0x80) & 0xff;
    const last = bytes.length - 1;
    bytes[last] = ((bytes[last] as number) | 1) & 0xff;
    const n = bytesToBig(bytes);
    if (bitLength(n) === bits && isProbablePrime(n)) return n;
  }
}

export class RsaKey {
  readonly n: bigint;
  readonly e: bigint;
  readonly d: bigint;

  constructor(n: bigint, e: bigint, d: bigint) {
    this.n = n;
    this.e = e;
    this.d = d;
  }

  static generate(bits: number): RsaKey {
    if (bits < 512 || bits > 16384) throw new UnsupportedError("crypto-rsa-size", `generate_rsa() 的位数 ${String(bits)} 没量过`);
    for (;;) {
      const p = randomPrime(bits >> 1);
      const q = randomPrime(bits >> 1);
      if (p === q) continue;
      const n = p * q;
      if (bitLength(n) !== bits) continue;
      const phi = (p - ONE) * (q - ONE);
      const d = modInv(E, phi);
      return new RsaKey(n, E, d);
    }
  }

  get sizeBytes(): number {
    return Math.ceil(bitLength(this.n) / 8);
  }

  encrypt(message: number[]): number[] {
    const k = this.sizeBytes;
    if (message.length + 11 > k) throw new UnsupportedError("crypto-rsa-long", "Crypto.encrypt() 的消息超过密钥块长度这一形没量过");
    const padding: number[] = [];
    while (padding.length < k - message.length - 3) {
      const b = (randomBytes(1)[0] as number) | 1;
      if (b !== 0) padding.push(b);
    }
    const em = [0x00, 0x02, ...padding, 0x00, ...message];
    return bigToBytes(modPow(bytesToBig(em), this.e, this.n), k);
  }

  decrypt(cipher: number[]): number[] {
    const k = this.sizeBytes;
    if (cipher.length !== k) return [];
    const em = bigToBytes(modPow(bytesToBig(cipher), this.d, this.n), k);
    if (em[0] !== 0 || em[1] !== 2) return [];
    const at = em.indexOf(0, 2);
    if (at < 0) return [];
    return em.slice(at + 1);
  }

  sign(digestInfo: number[]): number[] {
    const k = this.sizeBytes;
    if (digestInfo.length + 11 > k) return [];
    const em = [0x00, 0x01, ...new Array<number>(k - digestInfo.length - 3).fill(0xff), 0x00, ...digestInfo];
    return bigToBytes(modPow(bytesToBig(em), this.d, this.n), k);
  }

  verify(digestInfo: number[], signature: number[]): boolean {
    const k = this.sizeBytes;
    if (signature.length !== k) return false;
    const em = bigToBytes(modPow(bytesToBig(signature), this.e, this.n), k);
    if (em[0] !== 0 || em[1] !== 1) return false;
    let at = 2;
    while (at < em.length && em[at] === 0xff) at++;
    if (at === 2 || em[at] !== 0) return false;
    const expected = em.slice(at + 1);
    if (expected.length !== digestInfo.length) return false;
    let diff = 0;
    for (let i = 0; i < digestInfo.length; i++) diff |= (expected[i] as number) ^ (digestInfo[i] as number);
    return diff === 0;
  }
}

const DIGEST_INFO: Readonly<Record<number, number[]>> = {
  1: [0x30, 0x21, 0x30, 0x09, 0x06, 0x05, 0x2b, 0x0e, 0x03, 0x02, 0x1a, 0x05, 0x00, 0x04, 0x14],
  2: [0x30, 0x31, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01, 0x05, 0x00, 0x04, 0x20],
};

function digestInfo(kind: number, digest: number[]): number[] | null {
  const prefix = DIGEST_INFO[kind];
  return prefix === undefined ? null : [...prefix, ...digest];
}

export class GdCryptoKey extends GdScriptObject {
  constructor(readonly rsa: RsaKey) {
    super();
  }
}

export class GdX509Certificate extends GdScriptObject {
  constructor(readonly payload: number[]) {
    super();
  }
}

export class GdCrypto extends GdScriptObject {
  override __gdDispatch(name: string, args: Variant[]): Variant | null {
    switch (name) {
      case "constant_time_compare": {
        const a = packArg(args[0], name);
        const b = packArg(args[1], name);
        let diff = a.length ^ b.length;
        const n = Math.max(a.length, b.length);
        for (let i = 0; i < n; i++) diff |= ((a[i] ?? 0) as number) ^ ((b[i] ?? 0) as number);
        return V.bool(diff === 0);
      }
      case "generate_random_bytes":
        return V.object(new GBytes(randomBytes(intArg(args[0], name)), "byte"));
      case "generate_rsa":
        return V.object(new GdCryptoKey(RsaKey.generate(intArg(args[0], name))));
      case "encrypt": {
        const key = keyArg(args[0], name);
        return V.object(new GBytes(key.rsa.encrypt(packArg(args[1], name)), "byte"));
      }
      case "decrypt": {
        const key = keyArg(args[0], name);
        return V.object(new GBytes(key.rsa.decrypt(packArg(args[1], name)), "byte"));
      }
      case "hmac_digest": {
        const kind = intArg(args[0], name);
        if (kind !== 1 && kind !== 2) return V.object(new GBytes([], "byte"));
        const key = packArg(args[1], name);
        const msg = packArg(args[2], name);
        const block = 64;
        const base = key.length > block ? digestBytes(kind, key) : key.slice();
        const pad = base.concat(new Array<number>(block - base.length).fill(0));
        const inner = digestBytes(kind, pad.map((b) => b ^ 0x36).concat(msg));
        const outer = digestBytes(kind, pad.map((b) => b ^ 0x5c).concat(inner));
        return V.object(new GBytes(outer, "byte"));
      }
      case "sign": {
        const kind = intArg(args[0], name);
        const info = digestInfo(kind, packArg(args[1], name));
        const key = keyArg(args[2], name);
        return V.object(new GBytes(info === null ? [] : key.rsa.sign(info), "byte"));
      }
      case "verify": {
        const kind = intArg(args[0], name);
        const info = digestInfo(kind, packArg(args[1], name));
        const key = keyArg(args[3], name);
        if (info === null) return V.bool(false);
        return V.bool(key.rsa.verify(info, packArg(args[2], name)));
      }
      case "generate_self_signed_certificate": {
        const key = keyArg(args[0], name);
        const issuer = textArg(args[1], name);
        const notBefore = textArg(args[2], name);
        const notAfter = textArg(args[3], name);
        return V.object(new GdX509Certificate(selfSignedCertificate(key.rsa, issuer, notBefore, notAfter)));
      }
      default:
        return null;
    }
  }
}

function packArg(v: Variant | undefined, who: string): number[] {
  if (v === undefined || v.t !== Tag.OBJECT || !(v.v instanceof GBytes)) throw new UnsupportedError("crypto-arg", `Crypto.${who}() 只量过 PackedByteArray`);
  return (v.v as GBytes).raw().map((b) => Number(b) & 255);
}

function intArg(v: Variant | undefined, who: string): number {
  if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("crypto-arg", `Crypto.${who}() 只量过 int`);
  return Math.trunc(Number(v.v as number | bigint));
}

function textArg(v: Variant | undefined, who: string): string {
  if (v === undefined || (v.t !== Tag.STRING && v.t !== Tag.STRING_NAME)) throw new UnsupportedError("crypto-arg", `Crypto.${who}() 只量过 String`);
  return String(v.v);
}

function keyArg(v: Variant | undefined, who: string): GdCryptoKey {
  if (v === undefined || v.t !== Tag.OBJECT || !(v.v instanceof GdCryptoKey)) throw new UnsupportedError("crypto-arg", `Crypto.${who}() 的密钥只量过 generate_rsa() 造出来的 CryptoKey`);
  return v.v as GdCryptoKey;
}

function derLen(n: number): number[] {
  if (n < 0x80) return [n];
  const bytes: number[] = [];
  let v = n;
  while (v > 0) {
    bytes.unshift(v & 255);
    v >>= 8;
  }
  return [0x80 | bytes.length, ...bytes];
}

function der(tag: number, content: number[]): number[] {
  return [tag, ...derLen(content.length), ...content];
}

function derInt(n: bigint): number[] {
  const bytes = bigToBytes(n, Math.max(1, Math.ceil(bitLength(n) / 8)));
  return der(0x02, (bytes[0] as number) & 0x80 ? [0, ...bytes] : bytes);
}

function derOid(dotted: string): number[] {
  const parts = dotted.split(".").map(Number);
  const out: number[] = [(parts[0] as number) * 40 + (parts[1] as number)];
  for (const part of parts.slice(2)) {
    let v = part;
    const stack: number[] = [v & 0x7f];
    v >>= 7;
    while (v > 0) {
      stack.unshift((v & 0x7f) | 0x80);
      v >>= 7;
    }
    out.push(...stack);
  }
  return der(0x06, out);
}

const NAME_OIDS: Readonly<Record<string, string>> = {
  CN: "2.5.4.3",
  O: "2.5.4.10",
  OU: "2.5.4.11",
  C: "2.5.4.6",
  L: "2.5.4.7",
  ST: "2.5.4.8",
  emailAddress: "1.2.840.113549.1.9.1",
};

function derName(text: string): number[] {
  const rdns: number[] = [];
  for (const part of text.split(/[,/]/)) {
    const at = part.indexOf("=");
    if (at < 0) continue;
    const key = part.slice(0, at).trim();
    const value = part.slice(at + 1).trim();
    const oid = NAME_OIDS[key];
    if (oid === undefined) throw new UnsupportedError("crypto-cert-name", `自签证书的名字字段 ${key} 没量过`);
    rdns.push(...der(0x31, der(0x30, [...derOid(oid), ...der(0x0c, [...new TextEncoder().encode(value)])])));
  }
  return der(0x30, rdns);
}

function derTime(text: string): number[] {
  const digits = text.replace(/[^0-9]/g, "");
  if (digits.length !== 14) throw new UnsupportedError("crypto-cert-time", `自签证书的时间串 "${text}" 没量过`);
  const year = Number(digits.slice(0, 4));
  const z = `${digits}Z`;
  return year >= 1950 && year < 2050 ? der(0x17, [...new TextEncoder().encode(z.slice(2))]) : der(0x18, [...new TextEncoder().encode(z)]);
}

function rsaPublicKeyDer(key: RsaKey): number[] {
  return der(0x30, [...derInt(key.n), ...derInt(key.e)]);
}

function selfSignedCertificate(key: RsaKey, issuer: string, notBefore: string, notAfter: string): number[] {
  const sha256Rsa = [...derOid("1.2.840.113549.1.1.11"), 0x05, 0x00];
  const name = derName(issuer);
  const serialBytes = randomBytes(16);
  serialBytes[0] = ((serialBytes[0] as number) & 0x7f) | 0x01;
  const tbs = der(0x30, [
    0xa0, 0x03, 0x02, 0x01, 0x02,
    ...der(0x02, serialBytes),
    ...der(0x30, sha256Rsa),
    ...name,
    ...der(0x30, [...derTime(notBefore), ...derTime(notAfter)]),
    ...name,
    ...der(0x30, [...der(0x30, [...derOid("1.2.840.113549.1.1.1"), 0x05, 0x00]), ...der(0x03, [0x00, ...rsaPublicKeyDer(key)])]),
    ...der(0xa3, der(0x30, der(0x30, [...derOid("2.5.29.19"), 0x01, 0x01, 0xff, ...der(0x04, der(0x30, []))]))),
  ]);
  const digest = digestBytes(2, tbs);
  const signature = key.sign([...(DIGEST_INFO[2] as readonly number[]), ...digest]);
  return der(0x30, [...tbs, ...der(0x30, sha256Rsa), ...der(0x03, [0x00, ...signature])]);
}

export function cryptoMethod(target: unknown, name: string, args: Variant[]): Variant | null {
  return (target as GdCrypto).__gdDispatch(name, args);
}

registerEngineCtor("Crypto", () => new GdCrypto());
registerEngineCtor("CryptoKey", () => new GdCryptoKey(RsaKey.generate(1024)));
registerEngineCtor("X509Certificate", () => new GdX509Certificate([]));
