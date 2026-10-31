import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { checkNamedFace } from "../../../packages/compiler/src/analyze/checks/calls";
import { NODE_PATH_FACE, STRINGNAME_FACE } from "../../../packages/compiler/src/semantics/faces";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("nfd|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts[4]!}|${parts.slice(5).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("nf|src|")).length;

const SOURCES = [
  'func f():\n\tvar s: StringName = &"a"\n\ts.substr(1, 2, 3)\n',
  'func f():\n\tvar s = &"a"\n\ts.split(1)\n',
  'func f():\n\tvar s = ^"a"\n\ts.split(1)\n',
  'func f():\n\tvar s = NodePath("a")\n\ts.substr(1, 2, 3)\n',
  'func f():\n\t"a".substr(1, 2, 3)\n',
  'var s: StringName = &"a"\nfunc f():\n\ts.substr(1)\n',
];

describe("bootstrap · 具名面检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② namedFace ${String(i)}`, async () => {
      let mod;
      try {
        mod = lower(await parseSource(SOURCES[i]!));
      } catch {
        expect(gd.get(String(i)) ?? []).toEqual([]);
        return;
      }
      const rows: string[] = [];
      for (const [label, face] of [
        ["StringName", STRINGNAME_FACE],
        ["NodePath", NODE_PATH_FACE],
      ] as const) {
        const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
        checkNamedFace(mod, face, diags as never[]);
        for (const d of diags) rows.push(`${label}|${d.code}|${String(d.loc.line)}|${d.message}`);
      }
      expect(gd.get(String(i)) ?? []).toEqual(rows);
    });
  }
});
