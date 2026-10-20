/** PackedByteArray 的 half/float/double 编解码（S551），读数 `tmp/d6/s551*.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { V } from "@gds2js/runtime/runtime/tags";
import { show, varToStr } from "@gds2js/runtime/runtime/values";
import "@gds2js/runtime/runtime/builtins";
import { I } from "./support/variants";

const pb = (xs: number[]) => V.object(new GBytes(xs, "byte"));

function capture<T>(f: () => T): { value: T; text: string } {
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
  return { value, text: writes.join("").split("\n").slice(0, 2).join("§") };
}

describe("PackedByteArray half/float/double（S551）", () => {
  it("encode/decode 往返：float32 与 double", () => {
    const f = pb([0, 0, 0, 0]);
    method(f, "encode_float", [I(0), V.float(0.1)]);
    eq("551", "encode_float 0.1", show(f), "[205, 204, 204, 61]");
    eq("551", "decode_float 0.1", varToStr(method(f, "decode_float", [I(0)])), "0.1");
    const d = pb([0, 0, 0, 0, 0, 0, 0, 0]);
    method(d, "encode_double", [I(0), V.float(2.5)]);
    eq("551", "encode_double 2.5", show(d), "[0, 0, 0, 0, 0, 0, 4, 64]");
    eq("551", "decode_double 2.5", varToStr(method(d, "decode_double", [I(0)])), "2.5");
  });
  it("half：截断尾数、denormal 归零、-0 丢符号、NaN 折全 1", () => {
    const h = pb([0, 0, 0, 0]);
    method(h, "encode_half", [I(0), V.float(1.5)]);
    method(h, "encode_half", [I(2), V.float(0.1)]);
    eq("551", "encode_half 1.5 / 0.1", show(h), "[0, 62, 102, 46]");
    eq("551", "decode_half 1.5 / 0.1", `${varToStr(method(h, "decode_half", [I(0)]))}/${varToStr(method(h, "decode_half", [I(2)]))}`, "1.5/0.099975586");
    const r = pb([0, 0, 0, 0]);
    method(r, "encode_half", [I(0), V.float(65504)]);
    method(r, "encode_half", [I(2), V.float(65520)]);
    eq("551", "65520 截断成 65504", show(r), "[255, 123, 255, 123]");
    const z = pb([9, 9, 9, 9]);
    method(z, "encode_half", [I(0), V.float(1e-8)]);
    method(z, "encode_half", [I(2), V.float(-0)]);
    eq("551", "denormal 与 -0 都归零", show(z), "[0, 0, 0, 0]");
    const b = pb([0x00, 0x3c, 0x00, 0x7c, 0x00, 0xfc, 0x00, 0x7e, 0x01, 0x00]);
    eq("551", "decode_half 1 / inf / -inf / nan / subnormal", [0, 2, 4, 6, 8].map((o) => varToStr(method(b, "decode_half", [I(o)]))).join("|"), "1.0|inf|inf_neg|nan|5.9604645e-08");
  });
  it("越界：读侧带 Returning: 0、写侧不带，字节不动", () => {
    const r = capture(() => method(pb([0, 0]), "decode_half", [I(99)]));
    eq("551", "decode_half 越界", `${varToStr(r.value)}|${r.text}`, `0.0|ERROR: Condition "p_offset < 0 || p_offset > (int64_t(size) - 2)" is true. Returning: 0§   at: func_PackedByteArray_decode_half (core/variant/variant_call.cpp:907)`);
    const u = pb([9, 9]);
    const w = capture(() => method(u, "encode_half", [I(1), V.float(1)]));
    eq("551", "encode_half 越界", `${show(u)}|${w.text.split("§")[0]}`, `[9, 9]|ERROR: Condition "p_offset < 0 || p_offset > int64_t(size) - 2" is true.`);
  });
});
