/**
 * 具体型全局函数的名字实参（S526）：`load`/`str_to_var` 收 {NodePath,String,StringName}、`bytes_to_var` 收
 * {Array,PackedByteArray}、`inst_to_dict` 收空集 —— 其余 kind 引擎解析期发
 * `Invalid argument for "<fn>()" function: argument 1 should be "<want>" but is "<K>".`（`tmp/d6/s526.py` 68 格逐型量过）。
 * 落地：全局门在 `GLOBAL_ARG_TYPES` 几族判定之前加 `GLOBAL_TYPED_NAME_ARGS` 旁路（只补 ident；literal 已由原表处理）。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(body: string): Promise<string[]> {
  return analyze(lower(await parseSource("extends SceneTree\n\n" + body))).map((d) => d.message).sort();
}

const REFUSE = ["int", "Color", "Vector2", "Dictionary", "PackedInt32Array"];
const SLOTS: Array<[string, string, string[]]> = [
  ["load", "String", ["NodePath", "String", "StringName"]],
  ["str_to_var", "String", ["NodePath", "String", "StringName"]],
  ["bytes_to_var", "PackedByteArray", ["Array", "PackedByteArray"]],
  ["inst_to_dict", "Object", []],
];

describe("具体型全局函数：名字实参按声明型解析期拒（S526）", () => {
  for (const [fn, want, accept] of SLOTS) {
    for (const kind of REFUSE) {
      it(`${fn}(${kind})：发句`, async () => {
        eq("526", `${fn}(${kind})`, await msgs(`var w: ${kind}\n\nfunc c():\n\tvar r = ${fn}(w)\n`),
          [`Invalid argument for "${fn}()" function: argument 1 should be "${want}" but is "${kind}".`]);
      });
    }
    for (const kind of accept) {
      it(`${fn}(${kind})：收`, async () => {
        eq("526", `${fn}(${kind}) 不该开口`, await msgs(`var w: ${kind}\n\nfunc c():\n\tvar r = ${fn}(w)\n`), []);
      });
    }
  }
});
