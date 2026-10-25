/**
 * 字典字面量的重复键（S294）：Godot 4.6.3 在解析期拦，我们此前照收照跑（后写的值静默盖掉先写的）。
 * 这张表逐格抄自 `tmp/probe-negzero/{keys,keys2}.mts` 的两侧对撞读数（36 形）——
 * 引擎拒的这里必须拒：句子自带 `(at line 首次那一格)`，而报错位置是**重复那一格**（S608 重新量过 `tmp/d6/s615.gd`：跨行字典那句写 `(at line 6)`、`at:` 在 7）；引擎收的这里必须收（误拦合法工程比漏一格贵）。
 */
import { afterAll, describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

/** 一行的行号：`func` 占第 3 行，函数体从第 4 行起 —— 与引擎那句 `(at line N)` 同一把尺。 */
const bodySrc = (body: string): string => `extends SceneTree\n\nfunc _initialize():\n${body}\n\tquit()\n`;
const modLevelSrc = (dict: string): string => `extends SceneTree\n\nconst C = ${dict}\n\nfunc _initialize():\n\tprint(C)\n\tquit()\n`;

const CASES: Array<[string, string, string[]]> = [
  ["同句 String", bodySrc('\tvar d = {"a": 1, "a": 2}'), [`Key "a" was already used in this dictionary (at line 4). (at line 4)`]],
  ["一处重复发一句、两处发两句", bodySrc('\tvar d = {"a": 1, "b": 2, "a": 3, "b": 4}'), [
    `Key "a" was already used in this dictionary (at line 4). (at line 4)`,
    `Key "b" was already used in this dictionary (at line 4). (at line 4)`,
  ]],
  ["跨行字典报首次那一格", bodySrc('\tvar d = {\n\t\t"b": 1,\n\t\t"a": 2,\n\t\t"a": 3,\n\t}'), [`Key "a" was already used in this dictionary (at line 6). (at line 7)`]],
  ["两个字典各报各的行", bodySrc('\tvar d = {1: 1, 1: 2}\n\tvar d2 = {2: 1, 2: 2}'), [
    `Key "1" was already used in this dictionary (at line 4). (at line 4)`,
    `Key "2" was already used in this dictionary (at line 5). (at line 5)`,
  ]],
  ["嵌在值里也查", bodySrc('\tvar d = {"x": {"a": 1, "a": 2}}'), [`Key "a" was already used in this dictionary (at line 4). (at line 4)`]],
  ["数组里的字典也查", bodySrc('\tvar d = [{"a": 1, "a": 2}]'), [`Key "a" was already used in this dictionary (at line 4). (at line 4)`]],
  ["const 也查", modLevelSrc('{"a": 1, "a": 2}'), [`Key "a" was already used in this dictionary (at line 3). (at line 3)`]],
  ["0.0 与 -0.0 同键", bodySrc("\tvar d = {0.0: 1, -0.0: 2}"), [`Key "0.0" was already used in this dictionary (at line 4). (at line 4)`]],
  ["-0.0 写在前面，报的文本仍是 0.0", bodySrc("\tvar d = {-0.0: 1, 0.0: 2}"), [`Key "0.0" was already used in this dictionary (at line 4). (at line 4)`]],
  ["String 与 StringName 同键", bodySrc('\tvar d = {"a": 1, &"a": 2}'), [`Key "a" was already used in this dictionary (at line 4). (at line 4)`]],
  ["StringName 在前也一样", bodySrc('\tvar d = {&"a": 1, "a": 2}'), [`Key "a" was already used in this dictionary (at line 4). (at line 4)`]],
  ["null 同键、文本 <null>", bodySrc("\tvar d = {null: 1, null: 2}"), [`Key "<null>" was already used in this dictionary (at line 4). (at line 4)`]],
  ["bool 同键、文本 true", bodySrc("\tvar d = {true: 1, true: 2}"), [`Key "true" was already used in this dictionary (at line 4). (at line 4)`]],
  ["折得出的算术键", bodySrc("\tvar d = {1 + 1: 2, 2: 3}"), [`Key "2" was already used in this dictionary (at line 4). (at line 4)`]],
  ["inf 键", bodySrc("\tvar d = {1.0 / 0.0: 1, 1.0 / 0.0: 2}"), [`Key "inf" was already used in this dictionary (at line 4). (at line 4)`]],
  ["-inf 键文本带号", bodySrc("\tvar d = {-1.0 / 0.0: 1, -1.0 / 0.0: 2}"), [`Key "-inf" was already used in this dictionary (at line 4). (at line 4)`]],
  ["nan 与自己同键", bodySrc("\tvar d = {0.0 / 0.0: 1, 0.0 / 0.0: 2}"), [`Key "nan" was already used in this dictionary (at line 4). (at line 4)`]],
  ["Vector2 键（int 字面量与 float 字面量同键）", bodySrc("\tvar d = {Vector2(1, 2): 1, Vector2(1.0, 2.0): 2}"), [`Key "(1.0, 2.0)" was already used in this dictionary (at line 4). (at line 4)`]],
  ["负 int 键文本带号", bodySrc("\tvar d = {-1: 1, -1: 2}"), [`Key "-1" was already used in this dictionary (at line 4). (at line 4)`]],
  ["int 与 float 是两支键", bodySrc("\tvar d = {1: 1, 1.0: 2}"), []],
  ["0 与 false 是两支键", bodySrc("\tvar d = {0: 1, false: 2}"), []],
  ["true 与 1 是两支键", bodySrc("\tvar d = {true: 1, 1: 2}"), []],
  ['"1" 与 1 是两支键', bodySrc('\tvar d = {"1": 1, 1: 2}'), []],
  ["0 与 0.0 是两支键", bodySrc("\tvar d = {0: 1, 0.0: 2}"), []],
  ["容器键不查（字典）", bodySrc("\tvar d = {{1: 2}: 1, {1: 2}: 2}"), []],
  ["容器键不查（数组）", bodySrc("\tvar d = {[1, 2]: 1, [1, 2]: 2}"), []],
  ["变量键不查", bodySrc("\tvar x = 1\n\tvar d = {1: 1, x: 2}"), []],
  ["单键字典收", bodySrc('\tvar d = {"a": 1}'), []],
  ["九支不同键的字典收", bodySrc('\tvar d = {1: "int", 1.0: "float", 0.0: "zero", true: "bool", "a": "str", 0: "inti", false: "boolf", null: "nil", Vector2(1, 2): "vec"}'), []],
];

let rejected = 0;
let accepted = 0;

describe("analyze · 字典字面量的重复键", () => {
  it.each(CASES)("%s", async (_name, src, expected) => {
    const diags = analyze(lower(await parseSource(src))).diagnostics.filter((d) => d.code === "dict-dup-key");
    const got = diags.map((d) => `${d.message} (at line ${String((d.loc as { line: number }).line)})`);
    expect(got, `源：\n${src}`).toEqual(expected);
    if (expected.length === 0) accepted++;
    else rejected++;
  });

  afterAll(() => {
    console.log(`\n重复键表：${String(CASES.length)} 形，引擎拒而我们拒 ${String(rejected)} 形，引擎收而我们也收 ${String(accepted)} 形`);
  });
});

/** NodePath 字面量键（S442，读数 `tmp/probe-dupnp/` 十四格）：同路径算重复，跨 String / StringName 各是各的键。 */
describe("重复键 · NodePath 那一族", () => {
  it("引擎拒的四形按同一句拒", async () => {
    const dups = [
      ['{^"a": 1, ^"a": 2}', "a"],
      ['{^"a/b": 1, ^"a/b": 2}', "a/b"],
      ['{^"": 1, ^"": 2}', ""],
      ['{NodePath("a"): 1, ^"a": 2}', "a"],
    ] as Array<[string, string]>;
    for (const [src, key] of dups) {
      const diags = analyze(lower(await parseSource(bodySrc("\tvar d = " + src)))).diagnostics.filter((d) => d.code === "dict-dup-key");
      const got = diags.map((d) => `${d.message} (at line ${String((d.loc as { line: number }).line)})`);
      expect(got, src).toEqual(['Key "' + key + '" was already used in this dictionary (at line 4). (at line 4)']);
    }
  });

  it("引擎收的四形不误拦", async () => {
    const keeps = ['{^"a": 1, "a": 2}', '{^"a": 1, &"a": 2}', '{^"a": 1, ^"b": 2}', '{^"a": 1, ^"A": 2}'];
    for (const src of keeps) {
      const diags = analyze(lower(await parseSource(bodySrc("\tvar d = " + src)))).diagnostics;
      expect(diags.map((d) => d.message), src).toEqual([]);
    }
  });
});
