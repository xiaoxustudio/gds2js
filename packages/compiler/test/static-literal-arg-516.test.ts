/**
 * 静态名调用的字面量 kind 覆盖（S516，静态面第三张姊妹表）：`tmp/d6/s516.py` 二百零七格 +
 * `tmp/d6/s516b.py` 六十九格（单参静态法 × 廿三型字面量，加 `Color.from_string` pos2 / `Vector3.octahedron_decode` pos1 /
 * `String.num_int64` pos3 三个多参位），读数同名 `.json`。落地前 `STATIC_ARG_AS` 的 refuse 缺 NodePath / Vector2i /
 * Vector3 / Vector3i（引擎发 AS 双句），`STATIC_ARG_TYPES` 只列 Array / Dictionary 而缺九支 pack（引擎只回第二句），
 * 静态字面量放过 115+ 格。按 want 型从实测集重生成两表后复量 0 分歧。判据与 S514/S515 同一条：收/拒只由 `want` 决定。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(body: string): Promise<string[]> {
  const src = "extends SceneTree\n\nfunc c():\n" + body;
  return analyze(lower(await parseSource(src))).diagnostics.map((d) => d.message).sort();
}

const LIT: Array<[string, string]> = [
  ["int", "1"], ["float", "1.5"], ["bool", "true"], ["String", '"a"'], ["StringName", '&"a"'],
  ["NodePath", '^"a/b"'], ["Color", "Color(1, 0, 0)"], ["Vector2", "Vector2(1, 2)"], ["Vector2i", "Vector2i(1, 2)"],
  ["Vector3", "Vector3(1, 2, 3)"], ["Vector3i", "Vector3i(1, 2, 3)"], ["Array", "[1]"], ["Dictionary", "{1: 2}"],
  ["PackedByteArray", "PackedByteArray([1])"], ["PackedInt32Array", "PackedInt32Array([1])"],
  ["PackedInt64Array", "PackedInt64Array([1])"], ["PackedFloat32Array", "PackedFloat32Array([1.0])"],
  ["PackedFloat64Array", "PackedFloat64Array([1.0])"], ["PackedStringArray", 'PackedStringArray(["a"])'],
  ["PackedVector2Array", "PackedVector2Array([Vector2(1, 2)])"], ["PackedVector3Array", "PackedVector3Array([Vector3(1, 2, 3)])"],
  ["PackedColorArray", "PackedColorArray([Color(1, 0, 0)])"], ["null", "null"],
];

const AS_SETS: Record<string, string[]> = {
  float: ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"],
  int: ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"],
  bool: ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"],
  String: ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"],
  Color: ["NodePath", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "null"],
  Vector2: ["Color", "NodePath", "String", "StringName", "Vector3", "Vector3i", "bool", "float", "int", "null"],
};
const ACCEPT: Record<string, string[]> = {
  float: ["bool", "float", "int"], int: ["bool", "float", "int"], bool: ["bool", "float", "int"],
  String: ["NodePath", "String", "StringName"], Color: ["Color", "String", "int"], Vector2: ["Vector2", "Vector2i"],
};
const PACKS = ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array",
  "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"];

// (标签, 完整调用生成器, 方法名, 位, want)
const SLOTS: Array<[string, (lit: string) => string, string, number, string]> = [
  ["Color.hex", (l) => `Color.hex(${l})`, "hex", 1, "int"],
  ["Color.html", (l) => `Color.html(${l})`, "html", 1, "String"],
  ["String.chr", (l) => `String.chr(${l})`, "chr", 1, "int"],
  ["String.num_scientific", (l) => `String.num_scientific(${l})`, "num_scientific", 1, "float"],
  ["Vector2.from_angle", (l) => `Vector2.from_angle(${l})`, "from_angle", 1, "float"],
  ["Color.from_rgbe9995", (l) => `Color.from_rgbe9995(${l})`, "from_rgbe9995", 1, "int"],
  ["Color.from_string pos2", (l) => `Color.from_string("a", ${l})`, "from_string", 2, "Color"],
  ["Vector3.octahedron_decode", (l) => `Vector3.octahedron_decode(${l})`, "octahedron_decode", 1, "Vector2"],
  ["String.num_int64 pos3", (l) => `String.num_int64(1, 2, ${l})`, "num_int64", 3, "bool"],
];

function expect(meth: string, pos: number, want: string, kind: string): string[] {
  if (ACCEPT[want]!.includes(kind)) return [];
  const second = `Invalid argument for "${meth}()" function: argument ${pos} should be "${want}" but is "${kind}".`;
  if (PACKS.includes(kind)) return [second];
  if (AS_SETS[want]!.includes(kind)) return [`Cannot pass a value of type "${kind}" as "${want}".`, second].sort();
  return [];
}

describe("静态名调用：字面量 kind 按 want 型逐格对齐引擎（S516）", () => {
  for (const [label, build, meth, pos, want] of SLOTS) {
    for (const [kind, lit] of LIT) {
      it(`${label} · ${kind}`, async () => {
        eq("516", `${label} 配 ${kind}`, await msgs("\t" + build(lit) + "\n"), expect(meth, pos, want, kind));
      });
    }
  }
});
