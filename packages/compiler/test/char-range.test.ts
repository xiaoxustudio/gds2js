/**
 * S336 · `char()` 的字面量整数越界：引擎在解析期给的那一句，非法 4 形钉原文、合法 10 形钉「不许误拦」。
 * 句子与两侧形状来自一格一脚本的读数 `tmp/probe-char/readings.txt`（float / bool 字面量引擎是放过的，`char(1.5)` 实测给 U+0001）。
 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const diags = async (src: string): Promise<string[]> => {
  const body = src.startsWith("var ") ? src : `print("X||", ${src})`;
  return analyze(lower(await parseSource(`extends SceneTree\n\nfunc _initialize():\n\t${body}\n\tquit()\n`))).diagnostics.map((d) => d.message);
};

const SENT = 'Invalid argument for "char()" function: Expected an integer between 0 and 2^32 - 1.';

const BAD: string[] = ["char(-1)", "char(4294967296)", "char(9223372036854775807)", "char(-4294967296)"];
const GOOD: string[] = [
  "char(0)",
  "char(65)",
  "char(4294967295)",
  "char(2147483648)",
  "char(1.5)",
  "char(1.0)",
  "char(-0.0)",
  "char(true)",
  "char(-1 * 3)",
  "char(0 - 1)",
];

describe("char() 的字面量区间这一拒", () => {
  it.each(BAD)("%s", async (src) => {
    expect(await diags(src), src).toContain(SENT);
  });

  it.each(GOOD)("合法形不许被拦 %s", async (src) => {
    expect(await diags(src), src).toEqual([]);
  });

  it("非字面量的实参引擎是运行期错，这一拒不碰它", async () => {
    expect(await diags("var q = -1\n\tprint(\"X||\", char(q))")).toEqual([]);
  });
});
