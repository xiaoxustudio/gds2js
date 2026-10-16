/**
 * `String % 值` 的解析期格式化检查（S445）：尺 `tmp/probe-pct/{matrix,round2,round3,round4}.py`，读数同名的 `.txt` 与 `chars.txt`，
 * 两侧对过 160 + 264 + 340 格零分岔（round3 那 9 格是「表达式证不出就放过」那一族，出货按口径不响）。
 * 引擎只在**左支是字符串字面量、右支来源证得出**时把关，实参是 Array / Dictionary / Packed* 构造整族放过。
 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const MOD = (body: string): string => `extends SceneTree\n\nfunc _initialize():\n${body}\n\tquit()\n`;

async function pct(fmt: string, arg: string): Promise<string[]> {
  const src = MOD("\tvar s = " + JSON.stringify(fmt) + " % " + arg);
  const ir = lower(await parseSource(src));
  return analyze(ir).filter((d) => d.code === "pct-format").map((d) => d.message);
}

const NA = "not all arguments converted during string formatting in operator %.";
const NUM = "a number is required in operator %.";
const UC = "unsupported format character in operator %.";
const INC = "incomplete format in operator %.";
const NE = "not enough arguments for format string in operator %.";
const CHR = "%c requires number or single-character string in operator %.";
const NEG = "unsigned integer is lower than minimum in operator %.";
const VEC = "%v requires a vector type (Vector2/3/4/2i/3i/4i) in operator %.";
const STAR = "* wants number or vector in operator %.";

describe("String % 值 · 合式与元数那几句", () => {
  const CASES: Array<[string, [string, string, string[]]]> = [
    ["零个转换符", ["a", "1", [NA]]],
    ["只有 %%", ["%%", "1", [NA]]],
    ["转义后仍有裸 d", ["a%%d", "1", [NA]]],
    ["%d 收到串", ["a%d", '"b"', [NUM]]],
    ["%d 收到 bool", ["a%d", "true", [NUM]]],
    ["%d 收到 null", ["a%d", "null", [NUM]]],
    ["%d 收到 int", ["a%d", "1", []]],
    ["%d 收到 float", ["a%d", "1.5", []]],
    ["%s 什么都能收", ["a%s", '"b"', []]],
    ["未知转换符 n", ["a%n", "1", [UC]]],
    ["未知转换符 z", ["a%z", "1", [UC]]],
    ["键式映射配标量", ["a%(k)s", "1", [UC]]],
    ["只有 %( 没收尾", ["%(", "1", [UC]]],
    ["结尾单 %", ["a%", "1", [INC]]],
    ["旗子后断句", ["a%-", "1", [INC]]],
    ["两个转换符配一支实参", ["a%d%s", "1", [NE]]],
    ["两个转换符但第一位就不合", ["a%d%s", '"b"', [NUM]]],
    ["三个转换符", ["a%d%d%d", "1", [NE]]],
    ["%d 之后又断在 %", ["a%d%", "1", [INC]]],
    ["%d 之后断句且实参是串", ["a%d%", '"b"', [NUM]]],
    ["宽度与精度都收", ["a%5d", "1", []]],
    ["%.2f 收 float", ["a%.2f", "1.5", []]],
    ["负号字面量算数", ["a%d", "-1", []]],
  ];

  it.each(CASES)("%s", async (_label, [fmt, arg, want]) => {
    expect(await pct(fmt, arg)).toEqual(want);
  });
});

describe("String % 值 · 放过的形", () => {
  const KEEPS: Array<[string, [string, string]]> = [
    ["实参是数组", ["a", "[1, 2]"]],
    ["实参是字符串数组", ["a", '["a"]']],
    ["实参是字典", ["a", '{"k": 2}']],
    ["键式映射配字典", ["a%(k)s", '{"k": 2}']],
    ["两个转换符配数组", ["a%d%s", "[1, 2]"]],
    ["合式的单支", ["a%d", "7"]],
  ];
  it.each(KEEPS)("%s", async (_label, [fmt, arg]) => {
    expect(await pct(fmt, arg)).toEqual([]);
  });

  it("右支是变量证不出来源，一句不发", async () => {
    const src = MOD("\tvar q = 1\n\tvar s = " + JSON.stringify("a") + " % q");
    expect(analyze(await lower(await parseSource(src))).filter((d) => d.code === "pct-format")).toEqual([]);
  });

  it("左支不是字面量就不判", async () => {
    const src = MOD('\tvar f = "a"\n\tvar s = f % 1');
    expect(analyze(await lower(await parseSource(src))).filter((d) => d.code === "pct-format")).toEqual([]);
  });

  it("字符串里带百分号的合式写法不误拦", async () => {
    expect(await pct("进度 %d%%", "50")).toEqual([]);
  });
});

/** 52 个转换符全扫过裁判（`tmp/probe-pct/chars.txt`）：数槽只有 `dfoxX`，`s` 全收，`c` / `v` / `u` 各有自己那句，其余一律不合式。 */
describe("String % 值 · 转换符的四个集合", () => {
  const CLS: Array<[string, [string, string, string[]]]> = [
    ["d 数槽", ["%d", "1", []]],
    ["x 数槽", ["%x", "1", []]],
    ["X 数槽", ["%X", "1", []]],
    ["o 数槽", ["%o", "1", []]],
    ["f 数槽", ["%f", "1.5", []]],
    ["i 不在数槽里", ["%i", "1", [UC]]],
    ["e 不在数槽里", ["%e", "1", [UC]]],
    ["g 不在数槽里", ["%g", "1", [UC]]],
    ["大写 D 不合式", ["%D", "1", [UC]]],
    ["u 给的是断句那一句", ["%u", "1", [INC]]],
    ["旗子只认 - + 0", ["%-5d", '"b"', [NUM]]],
    ["加号旗子", ["%+d", '"b"', [NUM]]],
    ["零旗子", ["%05d", '"b"', [NUM]]],
    ["井号不是旗子", ["%#x", "1", [UC]]],
    ["空格不是旗子", ["% 5d", "1", [UC]]],
    ["l 不是旗子", ["%ld", "1", [UC]]],
    ["s 什么都收", ["%s", "true", []]],
    ["单字符串收", ["%c", '"a"', []]],
    ["多字符串那句", ["%c", '"ab"', [CHR]]],
    ["空串那句", ["%c", '""', [CHR]]],
    ["StringName 不看长度", ["%c", '&"a"', [CHR]]],
    ["NodePath 那句", ["%c", '^"a"', [CHR]]],
    ["bool 那句", ["%c", "true", [CHR]]],
    ["负数进无符号那句", ["%c", "-1", [NEG]]],
    ["负的 float 也那句", ["%c", "-1.5", [NEG]]],
    ["v 要向量", ["%v", "1", [VEC]]],
    ["v 收到 Vector2", ["%v", "Vector2(1, 2)", []]],
    ["v 收到 Vector3", ["%v", "Vector3(1, 2, 3)", []]],
    ["v 那支 Color 拒", ["%v", "Color(1, 2, 3, 4)", [VEC]]],
    ["u 是旗子不是转换符", ["%uc", "true", [CHR]]],
    ["u 后面接数槽", ["%ud", '"b"', [NUM]]],
    ["u 后面接向量槽", ["%uv", "1", [VEC]]],
    ["u 可以叠", ["%uuc", '&"a"', [CHR]]],
    ["u 收尾是断句", ["%u", "1", [INC]]],
    ["u 之后是转义", ["%u%", "1", [NA]]],
    ["u 之后仍有旗子", ["%u5d", '"b"', [NUM]]],
    ["u 之后断在精度", ["%u.c", "true", [CHR]]],
    ["空格旗子排在 u 后也不合", ["%u d", "1", [UC]]],
  ];
  it.each(CLS)("%s", async (_label, [fmt, arg, want]) => {
    expect(await pct("p" + fmt, arg)).toEqual(want);
  });
});

