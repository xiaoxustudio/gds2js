/** `Array(pack)` 的九支 + Vector4（S597），读数 `tmp/d6/s598.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { arrayFromVariant } from "@gds2js/runtime/runtime/builtins";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { method } from "@gds2js/runtime/runtime/methods";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { show } from "@gds2js/runtime/runtime/values";
import { GVector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { GVector3 } from "@gds2js/runtime/runtime/class/vector/vector3";
import { GVector4 } from "@gds2js/runtime/runtime/class/vector/vector4";
import { GColor } from "@gds2js/runtime/runtime/class/color/color";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";

const packOf = (kind: string, items: unknown[]): Variant => V.object(new GBytes(items as never[], kind as never));
const firstType = (a: Variant): number => typeOf((a.v as { raw(): Variant[] }).raw()[0]!).v as number;

describe("Array(pack)（S597）", () => {
  it("九支 pack 的元素与 typeof", () => {
    eq("597", "数值", `${show(arrayFromVariant(packOf("byte", [1, 2])))}|${show(arrayFromVariant(packOf("int32", [1, 2])))}|${show(arrayFromVariant(packOf("int64", [1n, 2n])))}`, "[1, 2]|[1, 2]|[1, 2]");
    eq("597", "浮点", `${show(arrayFromVariant(packOf("float32", [1.5, 2])))}|${show(arrayFromVariant(packOf("float64", [1.5, 2])))}`, "[1.5, 2.0]|[1.5, 2.0]");
    eq("597", "字符串", show(arrayFromVariant(packOf("string", ["a", "b"]))), "[\"a\", \"b\"]");
  });
  it("向量 / 颜色 / Vector4 与未定形", () => {
    eq("597", "向量", `${show(arrayFromVariant(packOf("vector2", [new GVector2(1, 2)])))}|${show(arrayFromVariant(packOf("vector3", [new GVector3(1, 2, 3)])))}|${show(arrayFromVariant(packOf("color", [new GColor(1, 0, 0, 1)])))}`, "[(1.0, 2.0)]|[(1.0, 2.0, 3.0)]|[(1.0, 0.0, 0.0, 1.0)]");
    const a = arrayFromVariant(packOf("vector4", [new GVector4(1, 2, 3, 4)]));
    eq("597", "V4", `${show(a)}|${firstType(a)}`, "[(1.0, 2.0, 3.0, 4.0)]|12");
    const empty = arrayFromVariant(packOf("vector4", []));
    eq("597", "空且不typed", `${show(empty)}|${method(empty, "is_typed", []).v}`, "[]|false");
  });
});
