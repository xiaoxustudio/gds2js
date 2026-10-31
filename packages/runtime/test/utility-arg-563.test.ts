/** `snapped` / `lerp` 的运行期坏型文案与权重折算（S563），读数 `tmp/d6/s563/*.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { gLerp, gSnapped } from "@gds2js/runtime/runtime/builtins";
import { V } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { GVector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { GVector2i } from "@gds2js/runtime/runtime/class/vector/vector2i";
import { GVector3 } from "@gds2js/runtime/runtime/class/vector/vector3";
import { GColor } from "@gds2js/runtime/runtime/color";
import { I, S } from "./support/variants";

const msg = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { message?: string }).message ?? "?";
  }
};
const v2 = (x: number, y: number) => V.object(new GVector2(x, y));
const v2i = (x: number, y: number) => V.object(new GVector2i(x, y));
const v3 = (x: number, y: number, z: number) => V.object(new GVector3(x, y, z));
const col = (r: number, g: number, b: number, a: number) => V.object(new GColor(r, g, b, a));

describe("snapped 运行期坏型（S563）", () => {
  it("x / step / 向量 step 三句", () => {
    eq("563", "x 是 String", msg(() => gSnapped(S("a"), I(1))), 'Error calling utility function "snapped()": Argument "x" must be "int", "float", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", or "Vector4i".');
    eq("563", "x 是 Color", msg(() => gSnapped(col(1, 0, 0, 1), I(1))), 'Error calling utility function "snapped()": Argument "x" must be "int", "float", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", or "Vector4i".');
    eq("563", "数值 x + 坏 step", msg(() => gSnapped(V.float(1), S("a"))), 'Error calling utility function "snapped()": Argument "step" must be "int" or "float".');
    eq("563", "向量 x + String step", msg(() => gSnapped(v2(1, 2), S("a"))), 'Invalid type in utility function "snapped()". Cannot convert argument 2 from String to Vector2.');
    eq("563", "向量 x + 异型 step", msg(() => gSnapped(v2(1, 2), v3(1, 2, 3))), 'Invalid type in utility function "snapped()". Cannot convert argument 2 from Vector3 to Vector2.');
  });
  it("合法形回归", () => {
    eq("563", "snapped(7.5,3)", show(gSnapped(V.float(7.5), I(3))), "9");
    eq("563", "V2 snapped", show(gSnapped(v2(-1.5, 2), v2(1, 1))), "(-1.0, 2.0)");
    eq("563", "V2i snapped", show(gSnapped(v2i(1, 2), v2i(2, 2))), "(2, 2)");
  });
});

describe("lerp 运行期坏型与权重折算（S563）", () => {
  it("from / to 三句", () => {
    eq("563", "from 是 String", msg(() => gLerp(S("a"), I(1), V.float(0.5))), 'Error calling utility function "lerp()": Argument "from" must be "int", "float", "Vector2", "Vector3", "Vector4", "Color", "Quaternion", "Basis", "Transform2D", or "Transform3D".');
    eq("563", "from 是 Vector2i", msg(() => gLerp(v2i(1, 2), v2i(3, 4), V.float(0.5))), 'Error calling utility function "lerp()": Argument "from" must be "int", "float", "Vector2", "Vector3", "Vector4", "Color", "Quaternion", "Basis", "Transform2D", or "Transform3D".');
    eq("563", "int from + String to", msg(() => gLerp(I(1), S("a"), V.float(0.5))), 'Invalid type in utility function "lerp()". Cannot convert argument 2 from String to int.');
    eq("563", "float from + String to", msg(() => gLerp(V.float(1.5), S("a"), V.float(0.5))), 'Invalid type in utility function "lerp()". Cannot convert argument 2 from String to float.');
    eq("563", "V2 from + String to", msg(() => gLerp(v2(1, 2), S("a"), V.float(0.5))), 'Invalid type in utility function "lerp()". Cannot convert argument 2 from String to Vector2.');
  });
  it("权重按 Variant→float 折；向量同型正常", () => {
    eq("563", 'String "3" 当 3', show(gLerp(V.float(1), V.float(2), S("3"))), "4.0");
    eq("563", "Array 当 0", show(gLerp(V.float(1), V.float(2), V.array([] as never))), "1.0");
    eq("563", "null 当 0", show(gLerp(V.float(1), V.float(2), V.nil())), "1.0");
    eq("563", "V2 权重当 0（S339 那格）", show(gLerp(v2(0, 0), v2(4, 8), v2(0.5, 0.25))), "(0.0, 0.0)");
    eq("563", "V2 lerp 回归", show(gLerp(v2(0, 0), v2(4, 8), V.float(0.25))), "(1.0, 2.0)");
    eq("563", "Color lerp 回归", show(gLerp(col(0, 0, 0, 1), col(1, 0.5, 0.25, 0.5), V.float(0.5))), "(0.5, 0.25, 0.125, 0.75)");
  });
});
