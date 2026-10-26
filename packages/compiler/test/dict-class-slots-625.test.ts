/**
 * 定形字典的类名键位与值位（S625）：键**只收同名类**，值按类族宽松一档（子类收、异类拒）。
 * 逐格抄自 `tmp/probe624/y1..y5`、`v11..v13` 的引擎读数 —— 引擎拒的这里必须拒且句子一字一样，
 * 引擎收的必须收（子类键与父类槽那一档差别的判据是量出来的，不是推的）。
 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const CLS = "class One:\n\tpass\n\nclass Two:\n\tpass\n\nclass Kid extends One:\n\tpass\n\n";
const src = (body: string): string => `extends SceneTree\n\n${CLS}func _initialize():\n${body}\n\tquit()\n`;
const KEY = "typed-index-key";
const VAL = "typed-index-assign";

const CASES: Array<[string, string, Array<[string, string]>]> = [
  ["子类键进父类槽也拒（y1）", src("\tvar d: Dictionary[One, int] = {}\n\td[Kid.new()] = 5\n"), [[KEY, `Invalid index type "Kid" for a base of type "Dictionary[One, int]".`]]],
  ["异类键拒（y2 / v13）", src("\tvar d: Dictionary[One, int] = {}\n\td[Two.new()] = 5\n"), [[KEY, `Invalid index type "Two" for a base of type "Dictionary[One, int]".`]]],
  ["父类键进子类槽拒（y5）", src("\tvar d: Dictionary[Kid, int] = {}\n\td[One.new()] = 5\n"), [[KEY, `Invalid index type "One" for a base of type "Dictionary[Kid, int]".`]]],
  ["异类值只发第二句（y4）", src("\tvar d: Dictionary[int, One] = {}\n\td[1] = Two.new()\n"), [[VAL, `Value of type "Two" cannot be assigned to a variable of type "One".`]]],
  ["同名键收下（v12）", src("\tvar d: Dictionary[One, int] = {}\n\td[One.new()] = 5\n"), []],
  ["子类值收下（y3）", src("\tvar d: Dictionary[int, One] = {}\n\td[1] = Kid.new()\n"), []],
  ["标量键值那两张老闸门不动（w14 形）", src('\tvar d: Dictionary[int, String] = {}\n\td[1] = 5\n'), [
    ["typed-index-value", `Cannot assign a value of type "int" as "String".`],
    [VAL, `Value of type "int" cannot be assigned to a variable of type "String".`],
  ]],
];

describe("analyze · 定形字典的类名槽", () => {
  it.each(CASES)("%s", async (_name, source, expected) => {
    const got = analyze(lower(await parseSource(source))).diagnostics
      .filter((d) => d.code === KEY || d.code === VAL || d.code === "typed-index-value")
      .map((d) => [d.code, d.message] as [string, string]);
    expect(got, `源：\n${source}`).toEqual(expected);
  });
});
