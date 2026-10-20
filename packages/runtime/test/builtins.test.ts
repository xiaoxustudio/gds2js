// 由 tools/ops-check.ts 机械搬迁：region 897-911, 1859-1894。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { hashDjb2, range, rangeSeq, variantHash } from "@gds2js/runtime/runtime/builtins";
import { method } from "@gds2js/runtime/runtime/methods";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, show } from "@gds2js/runtime/runtime/values";
import { color } from "@gds2js/runtime/runtime/color";
import { vector2 } from "@gds2js/runtime/runtime/vector2";
import { F, I, S } from "./support/variants";

describe("runtime/builtins · range 与哈希", () => {
  it("073 +1 · range(0.5, 2.5) 两端各截断", async () => {
    const R = (...vs: Variant[]) => show(V.array(range(vs)));
    eq("073", "range(0.5, 2.5) 两端各截断", R(F(0.5), F(2.5)), "[0, 1]");
    eq("073", "range(2.5) 一个参数也截断", R(F(2.5)), "[0, 1]");
    eq("073", "range(0, 3.9) 截断 end", R(I(0), F(3.9)), "[0, 1, 2]");
    eq("073", "range(0, 3, 2.5) 截断 step", R(I(0), I(3), F(2.5)), "[0, 2]");
    eq("073", "range(0, 3, true) 把 bool 当 1", R(I(0), I(3), V.bool(true)), "[0, 1, 2]");
    eq("073", "range(-1.5, 1.5) 向零截断不是向下取整", R(F(-1.5), F(1.5)), "[-1, 0]");
    eq("073", "range(-2) 空数组", R(I(-2)), "[]");
    eq("073", "rangeSeq 与 range 同一条算式", rangeSeq([F(0.9), I(6), F(1.7)]).join(","), "0,1,2,3,4,5");
    shouldThrow("074", "步长截断成 0（0.999）", () => range([I(0), I(3), F(0.999)]));
    shouldThrow("074", "显式零步长", () => range([I(0), I(1), F(0.0)]));
    shouldThrow("074", "String 不能转 int", () => range([I(0), S("3")]));
    shouldThrow("074", "Vector2 不能当步长", () => range([I(0), I(3), vector2(1, 1)]));
  });

  it("098 · 空串就是种子", async () => {
    const H = (s: string) => String(hashDjb2(s));
    const vh = (v: Variant) => String(variantHash([v]).v);
    eq("098", "空串就是种子", H(""), "5381");
    eq("098", "单字符", H("a"), "177670");
    eq("098", "abc 与计划文档里那条实测同值", H("abc"), "193485963");
    eq("098", "吃码点不吃码元：BMP 中文", H("你好"), "6553378");
    eq("098", "吃码点不吃码元：一个 emoji", H("\u{1F600}"), "306085");
    eq("098", "吃码点不吃码元：两个 emoji", H("\u{1F600}\u{1F601}"), "10229318");
    eq("098", "吃码点不吃码元：组合用字母", H("a\u0301"), "5863879");
    eq("098", "边界码点 U+FFFF / U+10000", `${H("\uFFFF")}/${H("\u{10000}")}`, "243108/243109");
    eq("098", "26 个字母溢出 32 位之后仍印无符号", H("abcdefghijklmnopqrstuvwxyz"), "3927029252");
    eq("098", "43 个字符（多轮回绕）", H("the quick brown fox jumps over the lazy dog"), "2012963070");
    eq("098", "经典转义那一条", H("\t\n\\\""), "2086810998");
    eq(
      "098",
      "数字串 / 大写 / 空格 / 重复串",
      [H("0123456789"), H("A"), H(" "), H("abcabc")].join(" "),
      "995771986 177638 177605 4048076369",
    );
    eq("098", "全局 hash(String)", vh(V.str("abc")), "193485963");
    eq("098", "全局 hash(StringName) 同值", vh(V.stringName("abc")), "193485963");
    eq("098", "实例方法 hash() 与全局同值", String(method(V.str("abc"), "hash", []).v), "193485963");
    eq("098", "StringName 的方法也走同一条", String(method(V.stringName("abc"), "hash", []).v), "193485963");
    eq("098", "hash(true) / hash(false) / hash(null)", `${vh(V.bool(true))}/${vh(V.bool(false))}/${vh(V.nil())}`, "1/0/0");
    eq("098", "hash(int) 走引擎的 hash_one_uint64（实测定住）", vh(V.int(5)), "1788267159");
    eq("098", "hash(float) 走 murmur3 one_double", vh(V.float(2.5)), "2779676868");
    eq("098", "±0 先归一：hash(-0.0) 与 hash(0.0) 同值", `${vh(V.float(-0))}/${vh(V.float(0))}`, "546098158/546098158");
    eq("098", "hash(INF)", vh(V.float(Infinity)), "3550758535");
    shouldThrow("098", "hash(NaN) 仍报缺：C++ NAN 常量的位型没实测", () => vh(V.float(NaN)));
    eq("098", "数组按内容（类型标签起手、逐个元素折叠、fmix32 收尾）", vh(V.array(GArray.of([V.int(1)]))), "1008395022");
    eq("098", "hash(Vector2) 走分量 murmur（S539）", vh(vector2(1, 2)), "4195279070");
    eq("098", "hash(Color) 走分量 murmur（S539）", vh(color(1, 0, 0, 1)), "3403565064");
    shouldThrow("098", "hash() 的实参个数必须是 1", () => variantHash([]));
    shouldThrow("098", "String.hash() 不收实参", () => method(V.str("abc"), "hash", [V.int(1)]));
  });
});
