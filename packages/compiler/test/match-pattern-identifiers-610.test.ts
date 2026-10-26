/** match 图案里的值模式标识符：引擎按**每次出现**报一句，且排在 guard 之前（S610，读数 `tmp/probe569/s618.gd` 七形）。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const shots = async (body: string): Promise<string[]> => {
  const src = `extends SceneTree\n\nfunc _initialize():\n${body}\n\tquit()\n`;
  return analyze(lower(await parseSource(src))).diagnostics
    .filter((d) => d.code === "undeclared-identifier")
    .map((d) => `${String((d.loc as { line: number }).line)}|${d.message}`);
};
const ERR = (n: string): string => `Identifier "${n}" not declared in the current scope.`;

describe("match 图案里的标识符（S610）", () => {
  it("图案与 guard 里的每次出现各一句，图案那截在前", async () => {
    expect(await shots('\tmatch [3, 1]:\n\t\t[a, b] when a > b:\n\t\t\tprint("1")\n\t\t_:\n\t\t\tprint("x")')).toEqual([
      `5|${ERR("a")}`,
      `5|${ERR("b")}`,
      `5|${ERR("a")}`,
      `5|${ERR("b")}`,
    ]);
    expect(await shots('\tmatch [3]:\n\t\t[a] when (a > 1):\n\t\t\tprint("2")\n\t\t_:\n\t\t\tprint("x")')).toEqual([`5|${ERR("a")}`, `5|${ERR("a")}`]);
    expect(await shots('\tmatch [3]:\n\t\t[k, v] when k > 1 and v > 2 and k > 3:\n\t\t\tprint("7")\n\t\t_:\n\t\t\tprint("x")')).toEqual([
      `5|${ERR("k")}`,
      `5|${ERR("v")}`,
      `5|${ERR("k")}`,
      `5|${ERR("v")}`,
      `5|${ERR("k")}`,
    ]);
  });
  it("只用图案不用守卫也报、只守卫里的名字报一句、被外层 var 遮住就不报", async () => {
    expect(await shots('\tmatch [3]:\n\t\t[a, b] when 1 > 0:\n\t\t\tprint("4")\n\t\t_:\n\t\t\tprint("x")')).toEqual([`5|${ERR("a")}`, `5|${ERR("b")}`]);
    expect(await shots('\tmatch [3]:\n\t\t[_, _] when q > 1:\n\t\t\tprint("3")\n\t\t_:\n\t\t\tprint("x")')).toEqual([`5|${ERR("q")}`]);
    expect(await shots('\tvar a = 9\n\tmatch [3]:\n\t\t[a] when a > 1:\n\t\t\tprint("5")\n\t\t_:\n\t\t\tprint("x")')).toEqual([]);
  });
  it("两个手臂各算各的", async () => {
    expect(await shots('\tmatch [3]:\n\t\t[c] when c > 1:\n\t\t\tprint("6a")\n\t\t[c] when c > 2:\n\t\t\tprint("6b")\n\t\t_:\n\t\t\tprint("x")')).toEqual([
      `5|${ERR("c")}`,
      `5|${ERR("c")}`,
      `7|${ERR("c")}`,
      `7|${ERR("c")}`,
    ]);
  });
});
