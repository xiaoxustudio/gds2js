/** `to_multibyte_char_buffer` / `get_string_from_multibyte_char` 的 UTF-8 与 ISO-8859-1 形（S570），读数 `tmp/d6/s570.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { V } from "@gds2js/runtime/runtime/tags";
import { S } from "./support/variants";

const pb = (xs: number[]) => V.object(new GBytes(xs, "byte"));

function hex(v: unknown): string {
  const b = (v as { v: GBytes }).v;
  return b.raw().map((x) => (x as number).toString(16).padStart(2, "0")).join("");
}

function capture(f: () => unknown): { value: unknown; message: string; lines: string[] } {
  const writes: string[] = [];
  const orig = process.stderr.write;
  process.stderr.write = ((chunk: string) => {
    writes.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;
  let value: unknown;
  let message = "";
  try {
    value = f();
  } catch (e) {
    message = (e as { message?: string }).message ?? "?";
  } finally {
    process.stderr.write = orig;
  }
  return { value, message, lines: writes.join("").split("\n").filter((l) => l !== "") };
}

describe("String.to_multibyte_char_buffer（S570）", () => {
  const conv = (s: string, enc?: string) => hex(method(S(s), "to_multibyte_char_buffer", enc === undefined ? [] : [S(enc)]));
  it("UTF-8 与 ISO-8859-1 都是末尾补一个 0x00", () => {
    eq("570", "UTF-8", conv("Aé汉😀", "UTF-8"), "41c3a9e6b189f09f988000");
    eq("570", "小写同", conv("Aé汉😀", "utf-8"), "41c3a9e6b189f09f988000");
    eq("570", "Latin-1", conv("Aé汉😀", "ISO-8859-1"), "41e93f3f3f00");
  });
  it("未知编码响亮拒；空编码 / 空串也拒", () => {
    eq("570", "未知", capture(() => method(S("A汉"), "to_multibyte_char_buffer", [S("NOPE")])).message.includes('编码 "NOPE" 没接'), true);
    eq("570", "空编码", capture(() => method(S("A"), "to_multibyte_char_buffer", [])).message.includes("宿主 ANSI 代码页"), true);
    eq("570", "空串 Error 87", capture(() => method(S(""), "to_multibyte_char_buffer", [S("UTF-8")])).message.includes("Error 87"), true);
  });
});

describe("PackedByteArray.get_string_from_multibyte_char（S570）", () => {
  const from = (xs: number[], enc?: string) => method(pb(xs), "get_string_from_multibyte_char", enc === undefined ? [] : [S(enc)]);
  const utf32 = (r: unknown) => hex(method(r, "to_utf32_buffer", []));
  it("UTF-8：合法序列还原；坏序列按 Windows 的 U+FFFD", () => {
    eq("570", "éA", utf32(from([0xc3, 0xa9, 0x41], "UTF-8")), "e900000041000000");
    eq("570", "emoji", utf32(from([0xf0, 0x9f, 0x98, 0x80], "UTF-8")), "00f60100");
    eq("570", "单字节 E9", utf32(from([0xe9], "UTF-8")), "fdff0000");
    eq("570", "截断的 C3", utf32(from([0xc3], "UTF-8")), "fdff0000");
    eq("570", "小写编码名", utf32(from([0xc3, 0xa9], "utf-8")), "e9000000");
  });
  it("ISO-8859-1 逐字节折码点", () => {
    eq("570", "E9 41", utf32(from([0xe9, 0x41], "ISO-8859-1")), "e900000041000000");
  });
  it("首个 0x00 截断；空 pack 给空且不打块", () => {
    eq("570", "NUL", `${method(from([0x41, 0x00, 0x42], "UTF-8"), "length", []).v}`, "1");
    const empty = capture(() => from([], "UTF-8"));
    eq("570", "空", `${method(empty.value, "length", []).v}|${empty.lines.length}`, "0|0");
  });
  it("未知编码响亮拒（非空与空 pack 同一支）", () => {
    eq("570", "非空", capture(() => from([0x41], "NOPE")).message.includes('编码 "NOPE" 没接'), true);
    eq("570", "空 pack", capture(() => from([], "NOPE")).message.includes('编码 "NOPE" 没接'), true);
    eq("570", "空编码", capture(() => from([0x41], "")).message.includes("宿主 ANSI 代码页"), true);
    eq("570", "缺省编码", capture(() => from([0x41])).message.includes("宿主 ANSI 代码页"), true);
  });
});
