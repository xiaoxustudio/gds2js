import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { checkTypedCollections } from "../../../packages/compiler/src/analyze/checks/collections/typed";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("tyd|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("ty|src|")).length;

const SOURCES = [
  "var a: Array[int] = [1, 2]\n",
  'var a: Array[int] = ["s"]\n',
  "var a: Array[Vector2] = [1]\n",
  'var d: Dictionary[String, int] = {"k": "v"}\n',
  'var a: Array[int] = "s"\n',
  "var a: Array[Array[int]] = []\n",
  'var a: Array[int] = [1]\nfunc f():\n\ta = ["s"]\n',
  'func f(p: Array[int]):\n\tpass\nfunc g():\n\tvar v: Array[String] = ["s"]\n\tf(v)\n',
  "var a: Array[float] = [1, 2.5]\n",
  'class K:\n\tvar a: Array[int] = ["s"]\n',
];

describe("bootstrap · 定形容器检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② typed-collections ${String(i)}`, async () => {
      const mod = lower(await parseSource(SOURCES[i]!));
      const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
      checkTypedCollections(mod, diags as never[]);
      const want = diags.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
