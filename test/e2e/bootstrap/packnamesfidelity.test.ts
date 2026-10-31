import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { checkPackFaceNames } from "../../../packages/compiler/src/analyze/checks/collections/pack";
import { resetRun } from "../../../packages/compiler/src/analyze/state";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("pk6d|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("pk6|src|")).length;

const SOURCES = [
  "func f(p: PackedByteArray):\n\tp.nope()\n",
  'func f():\n\tvar s: StringName = &"a"\n\ts.nope()\n',
  "func f(p: PackedByteArray):\n\tvar x = p.nope\n",
  "var a: Array[int] = []\nfunc f():\n\tvar x = a.new()\n",
  "func f(p: PackedByteArray):\n\tp.size = 1\n",
];

describe("bootstrap · pack 面缺名检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② pack-face-names ${String(i)}`, async () => {
      const mod = lower(await parseSource(SOURCES[i]!));
      resetRun("t");
      const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
      checkPackFaceNames(mod, diags as never[]);
      const want = diags.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
