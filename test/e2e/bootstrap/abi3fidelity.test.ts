import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { intDivMayAbort, sigValid } from "../../../packages/compiler/src/emit/helpers";
import { flattenBodies } from "../../../packages/compiler/src/analyze/walk";
import type { Expr, FuncDecl } from "../../../packages/compiler/src/lower/ir";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const idaRows = lines.filter((x) => x.startsWith("ida|")).map((l) => l.split("|").slice(2).join("|"));
const svRows = lines.filter((x) => x.startsWith("sv|")).map((l) => l.split("|").slice(2).join("|"));

const EXPRS = ["x / 2", "x / 0", "x / y", "x + 1", "-x / 0"];
const KINDS: Record<string, "int"> = { x: "int", y: "int" };
const SIG_SOURCES = [
  "func add(a, b):\n\treturn a + b\n",
  "func add(a, b):\n\treturn a + b\nfunc g():\n\treturn add(1, 2)\n",
  "func add(a, b):\n\treturn a + b\nfunc g():\n\treturn add(1.5, 2)\n",
  "func add(a, b):\n\tvar s = 0\n\ts = a\n\treturn s\n",
  "func add(a, b):\n\treturn a / 0\n",
];

describe("bootstrap · 整数除法与裸轨签名判据与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(idaRows.length).toBe(EXPRS.length);
    expect(svRows.length).toBe(SIG_SOURCES.length);
  });

  for (let i = 0; i < EXPRS.length; i++) {
    it(`② intDivMayAbort ${String(i)}`, async () => {
      const mod = lower(await parseSource(`var __v = ${EXPRS[i]!}\n`));
      const init = (mod.vars[0] as unknown as { init: Expr }).init;
      expect(idaRows[i]).toBe(String(intDivMayAbort(init, (n) => KINDS[n] ?? null)));
    });
  }

  for (let j = 0; j < SIG_SOURCES.length; j++) {
    it(`③ sigValid ${String(j)}`, async () => {
      const mod = lower(await parseSource(SIG_SOURCES[j]!));
      const f = mod.funcs[0]!;
      const sites: Array<{ args: Expr[]; owner: FuncDecl }> = [];
      for (const other of mod.funcs) {
        for (const nodes of flattenBodies({ funcs: [other], innerClasses: [] } as never)) {
          for (const n of nodes) {
            if (n.kind !== "call") continue;
            const callee = (n as unknown as { callee: { kind: string; name?: string } }).callee;
            if (callee.kind === "ident" && callee.name === f.name) sites.push({ args: (n as unknown as { args: Expr[] }).args, owner: other });
          }
        }
      }
      const ok = sigValid(f, "int", sites, () => new Map());
      expect(svRows[j]).toBe(String(ok));
    });
  }
});
