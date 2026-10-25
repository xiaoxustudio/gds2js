/**
 * 已声明的定形容器变量再赋值（S618）：定形源不合式是解析期一句 `Value of type "X" cannot be assigned to a variable of type "Y".`，
 * 与 S616 声明位那一句是两句；不定型源（`Array` / `Dictionary` / `Variant`）不在这支，留运行期。
 * 逐格抄自 `tmp/probe618/`（e1..e3、d1..d3、e10..e13）的引擎读数。
 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const src = (vars: string, body: string): string => `extends SceneTree\n\n${vars}func _initialize():\n${body}\n\tquit()\n`;
const say = (code: string): string => `Value of type ${code} cannot be assigned to a variable of type`;

const REJECT: Array<[string, string, string, string]> = [
  ["模块定形变量进另一支定形", src("var mi: Array[int] = []\n\n", '\tvar s: Array[String] = ["a"]\n\tmi = s\n'), say(`"Array[String]"`), "7"],
  ["self. 前缀同一句", src("var mi: Array[int] = []\n\n", '\tvar s: Array[String] = ["a"]\n\tself.mi = s\n'), say(`"Array[String]"`), "7"],
  ["字典形", src("var di: Dictionary[int, String] = {}\n\n", '\tvar ds: Dictionary[String, int] = {"a": 1}\n\tdi = ds\n'), say(`"Dictionary[String, int]"`), "7"],
  ["int 进 float 也不放宽（e1 / d7）", src("", "\tvar i: Array[float] = [1.0]\n\tvar u: Array[int] = [1]\n\ti = u\n"), say(`"Array[int]"`), "6"],
  ["类名与标量之间（c11 那一形的静态版）", src("", '\tvar s: Array[String] = ["a"]\n\tvar r: Array[RefCounted] = []\n\tr = s\n'), say(`"Array[String]"`), "6"],
  ["局部定形变量再赋值", src("", '\tvar a: Array[String] = ["x"]\n\tvar b: Array[int] = [1]\n\tb = a\n'), say(`"Array[String]"`), "6"],
  ["两处各发一句", src("", '\tvar a: Array[String] = ["x"]\n\tvar b: Array[int] = [1]\n\tb = a\n\tvar c: Array[float] = [1.0]\n\tc = a\n'), say(`"Array[String]"`), "6"],
];

const ACCEPT: Array<[string, string]> = [
  ["字面量源折算（d1）", src("", "\tvar i: Array[int] = [1]\n\ti = [2]\n")],
  ["字典字面量源折算（d2）", src("", '\tvar d: Dictionary[int, String] = {1: "a"}\n\td = {2: "b"}\n')],
  ["同标注收下并且别名（e10）", src("", "\tvar i: Array[int] = [1]\n\tvar u: Array[int] = [2]\n\ti = u\n")],
  ["不定型源留运行期（b3）", src("", "\tvar i: Array[int] = [1]\n\tvar u = []\n\ti = u\n")],
  ["Array 标注的源留运行期（e12）", src("", "\tvar i: Array[int] = [1]\n\tvar u: Array = [2]\n\ti = u\n")],
  ["Variant 标注的源留运行期（e13）", src("", "\tvar i: Array[int] = [1]\n\tvar w: Variant = [2]\n\ti = w\n")],
  ["定形数组进 Variant 变量（c11 第一行）", src("", '\tvar t: Array[String] = ["a"]\n\tvar w: Variant = t\n')],
  ["定形数组进不定型变量（b11）", src("", "\tvar t: Array[int] = [1]\n\tvar x = t\n")],
  ["标量槽那套放宽不受影响（e9）", src("", "\tvar x: int = 1\n\tvar y: float = x\n")],
  ["成员变量收同标注（d5）", src("var mi: Array[int] = []\n\n", "\tvar u: Array[int] = [2]\n\tmi = u\n")],
];

describe("analyze · 定形容器变量的再赋值", () => {
  it.each(REJECT)("拒：%s", async (_name, source, head, line) => {
    const diags = analyze(lower(await parseSource(source))).diagnostics.filter((d) => d.code === "typed-collection-assign-value");
    expect(diags.length, `源：\n${source}`).toBeGreaterThan(0);
    expect(diags[0]?.message.startsWith(head), `源：\n${source}`).toBe(true);
    expect(diags[0]?.message.endsWith("."), `源：\n${source}`).toBe(true);
    expect((diags[0]?.loc as { line: number }).line, `源：\n${source}`).toBe(Number(line));
  });

  it.each(ACCEPT)("收：%s", async (_name, source) => {
    const diags = analyze(lower(await parseSource(source))).diagnostics;
    expect(diags.map((d) => d.message), `源：\n${source}`).toEqual([]);
  });
});
