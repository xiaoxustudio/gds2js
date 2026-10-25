/**
 * 内建类型名当接收者、成员名 `new` 的解析期两句（尺 `tmp/probe728/new-member.compare.txt` + `extra.compare.txt`，廿一面逐形一脚本）。
 *   引擎：`Cannot find member "new" in base "<面>".` **同一句发两遍**（属性读那一形，与 pack 的 S415 同形）。
 *   出货此前分两种坏法：`Vector*` / `Color` / `String` / `Array` 落到运行期发我们的自述，
 *   `Dictionary` / `StringName` / `NodePath` 与九支 pack 直接 JS 崩（`Dictionary is not defined`）—— 属「Godot 解析期拒、我们编得过跑崩」。
 *   对照面：原生类名（`RefCounted` / `Object` / `Node` …）当接收者时引擎**收下**并给 `GDScriptNativeClass::new`
 *   那支 Callable，属 §6 划给 Tier 2 的「引擎类值的属性面」，这里钉「一句都不发」，别把它一起拦了。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const FACES = [
  "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", "Vector4i", "Color",
  "String", "StringName", "NodePath", "Array", "Dictionary",
  "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array",
  "PackedStringArray", "PackedByteArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray",
];
const NATIVE_CLASSES = ["RefCounted", "Object", "Node", "Resource", "FileAccess", "GDScript"];

async function msgs(expr: string): Promise<string[]> {
  const src = "extends SceneTree\n\nfunc c():\n\tprint(" + expr + ")\n";
  return analyze(lower(await parseSource(src))).diagnostics.map((d) => d.message).sort();
}

const CELLS: Array<[string, string[]]> = [
  ...FACES.map((f): [string, string[]] => {
    const one = `Cannot find member "new" in base "${f}".`;
    return [`${f}.new`, [one, one]];
  }),
  ...["Array", "Vector2", "Dictionary"].map((f): [string, string[]] => [
    `${f}.new()`,
    [`Cannot find member "new" in base "${f}".`, `Function "new()" not found in base ${f}.`].sort(),
  ]),
  ...NATIVE_CLASSES.map((f): [string, string[]] => [`${f}.new`, []]),
];

describe("内建类型名的 .new 当值：解析期两句，原生类名不收", () => {
  for (const [expr, want] of CELLS) it(expr, async () => eq("728", expr, await msgs(expr), want));
});
