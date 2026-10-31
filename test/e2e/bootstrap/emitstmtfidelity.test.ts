import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { emitStmt } from "../../../packages/compiler/src/emit/stmt";
import { beginEmit } from "../../../packages/compiler/src/emit/context";
import { NO_ANALYSIS } from "../../../packages/compiler/src/analyze/analysis-result";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string>();
for (const l of lines.filter((x) => x.startsWith("stm|"))) {
  const parts = l.split("|");
  gd.set(parts[1]!, parts.slice(2).join("|"));
}

const STMTS = [
  "var a = 1",
  "a = 1",
  "print(1)",
  "if true:\n\t\tpass",
  "for i in [1, 2]:\n\t\tpass",
  "while true:\n\t\tbreak",
  "return 1",
  "match 1:\n\t\t1:\n\t\t\tpass",
];

describe("bootstrap · 语句发射与 TypeScript 逐字节对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(gd.size).toBe(STMTS.length);
  });

  for (let i = 0; i < STMTS.length; i++) {
    it(`② emitStmt ${String(i)}`, async () => {
      beginEmit(NO_ANALYSIS);
      const mod = lower(await parseSource(`func f():\n\t${STMTS[i]!}\n`));
      const st = mod.funcs[0]!.body[0]!;
      expect(JSON.parse(gd.get(String(i))!)).toEqual(emitStmt(st, false));
    });
  }
});
