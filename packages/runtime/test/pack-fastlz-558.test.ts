/** `PackedByteArray.compress(0)` / `decompress(…, 0)` 的 FastLZ（S558），读数 `tmp/d6/s562*.gd`（与引擎逐字节对过）。 */
import { describe, it } from "vitest";
import { createHash } from "node:crypto";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { V } from "@gds2js/runtime/runtime/tags";
import { I } from "./support/variants";

const pb = (xs: number[]) => V.object(new GBytes(xs, "byte"));
const hex = (v: ReturnType<typeof pb>): string =>
  Array.from((v.v as GBytes).raw() as number[]).map((x) => (x & 0xff).toString(16).padStart(2, "0")).join("");

describe("PackedByteArray FastLZ 模式 0（S558）", () => {
  it("level 1：1..100 字节的压缩字节与引擎逐字节一致（<16 输入先补零到 16）", () => {
    const EXP: Array<[number, string]> = [
      [1, "0f01000000000000000000000000000000"],
      [3, "0f01080f00000000000000000000000000"],
      [15, "0f01080f161d242b323940474e555c6300"],
      [16, "0f01080f161d242b323940474e555c636a"],
      [17, "1001080f161d242b323940474e555c636a71"],
      [32, "1f01080f161d242b323940474e555c636a71787f868d949ba2a9b0b7bec5ccd3da"],
      [100, "1f01080f161d242b323940474e555c636a71787f868d949ba2a9b0b7bec5ccd3da1fe1e8eff6fd040b121920272e353c434a51585f666d747b828990979ea5acb3ba1fc1c8cfd6dde4ebf2f900070e151c232a31383f464d545b626970777e858c939a03a1a8afb6"],
    ];
    for (const [n, want] of EXP) {
      const src: number[] = [];
      for (let i = 0; i < n; i++) src.push((i * 7 + 1) % 256);
      eq("558", `n=${n}`, hex(method(pb(src), "compress", [I(0)]) as ReturnType<typeof pb>), want);
    }
    eq("558", "空输入给空", hex(method(pb([]), "compress", [I(0)]) as ReturnType<typeof pb>), "");
  });
  it("decompress：≥16 上限给真身；<16 只拷前 buffer_size 字节", () => {
    const c = method(pb([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]), "compress", [I(0)]);
    eq("558", "上限 17 给 16 字节", hex(method(c, "decompress", [I(17), I(0)]) as ReturnType<typeof pb>), "0102030405060708090a0b0c0d0e0f10");
    eq("558", "上限 5 拷前 5", hex(method(c, "decompress", [I(5), I(0)]) as ReturnType<typeof pb>), "0102030405");
    eq("558", "上限 15", hex(method(c, "decompress", [I(15), I(0)]) as ReturnType<typeof pb>), "0102030405060708090a0b0c0d0e0f");
    eq("558", "上限 0 给空", hex(method(c, "decompress", [I(0), I(0)]) as ReturnType<typeof pb>), "");
  });
  it("level 2：70000 字节压缩与引擎同字节（sha256）", () => {
    const big: number[] = [];
    for (let i = 0; i < 70000; i++) big.push((i * 31 + Math.floor(i / 97)) % 251);
    const c = method(pb(big), "compress", [I(0)]) as ReturnType<typeof pb>;
    const raw = (c.v as GBytes).raw() as number[];
    eq("558", "长度 7085", String(raw.length), "7085");
    eq("558", "sha256", createHash("sha256").update(Buffer.from(raw.map((x) => x & 0xff))).digest("hex"), "266591331592916b28d69bdfc7d980dc59acde3a6eb3f496ebd0aa132dee2b11");
    const d = method(c, "decompress", [I(70000), I(0)]) as ReturnType<typeof pb>;
    eq("558", "回环相等", hex(d), hex(pb(big)));
  });
});
