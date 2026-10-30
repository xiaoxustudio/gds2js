/** Vector4 / Vector4i 的定形容器与字典键（S584），读数 `tmp/d6/v4typed.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { keyOf, GArray, GDict, elemConvert, elemDefault, show } from "@gds2js/runtime/runtime/values";
import { method } from "@gds2js/runtime/runtime/methods";
import { vector4New } from "@gds2js/runtime/runtime/class/vector/vector4";
import { vector4iNew } from "@gds2js/runtime/runtime/class/vector/vector4i";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { I } from "./support/variants";

const v4 = (x: number, y: number, z: number, w: number): Variant => vector4New([V.float(x), V.float(y), V.float(z), V.float(w)]);
const i4 = (x: number, y: number, z: number, w: number): Variant => vector4iNew([I(x), I(y), I(z), I(w)]);

describe("Vector4 定形容器（S584）", () => {
  it("elemDefault / elemConvert", () => {
    eq("584", "默认值", `${show(elemDefault("Vector4"))}|${show(elemDefault("Vector4i"))}`, "(0.0, 0.0, 0.0, 0.0)|(0, 0, 0, 0)");
    eq("584", "V4 槽收 V4i", show(elemConvert("Vector4", i4(1, 2, 3, 4)) as Variant), "(1.0, 2.0, 3.0, 4.0)");
    eq("584", "V4i 槽收 V4", show(elemConvert("Vector4i", v4(1.9, 2.9, -1.9, 4.9)) as Variant), "(1, 2, -1, 4)");
    eq("584", "V4 槽拒 int", elemConvert("Vector4", I(1)), null);
  });
  it("Array[Vector4] 的 stamp / typed builtin / 下标", () => {
    const a = GArray.of([v4(1, 2, 3, 4), i4(1, 2, 3, 4)]);
    a.stampElem("Vector4");
    const wrap = V.array(a);
    eq("584", "转换", show(wrap), "[(1.0, 2.0, 3.0, 4.0), (1.0, 2.0, 3.0, 4.0)]");
    eq("584", "builtin", method(wrap, "get_typed_builtin", []).v, 12);
  });
  it("Dictionary[Vector4, Vector4i] 的键与值", () => {
    const d = new GDict();
    d.stampElem("Vector4", "Vector4i");
    d.set(v4(1, 2, 3, 4), i4(1, 2, 3, 4));
    eq("584", "键查找", show(d.get(v4(1, 2, 3, 4))), "(1, 2, 3, 4)");
    eq("584", "键编码", keyOf(v4(1, 2, 3, 4)) !== keyOf(v4(1, 2, 3, 5)), true);
    eq("584", "typed 头", `${method(V.dict(d), "get_typed_key_builtin", []).v}/${method(V.dict(d), "get_typed_value_builtin", []).v}`, "12/13");
  });
});
