/** String 的 buffer 四支与非 ASCII 的 ascii 两向（S569），读数 `tmp/d6/s569.gd`。 */
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

function call(s: string, name: string): string {
  return hex(method(S(s), name, []));
}

function capture(f: () => unknown): { value: unknown; lines: string[] } {
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
  return { value, lines: writes.join("").split("\n").filter((l) => l !== "") };
}

describe("String buffer 四支（S569）", () => {
  it("utf16 / wchar 是代理对逐码元的 LE", () => {
    eq("569", "混合", `${call("Aé汉😀", "to_utf16_buffer")}|${call("Aé汉😀", "to_wchar_buffer")}`, "4100e900496c3dd800de|4100e900496c3dd800de");
    eq("569", "emoji", `${call("😀", "to_utf16_buffer")}|${call("😀", "to_wchar_buffer")}`, "3dd800de|3dd800de");
    eq("569", "abc", call("abc", "to_utf16_buffer"), "610062006300");
  });
  it("utf32 是码点 4 字节 LE", () => {
    eq("569", "混合", call("Aé汉😀", "to_utf32_buffer"), "41000000e9000000496c000000f60100");
    eq("569", "emoji", call("😀", "to_utf32_buffer"), "00f60100");
    eq("569", "abc", call("abc", "to_utf32_buffer"), "610000006200000063000000");
  });
  it("空串四支都给空", () => {
    eq("569", "空", ["to_utf16_buffer", "to_utf32_buffer", "to_ascii_buffer", "to_wchar_buffer"].map((n) => call("", n).length).join("/"), "0/0/0/0");
  });
  it("to_ascii_buffer：非 ASCII 换成 0x20，逐码点打一行 Unicode 解析错", () => {
    const mixed = capture(() => method(S("a汉😀b"), "to_ascii_buffer", []));
    eq("569", "混合字节", hex(mixed.value), "61202062");
    eq("569", "混合两行", `${mixed.lines.length}|${mixed.lines[0]}|${mixed.lines[1]}`, "2|Unicode parsing error: Invalid unicode codepoint (6c49), cannot represent as ASCII/Latin-1|Unicode parsing error: Invalid unicode codepoint (1f600), cannot represent as ASCII/Latin-1");
    const one = capture(() => method(S("é"), "to_ascii_buffer", []));
    eq("569", "单字", `${hex(one.value)}|${one.lines[0]}`, "20|Unicode parsing error: Invalid unicode codepoint (e9), cannot represent as ASCII/Latin-1");
    const plain = capture(() => method(S("abc"), "to_ascii_buffer", []));
    eq("569", "纯 ASCII 不打行", `${hex(plain.value)}|${plain.lines.length}`, "616263|0");
  });
});

describe("PackedByteArray.get_string_from_ascii（S569）", () => {
  const fromAscii = (xs: number[]) => method(pb(xs), "get_string_from_ascii", []);
  it("按 Latin-1 逐字节折码点，不按 UTF-8", () => {
    eq("569", "C3 A9 41", hex(method(fromAscii([0xc3, 0xa9, 0x41]), "to_utf32_buffer", [])), "c3000000a900000041000000");
    eq("569", "E9", hex(method(fromAscii([0xe9]), "to_utf32_buffer", [])), "e9000000");
    eq("569", "FF", hex(method(fromAscii([0xff]), "to_utf32_buffer", [])), "ff000000");
    eq("569", "80 41", hex(method(fromAscii([0x80, 0x41]), "to_utf32_buffer", [])), "8000000041000000");
  });
  it("首个 0x00 截断；空 pack 给空串", () => {
    const cut = method(fromAscii([0x41, 0x00, 0x42]), "length", []);
    eq("569", "NUL 截断", String(cut.v), "1");
    const empty = method(fromAscii([]), "length", []);
    eq("569", "空", String(empty.v), "0");
  });
});
