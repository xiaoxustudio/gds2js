/** 内置值类型的 **float 实参在调用边界上折回 `real_t`**（S313 ①），以及 `cubic_interpolate` 统一到引擎那条展开式（S313 ②）
 *  与 `Vector3.move_toward` 出货（§6 第 35 条结清）。
 *  读数：`tmp/probe-edge/{cubicfit.txt,cubic2.mts,v3cubic.mts,afterpatch.mts}` 与 `tmp/probe-mt/{cells.txt,verify.mts}`，语料 300 / 302 逐字节。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { strOf } from "@gds2js/runtime/runtime/builtins";
import { vector2 } from "@gds2js/runtime/runtime/vector2";
import { vector3 as v3 } from "@gds2js/runtime/runtime/vector3";
import { V } from "@gds2js/runtime/runtime/tags";
import type { Variant } from "@gds2js/runtime/runtime/tags";

const F = (n: number): Variant => V.float(n);
const text = (v: Variant): string => strOf(v).v as string;
const call = (recv: Variant, name: string, args: Variant[]): string => text(method(recv, name, args));

describe("runtime · 实参在调用边界折回 real_t 与 cubic 的形状", () => {
  it("1e7 量级的 cubic：实参不折就低一个 ULP", () => {
    const b2 = vector2(10000000.0, 20000001.5);
    eq("302", "V2 的 y 折了实参给 16310002.0", call(b2, "cubic_interpolate", [vector2(0.3, -0.7), vector2(2.5, 2.5), vector2(-1.5, 4.5), F(0.3)]), "(8155000.0, 16310002.0)");
    const b3 = v3(10000000.0, 20000001.5, -3000000.25);
    eq("302", "V3 的 z 同一条", call(b3, "cubic_interpolate", [v3(0.3, -0.7, 2.5), v3(2.5, 2.5, -1.5), v3(-1.5, 4.5, 0.125), F(0.3)]), "(8155000.0, 16310002.0, -2446500)");
  });

  it("cubic 的两个系数按 C++ 从左到右结合，别的分组差 1 个 ULP", () => {
    const s = v3(0.5, 12345.75, -1.25);
    const args = (w: number) => [v3(1.5, -0.5, 2.5), v3(-2.5, 0.25, 1.5), v3(0.125, 3.5, -0.75), F(w)];
    eq("302", "w=0.7 的 y 给 3573.422", call(s, "cubic_interpolate", args(0.7)), "(1.437562, 3573.422, 1.68475)");
    eq("302", "w=0.37 的 y 给 9058.08", call(s, "cubic_interpolate", args(0.37)), "(1.119271, 9058.08, -0.037908)");
    eq("302", "w=0.13 三支", call(s, "cubic_interpolate", args(0.13)), "(0.745857, 11864.74, -1.03083)");
  });

  it("V2 的 cubic 换成同一条展开式之后，中段格子照旧一字一样", () => {
    const q = vector2(2.5, 40021.5);
    const args = (w: number) => [vector2(-0.7, 4.5), vector2(0.3, -0.7), vector2(2.5, 2.5), F(w)];
    eq("302", "w=0.3", call(q, "cubic_interpolate", args(0.3)), "(1.7353, 32638.81)");
    eq("302", "w=0.7", call(q, "cubic_interpolate", args(0.7)), "(-0.0403, 11589.73)");
    eq("302", "小格与控制格", call(vector2(1, 2), "cubic_interpolate", [vector2(3, 4), vector2(5, 6), vector2(7, 8), F(0.5)]), "(1.5, 2.5)");
  });

  it("Vector3.move_toward：与 Vector2 同形，四条分支", () => {
    eq("302", "常规那支（差 1 ULP 的 z 是旧打印口径的假分岔）", call(v3(-4, 8, -16), "move_toward", [v3(1, 1, 1), F(2)]), "(-3.475136, 7.265191, -14.21546)");
    eq("302", "len 不超过 delta 直接落到目标", call(v3(0, 0, 0), "move_toward", [v3(-9, 4, 0.5), F(100)]), "(-9.0, 4.0, 0.5)");
    eq("302", "零长那一格两条分支同值（v 与 to 同点）", call(v3(0, 0, 0), "move_toward", [v3(0, 0, 0), F(2)]), "(0.0, 0.0, 0.0)");
    eq("302", "中段量级的 z", call(v3(1.5, -2.5, 3), "move_toward", [v3(-9, 4, 0.5), F(11)]), "(-7.666956, 3.174782, 0.817391)");
  });
});
