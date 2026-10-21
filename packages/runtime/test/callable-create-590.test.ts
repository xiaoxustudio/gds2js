/** `Callable.create(null|int, name)` 的脱离形（S590），读数 `tmp/d6/s590.gd` / `s578.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { callableStatic, method } from "@gds2js/runtime/runtime/methods";
import { variantHashNumber } from "@gds2js/runtime/runtime/builtins";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { show, valueEq } from "@gds2js/runtime/runtime/values";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { S, I } from "./support/variants";
import { GdScriptObject, wrapValue } from "@gds2js/runtime/runtime/object";

class Fake extends GdScriptObject {}


const call = (c: Variant, n: string, args: Variant[] = []): Variant => method(c, n, args) as Variant;
const code = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { code?: string }).code ?? "?";
  }
};

describe("Callable.create(null|int, name)（S590）", () => {
  it("null owner：标签 / 谓词 / 方法名 / 零元数 / 等式", () => {
    const c = callableStatic("create", [V.nil(), S("ping")]) as Variant;
    eq("590", "标签", show(c), "null::ping");
    eq("590", "is_null/is_valid", `${call(c, "is_null").v}/${call(c, "is_valid").v}`, "false/false");
    eq("590", "get_method", call(c, "get_method").v, "ping");
    eq("590", "get_object typeof", typeOf(call(c, "get_object")).v, 24);
    eq("590", "get_argument_count", call(c, "get_argument_count").v, 0);
    eq("590", "等式", valueEq(c, callableStatic("create", [V.nil(), S("ping")]) as Variant), true);
  });
  it("调用给 null 实例句；int owner 的标签", () => {
    const c = callableStatic("create", [V.nil(), S("ping")]) as Variant;
    let msg = "";
    try {
      call(c, "call", [I(1)]);
    } catch (e) {
      msg = (e as { message?: string }).message ?? "";
    }
    eq("590", "调用句", msg, "Attempt to call function 'null::ping (Callable)' on a null instance.");
    const ic = callableStatic("create", [I(1), S("x")]) as Variant;
    eq("590", "int owner", `${show(ic)}|${call(ic, "is_valid").v}`, "int::x|false");
  });
  it("obj 上不存在的方法：无效 Callable 的形状（S592）", () => {
    const o = wrapValue(new Fake());
    const c = callableStatic("create", [o, S("nope")]) as Variant;
    eq("592", "谓词与方法名", `${call(c, "is_null").v}/${call(c, "is_valid").v}/${call(c, "get_method").v}`, "false/false/nope");
    eq("592", "空对象与零元数", `${typeOf(call(c, "get_object")).v}/${call(c, "get_argument_count").v}`, "24/0");
    eq("592", "等式", valueEq(c, callableStatic("create", [o, S("nope")]) as Variant), true);
    eq("592", "hash 拒", code(() => variantHashNumber(c)), "hash-callable-invalid-method");
  });
  it("hash 与 bind 的未拟合形响亮拒", () => {
    const c = callableStatic("create", [V.nil(), S("ping")]) as Variant;
    eq("590", "hash", code(() => variantHashNumber(c)), "hash-callable-detached");
    eq("590", "bind", code(() => call(c, "bind", [I(1)])), "callable-detached-bind");
  });
});
