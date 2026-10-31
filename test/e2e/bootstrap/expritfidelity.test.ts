import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { emitAssign, emitExprR } from "../../../packages/compiler/src/emit/expr-boxed";
import { beginEmit } from "../../../packages/compiler/src/emit/context";
import { NO_ANALYSIS } from "../../../packages/compiler/src/analyze/analysis-result";
import type { Expr, Stmt } from "../../../packages/compiler/src/lower/ir";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const exRows = lines.filter((x) => x.startsWith("ex|")).map((l) => l.split("|").slice(2).join("|"));
const asRows = lines.filter((x) => x.startsWith("as|")).map((l) => l.split("|").slice(2).join("|"));

const EXPRS = ["1", "1.5", '"s"', "true", "-1", "1 if true else 2", "[1, 2]", "{1: 2}", "not true"];
const TARGETS = ["x = 5", "a[0] = 5", "self.x = 5"];

describe("bootstrap · 表达式发射与 TypeScript 逐字节对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(exRows.length).toBe(EXPRS.length);
    expect(asRows.length).toBe(TARGETS.length);
  });

  for (let i = 0; i < EXPRS.length; i++) {
    it(`② emitExprR ${String(i)}`, async () => {
      beginEmit(NO_ANALYSIS);
      const mod = lower(await parseSource(`var __v = ${EXPRS[i]!}\n`));
      const init = (mod.vars[0] as unknown as { init: Expr }).init;
      const r = emitExprR(init);
      expect(exRows[i]).toBe(`${r.code}|${r.rep}`);
    });
  }

  for (let j = 0; j < TARGETS.length; j++) {
    it(`③ emitAssign ${String(j)}`, async () => {
      beginEmit(NO_ANALYSIS);
      const mod = lower(await parseSource(`func f():\n\t${TARGETS[j]!}\n`));
      const st = mod.funcs[0]!.body[0] as Extract<Stmt, { kind: "assign" }>;
      expect(asRows[j]).toBe(emitAssign(st.target, "5"));
    });
  }
});
