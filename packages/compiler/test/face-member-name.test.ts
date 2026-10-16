/**
 * 接收者静态已知（字面量 / 标注变量 / 形参标注）而方法名在那一面不存在时，引擎发的是解析期拒：
 * `String` / `Array` 两句，`Dictionary` 只发第二句；初值推断的名字与 `Variant` 装箱都不算静态（那两形运行期才给 `Invalid call. …`）。
 * 尺 `tmp/probe-slice/{round2,round3,round4}.mts`，读数 `compare{104,105,106}.txt`（158 名 × 四面的存在名单）。
 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function diags(body: string): Promise<string[]> {
  return analyze(lower(await parseSource(`extends SceneTree\n\nfunc _initialize():\n${body}\n\tquit()\n`))).map((d) => d.message);
}

const ONE = (t: string, n: string): string => `Function "${n}()" not found in base ${t}.`;
const BOTH = (t: string, n: string): string[] => [`Cannot find member "${n}" in base "${t}".`, ONE(t, n)];

describe("静态接收者的表外方法名", () => {
  const CASES: Array<[string, string, string[]]> = [
    ["字面量 String 表外名", '\tprint("abcdef".slice(1))', BOTH("String", "slice")],
    ["字面量 String 乱造名", '\tprint("abcdef".nosuch(1))', BOTH("String", "nosuch")],
    ["标注 String 表外名", '\tvar s: String = "abcd"\n\tprint(s.slice(1))', BOTH("String", "slice")],
    ["推断 String 表外名放过", '\tvar s = "abcd"\n\tprint(s.slice(1))', []],
    ["字面量 Array 表外名", "\tprint([1, 2].nosuch())", BOTH("Array", "nosuch")],
    ["字面量字典表外名只第二句", '\tprint({1: 2}.nosuch())', [ONE("Dictionary", "nosuch")]],
    ["标注字典表外名只第二句", '\tvar d: Dictionary = {}\n\tprint(d.nosuch())', [ONE("Dictionary", "nosuch")]],
    ["字典推断变量放过", '\tvar d = {1: 2}\n\tprint(d.nosuch())', []],
  ];

  it.each(CASES)("%s", async (_label, body, want) => {
    expect(await diags(body)).toEqual(want);
  });
});

describe("存在但没量元数的名字不许误拦", () => {
  const OKAY: Array<[string, string]> = [
    ["字典 set", '\tvar d: Dictionary = {}\n\td.set(1, 2)'],
    ["字典 is_typed", "\tprint({1: 2}.is_typed())"],
    ["数组 set", "\tprint([1, 2].set(0, 3))"],
    ["pack erase", "\tprint(PackedInt32Array([1]).erase(1))"],
  ];

  it.each(OKAY)("%s", async (_label, body) => {
    expect((await diags(body)).filter((m) => /not found in base/.test(m))).toEqual([]);
  });
});
