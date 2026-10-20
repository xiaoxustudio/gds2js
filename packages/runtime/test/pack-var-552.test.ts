/** PackedByteArray.has_encoded_var / decode_var / decode_var_size / encode_var（S552），读数 `tmp/d6/s552*.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { V } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { I, S } from "./support/variants";

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

describe("PackedByteArray var 编解码（S552）", () => {
  it("encode_var 写 42 后三支读回同一格", () => {
    const b = pb(new Array(32).fill(0));
    eq("552", "encode_var 返回 8", String(method(b, "encode_var", [I(0), I(42)]).v), "8");
    eq("552", "decode_var", String(method(b, "decode_var", [I(0)]).v), "42");
    eq("552", "decode_var_size", String(method(b, "decode_var_size", [I(0)]).v), "8");
    eq("552", "has_encoded_var", String(method(b, "has_encoded_var", [I(0)]).v), "true");
    eq("552", "带 allow_objects 的两支", `${String(method(b, "decode_var_size", [I(0), V.bool(true)]).v)}/${String(method(b, "has_encoded_var", [I(0), V.bool(true)]).v)}`, "8/true");
  });
  it("mid-offset 写读；装不下回 -1 且字节不动", () => {
    const d = pb(new Array(16).fill(0));
    eq("552", "offset 4 写 hi 返回 12", String(method(d, "encode_var", [I(4), S("hi")]).v), "12");
    eq("552", "offset 4 读回", String(method(d, "decode_var", [I(4)]).v), "hi");
    eq("552", "offset 4 size", String(method(d, "decode_var_size", [I(4)]).v), "12");
    const c = pb([9, 9, 9]);
    eq("552", "装不下", `${String(method(c, "encode_var", [I(0), I(42)]).v)}|${show(c)}`, "-1|[9, 9, 9]");
  });
  it("负偏移四支：各回 -1 / null / 0 / false 并打块", () => {
    const b = pb(new Array(8).fill(0));
    const e = capture(() => method(b, "encode_var", [I(-1), I(1)]));
    eq("552", "encode_var(-1)", `${show(e.value as ReturnType<typeof V.int>)}|${e.text}`, `-1|ERROR: Condition "p_offset < 0" is true. Returning: -1§   at: func_PackedByteArray_encode_var (core/variant/variant_call.cpp:1143)`);
    const d = capture(() => method(b, "decode_var", [I(-1)]));
    eq("552", "decode_var(-1)", `${d.value.t === 0 ? "null" : "?"}|${d.text.split("§")[0]}`, `null|ERROR: Condition "p_offset < 0" is true. Returning: Variant()`);
    const s = capture(() => method(b, "decode_var_size", [I(-1)]));
    eq("552", "decode_var_size(-1)", `${String((s.value as ReturnType<typeof V.int>).v)}|${s.text.split("§")[0]}`, `0|ERROR: Condition "p_offset < 0" is true. Returning: 0`);
    const h = capture(() => method(b, "has_encoded_var", [I(-1)]));
    eq("552", "has_encoded_var(-1)", `${String((h.value as ReturnType<typeof V.bool>).v)}|${h.text.split("§")[0]}`, `false|ERROR: Condition "p_offset < 0" is true. Returning: false`);
  });
  it("剩余不足 4 字节：打 len < 4 块，三支给 null / 0 / false", () => {
    const b = pb(new Array(8).fill(0));
    method(b, "encode_var", [I(0), I(7)]);
    for (const off of [8, 99]) {
      const d = capture(() => method(b, "decode_var", [I(off)]));
      eq("552", `decode_var(${off})`, `${d.value.t === 0 ? "null" : "?"}|${d.text}`, `null|ERROR: Condition "len < 4" is true. Returning: ERR_INVALID_DATA§   at: decode_variant (core/io/marshalls.cpp:190)`);
      eq("552", `decode_var_size(${off})`, String((capture(() => method(b, "decode_var_size", [I(off)])).value as ReturnType<typeof V.int>).v), "0");
      eq("552", `has_encoded_var(${off})`, String((capture(() => method(b, "has_encoded_var", [I(off)])).value as ReturnType<typeof V.bool>).v), "false");
    }
  });
});
