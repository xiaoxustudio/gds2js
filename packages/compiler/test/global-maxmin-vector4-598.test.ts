/** `max` / `min` 六支的 Vector4 / Vector4i 字面量位：解析期句逐字钉（S598），读数 `tmp/d6/s600.gd` 与 `tmp/probe569/lit*.gd`。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const diags = async (src: string): Promise<string[]> => {
  const tree = await parseSource(`extends SceneTree\n\nfunc _initialize():\n\tvar v = ${src}\n\tprint("X||", v)\n\tquit()\n`);
  return analyze(lower(tree)).map((d) => d.message);
};

const V4 = "Vector4(1, 2, 3, 4)";
const V4I = "Vector4i(1, 2, 3, 4)";
const want = (fn: string, target: string, src: string) =>
  `Invalid argument for "${fn}()" function: argument 1 should be "${target}" but is "${src}".`;

describe("max / min 族的 Vector4 解析期位（S598）", () => {
  // 引擎那一趟只打 argument 1 就 `Failed to load script`；分析层把同一支调用的坏位逐位列全，所以钉的是**首条**与引擎逐字。
  it("max / min / maxf / minf 的首句目标是 float", async () => {
    for (const fn of ["max", "min", "maxf", "minf"]) {
      expect((await diags(`${fn}(${V4}, ${V4})`))[0], fn).toBe(want(fn, "float", "Vector4"));
    }
  });
  it("maxi / mini 的首句目标是 int，maxf 的 Vector4i 首句", async () => {
    for (const fn of ["maxi", "mini"]) {
      expect((await diags(`${fn}(${V4}, ${V4})`))[0], fn).toBe(want(fn, "int", "Vector4"));
      expect((await diags(`${fn}(${V4I}, ${V4I})`))[0], fn).toBe(want(fn, "int", "Vector4i"));
    }
    expect((await diags(`maxf(${V4I}, ${V4I})`))[0]).toBe(want("maxf", "float", "Vector4i"));
  });
  it("同族里 float 与 int 的合法位不误拦", async () => {
    expect(await diags(`max(1, 2.5)`)).toEqual([]);
    expect(await diags(`maxf(1.5, 2)`)).toEqual([]);
    expect(await diags(`maxi(1, 2)`)).toEqual([]);
  });
});
