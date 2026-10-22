/**
 * 类名槽的字面量与构造器源（S622 续 / 续二）：异类 `.new()` 进类名槽发元素那一句；
 * 交叉容器的字面量按引擎的推断表印文本 —— 数组元素全 int（含空）才是 `Array[int]`，
 * 字典键全 int（含空）才是 `Dictionary[int, Variant]`，否则退回基名。
 * 逐格抄自 `tmp/probe623/s5.gd`、`tmp/probe624/t1..t10.gd`、`tmp/probe621/q7.gd`。
 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const bodySrc = (body: string): string => `extends SceneTree\n\nfunc _initialize():\n${body}\n\tquit()\n`;
const D = "\tvar d: Dictionary[int, String] = ";
const A = "\tvar i: Array[int] = ";
const CLS = "class One:\n\tpass\n\nclass Two:\n\tpass\n\nfunc _initialize():\n";
const classSrc = (body: string): string => `extends SceneTree\n\n${CLS}${body}\n\tquit()\n`;
const CROSS = 'Cannot assign a value of type';
const ELEM = "Cannot have an element of type";

const CASES: Array<[string, string, string]> = [
  ["空数组进字典槽印 Array[int]（t1）", bodySrc(D + "[]\n"), `${CROSS} Array[int] to variable "d" with specified type Dictionary[int, String].`],
  ["int 元素进字典槽（t2）", bodySrc(D + "[1]\n"), `${CROSS} Array[int] to variable "d" with specified type Dictionary[int, String].`],
  ["String 元素退回基名（t3）", bodySrc(D + '["a"]\n'), `${CROSS} Array to variable "d" with specified type Dictionary[int, String].`],
  ["嵌套数组退回基名（t4）", bodySrc(D + "[[1]]\n"), `${CROSS} Array to variable "d" with specified type Dictionary[int, String].`],
  ["混合元素退回基名（t9）", bodySrc(D + '[1, "a"]\n'), `${CROSS} Array to variable "d" with specified type Dictionary[int, String].`],
  ["实例元素退回基名（t10）", bodySrc(D + "[1, 2]\n"), `${CROSS} Array[int] to variable "d" with specified type Dictionary[int, String].`],
  ["空字典进数组槽（t5）", bodySrc(A + "{}\n"), `${CROSS} Dictionary[int, Variant] to variable "i" with specified type Array[int].`],
  ["int 值也印 Variant（t6）", bodySrc(A + "{1: 2}\n"), `${CROSS} Dictionary[int, Variant] to variable "i" with specified type Array[int].`],
  ["非 int 键退回基名（t7）", bodySrc(A + '{"a": 1}\n'), `${CROSS} Dictionary to variable "i" with specified type Array[int].`],
  ["混合值仍印 int, Variant（t8）", bodySrc(A + '{1: "a", 2: 3}\n'), `${CROSS} Dictionary[int, Variant] to variable "i" with specified type Array[int].`],
  ["异类 .new() 进类名槽发元素那一句（s5）", classSrc('\tvar a: Array[One] = [Two.new()]\n'), `${ELEM} "Two" in an array of type "Array[One]".`],
  ["本类 .new() 收下（q7 那一形）", classSrc("\tvar a: Array[One] = [One.new()]\n"), ""],
];

describe("analyze · 类名槽与字面量推断文本", () => {
  it.each(CASES)("%s", async (_name, src, expected) => {
    const diags = analyze(lower(await parseSource(src)));
    const got = diags
      .filter((d) => d.code === "typed-collection-assign" || d.code === "typed-collection-element")
      .map((d) => d.message)
      .join("|");
    expect(got, `源：\n${src}`).toBe(expected);
  });
});
