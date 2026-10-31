import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { ctx } from "../../../packages/compiler/src/emit/context";
import { globalConstLines, mark } from "../../../packages/compiler/src/emit/helpers";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gcRows = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("hgl|"))) {
  const parts = l.split("|");
  const bucket = gcRows.get(parts[1]!) ?? [];
  bucket.push(parts.slice(2).join("|"));
  gcRows.set(parts[1]!, bucket);
}
const gcHeaders = lines.filter((x) => x.startsWith("hgc|src|")).length;
const mkRows = lines.filter((x) => x.startsWith("mk|"));

const SOURCES = [
  "var x = PI\n",
  "var x = PI + TAU\n",
  "const PI = 1\nfunc f():\n\treturn PI\n",
  "var PI = 2\nfunc f():\n\treturn PI + TAU\n",
  "var f = func():\n\treturn PI\n",
  "class K:\n\tvar PI = 1\n\tfunc f():\n\t\treturn TAU\n",
  "func f(c):\n\treturn 1 if c else TAU\n",
  "class K:\n\tclass J:\n\t\tvar TAU = 1\n\t\tfunc f():\n\t\t\treturn INF\n",
];

describe("bootstrap · 全局常量行与行映射钩子与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctxSkip) => {
    if (lines.length === 0) ctxSkip.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(gcHeaders).toBe(SOURCES.length);
    expect(mkRows.length).toBe(2);
  });

  it("② mark 两格", () => {
    ctx.LINE_MAPPINGS.length = 0;
    ctx.MAP_ACTIVE = false;
    mark(3, { line: 5, col: 2 });
    expect(mkRows[0]).toBe(`mk|off|${String(ctx.LINE_MAPPINGS.length)}`);
    ctx.MAP_ACTIVE = true;
    mark(3, { line: 5, col: 2 });
    mark(7, undefined);
    const m = ctx.LINE_MAPPINGS[0]!;
    expect(mkRows[1]).toBe(`mk|on|${String(ctx.LINE_MAPPINGS.length)}|${String(m.genLine)}|${String(m.srcLine)}|${String(m.srcCol)}`);
    ctx.MAP_ACTIVE = false;
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`③ globalConstLines ${String(i)}`, async () => {
      let mod;
      try {
        mod = lower(await parseSource(SOURCES[i]!));
      } catch {
        expect(gcRows.get(String(i)) ?? []).toEqual([]);
        return;
      }
      expect(gcRows.get(String(i)) ?? []).toEqual(globalConstLines(mod, new Set()));
    });
  }
});
