/** `String.is_valid_unicode_identifier()`（S555）：逐码点实测表 + 首码点 start / 其余 continue。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { V } from "@gds2js/runtime/runtime/tags";

const ok = (s: string): string => String(method(V.str(s), "is_valid_unicode_identifier", []).v);

describe("String.is_valid_unicode_identifier（S555）", () => {
  it("25 格引擎读数", () => {
    const CASES: Array<[string, boolean]> = [
      ["", false], ["a", true], ["_", true], ["a1", true], ["1a", false], ["a-b", false],
      ["a b", false], ["é", true], ["aé", true], ["_é", true], ["1é", false], ["😀", false],
      ["变量", true], ["a变量", true], ["Ж", true], ["aЖ", true], ["á", true], ["á", true],
      ["\u0301", false], ["ª", true], ["µx", true], ["\u200c", false], ["a\u200c", true],
      ["Ⅻ", true], ["aⅫ", true],
    ];
    for (const [s, want] of CASES) {
      eq("555", `var_to_str(${JSON.stringify(s)})`, ok(s), String(want));
    }
  });
  it("组合记号只在继续位；StringName 转发同一支", () => {
    eq("555", "a + U+0301 真、U+0301 单假", `${ok("a\u0301")}/${ok("\u0301")}`, "true/false");
    eq("555", "StringName 转发", String(method(V.stringName("éx"), "is_valid_unicode_identifier", []).v), "true");
  });
});
