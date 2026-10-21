/** 装箱直调越元数那一句（S642）：八面九格一字一样，数取**声明的全部数**，名字不带引号。
 *  读数 `tmp/probe636/np642.gd`、`tmp/probe639/names.gd` 与 `call.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray } from "@gds2js/runtime/runtime/values";
import { packCtor } from "@gds2js/runtime/runtime/packed";
import { nodePathValue } from "@gds2js/runtime/runtime/node-path";
import { GColor } from "@gds2js/runtime/runtime/color";
import { method } from "@gds2js/runtime/runtime/methods";
import { I } from "./support/variants";

const say = (v: Variant, name: string, args: Variant[]): string => {
  try {
    void method(v, name, args);
    return "没抛";
  } catch (e) {
    return (e as Error).message;
  }
};

const col = () => V.object(new GColor(1, 0, 0, 1));

describe("runtime/methods · 装箱直调越元数那一句（S642）", () => {
  it("八面的数都是声明的全部数", () => {
    eq("642", "Array.size 给 1 支", say(V.array(GArray.of([I(1)])), "size", [I(1)]),
      "Invalid call to function 'size' in base 'Array'. Expected 0 argument(s).");
    eq("642", "String.length 给 1 支", say(V.str("abcd"), "length", [I(1)]),
      "Invalid call to function 'length' in base 'String'. Expected 0 argument(s).");
    eq("642", "StringName.length 给 1 支", say(V.stringName("ab"), "length", [I(1)]),
      "Invalid call to function 'length' in base 'StringName'. Expected 0 argument(s).");
    eq("642", "StringName.uri_file_decode 给 1 支", say(V.stringName("a"), "uri_file_decode", [I(1)]),
      "Invalid call to function 'uri_file_decode' in base 'StringName'. Expected 0 argument(s).");
    eq("642", "Color.lerp 给 4 支", say(col(), "lerp", [V.object(new GColor(0, 0, 0, 1)), V.float(0.5), I(1), I(2)]),
      "Invalid call to function 'lerp' in base 'Color'. Expected 2 argument(s).");
    eq("642", "Color.get_luminance 给 1 支", say(col(), "get_luminance", [I(1)]),
      "Invalid call to function 'get_luminance' in base 'Color'. Expected 0 argument(s).");
    eq("642", "Color.from_rgba8 给 2 支", say(col(), "from_rgba8", [I(1), I(2)]),
      "Invalid call to function 'from_rgba8' in base 'Color'. Expected 4 argument(s).");
    eq("642", "i32.append 给 2 支", say(packCtor("int32", [V.array(GArray.of([I(1)]))]), "append", [I(1), I(2)]),
      "Invalid call to function 'append' in base 'PackedInt32Array'. Expected 1 argument(s).");
    eq("642", "byte.to_vector2_array 给 1 支", say(packCtor("byte", []), "to_vector2_array", [I(1)]),
      "Invalid call to function 'to_vector2_array' in base 'PackedByteArray'. Expected 0 argument(s).");
    eq("642", "NodePath.slice 少给", say(nodePathValue("a/b[1]"), "slice", []),
      "Invalid call to function 'slice' in base 'NodePath'. Expected 2 argument(s).");
    eq("642", "NodePath.slice 多给", say(nodePathValue("a/b[1]"), "slice", [I(0), I(1), I(2), I(3)]),
      "Invalid call to function 'slice' in base 'NodePath'. Expected 2 argument(s).");
  });
  it("界内的调用照旧走完原路", () => {
    eq("642", "append 一支收下", say(packCtor("int32", [V.array(GArray.of([I(1)]))]), "append", [I(7)]), "没抛");
    eq("642", "get_name_count 零支收下", say(nodePathValue("a/b[1]"), "get_name_count", []), "没抛");
    eq("642", "String.size 走原路（这面没这名字）", say(V.str("ab"), "size", []),
      "Invalid call. Nonexistent function 'size' in base 'String'.");
  });
});
