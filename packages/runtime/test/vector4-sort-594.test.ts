/** Vector4 的 Array.sort / Dictionary.sort 序（S594），读数 `tmp/d6/s594.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { sortLess } from "@gds2js/runtime/runtime/ops";
import { GArray, GDict, show } from "@gds2js/runtime/runtime/values";
import { vector4New } from "@gds2js/runtime/runtime/class/vector/vector4";
import { vector4iNew } from "@gds2js/runtime/runtime/class/vector/vector4i";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { I } from "./support/variants";

const v4 = (x: number, y: number, z: number, w: number): Variant => vector4New([V.float(x), V.float(y), V.float(z), V.float(w)]);
const i4 = (x: number, y: number, z: number, w: number): Variant => vector4iNew([I(x), I(y), I(z), I(w)]);

describe("Vector4 的排序（S594）", () => {
  it("Array.sort 四分量字典序；异型 Vector4i 不换位", () => {
    const a = GArray.of([v4(2, 0, 0, 0), v4(1, 1, 0, 0), v4(1, 0, 0, 0), i4(1, 0, 0, 0)]);
    a.sort(sortLess);
    eq("594", "混合", show(V.array(a)), "[(1.0, 0.0, 0.0, 0.0), (1.0, 1.0, 0.0, 0.0), (2.0, 0.0, 0.0, 0.0), (1, 0, 0, 0)]");
    const b = GArray.of([i4(2, 0, 0, 0), i4(1, 1, 0, 0), i4(1, 0, 0, 0)]);
    b.sort(sortLess);
    eq("594", "V4i", show(V.array(b)), "[(1, 0, 0, 0), (1, 1, 0, 0), (2, 0, 0, 0)]");
  });
  it("Dictionary.sort 按 Vector4 键", () => {
    const d = new GDict();
    d.set(v4(2, 0, 0, 0), I(1));
    d.set(v4(1, 1, 0, 0), I(2));
    d.set(v4(1, 0, 0, 0), I(3));
    d.sortKeys(sortLess);
    eq("594", "键序", d.keys().map((k) => show(k)).join(","), "(1.0, 0.0, 0.0, 0.0),(1.0, 1.0, 0.0, 0.0),(2.0, 0.0, 0.0, 0.0)");
  });
});
