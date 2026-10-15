/**
 * 一元 `-` / `+` / `not` 的运行期那一面（S400）：只有 int 与 float 走得通，其余六型引擎给
 * `Invalid operands 'X' and 'Nil' in operator 'unary-'.`（第二格就是 `Nil`，操作数名带 `unary` 前缀）。
 * 尺 `tmp/probe-unary/{round1,round2}.mts`，读数 `compare{67,68}.txt`，出货端到端 28 格对照 `tmp/probe-unary/ours.mts`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { ops } from "@gds2js/runtime/runtime/ops";
import { dictOf } from "@gds2js/runtime/runtime/methods";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show } from "@gds2js/runtime/runtime/values";

const SIX: Array<[string, Variant]> = [
  ["bool", V.bool(true)],
  ["int", V.int(1)],
  ["float", V.float(1.5)],
  ["String", V.str("a")],
  ["Array", V.array(GArray.of([V.int(1)]))],
  ["Dictionary", dictOf([[V.int(1), V.int(1)]])],
];

const NUM: Record<string, string> = { int: "-1", float: "-1.5" };
const PLUS: Record<string, string> = { int: "1", float: "1.5" };

describe("一元 - 与 +", () => {
  for (const [name, v] of SIX) {
    const refused = NUM[name] === undefined;
    it(`-${name}`, () => {
      if (!refused) {
        eq("400", `-${name} 的值`, show(ops.neg(v)), NUM[name]);
        return;
      }
      let got = "";
      try {
        got = `值:${show(ops.neg(v))}`;
      } catch (e) {
        got = `句:${e instanceof Error ? e.message : String(e)}`;
      }
      eq("400", `-${name} 走不通`, got, `句:Invalid operands '${name}' and 'Nil' in operator 'unary-'.`);
    });
    it(`+${name}`, () => {
      if (!refused) {
        eq("400", `+${name} 的值`, show(ops.pos(v)), PLUS[name]);
        return;
      }
      let got = "";
      try {
        got = `值:${show(ops.pos(v))}`;
      } catch (e) {
        got = `句:${e instanceof Error ? e.message : String(e)}`;
      }
      eq("400", `+${name} 走不通`, got, `句:Invalid operands '${name}' and 'Nil' in operator 'unary+'.`);
    });
  }
});

describe("not 的两侧", () => {
  const TRUTHY: Array<[string, Variant]> = [
    ["true", V.bool(true)],
    ["1", V.int(1)],
    ["1.5", V.float(1.5)],
    ['"a"', V.str("a")],
    ["[1]", V.array(GArray.of([V.int(1)]))],
    ["{1: 1}", dictOf([[V.int(1), V.int(1)]])],
  ];
  const FALSY: Array<[string, Variant]> = [
    ["false", V.bool(false)],
    ["0", V.int(0)],
    ["0.0", V.float(0)],
    ['""', V.str("")],
    ["[]", V.array(GArray.of([]))],
    ["{}", V.dict(new GDict())],
  ];
  for (const [name, v] of TRUTHY) {
    it(`not ${name}`, () => eq("400", `not ${name}`, show(V.bool(!ops.truthy(v))), "false"));
  }
  for (const [name, v] of FALSY) {
    it(`not ${name}`, () => eq("400", `not ${name}`, show(V.bool(!ops.truthy(v))), "true"));
  }
});
