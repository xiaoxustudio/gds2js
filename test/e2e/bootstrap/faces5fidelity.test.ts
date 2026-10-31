import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { ctorRecvFace, lambdaCaptureNames } from "../../../packages/compiler/src/analyze/faces";
import { NODE_PATH_FACE, STRINGNAME_FACE } from "../../../packages/compiler/src/semantics/faces";
import { Scope, resetRun } from "../../../packages/compiler/src/analyze/state";
import { collectLocalNames, recordCaptures, seedOuterNames } from "../../../packages/compiler/src/analyze/walk";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const crRows = lines.filter((x) => x.startsWith("cr|"));
const lcnRows = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("lcn|") && !x.startsWith("lcn|src|"))) {
  const parts = l.split("|");
  const bucket = lcnRows.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts.slice(3).join("|")}`);
  lcnRows.set(parts[1]!, bucket);
}
const lcnHeaders = lines.filter((x) => x.startsWith("lcn|src|")).length;

const EXPRS = ['&"x"', '^"x"', 'NodePath("x")', '&"a" + &"b"', '"s"', 'StringName("x")'];
const CAP_SOURCES = [
  "func f():\n\tvar q = 2\n\tvar lam = func(): return q\n",
  "func f():\n\tvar lam = func(a): return a\n",
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

describe("bootstrap · 构造式接收者面与捕获名查询与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(crRows.length).toBe(EXPRS.length);
    expect(lcnHeaders).toBe(CAP_SOURCES.length);
  });

  for (let i = 0; i < EXPRS.length; i++) {
    it(`② ctorRecvFace ${String(i)}`, async () => {
      const mod = lower(await parseSource(`var __v = ${EXPRS[i]!}\n`));
      const init = (mod.vars[0] as unknown as { init: unknown }).init as never;
      const a = ctorRecvFace(init as never, STRINGNAME_FACE);
      const b = ctorRecvFace(init as never, NODE_PATH_FACE);
      expect(crRows[i]).toBe(`cr|${String(i)}|${String(a)}|${String(b)}`);
    });
  }

  for (let j = 0; j < CAP_SOURCES.length; j++) {
    it(`③ lambdaCaptureNames ${String(j)}`, async () => {
      const mod = lower(await parseSource(CAP_SOURCES[j]!));
      resetRun("t");
      seedOuterNames(mod);
      const got: string[] = [];
      for (const f of mod.funcs) {
        const root = new Scope(new Set(), null);
        const names = ["self", ...f.params.map((p) => p.name)];
        const fscope = root.funcChild(names, true);
        const bound = new Set<string>();
        collectLocalNames(f.body, names, bound);
        for (const k of bound) fscope.declare(k);
        const lams: Array<{ loc: { line: number; col: number } }> = [];
        findLambdas(f.body, lams);
        for (const lam of lams) {
          recordCaptures(lam as never, fscope);
          got.push(`${String(lam.loc.line)}|${lambdaCaptureNames(lam as never).join(",")}`);
        }
      }
      expect(lcnRows.get(String(j)) ?? []).toEqual(got);
    });
  }
});
