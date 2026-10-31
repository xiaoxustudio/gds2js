import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { classFaceArgDiags } from "../../../packages/compiler/src/analyze/slots";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("cfa|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(parts.slice(2).join("|"));
  gd.set(parts[1]!, bucket);
}

const EXPRS = ['"s".split(1)', '"s".split("n", 2)', '"s".split("n", true, 3)', '"s".split("n", "d", 1)', '"s".substr("x")'];

describe("bootstrap · 面实参槽位检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(gd.size).toBe(EXPRS.length);
  });

  for (let i = 0; i < EXPRS.length; i++) {
    it(`② classFaceArgDiags ${String(i)}`, async () => {
      const mod = lower(await parseSource(`var __v = ${EXPRS[i]!}\n`));
      const init = (mod.vars[0] as unknown as { init: unknown }).init as never;
      const method = EXPRS[i]!.startsWith('"s".substr') ? "substr" : "split";
      const rows = classFaceArgDiags(init, "String", method, new Map()).map((d) => `${d.code}|${d.message}`);
      rows.push("END");
      expect(gd.get(String(i)) ?? []).toEqual(rows);
    });
  }
});
