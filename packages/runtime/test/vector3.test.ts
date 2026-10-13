// 由 tools/ops-check.ts 机械搬迁：region 1574-1647。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { ops, sortLess } from "@gds2js/runtime/runtime/ops";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, keyOf, show, elemDefault, valueEq } from "@gds2js/runtime/runtime/values";
import { vector2 } from "@gds2js/runtime/runtime/vector2";
import { GVector3, asVec3, vec3Cmp, vec3ReadIndex, vec3Write, vector3, vector3Const, vector3Method, vector3New } from "@gds2js/runtime/runtime/vector3";
import { isType, typeOf } from "@gds2js/runtime/runtime/patterns";
import { F, I, S } from "./support/variants";

describe("runtime/vector3", () => {
  it("091 +2 · 构造与拷贝", async () => {
    const V3 = (x: number, y: number, z: number) => vector3(x, y, z);
    const m3 = (v: Variant, name: string, ...args: Variant[]) => vector3Method(asVec3(v) as GVector3, name, args);
    const vv = (n: Variant) => show(n);

    eq("091", "构造与拷贝", `${vv(V3(1, 2, 3))}/${vv(vector3New([]))}/${vv(vector3New([V3(1, 2, 3)]))}`, "(1.0, 2.0, 3.0)/(0.0, 0.0, 0.0)/(1.0, 2.0, 3.0)");
    eq("091", "打印是短格式", vv(V3(0.1, 0, 0)), "(0.1, 0.0, 0.0)");
    shouldThrow("091", "单参数值不是构造器（实测 Parse Error）", () => vector3New([F(1.5)]));
    shouldThrow("091", "两参也不行", () => vector3New([F(1), F(2)]));
    eq("091", "x 给 fround 后的真值", vv(vec3ReadIndex(asVec3(V3(0.1, 0, 0)) as GVector3, I(0))), "0.10000000149012");
    eq("091", "读 0/1/2 与 x/y/z 同一路", `${vv(vec3ReadIndex(asVec3(V3(1, 2, 3)) as GVector3, I(2)))}/${vv(vec3ReadIndex(asVec3(V3(1, 2, 3)) as GVector3, S("y")))}`, "3.0/2.0");
    shouldThrow("092", "下标 3 越界要响", () => vec3ReadIndex(asVec3(V3(1, 2, 3)) as GVector3, I(3)));
    shouldThrow("092", "负下标不折算", () => vec3ReadIndex(asVec3(V3(1, 2, 3)) as GVector3, I(-1)));

    eq("091", "加减与标量乘除", `${vv(ops.add(V3(1, 2, 3), V3(0.5, 0, 0)))}/${vv(ops.sub(V3(1, 2, 3), V3(1, 1, 1)))}/${vv(ops.mul(V3(1, 2, 3), F(2.5)))}/${vv(ops.div(V3(2, 3, 4), F(2)))}`, "(1.5, 2.0, 3.0)/(0.0, 1.0, 2.0)/(2.5, 5.0, 7.5)/(1.0, 1.5, 2.0)");
    eq("091", "向量乘除是逐分量", `${vv(ops.mul(V3(2, 3, 4), V3(0.5, 1, 2)))}/${vv(ops.div(V3(2, 3, 4), V3(2, 3, 4)))}/${vv(ops.neg(V3(1, 2, 3)))}`, "(1.0, 3.0, 8.0)/(1.0, 1.0, 1.0)/(-1.0, -2.0, -3.0)");
    shouldThrow("091", "Vector3 + 标量 不接（Godot 那边是解析期报错）", () => ops.add(V3(1, 2, 3), I(1)));
    eq("091", "比较按 x→y→z 字典序", `${ops.lt(V3(1, 2, 3), V3(1, 2, 4)).v}/${ops.lt(V3(1, 3, 0), V3(2, 0, 0)).v}/${ops.lt(V3(0, 1, 9), V3(0, 2, 0)).v}/${ops.gte(V3(1, 2, 3), V3(1, 2, 4)).v}/${vec3Cmp(asVec3(V3(1, 2, 3)) as GVector3, asVec3(V3(1, 2, 3)) as GVector3)}`, "true/true/true/false/0");
    eq("091", "== 是 fround 后的分量比较", `${valueEq(V3(1, 2, 3), V3(1, 2, 3.0000001))}/${valueEq(V3(0.1 + 0.2, 0, 0), V3(0.3, 0, 0))}/${valueEq(V3(1, 2, 3), V3(1, 2, 4))}`, "true/true/false");
    eq("091", "跟 null 比是 false", `${valueEq(V3(1, 2, 3), V.nil())}/${!valueEq(V3(1, 2, 3), V.nil())}`, "false/true");
    shouldThrow("092", "Vector3 == Vector2 要响", () => valueEq(V3(1, 2, 3), vector2(1, 2)));
    shouldThrow("092", "反过来也响", () => valueEq(vector2(1, 2), V3(1, 2, 3)));
    shouldThrow("092", "Vector3 == int 要响（Godot 那边是解析期拦）", () => valueEq(V3(1, 2, 3), I(3)));

    eq("091", "写分量产出新值", `${vv(vec3Write(asVec3(V3(1, 2, 3)) as GVector3, I(2), I(8), "index"))}/${vv(vec3Write(asVec3(V3(1, 2, 3)) as GVector3, S("z"), F(1), "index"))}`, "(1.0, 2.0, 8.0)/(1.0, 2.0, 1.0)");
    shouldThrow("092", "未知属性名要响", () => vec3Write(asVec3(V3(1, 2, 3)) as GVector3, S("zz"), I(8), "prop"));
    shouldThrow("092", "越界下标写要响", () => vec3Write(asVec3(V3(1, 2, 3)) as GVector3, I(3), I(8), "index"));

    eq("091", "静态常量表", `${vv(vector3Const("UP"))}/${vv(vector3Const("DOWN"))}/${vv(vector3Const("FORWARD"))}/${vv(vector3Const("BACK"))}/${vv(vector3Const("LEFT"))}/${vv(vector3Const("INF"))}`, "(0.0, 1.0, 0.0)/(0.0, -1.0, 0.0)/(0.0, 0.0, -1.0)/(0.0, 0.0, 1.0)/(-1.0, 0.0, 0.0)/(inf, inf, inf)");
    shouldThrow("091", "Vector3.MAX 实测不存在", () => vector3Const("MAX"));

    eq("091", "length / length_squared / dot / cross", `${vv(m3(V3(3, 4, 0), "length"))}/${vv(m3(V3(3, 4, 0), "length_squared"))}/${vv(m3(V3(1, 0, 0), "dot", V3(0, 1, 0)))}/${vv(m3(V3(1, 2, 3), "cross", V3(0, 1, 0)))}`, "5.0/25.0/0.0/(-3.0, 0.0, 1.0)");
    eq("091", "归一化与限长", `${vv(m3(V3(3, 4, 0), "normalized"))}/${vv(m3(V3(0, 0, 0), "normalized"))}/${vv(m3(V3(1, 2, 3), "limit_length", F(1)))}/${vv(m3(V3(0.1, 0.2, 0.3), "limit_length", F(10)))}`, "(0.6, 0.8, 0.0)/(0.0, 0.0, 0.0)/(0.267261, 0.534522, 0.801784)/(0.1, 0.2, 0.3)");
    eq("091", "lerp / distance / direction", `${vv(m3(V3(1, 2, 3), "lerp", V3(2, 3, 4), F(0.5)))}/${vv(m3(V3(1, 2, 3), "distance_to", V3(1, 2, 4)))}/${vv(m3(V3(1, 2, 3), "distance_squared_to", V3(1, 2, 4)))}/${vv(m3(V3(1, 2, 3), "direction_to", V3(1, 2, 4)))}`, "(1.5, 2.5, 3.5)/1.0/1.0/(0.0, 0.0, 1.0)");
    eq("091", "abs / sign / floor / ceil / round", `${vv(m3(V3(-1.5, 2, -3), "abs"))}/${vv(m3(V3(-1.5, 0, 3), "sign"))}/${vv(m3(V3(1.7, -1.2, 0.5), "floor"))}/${vv(m3(V3(1.7, -1.2, 0.5), "ceil"))}/${vv(m3(V3(-1.5, -2.5, 3.5), "round"))}`, "(1.5, 2.0, 3.0)/(-1.0, 0.0, 1.0)/(1.0, -2.0, 0.0)/(2.0, -1.0, 1.0)/(-2.0, -3.0, 4.0)");
    eq("091", "snapped 与 snappedf", `${vv(m3(V3(1.2, 2.6, 3.1), "snapped", V3(0.5, 0.5, 0.5)))}/${vv(m3(V3(1.4, 2.6, 3.1), "snappedf", F(1)))}/${vv(m3(V3(1, 2, 3), "snapped", vector3Const("INF")))}`, "(1.0, 2.5, 3.0)/(1.0, 3.0, 3.0)/(nan, nan, nan)");
    eq("091", "clamp / min / max", `${vv(m3(V3(1, 2, 3), "clamp", V3(1.5, 1.5, 1.5), V3(2.5, 2.5, 2.5)))}/${vv(m3(V3(1, 2, 3), "min", V3(2, 1, 5)))}/${vv(m3(V3(1, 2, 3), "max", V3(2, 1, 5)))}`, "(1.5, 2.0, 2.5)/(1.0, 1.0, 3.0)/(2.0, 2.0, 5.0)");
    eq("091", "angle_to 是 atan2(|cross|, dot)", vv(m3(V3(0, 1, 0), "angle_to", V3(1, 0, 0))), "1.57079637050629");
    eq("091", "cubic_interpolate 是 Catmull-Rom", vv(m3(V3(1, 2, 3), "cubic_interpolate", V3(2, 2, 2), V3(3, 3, 3), V3(4, 4, 4), F(0.5))), "(1.25, 1.8125, 2.375)");
    eq("091", "轴下标 X=0 / Y=1 / Z=2", `${vv(m3(V3(1, 2, 3), "min_axis_index"))}${vv(m3(V3(1, 2, 3), "max_axis_index"))}/${vv(m3(V3(5, 3, 4), "min_axis_index"))}${vv(m3(V3(5, 3, 4), "max_axis_index"))}`, "02/10");
    eq(
      "091",
      "is_equal_approx：阈值 max(1e-5, 1e-5*|a|)",
      `${m3(V3(1, 2, 3), "is_equal_approx", V3(1.0000095, 2, 3)).v}/${m3(V3(1, 2, 3), "is_equal_approx", V3(1.00001, 2, 3)).v}/${m3(V3(3, 4, 5), "is_equal_approx", V3(3.000029, 4, 5)).v}/${m3(V3(3, 4, 5), "is_equal_approx", V3(3.000031, 4, 5)).v}/${m3(V3(0.001, 0, 0), "is_equal_approx", V3(0.0010002, 0, 0)).v}`,
      "true/false/true/false/true",
    );
    eq("091", "is_normalized / is_finite", `${m3(V3(1, 1, 1), "is_normalized").v}/${m3(V3(1, 0, 0), "is_normalized").v}/${m3(V3(0.7071067811865475, 0.7071067811865475, 0), "is_normalized").v}/${m3(V3(1e300, 0, 0), "is_finite").v}/${m3(V3(1, 2, 3), "is_finite").v}`, "false/true/true/false/true");

    eq("091", "slide / reflect / bounce / project 与引擎同值（法向 (0,1,0)）", `${vv(m3(V3(1, 2, 3), "slide", V3(0, 1, 0)))}/${vv(m3(V3(1, 2, 3), "reflect", V3(0, 1, 0)))}/${vv(m3(V3(1, 2, 3), "bounce", V3(0, 1, 0)))}/${vv(m3(V3(1, 2, 3), "project", V3(0, 1, 0)))}`, "(1.0, 0.0, 3.0)/(-1.0, 2.0, -3.0)/(1.0, -2.0, 3.0)/(0.0, 2.0, 0.0)");
    eq("091", "法向不是单位向量：slide / reflect / bounce 给零向量（引擎多打一行 core/math 的 ERROR，那一行不属于产物）", `${vv(m3(V3(1, 2, 3), "slide", V3(0, 2, 0)))}/${vv(m3(V3(1, 2, 3), "reflect", V3(1, 1, 1)))}/${vv(m3(V3(1, 2, 3), "bounce", V3(0, 0, 0)))}`, "(0.0, 0.0, 0.0)/(0.0, 0.0, 0.0)/(0.0, 0.0, 0.0)");
    eq("091", "project 不设门槛：零法向给 nan", `${vv(m3(V3(1, 2, 3), "project", V3(0, 0, 0)))}/${vv(m3(V3(1, 2, 3), "project", V3(0, 2, 0)))}`, "(nan, nan, nan)/(0.0, 2.0, 0.0)");
    eq("093", "Vector3.clampf 与 clamp 同值", `${vv(m3(V3(1, 2, 3), "clampf", F(1.5), F(2.5)))}/${vv(m3(V3(3, 2, 1), "clampf", F(1.5), F(2.5)))}/${vv(m3(V3(-1, 2, 5), "clampf", F(0), F(1)))}`, "(1.5, 2.0, 2.5)/(2.5, 2.0, 1.5)/(0.0, 1.0, 1.0)");
    eq("093", "Vector3.is_zero_approx", `${m3(V3(0, 0, 0), "is_zero_approx").v}/${m3(V3(0.000009, 0, 0), "is_zero_approx").v}/${m3(V3(0.00001, 0, 0), "is_zero_approx").v}/${m3(V3(0, 0, -0.00002), "is_zero_approx").v}`, "true/true/false/false");
    eq("093", "Vector3.is_normalized 用 1e-3（用 1e-5 会把 0.9995 判错）", `${m3(V3(0.9995, 0, 0), "is_normalized").v}/${m3(V3(0.9992, 0, 0), "is_normalized").v}/${m3(V3(0.5774, 0.5774, 0.5774), "is_normalized").v}/${m3(V3(1, 1, 0.045), "is_normalized").v}`, "true/false/true/false");
    eq(
      "093",
      "Vector3.slerp：权重留 double、求和后落一次 float32",
      `${vv(m3(V3(3, 4, 0), "slerp", V3(0, 5, 0), F(0.5)))}/${vv(m3(V3(1, 2, 3), "slerp", V3(4, 5, 6), F(0.3)))}/${vv(m3(V3(1, 2, 3), "slerp", V3(-1, -2, -3), F(0.5)))}/${vv(m3(V3(0, 0, 0), "slerp", V3(1, 0, 0), F(0.5)))}`,
      "(1.581139, 4.743417, 0.0)/(1.710528, 2.878237, 4.045945)/(0.0, 0.0, 0.0)/(0.5, 0.0, 0.0)",
    );
    for (const n of ["nlerp", "from_size", "lerpf", "angle_to_signed", "orthogonal", "to_float32", "to_double", "to_int8_array"]) {
      shouldThrow("091", `实测不存在的 Vector3.${n} 要响`, () => m3(V3(1, 2, 3), n));
    }

    eq("091", "typeof 给 9、is 只认 Vector3", `${typeOf(V3(1, 2, 3)).v}/${isType(V3(1, 2, 3), "Vector3").v}/${isType(V3(1, 2, 3), "Vector2").v}`, "9/true/false");
    eq("091", "定型数组的默认值", vv(elemDefault("Vector3")), "(0.0, 0.0, 0.0)");
    eq("091", "Vector3 键与 Vector2 键不同桶", keyOf(V3(1, 2, 3)) === keyOf(vector2(1, 2)), false);
    {
      const g = GArray.of([V3(3, 1, 0), V3(1, 2, 3), V3(2, 0, 0)]);
      g.sort(sortLess);
      eq("091", "sort 走字典序", show(V.array(g)), "[(1.0, 2.0, 3.0), (2.0, 0.0, 0.0), (3.0, 1.0, 0.0)]");
      eq("091", "has / count 按分量身份", `${g.has(V3(3, 1, 0))}/${g.count(V3(1.0, 2.0, 3.0))}`, "true/1");
    }
  });
});
