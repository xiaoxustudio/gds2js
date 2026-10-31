import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { checkClass } from "../../../packages/compiler/src/analyze/checks/decls";
import { Scope, resetRun } from "../../../packages/compiler/src/analyze/state";
import { classTable, markClassFaceReceivers, seedOuterNames } from "../../../packages/compiler/src/analyze/walk";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("clsd|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("cls|src|")).length;

const SOURCES = [
  "class K:\n\tvar a = 1\n\tfunc f():\n\t\treturn a\n",
  "class K:\n\tstatic var s = 1\n\tvar a = s\n",
  "class K:\n\tvar a = self.b\n",
  "class K:\n\tvar a = zzz\n",
  "class K:\n\tvar a:\n\t\tget:\n\t\t\treturn 1\n",
  "class K:\n\tstatic func s():\n\t\tpass\n\tvar a = s()\n",
];

describe("bootstrap · 类体检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② checkClass ${String(i)}`, async () => {
      const mod = lower(await parseSource(SOURCES[i]!));
      resetRun("t");
      seedOuterNames(mod);
      markClassFaceReceivers(mod);
      const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
      const classes = classTable(mod);
      const base = new Scope(new Set(), null);
      for (const c of mod.innerClasses) checkClass(c, base, diags as never[], classes);
      const want = diags.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
