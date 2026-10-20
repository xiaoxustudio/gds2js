/** `str_to_var` 的 Vector4 / Vector4i 形（S595），读数 `tmp/d6/s595.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { show, strToVar } from "@gds2js/runtime/runtime/values";
import { S } from "./support/variants";

describe("str_to_var 的 Vector4（S595）", () => {
  it("四个数值分量 / V4i；空参与跨构造给 null", () => {
    const a = strToVar(S("Vector4(1, 2, 3, 4)"));
    eq("595", "V4", `${typeOf(a).v}|${show(a)}`, "12|(1.0, 2.0, 3.0, 4.0)");
    eq("595", "V4 浮点", show(strToVar(S("Vector4(1.5, -2, 3, 4)"))), "(1.5, -2.0, 3.0, 4.0)");
    const i = strToVar(S("Vector4i(1, 2, 3, 4)"));
    eq("595", "V4i", `${typeOf(i).v}|${show(i)}`, "13|(1, 2, 3, 4)");
    eq("595", "空参与跨构造", ["Vector4()", "Vector4(Vector4i(1, 2, 3, 4))", "Vector4i(Vector4(1.9, 2.9, -1.9, 4.9))"].map((s) => show(strToVar(S(s)))).join(","), "<null>,<null>,<null>");
  });
});
