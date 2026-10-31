/** Vector4 / Vector4i 核心值类型（S580），读数 `tmp/d6/s579.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { attribute, index, method, writeProp } from "@gds2js/runtime/runtime/methods";
import { ops } from "@gds2js/runtime/runtime/ops";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { GVector4, vector4Const, vector4New } from "@gds2js/runtime/runtime/class/vector/vector4";
import { GVector4i, vector4iConst, vector4iNew } from "@gds2js/runtime/runtime/class/vector/vector4i";
import { show, varToStr, valueEq } from "@gds2js/runtime/runtime/values";
import { variantHashNumber } from "@gds2js/runtime/runtime/builtins";
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

describe("Vector4 / Vector4i 构造与打印（S580）", () => {
  it("0 / 4 参与互转", () => {
    eq("580", "空", `${show(vector4New([]))}|${show(vector4iNew([]))}`, "(0.0, 0.0, 0.0, 0.0)|(0, 0, 0, 0)");
    eq("580", "四参", `${show(vector4New([I(1), I(2), I(3), I(4)]))}|${show(vector4iNew([V.float(-0.9), V.float(1.9), V.float(-1.9), V.float(4294967297)]))}`, "(1.0, 2.0, 3.0, 4.0)|(0, 1, -1, 1)");
    const f = vector4New([I(1), I(2), I(3), I(4)]);
    eq("580", "V4(V4i)", show(vector4New([vector4iNew([I(9), I(8), I(7), I(6)])])), "(9.0, 8.0, 7.0, 6.0)");
    eq("580", "V4i(V4)", show(vector4iNew([f])), "(1, 2, 3, 4)");
  });
  it("typeof / var_to_str / 常量", () => {
    const f = vector4New([I(1), I(2), I(3), I(4)]);
    const i = vector4iNew([I(1), I(2), I(3), I(4)]);
    eq("580", "typeof", `${typeOf(f).v}/${typeOf(i).v}`, "12/13");
    eq("580", "var_to_str", `${varToStr(f)}|${varToStr(i)}`, "Vector4(1, 2, 3, 4)|Vector4i(1, 2, 3, 4)");
    eq("580", "常量", `${show(vector4Const("ONE"))}|${show(vector4iConst("MAX"))}`, "(1.0, 1.0, 1.0, 1.0)|(2147483647, 2147483647, 2147483647, 2147483647)");
  });
});

describe("Vector4 / Vector4i 运算与索引（S580）", () => {
  it("逐分量 + - * / 与取负", () => {
    const a = vector4New([I(1), I(2), I(3), I(4)]);
    const b = vector4New([I(10), I(20), I(30), I(40)]);
    eq("580", "+ - * /", `${show(ops.add(a, b))}|${show(ops.sub(a, b))}|${show(ops.mul(a, b))}|${show(ops.div(b, a))}`, "(11.0, 22.0, 33.0, 44.0)|(-9.0, -18.0, -27.0, -36.0)|(10.0, 40.0, 90.0, 160.0)|(10.0, 10.0, 10.0, 10.0)");
    eq("580", "标量与负号", `${show(ops.mul(a, V.float(2)))}|${show(ops.mul(V.float(2), a))}|${show(ops.div(b, V.float(2)))}|${show(ops.neg(a))}`, "(2.0, 4.0, 6.0, 8.0)|(2.0, 4.0, 6.0, 8.0)|(5.0, 10.0, 15.0, 20.0)|(-1.0, -2.0, -3.0, -4.0)");
    const i = vector4iNew([I(1), I(2), I(3), I(4)]);
    eq("580", "整数向量", `${show(ops.add(i, vector4iNew([I(5), I(6), I(7), I(8)])))}|${show(ops.mul(i, I(3)))}|${show(ops.neg(vector4iNew([I(1), I(-2), I(3), I(-4)])))}`, "(6, 8, 10, 12)|(3, 6, 9, 12)|(-1, 2, -3, 4)");
  });
  it("等式 / 字典序 / 哈希", () => {
    const a = vector4New([I(1), I(2), I(3), I(4)]);
    eq("580", "eq / lt", `${valueEq(a, vector4New([I(1), I(2), I(3), I(4)]))}|${valueEq(a, vector4New([I(1), I(2), I(3), I(5)]))}|${ops.lt(a, vector4New([I(1), I(2), I(3), I(5)])).v}`, "true|false|true");
    eq("580", "hash", `${variantHashNumber(a)}|${variantHashNumber(vector4iNew([I(1), I(2), I(3), I(4)]))}`, "3873189715|3206438488");
  });
  it("分量属性与下标；负下标按引擎那句报错", () => {
    const a = vector4New([I(1), I(2), I(3), I(4)]);
    eq("580", "属性读", `${(attribute(a, "x") as Variant).v},${(attribute(a, "w") as Variant).v}`, "1,4");
    eq("580", "下标读", `${index(a, I(1)).v}`, "2");
    eq("580", "属性写", show(writeProp(a, "y", I(9)) as Variant), "(1.0, 9.0, 3.0, 4.0)");
    eq("580", "负下标", err(() => index(a, I(-1))), "Out of bounds get index '-1' (on base: 'Vector4')");
    eq("580", "Vector4i 负下标", err(() => index(vector4iNew([I(1), I(2), I(3), I(4)]), I(-1))), "Out of bounds get index '-1' (on base: 'Vector4i')");
  });
});
