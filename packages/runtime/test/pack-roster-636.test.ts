/** pack 十支的名册补齐（S636）：`erase` 十支都有、byte 另多 36 名，属性读给内建类型的绑定 Callable，
 *  byte 之外那九支调用给 Nonexistent。读数 `tmp/probe636/attr.out`、`arity636.compare.txt`、`call636b.final.txt`、`show636.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, show } from "@gds2js/runtime/runtime/values";
import { packCtor } from "@gds2js/runtime/runtime/class/bytes/packed";
import { attribute, method } from "@gds2js/runtime/runtime/methods";
import { I } from "./support/variants";

const say = (v: Variant, name: string): string => {
  try {
    method(v, name, []);
    return "没抛";
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return err.code === undefined ? "?" : `[${err.code}] ${err.message ?? ""}`;
  }
};

const read = (v: Variant, name: string): string => {
  try {
    return show(attribute(v, name) as Variant);
  } catch (e) {
    return (e as Error).message;
  }
};

describe("runtime/packed · 十支名册补齐（S636）", () => {
  it("属性读给绑定 Callable，面标签跟着接收者", () => {
    eq("636", "i32.erase", read(packCtor("int32", []), "erase"), "PackedInt32Array::erase");
    eq("636", "vector4.erase", read(packCtor("vector4", []), "erase"), "PackedVector4Array::erase");
    eq("636", "byte.decode_u8", read(packCtor("byte", []), "decode_u8"), "PackedByteArray::decode_u8");
    eq("636", "byte.to_vector2_array", read(packCtor("byte", []), "to_vector2_array"), "PackedByteArray::to_vector2_array");
  });
  it("byte 独有的名字在九支上仍给访问句，调用给 Nonexistent", () => {
    eq("636", "i32 读 decode_u8", read(packCtor("int32", []), "decode_u8"),
      "Invalid access to property or key 'decode_u8' on a base object of type 'PackedInt32Array'.");
    eq("636", "i32 调 decode_u8", say(packCtor("int32", []), "decode_u8"),
      "[packed-no-method] Invalid call. Nonexistent function 'decode_u8' in base 'PackedInt32Array'.");
    eq("636", "color 调 encode_var", say(packCtor("color", []), "encode_var"),
      "[packed-no-method] Invalid call. Nonexistent function 'encode_var' in base 'PackedColorArray'.");
  });
  it("名字补进表里之后调用面不回归", () => {
    eq("636", "空 byte 越界读 decode_u8 给 0", String(method(packCtor("byte", []), "decode_u8", [I(1)]).v), "0");
    const p = packCtor("int32", [V.array(GArray.of([I(1), I(2)]))]);
    eq("636", "erase 照旧删第一处", String(method(p, "erase", [I(1)]).v), "true");
    eq("636", "删完还剩一格", String(method(p, "size", []).v), "1");
  });
});
