import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { checkDictDuplicateKeys } from "../../../packages/compiler/src/analyze/checks/collections/method-arity";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];

const sources = lines
  .filter((l) => l.startsWith("dup|"))
  .map((l) => {
    const [index, text] = l.slice(4).split("|", 2);
    return { index: index!, text: text!.replace(/~n/g, "\n") };
  });
const diags = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("dupdiag|"))) {
  const parts = l.split("|");
  const index = parts[1]!;
  const bucket = diags.get(index) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  diags.set(index, bucket);
}

describe("bootstrap · 字典重复键检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (sources.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(sources.length).toBeGreaterThanOrEqual(10);
  });

  for (const s of sources) {
    it(`② dup ${s.index} ${s.text.replace(/\n/g, "~n").slice(0, 40)}`, async (ctx) => {
      if (sources.length === 0) ctx.skip(true, "缺 gdsrc.txt");
      const mod = lower(await parseSource(`${s.text}\n`));
      const got: Array<{ code: string; message: string; loc: { line: number } }> = [];
      checkDictDuplicateKeys(mod, got as never[]);
      const want = got.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(diags.get(s.index) ?? []).toEqual(want);
    });
  }
});
