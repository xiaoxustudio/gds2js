/** 装箱直调元数句再铺六面（S643）：Dictionary 与 vector 五支同一句式，数仍是声明的全部数；
 *  另把「名册里有、元数也对、但没实现」那一格从假引擎句改成响亮拒。读数 `tmp/probe636/dd643.gd` 十四格。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GDict } from "@gds2js/runtime/runtime/values";
import { GVector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { GVector3 } from "@gds2js/runtime/runtime/class/vector/vector3";
import { GVector2i } from "@gds2js/runtime/runtime/class/vector/vector2i";
import { GVector3i } from "@gds2js/runtime/runtime/class/vector/vector3i";
import { GVector4 } from "@gds2js/runtime/runtime/class/vector/vector4";
import { GVector4i } from "@gds2js/runtime/runtime/class/vector/vector4i";
import { nodePathValue } from "@gds2js/runtime/runtime/node-path";
import { method } from "@gds2js/runtime/runtime/methods";
import { I } from "./support/variants";

const say = (v: Variant, name: string, args: Variant[]): string => {
  try {
    void method(v, name, args);
    return "没抛";
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return `[${err.code}] ${err.message ?? ""}`;
  }
};

describe("runtime/methods · 装箱直调元数句铺满值型面（S643）", () => {
  it("Dictionary 与 vector 五支同句式", () => {
    const d = V.dict(new GDict());
    eq("643", "Dictionary.size 给 1 支", say(d, "size", [I(1)]), "[dict-arity] Invalid call to function 'size' in base 'Dictionary'. Expected 0 argument(s).");
    eq("643", "Dictionary.get 少给", say(d, "get", []), "[dict-arity] Invalid call to function 'get' in base 'Dictionary'. Expected 2 argument(s).");
    eq("643", "Dictionary.keys 给 1 支", say(d, "keys", [I(1)]), "[dict-arity] Invalid call to function 'keys' in base 'Dictionary'. Expected 0 argument(s).");
    eq("643", "Vector2.length 给 1 支", say(V.object(new GVector2(1, 2)), "length", [I(1)]), "[vector-arity] Invalid call to function 'length' in base 'Vector2'. Expected 0 argument(s).");
    eq("643", "Vector2.distance_to 少给", say(V.object(new GVector2(1, 2)), "distance_to", []), "[vector-arity] Invalid call to function 'distance_to' in base 'Vector2'. Expected 1 argument(s).");
    eq("643", "Vector2.clamp 给 1 支", say(V.object(new GVector2(1, 2)), "clamp", [I(1)]), "[vector-arity] Invalid call to function 'clamp' in base 'Vector2'. Expected 2 argument(s).");
    eq("643", "Vector2i.length 给 1 支", say(V.object(new GVector2i(1, 2)), "length", [I(1)]), "[vector-arity] Invalid call to function 'length' in base 'Vector2i'. Expected 0 argument(s).");
    eq("643", "Vector3.rotated 给 1 支", say(V.object(new GVector3(1, 2, 3)), "rotated", [I(1)]), "[vector-arity] Invalid call to function 'rotated' in base 'Vector3'. Expected 2 argument(s).");
    eq("643", "Vector3i.sign 给 1 支", say(V.object(new GVector3i(1, 2, 3)), "sign", [I(1)]), "[vector-arity] Invalid call to function 'sign' in base 'Vector3i'. Expected 0 argument(s).");
    eq("643", "Vector4.length 给 1 支", say(V.object(new GVector4(1, 2, 3, 4)), "length", [I(1)]), "[vector-arity] Invalid call to function 'length' in base 'Vector4'. Expected 0 argument(s).");
    eq("643", "Vector4i.abs 给 1 支", say(V.object(new GVector4i(1, 2, 3, 4)), "abs", [I(1)]), "[vector-arity] Invalid call to function 'abs' in base 'Vector4i'. Expected 0 argument(s).");
  });
  it("界内照旧走完原路；表外名仍给引擎那句", () => {
    eq("643", "Vector2.length 零支收下", say(V.object(new GVector2(3, 4)), "length", []), "没抛");
    eq("643", "Vector2.distance_to 一支收下", say(V.object(new GVector2(3, 4)), "distance_to", [V.object(new GVector2(0, 0))]), "没抛");
    eq("643", "np.slice 界内算得出值（S644 发货）", say(nodePathValue("a/b[1]"), "slice", [I(0)]), "没抛");
    eq("643", "表外名仍给引擎 Nonexistent", say(nodePathValue("a/b[1]"), "nope", []),
      "[node-path-method] Invalid call. Nonexistent function 'nope' in base 'NodePath'.");
  });
});
