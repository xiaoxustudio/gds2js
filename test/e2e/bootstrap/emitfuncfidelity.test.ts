import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { emitFunc } from "../../../packages/compiler/src/emit/func";
import { beginEmit } from "../../../packages/compiler/src/emit/context";
import { NO_ANALYSIS } from "../../../packages/compiler/src/analyze/analysis-result";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string>();
for (const l of lines.filter((x) => x.startsWith("efn|"))) {
  const parts = l.split("|");
  gd.set(parts[1]!, parts.slice(2).join("|"));
}

const SOURCES = [
  "func f(a):\n\treturn a\n",
  "func f(a: int) -> int:\n\treturn a + 1\n",
  "func f():\n\tvar x = 1\n\tx = 2\n\treturn x\n",
  "func f():\n\tprint(1)\n",
  "static func f():\n\tpass\n",
  "func f(p: int):\n\tpass\n",
];

describe("bootstrap · 函数发射与 TypeScript 逐字节对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(gd.size).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② emitFunc ${String(i)}`, async () => {
      beginEmit(NO_ANALYSIS);
      const mod = lower(await parseSource(SOURCES[i]!));
      expect(JSON.parse(gd.get(String(i))!)).toEqual(emitFunc(mod.funcs[0]!, 0));
    });
  }
});
