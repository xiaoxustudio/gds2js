/**
 * 全局 `abs` / `floor` / `ceil` / `round` / `sign` / `snapped` / `lerp` 的向量与 Color 那一半：
 * 每一格的期望都是 4.6.3 实测（一格一脚本，`tmp/probe-argtype/vals.mts` → `vals.txt`）。
 * 出货先前只写 int / float 两支，向量实参在 `v.v as number` 那一步算成 NaN、`sign` 那支算成 0.0（S339）。
 */
import { describe, expect, it } from "vitest";
import * as rt from "@gds2js/runtime/runtime/index";
import { GodotRuntimeError, UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { vector2 } from "@gds2js/runtime/runtime/vector2";
import { vector3 } from "@gds2js/runtime/runtime/vector3";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";

const V2 = (x: number, y: number): Variant => vector2(x, y);
const V3 = (x: number, y: number, z: number): Variant => vector3(x, y, z);
const V2i = (x: number, y: number): Variant => rt.vector2i(x, y);
const V3i = (x: number, y: number, z: number): Variant => rt.vector3i(x, y, z);
const C = (r: number, g: number, b: number, a: number): Variant => rt.color(r, g, b, a);
const F = (x: number): Variant => V.float(x);
const I = (x: number): Variant => V.int(x);

const CELLS: Array<[string, () => Variant, string]> = [
  ["abs(Vector2(-1.5, 2))", () => rt.abs(V2(-1.5, 2)), "(1.5, 2.0)"],
  ["abs(Vector2i(-1, 2))", () => rt.abs(V2i(-1, 2)), "(1, 2)"],
  ["abs(Vector3(-1.5, 2, -3))", () => rt.abs(V3(-1.5, 2, -3)), "(1.5, 2.0, 3.0)"],
  ["abs(Vector3i(-1, 2, -3))", () => rt.abs(V3i(-1, 2, -3)), "(1, 2, 3)"],
  ["ceil(Vector2(-1.5, 2))", () => rt.gCeil(V2(-1.5, 2)), "(-1.0, 2.0)"],
  ["ceil(Vector2i(-1, 2))", () => rt.gCeil(V2i(-1, 2)), "(-1, 2)"],
  ["ceil(Vector3(-1.5, 2, -3))", () => rt.gCeil(V3(-1.5, 2, -3)), "(-1.0, 2.0, -3.0)"],
  ["ceil(Vector3i(-1, 2, -3))", () => rt.gCeil(V3i(-1, 2, -3)), "(-1, 2, -3)"],
  ["floor(Vector2(-1.5, 2))", () => rt.gFloor(V2(-1.5, 2)), "(-2.0, 2.0)"],
  ["floor(Vector2i(-1, 2))", () => rt.gFloor(V2i(-1, 2)), "(-1, 2)"],
  ["floor(Vector3(-1.5, 2, -3))", () => rt.gFloor(V3(-1.5, 2, -3)), "(-2.0, 2.0, -3.0)"],
  ["floor(Vector3i(-1, 2, -3))", () => rt.gFloor(V3i(-1, 2, -3)), "(-1, 2, -3)"],
  ["round(Vector2(-1.5, 2))", () => rt.gRound(V2(-1.5, 2)), "(-2.0, 2.0)"],
  ["round(Vector2i(-1, 2))", () => rt.gRound(V2i(-1, 2)), "(-1, 2)"],
  ["round(Vector3(-1.5, 2, -3))", () => rt.gRound(V3(-1.5, 2, -3)), "(-2.0, 2.0, -3.0)"],
  ["round(Vector3i(-1, 2, -3))", () => rt.gRound(V3i(-1, 2, -3)), "(-1, 2, -3)"],
  ["sign(Vector2(-1.5, 2))", () => rt.gSign(V2(-1.5, 2)), "(-1.0, 1.0)"],
  ["sign(Vector2i(-1, 2))", () => rt.gSign(V2i(-1, 2)), "(-1, 1)"],
  ["sign(Vector3(-1.5, 2, -3))", () => rt.gSign(V3(-1.5, 2, -3)), "(-1.0, 1.0, -1.0)"],
  ["sign(Vector3i(-1, 2, -3))", () => rt.gSign(V3i(-1, 2, -3)), "(-1, 1, -1)"],
  ["snapped(Vector2(-1.5, 2), Vector2(1, 1))", () => rt.gSnapped(V2(-1.5, 2), V2(1, 1)), "(-1.0, 2.0)"],
  ["snapped(Vector3(-1.5, 2, -3), Vector3(1, 1, 1))", () => rt.gSnapped(V3(-1.5, 2, -3), V3(1, 1, 1)), "(-1.0, 2.0, -3.0)"],
  ["lerp(Vector2(-1, 0), Vector2(3, 8), 0.25)", () => rt.gLerp(V2(-1, 0), V2(3, 8), F(0.25)), "(0.0, 2.0)"],
  ["lerp(Vector3(-1, 0, 2), Vector3(3, 8, -2), 0.25)", () => rt.gLerp(V3(-1, 0, 2), V3(3, 8, -2), F(0.25)), "(0.0, 2.0, 1.0)"],
  ["lerp(Color(0, 0, 0, 1), Color(1, 0.5, 0.25, 0.5), 0.5)", () => rt.gLerp(C(0, 0, 0, 1), C(1, 0.5, 0.25, 0.5), F(0.5)), "(0.5, 0.25, 0.125, 0.75)"],
  ["lerp(Vector2(0, 0), Vector2(4, 8), 2.5)", () => rt.gLerp(V2(0, 0), V2(4, 8), F(2.5)), "(10.0, 20.0)"],
];

describe("Variant 形参那几支全局函数的向量与 Color 实参", () => {
  it.each(CELLS)("%s", (_label, run, expected) => {
    expect(rt.show(run())).toBe(expected);
  });
});

const REFUSED_MIGRATED: Array<[string, () => Variant]> = [
  ["rt.abs(V.str(\"a\"))", () => rt.abs(V.str("a"))],
  ["rt.gFloor(V.str(\"a\"))", () => rt.gFloor(V.str("a"))],
  ["rt.gCeil(V.str(\"a\"))", () => rt.gCeil(V.str("a"))],
  ["rt.gRound(V.str(\"a\"))", () => rt.gRound(V.str("a"))],
  ["rt.gSign(V.str(\"a\"))", () => rt.gSign(V.str("a"))],
];
const REFUSED: Array<[string, () => Variant]> = [
  ["rt.gSnapped(V.str(\"a\"), I(1))", () => rt.gSnapped(V.str("a"), I(1))],
  ["rt.gSnapped(I(1), V.str(\"a\"))", () => rt.gSnapped(I(1), V.str("a"))],
  ["rt.gLerp(V.str(\"a\"), I(1), F(0.5))", () => rt.gLerp(V.str("a"), I(1), F(0.5))],
  ["rt.gLerp(I(1), V.str(\"a\"), F(0.5))", () => rt.gLerp(I(1), V.str("a"), F(0.5))],
  ["rt.gLerp(I(1), I(3), V.str(\"a\"))", () => rt.gLerp(I(1), I(3), V.str("a"))],
];

describe("同一族收到非数值、非同型向量的实参时响亮拒", () => {
  it.each(REFUSED_MIGRATED)("%s（S524：引擎原文）", (_label, run) => {
    expect(run).toThrowError(GodotRuntimeError);
    expect(run).toThrowError(/Error calling utility function/);
  });
  it.each(REFUSED)("%s", (_label, run) => {
    expect(run).toThrowError(UnsupportedError);
  });
});
