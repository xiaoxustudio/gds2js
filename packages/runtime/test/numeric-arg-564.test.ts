/** 数值全局函数的运行期坏型文案（S564），读数 `tmp/d6/s564/*.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import {
  sqrt, gSin, gExp, gLog, gDegToRad, gAbsF, gSignF, gFloor, gRound, gAcos, gAtanh,
  gPow, gFmod, gFposmod, gAtan2, gNearestPo2,
} from "@gds2js/runtime/runtime/builtins";
import { V } from "@gds2js/runtime/runtime/tags";
import { GVector2 } from "@gds2js/runtime/runtime/vector2";
import { show } from "@gds2js/runtime/runtime/values";
import { I, S } from "./support/variants";

const err = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { message?: string }).message ?? "?";
  }
};
const conv = (fn: string, n: number) => `Invalid type in utility function "${fn}()". Cannot convert argument ${n} from String to float.`;

describe("数值全局函数的运行期坏型文案（S564）", () => {
  it("单参 float 那一族：Invalid type … to float", () => {
    const CASES: Array<[string, () => unknown]> = [
      ["sqrt", () => sqrt(S("a"))],
      ["sin", () => gSin(S("a"))],
      ["exp", () => gExp(S("a"))],
      ["log", () => gLog(S("a"))],
      ["deg_to_rad", () => gDegToRad(S("a"))],
      ["absf", () => gAbsF(S("a"))],
      ["signf", () => gSignF(S("a"))],
      ["acos", () => gAcos(S("a"))],
      ["atanh", () => gAtanh(S("a"))],
      ["floorf", () => gFloor(S("a"), "float")],
      ["floori", () => gFloor(S("a"), "int")],
      ["roundi", () => gRound(S("a"), "int")],
    ];
    for (const [fn, run] of CASES) eq("564", fn, err(run), conv(fn, 1));
    eq("564", "Vector2 源", err(() => sqrt(V.object(new GVector2(1, 2)))), 'Invalid type in utility function "sqrt()". Cannot convert argument 1 from Vector2 to float.');
  });
  it("两参 float 那一族：位次与名字", () => {
    eq("564", "pow 1", err(() => gPow(S("a"), I(2))), conv("pow", 1));
    eq("564", "pow 2", err(() => gPow(I(2), S("a"))), conv("pow", 2));
    eq("564", "fmod 1", err(() => gFmod(S("a"), V.float(1))), conv("fmod", 1));
    eq("564", "fmod 2", err(() => gFmod(V.float(1), S("a"))), conv("fmod", 2));
    eq("564", "fposmod 1", err(() => gFposmod(S("a"), V.float(1))), conv("fposmod", 1));
    eq("564", "fposmod 2", err(() => gFposmod(V.float(1), S("a"))), conv("fposmod", 2));
    eq("564", "atan2 1", err(() => gAtan2(S("a"), V.float(1))), conv("atan2", 1));
    eq("564", "atan2 2", err(() => gAtan2(V.float(1), S("a"))), conv("atan2", 2));
  });
  it("nearest_po2 目标 int；bool 照收；合法值回归", () => {
    eq("564", "String 源", err(() => gNearestPo2(S("a"))), 'Invalid type in utility function "nearest_po2()". Cannot convert argument 1 from String to int.');
    eq("564", "float 截断", show(gNearestPo2(V.float(1.5))), "1");
    eq("564", "bool 当 1", show(sqrt(V.bool(true))), "1.0");
    eq("564", "floorf(true)", show(gFloor(V.bool(true), "float")), "1.0");
    eq("564", "sin(0)", show(gSin(V.float(0))), "0.0");
    eq("564", "pow(2,3)", show(gPow(I(2), I(3))), "8.0");
    eq("564", "fmod(7,3)", show(gFmod(I(7), I(3))), "1.0");
    eq("564", "atan2(0,1)", show(gAtan2(V.float(0), V.float(1))), "0.0");
  });
});
