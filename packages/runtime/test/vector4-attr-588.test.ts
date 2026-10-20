/** Vector4 / Vector4i 的方法名当值（绑定 Callable）（S588），读数 `tmp/d6/v4attr.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { attribute, method } from "@gds2js/runtime/runtime/methods";
import { vector4New } from "@gds2js/runtime/runtime/vector4";
import { vector4iNew } from "@gds2js/runtime/runtime/vector4i";
import { show } from "@gds2js/runtime/runtime/values";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { I } from "./support/variants";

const v4 = (x: number, y: number, z: number, w: number): Variant => vector4New([V.float(x), V.float(y), V.float(z), V.float(w)]);
const i4 = (x: number, y: number, z: number, w: number): Variant => vector4iNew([I(x), I(y), I(z), I(w)]);
const call = (c: unknown, n: string, args: Variant[] = []): Variant => method(c, n, args) as Variant;

describe("Vector4 方法名当值（S588）", () => {
  it("length / normalized 的绑定 Callable 与标签", () => {
    const a = v4(1, 2, 3, 4);
    const len = attribute(a, "length") as Variant;
    eq("588", "typeof", typeOf(len).v, 25);
    eq("588", "标签", show(len), "Vector4::length");
    eq("588", "调用", show(call(len, "call")), "5.47722578048706");
    const norm = attribute(a, "normalized") as Variant;
    eq("588", "normalized 标签/调用", `${show(norm)}|${show(call(norm, "call"))}`, "Vector4::normalized|(0.182574, 0.365148, 0.547723, 0.730297)");
    const ilen = attribute(i4(1, 2, 3, 4), "length") as Variant;
    eq("588", "V4i", `${show(ilen)}|${show(call(ilen, "call"))}`, "Vector4i::length|5.47722557505166");
  });
  it("全表方法名当值（dot / snapped / clamp / snappedi）", () => {
    const a = v4(1, 2, 3, 4);
    const dot = attribute(a, "dot") as Variant;
    eq("588", "dot", `${show(dot)}|${show(call(dot, "call", [v4(1, 1, 1, 1)]))}`, "Vector4::dot|10.0");
    eq("588", "snapped", show(attribute(a, "snapped") as Variant), "Vector4::snapped");
    const cl = attribute(a, "clamp") as Variant;
    eq("588", "clamp", show(call(cl, "call", [v4(0, 0, 0, 0), v4(3, 3, 3, 3)])), "(1.0, 2.0, 3.0, 3.0)");
    eq("588", "V4i snappedi", show(attribute(i4(1, 2, 3, 4), "snappedi") as Variant), "Vector4i::snappedi");
  });
});
