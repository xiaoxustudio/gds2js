import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { checkClassFuncVisibility } from "../../../packages/compiler/src/analyze/checks/decls";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("cfvd|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("cfv|src|")).length;

const SOURCES = [
  "func helper():\n\tpass\nclass K:\n\tfunc g():\n\t\thelper()\n",
  "func helper():\n\tpass\nclass K:\n\tfunc helper():\n\t\tpass\n\tfunc g():\n\t\thelper()\n",
  "func helper():\n\tpass\nclass K:\n\tfunc g():\n\t\tvar helper = 1\n\t\thelper()\n",
  "func helper():\n\tpass\nclass K:\n\tfunc g(helper):\n\t\thelper()\n",
  "func helper():\n\tpass\nclass K:\n\tfunc g():\n\t\tvar f = func():\n\t\t\thelper()\n",
  "func helper():\n\tpass\nclass K:\n\tclass J:\n\t\tfunc g():\n\t\t\thelper()\n",
  "func helper():\n\tpass\nclass K:\n\tvar v = helper()\n",
  "func helper():\n\tpass\nclass K:\n\tvar v:\n\t\tget:\n\t\t\treturn helper()\n",
  "class K:\n\tfunc g():\n\t\thelper()\n",
];

describe("bootstrap · 内部类看外层函数检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② class-visibility ${String(i)}`, async () => {
      let mod;
      try {
        mod = lower(await parseSource(SOURCES[i]!));
      } catch {
        expect(gd.get(String(i)) ?? []).toEqual([]);
        return;
      }
      const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
      checkClassFuncVisibility(mod, diags as never[]);
      const want = diags.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
