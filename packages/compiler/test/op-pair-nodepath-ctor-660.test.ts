/** 二元运算两侧的解析期型拒补上 `NodePath("…")` 那一认（S660，读数 `tmp/probe660/o660.mts` 十四格 + `O_var_np.gd`）。
 *  引擎这一族有两句式：两侧都是字面量（含 `NodePath("a/b")` 这种一支字符串字面量的构造式）是
 *  `Invalid operands to operator +, NodePath and String.`；掺上「声明已知的非字面量」是第二式
 *  `Invalid operands "NodePath" and "String" for "+" operator.`（`var p: NodePath` 那一格）。
 *  此前四格 NodePath 形我们一句不发、拖到运行期才用第三种文案拒 —— 时机与句式两头都差。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const src = (expr: string): string => `extends SceneTree\n\nfunc _initialize():\n\tprint("V|", ${expr})\n\tquit()\n`;

const msgs = async (expr: string): Promise<string[]> =>
  analyze(lower(await parseSource(src(expr)))).map((d) => d.message);

const A = (op: string, l: string, r: string): string => `Invalid operands to operator ${op}, ${l} and ${r}.`;

const REFUSED: Array<[string, string]> = [
  ['NodePath("a/b") + "z"', A("+", "NodePath", "String")],
  ['"z" + NodePath("a/b")', A("+", "String", "NodePath")],
  ['NodePath("a/b") == "a/b"', A("==", "NodePath", "String")],
  ['NodePath("a/b") < "a/b"', A("<", "NodePath", "String")],
];

const ACCEPTED = ['NodePath("a/b") == NodePath("a/b")', '&"ab" + "z"', '&"ab" == "ab"', "[1] + [2]", "Vector2(1, 2) + Vector2(3, 4)", '{"a": 1}["a"] + 1'];

describe("analyze · NodePath 构造式参与运算的解析期型拒", () => {
  it.each(REFUSED)("%s 给引擎第一式那一句", async (expr, want) => {
    expect(await msgs(expr), expr).toEqual([want]);
  });

  it.each(ACCEPTED)("%s 一句不发", async (expr) => {
    expect(await msgs(expr), expr).toEqual([]);
  });

  it("标注侧那一格走第二式（既有通道，不动）", async () => {
    const source = 'extends SceneTree\n\nfunc _initialize():\n\tvar p: NodePath = NodePath("a/b")\n\tprint("V|", p + "z")\n\tquit()\n';
    expect(analyze(lower(await parseSource(source))).map((d) => d.message)).toEqual([
      'Invalid operands "NodePath" and "String" for "+" operator.',
    ]);
  });

  it("int / Color 掺 String 那几格仍是原句（同族基线）", async () => {
    expect(await msgs('1 + "z"')).toEqual([A("+", "int", "String")]);
    expect(await msgs('Color(1, 0, 0) + "z"')).toEqual([A("+", "Color", "String")]);
  });

  it("行号与引擎同格", async () => {
    const source = src('NodePath("a/b") + "z"');
    const at = source.split("\n").indexOf('\tprint("V|", NodePath("a/b") + "z")') + 1;
    const got = analyze(lower(await parseSource(source)));
    expect(got.map((d) => `${String(d.loc?.line)}|${d.message}`)).toEqual([`${String(at)}|${A("+", "NodePath", "String")}`]);
  });

  it('StringName("a") + 1 同族同式（读数 O_sn_ctor.gd）', async () => {
    expect(await msgs('StringName("a") + 1')).toEqual([A("+", "StringName", "int")]);
  });
});
