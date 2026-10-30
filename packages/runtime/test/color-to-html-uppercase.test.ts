/**
 * `Color.to_html(uppercase)`：那一位的声明是 `bool`，折法与拒的形全部是 4.6.3 实测
 * （`tmp/probe-argtype/html.mts` → `html.txt`，String / null / Dictionary / Array 那四格在 `inst.mts` → `inst.txt`）。
 * 改前出货对没收的形按 JS 真值编值（`to_html("a")` 给 `ff0000ff`、`to_html(null)` 给 `ff0000`），而引擎解析期就拒。
 */
import { describe, expect, it } from "vitest";
import { GColor, color, colorMethod } from "@gds2js/runtime/runtime/class/color/color";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray } from "@gds2js/runtime/runtime/values";
import { vector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { dictOf } from "@gds2js/runtime/runtime/methods";

const RED = new GColor(1, 0, 0, 1);
const call = (arg?: Variant): string => colorMethod(RED, "to_html", arg === undefined ? [] : [arg]).v as string;

const VALUES: Array<[string, Variant | undefined, string]> = [
  ["不收参数", undefined, "ff0000ff"],
  ["true", V.bool(true), "ff0000ff"],
  ["false", V.bool(false), "ff0000"],
  ["0", V.int(0), "ff0000"],
  ["0.0", V.float(0), "ff0000"],
  ["-0.0", V.float(-0), "ff0000"],
  ["1", V.int(1), "ff0000ff"],
  ["2", V.int(2), "ff0000ff"],
  ["-1", V.int(-1), "ff0000ff"],
  ["128", V.int(128), "ff0000ff"],
  ["0.5", V.float(0.5), "ff0000ff"],
  ["1.5", V.float(1.5), "ff0000ff"],
  ["越界 int 2^53", V.int(9007199254740992n), "ff0000ff"],
];

const REFUSE: Array<[string, Variant]> = [
  ["String", V.str("a")],
  ["StringName", V.stringName("a")],
  ["null", V.nil()],
  ["Array", V.array(GArray.of([V.int(1)]))],
  ["Dictionary", dictOf([[V.str("a"), V.int(1)]])],
  ["Color", color(1, 0, 0, 1)],
  ["Vector2", vector2(1, 2)],
  ["NaN", V.float(Number.NaN)],
  ["inf", V.float(Number.POSITIVE_INFINITY)],
];

describe("runtime/color · to_html 的 uppercase 那一位", () => {
  it.each(VALUES)("折法 %s", (_who, arg, want) => {
    expect(call(arg)).toBe(want);
  });

  it.each(REFUSE)("拒 %s", (who, arg) => {
    expect(() => call(arg)).toThrow(UnsupportedError);
    expect(() => call(arg)).toThrow(who === "NaN" || who === "inf" ? "非有限值没量过" : "只量过 bool / int / float");
  });
});
