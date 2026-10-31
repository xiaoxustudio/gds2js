/**
 * 四个向量类型的轴常量：值与 `typeof` 抄自语料 337 的 golden（`tmp/probe-axis/readings.txt` 是一格一脚本的那一批）。
 * 实例式读不到那一形（`Vector3(1,2,3).AXIS_Z` 解析期拒）与「当函数调」那句的 `Vector3.Axis` 槽位都还没接进编译期，记 §6 第 45 条①②。
 */
import { describe, expect, it } from "vitest";
import { Tag } from "@gds2js/runtime/runtime/tags";
import { vector2Const } from "@gds2js/runtime/runtime/class/vector/vector2";
import { vector2iConst } from "@gds2js/runtime/runtime/class/vector/vector2i";
import { vector3Const } from "@gds2js/runtime/runtime/class/vector/vector3";
import { vector3iConst } from "@gds2js/runtime/runtime/class/vector/vector3i";

const AXES: Array<[string, (n: string) => unknown, number[]]> = [
  ["Vector2", vector2Const, [0, 1]],
  ["Vector2i", vector2iConst, [0, 1]],
  ["Vector3", vector3Const, [0, 1, 2]],
  ["Vector3i", vector3iConst, [0, 1, 2]],
];

describe("轴常量", () => {
  for (const [label, fn, want] of AXES) {
    it(`${label}.AXIS_* 发的是 int`, () => {
      want.forEach((v, i) => {
        const r = fn(`AXIS_${"XYZ"[i]}`) as { t: number; v: unknown };
        expect(r.t, `${label}.AXIS_${"XYZ"[i]} 的标签`).toBe(Tag.INT);
        expect(Number(r.v), `${label}.AXIS_${"XYZ"[i]} 的值`).toBe(v);
      });
    });
  }

  it("向量常量照旧发对象，两条支各走各的", () => {
    expect(vector3Const("UP").t).toBe(Tag.OBJECT);
    expect(vector2Const("RIGHT").t).toBe(Tag.OBJECT);
    expect(vector2iConst("ONE").t).toBe(Tag.OBJECT);
  });

  it("表外的名字仍响亮拒，名单里带上轴常量", () => {
    expect(() => vector2Const("AXIS_Z")).toThrowError(/AXIS_Y/);
    expect(() => vector3Const("NOPE")).toThrowError(/AXIS_Z/);
  });
});
