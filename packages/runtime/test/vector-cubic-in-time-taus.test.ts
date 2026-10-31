/**
 * `Vector2 / Vector3.cubic_interpolate_in_time` 的**退化时间跨度**那一支（S354）：形参是
 * `(b, pre, post, weight, b_time, pre_time, post_time)` 七位，自己那一端固定在 0，于是
 * `Δ0 = -pre_time`、`Δ1 = b_time`、`Δ2 = post_time - b_time`。引擎是 Barry-Goldman 的三层割线，
 * 每步 lerp 的权重在跨度退化时换成钉死的常数（`pre_time==0 → 0`、`b_time==0 → 0.5`、`post_time-b_time==0 → 1`、
 * `b_time-pre_time==0 → 0`、`post_time==0 → 1`、收尾 `b_time==0 → 0.5`），所以那些形给的都是有限值而不是 nan。
 * 读数 `tmp/probe-argtype/{cubtau,cubtau2}.txt`（尺 `tmp/probe-argtype/{fold15,fold16,check-cubtau}.mts`，逐格对账 74 合 / 0 不合）；
 * 点全取互不相同的，全等点上任何式子都给同一个值、判不出式子。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { strOf } from "@gds2js/runtime/runtime/builtins";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { vector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { vector3 } from "@gds2js/runtime/runtime/class/vector/vector3";

const F = (n: number): Variant => V.float(n);
const call = (recv: Variant, args: Variant[]): string => strOf(method(recv, "cubic_interpolate_in_time", args)).v as string;

describe("runtime · cubic_interpolate_in_time 的退化跨度", () => {
  it("V2 正常 N", () => {
    eq("357", `V2 正常 N w=0`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0), F(1), F(-1), F(3)]), "(1.0, 2.0)");
    eq("357", `V2 正常 N w=0.25`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.25), F(1), F(-1), F(3)]), "(1.757813, 3.28125)");
    eq("357", `V2 正常 N w=0.5`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.5), F(1), F(-1), F(3)]), "(2.520833, 5.041667)");
    eq("357", `V2 正常 N w=0.75`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.75), F(1), F(-1), F(3)]), "(3.273438, 6.78125)");
    eq("357", `V2 正常 N w=1`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(1), F(1), F(-1), F(3)]), "(4.0, 8.0)");
  });
  it("V2 Δ0=0（pre_time 与自己重合）", () => {
    eq("357", `V2 Δ0=0（pre_time 与自己重合） w=0`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0), F(1), F(0), F(3)]), "(-2.0, 1.0)");
    eq("357", `V2 Δ0=0（pre_time 与自己重合） w=0.25`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.25), F(1), F(0), F(3)]), "(-0.351563, 2.226563)");
    eq("357", `V2 Δ0=0（pre_time 与自己重合） w=0.5`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.5), F(1), F(0), F(3)]), "(1.395833, 4.354167)");
    eq("357", `V2 Δ0=0（pre_time 与自己重合） w=0.75`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.75), F(1), F(0), F(3)]), "(2.945313, 6.554688)");
    eq("357", `V2 Δ0=0（pre_time 与自己重合） w=1`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(1), F(1), F(0), F(3)]), "(4.0, 8.0)");
  });
  it("V2 Δ1=0（b_time 为零）", () => {
    eq("357", `V2 Δ1=0（b_time 为零） w=0`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0), F(0), F(-1), F(2)]), "(2.5, 5.0)");
    eq("357", `V2 Δ1=0（b_time 为零） w=0.25`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.25), F(0), F(-1), F(2)]), "(2.5, 5.0)");
    eq("357", `V2 Δ1=0（b_time 为零） w=0.5`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.5), F(0), F(-1), F(2)]), "(2.5, 5.0)");
    eq("357", `V2 Δ1=0（b_time 为零） w=0.75`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.75), F(0), F(-1), F(2)]), "(2.5, 5.0)");
    eq("357", `V2 Δ1=0（b_time 为零） w=1`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(1), F(0), F(-1), F(2)]), "(2.5, 5.0)");
  });
  it("V2 Δ2=0（post_time 与 b_time 重合）", () => {
    eq("357", `V2 Δ2=0（post_time 与 b_time 重合） w=0`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0), F(1), F(-1), F(1)]), "(1.0, 2.0)");
    eq("357", `V2 Δ2=0（post_time 与 b_time 重合） w=0.25`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.25), F(1), F(-1), F(1)]), "(2.203125, 3.117188)");
    eq("357", `V2 Δ2=0（post_time 与 b_time 重合） w=0.5`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.5), F(1), F(-1), F(1)]), "(4.125, 4.1875)");
    eq("357", `V2 Δ2=0（post_time 与 b_time 重合） w=0.75`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.75), F(1), F(-1), F(1)]), "(6.484375, 4.414063)");
    eq("357", `V2 Δ2=0（post_time 与 b_time 重合） w=1`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(1), F(1), F(-1), F(1)]), "(9.0, 3.0)");
  });
  it("V2 1+a=0（Δ0+Δ1=0，pre_time=b_time）", () => {
    eq("357", `V2 1+a=0（Δ0+Δ1=0，pre_time=b_time） w=0`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0), F(1), F(1), F(3)]), "(1.0, 2.0)");
    eq("357", `V2 1+a=0（Δ0+Δ1=0，pre_time=b_time） w=0.25`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.25), F(1), F(1), F(3)]), "(0.632813, 2.320313)");
    eq("357", `V2 1+a=0（Δ0+Δ1=0，pre_time=b_time） w=0.5`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.5), F(1), F(1), F(3)]), "(1.020833, 3.604167)");
    eq("357", `V2 1+a=0（Δ0+Δ1=0，pre_time=b_time） w=0.75`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.75), F(1), F(1), F(3)]), "(2.148438, 5.585938)");
    eq("357", `V2 1+a=0（Δ0+Δ1=0，pre_time=b_time） w=1`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(1), F(1), F(1), F(3)]), "(4.0, 8.0)");
  });
  it("V2 1+c=0（Δ1+Δ2=0，post_time=0）", () => {
    eq("357", `V2 1+c=0（Δ1+Δ2=0，post_time=0） w=0`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0), F(1), F(-1), F(0)]), "(1.0, 2.0)");
    eq("357", `V2 1+c=0（Δ1+Δ2=0，post_time=0） w=0.25`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.25), F(1), F(-1), F(0)]), "(3.25, 3.335938)");
    eq("357", `V2 1+c=0（Δ1+Δ2=0，post_time=0） w=0.5`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.5), F(1), F(-1), F(0)]), "(4.5, 4.9375)");
    eq("357", `V2 1+c=0（Δ1+Δ2=0，post_time=0） w=0.75`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.75), F(1), F(-1), F(0)]), "(4.75, 6.570313)");
    eq("357", `V2 1+c=0（Δ1+Δ2=0，post_time=0） w=1`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(1), F(1), F(-1), F(0)]), "(4.0, 8.0)");
  });
  it("V2 三位全 0", () => {
    eq("357", `V2 三位全 0 w=0`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0), F(0), F(0), F(0)]), "(3.5, 2.0)");
    eq("357", `V2 三位全 0 w=0.25`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.25), F(0), F(0), F(0)]), "(3.5, 2.0)");
    eq("357", `V2 三位全 0 w=0.5`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.5), F(0), F(0), F(0)]), "(3.5, 2.0)");
    eq("357", `V2 三位全 0 w=0.75`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.75), F(0), F(0), F(0)]), "(3.5, 2.0)");
    eq("357", `V2 三位全 0 w=1`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(1), F(0), F(0), F(0)]), "(3.5, 2.0)");
  });
  it("V2 三位全 1", () => {
    eq("357", `V2 三位全 1 w=0`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0), F(1), F(1), F(1)]), "(1.0, 2.0)");
    eq("357", `V2 三位全 1 w=0.25`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.25), F(1), F(1), F(1)]), "(1.078125, 2.15625)");
    eq("357", `V2 三位全 1 w=0.5`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.5), F(1), F(1), F(1)]), "(2.625, 2.75)");
    eq("357", `V2 三位全 1 w=0.75`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.75), F(1), F(1), F(1)]), "(5.359375, 3.21875)");
    eq("357", `V2 三位全 1 w=1`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(1), F(1), F(1), F(1)]), "(9.0, 3.0)");
  });
  it("V2 post_time 在 b_time 之前", () => {
    eq("357", `V2 post_time 在 b_time 之前 w=0`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0), F(1), F(-1), F(-2)]), "(1.0, 2.0)");
    eq("357", `V2 post_time 在 b_time 之前 w=0.25`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.25), F(1), F(-1), F(-2)]), "(1.640625, 3.046875)");
    eq("357", `V2 post_time 在 b_time 之前 w=0.5`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.5), F(1), F(-1), F(-2)]), "(2.208333, 4.416667)");
    eq("357", `V2 post_time 在 b_time 之前 w=0.75`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(0.75), F(1), F(-1), F(-2)]), "(2.921875, 6.078125)");
    eq("357", `V2 post_time 在 b_time 之前 w=1`, call(vector2(1, 2), [vector2(4, 8), vector2(-2, 1), vector2(9, 3), F(1), F(1), F(-1), F(-2)]), "(4.0, 8.0)");
  });
  it("V3 正常 N", () => {
    eq("357", `V3 正常 N w=0.25`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.25), F(1), F(-1), F(3)]), "(1.757813, 3.28125, 3.59375)");
    eq("357", `V3 正常 N w=0.5`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.5), F(1), F(-1), F(3)]), "(2.520833, 5.041667, 4.125)");
    eq("357", `V3 正常 N w=0.75`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.75), F(1), F(-1), F(3)]), "(3.273438, 6.78125, 4.59375)");
  });
  it("V3 Δ0=0（pre_time 与自己重合）", () => {
    eq("357", `V3 Δ0=0（pre_time 与自己重合） w=0.25`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.25), F(1), F(0), F(3)]), "(-0.351563, 2.226563, 1.554688)");
    eq("357", `V3 Δ0=0（pre_time 与自己重合） w=0.5`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.5), F(1), F(0), F(3)]), "(1.395833, 4.354167, 3.0625)");
    eq("357", `V3 Δ0=0（pre_time 与自己重合） w=0.75`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.75), F(1), F(0), F(3)]), "(2.945313, 6.554688, 4.289063)");
  });
  it("V3 Δ1=0（b_time 为零）", () => {
    eq("357", `V3 Δ1=0（b_time 为零） w=0.25`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.25), F(0), F(-1), F(2)]), "(2.5, 5.0, 4.0)");
    eq("357", `V3 Δ1=0（b_time 为零） w=0.5`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.5), F(0), F(-1), F(2)]), "(2.5, 5.0, 4.0)");
    eq("357", `V3 Δ1=0（b_time 为零） w=0.75`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.75), F(0), F(-1), F(2)]), "(2.5, 5.0, 4.0)");
  });
  it("V3 Δ2=0（post_time 与 b_time 重合）", () => {
    eq("357", `V3 Δ2=0（post_time 与 b_time 重合） w=0.25`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.25), F(1), F(-1), F(1)]), "(2.203125, 3.117188, 3.726563)");
    eq("357", `V3 Δ2=0（post_time 与 b_time 重合） w=0.5`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.5), F(1), F(-1), F(1)]), "(4.125, 4.1875, 4.5625)");
    eq("357", `V3 Δ2=0（post_time 与 b_time 重合） w=0.75`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.75), F(1), F(-1), F(1)]), "(6.484375, 4.414063, 5.367188)");
  });
  it("V3 1+a=0（Δ0+Δ1=0，pre_time=b_time）", () => {
    eq("357", `V3 1+a=0（Δ0+Δ1=0，pre_time=b_time） w=0.25`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.25), F(1), F(1), F(3)]), "(0.632813, 2.320313, 2.585938)");
    eq("357", `V3 1+a=0（Δ0+Δ1=0，pre_time=b_time） w=0.5`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.5), F(1), F(1), F(3)]), "(1.020833, 3.604167, 2.8125)");
    eq("357", `V3 1+a=0（Δ0+Δ1=0，pre_time=b_time） w=0.75`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.75), F(1), F(1), F(3)]), "(2.148438, 5.585938, 3.632813)");
  });
  it("V3 1+c=0（Δ1+Δ2=0，post_time=0）", () => {
    eq("357", `V3 1+c=0（Δ1+Δ2=0，post_time=0） w=0.25`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.25), F(1), F(-1), F(0)]), "(3.25, 3.335938, 4.132813)");
    eq("357", `V3 1+c=0（Δ1+Δ2=0，post_time=0） w=0.5`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.5), F(1), F(-1), F(0)]), "(4.5, 4.9375, 4.8125)");
    eq("357", `V3 1+c=0（Δ1+Δ2=0，post_time=0） w=0.75`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.75), F(1), F(-1), F(0)]), "(4.75, 6.570313, 5.085938)");
  });
  it("V3 三位全 0", () => {
    eq("357", `V3 三位全 0 w=0.25`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.25), F(0), F(0), F(0)]), "(3.5, 2.0, 3.0)");
    eq("357", `V3 三位全 0 w=0.5`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.5), F(0), F(0), F(0)]), "(3.5, 2.0, 3.0)");
    eq("357", `V3 三位全 0 w=0.75`, call(vector3(1, 2, 3), [vector3(4, 8, 5), vector3(-2, 1, 0), vector3(9, 3, 6), F(0.75), F(0), F(0), F(0)]), "(3.5, 2.0, 3.0)");
  });
  it("旧门那八格", () => {
    eq("357", `Vector2(3, 4), Vector2(5, 6), Vector2(7, 8) 各形`, call(vector2(1, 2), [vector2(3, 4), vector2(5, 6), vector2(7, 8), F(0.3), F(1), F(0), F(2)]), "(3.203, 4.203)");
    eq("357", `Vector2(3, 4), Vector2(5, 6), Vector2(7, 8) 各形`, call(vector2(1, 2), [vector2(3, 4), vector2(5, 6), vector2(7, 8), F(0.3), F(0), F(-1), F(2)]), "(2.0, 3.0)");
    eq("357", `Vector2(3, 4), Vector2(5, 6), Vector2(7, 8) 各形`, call(vector2(1, 2), [vector2(3, 4), vector2(5, 6), vector2(7, 8), F(0.3), F(1), F(-1), F(1)]), "(1.645, 2.645)");
    eq("357", `Vector2(3, 4), Vector2(5, 6), Vector2(7, 8) 各形`, call(vector2(1, 2), [vector2(3, 4), vector2(5, 6), vector2(7, 8), F(0.3), F(1), F(1), F(2)]), "(1.957, 2.957)");
    eq("357", `Vector2(3, 4), Vector2(5, 6), Vector2(7, 8) 各形`, call(vector2(1, 2), [vector2(3, 4), vector2(5, 6), vector2(7, 8), F(0.3), F(-1), F(-2), F(0)]), "(2.86, 3.86)");
    eq("357", `Vector3(4, 5, 6), Vector3(7, 8, 9), Vector3(10, 11, 12) 各形`, call(vector3(1, 2, 3), [vector3(4, 5, 6), vector3(7, 8, 9), vector3(10, 11, 12), F(0.3), F(1), F(0), F(2)]), "(4.3045, 5.3045, 6.3045)");
    eq("357", `Vector2(3, 4), Vector2(5, 6), Vector2(7, 8) 各形`, call(vector2(1, 2), [vector2(3, 4), vector2(5, 6), vector2(7, 8), F(0.3), F(0), F(0), F(0)]), "(6.0, 7.0)");
    eq("357", `Vector2(3, 4), Vector2(5, 6), Vector2(7, 8) 各形`, call(vector2(1, 2), [vector2(3, 4), vector2(5, 6), vector2(7, 8), F(0.3), F(1), F(1), F(1)]), "(2.506, 3.506)");
  });
});
