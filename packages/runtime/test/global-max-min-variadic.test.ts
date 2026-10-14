/**
 * 全局 `max()` / `min()` 三元以上那一半（S364）：引擎按**左折**，赢的那个实参带自己的型，NaN 那几格是「留第一个」。
 * 出货此前把三元调用截成前两元（发射式子是 `rt.gMax(a, b)`），`max(1, 2, 3)` 给 2 而引擎给 3。
 * 26 格逐格钉引擎读数 —— 尺 `tmp/probe-argtype/fold48.mts`，读数 `tmp/maxmin/maxmin3.txt`；语料 367 另钉一遍端到端。
 */
import { describe, expect, it } from "vitest";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { gMax, gMin } from "@gds2js/runtime/runtime/builtins";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { show } from "@gds2js/runtime/runtime/values";

function arg(tok: string): Variant {
  if (tok === "NAN") return V.float(NaN);
  if (tok === "INF") return V.float(Infinity);
  if (tok === "-INF") return V.float(-Infinity);
  return /^[+-]?\d+$/.test(tok) ? V.int(Number(tok)) : V.float(Number(tok));
}

const CELLS: Array<[string, string[], string, string]> = [
  ["gMax",["1","2","3"],"3","int"],
  ["gMin",["1","2","3"],"1","int"],
  ["gMax",["1","5","3","9","2"],"9","int"],
  ["gMax",["1","2.5","3"],"3","int"],
  ["gMin",["2.5","2","3"],"2","int"],
  ["gMax",["2","2","1"],"2","int"],
  ["gMax",["-1","-2","-3"],"-1","int"],
  ["gMin",["-1","-2","-3"],"-3","int"],
  ["gMax",["1","2","3","4","5","6","7","8","9","10"],"10","int"],
  ["gMin",["10","9","8","7","6","5","4","3","2","1"],"1","int"],
  ["gMin",["1","2","3","4","5","6","7","8","9","10","11","12","13"],"1","int"],
  ["gMax",["1","NAN","2"],"2","int"],
  ["gMax",["NAN","1","2"],"nan","float"],
  ["gMax",["1","2","NAN"],"2","int"],
  ["gMin",["1","NAN","2"],"1","int"],
  ["gMin",["NAN","1","2"],"nan","float"],
  ["gMin",["2","NAN","1"],"1","int"],
  ["gMax",["2","2.0","2"],"2","int"],
  ["gMax",["2.0","2","2.0"],"2.0","float"],
  ["gMin",["2","2.0","2"],"2","int"],
  ["gMax",["0.0","-0.0","0"],"0.0","float"],
  ["gMin",["-0.0","0.0","0"],"0.0","float"],
  ["gMax",["1.5","2","3","4.5"],"4.5","float"],
  ["gMax",["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"],"20","int"],
  ["gMin",["20","19","18","17","16","15","14","13","12","11","10","9","8","7","6","5","4","3","2","1"],"1","int"],
  ["gMax",["1.0","2.0","3.0"],"3.0","float"],
];

describe("全局 max / min 的左折", () => {
  for (const [fn, toks, printed, ty] of CELLS) {
    it(`${fn}(${toks.join(", ")}) → ${printed}`, () => {
      const v = (fn === "gMax" ? gMax : gMin)(...toks.map(arg));
      expect(show(v)).toBe(printed);
      expect(Number(typeOf(v).v)).toBe(ty === "int" ? 2 : 3);
    });
  }
  it("两元那一支没被改动", () => {
    expect(show(gMax(V.int(1), V.int(2)))).toBe("2");
    expect(show(gMin(V.int(1), V.int(2)))).toBe("1");
    expect(show(gMax(V.float(NaN), V.float(1.0)))).toBe("nan");
  });
});
