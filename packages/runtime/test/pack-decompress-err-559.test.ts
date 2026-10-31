/** `PackedByteArray.decompress()` 的三块失败文案（S559），读数 `tmp/d6/s560b.gd` / `s561.gd`。 */
import { describe, it } from "vitest";
import { deflateSync, inflateSync } from "node:zlib";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GBytes, registerZipCodec } from "@gds2js/runtime/runtime/class/bytes/packed";
import { V } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { I } from "./support/variants";

registerZipCodec(1, {
  pack: (b) => new Uint8Array(deflateSync(b)),
  unpack: (b) => new Uint8Array(inflateSync(b)),
});

const pb = (xs: number[]) => V.object(new GBytes(xs, "byte"));

function capture<T>(f: () => T): { value: T; lines: string[] } {
  const writes: string[] = [];
  const orig = process.stderr.write;
  process.stderr.write = ((chunk: string) => {
    writes.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;
  let value!: T;
  try {
    value = f();
  } finally {
    process.stderr.write = orig;
  }
  return { value, lines: writes.join("").split("\n").filter((l) => l !== "") };
}

describe("PackedByteArray.decompress 失败文案（S559）", () => {
  const src: number[] = [];
  for (let i = 0; i < 100; i++) src.push(i);
  const c = method(pb(src), "compress", [I(1)]);
  it("buffer_size ≤ 0：818 块 + 空", () => {
    const r = capture(() => method(c, "decompress", [I(0), I(1)]));
    eq("559", "0 档", `${show(r.value as ReturnType<typeof V.array>)}|${r.lines[0]}|${r.lines[1]}`, `[]|ERROR: Decompression buffer size must be greater than zero.|   at: func_PackedByteArray_decompress (core/variant/variant_call.cpp:818)`);
    const n = capture(() => method(c, "decompress", [I(-3), I(1)]));
    eq("559", "-3 档", `${show(n.value as ReturnType<typeof V.array>)}|${n.lines[0]}`, `[]|ERROR: Decompression buffer size must be greater than zero.`);
  });
  it("空压缩源：821 块 + 空", () => {
    const e = capture(() => method(pb([]), "decompress", [I(10), I(1)]));
    eq("559", "空源", `${show(e.value as ReturnType<typeof V.array>)}|${e.lines[0]}|${e.lines[1]}`, `[]|ERROR: Compressed buffer size must be greater than zero.|   at: func_PackedByteArray_decompress (core/variant/variant_call.cpp:821)`);
  });
  it("上限不足 / 坏数据：zlib 两支打 197 块 + 空；FastLZ 那支不打块", () => {
    const small = capture(() => method(c, "decompress", [I(10), I(1)]));
    eq("559", "上限 10", `${show(small.value as ReturnType<typeof V.array>)}|${small.lines[0]}|${small.lines[1]}`, `[]|ERROR: Condition "err != 1" is true. Returning: -1|   at: decompress (core/io/compression.cpp:197)`);
    const bad = capture(() => method(pb([1, 2, 3]), "decompress", [I(17), I(1)]));
    eq("559", "坏数据", `${show(bad.value as ReturnType<typeof V.array>)}|${bad.lines[0]}`, `[]|ERROR: Condition "err != 1" is true. Returning: -1`);
    const fz = capture(() => method(c, "decompress", [I(16), I(0)]));
    eq("559", "FastLZ 上限不足不打块", `${show(fz.value as ReturnType<typeof V.array>)}|${fz.lines.length}`, "[]|0");
  });
});
