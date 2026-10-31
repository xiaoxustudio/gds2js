import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { checkValueMethodArity } from "../../../packages/compiler/src/analyze/checks/calls";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("vmd|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("vm|src|")).length;

const SOURCES = [
  "func f():\n\tvar x = pow(1)\n",
  'func f():\n\tvar x = abs("s")\n',
  "func f():\n\tvar x = Vector2(1, 2).bogus()\n",
  'var v = Vector2(1, 2)\nfunc f():\n\tvar x = v.lerp("s", 0.5)\n',
  "func f():\n\tvar x = Vector2.ZERO()\n",
  "func f():\n\tvar x = Vector2.nope()\n",
  "func f():\n\tvar x = char(4294967296)\n",
  "func f():\n\tvar x = String(1)\n",
];

describe("bootstrap · 值型方法面检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② value-method-arity ${String(i)}`, async () => {
      const mod = lower(await parseSource(SOURCES[i]!));
      const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
      checkValueMethodArity(mod, diags as never[]);
      const want = diags.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
