/**
 * 类名直调走哪一句：`Array` / `Dictionary` / `String` / `StringName` / `NodePath` 五面的三档分类（S506）。
 * 尺 `tmp/d6/s506.py` 十八格（十面 × 实例方法 / 表外名 / 真静态函数），读数同名 `.json`。
 * 引擎在这一形只有两支句子：**表里的实例方法**给 `Cannot call non-static function "M()" on the class "X" directly. Make an instance instead.`，
 * **表外名**给 `Cannot find member "n" in base "T".` + `Function "n()" not found in base T.` —— 都不是 `Identifier "X" not declared in the current scope.`；
 * 出货此前把这四个类名当未声明标识符、把 `String.find` 归进表外名，本轮按读数归位。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(body: string): Promise<string[]> {
  const src = "extends SceneTree\n\n" + body;
  return analyze(lower(await parseSource(src))).map((d) => d.message).sort();
}

const CELLS: Array<[string, string, string[]]> = [
  ["print(String.find(\"a\"))", "func f():\n\tprint(String.find(\"a\"))\n", ["Cannot call non-static function \"find()\" on the class \"String\" directly. Make an instance instead."]],
  ["print(String.zzz(1))", "func f():\n\tprint(String.zzz(1))\n", ["Cannot find member \"zzz\" in base \"String\".", "Function \"zzz()\" not found in base String."]],
  ["print(StringName.find(\"a\"))", "func f():\n\tprint(StringName.find(\"a\"))\n", ["Cannot call non-static function \"find()\" on the class \"StringName\" directly. Make an instance instead."]],
  ["print(StringName.zzz(1))", "func f():\n\tprint(StringName.zzz(1))\n", ["Cannot find member \"zzz\" in base \"StringName\".", "Function \"zzz()\" not found in base StringName."]],
  ["print(NodePath.get_name(0))", "func f():\n\tprint(NodePath.get_name(0))\n", ["Cannot call non-static function \"get_name()\" on the class \"NodePath\" directly. Make an instance instead."]],
  ["print(NodePath.zzz(1))", "func f():\n\tprint(NodePath.zzz(1))\n", ["Cannot find member \"zzz\" in base \"NodePath\".", "Function \"zzz()\" not found in base NodePath."]],
  ["print(Vector2.distance_to(Vector2(1, 2)))", "func f():\n\tprint(Vector2.distance_to(Vector2(1, 2)))\n", ["Cannot call non-static function \"distance_to()\" on the class \"Vector2\" directly. Make an instance instead."]],
  ["print(Vector2.zzz(1))", "func f():\n\tprint(Vector2.zzz(1))\n", ["Cannot find member \"zzz\" in base \"Vector2\".", "Function \"zzz()\" not found in base Vector2."]],
  ["print(Vector2i.distance_to(Vector2i(1, 2)))", "func f():\n\tprint(Vector2i.distance_to(Vector2i(1, 2)))\n", ["Cannot call non-static function \"distance_to()\" on the class \"Vector2i\" directly. Make an instance instead."]],
  ["print(Vector3.distance_to(Vector3(1, 2, 3)))", "func f():\n\tprint(Vector3.distance_to(Vector3(1, 2, 3)))\n", ["Cannot call non-static function \"distance_to()\" on the class \"Vector3\" directly. Make an instance instead."]],
  ["print(Vector3i.distance_to(Vector3i(1, 2, 3)))", "func f():\n\tprint(Vector3i.distance_to(Vector3i(1, 2, 3)))\n", ["Cannot call non-static function \"distance_to()\" on the class \"Vector3i\" directly. Make an instance instead."]],
  ["print(Color.zzz(1))", "func f():\n\tprint(Color.zzz(1))\n", ["Cannot find member \"zzz\" in base \"Color\".", "Function \"zzz()\" not found in base Color."]],
  ["print(Array.resize(1))", "func f():\n\tprint(Array.resize(1))\n", ["Cannot call non-static function \"resize()\" on the class \"Array\" directly. Make an instance instead."]],
  ["print(Array.zzz(1))", "func f():\n\tprint(Array.zzz(1))\n", ["Cannot find member \"zzz\" in base \"Array\".", "Function \"zzz()\" not found in base Array."]],
  ["print(Dictionary.get(\"a\", 1))", "func f():\n\tprint(Dictionary.get(\"a\", 1))\n", ["Cannot call non-static function \"get()\" on the class \"Dictionary\" directly. Make an instance instead."]],
  ["print(Dictionary.zzz(1))", "func f():\n\tprint(Dictionary.zzz(1))\n", ["Cannot find member \"zzz\" in base \"Dictionary\".", "Function \"zzz()\" not found in base Dictionary."]],
  ["print(PackedByteArray.zzz(1))", "func f():\n\tprint(PackedByteArray.zzz(1))\n", ["Cannot find member \"zzz\" in base \"PackedByteArray\".", "Function \"zzz()\" not found in base PackedByteArray."]],
];

describe("类名直调的非静态那句与表外名那两句", () => {
  for (const [label, body, want] of CELLS) {
    it(label, async () => eq("506", label, await msgs(body), want));
  }
});
