/** `Callable.create(obj, name)`（S578），读数 `tmp/d6/s578.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { callableStatic, method } from "@gds2js/runtime/runtime/methods";
import { GdScriptObject, methodCallable, wrapValue } from "@gds2js/runtime/runtime/object";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { valueEq } from "@gds2js/runtime/runtime/values";
import { I, S } from "./support/variants";

class Fake extends GdScriptObject {
  ping(a: Variant): Variant {
    return a;
  }
}

const err = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { code?: string }).code ?? "?";
  }
};

describe("Callable.create（S578）", () => {
  it("与 Callable(obj, name) 同一只，String / StringName 两种名字", () => {
    const o = wrapValue(new Fake());
    const created = callableStatic("create", [o, S("ping")]) as Variant;
    const direct = methodCallable(o, "ping") as Variant;
    eq("578", "同只", valueEq(created, direct), true);
    eq("578", "get_method", method(created, "get_method", []).v, "ping");
    eq("578", "get_object", (method(created, "get_object", []) as Variant) === o, true);
    const sn = callableStatic("create", [o, V.stringName("ping")]) as Variant;
    eq("578", "StringName 形同", valueEq(sn, direct), true);
  });
  it("非对象与元数响亮拒；未知静态名拒", () => {
    eq("578", "int 首参", err(() => callableStatic("create", [I(1), S("x")])), "callable-create-obj");
    eq("578", "元数", err(() => callableStatic("create", [wrapValue(new Fake())])), "callable-create-arity");
    eq("578", "未知名", err(() => callableStatic("nope", [])), "callable-static");
  });
});
