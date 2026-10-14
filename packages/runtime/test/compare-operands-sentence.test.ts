/**
 * 装箱比较的运行期拒 —— **句子与引擎同文**（48 格读数 `tmp/probe-argtype/lessmsg.txt`，一次 spawn 一批的尺 `tmp/probe-argtype/fold24.mts`：
 * 每格包进一个小函数，那句 SCRIPT ERROR 只打断那个函数，脚本照跑下一格）。
 * 钉死三件事：句式是 `Invalid operands 'L' and 'R' in operator 'OP'.`、四个运算符都走同一句、
 * 形名走引擎的拼法（`Nil` 不是 `nil`，pack 九支各叫本名如 `PackedInt32Array`），实参顺序就是式子里的左右顺序。
 * 同一句式在「每种形对 String」那一批里也逐格核过（读数 `tmp/probe-argtype/lessmsg-vsstring.txt`，19 形 × 双向 + 四运算符）。
 * 唯一不进门的读数是 `&"b" < &"a"`：引擎给值，而 StringName 的序复现不了（S355 ③），出货照旧响亮拒。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray } from "@gds2js/runtime/runtime/values";
import { dictOf } from "@gds2js/runtime/runtime/methods";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { vector2 } from "@gds2js/runtime/runtime/vector2";
import { vector2i } from "@gds2js/runtime/runtime/vector2i";
import { vector3 } from "@gds2js/runtime/runtime/vector3";
import { vector3i } from "@gds2js/runtime/runtime/vector3i";
import { color } from "@gds2js/runtime/runtime/color";
import { nodePathValue } from "@gds2js/runtime/runtime/node-path";
import { rid } from "@gds2js/runtime/runtime/rid";
import { nullCallable } from "@gds2js/runtime/runtime/object";
import { ops } from "@gds2js/runtime/runtime/ops";

const OPFN: Record<string, (a: Variant, b: Variant) => Variant> = { "<": ops.lt, "<=": ops.lte, ">": ops.gt, ">=": ops.gte };

function errOf(f: () => unknown): string {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as Error).message;
  }
}

const CELLS: Array<[Variant, Variant, string, string, boolean, string]> = [
  [V.nil(), V.int(1n), "<", "Invalid operands 'Nil' and 'int' in operator '<'.", true, "null < 1"],
  [V.int(1n), V.nil(), "<", "Invalid operands 'int' and 'Nil' in operator '<'.", true, "1 < null"],
  [V.bool(true), V.int(1n), "<", "Invalid operands 'bool' and 'int' in operator '<'.", true, "true < 1"],
  [V.int(1n), V.bool(true), "<", "Invalid operands 'int' and 'bool' in operator '<'.", true, "1 < true"],
  [V.int(1n), V.int(1n), "<", "false", false, "1 < 1"],
  [V.int(1n), V.int(1n), "<", "false", false, "1 < 1"],
  [V.float(1.5), V.int(1n), "<", "false", false, "1.5 < 1"],
  [V.int(1n), V.float(1.5), "<", "true", false, "1 < 1.5"],
  [V.str("a"), V.int(1n), "<", "Invalid operands 'String' and 'int' in operator '<'.", true, "\"a\" < 1"],
  [V.int(1n), V.str("a"), "<", "Invalid operands 'int' and 'String' in operator '<'.", true, "1 < \"a\""],
  [V.stringName("b"), V.int(1n), "<", "Invalid operands 'StringName' and 'int' in operator '<'.", true, "&\"b\" < 1"],
  [V.int(1n), V.stringName("b"), "<", "Invalid operands 'int' and 'StringName' in operator '<'.", true, "1 < &\"b\""],
  [nodePathValue("c"), V.int(1n), "<", "Invalid operands 'NodePath' and 'int' in operator '<'.", true, "^\"c\" < 1"],
  [V.int(1n), nodePathValue("c"), "<", "Invalid operands 'int' and 'NodePath' in operator '<'.", true, "1 < ^\"c\""],
  [vector2(1, 2), V.int(1n), "<", "Invalid operands 'Vector2' and 'int' in operator '<'.", true, "Vector2(1, 2) < 1"],
  [V.int(1n), vector2(1, 2), "<", "Invalid operands 'int' and 'Vector2' in operator '<'.", true, "1 < Vector2(1, 2)"],
  [vector2i(1, 2), V.int(1n), "<", "Invalid operands 'Vector2i' and 'int' in operator '<'.", true, "Vector2i(1, 2) < 1"],
  [V.int(1n), vector2i(1, 2), "<", "Invalid operands 'int' and 'Vector2i' in operator '<'.", true, "1 < Vector2i(1, 2)"],
  [vector3(1, 2, 3), V.int(1n), "<", "Invalid operands 'Vector3' and 'int' in operator '<'.", true, "Vector3(1, 2, 3) < 1"],
  [V.int(1n), vector3(1, 2, 3), "<", "Invalid operands 'int' and 'Vector3' in operator '<'.", true, "1 < Vector3(1, 2, 3)"],
  [vector3i(1, 2, 3), V.int(1n), "<", "Invalid operands 'Vector3i' and 'int' in operator '<'.", true, "Vector3i(1, 2, 3) < 1"],
  [V.int(1n), vector3i(1, 2, 3), "<", "Invalid operands 'int' and 'Vector3i' in operator '<'.", true, "1 < Vector3i(1, 2, 3)"],
  [color(1, 0, 0, 1), V.int(1n), "<", "Invalid operands 'Color' and 'int' in operator '<'.", true, "Color(1, 0, 0, 1) < 1"],
  [V.int(1n), color(1, 0, 0, 1), "<", "Invalid operands 'int' and 'Color' in operator '<'.", true, "1 < Color(1, 0, 0, 1)"],
  [V.array(GArray.of([V.int(1n)])), V.int(1n), "<", "Invalid operands 'Array' and 'int' in operator '<'.", true, "[1] < 1"],
  [V.int(1n), V.array(GArray.of([V.int(1n)])), "<", "Invalid operands 'int' and 'Array' in operator '<'.", true, "1 < [1]"],
  [dictOf([[V.str("a"), V.int(1n)]]), V.int(1n), "<", "Invalid operands 'Dictionary' and 'int' in operator '<'.", true, "{\"a\": 1} < 1"],
  [V.int(1n), dictOf([[V.str("a"), V.int(1n)]]), "<", "Invalid operands 'int' and 'Dictionary' in operator '<'.", true, "1 < {\"a\": 1}"],
  [rid(BigInt(7)), V.int(1n), "<", "Invalid operands 'RID' and 'int' in operator '<'.", true, "rid_from_int64(7) < 1"],
  [V.int(1n), rid(BigInt(7)), "<", "Invalid operands 'int' and 'RID' in operator '<'.", true, "1 < rid_from_int64(7)"],
  [V.object(GBytes.of([1], "int32")), V.int(1n), "<", "Invalid operands 'PackedInt32Array' and 'int' in operator '<'.", true, "PackedInt32Array([1]) < 1"],
  [V.int(1n), V.object(GBytes.of([1], "int32")), "<", "Invalid operands 'int' and 'PackedInt32Array' in operator '<'.", true, "1 < PackedInt32Array([1])"],
  [V.object(GBytes.of(["a"], "string")), V.int(1n), "<", "Invalid operands 'PackedStringArray' and 'int' in operator '<'.", true, "PackedStringArray([\"a\"]) < 1"],
  [V.int(1n), V.object(GBytes.of(["a"], "string")), "<", "Invalid operands 'int' and 'PackedStringArray' in operator '<'.", true, "1 < PackedStringArray([\"a\"])"],
  [V.object(GBytes.of([1, 2], "byte")), V.int(1n), "<", "Invalid operands 'PackedByteArray' and 'int' in operator '<'.", true, "PackedByteArray([1, 2]) < 1"],
  [V.int(1n), V.object(GBytes.of([1, 2], "byte")), "<", "Invalid operands 'int' and 'PackedByteArray' in operator '<'.", true, "1 < PackedByteArray([1, 2])"],
  [nullCallable(), V.int(1n), "<", "Invalid operands 'Callable' and 'int' in operator '<'.", true, "Callable(quit) < 1"],
  [V.int(1n), nullCallable(), "<", "Invalid operands 'int' and 'Callable' in operator '<'.", true, "1 < Callable(quit)"],
  [V.int(1n), V.str("a"), "<=", "Invalid operands 'int' and 'String' in operator '<='.", true, "1 <= \"a\""],
  [V.str("a"), V.int(1n), "<=", "Invalid operands 'String' and 'int' in operator '<='.", true, "\"a\" <= 1"],
  [V.int(1n), V.str("a"), ">", "Invalid operands 'int' and 'String' in operator '>'.", true, "1 > \"a\""],
  [V.str("a"), V.int(1n), ">", "Invalid operands 'String' and 'int' in operator '>'.", true, "\"a\" > 1"],
  [V.int(1n), V.str("a"), ">=", "Invalid operands 'int' and 'String' in operator '>='.", true, "1 >= \"a\""],
  [V.str("a"), V.int(1n), ">=", "Invalid operands 'String' and 'int' in operator '>='.", true, "\"a\" >= 1"],
  [color(1, 0, 0, 1), color(0, 1, 0, 1), "<", "Invalid operands 'Color' and 'Color' in operator '<'.", true, "Color(1, 0, 0, 1) < Color(0, 1, 0, 1)"],
  [V.array(GArray.of([V.str("a")])), V.array(GArray.of([V.str("b")])), ">=", "false", false, "[\"a\"] >= [\"b\"]"],
  [V.int(1n), V.bool(true), "<", "Invalid operands 'int' and 'bool' in operator '<'.", true, "1 < true"],
];

describe("runtime/ops · 比较算子的运行期拒与给值", () => {
  for (const [a, b, op, want, throws, label] of CELLS) {
    it(label, () => {
      if (throws) eq("359", label, errOf(() => OPFN[op]!(a, b)), want);
      else eq("359", label, String(OPFN[op]!(a, b).v), want);
    });
  }
});
