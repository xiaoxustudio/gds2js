/**
 * `Array.min()` / `max()` 是**第四条**比较口子（S360）：一格一个 it，钉「min 与 max 一起与引擎一字一样」。
 * 读数 `tmp/probe-argtype/minmax.txt`（36 格，形对形与同形）与 `minmax2.txt`（27 格，三元素以上才分得出「一比就废」是立刻给 null 还是跳过那一步），
 * 尺 `{fold31,fold32}.mts`，对象那一形 `tmp/probe-argtype/v37.gd`。
 * 判据：基准是**第一个元素**，后面逐个比；碰到比不了的组合（null / Color / NodePath / 字典 / pack / Callable / 对象，以及任何跨形）**整串当场给 null**，
 *  一行错误都不推，后面更小的元素也不再看（`[1, "a", 0]` 给 null 而不是 0）。float 对 NaN 是合式比较、只是结果为假，所以基准是谁就看谁排在前头。
 * 两支 StringName 钉的是响亮拒：引擎按 intern 之后的指针序给值（实测 `[&"b", &"a", &"c"]` 的 min 是 `c`），复现不了（S355 / S357 同一条立场）。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, show } from "@gds2js/runtime/runtime/values";
import { method, dictOf } from "@gds2js/runtime/runtime/methods";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { vector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { vector2i } from "@gds2js/runtime/runtime/class/vector/vector2i";
import { vector3 } from "@gds2js/runtime/runtime/class/vector/vector3";
import { vector3i } from "@gds2js/runtime/runtime/class/vector/vector3i";
import { color } from "@gds2js/runtime/runtime/class/color/color";
import { nodePathValue } from "@gds2js/runtime/runtime/class/identity/node-path";
import { rid } from "@gds2js/runtime/runtime/class/identity/rid";
import { nullCallable } from "@gds2js/runtime/runtime/class/object/script-object";

function mm(els: Variant[]): string {
  const a = V.array(GArray.of(els));
  return `${show(method(a, "min", []))}|${show(method(a, "max", []))}`;
}

function errOf(f: () => unknown): string {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as Error).message;
  }
}

const CELLS: Array<[Variant[], string, string]> = [
  [[V.int(1n), V.int(2n)], "1|2", "[1, 2]"],
  [[V.int(2n), V.int(1n)], "1|2", "[2, 1]"],
  [[V.int(1n), V.float(1.5)], "1|1.5", "[1, 1.5]"],
  [[V.float(1.5), V.int(1n)], "1|1.5", "[1.5, 1]"],
  [[V.bool(true), V.bool(false)], "false|true", "[true, false]"],
  [[V.str("b"), V.str("a")], "a|b", "[\"b\", \"a\"]"],
  [[V.str("ab"), V.str("b")], "ab|b", "[\"ab\", \"b\"]"],
  [[nodePathValue("b"), nodePathValue("a")], "<null>|<null>", "[^\"b\", ^\"a\"]"],
  [[vector2(1, 2), vector2(0, 3)], "(0.0, 3.0)|(1.0, 2.0)", "[Vector2(1, 2), Vector2(0, 3)]"],
  [[vector2i(1, 2), vector2i(0, 3)], "(0, 3)|(1, 2)", "[Vector2i(1, 2), Vector2i(0, 3)]"],
  [[vector3(1, 2, 3), vector3(0, 9, 9)], "(0.0, 9.0, 9.0)|(1.0, 2.0, 3.0)", "[Vector3(1, 2, 3), Vector3(0, 9, 9)]"],
  [[vector3i(1, 2, 3), vector3i(0, 9, 9)], "(0, 9, 9)|(1, 2, 3)", "[Vector3i(1, 2, 3), Vector3i(0, 9, 9)]"],
  [[color(1, 0, 0, 1), color(0, 1, 0, 1)], "<null>|<null>", "[Color(1, 0, 0, 1), Color(0, 1, 0, 1)]"],
  [[rid(BigInt(8)), rid(BigInt(7))], "RID(7)|RID(8)", "[rid_from_int64(8), rid_from_int64(7)]"],
  [[rid(BigInt(-1)), rid(BigInt(1))], "RID(1)|RID(-1)", "[rid_from_int64(-1), rid_from_int64(1)]"],
  [[dictOf([[V.str("b"), V.int(1n)]]), dictOf([[V.str("a"), V.int(1n)]])], "<null>|<null>", "[{\"b\": 1}, {\"a\": 1}]"],
  [[V.array(GArray.of([V.int(2n)])), V.array(GArray.of([V.int(1n)]))], "[1]|[2]", "[[2], [1]]"],
  [[V.array(GArray.of([V.int(1n), V.int(2n)])), V.array(GArray.of([V.int(1n)]))], "[1]|[1, 2]", "[[1, 2], [1]]"],
  [[V.object(GBytes.of([2], "int32")), V.object(GBytes.of([1], "int32"))], "<null>|<null>", "[PackedInt32Array([2]), PackedInt32Array([1])]"],
  [[V.nil(), V.int(1n)], "<null>|<null>", "[null, 1]"],
  [[V.int(1n), V.nil()], "<null>|<null>", "[1, null]"],
  [[V.nil()], "<null>|<null>", "[null]"],
  [[], "<null>|<null>", "[]"],
  [[V.int(1n), V.str("a")], "<null>|<null>", "[1, \"a\"]"],
  [[V.str("a"), V.int(1n)], "<null>|<null>", "[\"a\", 1]"],
  [[V.int(1n), V.bool(true)], "<null>|<null>", "[1, true]"],
  [[V.bool(true), V.int(1n)], "<null>|<null>", "[true, 1]"],
  [[V.float(NaN), V.float(1.5)], "nan|nan", "[NAN, 1.5]"],
  [[V.float(1.5), V.float(NaN)], "1.5|1.5", "[1.5, NAN]"],
  [[V.int(1n), V.array(GArray.of([V.str("a")]))], "<null>|<null>", "[1, [\"a\"]]"],
  [[V.array(GArray.of([V.int(1n)])), dictOf([[V.str("a"), V.int(1n)]])], "<null>|<null>", "[[1], {\"a\": 1}]"],
  [[vector2(1, 1), vector2i(1, 1)], "<null>|<null>", "[Vector2(1, 1), Vector2i(1, 1)]"],
  [[nullCallable(), V.int(1n)], "<null>|<null>", "[Callable(quit), 1]"],
  [[V.stringName("a"), V.str("a")], "<null>|<null>", "[&\"a\", \"a\"]"],
  [[V.str("a"), V.stringName("a")], "<null>|<null>", "[\"a\", &\"a\"]"],
  [[V.int(3n), V.int(1n), V.int(2n)], "1|3", "[3, 1, 2]"],
  [[V.int(1n), V.str("a"), V.int(0n)], "<null>|<null>", "[1, \"a\", 0]"],
  [[V.str("a"), V.int(1n), V.int(0n)], "<null>|<null>", "[\"a\", 1, 0]"],
  [[V.int(2n), V.int(1n), V.str("a")], "<null>|<null>", "[2, 1, \"a\"]"],
  [[V.int(1n), V.int(2n), V.str("a")], "<null>|<null>", "[1, 2, \"a\"]"],
  [[V.int(2n), V.nil(), V.int(1n)], "<null>|<null>", "[2, null, 1]"],
  [[V.nil(), V.int(2n), V.int(1n)], "<null>|<null>", "[null, 2, 1]"],
  [[V.int(2n), V.int(1n), V.nil()], "<null>|<null>", "[2, 1, null]"],
  [[V.int(2n), color(1, 0, 0, 1), V.int(1n)], "<null>|<null>", "[2, Color(1, 0, 0, 1), 1]"],
  [[color(1, 0, 0, 1), V.int(2n), V.int(1n)], "<null>|<null>", "[Color(1, 0, 0, 1), 2, 1]"],
  [[V.array(GArray.of([V.int(1n)])), dictOf([[V.str("a"), V.int(1n)]]), V.int(2n)], "<null>|<null>", "[[1], {\"a\": 1}, 2]"],
  [[V.int(2n), V.array(GArray.of([V.int(1n)])), dictOf([[V.str("a"), V.int(1n)]])], "<null>|<null>", "[2, [1], {\"a\": 1}]"],
  [[V.float(1.5), V.float(NaN), V.int(2n)], "1.5|2", "[1.5, NAN, 2]"],
  [[V.float(NaN), V.float(1.5), V.int(2n)], "nan|nan", "[NAN, 1.5, 2]"],
  [[V.int(3n), V.int(1n), V.int(9n), V.int(2n), V.int(8n), V.int(0n)], "0|9", "[3, 1, 9, 2, 8, 0]"],
  [[V.str("b"), V.str("a"), V.str("c")], "a|c", "[\"b\", \"a\", \"c\"]"],
  [[vector2(1, 2), vector2(0, 3), vector2(5, 0)], "(0.0, 3.0)|(5.0, 0.0)", "[Vector2(1, 2), Vector2(0, 3), Vector2(5, 0)]"],
  [[V.int(2n), V.int(1n), V.float(1.5)], "1|2", "[2, 1, 1.5]"],
  [[V.int(1n), V.int(2n), V.float(0.5)], "0.5|2", "[1, 2, 0.5]"],
  [[V.int(2n), V.int(1n), V.bool(true)], "<null>|<null>", "[2, 1, true]"],
  [[V.bool(true), V.int(2n), V.int(1n)], "<null>|<null>", "[true, 2, 1]"],
  [[V.object(GBytes.of([2], "int32")), V.int(1n)], "<null>|<null>", "[PackedInt32Array([2]), 1]"],
  [[rid(BigInt(8)), rid(BigInt(7)), rid(BigInt(9))], "RID(7)|RID(9)", "[rid_from_int64(8), rid_from_int64(7), rid_from_int64(9)]"],
  [[dictOf([[V.str("b"), V.int(1n)]]), dictOf([[V.str("a"), V.int(1n)]]), dictOf([[V.str("c"), V.int(1n)]])], "<null>|<null>", "[{\"b\": 1}, {\"a\": 1}, {\"c\": 1}]"],
  [[V.array(GArray.of([V.int(2n)])), V.array(GArray.of([V.int(1n)])), V.array(GArray.of([V.int(3n)]))], "[1]|[3]", "[[2], [1], [3]]"],
  [[nodePathValue("b"), nodePathValue("a"), nodePathValue("c")], "<null>|<null>", "[^\"b\", ^\"a\", ^\"c\"]"],
];

const REFUSALS: Array<[Variant[], string]> = [
  [[V.stringName("b"), V.stringName("a")], "[&\"b\", &\"a\"]"],
  [[V.stringName("b"), V.stringName("a"), V.stringName("c")], "[&\"b\", &\"a\", &\"c\"]"],
];

const REFUSE = "StringName 的 < / > 按 Godot 内部指针序，无可靠口径（实测 &\"zzz\" < &\"abc\" 为真），拒绝StringName 与 StringName 比大小";

describe("runtime/values · Array.min() / max() 的折法与一比就废", () => {
  for (const [els, want, label] of CELLS) {
    it(label, () => {
      eq("363", `${label} → ${want}`, mm(els), want);
    });
  }
  for (const [els, label] of REFUSALS) {
    it(`${label} 两支 StringName 响亮拒`, () => {
      eq("363", label, errOf(() => mm(els)), REFUSE);
    });
  }
});
