/**
 * 容器方法的接收者写成内部类字段（S510a）：`class Q: var d: Dictionary` 之后 `print(d.merge(w))` 引擎照发 void 那一句，
 * 容器档槽对 `null` 两句齐发、对 `Callable` 只回第二句 —— 与形参标注名那一形（S509）一字一样。
 * 尺 `tmp/d6/s510a.py` 三十二格（八位容器位子 × 四种实参），读数同名 `.json`。

 * 容器面方法的接收者写成形参标注名（S509）：`func f(a: Array)` 之后 `print(a.assign(w))` 引擎照发 void 那一句，
 * 槽型是 `Array` / `Dictionary` 那一位对 `null` 两句齐发、对 `Callable` 只回第二句；pack 另三面的 `bsearch` `b` 位同判。
 * 尺 `tmp/d6/s509.py` 四十四格（八位容器位子 × 四种实参 + 三面 pack 的 b 位 × 四种实参），读数同名 `.json`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(body: string): Promise<string[]> {
  const src = "extends SceneTree" + "\n\n" + body;
  return analyze(lower(await parseSource(src))).map((d) => d.message).sort();
}

const CELLS: Array<[string, string, string[]]> = [
  ["Array.append_array(null)", "class Q:\n\tvar arr: Array = Array()\n\n\tfunc g():\n\t\tprint(arr.append_array(null))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\".", "Cannot pass a value of type \"null\" as \"Array\".", "Invalid argument for \"append_array()\" function: argument 1 should be \"Array\" but is \"null\"."]],
  ["Array.append_array(Callable名)", "class Q:\n\tvar arr: Array = Array()\n\n\tfunc g(w: Callable):\n\t\tprint(arr.append_array(w))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\".", "Invalid argument for \"append_array()\" function: argument 1 should be \"Array\" but is \"Callable\"."]],
  ["Array.append_array(int名)", "class Q:\n\tvar arr: Array = Array()\n\n\tfunc g(w: int):\n\t\tprint(arr.append_array(w))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\".", "Invalid argument for \"append_array()\" function: argument 1 should be \"Array\" but is \"int\"."]],
  ["Array.append_array(Array[int]名)", "class Q:\n\tvar arr: Array = Array()\n\n\tfunc g(w: Array[int]):\n\t\tprint(arr.append_array(w))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\"."]],
  ["Array.assign(null)", "class Q:\n\tvar arr: Array = Array()\n\n\tfunc g():\n\t\tprint(arr.assign(null))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\".", "Cannot pass a value of type \"null\" as \"Array\".", "Invalid argument for \"assign()\" function: argument 1 should be \"Array\" but is \"null\"."]],
  ["Array.assign(Callable名)", "class Q:\n\tvar arr: Array = Array()\n\n\tfunc g(w: Callable):\n\t\tprint(arr.assign(w))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\".", "Invalid argument for \"assign()\" function: argument 1 should be \"Array\" but is \"Callable\"."]],
  ["Array.assign(int名)", "class Q:\n\tvar arr: Array = Array()\n\n\tfunc g(w: int):\n\t\tprint(arr.assign(w))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\".", "Invalid argument for \"assign()\" function: argument 1 should be \"Array\" but is \"int\"."]],
  ["Array.assign(Array[int]名)", "class Q:\n\tvar arr: Array = Array()\n\n\tfunc g(w: Array[int]):\n\t\tprint(arr.assign(w))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\"."]],
  ["Array.is_same_typed(null)", "class Q:\n\tvar arr: Array = Array()\n\n\tfunc g():\n\t\tprint(arr.is_same_typed(null))\n", ["Cannot pass a value of type \"null\" as \"Array\".", "Invalid argument for \"is_same_typed()\" function: argument 1 should be \"Array\" but is \"null\"."]],
  ["Array.is_same_typed(Callable名)", "class Q:\n\tvar arr: Array = Array()\n\n\tfunc g(w: Callable):\n\t\tprint(arr.is_same_typed(w))\n", ["Invalid argument for \"is_same_typed()\" function: argument 1 should be \"Array\" but is \"Callable\"."]],
  ["Array.is_same_typed(int名)", "class Q:\n\tvar arr: Array = Array()\n\n\tfunc g(w: int):\n\t\tprint(arr.is_same_typed(w))\n", ["Invalid argument for \"is_same_typed()\" function: argument 1 should be \"Array\" but is \"int\"."]],
  ["Array.is_same_typed(Array[int]名)", "class Q:\n\tvar arr: Array = Array()\n\n\tfunc g(w: Array[int]):\n\t\tprint(arr.is_same_typed(w))\n", []],
  ["Dictionary.assign(null)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g():\n\t\tprint(dic.assign(null))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\".", "Cannot pass a value of type \"null\" as \"Dictionary\".", "Invalid argument for \"assign()\" function: argument 1 should be \"Dictionary\" but is \"null\"."]],
  ["Dictionary.assign(Callable名)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g(w: Callable):\n\t\tprint(dic.assign(w))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\".", "Invalid argument for \"assign()\" function: argument 1 should be \"Dictionary\" but is \"Callable\"."]],
  ["Dictionary.assign(int名)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g(w: int):\n\t\tprint(dic.assign(w))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\".", "Invalid argument for \"assign()\" function: argument 1 should be \"Dictionary\" but is \"int\"."]],
  ["Dictionary.assign(Array[int]名)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g(w: Array[int]):\n\t\tprint(dic.assign(w))\n", ["Cannot get return value of call to \"assign()\" because it returns \"void\".", "Invalid argument for \"assign()\" function: argument 1 should be \"Dictionary\" but is \"Array[int]\"."]],
  ["Dictionary.has_all(null)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g():\n\t\tprint(dic.has_all(null))\n", ["Cannot pass a value of type \"null\" as \"Array\".", "Invalid argument for \"has_all()\" function: argument 1 should be \"Array\" but is \"null\"."]],
  ["Dictionary.has_all(Callable名)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g(w: Callable):\n\t\tprint(dic.has_all(w))\n", ["Invalid argument for \"has_all()\" function: argument 1 should be \"Array\" but is \"Callable\"."]],
  ["Dictionary.has_all(int名)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g(w: int):\n\t\tprint(dic.has_all(w))\n", ["Invalid argument for \"has_all()\" function: argument 1 should be \"Array\" but is \"int\"."]],
  ["Dictionary.has_all(Array[int]名)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g(w: Array[int]):\n\t\tprint(dic.has_all(w))\n", []],
  ["Dictionary.merge(null)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g():\n\t\tprint(dic.merge(null))\n", ["Cannot get return value of call to \"merge()\" because it returns \"void\".", "Cannot pass a value of type \"null\" as \"Dictionary\".", "Invalid argument for \"merge()\" function: argument 1 should be \"Dictionary\" but is \"null\"."]],
  ["Dictionary.merge(Callable名)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g(w: Callable):\n\t\tprint(dic.merge(w))\n", ["Cannot get return value of call to \"merge()\" because it returns \"void\".", "Invalid argument for \"merge()\" function: argument 1 should be \"Dictionary\" but is \"Callable\"."]],
  ["Dictionary.merge(int名)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g(w: int):\n\t\tprint(dic.merge(w))\n", ["Cannot get return value of call to \"merge()\" because it returns \"void\".", "Invalid argument for \"merge()\" function: argument 1 should be \"Dictionary\" but is \"int\"."]],
  ["Dictionary.merge(Array[int]名)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g(w: Array[int]):\n\t\tprint(dic.merge(w))\n", ["Cannot get return value of call to \"merge()\" because it returns \"void\".", "Invalid argument for \"merge()\" function: argument 1 should be \"Dictionary\" but is \"Array[int]\"."]],
  ["Dictionary.merged(null)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g():\n\t\tprint(dic.merged(null))\n", ["Cannot pass a value of type \"null\" as \"Dictionary\".", "Invalid argument for \"merged()\" function: argument 1 should be \"Dictionary\" but is \"null\"."]],
  ["Dictionary.merged(Callable名)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g(w: Callable):\n\t\tprint(dic.merged(w))\n", ["Invalid argument for \"merged()\" function: argument 1 should be \"Dictionary\" but is \"Callable\"."]],
  ["Dictionary.merged(int名)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g(w: int):\n\t\tprint(dic.merged(w))\n", ["Invalid argument for \"merged()\" function: argument 1 should be \"Dictionary\" but is \"int\"."]],
  ["Dictionary.merged(Array[int]名)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g(w: Array[int]):\n\t\tprint(dic.merged(w))\n", ["Invalid argument for \"merged()\" function: argument 1 should be \"Dictionary\" but is \"Array[int]\"."]],
  ["Dictionary.recursive_equal(null)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g():\n\t\tprint(dic.recursive_equal(null))\n", ["Cannot pass a value of type \"null\" as \"Dictionary\".", "Invalid argument for \"recursive_equal()\" function: argument 1 should be \"Dictionary\" but is \"null\".", "Too few arguments for \"recursive_equal()\" call. Expected at least 2 but received 1."]],
  ["Dictionary.recursive_equal(Callable名)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g(w: Callable):\n\t\tprint(dic.recursive_equal(w))\n", ["Invalid argument for \"recursive_equal()\" function: argument 1 should be \"Dictionary\" but is \"Callable\".", "Too few arguments for \"recursive_equal()\" call. Expected at least 2 but received 1."]],
  ["Dictionary.recursive_equal(int名)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g(w: int):\n\t\tprint(dic.recursive_equal(w))\n", ["Invalid argument for \"recursive_equal()\" function: argument 1 should be \"Dictionary\" but is \"int\".", "Too few arguments for \"recursive_equal()\" call. Expected at least 2 but received 1."]],
  ["Dictionary.recursive_equal(Array[int]名)", "class Q:\n\tvar dic: Dictionary = Dictionary()\n\n\tfunc g(w: Array[int]):\n\t\tprint(dic.recursive_equal(w))\n", ["Invalid argument for \"recursive_equal()\" function: argument 1 should be \"Dictionary\" but is \"Array[int]\".", "Too few arguments for \"recursive_equal()\" call. Expected at least 2 but received 1."]],
];

describe("容器方法内部类字段接收者的 void 那句", () => {
  for (const [label, body, want] of CELLS) {
    it(label, async () => eq("510", label, await msgs(body), want));
  }
});
