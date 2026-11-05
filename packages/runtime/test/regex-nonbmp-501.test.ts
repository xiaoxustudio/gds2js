import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { NULL_OBJECT, method, nativeClass, V, type Variant } from "@gds2js/runtime";

const RX = nativeClass("RegEx");
const T = (s: string): Variant => V.str(s);
const I = (x: number): Variant => V.int(x);

function rx(pattern: string): Variant {
  const r = method(RX, "new", []);
  method(r, "compile", [T(pattern)]);
  return r;
}

function hit(pattern: string, text: string, from = 0): string {
  const m = method(rx(pattern), "search", [T(text), I(from)]) as Variant;
  if (m.v === NULL_OBJECT) return "null";
  return `${String(method(m, "get_start", []).v)}|${String(method(m, "get_end", []).v)}|${String(method(m, "get_string", []).v)}`;
}

describe("runtime/regex non-BMP offsets（501）", () => {
  it("501 · 偏移按码位计，点号吃一个码位", () => {
    eq("501", "点号匹配 emoji", hit("a.c", "a\u{1F600}c"), "0|3|a\u{1F600}c");
    eq("501", "从码位 1 起不再命中", hit("a.c", "a\u{1F600}c", 1), "null");
    eq("501", "\\w 不跨 emoji", hit("\\w+", "a\u{1F600}c"), "0|1|a");
    eq("501", "sub 的起始偏移按码位", method(rx("[^,]+"), "sub", [T("a\u{1F600},b"), T("#"), I(1), I(1)]).v, "a#,#");
  });
});
