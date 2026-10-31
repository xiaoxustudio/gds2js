// 由 tools/ops-check.ts 机械搬迁：region 443-454, 456-499, 1423-1472。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { writeIdx, writeProp } from "@gds2js/runtime/runtime/methods";
import { ops } from "@gds2js/runtime/runtime/ops";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show, valueEq} from "@gds2js/runtime/runtime/values";
import { strFloat } from "@gds2js/runtime/runtime/numfmt";
import { strVec2 } from "@gds2js/runtime/runtime/string-ops";
import { GVector2, vecReadIndex, vecWrite, vector2, vector2Const, vector2Method, vector2New } from "@gds2js/runtime/runtime/class/vector/vector2";
import { F, I, S } from "./support/variants";

describe("runtime/vector2", () => {
  it("066 · 构造即落 float32（1e15）", async () => {
    const v = new GVector2(1e15, 0.1);
    eq("066", "构造即落 float32（1e15）", v.x, 999999986991104);
    eq("066", "构造即落 float32（0.1）", v.y, Math.fround(0.1));
    eq("066", "float32 值单独打印走 15 位规则", strFloat(0.10000000149011612), "0.10000000149012");
    eq("066", "Vector2 分量打印是 6 位小数", strVec2(1.2345678806304932), "1.234568");
    eq("066", "1e-8 被 6 位小数吃成 0.0", strVec2(1e-8), "0.0");
    eq("066", "-0.0 打成 0.0", strVec2(-0), "0.0");
    eq("066", "整数分量补一位小数", strVec2(4), "4.0");
    eq("066", "大值不转科学计数法", strVec2(999999986991104), "999999986991104.0");
    eq("066", "Vector2 相等按 float32 分量", show(ops.eq(V.object(v), V.object(new GVector2(1e15, 0.1)))), "true");
  });

  it("068 +1 · angle 是 float32 的 atan2", async () => {
    const m = (x: number, y: number) => (name: string, args: Variant[] = []) =>
      show(vector2Method(new GVector2(x, y), name, args));
    const a = m(3, 4);
    eq("068", "angle 是 float32 的 atan2", a("angle"), "0.92729520797729");
    eq("068", "dot 逐步 float32", m(0.1, 0.2)("dot", [vector2(0.1, 0.2)]), "0.05000000447035");
    eq("068", "normalized 零向量不给 nan", m(0, 0)("normalized"), "(0.0, 0.0)");
    eq("068", "normalized 大分量塌成 1.0", m(1e15, 1)("normalized"), "(1.0, 0.0)");
    eq("068", "round 半数远离零", m(2.5, -0.5)("round"), "(3.0, -1.0)");
    eq("068", "snapped = step*floor(v/step+0.5)", m(2.5, -0.5)("snapped", [vector2(1, 1)]), "(3.0, 0.0)");
    eq("068", "snapped 步长为 0 时原样返回", a("snapped", [vector2(0, 1)]), "(3.0, 4.0)");
    eq("068", "limit_length(0) 给零向量", a("limit_length", [F(0)]), "(0.0, 0.0)");
    eq("068", "orthogonal 是 (y, -x)", a("orthogonal"), "(4.0, -3.0)");
    eq("068", "aspect 0/0 是 nan", m(0, 0)("aspect"), "nan");
    eq("068", "逐分量乘", show(ops.mul(vector2(3, 4), vector2(-1, 2))), "(-3.0, 8.0)");
    eq("068", "逐分量除且不拦除零", show(ops.div(vector2(1, 1), vector2(0, 0))), "(inf, inf)");
    eq("068", "比较是字典序不是逐分量", show(ops.gt(vector2(3, 4), vector2(2, 5))), "true");
    eq("068", "下标读分量", show(vecReadIndex(new GVector2(3, 4), I(1))), "4.0");
    eq("068", "Vector2() 是零向量", show(vector2New([])), "(0.0, 0.0)");
    eq("068", "整数分量打印走 17 位展开", strVec2(Math.fround(1e20)), "100000002004087730000.0");
    eq("068", "舍到 0 的非零值保留负号", strVec2(-4e-7), "-0.0");
    shouldThrow("068", "下标越界", () => vecReadIndex(new GVector2(3, 4), I(2)));
    shouldThrow("068", "一个参数的 Vector2()", () => vector2New([I(1)]));
    shouldThrow("068", "Vector2.NAN 不存在", () => vector2Const("NAN"));
    eq("093", "slerp 是极坐标插值", a("slerp", [vector2(1, 2), F(0.5)]), "(1.902113, 3.077683)");
    eq("093", "slerp 端点是零向量走 lerp", m(0, 0)("slerp", [vector2(1, 0), F(0.5)]), "(0.5, 0.0)");
    eq("093", "slerp 直角给对称结果", m(1, 0)("slerp", [vector2(0, 1), F(0.5)]), "(0.707107, 0.707107)");
    eq("093", "slerp 半圈绕 +90°（负号来自 fround(π/2)）", m(1, 0)("slerp", [vector2(-1, 0), F(0.5)]), "(-0.0, 1.0)");
    eq("093", "slerp 反向的 wrap 必须在 double 里做", m(1, 2)("slerp", [vector2(-1, -2), F(0.5)]), "(-2.0, 1.0)");
    eq("093", "slerp 长度也线性插值", m(2, 0)("slerp", [vector2(0, 3), F(0.25)]), "(2.078729, 0.861038)");
    eq(
      "093",
      "is_normalized 的阈值是 length_squared 上的 1e-3",
      `${m(0.9995, 0)("is_normalized")} ${m(0.9992, 0)("is_normalized")} ${m(0.7071, 0.7071)("is_normalized")} ${m(0, 0)("is_normalized")} ${a("is_normalized")}`,
      "true false true false false",
    );
    eq("093", "is_zero_approx 是逐分量 |v| < 1e-5", `${m(0, 0)("is_zero_approx")} ${m(0.000009, 0)("is_zero_approx")} ${m(0.00001, 0)("is_zero_approx")} ${m(0, -0.000009)("is_zero_approx")}`, "true true false true");
    eq(
      "093",
      "is_equal_approx 是 max(1e-5, 1e-5*|a|)",
      `${m(1, 2)("is_equal_approx", [vector2(1.0000095, 2)])} ${m(1, 2)("is_equal_approx", [vector2(1.00001, 2)])} ${m(3, 4)("is_equal_approx", [vector2(3.000029, 4)])} ${m(3, 4)("is_equal_approx", [vector2(3.000031, 4)])} ${m(0.001, 0)("is_equal_approx", [vector2(0.0010002, 0)])}`,
      "true false true false true",
    );
  });

  it("087 +2 · 写 x 产出新值", async () => {
    const V2 = (x: number, y: number) => vector2(x, y);
    const w = (v: Variant, key: Variant, value: Variant) => vecWrite(v.v as GVector2, key, value, "index");
    const p = (v: Variant, name: string, value: Variant) => writeProp(v, name, value) as Variant;
    const SHOW2 = (r: Variant | null) => (r === null ? "<原地>" : show(r));

    eq("087", "写 x 产出新值", SHOW2(p(V2(1, 2), "x", I(9))), "(9.0, 2.0)");
    eq("087", "写 y", SHOW2(p(V2(1, 2), "y", I(9))), "(1.0, 9.0)");
    eq("087", "下标写 0/1 都认", [SHOW2(w(V2(1, 2), I(0), I(7))), SHOW2(w(V2(1, 2), I(1), I(7)))].join(" "), "(7.0, 2.0) (1.0, 7.0)");
    eq("087", "字符串键 x/y 也认（实测 v[\"y\"] = 5 改的是 y）", SHOW2(w(V2(1, 2), S("y"), I(5))), "(1.0, 5.0)");
    eq("087", "StringName 键同样认", SHOW2(w(V2(1, 2), V.stringName("x"), I(5))), "(5.0, 2.0)");
    eq("087", "int 实参收成 float32", SHOW2(p(V2(1, 2), "x", I(3))), "(3.0, 2.0)");
    eq("087", "写入照旧过 float32", (w(V2(1, 2), I(0), F(0.1)).v as GVector2).x, Math.fround(0.1));
    eq("087", "1e20 落到 float32 的可表示值", show(w(V2(1, 2), I(0), F(1e20))), "(100000002004087730000.0, 2.0)");
    eq("087", "负值向零不是向下取整", show(w(V2(1, 2), I(0), F(-2.5))), "(-2.5, 2.0)");
    {
      const v = V2(1, 2);
      const copy = p(v, "x", I(100)) as Variant;
      eq("087", "写回的新值不影响原值", `${show(v)} ${show(copy)}`, "(1.0, 2.0) (100.0, 2.0)");
    }
    shouldThrow("088", "未知属性名要响", () => p(V2(1, 2), "zz", I(1)));
    shouldThrow("088", "bool 不能写进分量", () => p(V2(1, 2), "x", V.bool(true)));
    shouldThrow("088", "String 不能写进分量", () => p(V2(1, 2), "y", S("s")));
    shouldThrow("088", "Vector2 不能写进分量", () => p(V2(1, 2), "x", V2(1, 2)));
    shouldThrow("088", "null 不能写进分量", () => p(V2(1, 2), "x", V.nil()));
    shouldThrow("088", "下标 2 越界要响", () => w(V2(1, 2), I(2), I(9)));
    shouldThrow("088", "下标 -1 不做尾部折算", () => w(V2(1, 2), I(-1), I(9)));
    shouldThrow("088", "非向量基的属性写要响", () => writeProp(I(1), "x", I(2)));
    shouldThrow("089", "Vector2 == int 报错（不是给 false）", () => valueEq(V2(1, 2), I(3)));
    shouldThrow("089", "反过来也一样", () => valueEq(I(3), V2(1, 2)));
    shouldThrow("089", "Vector2 == String 报错", () => valueEq(V2(1, 2), S("x")));
    shouldThrow("089", "Vector2 == Array 报错", () => valueEq(V2(1, 2), V.array(GArray.of([]))));
    shouldThrow("089", "ops.eq 同样要响", () => ops.eq(V2(1, 2), F(1)));
    eq("089", "跟 null 比仍然是 false", `${valueEq(V2(1, 2), V.nil())}/${valueEq(V.nil(), V2(1, 2))}`, "false/false");
    eq("087", "Vector2 之间按分量比", `${valueEq(V2(1, 2), V2(1.0, 2.0))}/${valueEq(V2(1, 2), V2(1, 3))}`, "true/false");
    eq("087", "读 v[0]", show(vecReadIndex(vector2(1, 2).v as GVector2, I(1))), "2.0");
    eq("087", "读 v[\"x\"]", show(vecReadIndex(vector2(1, 2).v as GVector2, S("x"))), "1.0");
    shouldThrow("087", "读越界下标要响", () => vecReadIndex(vector2(1, 2).v as GVector2, I(2)));
    {
      const arr = V.array(GArray.of([I(1), I(2)]));
      eq("087", "数组下标写是原地改", SHOW2(writeIdx(arr, I(0), I(9))), "<原地>");
      eq("087", "数组那一格真的变了", show(arr), "[9, 2]");
      const dict = new GDict();
      dict.set(S("k"), I(1));
      const dv = V.dict(dict);
      eq("087", "字典同理", SHOW2(writeIdx(dv, S("k"), I(2))), "<原地>");
      eq("087", "字典那一格改了", show(dv), '{ "k": 2 }');
      eq("087", "Vector2 的下标写回报新值", SHOW2(writeIdx(V2(1, 2), I(1), I(8))), "(1.0, 8.0)");
    }
  });
});
