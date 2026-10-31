/**
 * `Vector2.from_angle(a)`：读数抄自语料 335 的 golden（`corpus/cases/335-vector2-from-angle/godot.txt`），
 * 两侧对账的密格在 `tmp/probe-from-angle/{sweep,edge2}.txt` —— 带内 570 格一字一样，|a| > 1e12 那支按值出现末位分歧，因此发货线定在 1e12。
 */
import { describe, expect, it } from "vitest";
import { GVector2, vector2Const, vector2Method } from "@gds2js/runtime/runtime/class/vector/vector2";
import { V } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";

const CELLS: Array<[number, string]> = [
  [0, "(1.0, 0.0)"],
  [0.5, "(0.877583, 0.479426)"],
  [1, "(0.540302, 0.841471)"],
  [2, "(-0.416147, 0.909297)"],
  [3, "(-0.989992, 0.14112)"],
  [-0.5, "(0.877583, -0.479426)"],
  [Math.PI, "(-1.0, -0.0)"],
  [Math.PI * 2, "(1.0, 0.0)"],
  [Math.PI / 2, "(-0.0, 1.0)"],
  [Math.PI / 4, "(0.707107, 0.707107)"],
  [Math.PI / 6, "(0.866025, 0.5)"],
  [3.9269908169872414, "(-0.707107, -0.707107)"],
  [100, "(0.862319, -0.506366)"],
  [1e5, "(-0.999361, 0.035749)"],
  [1e8, "(-0.363385, 0.931639)"],
  [1e9, "(0.837887, 0.545843)"],
  [1e12, "(0.999784, -0.020803)"],
];

const stat = (a: number): string => show(vector2Const("from_angle", [V.float(a)]));
const inst = (a: number): string => show(vector2Method(new GVector2(7, -3), "from_angle", [V.float(a)]));

describe("Vector2.from_angle", () => {
  it.each(CELLS)("%s", (a, engine) => {
    expect(stat(a), `静态式 ${a} 与引擎不一致`).toBe(engine);
    expect(inst(a), `实例式 ${a} 与引擎不一致`).toBe(engine);
  });

  it("int 实参与退化值", () => {
    expect(show(vector2Const("from_angle", [V.int(1)]))).toBe("(0.540302, 0.841471)");
    expect(stat(Number.NaN)).toBe("(nan, nan)");
    expect(stat(Number.POSITIVE_INFINITY)).toBe("(nan, nan)");
    expect(stat(Number.NEGATIVE_INFINITY)).toBe("(nan, nan)");
  });

  it("|a| 超过实测的 1e12 响亮拒", () => {
    for (const a of [1.5e12, 2e14, 7.5e13, 1e15]) {
      let msg = "竟然放过";
      try {
        stat(a);
      } catch (e) {
        msg = e instanceof UnsupportedError ? e.message : `非 UnsupportedError：${String(e)}`;
      }
      expect(msg, `${a} 该拒`).toContain("超过实测的");
    }
  });

  it("元数与实参类型都响亮拒", () => {
    expect(() => vector2Const("from_angle", [])).toThrowError(/from_angle/);
    expect(() => vector2Const("from_angle", [V.float(1), V.float(2)])).toThrowError(/from_angle/);
    expect(() => vector2Const("from_angle", [V.str("a")])).toThrowError(/Vector2/);
    expect(() => vector2Method(new GVector2(1, 1), "from_angle", [])).toThrowError(/from_angle/);
  });

  it("常量名之外的静态函数仍响亮拒", () => {
    let msg = "竟然放过";
    try {
      vector2Const("from_string", [V.str("(1, 2)")]);
    } catch (e) {
      msg = e instanceof UnsupportedError ? e.message : `非 UnsupportedError：${String(e)}`;
    }
    expect(msg).toContain("未实现");
  });
});
