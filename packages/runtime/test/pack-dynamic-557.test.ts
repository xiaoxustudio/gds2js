/** PackedByteArray.decompress_dynamic（S557），读数 `tmp/d6/s560*.gd`。测试里手动挂 node:zlib 的 deflate 编解码器。 */
import { describe, it } from "vitest";
import { deflateSync, inflateSync } from "node:zlib";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GBytes, registerZipCodec } from "@gds2js/runtime/runtime/packed";
import { V } from "@gds2js/runtime/runtime/tags";
import { show, valueEq } from "@gds2js/runtime/runtime/values";
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

describe("PackedByteArray.decompress_dynamic（S557）", () => {
  const src = Array.from({ length: 100 }, (_, i) => i % 251);
  const p = pb(src);
  const c = method(p, "compress", [I(1)]);
  it("上限够就整段还原", () => {
    const out = method(c, "decompress_dynamic", [I(2000), I(1)]);
    eq("557", "2000 上限", `${String(valueEq(out, p))}/${String((out.v as GBytes).length)}`, "true/100");
  });
  it("上限不足 / 上限 0 / 坏数据都打 844 块回空", () => {
    const small = capture(() => method(c, "decompress_dynamic", [I(10), I(1)]));
    eq("557", "上限 10", `${show(small.value as ReturnType<typeof V.array>)}|${small.lines[0]}|${small.lines[1]}`, `[]|ERROR: Decompression failed.|   at: func_PackedByteArray_decompress_dynamic (core/variant/variant_call.cpp:844)`);
    const zero = capture(() => method(c, "decompress_dynamic", [I(0), I(1)]));
    eq("557", "上限 0", `${show(zero.value as ReturnType<typeof V.array>)}|${zero.lines[0]}`, `[]|ERROR: Decompression failed.`);
    const bad = capture(() => method(pb([1, 2, 3]), "decompress_dynamic", [I(100), I(1)]));
    eq("557", "坏数据", `${show(bad.value as ReturnType<typeof V.array>)}|${bad.lines[0]}`, `[]|ERROR: Decompression failed.`);
  });
  it("空输入先打 compression 233 再打 844", () => {
    const e = capture(() => method(pb([]), "decompress_dynamic", [I(10), I(1)]));
    eq("557", "空输入两块", `${show(e.value as ReturnType<typeof V.array>)}|${e.lines[0]}|${e.lines[1]}|${e.lines[3]}`, `[]|ERROR: Condition "p_src_size <= 0" is true. Returning: (-3)|   at: decompress_dynamic (core/io/compression.cpp:233)|ERROR: Decompression failed.`);
  });
  it("mode 0 / 2：295 + 844 两块后回空（S560）", () => {
    const z = capture(() => method(c, "decompress_dynamic", [I(100)]));
    eq("560", "mode 0", `${show(z.value as ReturnType<typeof V.array>)}|${z.lines[0]}|${z.lines[1]}`, `[]|ERROR: Condition "p_mode != MODE_DEFLATE && p_mode != MODE_GZIP" is true. Returning: (-1)|   at: decompress_dynamic (core/io/compression.cpp:295)`);
    const t = capture(() => method(c, "decompress_dynamic", [I(100), I(2)]));
    eq("560", "mode 2", `${show(t.value as ReturnType<typeof V.array>)}|${t.lines[0]}`, `[]|ERROR: Condition "p_mode != MODE_DEFLATE && p_mode != MODE_GZIP" is true. Returning: (-1)`);
  });
});
