import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { Scope, resetRun, run } from "../../../packages/compiler/src/analyze/state";
import { collectLocalNames, recordCaptures, seedOuterNames } from "../../../packages/compiler/src/analyze/walk";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const sonRows = new Map<string, string>();
for (const l of lines.filter((x) => x.startsWith("son|"))) {
  const parts = l.split("|");
  sonRows.set(parts[1]!, parts.slice(2).join("|"));
}
const cprRows = new Map<string, string>();
for (const l of lines.filter((x) => x.startsWith("cpr|"))) {
  const parts = l.split("|");
  const bucket = cprRows.get(parts[1]!) ?? "";
  cprRows.set(parts[1]!, (bucket === "" ? "" : bucket + ";") + parts.slice(2).join("|"));
}

const OUTER_SOURCES = [
  "var a = 1\nfunc f():\n\tpass\nclass K:\n\tvar b = 2\n\tsignal s\n\tconst C = 3\n\tfunc g():\n\t\tpass\n",
  "class K:\n\tclass J:\n\t\tvar c = 1\n",
];

const CAP_SOURCES = [
  "var outer = 1\nfunc f(p):\n\tvar q = 2\n\tvar lam = func(): return p + q\n\treturn lam\n",
  "func f():\n\tvar z = 1\n\tvar lam = func(a): return a + z + outer\n",
  "func f():\n\tvar q = 2\n\tvar lam = func(): return q\n\tvar lam2 = func(): return q + 1\n",
];

function findLambdas(node: unknown, out: Array<{ loc: { line: number; col: number } }>): void {
  if (Array.isArray(node)) {
    for (const x of node) findLambdas(x, out);
    return;
  }
  if (node === null || typeof node !== "object") return;
  const obj = node as Record<string, unknown>;
  if (obj["kind"] === "lambda") out.push(obj as never);
  for (const [k, v] of Object.entries(obj)) if (k !== "loc") findLambdas(v, out);
}

describe("bootstrap · 外层名播种与 lambda 捕获与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(sonRows.size).toBe(OUTER_SOURCES.length);
    expect(cprRows.size).toBe(CAP_SOURCES.length);
  });

  for (let i = 0; i < OUTER_SOURCES.length; i++) {
    it(`② seedOuterNames ${String(i)}`, async () => {
      const mod = lower(await parseSource(OUTER_SOURCES[i]!));
      resetRun("t");
      seedOuterNames(mod);
      expect(sonRows.get(String(i))).toBe([...run.outerNames].sort().join(","));
    });
  }

  for (let j = 0; j < CAP_SOURCES.length; j++) {
    it(`③ recordCaptures ${String(j)}`, async () => {
      const mod = lower(await parseSource(CAP_SOURCES[j]!));
      resetRun("t");
      seedOuterNames(mod);
      for (const f of mod.funcs) {
        const root = new Scope(new Set(), null);
        const names = ["self", ...f.params.map((p) => p.name)];
        const fscope = root.funcChild(names, true);
        const bound = new Set<string>();
        collectLocalNames(f.body, names, bound);
        for (const k of bound) fscope.declare(k);
        const lams: Array<{ loc: { line: number; col: number } }> = [];
        findLambdas(f.body, lams);
        for (const lam of lams) recordCaptures(lam as never, fscope);
      }
      const rows = [...run.lambdaCaptures.entries()]
        .map(([k, v]) => `${k}|${v.join(",")}`)
        .sort()
        .join(";");
      expect(cprRows.get(String(j)) ?? "").toBe(rows);
    });
  }
});
