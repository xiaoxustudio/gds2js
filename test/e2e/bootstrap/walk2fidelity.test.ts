import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { Scope, resetRun } from "../../../packages/compiler/src/analyze/state";
import { checkFunc, markClassFaceReceivers, seedOuterNames } from "../../../packages/compiler/src/analyze/walk";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("wkd|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("wk|src|")).length;

const SOURCES = [
  "func f():\n\treturn zzz\n",
  "func f():\n\tvar a = 1\n\treturn a\n",
  "static func s():\n\treturn self\n",
  "func f():\n\tbreak\n",
  'func f():\n\tvar a = 1 + "s"\n',
  'func f():\n\tprint(pow(1, "x"))\n',
  "class K:\n\tstatic func s():\n\t\tpass\nfunc f():\n\tK.s()\n",
  "func f():\n\tvar x = 5\n\tif x:\n\t\tprint(zz)\n",
  "func f():\n\tvar a = 1\n\tfor i in [1]:\n\t\tbreak\n",
];

describe("bootstrap · 语义走树与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② walk ${String(i)}`, async () => {
      const mod = lower(await parseSource(SOURCES[i]!));
      resetRun("t");
      seedOuterNames(mod);
      markClassFaceReceivers(mod);
      const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
      const base = new Scope(new Set(), null);
      for (const f of mod.funcs) checkFunc(f, base, new Set(), diags as never[]);
      const want = diags.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
