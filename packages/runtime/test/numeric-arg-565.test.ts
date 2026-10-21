/** 多参数值全局函数的运行期坏型文案（S565），读数 `tmp/d6/s565.gd` 一趟 34 格。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import {
  gMoveToward, gInverseLerp, gRemap, gSmoothstep, gLerpAngle, gRotateToward, gPingpong,
  gStepDecimals, gDbToLinear, gLinearToDb, gWrap, gRandiRange, gRandfRange, gRandfn,
} from "@gds2js/runtime/runtime/builtins";
import { V } from "@gds2js/runtime/runtime/tags";
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
const sentence = (fn: string, n: number, target: "float" | "int") =>
  `Invalid type in utility function "${fn}()". Cannot convert argument ${n} from String to ${target}.`;



describe("多参数值全局函数的运行期坏型文案（S565）", () => {
  it("move_toward / inverse_lerp / remap / smoothstep 的逐位", () => {
    eq("565", "move_toward 1/2/3", [
      err(() => gMoveToward(S("a"), V.float(2), V.float(1))),
      err(() => gMoveToward(V.float(1), S("a"), V.float(1))),
      err(() => gMoveToward(V.float(1), V.float(2), S("a"))),
    ].join("|"), [1, 2, 3].map((n) => sentence("move_toward", n, "float")).join("|"));
    eq("565", "inverse_lerp 1/2/3", [
      err(() => gInverseLerp(S("a"), V.float(2), V.float(1))),
      err(() => gInverseLerp(V.float(1), S("a"), V.float(1))),
      err(() => gInverseLerp(V.float(1), V.float(2), S("a"))),
    ].join("|"), [1, 2, 3].map((n) => sentence("inverse_lerp", n, "float")).join("|"));
    eq("565", "remap 1..5", [
      err(() => gRemap(S("a"), V.float(1), V.float(2), V.float(3), V.float(4))),
      err(() => gRemap(V.float(0.5), S("a"), V.float(2), V.float(3), V.float(4))),
      err(() => gRemap(V.float(0.5), V.float(1), S("a"), V.float(3), V.float(4))),
      err(() => gRemap(V.float(0.5), V.float(1), V.float(2), S("a"), V.float(4))),
      err(() => gRemap(V.float(0.5), V.float(1), V.float(2), V.float(3), S("a"))),
    ].join("|"), [1, 2, 3, 4, 5].map((n) => sentence("remap", n, "float")).join("|"));
    eq("565", "smoothstep 1/2/3", [
      err(() => gSmoothstep(S("a"), V.float(2), V.float(1))),
      err(() => gSmoothstep(V.float(1), S("a"), V.float(1))),
      err(() => gSmoothstep(V.float(1), V.float(2), S("a"))),
    ].join("|"), [1, 2, 3].map((n) => sentence("smoothstep", n, "float")).join("|"));
  });
  it("角 / 乒乓 / 步进 / dB / wrapf 的逐位", () => {
    eq("565", "lerp_angle 1/2/3", [
      err(() => gLerpAngle(S("a"), V.float(2), V.float(0.5))),
      err(() => gLerpAngle(V.float(1), S("a"), V.float(0.5))),
      err(() => gLerpAngle(V.float(1), V.float(2), S("a"))),
    ].join("|"), [1, 2, 3].map((n) => sentence("lerp_angle", n, "float")).join("|"));
    eq("565", "rotate_toward 1/2/3", [
      err(() => gRotateToward(S("a"), V.float(2), V.float(0.5))),
      err(() => gRotateToward(V.float(1), S("a"), V.float(0.5))),
      err(() => gRotateToward(V.float(1), V.float(2), S("a"))),
    ].join("|"), [1, 2, 3].map((n) => sentence("rotate_toward", n, "float")).join("|"));
    eq("565", "pingpong 1/2", `${err(() => gPingpong(S("a"), V.float(2)))}|${err(() => gPingpong(V.float(1), S("a")))}`, `${sentence("pingpong", 1, "float")}|${sentence("pingpong", 2, "float")}`);
    eq("565", "step_decimals / db / linear", [
      err(() => gStepDecimals(S("a"))),
      err(() => gDbToLinear(S("a"))),
      err(() => gLinearToDb(S("a"))),
    ].join("|"), [sentence("step_decimals", 1, "float"), sentence("db_to_linear", 1, "float"), sentence("linear_to_db", 1, "float")].join("|"));
    eq("565", "wrapf 1/2/3", [
      err(() => gWrap(S("a"), V.float(1), V.float(2), false)),
      err(() => gWrap(V.float(0.5), S("a"), V.float(2), false)),
      err(() => gWrap(V.float(0.5), V.float(1), S("a"), false)),
    ].join("|"), [1, 2, 3].map((n) => sentence("wrapf", n, "float")).join("|"));
  });
  it("randi_range 目标 int；randf_range / randfn 目标 float", () => {
    eq("565", "randi_range 1/2", `${err(() => gRandiRange(S("a"), I(2)))}|${err(() => gRandiRange(I(1), S("a")))}`, `${sentence("randi_range", 1, "int")}|${sentence("randi_range", 2, "int")}`);
    eq("565", "randf_range 1/2", `${err(() => gRandfRange(S("a"), V.float(2)))}|${err(() => gRandfRange(V.float(1), S("a")))}`, `${sentence("randf_range", 1, "float")}|${sentence("randf_range", 2, "float")}`);
    eq("565", "randfn 1/2", `${err(() => gRandfn(S("a"), V.float(1)))}|${err(() => gRandfn(V.float(0), S("a")))}`, `${sentence("randfn", 1, "float")}|${sentence("randfn", 2, "float")}`);
  });
  it("合法值回归", () => {
    eq("565", "move_toward(0,10,3)", show(gMoveToward(V.float(0), V.float(10), V.float(3))), "3.0");
    eq("565", "inverse_lerp(0,10,5)", show(gInverseLerp(V.float(0), V.float(10), V.float(5))), "0.5");
    eq("565", "remap(5,0,10,0,100)", show(gRemap(V.float(5), V.float(0), V.float(10), V.float(0), V.float(100))), "50.0");
    eq("565", "smoothstep(0,1,0.5)", show(gSmoothstep(V.float(0), V.float(1), V.float(0.5))), "0.5");
    eq("565", "pingpong(1.5,2)", show(gPingpong(V.float(1.5), V.float(2))), "1.5");
  });
});
