// 4.6.3 实测的角度族与 dB / 幂次 / 步长那一族（语料 253 钉了 96 格读数，本门补语料进不了的：
// 响亮拒的形状、`.call()` 的 arity，以及 `angle_difference` 在 ±π 那一格的翻法）。
// 读数在 `tmp/probe-small-builtins/{n,o,p,q}.log`；式子在 4.3 树 `core/math/math_funcs.h`（rotate_toward / pingpong /
// bezier / cubic_interpolate_angle* / linear_to_db / db_to_linear）、`math_funcs.cpp`（step_decimals 的门槛表）、
// `typedefs.h`（nearest_power_of_2_templated）。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { globalCallable, method } from "@gds2js/runtime/runtime/methods";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { gAngleDifference, gNearestPo2, gPingpong, gRotateToward, gStepDecimals } from "@gds2js/runtime/runtime/builtins";
import { I, S } from "./support/variants";

const tn = (v: Variant): string => String((typeOf(v) as { v: number }).v);
const one = (f: (v: Variant) => Variant, v: Variant): string => {
  try {
    const r = f(v);
    return `${tn(r)}|${show(r)}`;
  } catch (e) {
    return `[${(e as { code: string }).code}]`;
  }
};
const call = (name: string, ...args: Variant[]): string => {
  try {
    const r = method(globalCallable(name), "call", args);
    return `${tn(r)}|${show(r)}`;
  } catch (e) {
    return `[${(e as { code: string }).code}]`;
  }
};
const F = (n: number): Variant => V.float(n);
const PI = Math.PI;

describe("runtime/angle-helpers · rotate_toward / pingpong / nearest_po2 一族", () => {
  it("253 · angle_difference 只在正好 ±π 那一格翻", async () => {
    const pair = (a: Variant, b: Variant): string => one((v) => gAngleDifference(a, v), b);
    eq("253", "π→0 与 0→-π 都给 +π（z89 / z90，引擎那句是 `fmod(2*d, TAU) - d`）", `${pair(F(PI), F(0))}|${pair(F(0), F(-PI))}`, "3|3.14159265358979|3|3.14159265358979");
    eq("253", "0→π 与 -π→0 都给 -π（z91 / z92）", `${pair(F(0), F(PI))}|${pair(F(-PI), F(0))}`, "3|-3.14159265358979|3|-3.14159265358979");
    eq("253", "差 1e-9 就不翻了（q01 / q03：以前那格是拿近似判的，会把 3.14159 也折成 -π）", `${pair(F(0), F(PI - 1e-9))}|${pair(F(0), F(-PI + 1e-9))}`, "3|3.14159265258979|3|-3.14159265258979");
    eq("253", "同角给 0.0（a05）", pair(F(1), F(1)), "3|0.0");
  });

  it("253 · 拒的形状", async () => {
    eq("253", "nearest_po2(inf) 拒：引擎那边是 cvttsd2si 的 UB 读数（po2|inf 给 INT64_MIN），这条式子没量清", one(gNearestPo2, F(Infinity)), "[arg-int]");
    eq("253", "nearest_po2(NaN) 同一条拒", one(gNearestPo2, F(NaN)), "[arg-int]");
    eq("253", "nearest_po2(String) 与 db_to_linear(String) 各走自己那侧的闸", `${one(gNearestPo2, S("3"))}|${call("db_to_linear", S("3"))}`, "[utility-convert]|[arg-float]");
    eq("253", "step_decimals 的 int 结果：inf / nan 那两格是门槛表走完给 0（z46 / z47）", `${one(gStepDecimals, F(Infinity))}|${one(gStepDecimals, F(NaN))}`, "2|0|2|0");
    eq("253", "rotate_toward 少一支实参先撞 arity", call("rotate_toward", F(1), F(2)), "[callable-arity]");
    eq("253", "pingpong 的第三支实参在引擎的 .call 那侧进不去（Expected 2 argument(s)）", call("pingpong", F(7), F(5), I(1)), "[callable-arity]");
    eq("253", "八实参那一族少一支就撞 arity", call("cubic_interpolate_in_time", F(0), F(1), F(10), F(11), F(0.5), F(0), F(0.33)), "[callable-arity]");
  });

  it("253 · 引擎那两个夹法", async () => {
    eq("253", "pingpong 的周期是负的照样折（pp|2.5,-4.0 给 2.5）", one((v) => gPingpong(F(2.5), v), F(-4)), "3|2.5");
    eq("253", "周期为 0 给 0.0（pp|1.5,0.0）", one((v) => gPingpong(F(1.5), v), F(0)), "3|0.0");
    eq("253", "rotate_toward 的 delta 比弧还大就落在目标上（z58 / z62）", `${show(gRotateToward(F(0), F(10), F(3)))}|${show(gRotateToward(F(3), F(-3), F(10)))}`, "-2.56637061435917|3.28318530717959");
  });
});
