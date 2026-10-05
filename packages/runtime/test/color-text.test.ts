// 4.6.3 实测的「文本 → Color」三条道：名字表（146 支逐名对过）、hex 的 3/4/6/8 长度、
// 以及 convert / type_convert 两支在 String 与 StringName 上的分岔。
// 读数在 tmp/probe-color-names/{names,more,hex,sn}.log。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { color, colorNew, colorStatic } from "@gds2js/runtime/runtime/color";
import { COLOR_NAMED } from "@gds2js/runtime/runtime/color-named";
import { variantConvert } from "@gds2js/runtime/runtime/convert";

const C = (s: string): string => show(colorNew([V.str(s)]));
const H = (s: string): string => show(colorStatic("html", [V.str(s)]));
const F = (s: string): string => show(colorStatic("from_string", [V.str(s), color(0, 1, 0, 1)]));
const OK = (s: string): string => String(colorStatic("html_is_valid", [V.str(s)]).v);
const CV = (v: Variant, strict: boolean): string => show(variantConvert(v, V.int(20), strict));

describe("runtime/color · 文本进 Color 的三条道（242）", () => {
  it("242 · 名字表补齐的八支与分隔符规范化", async () => {
    eq("242", "原来漏的八支现在都认（引擎读数逐支对过）", [
      C("dark_khaki"), C("light_goldenrod"), C("medium_orchid"), C("transparent"),
      C("web_gray"), C("web_green"), C("web_maroon"), C("web_purple"),
    ].join("|"), "(0.7412, 0.7176, 0.4196, 1.0)|(0.9804, 0.9804, 0.8235, 1.0)|(0.7294, 0.3333, 0.8275, 1.0)|(1.0, 1.0, 1.0, 0.0)|(0.502, 0.502, 0.502, 1.0)|(0.0, 0.502, 0.0, 1.0)|(0.502, 0.0, 0.0, 1.0)|(0.502, 0.0, 0.502, 1.0)");
    eq("242", "空格 - _ ' . 五种分隔符都可省、大小写不敏感（六支都是 web_green）", [
      C("web green"), C("web-green"), C("WEB_GREEN"), C("web.green"), C("web'green"), C("WebGreen"),
    ].join("|"), "(0.0, 0.502, 0.0, 1.0)|(0.0, 0.502, 0.0, 1.0)|(0.0, 0.502, 0.0, 1.0)|(0.0, 0.502, 0.0, 1.0)|(0.0, 0.502, 0.0, 1.0)|(0.0, 0.502, 0.0, 1.0)");
    eq("242", "表里只有 GRAY 没有 GREY（引擎给 (0,0,0,1)）", `${C("gray")}|${C("grey")}`, "(0.7451, 0.7451, 0.7451, 1.0)|(0.0, 0.0, 0.0, 1.0)");
    eq("242", "名字表就是量出来的那 146 支", String(Object.keys(COLOR_NAMED).length), "146");
  });

  it("242 · hex 的三 / 四 / 六 / 八长度与失败兜底", async () => {
    eq("242", "三位与四位是「一数字一通道」，alpha 在后", `${C("f00")}|${C("f00f")}|${C("8f00")}|${C("1234")}`, "(1.0, 0.0, 0.0, 1.0)|(1.0, 0.0, 0.0, 1.0)|(0.5333, 1.0, 0.0, 0.0)|(0.0667, 0.1333, 0.2, 0.2667)");
    eq("242", "六位与八位是每通道两位，`#` 可省", `${C("00ff00")}|${C("#1a2b3c")}|${C("ff00ff00")}|${C("#80ff0000")}`, "(0.0, 1.0, 0.0, 1.0)|(0.102, 0.1686, 0.2353, 1.0)|(1.0, 0.0, 1.0, 0.0)|(0.502, 1.0, 0.0, 0.0)");
    eq("242", "长度不是 3/4/6/8 或含非法字符都给 (0,0,0,1)", `${C("f0")}|${C("gggggg")}|${C("12345")}|${C("")}|${C("zz")}`, "(0.0, 0.0, 0.0, 1.0)|(0.0, 0.0, 0.0, 1.0)|(0.0, 0.0, 0.0, 1.0)|(0.0, 0.0, 0.0, 1.0)|(0.0, 0.0, 0.0, 1.0)");
    eq("242", "Color.html 不查名字表（red 给它就走兜底），四位照样认", `${H("red")}|${H("f00f")}|${H("#80ff0000")}|${H("")}`, "(0.0, 0.0, 0.0, 1.0)|(1.0, 0.0, 0.0, 1.0)|(0.502, 1.0, 0.0, 0.0)|(0.0, 0.0, 0.0, 1.0)");
    eq("242", "Color.from_string 两支都查，认不出给第二个实参那个兜底色", `${F("red")}|${F("00ff00")}|${F("f00f")}|${F("zz")}`, "(1.0, 0.0, 0.0, 1.0)|(0.0, 1.0, 0.0, 1.0)|(1.0, 0.0, 0.0, 1.0)|(0.0, 1.0, 0.0, 1.0)");
    eq("242", "html_is_valid 只认长度与十六进制位，# 可省", [OK("f00"), OK("8f00"), OK("ffff"), OK("#fff"), OK("f0"), OK("12345"), OK("#f0"), OK("#"), OK("gggggg"), OK("")].join("|"), "true|true|true|true|false|false|false|false|false|false");
  });

  it("242 · convert 与 type_convert 的文本进 Color", async () => {
    eq("242", "两支都吃 String，名字与 hex 一样认（strict 也不给 null）", `${CV(V.str("red"), true)}|${CV(V.str("ff0000"), true)}|${CV(V.str("80ff0000"), false)}|${CV(V.str("1234"), false)}`, "(1.0, 0.0, 0.0, 1.0)|(1.0, 0.0, 0.0, 1.0)|(0.502, 1.0, 0.0, 0.0)|(0.0667, 0.1333, 0.2, 0.2667)");
    eq("242", "认不出时两支都给 (0,0,0,1)，不是 null", `${CV(V.str("zz"), true)}|${CV(V.str(""), true)}|${CV(V.str("  "), false)}`, "(0.0, 0.0, 0.0, 1.0)|(0.0, 0.0, 0.0, 1.0)|(0.0, 0.0, 0.0, 1.0)");
    eq("242", "StringName 只有 convert 那一侧认（type_convert 连 hex 都不接）", `${CV(V.stringName("red"), true)}|${CV(V.stringName("00ff00"), true)}|${CV(V.stringName("red"), false)}|${CV(V.stringName("00ff00"), false)}`, "(1.0, 0.0, 0.0, 1.0)|(0.0, 1.0, 0.0, 1.0)|(0.0, 0.0, 0.0, 1.0)|(0.0, 0.0, 0.0, 1.0)");
    eq("242", "int 那一支还是 0xRRGGBBAA 拆字节（与 S235 同一条）", CV(V.int(7), true), "(0.0, 0.0, 0.0, 0.0275)");
  });
});
