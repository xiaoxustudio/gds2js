import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { computeRawAbis } from "../../../packages/compiler/src/emit/abi";
import { beginEmit } from "../../../packages/compiler/src/emit/context";
import { NO_ANALYSIS } from "../../../packages/compiler/src/analyze/analysis-result";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const rows = lines.filter((x) => x.startsWith("ra|")).map((l) => l.split("|").slice(2).join("|"));

const SOURCES = [
  "func add(a, b):\n\treturn a + b\nfunc g():\n\treturn add(1, 2)\n",
  "func add(a, b):\n\treturn a + b\n",
  "func add(a, b):\n\treturn a + b\nfunc g():\n\treturn add(1.5, 2)\n",
  'func s(a):\n\treturn "x"\nfunc g():\n\treturn s(1)\n',
  "func r(a, b):\n\treturn b\nfunc g():\n\tvar x = r(1, 2)\n\treturn x\n",
  "class K:\n\tpass\nfunc add(a, b):\n\treturn a + b\nfunc g():\n\treturn add(1, 2)\n",
];

describe("bootstrap · 裸轨签名推断与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(rows.length).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② computeRawAbis ${String(i)}`, async () => {
      beginEmit(NO_ANALYSIS);
      const mod = lower(await parseSource(SOURCES[i]!));
      const abis = computeRawAbis(mod, { hasBase: false, inherited: new Set(), external: new Set() });
      const out: Record<string, unknown> = {};
      for (const k of [...abis.keys()].sort()) out[k] = abis.get(k);
      expect(JSON.parse(rows[i]!)).toEqual(out);
    });
  }
});
