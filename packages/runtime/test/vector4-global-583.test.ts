/** Vector4 的全局工具函数与 %v（S583），读数 `tmp/d6/s585.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { abs, gCeil, gClamp, gFloor, gLerp, gRound, gSign, gSnapped } from "@gds2js/runtime/runtime/builtins";
import { vector4New } from "@gds2js/runtime/runtime/vector4";
import { vector4iNew } from "@gds2js/runtime/runtime/vector4i";
import { strFormat, show } from "@gds2js/runtime/runtime/values";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { I } from "./support/variants";

const v4 = (x: number, y: number, z: number, w: number): Variant => vector4New([V.float(x), V.float(y), V.float(z), V.float(w)]);
const i4 = (x: number, y: number, z: number, w: number): Variant => vector4iNew([I(x), I(y), I(z), I(w)]);
const sh = (v: Variant): string => show(v);

describe("Vector4 全局工具（S583）", () => {
  it("abs / sign / floor / ceil / round", () => {
    eq("583", "abs/sign", `${sh(abs(v4(-1.5, 2.5, -0, 3.5)))}|${sh(abs(i4(-1, 2, 0, -5)))}|${sh(gSign(v4(-1.5, 2.5, 0, -0)))}|${sh(gSign(i4(-1, 2, 0, -5)))}`, "(1.5, 2.5, 0.0, 3.5)|(1, 2, 0, 5)|(-1.0, 1.0, 0.0, 0.0)|(-1, 1, 0, -1)");
    eq("583", "fcr", `${sh(gFloor(v4(1.5, -2.5, 2.5, -0.5)))}|${sh(gCeil(v4(1.5, -2.5, 2.5, -0.5)))}|${sh(gRound(v4(1.5, -2.5, 2.5, -0.5)))}`, "(1.0, -3.0, 2.0, -1.0)|(2.0, -2.0, 3.0, 0.0)|(2.0, -3.0, 3.0, -1.0)");
  });
  it("lerp / snapped / clamp 的整支返回", () => {
    eq("583", "lerp", sh(gLerp(v4(0, 0, 0, 0), v4(10, 20, 30, 40), V.float(0.25))), "(2.5, 5.0, 7.5, 10.0)");
    eq("583", "snapped", `${sh(gSnapped(v4(5.4, 5.6, -5.4, -5.6), v4(1, 1, 1, 1)))}|${sh(gSnapped(i4(3, 5, -3, -5), i4(2, 2, 2, 2)))}`, "(5.0, 6.0, -5.0, -6.0)|(4, 6, -2, -4)");
    eq("583", "clamp 字典序", `${sh(gClamp(v4(-1, 2, 5, 1), v4(0, 0, 0, 0), v4(4, 4, 4, 4)))}|${sh(gClamp(i4(3, 1, 4, 2), i4(2, 0, 2, 2), i4(4, 2, 4, 4)))}`, "(0.0, 0.0, 0.0, 0.0)|(3, 1, 4, 2)");
  });
  it("%v 逐支按 %f 默认精度", () => {
    eq("583", "V4/V4i", `${strFormat("%v", [v4(1, 2, 3, 4)])}|${strFormat("%v", [i4(1, 2, 3, 4)])}`, "(1.000000, 2.000000, 3.000000, 4.000000)|(1.000000, 2.000000, 3.000000, 4.000000)");
    eq("583", "%.2v", strFormat("%.2v", [v4(1.234, 2, 3, 4)]), "(1.23, 2.00, 3.00, 4.00)");
  });
});
