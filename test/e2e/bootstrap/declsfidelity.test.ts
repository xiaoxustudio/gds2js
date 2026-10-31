import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import {
  checkParamDefaultAssign,
  checkPropertyDelegates,
  checkReturnPaths,
  checkSignalDefaults,
} from "../../../packages/compiler/src/analyze/checks/decls";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("dcd|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("dc|src|")).length;

const SOURCES = [
  "var x:\n\tget:\n\t\treturn 1\n",
  "var x: int:\n\tget = get_x\n\tfunc get_x(a):\n\t\treturn a\n",
  "var x: int:\n\tget = get_x\n\tfunc get_x():\n\t\treturn 1\n",
  "func f() -> int:\n\treturn 1\n",
  "func f() -> int:\n\tif 1:\n\t\treturn 1\n",
  "func f() -> void:\n\tpass\n",
  "func f(a: int = \"s\"):\n\tpass\n",
  "func f(a: Vector2 = 1):\n\tpass\n",
  "func f(a: float = 1):\n\tpass\n",
  "signal s(a = 1)\n",
];

describe("bootstrap · 属性委托与返回路检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② decls ${String(i)}`, async () => {
      let mod;
      try {
        mod = lower(await parseSource(SOURCES[i]!));
      } catch {
        expect(gd.get(String(i)) ?? []).toEqual([]);
        return;
      }
      const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
      checkPropertyDelegates(mod, diags as never[]);
      checkReturnPaths(mod.funcs, diags as never[]);
      checkParamDefaultAssign(mod, diags as never[]);
      checkSignalDefaults(mod, diags as never[]);
      const want = diags.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
