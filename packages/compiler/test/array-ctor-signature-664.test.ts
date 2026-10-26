// `Array(...)` 的解析期签名臂（S664，读数 `tmp/probe665` + `tmp/probe663` 十七格两侧对读）：
// 拒的那一形引擎在解析期发 `No constructor of "Array" matches the signature "Array(<型名表>)".`，
// 我们此前把十三格拖到运行期自发话。型名渲染：TYPE_* → `Variant.Type`、`Packed*Array(…)` → 本名、`null` → `null`。
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const src = (call: string): string => `extends SceneTree\n\nfunc _initialize():\n\tprint("V|", ${call})\n\tquit()\n`;
const msgs = async (call: string): Promise<string[]> =>
  analyze(lower(await parseSource(src(call)))).diagnostics.map((d) => d.message);
const noCtor = (sig: string): string => `No constructor of "Array" matches the signature "Array(${sig})".`;

const REFUSED: Array<[string, string]> = [
  ["Array(5, TYPE_INT)", "int, Variant.Type"],
  ["Array(5, TYPE_INT, 0)", "int, Variant.Type, int"],
  ['Array([1], TYPE_INT, &"")', "Array, Variant.Type, StringName"],
  ['Array([1], TYPE_INT, "x")', "Array, Variant.Type, String"],
  ['Array(5, TYPE_INT, &"")', "int, Variant.Type, StringName"],
  ["Array([1], TYPE_INT, 0, null)", "Array, Variant.Type, int, null"],
  ['Array([1], TYPE_INT, 0, "")', "Array, Variant.Type, int, String"],
  ['Array(5, "", "", false)', "int, String, String, bool"],
  ["Array([], TYPE_INT, 0, false)", "Array, Variant.Type, int, bool"],
  ['Array(5, TYPE_INT, &"", false)', "int, Variant.Type, StringName, bool"],
  ['Array({}, TYPE_INT, &"", false)', "Dictionary, Variant.Type, StringName, bool"],
  ['Array([1], TYPE_INT, &"", false, true)', "Array, Variant.Type, StringName, bool, bool"],
  ['Array(5, TYPE_INT, 0, "", 1)', "int, Variant.Type, int, String, int"],
  ['Array([1], TYPE_INT, TYPE_OBJECT, &"RefCounted")', "Array, Variant.Type, Variant.Type, StringName"],
];

const ACCEPTED = ["Array()", "Array([1, 2])", "Array(PackedByteArray([1]))", "Array(PackedInt32Array([1, 2]))",
  'Array([], TYPE_INT, &"", false)', 'Array([1], TYPE_INT, &"", 1)', 'Array([], 0, &"", null)', 'Array([1], TYPE_STRING, &"", null)'];

describe("analyze · Array 的解析期签名臂", () => {
  it.each(REFUSED)("%s 给引擎那一句", async (call, sig) => {
    expect(await msgs(call), call).toEqual([noCtor(sig)]);
  });

  it.each(ACCEPTED)("%s 一句不发", async (call) => {
    expect(await msgs(call), call).toEqual([]);
  });

  it("行号与引擎同格", async () => {
    const source = src("Array(5, TYPE_INT)");
    const at = source.split("\n").indexOf('\tprint("V|", Array(5, TYPE_INT))') + 1;
    const got = analyze(lower(await parseSource(source))).diagnostics;
    expect(got.map((d) => `${String(d.loc?.line)}|${d.message}`)).toEqual([`${String(at)}|${noCtor("int, Variant.Type")}`]);
  });
});
