const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function padBytes(bytes: number[]): number[] {
  const out = bytes.slice();
  const bitLen = bytes.length * 8;
  out.push(0x80);
  while (out.length % 64 !== 56) out.push(0);
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  for (const v of [hi, lo]) {
    out.push((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255);
  }
  return out;
}

const rotr = (x: number, n: number): number => ((x >>> n) | (x << (32 - n))) >>> 0;
const rotl = (x: number, n: number): number => ((x << n) | (x >>> (32 - n))) >>> 0;

export function sha256Bytes(data: readonly number[]): number[] {
  const bytes = padBytes(data as number[]);
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const w = new Array<number>(64).fill(0);
  for (let off = 0; off < bytes.length; off += 64) {
    for (let i = 0; i < 16; i++) {
      const j = off + i * 4;
      w[i] = (((bytes[j] as number) << 24) | ((bytes[j + 1] as number) << 16) | ((bytes[j + 2] as number) << 8) | (bytes[j + 3] as number)) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const a = w[i - 15] as number;
      const b = w[i - 2] as number;
      const s0 = (rotr(a, 7) ^ rotr(a, 18) ^ (a >>> 3)) >>> 0;
      const s1 = (rotr(b, 17) ^ rotr(b, 19) ^ (b >>> 10)) >>> 0;
      w[i] = (((w[i - 16] as number) + s0 + (w[i - 7] as number) + s1) >>> 0);
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const t1 = (((h + S1 + ch + (SHA256_K[i] as number) + (w[i] as number)) >>> 0));
      const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const t2 = ((S0 + maj) >>> 0);
      h = g; g = f; f = e; e = ((d + t1) >>> 0);
      d = c; c = b; b = a; a = ((t1 + t2) >>> 0);
    }
    h0 = ((h0 + a) >>> 0); h1 = ((h1 + b) >>> 0); h2 = ((h2 + c) >>> 0); h3 = ((h3 + d) >>> 0);
    h4 = ((h4 + e) >>> 0); h5 = ((h5 + f) >>> 0); h6 = ((h6 + g) >>> 0); h7 = ((h7 + h) >>> 0);
  }
  const out: number[] = [];
  for (const h of [h0, h1, h2, h3, h4, h5, h6, h7]) {
    out.push((h >>> 24) & 255, (h >>> 16) & 255, (h >>> 8) & 255, h & 255);
  }
  return out;
}

export function sha1Bytes(data: readonly number[]): number[] {
  const bytes = padBytes(data as number[]);
  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
  const w = new Array<number>(80).fill(0);
  for (let off = 0; off < bytes.length; off += 64) {
    for (let i = 0; i < 16; i++) {
      const j = off + i * 4;
      w[i] = (((bytes[j] as number) << 24) | ((bytes[j + 1] as number) << 16) | ((bytes[j + 2] as number) << 8) | (bytes[j + 3] as number)) >>> 0;
    }
    for (let i = 16; i < 80; i++) {
      w[i] = rotl(((w[i - 3] as number) ^ (w[i - 8] as number) ^ (w[i - 14] as number) ^ (w[i - 16] as number)) >>> 0, 1);
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let i = 0; i < 80; i++) {
      const f = i < 20 ? ((b & c) | (~b & d)) : i < 40 ? (b ^ c ^ d) : i < 60 ? ((b & c) | (b & d) | (c & d)) : (b ^ c ^ d);
      const k = i < 20 ? 0x5a827999 : i < 40 ? 0x6ed9eba1 : i < 60 ? 0x8f1bbcdc : 0xca62c1d6;
      const t = (((rotl(a, 5) + (f >>> 0) + e + k + (w[i] as number)) >>> 0));
      e = d; d = c; c = rotl(b, 30); b = a; a = t;
    }
    h0 = ((h0 + a) >>> 0); h1 = ((h1 + b) >>> 0); h2 = ((h2 + c) >>> 0); h3 = ((h3 + d) >>> 0); h4 = ((h4 + e) >>> 0);
  }
  const out: number[] = [];
  for (const h of [h0, h1, h2, h3, h4]) {
    out.push((h >>> 24) & 255, (h >>> 16) & 255, (h >>> 8) & 255, h & 255);
  }
  return out;
}
