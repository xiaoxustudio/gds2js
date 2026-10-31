/** pack 九支的 `hash()`（S540）：引擎实测于 `tmp/d6/s540*.gd` 25 格，逐格对账。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { variantHash } from "@gds2js/runtime/runtime/builtins";
import { V } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { GVector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { GVector3 } from "@gds2js/runtime/runtime/class/vector/vector3";
import { GColor } from "@gds2js/runtime/runtime/color";

const p = (kind: "byte" | "int32" | "int64" | "float32" | "float64" | "string" | "vector2" | "vector3" | "color", items: unknown[]) =>
  V.object(new GBytes(items as never[], kind));
const h = (v: ReturnType<typeof p>) => show(variantHash([v]));

describe("hash pack：字节缓冲 / 元素链 / 空 pack（S540）", () => {
  it("byte：小端 4 字节块 + 尾巴", () => {
    eq("540", "pb [1,2,3]", h(p("byte", [1, 2, 3])), "3028899408");
    eq("540", "pb [1]", h(p("byte", [1])), "2937035090");
    eq("540", "pb [1,2]", h(p("byte", [1, 2])), "1731339993");
    eq("540", "pb [1,2,3,4]", h(p("byte", [1, 2, 3, 4])), "1772116995");
    eq("540", "pb [1,2,3,4,5]", h(p("byte", [1, 2, 3, 4, 5])), "2779245181");
    eq("540", "pb [255,128]", h(p("byte", [255, 128])), "2572795165");
  });
  it("int32 / int64：小端缓冲；空 pack 是 one_64(0)", () => {
    eq("540", "pi32 [1,2,3]", h(p("int32", [1, 2, 3])), "848734407");
    eq("540", "pi64 [1,2,3]", h(p("int64", [1n, 2n, 3n])), "907816823");
    eq("540", "pi64 [-1,2]", h(p("int64", [-1n, 2n])), "2587239176");
    eq("540", "pi32 空", h(p("int32", [])), "546098158");
    eq("540", "pi64 空", h(p("int64", [])), "546098158");
    eq("540", "pbyte 空", h(p("byte", [])), "546098158");
  });
  it("float32 / float64：分量链 + fmix32；空 pack 是 one_real(0.0) 不收尾", () => {
    eq("540", "pf32 [1,2,3] 与 Vector3 同值", h(p("float32", [1, 2, 3])), "2596169709");
    eq("540", "pf32 [0,-0] 归一", h(p("float32", [0, -0])), "516917320");
    eq("540", "pf64 [1,2,3]", h(p("float64", [1, 2, 3])), "3082350617");
    eq("540", "pf64 [0.5,-0.25]", h(p("float64", [0.5, -0.25])), "1130162833");
    eq("540", "pf32 空", h(p("float32", [])), "873697370");
    eq("540", "pf64 空", h(p("float64", [])), "546098158");
  });
  it("NaN 折规范静默 NaN 位型（S542）", () => {
    eq("542", "pf32 [NAN]", h(p("float32", [NaN])), "2084305599");
    eq("542", "pf64 [NAN]", h(p("float64", [NaN])), "241763607");
    eq("542", "pf64 [NAN,0]", h(p("float64", [NaN, 0])), "4208276742");
    eq("542", "-NAN 与 NAN 同值", h(p("float64", [-NaN])), "241763607");
  });
  it("string / vector / color：元素链 + fmix32；空 pack 就是种子", () => {
    eq("540", "ps [a,b]", h(p("string", ["a", "b"])), "3002377273");
    eq("540", "ps [é,a]", h(p("string", ["é", "a"])), "1762703224");
    eq("540", "pv2", h(p("vector2", [new GVector2(1, 2)])), "4195279070");
    eq("540", "pv2 两格含 -0", h(p("vector2", [new GVector2(1, 2), new GVector2(-0, 3)])), "3520751572");
    eq("540", "pv3", h(p("vector3", [new GVector3(1, 2, 3)])), "2596169709");
    eq("540", "pc 红", h(p("color", [new GColor(1, 0, 0, 1)])), "3403565064");
    eq("540", "pc 两格", h(p("color", [new GColor(1, 0, 0, 1), new GColor(0.5, 0.25, 0.125, 0.75)])), "1307413377");
    eq("540", "ps 空", h(p("string", [])), "133200997");
    eq("540", "pv2 空", h(p("vector2", [])), "133200997");
    eq("540", "pv3 空", h(p("vector3", [])), "133200997");
    eq("540", "pc 空", h(p("color", [])), "133200997");
  });
});
