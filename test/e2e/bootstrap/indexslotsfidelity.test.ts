import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { checkTypedIndexSlots } from "../../../packages/compiler/src/analyze/checks/collections/index-slots";
import { resetRun } from "../../../packages/compiler/src/analyze/state";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("ixd|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("ix|src|")).length;

const SOURCES = [
  'var a: Array[int] = [1]\nfunc f():\n\tvar x = a["s"]\n',
  'var d: Dictionary[String, int] = {}\nfunc f():\n\tvar x = d["k"]\n',
  'var d: Dictionary[String, int] = {}\nfunc f():\n\td["k"] = "v"\n',
  'var a: Array[int] = [1]\nfunc f():\n\ta["s"] = 1\n',
  'func f():\n\tvar a = [1]\n\tvar x = a["s"]\n',
  'func f():\n\tvar x = ["a"]["s"]\n',
];

describe("bootstrap · 定形容器下标检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② index-slots ${String(i)}`, async () => {
      const mod = lower(await parseSource(SOURCES[i]!));
      resetRun("t");
      const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
      checkTypedIndexSlots(mod, diags as never[]);
      const want = diags.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
