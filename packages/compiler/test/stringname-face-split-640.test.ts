/** 解析期的 StringName 分岔（S640）：六名表外、三名零元，两句找不到成员与元数两句都按静态接收者发；推断接收者放过。
 *  读数 `tmp/probe639/sn639.compare.txt`（十二形，一脚本一形）。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function diags(body: string): Promise<string[]> {
  return analyze(lower(await parseSource(`extends SceneTree\n\nfunc _initialize():\n${body}\n\tquit()\n`))).map((d) => d.message);
}

const TWO = (n: string): string[] => [`Cannot find member "${n}" in base "StringName".`, `Function "${n}()" not found in base StringName.`];

describe("解析期 · StringName 名册与 String 分裂（S640）", () => {
  const CASES: Array<[string, string, string[]]> = [
    ["标注接收者的表外名", '\tvar s: StringName = &"a"\n\tprint(s.chr(65))', TWO("chr")],
    ["num 也是表外名", '\tvar s: StringName = &"a"\n\tprint(s.num(1))', TWO("num")],
    ["humanize_size 也是表外名", '\tvar s: StringName = &"a"\n\tprint(s.humanize_size(1))', TWO("humanize_size")],
    ["推断接收者放过", '\tvar s = &"a"\n\tprint(s.chr(65))', []],
    ["零元那支多给", '\tvar s: StringName = &"a"\n\tprint(s.uri_file_decode(1))', ['Too many arguments for "uri_file_decode()" call. Expected at most 0 but received 1.']],
    ["ascii 那支多给", '\tvar s: StringName = &"a"\n\tprint(s.is_valid_ascii_identifier(1))', ['Too many arguments for "is_valid_ascii_identifier()" call. Expected at most 0 but received 1.']],
    ["零元两支空手收下", '\tvar s: StringName = &"a"\n\tprint(s.uri_file_decode())\n\tprint(s.is_valid_ascii_identifier())', []],
    ["count 仍按 String 的上界", '\tvar s: StringName = &"a"\n\tprint(s.count("a", 1, 2, 3))', ['Too many arguments for "count()" call. Expected at most 3 but received 4.']],
  ];
  for (const [name, src, want] of CASES) {
    it(name, async () => {
      expect(await diags(src)).toEqual(want);
    });
  }
  it("属性读那一形把找不到成员发两遍", async () => {
    const one = `Cannot find member "chr" in base "StringName".`;
    expect(await diags('\tvar s: StringName = &"a"\n\tprint(s.chr)')).toEqual([one, one]);
  });
});
