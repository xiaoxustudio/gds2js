/** UTF-32 非法码点的替换与 utf16 代理边界的编码（S579），读数 `tmp/d6/s580.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { S } from "./support/variants";

const pb = (xs: number[]) => V.object(new GBytes(xs, "byte"));
import { V } from "@gds2js/runtime/runtime/tags";

function hex(r: unknown): string {
  return ((r as { v: GBytes }).v as GBytes).raw().map((b) => (b as number).toString(16).padStart(2, "0")).join("");
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

describe("get_string_from_utf32 的非法码点（S579）", () => {
  const cases: [number[], string, string][] = [
    [[0x00, 0xd8, 0x00, 0x00], "Unpaired surrogate (d800)", "fdff0000"],
    [[0x00, 0x00, 0x11, 0x00], "Invalid unicode codepoint (110000)", "fdff0000"],
    [[0xff, 0xff, 0xff, 0xff], "Invalid unicode codepoint (ffffffff)", "fdff0000"],
  ];
  for (const [bytes, msg, cpHex] of cases) {
    it(msg, () => {
      const r = capture(() => method(pb(bytes), "get_string_from_utf32", []));
      eq("579", "值", hex(method(r.value, "to_utf32_buffer", [])), cpHex);
      eq("579", "诊断行", r.lines[0], `Unicode parsing error, some characters were replaced with \ufffd (U+FFFD): ${msg}`);
    });
  }
});

describe("utf16 代理边界与 UTF-8 编码（S579）", () => {
  const from16 = (xs: number[]) => method(pb(xs), "get_string_from_utf16", []);
  it("孤立高 / 低代理保留，按 CESU 三字节进 UTF-8", () => {
    const hi = from16([0x00, 0xd8]);
    eq("579", "高代理", `${hex(method(hi, "to_utf32_buffer", []))}|${hex(method(hi, "to_utf16_buffer", []))}|${hex(method(hi, "to_utf8_buffer", []))}`, "00d80000|00d8|eda080");
    const lo = from16([0x00, 0xdc]);
    eq("579", "低代理", `${hex(method(lo, "to_utf32_buffer", []))}|${hex(method(lo, "to_utf8_buffer", []))}`, "00dc0000|edb080");
  });
  it("正常代理对与 BMP", () => {
    const pair = from16([0x00, 0xd8, 0x00, 0xdc]);
    eq("579", "pair U+10000", `${hex(method(pair, "to_utf32_buffer", []))}|${hex(method(pair, "to_utf8_buffer", []))}|${hex(method(pair, "to_utf16_buffer", []))}`, "00000100|f0908080|00d800dc");
    const emoji = from16([0x3d, 0xd8, 0x00, 0xde]);
    eq("579", "U+1F600", `${hex(method(emoji, "to_utf32_buffer", []))}|${hex(method(emoji, "to_utf8_buffer", []))}|${hex(method(emoji, "to_utf16_buffer", []))}`, "00f60100|f09f9880|3dd800de");
    eq("579", "普通串不变", hex(method(S("é😀"), "to_utf8_buffer", [])), "c3a9f09f9880");
  });
});
