/**
 * 内建类型名**单独当值**用（`print(Dictionary)`）：引擎解析期两句（尺 `tmp/probe729/` 卅六名逐形实测，
 * 一形一脚本，`{int,float,bool}` 也在这一族、`Variant` 不在 —— 它只发第二句；
 * `RefCounted` / `Object` / `Node` / `MainLoop` 这些原生类名照收，一句都不发）。
 * 出货此前只发第二句，缺的是 `Builtin type cannot be used as a name on its own.`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const NAMES = [
  "int", "float", "bool", "String", "StringName", "NodePath", "Array", "Dictionary", "Color",
  "Rect2", "Rect2i", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", "Vector4i",
  "Transform2D", "Transform3D", "Basis", "Plane", "Quaternion", "AABB", "RID", "Callable", "Signal",
  "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array",
  "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray",
];
const NATIVE_CLASSES = ["RefCounted", "Object", "Node", "MainLoop"];

async function msgs(name: string): Promise<string[]> {
  const src = "extends SceneTree\n\nfunc c():\n\tprint(" + name + ")\n";
  return analyze(lower(await parseSource(src))).diagnostics.map((d) => d.message);
}

const CELLS: Array<[string, string[]]> = [
  ...NAMES.map((n): [string, string[]] => [
    n,
    ["Builtin type cannot be used as a name on its own.", `Identifier "${n}" not declared in the current scope.`],
  ]),
  ["Variant", ['Identifier "Variant" not declared in the current scope.']],
  ...NATIVE_CLASSES.map((n): [string, string[]] => [n, []]),
];

describe("内建类型名单独当值：解析期两句", () => {
  for (const [name, want] of CELLS) it(name, async () => eq("729", name, await msgs(name), want));
});
