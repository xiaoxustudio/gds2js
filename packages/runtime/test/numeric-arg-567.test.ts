/** clamp(auto) 的「目标跟 x 走」与 max/min 变参族的坏型文案（S567），读数 `tmp/d6/s567.gd` 20 格。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { gClamp, gMax, gMin } from "@gds2js/runtime/runtime/builtins";
import { V } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { GArray } from "@gds2js/runtime/runtime/values";
import { GVector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { GVector2i } from "@gds2js/runtime/runtime/class/vector/vector2i";
import { GVector3 } from "@gds2js/runtime/runtime/class/vector/vector3";
import { I, S } from "./support/variants";

const F = (n: number) => V.float(n);
const v2 = (x: number, y: number) => V.object(new GVector2(x, y));
const v2i = (x: number, y: number) => V.object(new GVector2i(x, y));
const v3 = (x: number, y: number, z: number) => V.object(new GVector3(x, y, z));
const arr = () => V.array(GArray.of([I(1)]));
const err = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { message?: string }).message ?? "?";
  }
};
const conv = (fn: string, n: number, src: string, target: string) =>
  `Invalid type in utility function "${fn}()". Cannot convert argument ${n} from ${src} to ${target}.`;

describe("clamp(auto) 的目标型跟 x 走（S567）", () => {
  it("String / int / float / Array / bool / 向量互转 12 格", () => {
    eq("567", "x String", err(() => gClamp(S("a"), I(1), I(1))), conv("clamp", 2, "int", "String"));
    eq("567", "int + String lo", err(() => gClamp(I(1), S("a"), I(1))), conv("clamp", 2, "String", "int"));
    eq("567", "int + String hi", err(() => gClamp(I(1), I(1), S("a"))), conv("clamp", 3, "String", "int"));
    eq("567", "float + String lo", err(() => gClamp(F(1.5), S("a"), F(1))), conv("clamp", 2, "String", "float"));
    eq("567", "float + String hi", err(() => gClamp(F(1.5), F(1), S("a"))), conv("clamp", 3, "String", "float"));
    eq("567", "Array x", err(() => gClamp(arr(), I(1), I(1))), conv("clamp", 2, "int", "Array"));
    eq("567", "V2 + int lo", err(() => gClamp(v2(1, 2), I(1), v2(1, 1))), conv("clamp", 2, "int", "Vector2"));
    eq("567", "V2 + V2i lo", err(() => gClamp(v2(1, 2), v2i(1, 2), v2(1, 1))), conv("clamp", 2, "Vector2i", "Vector2"));
    eq("567", "V2 + V3 hi", err(() => gClamp(v2(1, 2), v2(1, 1), v3(1, 1, 1))), conv("clamp", 3, "Vector3", "Vector2"));
    eq("567", "bool x + int lo", err(() => gClamp(V.bool(true), I(1), I(1))), conv("clamp", 2, "int", "bool"));
    eq("567", "int x + bool lo", err(() => gClamp(I(1), V.bool(true), I(1))), conv("clamp", 2, "bool", "int"));
    eq("567", "V2i + V2 lo", err(() => gClamp(v2i(1, 2), v2(1, 2), v2i(1, 1))), conv("clamp", 2, "Vector2", "Vector2i"));
  });
  it("合法形回归", () => {
    eq("567", "clamp(5,1,3)", show(gClamp(I(5), I(1), I(3))), "3");
    eq("567", "clamp(1.5,1,2)", show(gClamp(F(1.5), F(1), F(2))), "1.5");
    eq("567", "clamp(V2)", show(gClamp(v2(1, -5), v2(0, 0), v2(2, 2))), "(1.0, -5.0)");
    eq("567", "clamp(bool 真值表)", show(gClamp(V.bool(false), V.bool(true), V.bool(false))), "false");
  });
});

describe("max / min 变参族（S567）", () => {
  it("逐位报 argument N from <源型> to float", () => {
    eq("567", "max(String,int)", err(() => gMax(S("a"), I(1))), conv("max", 1, "String", "float"));
    eq("567", "max(int,String)", err(() => gMax(I(1), S("a"))), conv("max", 2, "String", "float"));
    eq("567", "max(int,int,String)", err(() => gMax(I(1), I(2), S("a"))), conv("max", 3, "String", "float"));
    eq("567", "min(String,int)", err(() => gMin(S("a"), I(1))), conv("min", 1, "String", "float"));
    eq("567", "min(int,String)", err(() => gMin(I(1), S("a"))), conv("min", 2, "String", "float"));
    eq("567", "max(V2,int)", err(() => gMax(v2(1, 2), I(1))), conv("max", 1, "Vector2", "float"));
    eq("567", "max(int,V2)", err(() => gMax(I(1), v2(1, 2))), conv("max", 2, "Vector2", "float"));
    eq("567", "max(Array,int)", err(() => gMax(arr(), I(1))), conv("max", 1, "Array", "float"));
  });
  it("合法形回归", () => {
    eq("567", "max(1,2,3)", show(gMax(I(1), I(2), I(3))), "3");
    eq("567", "min(1.5,1)", show(gMin(F(1.5), I(1))), "1");
  });
});
