import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { checkArrayMethodArity, checkDictMethodArity } from "../../../packages/compiler/src/analyze/checks/collections/method-arity";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("mad|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("ma|src|")).length;

const SOURCES = [
  "func f():\n\tvar d = {}\n\td.keys(1)\n",
  "func f():\n\tvar d: Dictionary = {}\n\tvar x = d.nope()\n",
  "func f():\n\tvar a = []\n\ta.append()\n",
  "func f():\n\tvar a: Array = []\n\ta.nope()\n",
  "func f():\n\tvar a = []\n\ta.push_back(1, 2)\n",
  "func f():\n\tvar d = {}\n\tvar x = d.merge({})\n",
  "func f():\n\tvar d: Dictionary[String, int] = {}\n\tvar x = d.nope()\n",
];

describe("bootstrap · 容器方法元数与缺名检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② method-arity ${String(i)}`, async () => {
      let mod;
      try {
        mod = lower(await parseSource(SOURCES[i]!));
      } catch {
        expect(gd.get(String(i)) ?? []).toEqual([]);
        return;
      }
      const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
      checkDictMethodArity(mod, diags as never[]);
      checkArrayMethodArity(mod, diags as never[]);
      const want = diags.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
