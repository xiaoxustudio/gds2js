/** 四支全局函数的式子照 `math_funcs.h` 的 double 源改写；读数逐字抄自 `corpus/cases/340-global-math-shapes/godot.txt`（同一批格也走逐字节门）。 */
import { describe, expect, it } from "vitest";
import { gFposmod, gMoveToward, gSmoothstep, gWrap } from "@gds2js/runtime/runtime/builtins";
import { V } from "@gds2js/runtime/runtime/tags";
import { strNumDecimals } from "@gds2js/runtime/runtime/numfmt";

const arg = (a: number[], i: number): never => V.float(a[i]!) as never;

const CALLS: Record<string, (a: number[]) => number> = {
  move_toward: (a) => gMoveToward(arg(a, 0), arg(a, 1), arg(a, 2)).v as number,
  smoothstep: (a) => gSmoothstep(arg(a, 0), arg(a, 1), arg(a, 2)).v as number,
  wrapf: (a) => gWrap(arg(a, 0), arg(a, 1), arg(a, 2), false).v as number,
  fposmod: (a) => gFposmod(arg(a, 0), arg(a, 1)).v as number,
};

const TABLE: Record<string, Array<[number[], string]>> = {
  move_toward: [
  [[-956.8341,932.0667,-2.627213], "-959.46131300000002"],
  [[0.000287702,-0.007063,-0.000430888], "0.00071859"],
  [[0.000440231,0.000633751,-3651428.222], "-3651428.221559769"],
  [[-286.7482,705.0788,-0.614999], "-287.36319900000001"],
  [[1,5,2], "3.0"],
  [[1,5,-2], "-1.0"],
  [[1,5,4], "5.0"],
  [[1,5,-4], "-3.0"],
  [[1,5,10], "5.0"],
  [[5,1,2], "3.0"],
  [[5,1,-2], "7.0"],
  [[3,3,-1], "3.0"],
  [[3,3,0], "3.0"],
  [[0,1,-0.5], "-0.5"],
  ],
  smoothstep: [
  [[-1.168838,-3778331.279,0.000085477], "0.0"],
  [[4653517.012,0.000160785,-0.0006953], "1.0"],
  [[230293.276,3.823395,0.000226982], "1.0"],
  [[105.8655,-5.137252,-4535229.206], "1.0"],
  [[1,0,0.5], "0.5"],
  [[1,0,0], "1.0"],
  [[1,0,1], "0.0"],
  [[1,0,2], "0.0"],
  [[1,0,-1], "1.0"],
  [[0,1,0.5], "0.5"],
  [[0,1,0], "0.0"],
  [[0,1,1], "1.0"],
  ],
  wrapf: [
  [[3339179.758,-1445871.59,0.801896], "-998437.41768800048"],
  [[-3373076.915,-554.5719,0.000489328], "-167.64310710411519"],
  [[641.4814,0.980167,4.834461], "1.6685959999999795"],
  [[1.5,5,0], "1.5"],
  [[1.5,0,5], "1.5"],
  [[7,0,5], "2.0"],
  [[5,0,5], "0.0"],
  [[-1,0,5], "4.0"],
  [[0.5,1,1.000001], "1.0"],
  [[0.5,1,1], "1.0"],
  [[0.5,1,1.0000001], "1.0"],
  ],
  fposmod: [
  [[-3.190507,-0.000793325], "-0.00054717500000021"],
  [[0.157391,0.000533854], "0.00043792400000002"],
  [[-0.994252,-0.000474931], "-0.00022141700000003"],
  [[-3,2], "1.0"],
  [[3,-2], "-1.0"],
  [[5.5,2], "1.5"],
  ],
};

describe("全局 move_toward / smoothstep / wrapf / fposmod 的源分组", () => {
  for (const [fn, cells] of Object.entries(TABLE)) {
    it.each(cells)(`${fn} %j`, (args, engine) => {
      expect(strNumDecimals(CALLS[fn]!(args), 17), `${fn}(${args.join(", ")})`).toBe(engine);
    });
  }
});
