/** `Vector3.rotated()`（S543）：引擎 `Basis(axis, angle).xform(v)`，轴必须为单位向量；读数 `tmp/d6/s543.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V } from "@gds2js/runtime/runtime/tags";
import { varToStr } from "@gds2js/runtime/runtime/values";
import "@gds2js/runtime/runtime/builtins";
import { GVector3 } from "@gds2js/runtime/runtime/vector3";
import { vector3Method } from "@gds2js/runtime/runtime/vector3";

const v3 = (x: number, y: number, z: number) => V.object(new GVector3(x, y, z));
const rot = (v: number[], axis: number[], ang: number) =>
  varToStr(vector3Method(new GVector3(v[0] as number, v[1] as number, v[2] as number), "rotated", [v3(axis[0] as number, axis[1] as number, axis[2] as number), V.float(ang)]));

describe("Vector3.rotated：单位轴走 Basis 轴角矩阵（S543）", () => {
  const OK: Array<[string, number[], number[], number, string]> = [
    ["(1,2,3)·Y·0.5", [1, 2, 3], [0, 1, 0], 0.5, "Vector3(2.3158593, 2, 2.1533222)"],
    ["(1,0,0)·Y·PI/2", [1, 0, 0], [0, 1, 0], Math.PI / 2, "Vector3(-4.371139e-08, 0, -1)"],
    ["(1,2,3)·Y·1", [1, 2, 3], [0, 1, 0], 1, "Vector3(3.0647151, 2, 0.7794359)"],
    ["(-1,0.5,2)·(0.6,0.8,0)·2.5", [-1, 0.5, 2], [0.6, 0.8, 0], 2.5, "Vector3(1.5425618, -1.4069214, -0.9439678)"],
    ["零向量", [0, 0, 0], [1, 0, 0], 3, "Vector3(0, 0, 0)"],
  ];
  for (const [label, v, axis, ang, want] of OK) {
    it(label, () => eq("543", label, rot(v, axis, ang), want));
  }
  const BAD: Array<[string, number[], number, number[]]> = [
    ["(1,1,1)", [1, 1, 1], 1.2, [1, 2, 3]],
    ["(0,2,0)", [0, 2, 0], 0.5, [1, 2, 3]],
    ["零轴", [0, 0, 0], 0.5, [1, 2, 3]],
    ["(-3,2,1)", [-3, 2, 1], -0.7, [1, 2, 3]],
  ];
  for (const [label, axis, ang, v] of BAD) {
    it(`非单位轴 ${label} 响亮拒`, () => {
      let code = "没抛";
      try {
        vector3Method(new GVector3(v[0] as number, v[1] as number, v[2] as number), "rotated", [v3(axis[0] as number, axis[1] as number, axis[2] as number), V.float(ang)]);
      } catch (e) {
        code = (e as { code?: string }).code ?? "?";
      }
      eq("543", label, code, "vector3-rotated-axis");
    });
  }
});
