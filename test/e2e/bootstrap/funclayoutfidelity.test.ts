import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { analyzeFuncLayout } from "../../../packages/compiler/src/emit/helpers";
import { beginEmit } from "../../../packages/compiler/src/emit/context";
import { NO_ANALYSIS } from "../../../packages/compiler/src/analyze/analysis-result";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const rows = lines.filter((x) => x.startsWith("fl|")).map((l) => l.split("|").slice(2).join("|"));

const SOURCES = [
  "func f():\n\tvar a = [1, 2]\n\ta.append(3)\n\tvar x = a[0]\n",
  "func f():\n\tvar d = {1: 2}\n\td[1] = 3\n\tvar x = d[1]\n",
  "func f():\n\tvar x = 1\n\tx = 2\n\treturn x\n",
  'func f():\n\tvar a = [1]\n\ta.append("s")\n',
  "func f():\n\tvar a = []\n\ta.append(1)\n",
  "func f():\n\tvar x = 1.5\n\tx = 2.5\n\treturn x\n",
];

const sorted = (m: Map<string, string>): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const k of [...m.keys()].sort()) out[k] = m.get(k)!;
  return out;
};

describe("bootstrap · 函数裸轨布局与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(rows.length).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② analyzeFuncLayout ${String(i)}`, async () => {
      beginEmit(NO_ANALYSIS);
      const mod = lower(await parseSource(SOURCES[i]!));
      const ly = analyzeFuncLayout(mod.funcs[0]!);
      const want = { unboxed: sorted(ly.unboxed), arrays: sorted(ly.arrays), dicts: sorted(ly.dicts) };
      expect(JSON.parse(rows[i]!)).toEqual(want);
    });
  }
});
