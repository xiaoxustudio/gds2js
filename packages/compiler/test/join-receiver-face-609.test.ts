/** `join()` 的接收者那一面（S609）：句子由通用的 `face-member-*` 判据发，Dictionary 只有一句。读数 `tmp/probe569/s616.gd`。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const msgs = async (body: string): Promise<string[]> => {
  const src = `extends SceneTree\n\nfunc _initialize():\n${body}\n\tquit()\n`;
  return analyze(lower(await parseSource(src))).diagnostics.map((d) => d.message);
};
const MISSING = (base: string) => `Cannot find member "join" in base "${base}".`;
const NOT_FOUND = (base: string) => `Function "join()" not found in base ${base}.`;

describe("join() 的接收者面（S609）", () => {
  it("Array 与 pack 两句、Dictionary 只一句", async () => {
    expect(await msgs("\tprint([1, 2].join(5))")).toEqual([MISSING("Array"), NOT_FOUND("Array")]);
    expect(await msgs("\tprint(PackedByteArray([1]).join(5))")).toEqual([MISSING("PackedByteArray"), NOT_FOUND("PackedByteArray")]);
    expect(await msgs("\tprint(PackedInt32Array([1]).join(5))")).toEqual([MISSING("PackedInt32Array"), NOT_FOUND("PackedInt32Array")]);
    expect(await msgs('\tprint({"a": 1}.join(5))')).toEqual([NOT_FOUND("Dictionary")]);
  });
  it("标注接收者两句、推断接收者解析期放过", async () => {
    expect(await msgs("\tvar b: Array = []\n\tprint(b.join(5))")).toEqual([MISSING("Array"), NOT_FOUND("Array")]);
    expect(await msgs("\tvar c: PackedInt32Array = PackedInt32Array([1])\n\tprint(c.join(5))")).toEqual([MISSING("PackedInt32Array"), NOT_FOUND("PackedInt32Array")]);
    expect(await msgs("\tvar a = []\n\tprint(a.join(5))")).toEqual([]);
  });
});
