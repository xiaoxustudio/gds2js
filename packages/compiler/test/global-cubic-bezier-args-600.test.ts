/** `cubic_interpolate` 四支与 `bezier_interpolate` / `bezier_derivative` 的解析期实参位（S600），读数 `tmp/probe569/{cubic,bezier}_{p2str,b1,a1,laststr}.gd`。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const diags = async (call: string): Promise<string[]> => {
  const tree = await parseSource(`extends SceneTree\n\nfunc _initialize():\n\tvar v = ${call}\n\tquit()\n`);
  return analyze(lower(tree)).diagnostics.map((d) => d.message);
};

const arg = (n: number): string => Array.from({ length: n }, (_, i) => "1.5").join(", ");
const at = (n: number, pos: number, bad: string): string =>
  Array.from({ length: n }, (_, i) => (i === pos - 1 ? bad : "1.5")).join(", ");
const many = (n: number, bads: number[]): string =>
  Array.from({ length: n }, (_, i) => (bads.includes(i + 1) ? `"s${i + 1}"` : "1.5")).join(", ");
const should = (fn: string, pos: number, want: string, got: string) =>
  `Invalid argument for "${fn}()" function: argument ${pos} should be "${want}" but is "${got}".`;

const FIVE = ["cubic_interpolate", "cubic_interpolate_angle", "bezier_interpolate", "bezier_derivative"] as const;
const EIGHT = ["cubic_interpolate_in_time", "cubic_interpolate_angle_in_time"] as const;

describe("cubic / bezier 六支的解析期实参位（S600）", () => {
  it("每一位都要 float，且一支调用只推第一个坏位", async () => {
    for (const fn of FIVE) {
      expect(await diags(`${fn}(${at(5, 2, `"s"`)})`), fn).toEqual([should(fn, 2, "float", "String")]);
      expect(await diags(`${fn}(${at(5, 5, `"s"`)})`), fn).toEqual([should(fn, 5, "float", "String")]);
      expect(await diags(`${fn}(${"\"a\"" + ", " + arg(4)})`), fn).toEqual([should(fn, 1, "float", "String")]);
    }
    for (const fn of EIGHT) {
      expect(await diags(`${fn}(${at(8, 2, `"s"`)})`), fn).toEqual([should(fn, 2, "float", "String")]);
      expect(await diags(`${fn}(${at(8, 8, `"s"`)})`), fn).toEqual([should(fn, 8, "float", "String")]);
      // 三位同时坏也只推第一位（引擎 3 / 5 位同为 String 却不推，读数 `tmp/d6/s603.gd`）
      expect(await diags(`${fn}(${many(8, [1, 5, 8])})`), fn).toEqual([should(fn, 1, "float", "String")]);
    }
  });
  it("容器位照推 A 式（不推迟到运行期），bool 与 int 字面量收", async () => {
    for (const fn of FIVE) {
      expect(await diags(`${fn}(${at(5, 1, "[1]")})`), fn).toEqual([should(fn, 1, "float", "Array")]);
      expect(await diags(`${fn}(${at(5, 1, "true")})`), fn).toEqual([]);
      expect(await diags(`${fn}(${at(5, 1, "2")})`), fn).toEqual([]);
    }
    for (const fn of EIGHT) {
      expect(await diags(`${fn}(${at(8, 1, "[1]")})`), fn).toEqual([should(fn, 1, "float", "Array")]);
      expect(await diags(`${fn}(${at(8, 1, "true")})`), fn).toEqual([]);
    }
  });
});
