/** `Array(Array)` 的浅拷与五种坏源形的引擎句（S601），读数 `tmp/d6/s607.out`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { arrayFromVariant } from "@gds2js/runtime/runtime/builtins";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { GArray, GDict, show } from "@gds2js/runtime/runtime/values";
import { GVector2 } from "@gds2js/runtime/runtime/vector2";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { I } from "./support/variants";

const err = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { message?: string }).message ?? "?";
  }
};
const raw = (a: Variant): Variant[] => (a.v as GArray).raw();
const SENTENCE = "Invalid call. Nonexistent 'Array' constructor.";

describe("Array(Array) 与坏源形（S601）", () => {
  it("浅拷：内层是同一个引用，顶层写不动源", () => {
    const inner = V.array(GArray.of([I(1)]));
    const src = V.array(GArray.of([inner, I(2)]));
    const r = arrayFromVariant(src);
    eq("601", "内层共享", `${raw(r)[0] === inner ? "true" : "false"}`, "true");
    raw(r)[0] = I(9);
    eq("601", "顶层独立", `${show(src)}|${show(r)}`, "[[1], 2]|[9, 2]");
    eq("601", "拷出来的形状", `${show(arrayFromVariant(V.array(GArray.of([I(1), I(2)]))))} ${raw(r).length}`, "[1, 2] 2");
  });
  it("Dictionary / String / int / null / Vector2 五格发引擎原句", () => {
    eq("601", "字典", err(() => arrayFromVariant(V.dict(new GDict()))), SENTENCE);
    eq("601", "字符串", err(() => arrayFromVariant(V.str("abc"))), SENTENCE);
    eq("601", "整数", err(() => arrayFromVariant(I(5))), SENTENCE);
    eq("601", "空", err(() => arrayFromVariant(V.nil())), SENTENCE);
    eq("601", "Vector2", err(() => arrayFromVariant(V.object(new GVector2(1, 2)))), SENTENCE);
  });
  it("没量过的源形继续响亮拒", () => {
    eq("601", "bool", err(() => arrayFromVariant(V.bool(true))).slice(0, 4), "Array");
    eq("601", "StringName", err(() => arrayFromVariant(V.stringName("nm"))).includes("只实测过"), "true");
    eq("601", "pack 仍搬元素", show(arrayFromVariant(V.object(GBytes.of([3, 1, 2])))), "[3, 1, 2]");
  });
});
