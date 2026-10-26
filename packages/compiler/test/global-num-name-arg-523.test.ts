/**
 * 数值（int / float）参数学全局函数的名字实参（S523，把 S518–S522 的 float 旁路泛化到 int 参、并补 ceili/floori/roundi 的 float 位）：
 * `tmp/d6/s523.py` 二百一十格（`absi`/`char`/`clampi`/`maxi`/`mini`/`nearest_po2`/`posmod`/`signi`/`wrapi`/`snappedi` pos2 各 int 位
 * × 十型名字实参），读数同名 `.json`。引擎对 int 位逐位发 `argument N should be "int" but is "<K>"`、收 {bool,int,float}
 * —— 与 float 位同一判据，只差期望型名。落地：`GLOBAL_FLOAT_ARITH` 更名 `GLOBAL_NUM_ARITH`、名字旁路放到 want ∈ {float,int}、
 * 消息用实际 want；补这些 int 参函数与 ceili/floori/roundi（pos1 float）入表。`wrap`（一切接受）与 `clamp`/`lerp`（跟第一参走）不进。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(body: string): Promise<string[]> {
  return analyze(lower(await parseSource("extends SceneTree\n\n" + body))).diagnostics.map((d) => d.message).sort();
}

const REFUSE = ["Color", "String", "Vector2", "Array", "Dictionary", "PackedInt32Array"];
// (fn, 位数, int 位号列表, float 位号列表)
const FNS: Array<[string, number, number[], number[]]> = [
  ["absi", 1, [1], []], ["char", 1, [1], []], ["signi", 1, [1], []], ["nearest_po2", 1, [1], []],
  ["clampi", 3, [1, 2, 3], []], ["maxi", 2, [1, 2], []], ["mini", 2, [1, 2], []],
  ["posmod", 2, [1, 2], []], ["wrapi", 3, [1, 2, 3], []], ["snappedi", 2, [2], [1]],
  ["ceili", 1, [], [1]], ["floori", 1, [], [1]], ["roundi", 1, [], [1]], ["step_decimals", 1, [], [1]],
];

function call(fn: string, n: number, pos: number, expr: string): string {
  const args = Array.from({ length: n }, (_, i) => (i + 1 === pos ? expr : "1"));
  return `${fn}(${args.join(", ")})`;
}
function wantOf(pos: number, intPos: number[]): string {
  return intPos.includes(pos) ? "int" : "float";
}

describe("数值参数学全局函数：名字实参按 want 型逐位对齐引擎（S523）", () => {
  for (const [fn, n, intPos, floatPos] of FNS) {
    for (const pos of [...intPos, ...floatPos]) {
      const want = wantOf(pos, intPos);
      for (const kind of REFUSE) {
        it(`${fn} pos${pos} · ${kind} 名：${want}`, async () => {
          eq("523", `${fn} pos${pos} ${kind}`,
            await msgs(`var w: ${kind}\n\nfunc c():\n\tvar r = ${call(fn, n, pos, "w")}\n`),
            [`Invalid argument for "${fn}()" function: argument ${pos} should be "${want}" but is "${kind}".`]);
        });
      }
      for (const kind of ["bool", "int", "float"]) {
        it(`${fn} pos${pos} · ${kind} 名：收`, async () => {
          eq("523", `${fn} pos${pos} ${kind} 收`,
            await msgs(`var w: ${kind}\n\nfunc c():\n\tvar r = ${call(fn, n, pos, "w")}\n`), []);
        });
      }
    }
  }
});
