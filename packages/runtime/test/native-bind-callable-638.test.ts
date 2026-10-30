/** 内建绑定 Callable 过了 `bind()` 仍留着面身份（S638）：印的还是 `<面>::<名>`、`get_argument_count()` 给「声明数 − 已绑」（过头给负数）、
 *  越元数照发那句。读数 `tmp/probe637/args.gd`、`bind.gd`、`bindcall.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, show } from "@gds2js/runtime/runtime/values";
import { packCtor } from "@gds2js/runtime/runtime/class/bytes/packed";
import { attribute, method } from "@gds2js/runtime/runtime/methods";
import { I } from "./support/variants";

const bind = (recv: Variant, name: string, args: Variant[]): Variant =>
  method(attribute(recv, name) as Variant, "bind", args) as Variant;

const probe = (f: () => unknown): string => {
  try {
    return String(f());
  } catch (e) {
    return (e as Error).message;
  }
};

describe("runtime/callable · 内建面 bind 之后身份不丢（S638）", () => {
  const s = V.str("abcd");
  const a = V.array(GArray.of([I(1), I(2)]));
  it("打印、自述元数与绑定数", () => {
    eq("638", "String.count 绑 1 支仍印面名", show(bind(s, "count", [I(1)])), "String::count");
    eq("638", "声明 3 绑 1 给 2", probe(() => method(bind(s, "count", [I(1)]), "get_argument_count", []).v), "2");
    eq("638", "绑定数 1", probe(() => method(bind(s, "count", [I(1)]), "get_bound_arguments_count", []).v), "1");
    eq("638", "零元那支绑过头给负数", probe(() => method(bind(packCtor("byte", []), "to_vector2_array", [I(1)]), "get_argument_count", []).v), "-1");
    eq("638", "Array.slice 绑 1 支给 3", probe(() => method(bind(a, "slice", [I(1)]), "get_argument_count", []).v), "3");
    eq("638", "Array.slice 绑后仍印面名", show(bind(a, "slice", [I(1)])), "Array::slice");
  });
  it("越元数那一句仍在", () => {
    eq("638", "count 绑 3 再给 1 支", probe(() => method(bind(s, "count", [I(1), I(2), I(3)]), "call", [V.str("a")])),
      "Invalid call to function 'String::count (Callable)'. Expected 3 argument(s).");
    eq("638", "零元面绑过再空手 call", probe(() => method(bind(packCtor("byte", []), "to_vector2_array", [I(1)]), "call", [])),
      "Invalid call to function 'PackedByteArray::to_vector2_array (Callable)'. Expected 0 argument(s).");
    eq("638", "slice 绑 1 给 4 支", probe(() => method(bind(a, "slice", [I(1)]), "call", [I(2), I(3), I(4), I(5)])),
      "Invalid call to function 'Array::slice (Callable)'. Expected 4 argument(s).");
  });
});
