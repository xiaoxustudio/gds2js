/**
 * MD5（RFC 1321），只为 `String.md5_text()` 服务。
 *
 * 为什么自带而不是 `node:crypto`：产物要能被 tsdown 打成**单文件 bundle**并在仓库外、
 * 非 Node 环境下跑（见 §5.7），引内置模块会在浏览器/打包侧直接失效。
 *
 * 正确性由 Godot 实测向量钉住（语料 077 + ops-check）：空串、"abc"、"The quick brown fox"、
 * 中文（UTF-8 字节序）都与 `System_security::compute_md5` 一致，也与 Node crypto 一致。
 */

const S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9,
  14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15,
  21, 6, 10, 15, 21,
];

const K = new Int32Array(
  Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) | 0),
);

/** 按 UTF-8 字节算 md5，返回小写十六进制（与 Godot 一致）。 */
export function md5Hex(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const bitLen = bytes.length * 8;
  // 尾部：0x80 + 若干 0 + 64 位小端长度，凑到 64 字节的整数倍
  const padded = new Uint8Array((((bytes.length + 8) >> 6) + 1) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, bitLen >>> 0, true);
  view.setUint32(padded.length - 4, Math.floor(bitLen / 0x100000000), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const words = new Int32Array(16);
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) words[i] = view.getInt32(off + i * 4, true);
    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;
    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) & 15;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) & 15;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) & 15;
      }
      F = (F + A + K[i]! + words[g]!) | 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((F << S[i]!) | (F >>> (32 - S[i]!)))) | 0;
    }
    a0 = (a0 + A) | 0;
    b0 = (b0 + B) | 0;
    c0 = (c0 + C) | 0;
    d0 = (d0 + D) | 0;
  }

  let out = "";
  for (const w of [a0, b0, c0, d0]) {
    for (let i = 0; i < 4; i++) out += ((w >>> (i * 8)) & 0xff).toString(16).padStart(2, "0");
  }
  return out;
}
