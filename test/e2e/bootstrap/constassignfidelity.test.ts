import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { checkConstAssign } from "../../../packages/compiler/src/analyze/checks/decls";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("cad|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("ca|src|")).length;

const SOURCES = [
  "const A = 1\nfunc f():\n\tA = 2\n",
  "const A = 1\nfunc f():\n\tvar A = 2\n\tA = 3\n",
  "func f():\n\tPI = 1\n",
  "func f():\n\tprint = 1\n",
  "func f():\n\tNode = 1\n",
  "func f():\n\tvar lam = func():\n\t\tPI = 1\n",
  "class K:\n\tconst B = 1\n\tfunc g():\n\t\tB = 2\n",
  "const C = 1\nfunc f():\n\tvar v = func():\n\t\tC = 2\n",
];

describe("bootstrap · 常量改值检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② const-assign ${String(i)}`, async () => {
      let mod;
      try {
        mod = lower(await parseSource(SOURCES[i]!));
      } catch {
        expect(gd.get(String(i)) ?? []).toEqual([]);
        return;
      }
      const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
      checkConstAssign(mod, diags as never[], new Set());
      const want = diags.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
