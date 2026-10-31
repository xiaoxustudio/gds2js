import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { checkCall, checkCtorSignatures, checkMethodCall, checkStaticAccess } from "../../../packages/compiler/src/analyze/checks/calls";
import { flattenBodies } from "../../../packages/compiler/src/analyze/walk";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("cld|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("cl|src|")).length;

const SOURCES = [
  "func f():\n\tvar x = String(1)\n",
  "var a: int = 1\nfunc f():\n\tvar x = String(a)\n",
  "func f():\n\tvar x = String(1.0)\n",
  "func f(a):\n\tvar x = String(a)\n",
  "func String():\n\tpass\nfunc f():\n\tvar x = String(1)\n",
  "func f():\n\tvar x = Vector2(1, 2)\n",
  'func f():\n\tvar s = "a".join()\n',
  'func f():\n\tvar s = "a".join(",", 1)\n',
  'func f():\n\tvar d = {}\n\tvar s = d.join(",")\n',
  'func f():\n\tvar s = "a".join({})\n',
  "func f():\n\tvar x = bool([1])\n",
  "func f():\n\tvar x = bool(1)\n",
  "var v = 1\nstatic func s():\n\treturn v\n",
  "func h():\n\tpass\nstatic func s():\n\th()\n",
  "func h():\n\tpass\nstatic var sv = h()\n",
  "var v = 1\nstatic func s():\n\tvar v = 2\n\treturn v\n",
];

describe("bootstrap · 调用面四项检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② calls ${String(i)}`, async () => {
      let mod;
      try {
        mod = lower(await parseSource(SOURCES[i]!));
      } catch {
        expect(gd.get(String(i)) ?? []).toEqual([]);
        return;
      }
      const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
      checkStaticAccess(mod.funcs, mod.vars, diags as never[]);
      checkCtorSignatures(mod, diags as never[]);
      for (const nodes of flattenBodies(mod)) {
        for (const n of nodes) {
          if (n.kind !== "call") continue;
          const e = n as unknown as { callee: { kind: string; name?: string } };
          if (e.callee.kind === "ident") checkCall(e.callee.name as string, n as never, diags as never[]);
          else if (e.callee.kind === "attribute") checkMethodCall(e.callee.name as string, n as never, diags as never[]);
        }
      }
      const want = diags.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
