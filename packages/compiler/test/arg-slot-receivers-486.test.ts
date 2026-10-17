/**
 * 形参那两句把剩下两形接上（S486，紧 S485）：模块级**标注**的 pack 名与链子交出的三面名字面 ——
 * 一百二十五格读数里引擎拒 93 格，出货此前放过 35 格、两边都有但缺形参那两句 10 格（尺 `tmp/d6/s486.py`，读数 `tmp/d6/s486.json`）。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const HEAD = 'extends SceneTree\n\nvar s: String = "41424344"\nvar sn: StringName = &"abcd"\nvar np: NodePath = ^"a/b"\nvar k0: PackedByteArray = PackedByteArray()\nvar k1: PackedInt32Array = PackedInt32Array()\nvar k2: PackedStringArray = PackedStringArray()\n';

async function msgs(expr: string): Promise<string[]> {
  const src = HEAD + "func c():\n\tprint(" + expr + ")\n";
  return analyze(lower(await parseSource(src))).map((d) => d.message).sort();
}

const CELLS: Array<[string, string[]]> = [
  ["k0.append(\"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["k0.append(1, 2)", ["Too many arguments for \"append()\" call. Expected at most 1 but received 2."]],
  ["k0.duplicate(1)", ["Too many arguments for \"duplicate()\" call. Expected at most 0 but received 1."]],
  ["k0.fill(\"a\")", ["Cannot get return value of call to \"fill()\" because it returns \"void\".", "Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"fill()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["k0.get(\"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"get()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["k0.insert(1, \"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"insert()\" function: argument 2 should be \"int\" but is \"String\"."]],
  ["k0.remove_at(\"a\")", ["Cannot get return value of call to \"remove_at()\" because it returns \"void\".", "Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"remove_at()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["k0.resize(\"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["k0.reverse(1)", ["Cannot get return value of call to \"reverse()\" because it returns \"void\".", "Too many arguments for \"reverse()\" call. Expected at most 0 but received 1."]],
  ["k0.set(1, 2)", ["Cannot get return value of call to \"set()\" because it returns \"void\"."]],
  ["k0.sort(1)", ["Cannot get return value of call to \"sort()\" because it returns \"void\".", "Too many arguments for \"sort()\" call. Expected at most 0 but received 1."]],
  ["k1.append(\"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["k1.append(1, 2)", ["Too many arguments for \"append()\" call. Expected at most 1 but received 2."]],
  ["k1.duplicate(1)", ["Too many arguments for \"duplicate()\" call. Expected at most 0 but received 1."]],
  ["k1.fill(\"a\")", ["Cannot get return value of call to \"fill()\" because it returns \"void\".", "Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"fill()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["k1.get(\"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"get()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["k1.insert(1, \"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"insert()\" function: argument 2 should be \"int\" but is \"String\"."]],
  ["k1.remove_at(\"a\")", ["Cannot get return value of call to \"remove_at()\" because it returns \"void\".", "Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"remove_at()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["k1.resize(\"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["k1.reverse(1)", ["Cannot get return value of call to \"reverse()\" because it returns \"void\".", "Too many arguments for \"reverse()\" call. Expected at most 0 but received 1."]],
  ["k1.set(1, 2)", ["Cannot get return value of call to \"set()\" because it returns \"void\"."]],
  ["k1.sort(1)", ["Cannot get return value of call to \"sort()\" because it returns \"void\".", "Too many arguments for \"sort()\" call. Expected at most 0 but received 1."]],
  ["k2.append(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"append()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["k2.append(1, 2)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"append()\" function: argument 1 should be \"String\" but is \"int\".", "Too many arguments for \"append()\" call. Expected at most 1 but received 2."]],
  ["k2.bsearch(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"bsearch()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["k2.bsearch(1, 2)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"bsearch()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["k2.count(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"count()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["k2.duplicate(1)", ["Too many arguments for \"duplicate()\" call. Expected at most 0 but received 1."]],
  ["k2.fill(\"a\")", ["Cannot get return value of call to \"fill()\" because it returns \"void\"."]],
  ["k2.find(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["k2.get(\"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"get()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["k2.has(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"has()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["k2.insert(1, 2)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"insert()\" function: argument 2 should be \"String\" but is \"int\"."]],
  ["k2.remove_at(\"a\")", ["Cannot get return value of call to \"remove_at()\" because it returns \"void\".", "Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"remove_at()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["k2.resize(\"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["k2.reverse(1)", ["Cannot get return value of call to \"reverse()\" because it returns \"void\".", "Too many arguments for \"reverse()\" call. Expected at most 0 but received 1."]],
  ["k2.set(1, 2)", ["Cannot get return value of call to \"set()\" because it returns \"void\".", "Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"set()\" function: argument 2 should be \"String\" but is \"int\"."]],
  ["k2.sort(1)", ["Cannot get return value of call to \"sort()\" because it returns \"void\".", "Too many arguments for \"sort()\" call. Expected at most 0 but received 1."]],
  ["np.get_concatenated_names().append(\"a\")", ["Cannot find member \"append\" in base \"StringName\".", "Function \"append()\" not found in base StringName."]],
  ["np.get_concatenated_names().append(1)", ["Cannot find member \"append\" in base \"StringName\".", "Function \"append()\" not found in base StringName."]],
  ["np.get_concatenated_names().bsearch(1)", ["Cannot find member \"bsearch\" in base \"StringName\".", "Function \"bsearch()\" not found in base StringName."]],
  ["np.get_concatenated_names().get(\"a\")", ["Cannot find member \"get\" in base \"StringName\".", "Function \"get()\" not found in base StringName."]],
  ["np.get_concatenated_names().set(1, \"a\")", ["Cannot find member \"set\" in base \"StringName\".", "Function \"set()\" not found in base StringName."]],
  ["s.bigrams().append(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"append()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["s.bigrams().begins_with(1)", ["Cannot find member \"begins_with\" in base \"PackedStringArray\".", "Function \"begins_with()\" not found in base PackedStringArray."]],
  ["s.bigrams().bsearch(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"bsearch()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["s.bigrams().count(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"count()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["s.bigrams().erase(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"erase()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["s.bigrams().find(\"a\", \"b\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"find()\" function: argument 2 should be \"int\" but is \"String\"."]],
  ["s.bigrams().find(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["s.bigrams().get(\"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"get()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["s.bigrams().insert(1, 2)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"insert()\" function: argument 2 should be \"String\" but is \"int\"."]],
  ["s.bigrams().lpad(1)", ["Cannot find member \"lpad\" in base \"PackedStringArray\".", "Function \"lpad()\" not found in base PackedStringArray."]],
  ["s.bigrams().set(1, \"a\")", ["Cannot get return value of call to \"set()\" because it returns \"void\"."]],
  ["s.bigrams().split(1)", ["Cannot find member \"split\" in base \"PackedStringArray\".", "Function \"split()\" not found in base PackedStringArray."]],
  ["s.hex_decode().append(\"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["s.hex_decode().begins_with(1)", ["Cannot find member \"begins_with\" in base \"PackedByteArray\".", "Function \"begins_with()\" not found in base PackedByteArray."]],
  ["s.hex_decode().find(\"a\", \"b\")", ["Cannot pass a value of type \"String\" as \"int\".", "Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"find()\" function: argument 1 should be \"int\" but is \"String\".", "Invalid argument for \"find()\" function: argument 2 should be \"int\" but is \"String\"."]],
  ["s.hex_decode().get(\"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"get()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["s.hex_decode().lpad(1)", ["Cannot find member \"lpad\" in base \"PackedByteArray\".", "Function \"lpad()\" not found in base PackedByteArray."]],
  ["s.hex_decode().set(1, \"a\")", ["Cannot get return value of call to \"set()\" because it returns \"void\".", "Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"set()\" function: argument 2 should be \"int\" but is \"String\"."]],
  ["s.hex_decode().split(1)", ["Cannot find member \"split\" in base \"PackedByteArray\".", "Function \"split()\" not found in base PackedByteArray."]],
  ["s.to_lower().append(\"a\")", ["Cannot find member \"append\" in base \"String\".", "Function \"append()\" not found in base String."]],
  ["s.to_lower().append(1)", ["Cannot find member \"append\" in base \"String\".", "Function \"append()\" not found in base String."]],
  ["s.to_lower().begins_with(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"begins_with()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["s.to_lower().bsearch(1)", ["Cannot find member \"bsearch\" in base \"String\".", "Function \"bsearch()\" not found in base String."]],
  ["s.to_lower().count(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"count()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["s.to_lower().find(\"a\", \"b\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"find()\" function: argument 2 should be \"int\" but is \"String\"."]],
  ["s.to_lower().find(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["s.to_lower().get(\"a\")", ["Cannot find member \"get\" in base \"String\".", "Function \"get()\" not found in base String."]],
  ["s.to_lower().insert(1, 2)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"insert()\" function: argument 2 should be \"String\" but is \"int\"."]],
  ["s.to_lower().set(1, \"a\")", ["Cannot find member \"set\" in base \"String\".", "Function \"set()\" not found in base String."]],
  ["s.to_lower().split(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"split()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["sn.to_lower().append(\"a\")", ["Cannot find member \"append\" in base \"String\".", "Function \"append()\" not found in base String."]],
  ["sn.to_lower().append(1)", ["Cannot find member \"append\" in base \"String\".", "Function \"append()\" not found in base String."]],
  ["sn.to_lower().begins_with(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"begins_with()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["sn.to_lower().bsearch(1)", ["Cannot find member \"bsearch\" in base \"String\".", "Function \"bsearch()\" not found in base String."]],
  ["sn.to_lower().count(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"count()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["sn.to_lower().find(\"a\", \"b\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"find()\" function: argument 2 should be \"int\" but is \"String\"."]],
  ["sn.to_lower().find(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["sn.to_lower().get(\"a\")", ["Cannot find member \"get\" in base \"String\".", "Function \"get()\" not found in base String."]],
  ["sn.to_lower().insert(1, 2)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"insert()\" function: argument 2 should be \"String\" but is \"int\"."]],
  ["sn.to_lower().set(1, \"a\")", ["Cannot find member \"set\" in base \"String\".", "Function \"set()\" not found in base String."]],
  ["sn.to_lower().split(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"split()\" function: argument 1 should be \"String\" but is \"int\"."]],
];

describe("模块标注 pack 名与链子名字面的形参两句", () => {
  for (const [expr, want] of CELLS) it(expr, async () => eq("486", expr, await msgs(expr), want));
});
