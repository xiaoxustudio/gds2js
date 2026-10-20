/**
 * 多参 float 数学全局函数（`wrapf`/`move_toward`/`smoothstep`/`is_equal_approx`/`remap`）的**名字实参**（S519）：
 * `tmp/d6/s519.py` 一百四十四格（5 支函数把名字实参逐位置放置、其余位填 `1.0` × 九型），读数同名 `.json`。
 * 引擎逐位都发 `argument N should be "float" but is "<K>"`、收 {bool,int,float}（多参与单参同判，float 隐式转换普适）。
 * `remap` 此前整支没登进 `GLOBAL_ARG_TYPES` → 字面量与名字两形都放过（`tmp/d6/remap.gd` 实测引擎 `remap(Color,…) → argument 1 should be "float"`、
 * `remap(1.0,"x",…) → argument 2 …`）；本轮把 remap 补进表（五位 float），字面量路与 S518 名字旁路一并接上。
 * 落地：S518 名字旁路由「pos1 单参」泛化为「allowlist 函数所有 want==="float" 的 spec 位」，字面量交回原路不重复。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(body: string): Promise<string[]> {
  const src = "extends SceneTree\n\n" + body;
  return analyze(lower(await parseSource(src))).map((d) => d.message).sort();
}

const REFUSE = ["Color", "String", "Vector2", "Array", "Dictionary", "PackedInt32Array"];
// (fn, 位数) —— 1 位与 2 位的纯 float 参数学全局函数（S521 逐位量过、无 interplay）
const FNS: Array<[string, number]> = [["wrapf", 3], ["move_toward", 3], ["smoothstep", 3], ["is_equal_approx", 2], ["remap", 5],
  ["atan2", 2], ["pow", 2], ["maxf", 2], ["minf", 2], ["angle_difference", 2],
  ["acos", 1], ["asin", 1], ["atan", 1], ["atanh", 1], ["sinh", 1], ["cosh", 1], ["tanh", 1],
  ["ceilf", 1], ["floorf", 1], ["roundf", 1], ["signf", 1]];

function callWith(fn: string, n: number, pos: number, argExpr: string): string {
  const args = Array.from({ length: n }, (_, i) => (i + 1 === pos ? argExpr : "1.0"));
  return `${fn}(${args.join(", ")})`;
}

describe("多参 float 数学全局函数：名字实参逐位对齐引擎（S519）", () => {
  for (const [fn, n] of FNS) {
    for (let pos = 1; pos <= n; pos++) {
      for (const kind of REFUSE) {
        it(`${fn} pos${pos} · 模块标注 ${kind} 名：发句`, async () => {
          eq("519", `${fn} pos${pos} ${kind}`,
            await msgs(`var w: ${kind}\n\nfunc c():\n\tvar r = ${callWith(fn, n, pos, "w")}\n`),
            [`Invalid argument for "${fn}()" function: argument ${pos} should be "float" but is "${kind}".`]);
        });
      }
      // 收的那一形（int 名隐式转 float）
      it(`${fn} pos${pos} · int 名：收`, async () => {
        eq("519", `${fn} pos${pos} int 收`,
          await msgs(`var w: int\n\nfunc c():\n\tvar r = ${callWith(fn, n, pos, "w")}\n`), []);
      });
    }
  }
  // remap 字面量那一形（补登进表后新覆盖）
  it("remap pos1 · Color 字面量：发句", async () => {
    eq("519", "remap 字面量 Color",
      await msgs("func c():\n\tvar r = remap(Color(1, 0, 0), 1.0, 1.0, 1.0, 1.0)\n"),
      [`Invalid argument for "remap()" function: argument 1 should be "float" but is "Color".`]);
  });
  it("remap pos2 · String 字面量：发句", async () => {
    eq("519", "remap 字面量 String pos2",
      await msgs("func c():\n\tvar r = remap(1.0, \"x\", 1.0, 1.0, 1.0)\n"),
      [`Invalid argument for "remap()" function: argument 2 should be "float" but is "String".`]);
  });
});
