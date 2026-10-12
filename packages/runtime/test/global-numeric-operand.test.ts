/**
 * 数值那一族全局函数收到**装箱的非数值**时的口径：引擎在调用边界上拒（S339 ⑤ 那一族运行期读数），
 * 出货先前是 `v.v as number` / `intToNum(…)` 一路算成 NaN 再发出去 —— 那是静默错值。现在统一响亮拒。
 * 读数：`tmp/probe-argtype/vals.txt`（`var X: Variant = "a"` 那一族 32 格）。
 */
import { describe, expect, it } from "vitest";
import * as rt from "@gds2js/runtime/runtime/index";
import { V } from "@gds2js/runtime/runtime/tags";

const SHAPES: Array<[string, number]> = [
  ["gSqrt", 1], ["gLog", 1], ["gExp", 1], ["gAcos", 1], ["gAsin", 1], ["gAtan", 1], ["gAcosh", 1], ["gAtanh", 1],
  ["gDegToRad", 1], ["gRadToDeg", 1], ["gLinearToDb", 1], ["gDbToLinear", 1], ["gSignF", 1], ["gSignI", 1],
  ["gAbsF", 1], ["gAbsI", 1], ["gIsFinite", 1], ["gIsInf", 1], ["gIsNan", 1], ["gIsZeroApprox", 1],
  ["gStepDecimals", 1], ["gPow", 2], ["gFmod", 2], ["gFposmod", 2], ["gMax", 2], ["gMin", 2], ["gMaxF", 2],
  ["gMinF", 2], ["gMaxI", 2], ["gMinI", 2], ["gAngleDifference", 2], ["gPosmod", 2], ["gSnappedF", 2],
  ["gSnappedI", 2], ["gIsEqualApprox", 2], ["gPingpong", 2], ["gInverseLerp", 3], ["gLerpAngle", 3],
  ["gRotateToward", 3], ["gMoveToward", 3], ["gSmoothstep", 3], ["gClamp", 3], ["gWrap", 3], ["gCubic", 4],
  ["gRemap", 5], ["gBezierInterpolate", 5], ["gBezierDerivative", 5],
];

type MathFn = (...args: rt.Variant[]) => rt.Variant;
const BAD: Array<[string, () => rt.Variant]> = SHAPES.flatMap(([name, argc]) => {
  const fn = (rt as unknown as Record<string, MathFn>)[name] as MathFn;
  const rest = () => Array.from({ length: argc - 1 }, (): rt.Variant => V.float(1));
  return [
    [`${name}(String)`, () => fn(V.str("a"), ...rest())],
    [`${name}(Vector2)`, () => fn(rt.vector2(1, 2), ...rest())],
    [`${name}(Dictionary)`, () => fn(V.dict([]), ...rest())],
  ];
});

describe("装箱的非数值实参一律响亮拒", () => {
  it.each(BAD)("%s", (_label, run) => {
    const got = (() => {
      try {
        run();
        return "居然算得出";
      } catch (e) {
        return (e as Error).constructor.name;
      }
    })();
    expect(["UnsupportedError", "GodotRuntimeError"], got).toContain(got);
  });
});
