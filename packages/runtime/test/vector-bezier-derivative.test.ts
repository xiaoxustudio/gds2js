/** `bezier_derivative` 的读数逐字抄自 `corpus/cases/339-bezier-derivative/godot.txt`（同批 222 格走逐字节门）。 */
import { describe, expect, it } from "vitest";
import { GVector2, vector2, vector2Method } from "@gds2js/runtime/runtime/class/vector/vector2";
import { GVector3, vector3, vector3Method } from "@gds2js/runtime/runtime/class/vector/vector3";
import { V } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";

const num = (s: string): number => Number(s);
const v2 = (s: string) => vector2(...(s.split(" ").map(num) as [number, number]));
const v3 = (s: string) => vector3(...(s.split(" ").map(num) as [number, number, number]));

const D2 = ["-3 0.5", "1.5 -2.5", "0.25 4.5", "7 -1"];
const CELLS_V2: Array<[string, string]> = [
  ["0.3", "(6.8625, 2.925001)"],
  ["0.13", "(9.712125, -2.34075)"],
  ["0.7", "(9.5625, -0.075001)"],
  ["0.37", "(6.382125, 3.95925)"],
  ["0.25", "(7.453125, 1.78125)"],
  ["0.5", "(6.5625, 4.125)"],
  ["0.9", "(15.8625, -9.674998)"],
];
const CELLS_V2B: Array<[string, string]> = [
  ["0.3", "(-0.39, -0.0)"],
  ["0.13", "(-0.0279, -0.7548)"],
  ["0.7", "(0.81, -0.96)"],
  ["0.37", "(-0.3879, 0.1092)"],
  ["0.25", "(-0.3375, -0.15)"],
  ["0.5", "(-0.15, -0.0)"],
  ["0.9", "(2.49, -2.88)"],
];
const CELLS_V3: Array<[string, string]> = [
  ["0.3", "(6.8625, 2.925001, -2.13)"],
  ["0.13", "(9.712125, -2.34075, -2.1708)"],
  ["0.7", "(9.5625, -0.075001, 2.07)"],
  ["0.37", "(6.382125, 3.95925, -1.8108)"],
  ["0.25", "(7.453125, 1.78125, -2.25)"],
  ["0.5", "(6.5625, 4.125, -0.75)"],
  ["0.9", "(15.8625, -9.674998, 6.329999)"],
];
const V3 = ["-3 0.5 1.25", "1.5 -2.5 0.75", "0.25 4.5 -1", "7 -1 2"];
const B = ["0.1 0.2", "0.3 -0.4", "-0.5 0.6", "0.7 -0.8"];

function bd2(src: string, c1: string, c2: string, e: string, t: string): string {
  const [x = 0, y = 0] = src.split(" ").map(num);
  return show(vector2Method(new GVector2(x, y), "bezier_derivative", [v2(c1), v2(c2), v2(e), V.float(num(t))]));
}
function bd3(src: string, c1: string, c2: string, e: string, t: string): string {
  const [x = 0, y = 0, z = 0] = src.split(" ").map(num);
  return show(vector3Method(new GVector3(x, y, z), "bezier_derivative", [v3(c1), v3(c2), v3(e), V.float(num(t))]));
}

