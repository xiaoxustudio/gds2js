/** 字面量直接点方法**再接一个运算符**的收形（S659，CST 读数 `tmp/probe658/cstop2.mts`，值一侧随语料件 410 的 golden 对账）。
 *  vendored 语法把接收者吞进 ERROR：`arguments( string , ERROR(string_name) , binary_operator(base_call, OP, 右) )`，
 *  折法是「ERROR 里的字面量 + 运算符节点 left 槽那条 base_call 链」拼成 left，再交回现成的 `lowerBinary` 走运算符与结合级。
 *  只认量过的这一形：字面量在右操作数、两侧都是字面量链、运算符套运算符、三元 —— 都没量过，照旧响亮拒。 */
import { describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const src = (expr: string): string => `extends SceneTree\n\nfunc _initialize():\n\tprint("S|", ${expr})\n\tquit()\n`;

const findFirst = (node: unknown, kind: string): Record<string, unknown> | null => {
  if (node === null || typeof node !== "object") return null;
  const o = node as Record<string, unknown>;
  if (o.kind === kind) return o;
  for (const k of Object.keys(o)) {
    const r = findFirst(o[k], kind);
    if (r !== null) return r;
  }
  return null;
};

const bin = async (expr: string): Promise<Record<string, unknown> | null> =>
  findFirst(await lower(await parseSource(src(expr))), "binary");

const BIN = [
  '&"ab".capitalize() + "z"',
  '&"ab".length() == 3',
  '&"ab".length() != 2',
  '&"ab".length() < 2',
  '&"ab".length() >= 3',
  '&"ab".length() and true',
  '&"ab".length() or false',
  '&"ab".length() % 2',
  '&"ab".left(1) + "z"',
  '&"ab".hash() - 1',
  '&"ab".get_slice_count("/") + 1',
  '&"ab".length() + 1 * 2',
  '&"ab".length() in [2, 3]',
  'NodePath("a/b/c").slice(1) == "b/c"',
  'NodePath("a/b/c").get_name(1) + "x"',
  'NodePath("a/b").is_absolute() or true',
];

describe("lower · 字面量点方法再接一个运算符", () => {
  it.each(BIN)("%s 折成 binary，left 是那条调用链", async (expr) => {
    const got = await bin(expr);
    expect(got, `源：\n${src(expr)}`).not.toBeNull();
    const left = (got as Record<string, unknown>).left as Record<string, unknown>;
    expect(left.kind, JSON.stringify(left)).toBe("call");
    const callee = left.callee as Record<string, unknown>;
    expect(callee.kind, JSON.stringify(callee)).toBe("attribute");
    const obj = callee.obj as Record<string, unknown>;
    // 接收者两种证得出的形都算：字面量本身，或 `NodePath("a/b/c")` / `StringName("a")` 的构造式
    if (obj.kind === "call") expect((obj.callee as Record<string, unknown>).name, JSON.stringify(obj)).toBe("NodePath");
    else expect(obj.kind, JSON.stringify(obj)).toBe("lit");
  });

  it("运算符槽照原样落地", async () => {
    expect((await bin('&"ab".length() < 2'))?.op).toBe("<");
    expect((await bin('&"ab".length() == 3'))?.op).toBe("==");
    expect((await bin('&"ab".length() and true'))?.op).toBe("and");
    expect((await bin('NodePath("a/b").is_absolute() or true'))?.op).toBe("or");
  });

  it("两侧都是字面量链那一形没量过，照旧响亮拒", async () => {
    const tree = await parseSource(src('&"ab".length() + &"cd".length()'));
    expect(() => lower(tree)).toThrow(/未支持/);
  });

  it("运算符套运算符（left 槽是 binary_operator）没量过，照旧响亮拒", async () => {
    const tree = await parseSource(src('&"ab".length() * 2 + 1'));
    expect(() => lower(tree)).toThrow(/未支持/);
  });

  it("字面量在右操作数那一形没量过，照旧响亮拒", async () => {
    const tree = await parseSource(src('2 + &"ab".length()'));
    expect(() => lower(tree)).toThrow(/未支持/);
  });

  it("三元那一形没量过，照旧响亮拒", async () => {
    const tree = await parseSource(src('&"ab".length() if true else 0'));
    expect(() => lower(tree)).toThrow(/未支持/);
  });

  it("字面量不点方法直接参与运算，本来就走常规路（不是这一族的格子）", async () => {
    const got = await bin('&"ab" + "z"');
    expect(got?.op).toBe("+");
  });
});
