/**
 * `Vector3.octahedron_encode()`：29 格的读数逐字抄自 `tmp/probe-oct/godot.txt`（语料 328 是同批格子的逐字节门）。
 * `octahedron_decode` 仍响亮拒 —— 它的式子在越界输入那几格对不上（`readings8` 同族的 decode 侧），没量全不发。
 */
import { describe, expect, it } from "vitest";
import { GVector3, vector3Method } from "@gds2js/runtime/runtime/vector3";
import { V } from "@gds2js/runtime/runtime/tags";
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

  it("octahedron_decode 仍响亮拒", () => {
    let msg = "竟然放过";
    try {
      vector3Method(new GVector3(1, 2, 3), "octahedron_decode", [V.float(0)]);
    } catch (e) {
      msg = e instanceof UnsupportedError ? e.message : `非 UnsupportedError：${String(e)}`;
    }
    expect(msg).toContain("octahedron_decode");
  });
});
