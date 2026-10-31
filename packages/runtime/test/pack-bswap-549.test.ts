/** PackedByteArray.bswap16/32/64（S549）：原地换序、offset/count 口径与两块 ERR_FAIL，读数 `tmp/d6/s549*.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { V } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { I } from "./support/variants";

const pb = (xs: number[]) => V.object(new GBytes(xs, "byte"));

function run(v: ReturnType<typeof pb>, name: string, args: ReturnType<typeof I>[] = []): { text: string; err: string } {
  const writes: string[] = [];
  const orig = process.stderr.write;
  process.stderr.write = ((chunk: string) => {
    writes.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;
  let text = "";
  try {
    method(v, name, args);
    text = show(v);
  } finally {
    process.stderr.write = orig;
  }
  return { text, err: writes.join("").split("\n").slice(0, 2).join("§") };
}

describe("PackedByteArray.bswap（S549）", () => {
  it("默认整片换序；不够一组的尾巴原样留着", () => {
    eq("549", "bswap16 4 字节", run(pb([1, 2, 3, 4]), "bswap16").text, "[2, 1, 4, 3]");
    eq("549", "bswap32 4 字节", run(pb([1, 2, 3, 4]), "bswap32").text, "[4, 3, 2, 1]");
    eq("549", "bswap64 8 字节", run(pb([1, 2, 3, 4, 5, 6, 7, 8]), "bswap64").text, "[8, 7, 6, 5, 4, 3, 2, 1]");
    eq("549", "bswap16 3 字节", run(pb([1, 2, 3]), "bswap16").text, "[2, 1, 3]");
    eq("549", "bswap32 6 字节", run(pb([1, 2, 3, 4, 5, 6]), "bswap32").text, "[4, 3, 2, 1, 5, 6]");
    eq("549", "bswap64 12 字节", run(pb([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), "bswap64").text, "[8, 7, 6, 5, 4, 3, 2, 1, 9, 10, 11, 12]");
    eq("549", "空 pack 三支都原样", `${run(pb([]), "bswap16").text}/${run(pb([]), "bswap32").text}/${run(pb([]), "bswap64").text}`, "[ ]/[ ]/[ ]".replace(/ /g, ""));
  });
  it("offset / count；count=0 提前返回", () => {
    eq("549", "bswap16(2,1)", run(pb([1, 2, 3, 4, 5, 6, 7, 8]), "bswap16", [I(2), I(1)]).text, "[1, 2, 4, 3, 5, 6, 7, 8]");
    eq("549", "bswap32(4)", run(pb([1, 2, 3, 4, 5, 6, 7, 8]), "bswap32", [I(4)]).text, "[1, 2, 3, 4, 8, 7, 6, 5]");
    eq("549", "bswap16(0,3)", run(pb([1, 2, 3, 4, 5, 6, 7, 8]), "bswap16", [I(0), I(3)]).text, "[2, 1, 4, 3, 6, 5, 7, 8]");
    eq("549", "bswap16(6,1)", run(pb([1, 2, 3, 4, 5, 6, 7, 8]), "bswap16", [I(6), I(1)]).text, "[1, 2, 3, 4, 5, 6, 8, 7]");
    const z = run(pb([1, 2, 3, 4, 5, 6, 7, 8]), "bswap16", [I(99), I(0)]);
    eq("549", "count=0 提前返回（offset 越界也不报）", `${z.text}|${z.err}`, "[1, 2, 3, 4, 5, 6, 7, 8]|");
  });
  it("越界 / count 过大打 ERR_FAIL 块且字节不动", () => {
    const o16 = run(pb([1]), "bswap16");
    eq("549", "bswap16 1 字节", `${o16.text}|${o16.err}`, `[1]|ERROR: Condition "p_offset < 0 || p_offset > int64_t(sz) - 2" is true.§   at: func_PackedByteArray_bswap16 (core/variant/variant_call.cpp:702)`);
    const o32 = run(pb([1, 2, 3]), "bswap32");
    eq("549", "bswap32 3 字节", `${o32.text}|${o32.err}`, `[1, 2, 3]|ERROR: Condition "p_offset < 0 || p_offset > int64_t(sz) - 4" is true.§   at: func_PackedByteArray_bswap32 (core/variant/variant_call.cpp:719)`);
    const o64 = run(pb([1, 2, 3]), "bswap64");
    eq("549", "bswap64 3 字节", `${o64.text}|${o64.err}`, `[1, 2, 3]|ERROR: Condition "p_offset < 0 || p_offset > int64_t(sz) - 8" is true.§   at: func_PackedByteArray_bswap64 (core/variant/variant_call.cpp:736)`);
    const c16 = run(pb([1, 2, 3, 4]), "bswap16", [I(0), I(3)]);
    eq("549", "count 过大", `${c16.text}|${c16.err}`, `[1, 2, 3, 4]|ERROR: Condition "p_count > floor((sz - p_offset) / 2)" is true.§   at: func_PackedByteArray_bswap16 (core/variant/variant_call.cpp:706)`);
    const neg = run(pb([1, 2, 3, 4]), "bswap16", [I(-1), I(1)]);
    eq("549", "负 offset", `${neg.text}|${neg.err.split("§")[0]}`, `[1, 2, 3, 4]|ERROR: Condition "p_offset < 0 || p_offset > int64_t(sz) - 2" is true.`);
    const tail = run(pb([1, 2, 3, 4]), "bswap16", [I(3), I(1)]);
    eq("549", "offset 只剩 1 字节", `${tail.text}|${tail.err.split("§")[0]}`, `[1, 2, 3, 4]|ERROR: Condition "p_offset < 0 || p_offset > int64_t(sz) - 2" is true.`);
  });
  it("非 byte pack 上是 Nonexistent function", () => {
    const v = V.object(new GBytes([1, 2], "int32"));
    let code = "没抛";
    let msg = "";
    try {
      method(v, "bswap16", []);
    } catch (e) {
      code = (e as { code?: string }).code ?? "?";
      msg = (e as { message?: string }).message ?? "";
    }
    eq("549", "int32 上 bswap16", `${code}|${msg}`, "packed-no-method|Invalid call. Nonexistent function 'bswap16' in base 'PackedInt32Array'.");
  });
});
