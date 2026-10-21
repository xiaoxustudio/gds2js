/** `Array(Array)` 的别名与五种坏源形的引擎句（S601），读数 `tmp/d6/s607.out` 与语料 398 的 golden。 */
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
  it("Array(a) 就是那支 a：顶层写两侧同变", () => {
    const src = V.array(GArray.of([I(1), I(2)]));
    const r = arrayFromVariant(src);
    eq("601", "同一个盒子", `${r === src ? "true" : "false"}`, "true");
    raw(r)[0] = I(7);
    eq("601", "写顶层动源", `${show(src)}|${show(r)}`, "[7, 2]|[7, 2]");
    const inner = V.array(GArray.of([I(1)]));
    const nested = V.array(GArray.of([inner]));
    raw(arrayFromVariant(nested))[0] = I(9);
    eq("601", "内层槽也是同一条", `${show(nested)}`, "[9]");
  });
  it("Dictionary / String / int / null / Vector2 五格发引擎原句", () => {
    eq("601", "字典", err(() => arrayFromVariant(V.dict(new GDict()))), SENTENCE);
    eq("601", "字符串", err(() => arrayFromVariant(V.str("abc"))), SENTENCE);
    eq("601", "整数", err(() => arrayFromVariant(I(5))), SENTENCE);
    eq("601", "空", err(() => arrayFromVariant(V.nil())), SENTENCE);
    eq("601", "Vector2", err(() => arrayFromVariant(V.object(new GVector2(1, 2)))), SENTENCE);
  });
  it("没量过的源形继续响亮拒，pack 源另给新数组", () => {
    eq("601", "bool 拒", err(() => arrayFromVariant(V.bool(true))).startsWith("Array(...)") ? "拒" : "没拒", "拒");
    eq("601", "StringName 拒", err(() => arrayFromVariant(V.stringName("nm"))).includes("只实测过") ? "拒" : "没拒", "拒");
    const p = V.object(GBytes.of([3, 1]));
    const q = arrayFromVariant(p);
    raw(q).push(I(9));
    eq("601", "pack 转出的数组可以再加", `${show(p)} ${show(q)}`, "[3, 1] [3, 1, 9]");
  });
});
