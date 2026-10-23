// 除零族的**解析期**两句（S694，尺 `tmp/probe715/{p,m,k}.gd` + 语料 `443-div-zero-parse` / `444-mod-zero-parse`）：
// 两侧都是字面量时引擎在解析期就开口，正文**不带引号**（`operator/.` 与 `operator%.`），与运行期那两句（带引号，见 `div-mod-zero-say-694`）不同文；
// `%` 这一支我们此前**完全没有**解析期规则（只在运行期发自述），`1.0 % 0.0` 则另发 `op-mod-float` 那一条，所以 `%` 只认 int 左操作数。
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const codes = async (body: string): Promise<string[]> => {
  const m = await lower(await parseSource("extends SceneTree\n\n" + body));
  return analyze(m).map((d) => d.code);
};

describe("analyze · 除零族解析期两句（S694）", () => {
  it("字面量两侧都发解析期那一句", async () => {
    expect(await codes("func _initialize():\n\tprint(100 / 0)\n")).toContain("div-by-zero");
    expect(await codes("func _initialize():\n\tprint(100 % 0)\n")).toContain("mod-by-zero");
    expect(await codes("var M = 100 % 0\n")).toContain("mod-by-zero");
  });

  it("实参来源与 float 左操作数都不发这一句", async () => {
    expect(await codes("func f(z):\n\tprint(100 % z)\n")).not.toContain("mod-by-zero");
    expect(await codes("func _initialize():\n\tprint(1.0 % 0.0)\n")).not.toContain("mod-by-zero");
    expect(await codes("func _initialize():\n\tprint(1.0 % 0.0)\n")).toContain("op-mod-float");
  });
});
