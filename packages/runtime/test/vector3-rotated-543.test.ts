/** `Vector3.rotated()`（S543）：引擎 `Basis(axis, angle).xform(v)`，轴必须为单位向量；读数 `tmp/d6/s543.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V } from "@gds2js/runtime/runtime/tags";
import { varToStr } from "@gds2js/runtime/runtime/values";
import "@gds2js/runtime/runtime/builtins";
import { GVector3, setRotatedAxisBlockSink } from "@gds2js/runtime/runtime/vector3";
import { installRotatedAxisBlockSink } from "@gds2js/runtime/host";
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
  // 轴没归一那一族（S686，尺 `tmp/probe708/axis.mts`）：引擎推一块非致命 ERROR 再**原样回向量**，脚本不打断
  const BAD: Array<[string, number[], number, number[]]> = [
    ["(1,1,1)", [1, 1, 1], 1.2, [1, 2, 3]],
    ["(0,2,0)", [0, 2, 0], 0.5, [1, 2, 3]],
    ["零轴", [0, 0, 0], 0.5, [1, 2, 3]],
    ["(-3,2,1)", [-3, 2, 1], -0.7, [1, 2, 3]],
    ["(0.3,0.7,-1)", [0.3, 0.7, -1], 0.123, [2, -1, 0.5]],
  ];
  for (const [label, axis, ang, v] of BAD) {
    it(`非单位轴 ${label} 推块 ERROR 并回原向量`, () => {
      const hits: GVector3[] = [];
      setRotatedAxisBlockSink((a) => {
        hits.push(a);
      });
      const got = varToStr(vector3Method(new GVector3(v[0] as number, v[1] as number, v[2] as number), "rotated", [v3(axis[0] as number, axis[1] as number, axis[2] as number), V.float(ang)]));
      installRotatedAxisBlockSink();
      eq("543", `${label} 回原向量`, got, `Vector3(${String(v[0])}, ${String(v[1])}, ${String(v[2])})`);
      eq("543", `${label} 推了一次`, String(hits.length), "1");
    });
  }
});
