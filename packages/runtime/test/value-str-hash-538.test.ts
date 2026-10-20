/** `var_to_str()` / `hash()` 的值类型分支（S538/S539）：引擎实测于 `tmp/d6/s538*.gd`，逐格对账。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { variantHash } from "@gds2js/runtime/runtime/builtins";
import { V } from "@gds2js/runtime/runtime/tags";
import { varToStr, show } from "@gds2js/runtime/runtime/values";
import { GVector2 } from "@gds2js/runtime/runtime/vector2";
import { GVector2i } from "@gds2js/runtime/runtime/vector2i";
import { GVector3 } from "@gds2js/runtime/runtime/vector3";
import { GVector3i } from "@gds2js/runtime/runtime/vector3i";
import { GColor } from "@gds2js/runtime/runtime/color";

const o = (v: object) => V.object(v);
const v2 = (x: number, y: number) => o(new GVector2(x, y));
const v2i = (x: number, y: number) => o(new GVector2i(x, y));
const v3 = (x: number, y: number, z: number) => o(new GVector3(x, y, z));
const v3i = (x: number, y: number, z: number) => o(new GVector3i(x, y, z));
const col = (r: number, g: number, b: number, a: number) => o(new GColor(r, g, b, a));

describe("var_to_str 值类型：构造式文本（S538）", () => {
  const CASES: Array<[string, ReturnType<typeof v2>, string]> = [
    ["v2 int-ish", v2(1, 2), "Vector2(1, 2)"],
    ["v2 负小数", v2(1.5, -2.25), "Vector2(1.5, -2.25)"],
    ["v2 fround", v2(0.1, 3), "Vector2(0.1, 3)"],
    ["v2 -0", v2(-0, 1), "Vector2(0, 1)"],
    ["v2 e 记法/大数", v2(10000000, 2.5e-7), "Vector2(10000000, 2.5e-07)"],
    ["v2 inf", v2(Infinity, -Infinity), "Vector2(inf, inf_neg)"],
    ["v2 nan", v2(NaN, 0), "Vector2(nan, 0)"],
    ["v2i", v2i(-1, 2), "Vector2i(-1, 2)"],
    ["v2i 回绕", v2i(4294967297, -2147483649), "Vector2i(1, 2147483647)"],
    ["v3", v3(0.5, -0.25, 100), "Vector3(0.5, -0.25, 100)"],
    ["v3i", v3i(-1, 0, 5), "Vector3i(-1, 0, 5)"],
  ];
  for (const [label, v, want] of CASES) {
    it(label, () => eq("538", label, varToStr(v), want));
  }
  const COLORS: Array<[string, ReturnType<typeof v2>, string]> = [
    ["c 红", col(1, 0, 0, 1), "Color(1, 0, 0, 1)"],
    ["c 四位", col(0.5, 0.25, 0.125, 0.75), "Color(0.5, 0.25, 0.125, 0.75)"],
    ["c fround", col(0.1, 0.2, 0.3, 1), "Color(0.1, 0.2, 0.3, 1)"],
    ["c 大数/-0", col(-0.25, 10000000, 2.5e-7, 0), "Color(-0.25, 10000000, 2.5e-07, 0)"],
  ];
  for (const [label, v, want] of COLORS) {
    it(label, () => eq("538", label, varToStr(v), want));
  }
});

describe("hash 值类型：分量 murmur3 + fmix32（S539）", () => {
  const CASES: Array<[string, ReturnType<typeof v2>, number]> = [
    ["v2 (1,2)", v2(1, 2), 4195279070],
    ["v2 (0.1,2.5)", v2(0.1, 2.5), 2331505265],
    ["v2 (0,0)", v2(0, 0), 516917320],
    ["v2 -0 归一", v2(-0, 0), 516917320],
    ["v2 nan", v2(NaN, 0), 4009152967],
    ["v2 inf", v2(Infinity, -Infinity), 3135367857],
    ["v2i (1,2)", v2i(1, 2), 1113364374],
    ["v2i 回绕", v2i(4294967297, -2147483649), 556298345],
    ["v3 (1,2,3)", v3(1, 2, 3), 2596169709],
    ["v3 (0.5,-0.25,100)", v3(0.5, -0.25, 100), 844659081],
    ["v3i (1,2,3)", v3i(1, 2, 3), 293696066],
    ["c 红", col(1, 0, 0, 1), 3403565064],
    ["c 四位", col(0.5, 0.25, 0.125, 0.75), 1585661194],
    ["c -0 归一", col(-0, 0, 0, 0), 1800249158],
  ];
  for (const [label, v, want] of CASES) {
    it(label, () => eq("539", label, show(variantHash([v])), String(want)));
  }
});
