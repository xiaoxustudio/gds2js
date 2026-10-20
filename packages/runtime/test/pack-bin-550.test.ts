/** PackedByteArray.decode_/encode_ 的整数八对（S550），读数 `tmp/d6/s550.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { V } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { I } from "./support/variants";

const pb = (xs: number[]) => V.object(new GBytes(xs, "byte"));

function capture(f: () => unknown): { value: unknown; text: string } {
  const writes: string[] = [];
  const orig = process.stderr.write;
  process.stderr.write = ((chunk: string) => {
    writes.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;
  let value: unknown;
  try {
    value = f();
  } finally {
    process.stderr.write = orig;
  }
  return { value, text: writes.join("").split("\n").slice(0, 2).join("§") };
}

const dec = (v: ReturnType<typeof pb>, name: string, off: number) => show(capture(() => method(v, name, [I(off)])).value as ReturnType<typeof V.int>);

describe("PackedByteArray.decode_*（S550）", () => {
  const p = pb([1, 130, 255, 127, 0, 0, 128, 63]);
  it("小端、符号扩展与 u64 的 int64 回绕", () => {
    eq("550", "u8/s8", `${dec(p, "decode_u8", 1)}/${dec(p, "decode_s8", 1)}/${dec(p, "decode_s8", 2)}/${dec(p, "decode_u8", 0)}`, "130/-126/-1/1");
    eq("550", "u16/s16/u32/s32", `${dec(p, "decode_u16", 0)}/${dec(p, "decode_s16", 0)}/${dec(p, "decode_u32", 0)}/${dec(p, "decode_s32", 0)}`, "33281/-32255/2147451393/2147451393");
    eq("550", "u64/s64", `${dec(p, "decode_u64", 0)}/${dec(p, "decode_s64", 0)}`, "4575657223555875329/4575657223555875329");
    const n = pb([255, 255, 255, 255, 255, 255, 255, 255]);
    eq("550", "全 ff 回绕成 -1", `${dec(n, "decode_u64", 0)}/${dec(n, "decode_s64", 0)}`, "-1/-1");
  });
  it("越界回 0 且那块带 Returning: 0（四个宽度）", () => {
    const u8 = capture(() => method(p, "decode_u8", [I(99)]));
    eq("550", "u8 越界", `${show(u8.value as ReturnType<typeof V.int>)}|${u8.text}`, `0|ERROR: Condition "p_offset < 0 || p_offset > int64_t(size) - 1" is true. Returning: 0§   at: func_PackedByteArray_decode_u8 (core/variant/variant_call.cpp:859)`);
    const u16 = capture(() => method(p, "decode_u16", [I(-1)]));
    eq("550", "u16 负偏移", u16.text.split("§")[0], `ERROR: Condition "p_offset < 0 || p_offset > (int64_t(size) - 2)" is true. Returning: 0`);
    const u64 = capture(() => method(p, "decode_u64", [I(4)]));
    eq("550", "u64 不够 8 字节", `${u64.text.split("§")[0]}|${u64.text.split("§")[1]}`, `ERROR: Condition "p_offset < 0 || p_offset > (int64_t(size) - 8)" is true. Returning: 0|   at: func_PackedByteArray_decode_u64 (core/variant/variant_call.cpp:895)`);
  });
});

describe("PackedByteArray.encode_*（S550）", () => {
  it("值按宽度回绕、小端写", () => {
    const q = pb([0, 0, 0, 0, 0, 0, 0, 0]);
    method(q, "encode_u8", [I(0), I(300)]);
    method(q, "encode_s8", [I(1), I(-1)]);
    method(q, "encode_u16", [I(2), I(65537)]);
    method(q, "encode_s16", [I(4), I(-2)]);
    eq("550", "u8/s8/u16/s16", show(q), "[44, 255, 1, 0, 254, 255, 0, 0]");
    const r = pb([0, 0, 0, 0, 0, 0, 0, 0]);
    method(r, "encode_u32", [I(0), I(4294967295)]);
    method(r, "encode_s32", [I(4), I(-2147483648)]);
    eq("550", "u32/s32", show(r), "[255, 255, 255, 255, 0, 0, 0, 128]");
    const s = pb([0, 0, 0, 0, 0, 0, 0, 0]);
    method(s, "encode_u64", [I(0), I(-1)]);
    eq("550", "u64 -1", show(s), "[255, 255, 255, 255, 255, 255, 255, 255]");
    const t = pb([0, 0, 0, 0, 0, 0, 0, 0]);
    method(t, "encode_s64", [I(0), I(-2)]);
    eq("550", "s64 -2", show(t), "[254, 255, 255, 255, 255, 255, 255, 255]");
  });
  it("越界块不带 Returning、字节不动", () => {
    const u = pb([9, 9]);
    const a = capture(() => method(u, "encode_u8", [I(5), I(1)]));
    const b = capture(() => method(u, "encode_u64", [I(0), I(1)]));
    eq("550", "两处越界", `${show(u)}|${a.text.split("§")[0]}|${b.text.split("§")[0]}`, `[9, 9]|ERROR: Condition "p_offset < 0 || p_offset > int64_t(size) - 1" is true.|ERROR: Condition "p_offset < 0 || p_offset > (int64_t(size) - 8)" is true.`);
  });
  it("非 byte pack 上是 Nonexistent function", () => {
    let msg = "";
    try {
      method(V.object(new GBytes([1, 2], "int32")), "decode_u8", [I(0)]);
    } catch (e) {
      msg = (e as { message?: string }).message ?? "";
    }
    eq("550", "int32 上 decode_u8", msg, "Invalid call. Nonexistent function 'decode_u8' in base 'PackedInt32Array'.");
  });
});
