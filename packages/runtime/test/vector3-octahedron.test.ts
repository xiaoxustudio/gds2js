/**
 * `Vector3.octahedron_encode()`：29 格的读数逐字抄自 `tmp/probe-oct/godot.txt`（语料 328 是同批格子的逐字节门）。
 * `octahedron_decode`：式子量全在 `tmp/probe-oct/grid.txt` 的 169 格上（CLAMP 那一支 169/169），读数抄自语料 334 的 golden。
 */
import { describe, expect, it } from "vitest";
import { GVector3, vector3Const, vector3Method } from "@gds2js/runtime/runtime/vector3";
import { V } from "@gds2js/runtime/runtime/tags";
import { vector2 } from "@gds2js/runtime/runtime/vector2";
import { vector2i } from "@gds2js/runtime/runtime/vector2i";
import { show } from "@gds2js/runtime/runtime/values";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";

const CELLS: Array<[string, string]> = [
  ["0, 1, 0", "(0.5, 1.0)"],
  ["1, 0, 0", "(1.0, 0.5)"],
  ["0, 0, 1", "(0.5, 0.5)"],
  ["1, 1, 1", "(0.666667, 0.666667)"],
  ["-1, 0, 0", "(0.0, 0.5)"],
  ["0, 0, -1", "(1.0, 1.0)"],
  ["2, 0, 0", "(1.0, 0.5)"],
  ["0, 2, 0", "(0.5, 1.0)"],
  ["0, 0, 2", "(0.5, 0.5)"],
  ["-1, -1, -1", "(0.166667, 0.166667)"],
  ["1, 2, 3", "(0.583333, 0.666667)"],
  ["-1, 2, -3", "(0.166667, 0.916667)"],
  ["0.5, 0.5, 0", "(0.75, 0.75)"],
  ["0, 0, 0", "(nan, nan)"],
  ["1, 0, 1", "(0.75, 0.5)"],
  ["0, 1, 1", "(0.5, 0.75)"],
  ["1, 1, 0", "(0.75, 0.75)"],
  ["-0.25, 0.75, 0.5", "(0.416667, 0.75)"],
  ["3, -1, 2", "(0.75, 0.416667)"],
  ["0.1, 0.2, 0.3", "(0.583333, 0.666667)"],
  ["1, -1, 0", "(0.75, 0.25)"],
  ["1, 0, -1", "(1.0, 0.75)"],
  ["-1, 0, 1", "(0.25, 0.5)"],
  ["0, -1, 1", "(0.5, 0.25)"],
  ["1000, 1, 1", "(0.999002, 0.500499)"],
  ["1, 1000, 1", "(0.500499, 0.999002)"],
  ["1, 1, 1000", "(0.500499, 0.500499)"],
  ["0.003, 0.7, -0.9", "(0.781659, 0.999064)"],
  ["-7, -3, 5", "(0.266667, 0.4)"],
];

function enc(src: string): string {
  const [x = 0, y = 0, z = 0] = src.split(",").map((s) => Number(s.trim()));
  return show(vector3Method(new GVector3(x, y, z), "octahedron_encode", []));
}

describe("Vector3.octahedron_encode", () => {
  it.each(CELLS)("%s", (src, engine) => {
    expect(enc(src), `${src} 与引擎不一致`).toBe(engine);
  });

  it("零元实参之外的元数按实测拒", () => {
    expect(() => vector3Method(new GVector3(1, 2, 3), "octahedron_encode", [V.float(0)])).toThrowError(/octahedron_encode/);
  });
});

/** 静态式与实例式共用一条式子：两边的读数都来自语料 334 的 golden。 */
const DECODE: Array<[number, number, string]> = [
  [0.5, 0.5, "(0.0, 0.0, 1.0)"],
  [0, 0, "(0.0, 0.0, -1.0)"],
  [1, 1, "(0.0, 0.0, -1.0)"],
  [0.5, 0, "(0.0, -1.0, 0.0)"],
  [0, 0.5, "(-1.0, 0.0, 0.0)"],
  [1, 0.5, "(1.0, 0.0, 0.0)"],
  [0.25, 0.25, "(-0.707107, -0.707107, 0.0)"],
  [0.25, 0.75, "(-0.707107, 0.707107, 0.0)"],
  [0.75, 0.75, "(0.707107, 0.707107, 0.0)"],
  [0.5, 0.25, "(0.0, -0.707107, 0.707107)"],
  [0.5, 0.125, "(0.0, -0.948683, 0.316228)"],
  [0.125, 0.5, "(-0.948683, 0.0, 0.316228)"],
  [0, 0.25, "(-0.707107, 0.0, -0.707107)"],
  [0.875, 0.125, "(0.408248, -0.408248, -0.816497)"],
  [-0.25, 0.5, "(-0.816497, -0.408248, -0.408248)"],
  [-1.5, -1, "(-0.428571, -0.285714, -0.857143)"],
  [-1.5, 0.5, "(-0.688247, -0.229416, -0.688247)"],
  [1.25, 1.25, "(0.235702, 0.235702, -0.942809)"],
];

describe("Vector3.octahedron_decode", () => {
  it.each(DECODE)("(%s, %s)", (x, y, engine) => {
    expect(show(vector3Const("octahedron_decode", [vector2(x, y)])), `静态式 (${x}, ${y}) 与引擎不一致`).toBe(engine);
    expect(show(vector3Method(new GVector3(1, 2, 3), "octahedron_decode", [vector2(x, y)])), `实例式 (${x}, ${y}) 与引擎不一致`).toBe(engine);
  });

  it("nan / inf 的实参：三个分量各自怎么走", () => {
    const nan = Number.NaN;
    const inf = Number.POSITIVE_INFINITY;
    const cells: Array<[number, number, string]> = [
      [nan, 0.5, "(nan, nan, nan)"],
      [0.5, nan, "(nan, nan, nan)"],
      [nan, nan, "(nan, nan, nan)"],
      [inf, 0.5, "(nan, 0.0, nan)"],
      [0.5, inf, "(0.0, nan, nan)"],
      [inf, inf, "(nan, nan, nan)"],
      [-inf, 0.25, "(nan, 0.0, nan)"],
    ];
    for (const [x, y, engine] of cells) {
      expect(show(vector3Const("octahedron_decode", [vector2(x, y)])), `(${x}, ${y})`).toBe(engine);
    }
  });

  it("Vector2i 的实参升 float（实测放行的那一格）", () => {
    expect(show(vector3Const("octahedron_decode", [vector2i(0, 0)]))).toBe("(0.0, 0.0, -1.0)");
    expect(show(vector3Const("octahedron_decode", [vector2i(-1, 2)]))).toBe("(-0.348155, 0.348155, -0.870388)");
  });

  it("元数与实参类型都响亮拒", () => {
    expect(() => vector3Const("octahedron_decode", [])).toThrowError(/octahedron_decode/);
    expect(() => vector3Const("octahedron_decode", [vector2(0, 0), vector2(0, 0)])).toThrowError(/octahedron_decode/);
    expect(() => vector3Const("octahedron_decode", [V.float(0)])).toThrowError(/Vector2/);
    expect(() => vector3Method(new GVector3(1, 2, 3), "octahedron_decode", [])).toThrowError(/octahedron_decode/);
  });

  it("常量名之外的静态函数仍响亮拒", () => {
    let msg = "竟然放过";
    try {
      vector3Const("from_string", [V.str("(1, 2, 3)")]);
    } catch (e) {
      msg = e instanceof UnsupportedError ? e.message : `非 UnsupportedError：${String(e)}`;
    }
    expect(msg).toContain("未实现");
  });
});
