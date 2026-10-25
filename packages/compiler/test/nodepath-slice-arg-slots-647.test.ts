/** `NodePath.slice()` 两位形参拒（S647）。读数 `tmp/probe644/st_{typedstr,typedvec,typednull,arr,litstr,litfloat}.gd`、
 *  `nm_named{str,vec,arr,null,int}annot.gd` 与 `q_{p2str,p2vec,p2null,p2arr,l1arr}.gd`：字面量给两句（Array 只给第二句）、
 *  **标注**名只给第二句、推断名与 `Variant` 名一句不发（交回运行期那句），float / bool 两位都收。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const HEAD = 'extends SceneTree\n\nfunc _initialize():\n\tvar x: NodePath = NodePath("a/b/c")\n';
const src = (call: string): string => `${HEAD}\t${call}\n\tquit()\n`;
const PASS = (t: string): string => `Cannot pass a value of type "${t}" as "int".`;
const BAD = (n: number, t: string): string => `Invalid argument for "slice()" function: argument ${String(n)} should be "int" but is "${t}".`;

const CASES: Array<[string, string, string[]]> = [
  ["字面量 String 两位都两句（第一位）", src("\tx.slice(\"a\")"), [PASS("String"), BAD(1, "String")]],
  ["字面量 Vector2i 同形", src("\tx.slice(Vector2i(1, 2))"), [PASS("Vector2i"), BAD(1, "Vector2i")]],
  ["字面量 null 也两句", src("\tx.slice(null)"), [PASS("null"), BAD(1, "null")]],
  ["字面量 Array 只第二句", src("\tx.slice([1])"), [BAD(1, "Array")]],
  ["第二位同一判据：String", src("\tx.slice(0, \"a\")"), [PASS("String"), BAD(2, "String")]],
  ["第二位：null", src("\tx.slice(0, null)"), [PASS("null"), BAD(2, "null")]],
  ["第二位：Array 只第二句", src("\tx.slice(0, [1])"), [BAD(2, "Array")]],
  ["float 与 bool 两位都收", src("\tx.slice(0.0, 1.0)"), []],
  ["标注名只回第二句（String）", 'extends SceneTree\n\nfunc _initialize():\n\tvar s: String = "a"\n\tvar x: NodePath = NodePath("a/b/c")\n\tx.slice(s)\n\tquit()\n', [BAD(1, "String")]],
  ["标注名只回第二句（Vector2i）", 'extends SceneTree\n\nfunc _initialize():\n\tvar v: Vector2i = Vector2i(1, 2)\n\tvar x: NodePath = NodePath("a/b/c")\n\tx.slice(v)\n\tquit()\n', [BAD(1, "Vector2i")]],
  ["标注名 Array 同句", 'extends SceneTree\n\nfunc _initialize():\n\tvar a: Array = [1]\n\tvar x: NodePath = NodePath("a/b/c")\n\tx.slice(a)\n\tquit()\n', [BAD(1, "Array")]],
  ["标注 int 名收下", 'extends SceneTree\n\nfunc _initialize():\n\tvar i: int = 1\n\tvar x: NodePath = NodePath("a/b/c")\n\tx.slice(i)\n\tquit()\n', []],
  ["Variant 名一句不发（运行期那句归 runtime 钉）", 'extends SceneTree\n\nfunc _initialize():\n\tvar z: Variant = null\n\tvar x: NodePath = NodePath("a/b/c")\n\tx.slice(z)\n\tquit()\n', []],
  ["推断名一句不发", 'extends SceneTree\n\nfunc _initialize():\n\tvar s = "a"\n\tvar x: NodePath = NodePath("a/b/c")\n\tx.slice(s)\n\tquit()\n', []],
];

describe("analyze · NodePath.slice 的两位形参拒", () => {
  it.each(CASES)("%s", async (_name, source, expected) => {
    const got = analyze(lower(await parseSource(source))).diagnostics.map((d) => d.message);
    expect(got, `源：\n${source}`).toEqual(expected);
  });
});
