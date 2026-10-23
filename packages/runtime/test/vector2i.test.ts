// 由 tools/ops-check.ts 机械搬迁：region 1649-1706, 2246-2253。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { ops, sortLess } from "@gds2js/runtime/runtime/ops";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, keyOf, show, elemDefault, valueEq } from "@gds2js/runtime/runtime/values";
import { asVec2, toVec2, vector2, vector2New } from "@gds2js/runtime/runtime/vector2";
import { vector3 } from "@gds2js/runtime/runtime/vector3";
import { isType, typeOf } from "@gds2js/runtime/runtime/patterns";
import { GVector2i, asVec2i, vec2iReadIndex, vec2iWrite, vector2i, vector2iConst, vector2iMethod, vector2iNew } from "@gds2js/runtime/runtime/vector2i";
import { F, I, S } from "./support/variants";

describe("runtime/vector2i", () => {
  it("094 +1 · 构造、拷贝与从 Vector2 升级", async () => {
    const Z = (x: number | bigint, y: number | bigint) => vector2i(x, y);
    const zm = (v: Variant, name: string, ...args: Variant[]) => vector2iMethod(asVec2i(v) as GVector2i, name, args);
    const zs = (n: Variant) => show(n);

    eq("094", "构造、拷贝与从 Vector2 升级", `${zs(vector2iNew([]))}/${zs(Z(-1.7, -2.2))}/${zs(vector2iNew([Z(1, 2)]))}/${zs(vector2iNew([vector2(1.7, 2.2)]))}`, "(0, 0)/(-1, -2)/(1, 2)/(1, 2)");
    eq("094", "Vector2 也能吃 Vector2i", zs(vector2New([Z(1, 2)])), "(1.0, 2.0)");
    eq("094", "打印是整数、分量读出来是 int", `${zs(Z(1, 2))}/${zs(vec2iReadIndex(asVec2i(Z(1, 2)) as GVector2i, S("y")))}`, "(1, 2)/2");
    shouldThrow("095", "下标 5 越界要响", () => vec2iReadIndex(asVec2i(Z(1, 2)) as GVector2i, I(5)));
    shouldThrow("095", "负下标不折算", () => vec2iReadIndex(asVec2i(Z(1, 2)) as GVector2i, I(-1)));
    shouldThrow("095", "未知键要响", () => vec2iReadIndex(asVec2i(Z(1, 2)) as GVector2i, S("z")));
    shouldThrow("095", "写 bool 要响", () => vec2iWrite(asVec2i(Z(1, 2)) as GVector2i, S("x"), V.bool(true), "prop"));

    eq("094", "写入向零截断、超界回绕", `${zs(vec2iWrite(asVec2i(Z(1, 2)) as GVector2i, S("x"), F(2.7), "prop"))}/${zs(vec2iWrite(asVec2i(Z(1, 2)) as GVector2i, I(1), F(-0.9), "index"))}/${zs(vec2iWrite(asVec2i(Z(1, 2)) as GVector2i, S("x"), I(2147483648), "prop"))}`, "(2, 2)/(1, 0)/(-2147483648, 2)");
    eq("094", "int64 载荷也要回绕", zs(vec2iWrite(asVec2i(Z(1, 2)) as GVector2i, S("x"), I(9007199254740993n), "prop")), "(1, 2)");

    eq("094", "加减乘逐分量且回绕 int32", `${zs(ops.add(Z(2147483647, 0), Z(1, 0)))}/${zs(ops.sub(Z(-2147483648, 5), Z(1, 0)))}/${zs(ops.mul(Z(2147483647, 0), I(2)))}/${zs(ops.neg(Z(-2147483648, 0)))}`, "(-2147483648, 0)/(2147483647, 5)/(-2, 0)/(-2147483648, 0)");
    eq("094", "除与模向零截断、符号跟被除数", `${zs(ops.div(Z(7, -7), Z(2, 2)))}/${zs(ops.mod(Z(-7, 7), Z(2, -2), true))}/${zs(ops.div(Z(1, 2), Z(2, 2)))}/${zs(ops.mod(Z(7, 7), I(2), true))}`, "(3, -3)/(-1, 1)/(0, 1)/(1, 1)");
    eq("094", "掺 float 标量升级成 Vector2", `${zs(ops.mul(Z(6, 6), F(0.5)))}/${zs(ops.div(Z(6, 6), F(4.0)))}/${show(ops.mul(Z(6, 6), F(0.5)))}`, "(3.0, 3.0)/(1.5, 1.5)/(3.0, 3.0)");
    shouldThrow("095", "Vector2i / 0 要响", () => ops.div(Z(7, 7), I(0)));
    shouldThrow("095", "Vector2i % 0 要响", () => ops.mod(Z(7, 7), I(0), true));
    shouldThrow("094", "Vector2i + 标量不接（实测解析期报错）", () => ops.add(Z(1, 2), I(1)));
    shouldThrow("094", "Vector2i + Vector2 不接（实测解析期报错）", () => ops.add(Z(1, 2), vector2(1, 1)));
    eq("094", "比较是字典序", `${ops.lt(Z(1, 2), Z(1, 3)).v}/${ops.lt(Z(1, 2), Z(0, 9)).v}/${ops.gt(Z(1, 2), Z(0, 9)).v}/${ops.lte(Z(1, 2), Z(1, 2)).v}`, "true/false/true/true");
    eq("094", "== 按分量、实参先截断", `${valueEq(Z(1, 2), Z(1.0, 2.0))}/${valueEq(Z(1, 2), Z(1.7, 2))}/${valueEq(Z(1, 2), Z(1, 3))}`, "true/true/false");
    eq("094", "跟 null 比是 false、跟 Vector2 混比要响", `${valueEq(Z(1, 2), V.nil())}/${!valueEq(Z(1, 2), V.nil())}`, "false/true");
    shouldThrow("094", "Vector2i == Vector2 要响", () => valueEq(Z(1, 2), vector2(1, 2)));
    shouldThrow("094", "Vector2i == int 要响", () => valueEq(Z(1, 2), I(1)));

    eq("094", "length 是 double、length_squared 走精确 int64", `${zs(zm(Z(3, -4), "length"))}/${zs(zm(Z(2147483647, 1), "length_squared"))}/${zs(zm(Z(3, -4), "distance_squared_to", Z(0, 0)))}/${zs(zm(Z(7, 3), "distance_squared_to", Z(0, 0)))}`, "5.0/4611686014132420610/25/58");
    eq("094", "aspect 是 double 除法", `${zs(zm(Z(3, 4), "aspect"))}/${zs(zm(Z(0, 4), "aspect"))}/${zs(zm(Z(3, 0), "aspect"))}/${zs(zm(Z(0, 0), "aspect"))}`, "0.75/0.0/inf/nan");
    eq("094", "abs / sign / min / max / clamp", `${zs(zm(Z(3, -4), "abs"))}/${zs(zm(Z(3, -4), "sign"))}/${zs(zm(Z(3, -4), "min", Z(1, 9)))}/${zs(zm(Z(3, -4), "max", Z(1, 9)))}/${zs(zm(Z(7, 3), "clamp", Z(1, 1), Z(4, 4)))}`, "(3, 4)/(1, -1)/(1, -4)/(3, 9)/(4, 3)");
    eq("094", "MIN 的 abs 与负号都回绕", `${zs(zm(Z(-2147483648, 0), "abs"))}/${zs(zm(Z(-2147483648, 0), "sign"))}`, "(-2147483648, 0)/(-1, 0)");
    eq("094", "snapped 与 step 0", `${zs(zm(Z(7, 3), "snapped", Z(2, 2)))}/${zs(zm(Z(-7, 3), "snapped", Z(2, 2)))}/${zs(zm(Z(-7, 3), "snapped", Z(0, 1)))}`, "(8, 4)/(-6, 4)/(-7, 3)");
    eq("094", "distance_to / 轴下标", `${zs(zm(Z(7, 3), "distance_to", Z(0, 0)))}/${zs(zm(Z(7, 3), "min_axis_index"))}${zs(zm(Z(7, 3), "max_axis_index"))}`, "7.61577310586391/10");
    eq("094", "常量表含 MAX/MIN、没有 INF", `${zs(vector2iConst("ONE"))}/${zs(vector2iConst("UP"))}/${zs(vector2iConst("DOWN"))}/${zs(vector2iConst("MAX"))}/${zs(vector2iConst("MIN"))}`, "(1, 1)/(0, -1)/(0, 1)/(2147483647, 2147483647)/(-2147483648, -2147483648)");
    shouldThrow("094", "Vector2i.INF 实测不存在", () => vector2iConst("INF"));

    for (const n of ["is_normalized", "is_equal_approx", "normalized", "direction_to", "move_toward", "floor", "ceil", "round", "clampf", "snappedf", "ceildiv", "floordiv", "posmod", "signwrapping"]) {
      shouldThrow("094", `Vector2i.${n}() 实测不存在要响`, () => zm(Z(1, 2), n));
    }

    eq("094", "typeof 给 6、is 只认 Vector2i", `${typeOf(Z(1, 2)).v}/${isType(Z(1, 2), "Vector2i").v}/${isType(Z(1, 2), "Vector2").v}`, "6/true/false");
    eq("094", "定型数组默认值是 (0, 0)", zs(elemDefault("Vector2i")), "(0, 0)");
    eq("094", "Vector2i 键与 Vector2 / Vector3 键都不同桶", keyOf(Z(1, 2)) === keyOf(vector2(1, 2)) || keyOf(Z(1, 2)) === keyOf(vector3(1, 2, 3)), false);
    {
      const g = GArray.of([Z(3, 1), Z(1, 2), Z(3, 0)]);
      g.sort(sortLess);
      eq("094", "sort 走字典序", show(V.array(g)), "[(1, 2), (3, 0), (3, 1)]");
      eq("094", "has / count 按分量身份", `${g.has(Z(1, 2))}/${g.count(Z(1.0, 2.0))}`, "true/1");
    }
    {
      const gd = new GDict();
      gd.set(Z(1, 2), I(1));
      gd.set(Z(1.7, 2.2), I(2));
      eq("094", "截断后是同一个键（构造即截断）", `${gd.size()} ${show(V.dict(gd))}`, "1 { (1, 2): 2 }");
    }
  });

  it("step58 · Vector2i 升成 Vector2", async () => {
    eq("step58", "Vector2i 升成 Vector2", show(toVec2(vector2i(1, 2))), "(1.0, 2.0)");
    const srcV = vector2(1.5, 2.5);
    const dstV = toVec2(srcV);
    eq("step58", "Vector2 进 Vector2 槽同值", show(dstV), "(1.5, 2.5)");
    eq("step58", "而且是拷贝（不共享实例）", asVec2(dstV) === asVec2(srcV), false);
    shouldThrow("step58", "int 进 Vector2 槽响亮报缺", () => toVec2(I(5)));
  });
});
