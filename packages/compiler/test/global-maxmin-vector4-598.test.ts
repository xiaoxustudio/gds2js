/** `max` / `min` 六支的 Vector4 / Vector4i 字面量位：解析期句逐字钉（S598），读数 `tmp/d6/s600.gd` 与 `tmp/probe569/lit*.gd`。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const diags = async (src: string): Promise<string[]> => {
  const tree = await parseSource(`extends SceneTree\n\nfunc _initialize():\n\tvar v = ${src}\n\tprint("X||", v)\n\tquit()\n`);
  return analyze(lower(tree)).diagnostics.map((d) => d.message);
};

const V4 = "Vector4(1, 2, 3, 4)";
const V4I = "Vector4i(1, 2, 3, 4)";
const want = (fn: string, target: string, src: string) =>
  `Invalid argument for "${fn}()" function: argument 1 should be "${target}" but is "${src}".`;

describe("max / min 族的 Vector4 解析期位（S598）", () => {
  // 单一变体那一族引擎只推**第一个坏位**（S599 把分析层对齐），多变体那一族（`randf_range`）逐位推 —— 两种形状都在下面钉住。
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
  // S604：两支的 Vector4i 字面量位补量完（读数 `tmp/d6/s604.out`），两侧同句。
  it("min / minf 收 Vector4i 字面量", async () => {
    expect(await diags(`min(${V4I}, ${V4I})`)).toEqual([want("min", "float", "Vector4i")]);
    expect(await diags(`minf(${V4I}, ${V4I})`)).toEqual([want("minf", "float", "Vector4i")]);
  });
  it("同族里 float 与 int 的合法位不误拦", async () => {
    expect(await diags(`max(1, 2.5)`)).toEqual([]);
    expect(await diags(`maxf(1.5, 2)`)).toEqual([]);
    expect(await diags(`maxi(1, 2)`)).toEqual([]);
  });
  it("单一变体那族只推第一个坏位，多变体那族仍然逐位推（S599）", async () => {
    expect(await diags(`maxf(${V4I}, ${V4I})`)).toEqual([want("maxf", "float", "Vector4i")]);
    expect(await diags(`clampi("x", "y", "z")`)).toEqual([
      `Invalid argument for "clampi()" function: argument 1 should be "int" but is "String".`,
    ]);
    const rr = await diags(`randf_range([1], "a")`);
    expect(rr).toContain(`Invalid argument for "randf_range()" function: argument 1 should be "float" but is "Array".`);
    expect(rr).toContain(`Cannot pass a value of type "String" as "float".`);
    expect(rr).toContain(`Invalid argument for "randf_range()" function: argument 2 should be "float" but is "String".`);
  });
});
