/**
 * want 非 int/float 的全局行也补九支 pack（S535）：`inst_to_dict`（Object）、`convert` 第二参（Variant.Type）、
 * `dict_to_inst`（Dictionary）、`bytes_to_var` / `bytes_to_var_with_objects`（PackedByteArray）的 pack 字面量
 * 引擎逐格发第二句、我们此前放过；`convert` 的 pack 原来错归到「int」那子行（引擎说 **Variant.Type**）。
 * 注意 `bytes_to_var` 的 want 本身是 PackedByteArray —— 它的收的集里就有 `PackedByteArray`（语料 274 那格），
 * 那支**不能**进货 refuse 名单（否则会发 `should be "PackedByteArray" but is "PackedByteArray"` 的自相矛盾句）。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(expr: string): Promise<string[]> {
  return analyze(lower(await parseSource(`extends SceneTree\n\nfunc c():\n\tvar r = ${expr}\n`))).diagnostics.map((d) => d.message).sort();
}

const SHOULD = (fn: string, pos: number, want: string, kind: string): string =>
  `Invalid argument for "${fn}()" function: argument ${pos} should be "${want}" but is "${kind}".`;

const CASES: Array<[string, string, string]> = [
  ["inst_to_dict(PackedByteArray)", "inst_to_dict(PackedByteArray([1]))", SHOULD("inst_to_dict", 1, "Object", "PackedByteArray")],
  ["inst_to_dict(PackedColorArray)", "inst_to_dict(PackedColorArray([Color(1, 0, 0)]))", SHOULD("inst_to_dict", 1, "Object", "PackedColorArray")],
  ["convert(1, PackedByteArray)", "convert(1, PackedByteArray([1]))", SHOULD("convert", 2, "Variant.Type", "PackedByteArray")],
  ["convert(1, PackedStringArray)", 'convert(1, PackedStringArray(["a"]))', SHOULD("convert", 2, "Variant.Type", "PackedStringArray")],
  ["dict_to_inst(PackedByteArray)", "dict_to_inst(PackedByteArray([1]))", SHOULD("dict_to_inst", 1, "Dictionary", "PackedByteArray")],
  ["bytes_to_var(PackedColorArray)", "bytes_to_var(PackedColorArray([Color(1, 0, 0)]))", SHOULD("bytes_to_var", 1, "PackedByteArray", "PackedColorArray")],
  ["bytes_to_var_with_objects(PackedColorArray)", "bytes_to_var_with_objects(PackedColorArray([Color(1, 0, 0)]))", SHOULD("bytes_to_var_with_objects", 1, "PackedByteArray", "PackedColorArray")],
];

describe("非 int/float 全局行的 pack 字面量（S535）", () => {
  for (const [label, expr, want] of CASES) {
    it(`${label}：发句`, async () => eq("535", label, await msgs(expr), [want]));
  }
  for (const expr of ["bytes_to_var(PackedByteArray([1]))", "bytes_to_var([1])", "bytes_to_var_with_objects(PackedByteArray([1]))"]) {
    it(`${expr}：收`, async () => eq("535", expr, await msgs(expr), []));
  }
  it("convert(1, \"a\")：仍是 int 那一子行", async () => eq("535", "convert int", await msgs('convert(1, "a")'), [SHOULD("convert", 2, "int", "String")]));
});
