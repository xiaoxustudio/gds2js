// 签名判据现在认**标注过的局部变量**（S665，读数 `tmp/probe665` 的 d4 / d5 两格）：
// `var x: int = 5` 之后 `Array(x)` 引擎按静态型渲染成 `Array(int)` 并在解析期拒；
// 没登进签名表的型（`var w = [1, 2]` 这种推断形）照旧开口不了，留给运行期那一站。
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const src = (decl: string, call: string): string =>
  `extends SceneTree\n\nfunc _initialize():\n\t${decl}\n\tprint("V|", ${call})\n\tquit()\n`;
const msgs = async (decl: string, call: string): Promise<string[]> =>
  analyze(lower(await parseSource(src(decl, call)))).diagnostics.map((d) => d.message);
const noCtor = (sig: string): string => `No constructor of "Array" matches the signature "Array(${sig})".`;

describe("analyze · Array 签名判据认标注变量", () => {
  it("var x: int 之后 Array(x) 报 Array(int)", async () => {
    expect(await msgs("var x: int = 5", "Array(x)")).toEqual([noCtor("int")]);
  });

  it("var u: String 之后 Array(u, TYPE_INT) 报 Array(String, Variant.Type)", async () => {
    expect(await msgs('var u: String = "a"', "Array(u, TYPE_INT)")).toEqual([noCtor("String, Variant.Type")]);
  });

  it("推断形（无标注）交不出型 → 解析期一句不发", async () => {
    expect(await msgs("var w = [1, 2]", "Array(w)")).toEqual([]);
  });

  it("标注 Array 的四参合法形照旧收下", async () => {
    expect(await msgs("var v: Array = [1]", 'Array(v, TYPE_INT, &"", false)')).toEqual([]);
  });
});
