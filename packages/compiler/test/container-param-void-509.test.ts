/**
 * 容器面方法的接收者写成形参标注名（S509）：`func f(a: Array)` 之后 `print(a.assign(w))` 引擎照发 void 那一句，
 * 槽型是 `Array` / `Dictionary` 那一位对 `null` 两句齐发、对 `Callable` 只回第二句；pack 另三面的 `bsearch` `b` 位同判。
 * 尺 `tmp/d6/s509.py` 四十四格（八位容器位子 × 四种实参 + 三面 pack 的 b 位 × 四种实参），读数同名 `.json`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(body: string): Promise<string[]> {
  const src = "extends SceneTree" + "\n\n" + body;
  return analyze(lower(await parseSource(src))).diagnostics.map((d) => d.message).sort();
}

const CELLS: Array<[string, string, string[]]> = [
  ["Array.append_array(null)", "func f(arr: Array):\n\tprint(arr.append_array(null))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\".", "Cannot pass a value of type \"null\" as \"Array\".", "Invalid argument for \"append_array()\" function: argument 1 should be \"Array\" but is \"null\"."]],
  ["Array.append_array(Callable名)", "func f(arr: Array, w: Callable):\n\tprint(arr.append_array(w))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\".", "Invalid argument for \"append_array()\" function: argument 1 should be \"Array\" but is \"Callable\"."]],
  ["Array.append_array(int名)", "func f(arr: Array, w: int):\n\tprint(arr.append_array(w))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\".", "Invalid argument for \"append_array()\" function: argument 1 should be \"Array\" but is \"int\"."]],
  ["Array.append_array(Array[int]名)", "func f(arr: Array, w: Array[int]):\n\tprint(arr.append_array(w))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\"."]],
  ["Array.assign(null)", "func f(arr: Array):\n\tprint(arr.assign(null))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\".", "Cannot pass a value of type \"null\" as \"Array\".", "Invalid argument for \"assign()\" function: argument 1 should be \"Array\" but is \"null\"."]],
  ["Array.assign(Callable名)", "func f(arr: Array, w: Callable):\n\tprint(arr.assign(w))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\".", "Invalid argument for \"assign()\" function: argument 1 should be \"Array\" but is \"Callable\"."]],
  ["Array.assign(int名)", "func f(arr: Array, w: int):\n\tprint(arr.assign(w))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\".", "Invalid argument for \"assign()\" function: argument 1 should be \"Array\" but is \"int\"."]],
  ["Array.assign(Array[int]名)", "func f(arr: Array, w: Array[int]):\n\tprint(arr.assign(w))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\"."]],
  ["Array.is_same_typed(null)", "func f(arr: Array):\n\tprint(arr.is_same_typed(null))\n", ["Cannot pass a value of type \"null\" as \"Array\".", "Invalid argument for \"is_same_typed()\" function: argument 1 should be \"Array\" but is \"null\"."]],
  ["Array.is_same_typed(Callable名)", "func f(arr: Array, w: Callable):\n\tprint(arr.is_same_typed(w))\n", ["Invalid argument for \"is_same_typed()\" function: argument 1 should be \"Array\" but is \"Callable\"."]],
  ["Array.is_same_typed(int名)", "func f(arr: Array, w: int):\n\tprint(arr.is_same_typed(w))\n", ["Invalid argument for \"is_same_typed()\" function: argument 1 should be \"Array\" but is \"int\"."]],
  ["Array.is_same_typed(Array[int]名)", "func f(arr: Array, w: Array[int]):\n\tprint(arr.is_same_typed(w))\n", []],
  ["Dictionary.assign(null)", "func f(dic: Dictionary):\n\tprint(dic.assign(null))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\".", "Cannot pass a value of type \"null\" as \"Dictionary\".", "Invalid argument for \"assign()\" function: argument 1 should be \"Dictionary\" but is \"null\"."]],
  ["Dictionary.assign(Callable名)", "func f(dic: Dictionary, w: Callable):\n\tprint(dic.assign(w))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\".", "Invalid argument for \"assign()\" function: argument 1 should be \"Dictionary\" but is \"Callable\"."]],
  ["Dictionary.assign(int名)", "func f(dic: Dictionary, w: int):\n\tprint(dic.assign(w))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\".", "Invalid argument for \"assign()\" function: argument 1 should be \"Dictionary\" but is \"int\"."]],
  ["Dictionary.assign(Array[int]名)", "func f(dic: Dictionary, w: Array[int]):\n\tprint(dic.assign(w))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\".", "Invalid argument for \"assign()\" function: argument 1 should be \"Dictionary\" but is \"Array[int]\"."]],
  ["Dictionary.has_all(null)", "func f(dic: Dictionary):\n\tprint(dic.has_all(null))\n", ["Cannot pass a value of type \"null\" as \"Array\".", "Invalid argument for \"has_all()\" function: argument 1 should be \"Array\" but is \"null\"."]],
  ["Dictionary.has_all(Callable名)", "func f(dic: Dictionary, w: Callable):\n\tprint(dic.has_all(w))\n", ["Invalid argument for \"has_all()\" function: argument 1 should be \"Array\" but is \"Callable\"."]],
  ["Dictionary.has_all(int名)", "func f(dic: Dictionary, w: int):\n\tprint(dic.has_all(w))\n", ["Invalid argument for \"has_all()\" function: argument 1 should be \"Array\" but is \"int\"."]],
  ["Dictionary.has_all(Array[int]名)", "func f(dic: Dictionary, w: Array[int]):\n\tprint(dic.has_all(w))\n", []],
  ["Dictionary.merge(null)", "func f(dic: Dictionary):\n\tprint(dic.merge(null))\n", ["Cannot get return value of call to \"merge()\" because it returns \"void\".", "Cannot pass a value of type \"null\" as \"Dictionary\".", "Invalid argument for \"merge()\" function: argument 1 should be \"Dictionary\" but is \"null\"."]],
  ["Dictionary.merge(Callable名)", "func f(dic: Dictionary, w: Callable):\n\tprint(dic.merge(w))\n", ["Cannot get return value of call to \"merge()\" because it returns \"void\".", "Invalid argument for \"merge()\" function: argument 1 should be \"Dictionary\" but is \"Callable\"."]],
  ["Dictionary.merge(int名)", "func f(dic: Dictionary, w: int):\n\tprint(dic.merge(w))\n", ["Cannot get return value of call to \"merge()\" because it returns \"void\".", "Invalid argument for \"merge()\" function: argument 1 should be \"Dictionary\" but is \"int\"."]],
  ["Dictionary.merge(Array[int]名)", "func f(dic: Dictionary, w: Array[int]):\n\tprint(dic.merge(w))\n", ["Cannot get return value of call to \"merge()\" because it returns \"void\".", "Invalid argument for \"merge()\" function: argument 1 should be \"Dictionary\" but is \"Array[int]\"."]],
  ["Dictionary.merged(null)", "func f(dic: Dictionary):\n\tprint(dic.merged(null))\n", ["Cannot pass a value of type \"null\" as \"Dictionary\".", "Invalid argument for \"merged()\" function: argument 1 should be \"Dictionary\" but is \"null\"."]],
  ["Dictionary.merged(Callable名)", "func f(dic: Dictionary, w: Callable):\n\tprint(dic.merged(w))\n", ["Invalid argument for \"merged()\" function: argument 1 should be \"Dictionary\" but is \"Callable\"."]],
  ["Dictionary.merged(int名)", "func f(dic: Dictionary, w: int):\n\tprint(dic.merged(w))\n", ["Invalid argument for \"merged()\" function: argument 1 should be \"Dictionary\" but is \"int\"."]],
  ["Dictionary.merged(Array[int]名)", "func f(dic: Dictionary, w: Array[int]):\n\tprint(dic.merged(w))\n", ["Invalid argument for \"merged()\" function: argument 1 should be \"Dictionary\" but is \"Array[int]\"."]],
  ["Dictionary.recursive_equal(null)", "func f(dic: Dictionary):\n\tprint(dic.recursive_equal(null))\n", ["Cannot pass a value of type \"null\" as \"Dictionary\".", "Invalid argument for \"recursive_equal()\" function: argument 1 should be \"Dictionary\" but is \"null\".", "Too few arguments for \"recursive_equal()\" call. Expected at least 2 but received 1."]],
  ["Dictionary.recursive_equal(Callable名)", "func f(dic: Dictionary, w: Callable):\n\tprint(dic.recursive_equal(w))\n", ["Invalid argument for \"recursive_equal()\" function: argument 1 should be \"Dictionary\" but is \"Callable\".", "Too few arguments for \"recursive_equal()\" call. Expected at least 2 but received 1."]],
  ["Dictionary.recursive_equal(int名)", "func f(dic: Dictionary, w: int):\n\tprint(dic.recursive_equal(w))\n", ["Invalid argument for \"recursive_equal()\" function: argument 1 should be \"Dictionary\" but is \"int\".", "Too few arguments for \"recursive_equal()\" call. Expected at least 2 but received 1."]],
  ["Dictionary.recursive_equal(Array[int]名)", "func f(dic: Dictionary, w: Array[int]):\n\tprint(dic.recursive_equal(w))\n", ["Invalid argument for \"recursive_equal()\" function: argument 1 should be \"Dictionary\" but is \"Array[int]\".", "Too few arguments for \"recursive_equal()\" call. Expected at least 2 but received 1."]],
  ["PackedInt64Array.bsearch(null)", "func f(bb: PackedInt64Array):\n\tprint(bb.bsearch(1, null))\n", ["Cannot pass a value of type \"null\" as \"bool\".", "Invalid argument for \"bsearch()\" function: argument 2 should be \"bool\" but is \"null\"."]],
  ["PackedInt64Array.bsearch(Callable名)", "func f(bb: PackedInt64Array, w: Callable):\n\tprint(bb.bsearch(1, w))\n", ["Invalid argument for \"bsearch()\" function: argument 2 should be \"bool\" but is \"Callable\"."]],
  ["PackedInt64Array.bsearch(int名)", "func f(bb: PackedInt64Array, w: int):\n\tprint(bb.bsearch(1, w))\n", []],
  ["PackedInt64Array.bsearch(Array[int]名)", "func f(bb: PackedInt64Array, w: Array[int]):\n\tprint(bb.bsearch(1, w))\n", ["Invalid argument for \"bsearch()\" function: argument 2 should be \"bool\" but is \"Array[int]\"."]],
  ["PackedFloat64Array.bsearch(null)", "func f(bb: PackedFloat64Array):\n\tprint(bb.bsearch(1.5, null))\n", ["Cannot pass a value of type \"null\" as \"bool\".", "Invalid argument for \"bsearch()\" function: argument 2 should be \"bool\" but is \"null\"."]],
  ["PackedFloat64Array.bsearch(Callable名)", "func f(bb: PackedFloat64Array, w: Callable):\n\tprint(bb.bsearch(1.5, w))\n", ["Invalid argument for \"bsearch()\" function: argument 2 should be \"bool\" but is \"Callable\"."]],
  ["PackedFloat64Array.bsearch(int名)", "func f(bb: PackedFloat64Array, w: int):\n\tprint(bb.bsearch(1.5, w))\n", []],
  ["PackedFloat64Array.bsearch(Array[int]名)", "func f(bb: PackedFloat64Array, w: Array[int]):\n\tprint(bb.bsearch(1.5, w))\n", ["Invalid argument for \"bsearch()\" function: argument 2 should be \"bool\" but is \"Array[int]\"."]],
  ["PackedVector3Array.bsearch(null)", "func f(bb: PackedVector3Array):\n\tprint(bb.bsearch(Vector3(1, 2, 3), null))\n", ["Cannot pass a value of type \"null\" as \"bool\".", "Invalid argument for \"bsearch()\" function: argument 2 should be \"bool\" but is \"null\"."]],
  ["PackedVector3Array.bsearch(Callable名)", "func f(bb: PackedVector3Array, w: Callable):\n\tprint(bb.bsearch(Vector3(1, 2, 3), w))\n", ["Invalid argument for \"bsearch()\" function: argument 2 should be \"bool\" but is \"Callable\"."]],
  ["PackedVector3Array.bsearch(int名)", "func f(bb: PackedVector3Array, w: int):\n\tprint(bb.bsearch(Vector3(1, 2, 3), w))\n", []],
  ["PackedVector3Array.bsearch(Array[int]名)", "func f(bb: PackedVector3Array, w: Array[int]):\n\tprint(bb.bsearch(Vector3(1, 2, 3), w))\n", ["Invalid argument for \"bsearch()\" function: argument 2 should be \"bool\" but is \"Array[int]\"."]],
];

describe("容器面形参标注名接收者的 void 那句与容器槽的两档来源", () => {
  for (const [label, body, want] of CELLS) {
    it(label, async () => eq("509", label, await msgs(body), want));
  }
});
