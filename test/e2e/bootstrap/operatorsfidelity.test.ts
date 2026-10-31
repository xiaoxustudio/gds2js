import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import {
  checkBoolOrdering,
  checkOperandPairs,
  checkOperator,
  checkPercentFormat,
  checkVoidAnnotation,
  checkVoidMethodValues,
} from "../../../packages/compiler/src/analyze/checks/operators";
import { flattenBodies } from "../../../packages/compiler/src/analyze/walk";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("opd|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("op|src|")).length;

const SOURCES = [
  "func f(a: void):\n\tpass\n",
  "func f() -> void:\n\tpass\n",
  'var a: bool = true\nfunc f():\n\tif a <= true:\n\t\tpass\n',
  'var a: int = 1\nfunc f():\n\tprint("%d" % a)\n',
  "func f():\n\tvar x = 1.5 % 2\n",
  'func f():\n\tvar x = "a" == 1\n',
  "func f():\n\tvar x = 1 << -1\n",
  "func f():\n\tvar x = 1 / 0\n",
  "func f():\n\tvar a = [1]\n\tvar x = a.append(2)\n",
  "var c: Callable = Callable()\nfunc f():\n\tvar x = c.call(1, 2)\n",
  "func f():\n\tvar x = Vector2(1, 2) + 1\n",
  'var s: String = "a"\nfunc f():\n\tvar t = s + 1\n',
];

describe("bootstrap · 算子与格式面检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② operators ${String(i)}`, async () => {
      let mod;
      try {
        mod = lower(await parseSource(SOURCES[i]!));
      } catch {
        expect(gd.get(String(i)) ?? []).toEqual([]);
        return;
      }
      const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
      checkVoidAnnotation(mod, diags as never[]);
      checkBoolOrdering(mod, diags as never[]);
      checkPercentFormat(mod, diags as never[]);
      checkOperandPairs(mod, diags as never[]);
      checkVoidMethodValues(mod, diags as never[]);
      for (const nodes of flattenBodies(mod)) {
        for (const n of nodes) {
          if (n.kind === "binary") checkOperator(n as never, diags as never[]);
        }
      }
      const want = diags.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
