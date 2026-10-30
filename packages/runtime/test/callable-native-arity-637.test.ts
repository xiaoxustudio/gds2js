/** 内建类型面的绑定 Callable 越元数时两句都报**全部数**（S637）；脚本方法那一族仍是「少给报必填、多给报全部」。
 *  读数 `tmp/probe636/cb636.gd`、`cb636b.gd`（脚本对照形在 `cb636c.gd`）。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray } from "@gds2js/runtime/runtime/values";
import { packCtor } from "@gds2js/runtime/runtime/class/bytes/packed";
import { attribute, method } from "@gds2js/runtime/runtime/methods";
import { I } from "./support/variants";

const call = (recv: Variant, name: string, args: Variant[]): string => {
  try {
    void method(attribute(recv, name) as Variant, "call", args);
    return "没抛";
  } catch (e) {
    return (e as Error).message;
  }
};

describe("runtime/callable · 内建面绑定 Callable 的元数那一句（S637）", () => {
  it("少给多给都报声明的全部数", () => {
    eq("637", "String.count 给 0 支报 3", call(V.str("abcd"), "count", []),
      "Invalid call to function 'String::count (Callable)'. Expected 3 argument(s).");
    eq("637", "PackedInt32Array.slice 给 0 支报 2", call(packCtor("int32", [V.array(GArray.of([I(1), I(2)]))]), "slice", []),
      "Invalid call to function 'PackedInt32Array::slice (Callable)'. Expected 2 argument(s).");
    eq("637", "Array.duplicate 给 2 支报 1", call(V.array(GArray.of([I(1)])), "duplicate", [I(1), I(2)]),
      "Invalid call to function 'Array::duplicate (Callable)'. Expected 1 argument(s).");
    eq("637", "byte.to_vector2_array 给 1 支报 0", call(packCtor("byte", []), "to_vector2_array", [I(1)]),
      "Invalid call to function 'PackedByteArray::to_vector2_array (Callable)'. Expected 0 argument(s).");
  });
});
