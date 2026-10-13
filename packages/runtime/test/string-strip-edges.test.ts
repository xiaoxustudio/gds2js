/**
 * `String.strip_edges(left = true, right = true)`：那两位是真参数，默认都真、int / float 按「不等于 0」折，
 * 空白判据是 `0 < 码点 <= 0x20`（读数 `tmp/probe-argtype/strip.txt` 20 格 + `stripws.txt` 45 格，
 * 值的一侧另有语料 355 的 9 行逐字节）。改前出货对任何实参都抛「不接受参数」，而 `char(0)` 那一格还比引擎多裁了一个字符。
 */
import { describe, expect, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { strStripEdges } from "@gds2js/runtime/runtime/values";

const strip = (...args: Variant[]): string => String(method(V.str("  abc  "), "strip_edges", args).v);
const B = V.bool, I = (n: number | bigint): Variant => V.int(BigInt(n)), F = (n: number): Variant => V.float(n);

describe("runtime/methods · strip_edges 的 left / right", () => {
  it("355 · 两位的默认值与 bool 折法", async () => {
    eq("355", "不带参数 = 两端都裁", strip(), "abc");
    eq("355", "只给 true", strip(B(true)), "abc");
    eq("355", "只给 false 是关左端、右端仍按默认裁", strip(B(false)), "  abc");
    eq("355", "(true, true)", strip(B(true), B(true)), "abc");
    eq("355", "(true, false) 留着右端", strip(B(true), B(false)), "abc  ");
    eq("355", "(false, true) 留着左端", strip(B(false), B(true)), "  abc");
    eq("355", "(false, false) 两端都留", strip(B(false), B(false)), "  abc  ");
    eq("355", "int 位按 ≠ 0 折：(1, 0)", strip(I(1), I(0)), "abc  ");
    eq("355", "(0, 1)", strip(I(0), I(1)), "  abc");
    eq("355", "(0, 0)", strip(I(0), I(0)), "  abc  ");
    eq("355", "(2, 2) 与 (true, true) 同值", strip(I(2), I(2)), "abc");
    eq("355", "(-1, -1) 也全裁", strip(I(-1), I(-1)), "abc");
    eq("355", "float 位：(0.5, 0.0)", strip(F(0.5), F(0)), "abc  ");
    eq("355", "float 位：(0.0, 0.0)", strip(F(0), F(0)), "  abc  ");
    eq("355", "整串都是空白时两端都关着就原样给回", String(method(V.str("  "), "strip_edges", [B(false), B(false)]).v), "  ");
  });

  it("355 · 空白判据是 0 < 码点 <= 0x20（读数 stripws.txt 45 格）", async () => {
    const kept: string[] = [];
    for (let cp = 0; cp <= 0x21; cp++) {
      if (strStripEdges("  abc" + String.fromCodePoint(cp)) !== "abc") kept.push(`U+${cp.toString(16).toUpperCase()}`);
    }
    eq("355", "右端只有 NUL 与 U+0021 留着", kept.join(","), "U+0,U+21");
    eq("355", "U+0001–U+0020 全裁（含 \\t \\n \\v \\f \\r 与 0x1C–0x1F）", strStripEdges("\u0001\u0009\u000a\u000b\u000c\u000d\u001fabc\u0020"), "abc");
    eq("355", "高位空白一律留着", `${strStripEdges("\u0085abc")}|${strStripEdges("\u00a0abc")}|${strStripEdges("\u3000abc")}`, "\u0085abc|\u00a0abc|\u3000abc");
    eq("355", "左端同一个判据", `${strStripEdges("\u0000abc")}|${strStripEdges("\u0001abc")}`, "\u0000abc|abc");
    eq("355", "只关右端时 NUL 也照样留着", strStripEdges("  abc\u0000", true, false), "abc\u0000");
  });

  it("355 · 三位是 Too many，字符串实参照旧响亮拒", async () => {
    shouldThrow("355", "三位引擎解析期就拒", () => method(V.str("abc"), "strip_edges", [B(true), B(true), B(true)]));
    expect(() => strip(V.str("a"))).toThrow(/需要 bool/);
  });
});
