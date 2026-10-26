/**
 * S328 · 「类名.成员」那一面的解析期拒：24 形调用式 + 3 形 bare 引用式各钉引擎原文，15 形合法式钉「不许误拦」。
 * 句子与形状来自一格一脚本的读数 `tmp/probe-static-face/readings.txt`（六型 44 形），名单见 §6 第 46 条。
 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const diags = async (src: string): Promise<string[]> => {
  const body = src.startsWith("var ") ? src : `print("X||", ${src})`;
  return analyze(lower(await parseSource(`extends SceneTree\n\nfunc _initialize():\n\t${body}\n\tquit()\n`))).diagnostics.map((d) => d.message);
};

const CALLS: Array<[string, string]> = [
  ["Color.RED(1)", 'Name "RED" called as a function but is a "Color".'],
  ["Vector2.ZERO(1)", 'Name "ZERO" called as a function but is a "Vector2".'],
  ["Vector2i.ONE(1)", 'Name "ONE" called as a function but is a "Vector2i".'],
  ["Vector3.UP(1, 2)", 'Name "UP" called as a function but is a "Vector3".'],
  ["Vector3.AXIS_X(1)", 'Name "AXIS_X" called as a function but is a "Vector3.Axis".'],
  ["Vector2.AXIS_Y(1)", 'Name "AXIS_Y" called as a function but is a "Vector2.Axis".'],
  ["Vector3i.AXIS_Z()", 'Name "AXIS_Z" called as a function but is a "Vector3i.Axis".'],
  ["Color.TRANSPARENT(1)", 'Name "TRANSPARENT" called as a function but is a "Color".'],
  ["Color.Alice_Blue(1)", 'Name "Alice_Blue" called as a function but is a "Color".'],
  ["Vector2.nope(1)", 'Cannot find member "nope" in base "Vector2".'],
  ["String.nope(1)", 'Cannot find member "nope" in base "String".'],
  ["Vector2.length()", 'Cannot call non-static function "length()" on the class "Vector2" directly. Make an instance instead.'],
  ["Color.to_html()", 'Cannot call non-static function "to_html()" on the class "Color" directly. Make an instance instead.'],
  ["Vector3i.length()", 'Cannot call non-static function "length()" on the class "Vector3i" directly. Make an instance instead.'],
  ["String.chr()", 'Too few arguments for "chr()" call. Expected at least 1 but received 0.'],
  ["Vector2.from_angle()", 'Too few arguments for "from_angle()" call. Expected at least 1 but received 0.'],
  ["Vector2.from_angle(1, 2)", 'Too many arguments for "from_angle()" call. Expected at most 1 but received 2.'],
  ["Vector3.octahedron_decode()", 'Too few arguments for "octahedron_decode()" call. Expected at least 1 but received 0.'],
  ["Color.html()", 'Too few arguments for "html()" call. Expected at least 1 but received 0.'],
  ['Color.html("f00", "f00")', 'Too many arguments for "html()" call. Expected at most 1 but received 2.'],
  ['Color.from_string("#f00")', 'Too few arguments for "from_string()" call. Expected at least 2 but received 1.'],
  ["Color.from_hsv(1, 2)", 'Too few arguments for "from_hsv()" call. Expected at least 3 but received 2.'],
  ["Color.from_rgba8(1, 2)", 'Too few arguments for "from_rgba8()" call. Expected at least 3 but received 2.'],
  ["String.num_int64()", 'Too few arguments for "num_int64()" call. Expected at least 1 but received 0.'],
];

const GOOD = [
  "Vector2.from_angle(0.5)",
  'Color.html("#f00")',
  'Color.from_string("#f00", Color.RED)',
  "Color.from_rgba8(1, 2, 3)",
  "String.num(1.5, 2)",
  "String.humanize_size(1024)",
  "Vector3.octahedron_decode(Vector2(0.5, 0.5))",
  "Color.RED",
  "Vector3.UP",
  "Vector3.AXIS_Y",
  "Vector2i.MAX",
  "Color.ALICE_BLUE",
  "Vector2(1, 2).length()",
  '"abc".length()',
  "Color(1, 2, 3).to_html(true)",
];

describe("类名.成员 · 引擎解析期拒的形我们同拒", () => {
  it.each(CALLS)("%s", async (src, sentence) => {
    expect(await diags(src), src).toContain(sentence);
  });

  it("表外的名字在调用位置是两句", async () => {
    const got = await diags("Vector2.nope(1)");
    expect(got).toContain('Cannot find member "nope" in base "Vector2".');
    expect(got).toContain('Function "nope()" not found in base Vector2.');
  });

  it.each(["Color.html", "Vector2.from_angle", "String.chr"])("bare 引用 %s 不是成员，那句报两遍", async (src) => {
    const name = src.split(".")[1] as string;
    const want = `Cannot find member "${name}" in base "${src.split(".")[0]}".`;
    expect(await diags(`var v = ${src}\n\tprint("X||", v)`), src).toEqual([want, want]);
  });
});

describe("类名.成员 · 合法形不许误拦", () => {
  it.each(GOOD)("%s", async (src) => {
    expect(await diags(src), src).toEqual([]);
  });
});
