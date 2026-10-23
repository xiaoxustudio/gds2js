/** StringName / NodePath 字面量直接点方法的**收形**（S651，值扫 `tmp/probe650/` 捞出的最大一族过拦）。
 *  vendored 语法把接收者吞进 ERROR 节点、调用段留成兄弟节点，此前这一面 212 形在下行就抛「表达式 ERROR 未支持」；
 *  下行里的恢复把两块拼回一次属性调用。值一侧逐形对过 4.6.3：3 / bc / a / true / x / bba / ab0000 / a+b / 0.5 / ABC。 */
import { describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const src = (expr: string): string => `extends SceneTree\n\nfunc _initialize():\n\tprint("Q|", ${expr})\n\tquit()\n`;

const SHAPES = [
  '&"abc".length()',
  '&"abc".substr(1)',
  '^"a/b".get_name(0)',
  '&"".is_empty()',
  '&"  x ".strip_edges()',
  '&"abc".md5_text()',
  '&"a".lpad(3, "b")',
  '&"ab".pad_zeros(4)',
  '&"a-b".replace("-", "+")',
  '&"abc".similarity("abd")',
  '&"abc".to_upper()',
  'str(&"a b c".split(" "))',
];

describe("lower · 字面量直接点方法收得下来", () => {
  it.each(SHAPES)("%s", async (expr) => {
    const tree = await parseSource(src(expr));
    expect(() => lower(tree), `源：\n${src(expr)}`).not.toThrow();
  });

  it("真·坏形状的 ERROR 仍报原来那句", async () => {
    const tree = await parseSource(src("print(&, 1)"));
    expect(() => lower(tree)).toThrow(/未支持/);
  });
});
