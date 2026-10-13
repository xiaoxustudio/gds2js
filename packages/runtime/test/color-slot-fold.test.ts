/**
 * Color 那几位**引擎收下来**的实参折法：`hex` / `hex64` 的 int 位（`tmp/probe-argtype/hexfold.txt` 20 格）、
 * 字符串位的 NodePath、Color 位的 int / String、以及 `from_rgbe9995` 在实例上那一支（读数都在
 * `tmp/probe-argtype/values.txt` 的「收」那一侧）。改前出货对这几格响亮抛，引擎照算并给值。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { GColor, color, colorMethod, colorStatic } from "@gds2js/runtime/runtime/color";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { nodePathValue } from "@gds2js/runtime/runtime/node-path";

const RED = new GColor(1, 0, 0, 1);
const NAN = V.float(Number.NaN);
const INF = V.float(Number.POSITIVE_INFINITY);
const NINF = V.float(Number.NEGATIVE_INFINITY);
const f = (n: number): Variant => V.float(n);

const HEX: Array<[string, string, string, Variant, string]> = [
  ["实例", "hex", "hex(1)", V.int(1), "(0.0, 0.0, 0.0, 0.0039)"],
  ["实例", "hex", "hex(2)", V.int(2), "(0.0, 0.0, 0.0, 0.0078)"],
  ["实例", "hex", "hex(1.7)", f(1.7), "(0.0, 0.0, 0.0, 0.0039)"],
  ["实例", "hex", "hex(2.9)", f(2.9), "(0.0, 0.0, 0.0, 0.0078)"],
  ["实例", "hex", "hex(0.5)", f(0.5), "(0.0, 0.0, 0.0, 0.0)"],
  ["实例", "hex", "hex(-1.7)", f(-1.7), "(1.0, 1.0, 1.0, 1.0)"],
  ["实例", "hex", "hex(-2.9)", f(-2.9), "(1.0, 1.0, 1.0, 0.9961)"],
  ["实例", "hex", "hex(true)", V.bool(true), "(0.0, 0.0, 0.0, 0.0039)"],
  ["实例", "hex", "hex(NAN)", NAN, "(0.0, 0.0, 0.0, 0.0)"],
  ["实例", "hex", "hex(INF)", INF, "(0.0, 0.0, 0.0, 0.0)"],
  ["实例", "hex", "hex(-INF)", NINF, "(0.0, 0.0, 0.0, 0.0)"],
  ["实例", "hex", "hex(1e19)", f(1e19), "(0.0, 0.0, 0.0, 0.0)"],
  ["实例", "hex", "hex(4294967295.0)", f(4294967295), "(1.0, 1.0, 1.0, 1.0)"],
  ["实例", "hex", "hex(4294967296.0)", f(4294967296), "(0.0, 0.0, 0.0, 0.0)"],
  ["实例", "hex64", "hex64(1.7)", f(1.7), "(0.0, 0.0, 0.0, 0.0)"],
  ["实例", "hex64", "hex64(-1.7)", f(-1.7), "(1.0, 1.0, 1.0, 1.0)"],
  ["实例", "hex64", "hex64(true)", V.bool(true), "(0.0, 0.0, 0.0, 0.0)"],
  ["实例", "hex64", "hex64(NAN)", NAN, "(0.5, 0.0, 0.0, 0.0)"],
  ["实例", "hex64", "hex64(1e19)", f(1e19), "(0.5, 0.0, 0.0, 0.0)"],
  ["实例", "hex64", "hex64(4294967296.0)", f(4294967296), "(0.0, 0.0, 0.0, 0.0)"],
  ["静态", "hex", "Color.hex(1.7)", f(1.7), "(0.0, 0.0, 0.0, 0.0039)"],
  ["静态", "hex64", "Color.hex64(-1.7)", f(-1.7), "(1.0, 1.0, 1.0, 1.0)"],
];

const SLOTS: Array<[string, string, Variant[], string]> = [
  ["html", "NodePath 按文本折（与给 \"808080\" 同值）", [nodePathValue("808080")], "(0.502, 0.502, 0.502, 1.0)"],
  ["html", "NodePath 解析不出来给兜底色", [nodePathValue("a")], "(0.0, 0.0, 0.0, 1.0)"],
  ["from_string", "第二位的默认色收 int（打包值）", [V.str("a"), V.int(1)], "(0.0, 0.0, 0.0, 0.0039)"],
  ["from_string", "第二位的默认色收 String（按 html）", [V.str("a"), V.str("a")], "(0.0, 0.0, 0.0, 1.0)"],
  ["from_string", "第一位收 NodePath", [nodePathValue("a"), color(1, 0, 0, 1)], "(1.0, 0.0, 0.0, 1.0)"],
  ["from_rgbe9995", "实例上那一支与静态一字一样", [V.int(1)], "(0.0, 0.0, 0.0, 1.0)"],
  ["from_rgbe9995", "float 折进 uint32", [f(1)], "(0.0, 0.0, 0.0, 1.0)"],
  ["from_rgbe9995", "bool 折 0 / 1", [V.bool(true)], "(0.0, 0.0, 0.0, 1.0)"],
];

describe("runtime/color · 引擎收下的实参位怎么折", () => {
  it.each(HEX)("%s %s 的 int 位 %s", (side, name, label, arg, want) => {
    const got = side === "静态" ? colorStatic(name, [arg]) : colorMethod(RED, name, [arg]);
    eq("354", `${name} 的 int 位 ${label}`, show(got), want);
  });

  it.each(SLOTS)("%s 的 %s", (name, _why, args, want) => {
    eq("354", `${name}(${_why})`, show(colorMethod(RED, name, args)), want);
  });

  it("354 · html_is_valid 的字符串位也收 NodePath", async () => {
    eq("354", "html_is_valid(^\"a\")", show(colorMethod(RED, "html_is_valid", [nodePathValue("a")])), "false");
    eq("354", "html_is_valid(^\"808080\")", show(colorMethod(RED, "html_is_valid", [nodePathValue("808080")])), "true");
  });
});
