/**
 * `clamp(VectorN, VectorN, VectorN)`（S537）：引擎走 **Variant 的字典序比较**（先 x、再 y、再 z），
 * 整支返回 v / lo / hi —— `CLAMP(v) = v < lo ? lo : (v > hi ? hi : v)`。
 * 实测（`tmp/d6/g4` 与 16 格端到端对账）：`clamp(Vector2(1,-5),(0,0),(2,2))` 原样 `(1.0,-5.0)`、
 * `(5,-1)` 给 hi `(2.0,2.0)`、`(-5,-5)` 给 lo `(0.0,0.0)`、`(0,-5)` 给 lo、`(0,5)` 原样、`(2,5)` 给 hi；
 * Vector3 / Vector2i / Vector3i 同一条。此前 gClamp 只走数值，向量实参被 `need2` 响亮拒（合法调用崩）。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { gClamp } from "@gds2js/runtime/runtime/builtins";
import { V } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { GVector2 } from "@gds2js/runtime/runtime/vector2";
import { GVector2i } from "@gds2js/runtime/runtime/vector2i";
import { GVector3 } from "@gds2js/runtime/runtime/vector3";

const o = (v: object) => V.object(v);
const c2 = (x: number, y: number) => o(new GVector2(x, y));
const c2i = (x: number, y: number) => o(new GVector2i(x, y));
const c3 = (x: number, y: number, z: number) => o(new GVector3(x, y, z));

describe("clamp 向量：字典序比较、整支返回（S537）", () => {
  const CASES: Array<[string, ReturnType<typeof c2>, ReturnType<typeof c2>, ReturnType<typeof c2>, string]> = [
    ["(1,-5) 原样", c2(1, -5), c2(0, 0), c2(2, 2), "(1.0, -5.0)"],
    ["(5,-1) 给 hi", c2(5, -1), c2(0, 0), c2(2, 2), "(2.0, 2.0)"],
    ["(-5,-5) 给 lo", c2(-5, -5), c2(0, 0), c2(2, 2), "(0.0, 0.0)"],
    ["(0,-5) 给 lo", c2(0, -5), c2(0, 0), c2(2, 2), "(0.0, 0.0)"],
    ["(0,5) 原样", c2(0, 5), c2(0, 0), c2(2, 2), "(0.0, 5.0)"],
    ["(2,5) 给 hi", c2(2, 5), c2(0, 0), c2(2, 2), "(2.0, 2.0)"],
    ["(2,-5) 原样", c2(2, -5), c2(0, 0), c2(2, 2), "(2.0, -5.0)"],
    ["(1.5,2.5) 原样", c2(1.5, 2.5), c2(0, 0), c2(2, 2), "(1.5, 2.5)"],
  ];
  for (const [label, v, lo, hi, want] of CASES) {
    it(`Vector2 ${label}`, () => eq("537", label, show(gClamp(v, lo, hi)), want));
  }
  it("Vector2i (-5,1) 给 lo", () => eq("537", "v2i lo", show(gClamp(c2i(-5, 1), c2i(0, 0), c2i(2, 2))), "(0, 0)"));
  it("Vector2i (2,5) 给 hi", () => eq("537", "v2i hi", show(gClamp(c2i(2, 5), c2i(0, 0), c2i(2, 2))), "(2, 2)"));
  it("Vector3 (2,2,-5) 原样", () => eq("537", "v3 z", show(gClamp(c3(2, 2, -5), c3(0, 0, 0), c3(2, 2, 2))), "(2.0, 2.0, -5.0)"));
  it("标量回归 clamp(5,1,3)=3", () => eq("537", "scalar", show(gClamp(V.int(5), V.int(1), V.int(3))), "3"));
});
