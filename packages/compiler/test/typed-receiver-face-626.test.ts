/**
 * 「找不到成员」两句里的 base 印**标注全文**（S626 的 z1..z7）：定形数组两句、定形字典只第二句，
 * 面文本都不许剥成基名。逐字抄自 `tmp/probe624/` 的引擎读数。
 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const CLS = "class One:\n\tpass\n\n";
const src = (body: string): string => `extends SceneTree\n\n${CLS}func _initialize():\n${body}\n\tquit()\n`;

const CASES: Array<[string, string, string[]]> = [
  ["定形数组两句都印全文（z1）", src('\tvar a: Array[int] = []\n\ta.nope()\n'), [`Cannot find member "nope" in base "Array[int]".`, `Function "nope()" not found in base Array[int].`]],
  ["类名定形同形（z5）", src("\tvar a: Array[One] = []\n\ta.nope()\n"), [`Cannot find member "nope" in base "Array[One]".`, `Function "nope()" not found in base Array[One].`]],
  ["原生表里的名字在定形面上仍算表外（z6）", src("\tvar a: Array[String] = []\n\ta.pick_native()\n"), [`Cannot find member "pick_native" in base "Array[String]".`, `Function "pick_native()" not found in base Array[String].`]],
  ["定形字典只发第二句（z2）", src('\tvar d: Dictionary[int, String] = {}\n\td.nope()\n'), [`Function "nope()" not found in base Dictionary[int, String].`]],
  ["类名键的字典也一样（z3）", src("\tvar d: Dictionary[One, int] = {}\n\td.nope()\n"), [`Function "nope()" not found in base Dictionary[One, int].`]],
  ["类名值的字典也一样（z7）", src("\tvar d: Dictionary[int, One] = {}\n\td.nope()\n"), [`Function "nope()" not found in base Dictionary[int, One].`]],
];

describe("analyze · 定形接收者的面文本", () => {
  it.each(CASES)("%s", async (_name, source, expected) => {
    const got = analyze(lower(await parseSource(source))).diagnostics
      .filter((d) => d.code === "face-member-missing" || d.code === "face-member-not-found")
      .map((d) => d.message);
    expect(got, `源：\n${source}`).toEqual(expected);
  });
});
