/**
 * 具体型全局函数的名字实参（S527，把 S526 的旁路扩到多位、int/float/Dictionary/Variant.Type 各族）：
 * `tmp/d6/s527.py` 二百四十格（`error_string`/`instance_from_id`/`is_instance_id_valid`/`rand_from_seed`/
 * `rid_from_int64`/`type_string`/`randi_range`/`randf_range`/`randfn`/`dict_to_inst`/`bytes_to_var_with_objects`/
 * `convert`/`type_convert` × 十二型 × 各位）。引擎逐位按声明型发第二句；落地前 149 格放过、过拦 0。
 * `convert` / `type_convert` / `is_instance_of` 的第一参是 Variant，收一切、不登表。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(body: string): Promise<string[]> {
  return analyze(lower(await parseSource("extends SceneTree\n\n" + body))).map((d) => d.message).sort();
}

const INT = ["bool", "float", "int"];
// (fn, [位, want, 收集])
const SLOTS: Array<[string, Array<[number, string, string[]]>]> = [
  ["error_string", [[1, "int", INT]]],
  ["instance_from_id", [[1, "int", INT]]],
  ["is_instance_id_valid", [[1, "int", INT]]],
  ["rand_from_seed", [[1, "int", INT]]],
  ["rid_from_int64", [[1, "int", INT]]],
  ["type_string", [[1, "int", INT]]],
  ["randi_range", [[1, "int", INT], [2, "int", INT]]],
  ["randf_range", [[1, "float", INT], [2, "float", INT]]],
  ["randfn", [[1, "float", INT], [2, "float", INT]]],
  ["type_convert", [[2, "int", INT]]],
  ["dict_to_inst", [[1, "Dictionary", ["Dictionary"]]]],
  ["bytes_to_var_with_objects", [[1, "PackedByteArray", ["Array", "PackedByteArray"]]]],
  ["convert", [[2, "Variant.Type", ["int"]]]],
];
const BAD = ["Color", "String", "Array", "Dictionary", "PackedInt32Array"];

function call(fn: string, n: number, pos: number, expr: string): string {
  const args = Array.from({ length: n }, (_, i) => (i + 1 === pos ? expr : "1"));
  return `${fn}(${args.join(", ")})`;
}

describe("具体型全局函数多位名字实参（S527）", () => {
  for (const [fn, rows] of SLOTS) {
    for (const [pos, want, accept] of rows) {
      const n = Math.max(...rows.map(([p]) => p));
      for (const kind of BAD.filter((k) => !accept.includes(k))) {
        it(`${fn} pos${pos} · ${kind} 名：发句`, async () => {
          eq("527", `${fn} pos${pos} ${kind}`,
            await msgs(`var w: ${kind}\n\nfunc c():\n\tvar r = ${call(fn, n, pos, "w")}\n`),
            [`Invalid argument for "${fn}()" function: argument ${pos} should be "${want}" but is "${kind}".`]);
        });
      }
      for (const kind of accept.filter((k) => BAD.includes(k))) {
        it(`${fn} pos${pos} · ${kind} 名：收`, async () => {
          eq("527", `${fn} pos${pos} ${kind} 收`,
            await msgs(`var w: ${kind}\n\nfunc c():\n\tvar r = ${call(fn, n, pos, "w")}\n`), []);
        });
      }
    }
  }
});
