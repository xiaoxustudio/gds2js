import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { checkTypedVarAssign } from "../../../packages/compiler/src/analyze/checks/collections/var-assign";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("vad|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("va|src|")).length;

const SOURCES = [
  'var a: int = 1\nvar b: int = "s"\n',
  'var a: int = 1\nfunc f():\n\ta = "s"\n',
  'var a: int = 1\nfunc f(x):\n\tvar y: int = "s"\n',
  "func f():\n\tprint(is_instance_of(1, 39))\n",
  "var a: Vector2 = Vector2(1, 2)\n",
  "class C:\n\tvar a: bool = 1\n",
  "var a: float = true\n",
];

describe("bootstrap · checkTypedVarAssign 与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② var-assign ${String(i)}`, async () => {
      const mod = lower(await parseSource(SOURCES[i]!));
      const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
      checkTypedVarAssign(mod, diags as never[]);
      const want = diags.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
