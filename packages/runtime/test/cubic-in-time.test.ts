/** `cubic_interpolate_in_time`（S315）：均匀偏移那支与 `cubic_interpolate` 同值、非均匀的两端切线形状，
 *  以及**退化时间跨度那一支照旧响亮拒**（引擎在那些形上给有限值，式子还没量出来 —— §6 第 41 条）。
 *  读数：`corpus/cases/303-cubic-in-time/` 与 `tmp/probe-cit/{basis.txt,alpha.txt,dbg2.mts}`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { strOf } from "@gds2js/runtime/runtime/builtins";
import { vector2 } from "@gds2js/runtime/runtime/vector2";
import { vector3 } from "@gds2js/runtime/runtime/vector3";
import type { Variant } from "@gds2js/runtime/runtime/tags";
import { V } from "@gds2js/runtime/runtime/tags";

const F = (n: number): Variant => V.float(n);
const text = (v: Variant): string => strOf(v).v as string;
const call = (recv: Variant, args: Variant[]): string => text(method(recv, "cubic_interpolate_in_time", args));
const errOf = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { message?: string }).message ?? "?";
  }
};

const ARGS = (b: Variant, pre: Variant, post: Variant, w: number, bt: number, pt: number, qt: number): Variant[] => [b, pre, post, F(w), F(bt), F(pt), F(qt)];

describe("runtime · cubic_interpolate_in_time", () => {
  it("均匀偏移那一档与 cubic_interpolate 一字一样", () => {
    const v = vector2(1, 2);
    eq("303", "w=0.3", call(v, ARGS(vector2(3, 4), vector2(5, 6), vector2(7, 8), 0.3, 1, -1, 2)), "(1.096, 2.096)");
    eq("303", "同格的 cubic_interpolate", text(method(v, "cubic_interpolate", [vector2(3, 4), vector2(5, 6), vector2(7, 8), F(0.3)])), "(1.096, 2.096)");
    eq("303", "偏移整体缩放不起作用", call(v, ARGS(vector2(3, 4), vector2(5, 6), vector2(7, 8), 0.3, 2, -2, 4)), "(1.096, 2.096)");
    eq("303", "两个端点", `${call(v, ARGS(vector2(3, 4), vector2(5, 6), vector2(7, 8), 0, 1, -1, 2))}|${call(v, ARGS(vector2(3, 4), vector2(5, 6), vector2(7, 8), 1, 1, -1, 2))}`, "(1.0, 2.0)|(3.0, 4.0)");
  });

  it("非均匀偏移走两端切线那一形（V2 与 V3 同一条）", () => {
    eq("303", "V2 三段不等", call(vector2(1, 2), ARGS(vector2(3, 4), vector2(5, 6), vector2(7, 8), 0.3, 2, -1, 3)), "(0.368, 1.368)");
    eq("303", "V2 外推", call(vector2(1, 2), ARGS(vector2(3, 4), vector2(5.5, 6), vector2(7, 8), -0.4, 1, -3, 2)), "(0.662, 1.629333)");
    eq("303", "V3 中量级", call(vector3(0.5, 12345.5, -1.25), ARGS(vector3(1.5, -0.5, 2.5), vector3(-2.5, 0.25, 1.5), vector3(0.125, 3.5, -0.75), 0.3, 1.25, -1.5, 2.5)), "(0.97504, 9765.019, -0.308193)");
  });

  it("退化跨度：五形全拒，句子是「没量出式子」", () => {
    const b = vector2(3, 4), pre = vector2(5, 6), post = vector2(7, 8);
    eq("303", "pre_time = 0（与自己的 knot 重合）", errOf(() => call(vector2(1, 2), ARGS(b, pre, post, 0.3, 1, 0, 2))), "Vector2.cubic_interpolate_in_time() 的退化时间跨度（某段为零或相邻两段相消）没量出式子");
    eq("303", "b_time = 0（段长为 0）", errOf(() => call(vector2(1, 2), ARGS(b, pre, post, 0.3, 0, -1, 2))), "Vector2.cubic_interpolate_in_time() 的退化时间跨度（某段为零或相邻两段相消）没量出式子");
    eq("303", "post_time = b_time（右段为 0）", errOf(() => call(vector2(1, 2), ARGS(b, pre, post, 0.3, 1, -1, 1))), "Vector2.cubic_interpolate_in_time() 的退化时间跨度（某段为零或相邻两段相消）没量出式子");
    eq("303", "左段与段长相消", errOf(() => call(vector2(1, 2), ARGS(b, pre, post, 0.3, 1, 1, 2))), "Vector2.cubic_interpolate_in_time() 的退化时间跨度（某段为零或相邻两段相消）没量出式子");
    eq("303", "右段与段长相消", errOf(() => call(vector2(1, 2), ARGS(b, pre, post, 0.3, -1, -2, 0))), "Vector2.cubic_interpolate_in_time() 的退化时间跨度（某段为零或相邻两段相消）没量出式子");
    eq("303", "V3 同一条拒", errOf(() => call(vector3(1, 2, 3), ARGS(vector3(4, 5, 6), vector3(7, 8, 9), vector3(10, 11, 12), 0.3, 1, 0, 2))), "Vector3.cubic_interpolate_in_time() 的退化时间跨度（某段为零或相邻两段相消）没量出式子");
  });
});
