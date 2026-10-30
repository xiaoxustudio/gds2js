/** Vector4 / Vector4i 方法面（S581），读数 `tmp/d6/s582.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { vector4New } from "@gds2js/runtime/runtime/class/vector/vector4";
import { vector4iNew } from "@gds2js/runtime/runtime/class/vector/vector4i";
import { show } from "@gds2js/runtime/runtime/values";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { I } from "./support/variants";

const f4 = (x: number, y: number, z: number, w: number): Variant => vector4New([V.float(x), V.float(y), V.float(z), V.float(w)]);
const i4 = (x: number, y: number, z: number, w: number): Variant => vector4iNew([I(x), I(y), I(z), I(w)]);
const call = (r: Variant, n: string, args: Variant[] = []): Variant => method(r, n, args) as Variant;
const sh = (r: Variant, n: string, args: Variant[] = []): string => show(call(r, n, args));

describe("Vector4 方法（S581）", () => {
  it("轴 / 长度 / 距离 / 点积", () => {
    eq("581", "axis", `${call(f4(1, 3, 2, 4), "min_axis_index").v}/${call(f4(1, 3, 2, 4), "max_axis_index").v}|${call(f4(-1, -3, -2, -4), "min_axis_index").v}/${call(f4(-1, -3, -2, -4), "max_axis_index").v}|${call(f4(1, 1, 1, 1), "min_axis_index").v}/${call(f4(1, 1, 1, 1), "max_axis_index").v}`, "0/3|3/0|3/0");
    eq("581", "len", `${show(call(f4(1, 2, 3, 4), "length"))}/${show(call(f4(1, 2, 3, 4), "length_squared"))}/${show(call(f4(0, 0, 0, 0), "length"))}`, "5.47722578048706/30.0/0.0");
    eq("581", "dist/dot", `${show(call(f4(1, 2, 3, 4), "distance_to", [f4(0, 0, 0, 0)]))}/${show(call(f4(1, 2, 3, 4), "distance_squared_to", [f4(0, 0, 0, 0)]))}/${show(call(f4(1, 2, 3, 4), "dot", [f4(1, 1, 1, 1)]))}`, "5.47722578048706/30.0/10.0");
  });
  it("逐分量一元 / 取整 / clamp / min / max", () => {
    eq("581", "abs/sign", `${sh(f4(1.5, -2.5, 0, -0), "abs")}|${sh(f4(1.5, -2.5, 0, -0), "sign")}`, "(1.5, 2.5, 0.0, 0.0)|(1.0, -1.0, 0.0, 0.0)");
    eq("581", "floor/ceil/round", `${sh(f4(1.5, -2.5, 2.5, -0.5), "floor")}|${sh(f4(1.5, -2.5, 2.5, -0.5), "ceil")}|${sh(f4(1.5, -2.5, 2.5, -0.5), "round")}`, "(1.0, -3.0, 2.0, -1.0)|(2.0, -2.0, 3.0, 0.0)|(2.0, -3.0, 3.0, -1.0)");
    eq("581", "clamp", sh(f4(-1, 2, 5, 1), "clamp", [f4(0, 0, 0, 0), f4(4, 4, 4, 4)]), "(0.0, 2.0, 4.0, 1.0)");
    eq("581", "min/max/minf/maxf", `${sh(f4(1, 2, 3, 4), "min", [f4(4, 1, 5, 0)])}|${sh(f4(1, 2, 3, 4), "max", [f4(4, 1, 5, 0)])}|${sh(f4(1, 2, 3, 4), "minf", [V.float(2.5)])}|${sh(f4(1, 2, 3, 4), "maxf", [V.float(2.5)])}`, "(1.0, 1.0, 3.0, 0.0)|(4.0, 2.0, 5.0, 4.0)|(1.0, 2.0, 2.5, 2.5)|(2.5, 2.5, 3.0, 4.0)");
  });
  it("插值 / 对齐 / 取模 / 归一化 / 逆", () => {
    eq("581", "lerp/cubic", `${sh(f4(0, 0, 0, 0), "lerp", [f4(4, 8, 12, 16), V.float(0.25)])}|${sh(f4(0, 0, 0, 0), "cubic_interpolate", [f4(4, 8, 12, 16), f4(10, 10, 10, 10), f4(20, 20, 20, 20), V.float(0.5)])}`, "(1.0, 2.0, 3.0, 4.0)|(0.375, 2.625, 4.875, 7.125)");
    eq("581", "posmod/snapped", `${sh(f4(5.5, -5.5, 1, 0), "posmod", [V.float(2)])}|${sh(f4(5.4, 5.6, -5.4, -5.6), "snapped", [f4(1, 1, 1, 1)])}|${sh(f4(5.4, 5.6, -5.4, -5.6), "snappedf", [V.float(0.5)])}`, "(1.5, 0.5, 1.0, 0.0)|(5.0, 6.0, -5.0, -6.0)|(5.5, 5.5, -5.5, -5.5)");
    eq("581", "norm/inv/dir", `${sh(f4(1, 2, 3, 4), "normalized")}|${call(f4(1, 2, 3, 4), "is_normalized").v}|${sh(f4(0, 0, 0, 0), "normalized")}|${sh(f4(2, 4, 0.5, -0.25), "inverse")}|${sh(f4(1, 2, 3, 4), "direction_to", [f4(2, 2, 3, 4)])}`, "(0.182574, 0.365148, 0.547723, 0.730297)|false|(0.0, 0.0, 0.0, 0.0)|(0.5, 0.25, 2.0, -4.0)|(1.0, 0.0, 0.0, 0.0)");
    eq("581", "approx/finite", `${call(f4(1, 2, 3, 4), "is_equal_approx", [f4(1, 2, 3, 4)]).v}|${call(f4(0, 0, 0, 0), "is_zero_approx").v}|${call(f4(1, Infinity, 2, NaN), "is_finite").v}`, "true|true|false");
  });
});

describe("Vector4i 方法（S581）", () => {
  it("轴 / 长度 / 距离", () => {
    eq("581", "axis", `${call(i4(1, 3, 2, 4), "min_axis_index").v}/${call(i4(1, 3, 2, 4), "max_axis_index").v}`, "0/3");
    eq("581", "len/dist", `${show(call(i4(1, 2, 3, 4), "length"))}/${show(call(i4(1, 2, 3, 4), "length_squared"))}/${show(call(i4(1, 2, 3, 4), "distance_to", [i4(0, 0, 0, 0)]))}/${show(call(i4(1, 2, 3, 4), "distance_squared_to", [i4(0, 0, 0, 0)]))}`, "5.47722557505166/30/5.47722557505166/30");
    eq("581", "negative len", `${show(call(i4(-1, -2, -3, -4), "length"))}/${show(call(i4(-1, -2, -3, -4), "length_squared"))}`, "5.47722557505166/30");
  });
  it("min/max/clamp/snapped/sign/abs", () => {
    eq("581", "min/max", `${sh(i4(3, 1, 4, 2), "min", [i4(1, 5, 1, 9)])}|${sh(i4(3, 1, 4, 2), "max", [i4(1, 5, 1, 9)])}|${sh(i4(3, 1, 4, 2), "mini", [I(2)])}|${sh(i4(3, 1, 4, 2), "maxi", [I(2)])}`, "(1, 1, 1, 2)|(3, 5, 4, 9)|(2, 1, 2, 2)|(3, 2, 4, 2)");
    eq("581", "clamp", `${sh(i4(3, 1, 4, 2), "clamp", [i4(2, 0, 2, 2), i4(4, 2, 4, 4)])}|${sh(i4(3, 1, 4, 2), "clampi", [I(2), I(3)])}`, "(3, 1, 4, 2)|(3, 2, 3, 2)");
    eq("581", "snapped", `${sh(i4(3, 5, -3, -5), "snapped", [i4(2, 2, 2, 2)])}|${sh(i4(3, 5, -3, -5), "snappedi", [I(2)])}`, "(4, 6, -2, -4)|(4, 6, -2, -4)");
    eq("581", "sign/abs", `${sh(i4(-1, 2, 0, -5), "sign")}|${sh(i4(-1, 2, 0, -5), "abs")}`, "(-1, 1, 0, -1)|(1, 2, 0, 5)");
  });
});
