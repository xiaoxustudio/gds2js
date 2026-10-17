/**
 * 表外名那两句在**四种接收者 × 两式**上逐格对裁判（尺 `tmp/d6/s484.py` 一百二十八格 + `tmp/d6/s484b.py` 十三格，读数同名 `.json`）：
 * 名单就是 `BUILTIN_INSTANCE_MEMBERS` 的 dump 全集（S480 那一支），四形 —— 字面量 / 模块标注名 / 形参标注 / 构造式 —— 引擎句句同判（S484）。
 * 属性读那一形引擎把同一句报两遍；调用那一形是「找不到成员」+「not found in base」两句（第二句的类名不带引号）。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const SRC = 'extends SceneTree\n\nvar sn: StringName = &"ab"\nvar np: NodePath = ^"a/b/c"\n\nfunc f(p: PackedByteArray, q: PackedStringArray, b: PackedInt32Array, sp: StringName, npp: NodePath):\n\tprint(__EXPR__)\n';

async function face(expr: string): Promise<string[]> {
  const src = SRC.replace("__EXPR__", expr);
  return analyze(lower(await parseSource(src))).filter((d) => /^face-(member-(missing|not-found)|attr-missing)$/.test(d.code)).map((d) => d.message).sort();
}

const CELLS: Array<[string, string[]]> = [
  ["NodePath(\"a/b\").begins_with(1)", ["Cannot find member \"begins_with\" in base \"NodePath\".", "Function \"begins_with()\" not found in base NodePath."]],
  ["NodePath(\"a/b\").count(1)", ["Cannot find member \"count\" in base \"NodePath\".", "Function \"count()\" not found in base NodePath."]],
  ["NodePath(\"a/b\").find(1)", ["Cannot find member \"find\" in base \"NodePath\".", "Function \"find()\" not found in base NodePath."]],
  ["NodePath(\"a/b\").hex_encode()", ["Cannot find member \"hex_encode\" in base \"NodePath\".", "Function \"hex_encode()\" not found in base NodePath."]],
  ["NodePath(\"a/b\").is_same(1)", ["Cannot find member \"is_same\" in base \"NodePath\".", "Function \"is_same()\" not found in base NodePath."]],
  ["NodePath(\"a/b\").length", ["Cannot find member \"length\" in base \"NodePath\".", "Cannot find member \"length\" in base \"NodePath\"."]],
  ["NodePath(\"a/b\").nosuch()", ["Cannot find member \"nosuch\" in base \"NodePath\".", "Function \"nosuch()\" not found in base NodePath."]],
  ["NodePath(\"a/b\").pick_random()", ["Cannot find member \"pick_random\" in base \"NodePath\".", "Function \"pick_random()\" not found in base NodePath."]],
  ["NodePath(\"a/b\").simplify()", ["Cannot find member \"simplify\" in base \"NodePath\".", "Function \"simplify()\" not found in base NodePath."]],
  ["NodePath(\"a/b\").size", ["Cannot find member \"size\" in base \"NodePath\".", "Cannot find member \"size\" in base \"NodePath\"."]],
  ["NodePath(\"a/b\").zzz", ["Cannot find member \"zzz\" in base \"NodePath\".", "Cannot find member \"zzz\" in base \"NodePath\"."]],
  ["StringName(\"abcd\").get_name_count()", ["Cannot find member \"get_name_count\" in base \"StringName\".", "Function \"get_name_count()\" not found in base StringName."]],
  ["StringName(\"abcd\").hex_encode()", ["Cannot find member \"hex_encode\" in base \"StringName\".", "Function \"hex_encode()\" not found in base StringName."]],
  ["StringName(\"abcd\").is_same(1)", ["Cannot find member \"is_same\" in base \"StringName\".", "Function \"is_same()\" not found in base StringName."]],
  ["StringName(\"abcd\").nosuch()", ["Cannot find member \"nosuch\" in base \"StringName\".", "Function \"nosuch()\" not found in base StringName."]],
  ["StringName(\"abcd\").pick_random()", ["Cannot find member \"pick_random\" in base \"StringName\".", "Function \"pick_random()\" not found in base StringName."]],
  ["StringName(\"abcd\").simplify()", ["Cannot find member \"simplify\" in base \"StringName\".", "Function \"simplify()\" not found in base StringName."]],
  ["StringName(\"abcd\").size", ["Cannot find member \"size\" in base \"StringName\".", "Cannot find member \"size\" in base \"StringName\"."]],
  ["StringName(\"abcd\").slice(0)", ["Cannot find member \"slice\" in base \"StringName\".", "Function \"slice()\" not found in base StringName."]],
  ["StringName(\"abcd\").zzz", ["Cannot find member \"zzz\" in base \"StringName\".", "Cannot find member \"zzz\" in base \"StringName\"."]],
  ["^\"a/b\".begins_with(1)", ["Cannot find member \"begins_with\" in base \"NodePath\".", "Function \"begins_with()\" not found in base NodePath."]],
  ["^\"a/b\".count(1)", ["Cannot find member \"count\" in base \"NodePath\".", "Function \"count()\" not found in base NodePath."]],
  ["^\"a/b\".find(1)", ["Cannot find member \"find\" in base \"NodePath\".", "Function \"find()\" not found in base NodePath."]],
  ["^\"a/b\".hex_encode()", ["Cannot find member \"hex_encode\" in base \"NodePath\".", "Function \"hex_encode()\" not found in base NodePath."]],
  ["^\"a/b\".is_same(1)", ["Cannot find member \"is_same\" in base \"NodePath\".", "Function \"is_same()\" not found in base NodePath."]],
  ["^\"a/b\".length", ["Cannot find member \"length\" in base \"NodePath\".", "Cannot find member \"length\" in base \"NodePath\"."]],
  ["^\"a/b\".nosuch()", ["Cannot find member \"nosuch\" in base \"NodePath\".", "Function \"nosuch()\" not found in base NodePath."]],
  ["^\"a/b\".pick_random()", ["Cannot find member \"pick_random\" in base \"NodePath\".", "Function \"pick_random()\" not found in base NodePath."]],
  ["^\"a/b\".simplify()", ["Cannot find member \"simplify\" in base \"NodePath\".", "Function \"simplify()\" not found in base NodePath."]],
  ["^\"a/b\".size", ["Cannot find member \"size\" in base \"NodePath\".", "Cannot find member \"size\" in base \"NodePath\"."]],
  ["^\"a/b\".zzz", ["Cannot find member \"zzz\" in base \"NodePath\".", "Cannot find member \"zzz\" in base \"NodePath\"."]],
  ["b.nosuch()", ["Cannot find member \"nosuch\" in base \"PackedInt32Array\".", "Function \"nosuch()\" not found in base PackedInt32Array."]],
  ["np.begins_with(1)", ["Cannot find member \"begins_with\" in base \"NodePath\".", "Function \"begins_with()\" not found in base NodePath."]],
  ["np.count(1)", ["Cannot find member \"count\" in base \"NodePath\".", "Function \"count()\" not found in base NodePath."]],
  ["np.find(1)", ["Cannot find member \"find\" in base \"NodePath\".", "Function \"find()\" not found in base NodePath."]],
  ["np.hex_encode()", ["Cannot find member \"hex_encode\" in base \"NodePath\".", "Function \"hex_encode()\" not found in base NodePath."]],
  ["np.is_same(1)", ["Cannot find member \"is_same\" in base \"NodePath\".", "Function \"is_same()\" not found in base NodePath."]],
  ["np.length", ["Cannot find member \"length\" in base \"NodePath\".", "Cannot find member \"length\" in base \"NodePath\"."]],
  ["np.nosuch()", ["Cannot find member \"nosuch\" in base \"NodePath\".", "Function \"nosuch()\" not found in base NodePath."]],
  ["np.pick_random()", ["Cannot find member \"pick_random\" in base \"NodePath\".", "Function \"pick_random()\" not found in base NodePath."]],
  ["np.simplify()", ["Cannot find member \"simplify\" in base \"NodePath\".", "Function \"simplify()\" not found in base NodePath."]],
  ["np.size", ["Cannot find member \"size\" in base \"NodePath\".", "Cannot find member \"size\" in base \"NodePath\"."]],
  ["np.zzz", ["Cannot find member \"zzz\" in base \"NodePath\".", "Cannot find member \"zzz\" in base \"NodePath\"."]],
  ["npp.begins_with(1)", ["Cannot find member \"begins_with\" in base \"NodePath\".", "Function \"begins_with()\" not found in base NodePath."]],
  ["npp.count(1)", ["Cannot find member \"count\" in base \"NodePath\".", "Function \"count()\" not found in base NodePath."]],
  ["npp.find(1)", ["Cannot find member \"find\" in base \"NodePath\".", "Function \"find()\" not found in base NodePath."]],
  ["npp.hex_encode()", ["Cannot find member \"hex_encode\" in base \"NodePath\".", "Function \"hex_encode()\" not found in base NodePath."]],
  ["npp.is_same(1)", ["Cannot find member \"is_same\" in base \"NodePath\".", "Function \"is_same()\" not found in base NodePath."]],
  ["npp.length", ["Cannot find member \"length\" in base \"NodePath\".", "Cannot find member \"length\" in base \"NodePath\"."]],
  ["npp.nosuch()", ["Cannot find member \"nosuch\" in base \"NodePath\".", "Function \"nosuch()\" not found in base NodePath."]],
  ["npp.pick_random()", ["Cannot find member \"pick_random\" in base \"NodePath\".", "Function \"pick_random()\" not found in base NodePath."]],
  ["npp.simplify()", ["Cannot find member \"simplify\" in base \"NodePath\".", "Function \"simplify()\" not found in base NodePath."]],
  ["npp.size", ["Cannot find member \"size\" in base \"NodePath\".", "Cannot find member \"size\" in base \"NodePath\"."]],
  ["npp.zzz", ["Cannot find member \"zzz\" in base \"NodePath\".", "Cannot find member \"zzz\" in base \"NodePath\"."]],
  ["p.nosuch()", ["Cannot find member \"nosuch\" in base \"PackedByteArray\".", "Function \"nosuch()\" not found in base PackedByteArray."]],
  ["p.zzz", ["Cannot find member \"zzz\" in base \"PackedByteArray\".", "Cannot find member \"zzz\" in base \"PackedByteArray\"."]],
  ["q.hex_encode()", ["Cannot find member \"hex_encode\" in base \"PackedStringArray\".", "Function \"hex_encode()\" not found in base PackedStringArray."]],
  ["q.join(\"-\")", ["Cannot find member \"join\" in base \"PackedStringArray\".", "Function \"join()\" not found in base PackedStringArray."]],
  ["q.nosuch()", ["Cannot find member \"nosuch\" in base \"PackedStringArray\".", "Function \"nosuch()\" not found in base PackedStringArray."]],
  ["q.zzz", ["Cannot find member \"zzz\" in base \"PackedStringArray\".", "Cannot find member \"zzz\" in base \"PackedStringArray\"."]],
  ["sn.get_name_count()", ["Cannot find member \"get_name_count\" in base \"StringName\".", "Function \"get_name_count()\" not found in base StringName."]],
  ["sn.hex_encode()", ["Cannot find member \"hex_encode\" in base \"StringName\".", "Function \"hex_encode()\" not found in base StringName."]],
  ["sn.is_same(1)", ["Cannot find member \"is_same\" in base \"StringName\".", "Function \"is_same()\" not found in base StringName."]],
  ["sn.nosuch()", ["Cannot find member \"nosuch\" in base \"StringName\".", "Function \"nosuch()\" not found in base StringName."]],
  ["sn.pick_random()", ["Cannot find member \"pick_random\" in base \"StringName\".", "Function \"pick_random()\" not found in base StringName."]],
  ["sn.simplify()", ["Cannot find member \"simplify\" in base \"StringName\".", "Function \"simplify()\" not found in base StringName."]],
  ["sn.size", ["Cannot find member \"size\" in base \"StringName\".", "Cannot find member \"size\" in base \"StringName\"."]],
  ["sn.slice(0)", ["Cannot find member \"slice\" in base \"StringName\".", "Function \"slice()\" not found in base StringName."]],
  ["sn.zzz", ["Cannot find member \"zzz\" in base \"StringName\".", "Cannot find member \"zzz\" in base \"StringName\"."]],
  ["sp.get_name_count()", ["Cannot find member \"get_name_count\" in base \"StringName\".", "Function \"get_name_count()\" not found in base StringName."]],
  ["sp.hex_encode()", ["Cannot find member \"hex_encode\" in base \"StringName\".", "Function \"hex_encode()\" not found in base StringName."]],
  ["sp.is_same(1)", ["Cannot find member \"is_same\" in base \"StringName\".", "Function \"is_same()\" not found in base StringName."]],
  ["sp.nosuch()", ["Cannot find member \"nosuch\" in base \"StringName\".", "Function \"nosuch()\" not found in base StringName."]],
  ["sp.pick_random()", ["Cannot find member \"pick_random\" in base \"StringName\".", "Function \"pick_random()\" not found in base StringName."]],
  ["sp.simplify()", ["Cannot find member \"simplify\" in base \"StringName\".", "Function \"simplify()\" not found in base StringName."]],
  ["sp.size", ["Cannot find member \"size\" in base \"StringName\".", "Cannot find member \"size\" in base \"StringName\"."]],
  ["sp.slice(0)", ["Cannot find member \"slice\" in base \"StringName\".", "Function \"slice()\" not found in base StringName."]],
  ["sp.zzz", ["Cannot find member \"zzz\" in base \"StringName\".", "Cannot find member \"zzz\" in base \"StringName\"."]],
];

describe("表外名的两句：四种接收者两式逐格对引擎", () => {
  for (const [expr, want] of CELLS) it(expr, async () => eq("484", expr, await face(expr), want));
});