describe("String % 值 · 值型实参与星号槽", () => {
  const V: Array<[string, [string, string, string[]]]> = [
    ["向量进数槽拒", ["%d", "Vector2(1, 2)", [NUM]]],
    ["向量进数槽拒 2", ["%x", "Vector3(1, 2, 3)", [NUM]]],
    ["Color 进数槽拒", ["%d", "Color(1, 2, 3, 4)", [NUM]]],
    ["Callable 进数槽拒", ["%d", "Callable()", [NUM]]],
    ["NodePath 进数槽拒", ["%d", '^"a"', [NUM]]],
    ["星号槽收数", ["%*d", "1", [NE]]],
    ["星号槽收向量", ["%*d", "Vector2(1, 2)", [NE]]],
    ["星号槽拒串", ["%*d", '"b"', [STAR]]],
    ["精度位的星号", ["%.*d", '"b"', [STAR]]],
    ["星号槽合式但仍缺支", ["%*c", "1", [NE]]],
    ["定型数组放过", ["%d", "PackedInt32Array([1])", []]],
    ["表达式证不出就放过", ["%d", "len(\"abc\")", []]],
    ["幂算式放过", ["%d", "2 ** 3", []]],
    ["括起来的加法放过", ["%d", "(1 + 2)", []]],
    ["self 放过", ["%d", "self", []]],
  ];
  it.each(V)("%s", async (_label, [fmt, arg, want]) => {
    expect(await pct("p" + fmt, arg)).toEqual(want);
  });
});
