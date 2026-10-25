/** 谓词族 / max-min bool / clamp 互转 / len / char 的引擎文案与值（S568），读数 `tmp/d6/s568*.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import {
  gIsEqualApprox, gIsZeroApprox, gIsFinite, gIsNan, gIsInf, gMax, gMin, gClamp, lengthOf,
} from "@gds2js/runtime/runtime/builtins";
import { nullCallable } from "@gds2js/runtime/runtime/object";
import { Signal } from "@gds2js/runtime/runtime/signal";
import { V } from "@gds2js/runtime/runtime/tags";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { GVector2 } from "@gds2js/runtime/runtime/vector2";
import { GDict, nodePathCtor, show} from "@gds2js/runtime/runtime/values";
import { stringChr } from "@gds2js/runtime/runtime/string-ops";
import { I, S } from "./support/variants";

const F = (n: number) => V.float(n);
const err = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { message?: string }).message ?? "?";
  }
};
const conv = (fn: string, n: number, src: string) =>
  `Invalid type in utility function "${fn}()". Cannot convert argument ${n} from ${src} to float.`;

describe("谓词族 / max-min bool / clamp 互转（S568）", () => {
  it("is_* 逐位的引擎转换句", () => {
    eq("568", "is_equal_approx 1/2", `${err(() => gIsEqualApprox(S("a"), I(1)))}|${err(() => gIsEqualApprox(I(1), S("a")))}`, `${conv("is_equal_approx", 1, "String")}|${conv("is_equal_approx", 2, "String")}`);
    eq("568", "四支单参", [err(() => gIsZeroApprox(S("a"))), err(() => gIsFinite(S("a"))), err(() => gIsNan(S("a"))), err(() => gIsInf(S("a")))].join("|"), ["is_zero_approx", "is_finite", "is_nan", "is_inf"].map((n) => conv(n, 1, "String")).join("|"));
  });
  it("max/min 不认 bool", () => {
    eq("568", "max(bool,int)", err(() => gMax(V.bool(true), I(1))), conv("max", 1, "bool"));
    eq("568", "max(int,bool)", err(() => gMax(I(1), V.bool(true))), conv("max", 2, "bool"));
    eq("568", "min(bool,float)", err(() => gMin(V.bool(true), F(1))), conv("min", 1, "bool"));
  });
  it("clamp 的 int/float 互转：整支返回命中的那一个原值", () => {
    eq("568", "clamp(1,1.5,3) 给 float 下界", show(gClamp(I(1), F(1.5), F(3))), "1.5");
    eq("568", "clamp(1.5,1,1) 给 int 上界", show(gClamp(F(1.5), I(1), I(1))), "1");
  });
});

describe("len 与 char（S568）", () => {
  it("len 收 Dictionary / 九支 pack", () => {
    const d = new GDict();
    d.set(S("a"), I(1));
    eq("568", "dict", show(lengthOf(V.dict(d))), "1");
    eq("568", "pb", show(lengthOf(V.object(new GBytes([1, 2, 3], "byte")))), "3");
    eq("568", "ps", show(lengthOf(V.object(new GBytes(["a"], "string")))), "1");
  });
  it("len 的坏型：GDScript utility 那句", () => {
    const lenErr = (src: string) => `Error calling GDScript utility function "len()": Value of type '${src}' can't provide a length.`;
    eq("568", "int", err(() => lengthOf(I(1))), lenErr("int"));
    eq("568", "Vector2", err(() => lengthOf(V.object(new GVector2(1, 2)))), lenErr("Vector2"));
    eq("568", "NodePath", err(() => lengthOf(nodePathCtor([S("a/b")]))), lenErr("NodePath"));
    eq("568", "Callable", err(() => lengthOf(nullCallable())), lenErr("Callable"));
    eq("568", "Signal", err(() => lengthOf(V.object(new Signal()))), lenErr("Signal"));
    eq("568", "Nil", err(() => lengthOf(V.nil())), lenErr("Nil"));
    eq("568", "bool", err(() => lengthOf(V.bool(true))), lenErr("bool"));
  });
  it("char(String) 也是 GDScript utility 句；合法值回归", () => {
    eq("568", "String 源", err(() => stringChr(S("a"))), 'Invalid type in GDScript utility function "char()". Cannot convert argument 1 from String to int.');
    eq("568", "char(65)", String(stringChr(I(65)).v), "A");
  });
});
