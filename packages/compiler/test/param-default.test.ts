/**
 * 形参默认值那一格的解析期两句（S448）：220 格槽 × 源分片对过裁判（尺 `tmp/d6/pd4.py`，读数 `tmp/d6/pd2-table.txt`），
 * 这里钉句子模板与「只收自己那一型」的那批槽 —— 容器来源只发第二句，`^"…"` 在这一格是证得出的源。
 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(decl: string): Promise<string[]> {
  const src = "extends SceneTree\n\n" + decl + "\n\treturn 1\n";
  return analyze(lower(await parseSource(src))).diagnostics
    .filter((d) => d.code === "param-default-value" || d.code === "param-default-assign")
    .map((d) => d.message);
}

const as = (t: string, v: string) => `Cannot assign a value of type ${t} to parameter "a" with specified type ${v}.`;

describe("形参默认值 · 两句", () => {
  const TWO: Array<[string, string, string]> = [
    ["数槽收值型", "int", "Vector2(1, 2)"],
    ["数槽收 Color", "int", "Color(1, 2, 3, 4)"],
    ["数槽收 NodePath", "int", '^"a/b"'],
    ["String 槽收 int", "String", "1"],
    ["StringName 槽收 NodePath", "StringName", '^"a/b"'],
    ["向量槽收 NodePath", "Vector2", '^"a/b"'],
    ["D6 槽收 null", "Rect2", "null"],
    ["D6 槽收串", "AABB", '"s"'],
    ["引用槽收 int", "Callable", "1"],
    ["信号槽收串", "Signal", '"s"'],
  ];
  it.each(TWO)("%s", async (_l, slot, val) => {
    expect(await msgs(`func a(a: ${slot} = ${val}):`)).toEqual([
      `Cannot assign a value of type "${label(val)}" as "${slot}".`,
      as(label(val), slot),
    ]);
  });

  const ONE: Array<[string, string]> = [
    ["int", "[1]"],
    ["Vector2", '{"k": 1}'],
    ["Rect2", "[1]"],
    ["Array", '{"k": 1}'],
  ];
  it.each(ONE)("容器来源只发第二句：%s 槽", async (slot, val) => {
    expect(await msgs(`func a(a: ${slot} = ${val}):`)).toEqual([as(label(val), slot)]);
  });

  const OK: Array<[string, string]> = [
    ["int", "1"], ["int", "1.5"], ["int", "true"], ["bool", "1.5"],
    ["String", '"s"'], ["String", '&"a"'], ["String", '^"a/b"'],
    ["StringName", '"s"'], ["NodePath", '"s"'], ["NodePath", '^"a/b"'],
    ["Color", "1"], ["Color", '"s"'], ["Color", "Color(1, 2, 3, 4)"],
    ["Array", "[1]"], ["Dictionary", '{"k": 1}'], ["Vector2", "Vector2(1, 2)"],
  ];
  it.each(OK)("%s 槽收 %s", async (slot, val) => {
    expect(await msgs(`func a(a: ${slot} = ${val}):`)).toEqual([]);
  });

  it("lambda 形参同一判据（S449 的 72 格）", async () => {
    const src = "extends SceneTree\n\nfunc k():\n\tvar lam = func(a: int = \"s\"):\n\t\treturn 1\n\treturn lam\n";
    const got = analyze(lower(await parseSource(src))).diagnostics
      .filter((d) => d.code.startsWith("param-default"))
      .map((d) => d.message);
    expect(got).toEqual([
      'Cannot assign a value of type "String" as "int".',
      as("String", "int"),
    ]);
    const okSrc = "extends SceneTree\n\nfunc k():\n\tvar lam = func(a: String = ^\"a/b\"):\n\t\treturn 1\n\treturn lam\n";
    expect(
      analyze(lower(await parseSource(okSrc))).diagnostics.filter((d) => d.code.startsWith("param-default")),
    ).toEqual([]);
  });
});

function label(val: string): string {
  if (val.startsWith('"')) return "String";
  if (val.startsWith("&")) return "StringName";
  if (val.startsWith("^")) return "NodePath";
  if (val.startsWith("[")) return "Array";
  if (val.startsWith("{")) return "Dictionary";
  if (val === "null") return "null";
  if (val === "true") return "bool";
  if (val.startsWith("Vector")) return "Vector2";
  if (val.startsWith("Color")) return "Color";
  return val.includes(".") ? "float" : "int";
}
