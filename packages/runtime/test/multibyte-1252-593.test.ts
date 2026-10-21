/** `WINDOWS-1252` 的 to/from multibyte（S593），读数 `tmp/d6/s593.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { V } from "@gds2js/runtime/runtime/tags";
import { S } from "./support/variants";

const pb = (xs: number[]) => V.object(new GBytes(xs, "byte"));
const hex = (r: unknown): string => ((r as { v: GBytes }).v as GBytes).raw().map((b) => (b as number).toString(16).padStart(2, "0")).join("");

describe("Windows-1252 multibyte（S593）", () => {
  it("编码：€ / é 直出，汉字与代理半各给 ?，末尾补 0", () => {
    eq("593", "混合", hex(method(S("A€é汉😀"), "to_multibyte_char_buffer", [S("WINDOWS-1252")])), "4180e93f3f3f00");
    eq("593", "小写名", hex(method(S("Aé"), "to_multibyte_char_buffer", [S("windows-1252")])), "41e900");
  });
  it("解码：0x80–0x9F 走 CP1252 表，其余按字节", () => {
    const r = method(pb([0x80, 0x81, 0x93, 0x94, 0xe9, 0x41]), "get_string_from_multibyte_char", [S("WINDOWS-1252")]);
    eq("593", "混合", hex(method(r, "to_utf32_buffer", [])), "ac200000810000001c2000001d200000e900000041000000");
    const low = method(pb([0x80, 0x41]), "get_string_from_multibyte_char", [S("windows-1252")]);
    eq("593", "小写与长度", `${hex(method(low, "to_utf32_buffer", []))}|${method(low, "length", []).v}`, "ac20000041000000|2");
  });
});
