/** cubic / bezier / int 目标那一族的运行期坏型文案（S566），读数 `tmp/d6/s566.gd` 一趟 67 格。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import {
  gCubic, gCubicAngle, gCubicInTime, gCubicAngleInTime, gBezierInterpolate, gBezierDerivative,
  gAbsI, gSignI, gPosmod, gWrap, gWrapAny, gClamp, gMinI, gMaxI, gMinF, gMaxF, gEase, gAngleDifference,
} from "@gds2js/runtime/runtime/builtins";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { I, S } from "./support/variants";

const F = (n: number) => V.float(n);
const err = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { message?: string }).message ?? "?";
  }
};
const sentence = (fn: string, n: number, target: "float" | "int") =>
  `Invalid type in utility function "${fn}()". Cannot convert argument ${n} from String to ${target}.`;

type Case = [string, Array<"float" | "int">, (a: Variant[]) => unknown, Variant[]];
const CASES: Case[] = [
  ["cubic_interpolate", ["float", "float", "float", "float", "float"], (a) => gCubic(a[0]!, a[1]!, a[2]!, a[3]!, a[4]!), [F(1), F(2), F(0), F(1), F(0.5)]],
  ["cubic_interpolate_in_time", ["float", "float", "float", "float", "float", "float", "float", "float"], (a) => gCubicInTime(a[0]!, a[1]!, a[2]!, a[3]!, a[4]!, a[5]!, a[6]!, a[7]!), [F(1), F(2), F(0), F(1), F(0.5), F(0), F(0.33), F(0.66)]],
  ["cubic_interpolate_angle", ["float", "float", "float", "float", "float"], (a) => gCubicAngle(a[0]!, a[1]!, a[2]!, a[3]!, a[4]!), [F(1), F(2), F(0), F(1), F(0.5)]],
  ["cubic_interpolate_angle_in_time", ["float", "float", "float", "float", "float", "float", "float", "float"], (a) => gCubicAngleInTime(a[0]!, a[1]!, a[2]!, a[3]!, a[4]!, a[5]!, a[6]!, a[7]!), [F(1), F(2), F(0), F(1), F(0.5), F(0), F(0.33), F(0.66)]],
  ["bezier_interpolate", ["float", "float", "float", "float", "float"], (a) => gBezierInterpolate(a[0]!, a[1]!, a[2]!, a[3]!, a[4]!), [F(0), F(0.5), F(1), F(2), F(0.5)]],
  ["bezier_derivative", ["float", "float", "float", "float", "float"], (a) => gBezierDerivative(a[0]!, a[1]!, a[2]!, a[3]!, a[4]!), [F(0), F(0.5), F(1), F(2), F(0.5)]],
  ["absi", ["int"], (a) => gAbsI(a[0]!), [I(1)]],
  ["signi", ["int"], (a) => gSignI(a[0]!), [I(1)]],
  ["posmod", ["int", "int"], (a) => gPosmod(a[0]!, a[1]!), [I(1), I(2)]],
  ["wrap", ["float", "int", "int"], (a) => gWrapAny(a[0]!, a[1]!, a[2]!), [F(1), I(1), I(3)]],
  ["wrapi", ["int", "int", "int"], (a) => gWrap(a[0]!, a[1]!, a[2]!, true), [I(1), I(1), I(3)]],
  ["clampi", ["int", "int", "int"], (a) => gClamp(a[0]!, a[1]!, a[2]!, "int"), [I(1), I(1), I(3)]],
  ["minf", ["float", "float"], (a) => gMinF(a[0]!, a[1]!), [F(1), F(2)]],
  ["maxf", ["float", "float"], (a) => gMaxF(a[0]!, a[1]!), [F(1), F(2)]],
  ["mini", ["int", "int"], (a) => gMinI(a[0]!, a[1]!), [I(1), I(2)]],
  ["maxi", ["int", "int"], (a) => gMaxI(a[0]!, a[1]!), [I(1), I(2)]],
  ["clampf", ["float", "float", "float"], (a) => gClamp(a[0]!, a[1]!, a[2]!, "float"), [F(1), F(1), F(3)]],
  ["ease", ["float", "float"], (a) => gEase(a[0]!, a[1]!), [F(0.5), F(0.5)]],
  ["angle_difference", ["float", "float"], (a) => gAngleDifference(a[0]!, a[1]!), [F(0.5), F(0.5)]],
];

describe("cubic / bezier / int 目标一族的坏型文案（S566）", () => {
  it("逐函数逐位 64 格", () => {
    for (const [fn, targets, call, base] of CASES) {
      targets.forEach((target, i) => {
        const args = base.slice();
        args[i] = S("a");
        eq("566", `${fn} 第 ${i + 1} 位`, err(() => call(args)), sentence(fn, i + 1, target));
      });
    }
  });
  it("合法值回归", () => {
    eq("566", "cubic_interpolate", show(gCubic(F(0), F(1), F(2), F(3), F(0.5))), "0.25");
    eq("566", "bezier_interpolate t=1", show(gBezierInterpolate(F(0), F(0.5), F(1), F(2), F(1))), "2.0");
    eq("566", "absi(-3)", show(gAbsI(I(-3))), "3");
    eq("566", "posmod(-1,3)", show(gPosmod(I(-1), I(3))), "2");
    eq("566", "wrap(5,1,3)", show(gWrapAny(I(5), I(1), I(3))), "1");
    eq("566", "wrapf(5.5,1,3)", show(gWrap(F(5.5), I(1), I(3), false)), "1.5");
    eq("566", "clampi(5,1,3)", show(gClamp(I(5), I(1), I(3), "int")), "3");
    eq("566", "clampf(5,1,3)", show(gClamp(F(5), F(1), F(3), "float")), "3.0");
    eq("566", "mini/maxi", `${show(gMinI(I(5), I(3)))}/${show(gMaxI(I(5), I(3)))}`, "3/5");
    eq("566", "ease(0.5,0.5)", show(gEase(F(0.5), F(0.5))), "0.75");
  });
});
