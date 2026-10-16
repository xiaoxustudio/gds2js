/**
 * 接收者静态已知（字面量 / 标注变量 / 形参标注）而方法名在那一面不存在时，引擎发的是解析期拒：
 * `String` / `Array` 两句，`Dictionary` 只发第二句；初值推断的名字与 `Variant` 装箱都不算静态（那两形运行期才给 `Invalid call. …`）。
 * 尺 `tmp/probe-slice/{round2,round3,round4,round8}.mts`，读数 `compare{104,105,106,110}.txt`（158 名 × 四面 + 180 名 × pack 九支的确认不存在名单）。
 * pack 那一面「标注变量发、推断变量不发」是 `tmp/probe-slice/r7c.gd` 一行一行对出来的。
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
    ["pack 构造位表外名", '\tprint(PackedStringArray(["a"]).join("-"))', BOTH("PackedStringArray", "join")],
    ["pack 标注变量表外名", '\tvar p: PackedStringArray = PackedStringArray(["a"])\n\tprint(p.join("-"))', BOTH("PackedStringArray", "join")],
    ["pack 推断变量放过", '\tvar p = PackedStringArray(["a"])\n\tprint(p.join("-"))', []],
    ["byte 独有的名在其余八支开口", "\tprint(PackedInt32Array([1]).hex_encode())", BOTH("PackedInt32Array", "hex_encode")],
    ["byte 独有的名在 byte 放过", "\tprint(PackedByteArray([1]).hex_encode())", []],
    ["to_byte_array 只在 byte 开口", "\tprint(PackedByteArray([1]).to_byte_array())", BOTH("PackedByteArray", "to_byte_array")],
    ["to_byte_array 在其余八支放过", "\tprint(PackedInt32Array([1]).to_byte_array())", []],
  ];

  it.each(CASES)("%s", async (_label, body, want) => {
    expect(await diags(body)).toEqual(want);
  });
});

describe("pack 的属性两面（读数 tmp/probe-attr/compare3.txt）", () => {
  const attrSay = (t: string, n: string): string => `Cannot find member "${n}" in base "${t}".`;
  const CASES: Array<[string, string, string[]]> = [
    ["构造位读表外名报两遍", "\tprint(PackedByteArray([1]).keys)", [attrSay("PackedByteArray", "keys"), attrSay("PackedByteArray", "keys")]],
    ["构造位写表外名报两遍", "\tPackedStringArray([\"a\"]).keys = 1", [attrSay("PackedStringArray", "keys"), attrSay("PackedStringArray", "keys")]],
    ["标注位读表外名", "\tvar q: PackedInt64Array = PackedInt64Array([1])\n\tprint(q.values)", [attrSay("PackedInt64Array", "values"), attrSay("PackedInt64Array", "values")]],
    ["byte 独有的名在其余八支开口", "\tprint(PackedInt32Array([1]).hex_encode)", [attrSay("PackedInt32Array", "hex_encode"), attrSay("PackedInt32Array", "hex_encode")]],
    ["byte 独有的名在 byte 放过", "\tprint(PackedByteArray([1]).hex_encode)", []],
    ["推断位读表外名放过", "\tvar q = PackedByteArray([1])\n\tprint(q.keys)", []],
    ["方法名当值读放过", "\tprint(PackedByteArray([1]).size)", []],
    ["写成员名给常量那一句", "\tvar q: PackedColorArray = PackedColorArray([Color(1, 0, 0, 1)])\n\tq.size = 1", ["Cannot assign a new value to a constant."]],
    ["读成员名不许发常量那句", "\tvar q: PackedColorArray = PackedColorArray([Color(1, 0, 0, 1)])\n\tprint(q.size)", []],
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
    ["byte compress", "\tprint(PackedByteArray([1]).compress(1))"],
    ["byte decompress", "\tprint(PackedByteArray([1]).decompress(6, 1))"],
    ["byte to_float32_array", "\tprint(PackedByteArray([1]).to_float32_array())"],
    ["byte to_int64_array", "\tprint(PackedByteArray([1]).to_int64_array())"],
    ["byte get_string_from_utf8", '\tprint(PackedByteArray([1]).get_string_from_utf8())'],
  ];

  it.each(OKAY)("%s", async (_label, body) => {
    expect((await diags(body)).filter((m) => /not found in base/.test(m))).toEqual([]);
  });
});
