import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { NULL_OBJECT, method, nativeClass, V, type Variant } from "@gds2js/runtime";

const RX = nativeClass("RegEx");
const T = (s: string): Variant => V.str(s);

function rx(pattern: string): Variant {
  const r = method(RX, "new", []);
  method(r, "compile", [T(pattern)]);
  return r;
}

function hit(pattern: string, text: string): string {
  const m = method(rx(pattern), "search", [T(text)]) as Variant;
  if (m.v === NULL_OBJECT) return "null";
  return `${String(method(m, "get_start", []).v)}|${String(method(m, "get_end", []).v)}`;
}

describe("runtime/regex ASCII whitespace（499）", () => {
  it("499 · \\s 只认 ASCII 空白，\\S 与 [^\\s] 相反", () => {
    eq("499", "NBSP 不是空白", hit("\\s+", "a\u00A0b"), "null");
    eq("499", "全角空格不是空白", hit("\\s+", "a\u3000b"), "null");
    eq("499", "零宽空格不是空白", hit("\\s+", "a\u200Bb"), "null");
    eq("499", "VT 是空白", hit("\\s+", "a\u000Bb"), "1|2");
    eq("499", "FF 是空白", hit("\\s+", "a\u000Cb"), "1|2");
    eq("499", "TAB 是空白", hit("\\s+", "a\tb"), "1|2");
    eq("499", "NBSP 命中 \\S", hit("\\S+", "\u00A0"), "0|1");
    eq("499", "全角空格命中 \\S", hit("\\S+", "\u3000"), "0|1");
    eq("499", "零宽空格命中 \\S", hit("\\S+", "\u200B"), "0|1");
    eq("499", "字符类里的 \\s", hit("[\\s]+", "a\u00A0b"), "null");
    eq("499", "否定类里的 \\s", hit("[^\\s]+", "\u00A0"), "0|1");
    eq("499", "否定类不吃 ASCII 空格", hit("[^\\s]+", " "), "null");
  });
});