describe("Vector2/Vector3.bezier_derivative", () => {
  it.each(CELLS_V2)("Vector2 D2 %s", (t, engine) => {
    expect(bd2(D2[0]!, D2[1]!, D2[2]!, D2[3]!, t), `D2 t=${t}`).toBe(engine);
  });
  it.each(CELLS_V2B)("Vector2 D2B %s", (t, engine) => {
    expect(bd2(B[0]!, B[1]!, B[2]!, B[3]!, t), `D2B t=${t}`).toBe(engine);
  });
  it.each(CELLS_V3)("Vector3 %s", (t, engine) => {
    expect(bd3(V3[0]!, V3[1]!, V3[2]!, V3[3]!, t), `D3 t=${t}`).toBe(engine);
  });

  it("三条乘式各自为政的那六格", () => {
    for (const [t, engine] of [
      ["0.3", "(1.158, -0.465)"],
      ["0.13", "(0.88158, 0.31275)"],
      ["0.7", "(1.398, -0.585)"],
      ["0.37", "(1.24158, -0.65925)"],
      ["0.25", "(1.0875, -0.28125)"],
      ["0.5", "(1.35, -0.825)"],
      ["0.9", "(1.302, 0.255)"],
      ["0.11", "(0.84222, 0.43275)"],
    ] as Array<[string, string]>) {
      expect(bd2("0.1 0.7", "0.3 1.1", "0.9 0.2", "1.3 0.5", t), `I99 t=${t}`).toBe(engine);
    }
  });

  it("单条乘式隔离的三组（只留 term1 / term2 / term3）", () => {
    for (const [t, engine] of [
      ["0.3", "(0.294, 0.588)"],
      ["0.5", "(0.15, 0.3)"],
      ["0.9", "(0.006, 0.012)"],
      ["0.11", "(0.47526, 0.95052)"],
    ] as Array<[string, string]>) {
      expect(bd2("0.1 0.7", "0.3 1.1", "0.3 1.1", "0.3 1.1", t), `I1 t=${t}`).toBe(engine);
    }
    for (const [t, engine] of [
      ["0.3", "(0.756, -1.134)"],
      ["0.5", "(0.9, -1.35)"],
      ["0.11", "(0.35244, -0.52866)"],
      ["0.13", "(0.40716, -0.61074)"],
    ] as Array<[string, string]>) {
      expect(bd2("0.3 1.1", "0.3 1.1", "0.9 0.2", "0.9 0.2", t), `I2 t=${t}`).toBe(engine);
    }
    for (const [t, engine] of [
      ["0.3", "(0.162, -0.243)"],
      ["0.5", "(0.45, -0.675)"],
      ["0.9", "(1.458, -2.187)"],
      ["0.11", "(0.02178, -0.03267)"],
    ] as Array<[string, string]>) {
      expect(bd2("0.3 1.1", "0.3 1.1", "0.3 1.1", "0.9 0.2", t), `I3 t=${t}`).toBe(engine);
    }
  });

  it("端点、负 t、int 实参与 1e6 量级", () => {
    expect(bd2("0 0", "1 1", "0.1 0.2", "1e6 -1e6", "0.5")).toBe("(749999.3, -750000.6)");
    expect(bd2("-1 -1", "-2 -2", "-3 -3", "-4 -4", "-1.5")).toBe("(-3.0, -3.0)");
    expect(bd3("0.44015 368.345 0.0007996", "0.13798 -0.31695 -9.10763", "3.80858 -0.0000647 -7.50929", "-0.17257 -0.00266 -0.0003865", "0")).toBe(
      "(-0.90651, -1105.986, -27.32529)",
    );
    expect(bd2("-5.50756 -0.0009348", "-785.058 -0.0002605", "0.0001106 -0.0005039", "-0.0001278 -0.0002386", "1")).toBe("(-0.000715, 0.000796)");
    expect(bd3("5.59503 0.0004331 0.42013", "-0.0004393 0.0001923 939.957", "-6.41864 8.13003 0.32469", "-0.0002668 -322.766 0.0004755", "2")).toBe(
      "(137.2525, -4068.311, 14090.31)",
    );
    expect(
      show(vector2Method(new GVector2(1, 2), "bezier_derivative", [v2("3 4"), v2("5 6"), v2("7 8"), V.int(1)])),
    ).toBe("(6.0, 6.0)");
  });

  it("元数与实参类型按实测拒", () => {
    expect(() => vector2Method(new GVector2(1, 2), "bezier_derivative", [v2("3 4"), v2("5 6"), V.float(0.5)])).toThrowError(
      /bezier_derivative/,
    );
    expect(() => vector3Method(new GVector3(1, 2, 3), "bezier_derivative", [v3("3 4 5"), v3("5 6 7"), v3("7 8 9")])).toThrowError(
      /bezier_derivative/,
    );
    expect(() => vector2Method(new GVector2(1, 2), "bezier_derivative", [v3("3 4 5"), v2("5 6"), v2("7 8"), V.float(0.5)])).toThrowError(
      /Vector2/,
    );
    expect(() => vector2Method(new GVector2(1, 2), "bezier_derivative", ["x" as never, v2("5 6"), v2("7 8"), V.float(0.5)])).toThrowError(
      /需要数值实参|需要 Vector2/,
    );
  });
});
