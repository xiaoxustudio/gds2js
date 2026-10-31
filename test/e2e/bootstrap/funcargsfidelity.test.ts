import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { checkFuncArgSlots } from "../../../packages/compiler/src/analyze/checks/calls";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("fasd|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("fas|src|")).length;

const SOURCES = [
  'func f(p: int):\n\tpass\nfunc g():\n\tf("s")\n',
  "func f(p: int):\n\tpass\nfunc g():\n\tf(1)\n",
  'class K:\n\tfunc m(p: int):\n\t\tpass\n\tfunc g():\n\t\tself.m("s")\n',
  "class K:\n\tpass\nfunc g(a: K):\n\tpass\nfunc h():\n\tg(1)\n",
  "func f(p: int):\n\tpass\nfunc g():\n\tf()\n",
  'class A:\n\tfunc m(p: int):\n\t\tpass\nclass B extends A:\n\tfunc g():\n\t\tself.m("s")\n',
];

describe("bootstrap · 函数实参槽位检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② func-arg-slots ${String(i)}`, async () => {
      let mod;
      try {
        mod = lower(await parseSource(SOURCES[i]!));
      } catch {
        expect(gd.get(String(i)) ?? []).toEqual([]);
        return;
      }
      const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
      checkFuncArgSlots(mod, new Set(), diags as never[]);
      const want = diags.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
