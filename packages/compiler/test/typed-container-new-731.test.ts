/**
 * 定形容器与值型**标注接收者**的 `.new`（尺 `tmp/probe730/` + `tmp/probe731/` + 语料 449）：
 *   定形 `Array[...]` 与值型标注两句；**定形 `Dictionary[...]` 只发一句**（两处独立读数一致，别按 Array 类推）；
 *   不定形 `Dictionary` 接收者是运行期那句，解析期一句都不发；元素读（`aa[0].new`）的 base 是**元素面**自己。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(body: string): Promise<string[]> {
  const src = "extends SceneTree\n\nfunc _init():\n\t" + body + "\n";
  return analyze(lower(await parseSource(src))).map((d) => d.message);
}

const TWO = (face: string): string[] => [`Cannot find member "new" in base "${face}".`, `Cannot find member "new" in base "${face}".`];

const CELLS: Array<[string, string[]]> = [
  ['var a: Array[int] = [1]\n\tprint(a.new)', TWO("Array[int]")],
  ['var a: Array[String] = ["x"]\n\tprint(a.new)', TWO("Array[String]")],
  ['var aa: Array[Vector2] = [Vector2(1, 2)]\n\tprint(aa[0].new)', TWO("Vector2")],
  ['var d: Dictionary[int,String] = {1: "x"}\n\tprint(d.new)', [`Cannot find member "new" in base "Dictionary[int, String]".`]],
  ['var m: Dictionary = {}\n\tprint(m.new)', []],
  ['var v: Vector2 = Vector2(1, 2)\n\tprint(v.new)', TWO("Vector2")],
  ['var s: String = "ab"\n\tprint(s.new)', TWO("String")],
  ['var p: PackedInt32Array = PackedInt32Array([1])\n\tprint(p.new)', TWO("PackedInt32Array")],
];

describe("定形容器与标注接收者的 .new", () => {
  for (const [body, want] of CELLS) it(body.replace(/\n\t/g, " "), async () => eq("731", body, await msgs(body), want));
});
