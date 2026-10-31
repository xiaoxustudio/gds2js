import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { dictIdentityLiteral } from "../../../packages/compiler/src/emit/layout";
import { ctx } from "../../../packages/compiler/src/emit/context";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("di|") && !x.startsWith("di|src|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(parts.slice(2).join("|"));
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("di|src|")).length;

const SOURCES = [
  "var a = 1\nvar b = 2\n",
  "var a = 1\nconst C = 2\nstatic var s = 3\n",
  "var v: int:\n\tget:\n\t\treturn 1\n",
];

describe("bootstrap · 字典恒等式字面量与 TypeScript 逐字节对账", () => {
  it("① 读数在盘面", (ctxSkip) => {
    if (lines.length === 0) ctxSkip.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② dictIdentity ${String(i)}`, async () => {
      const mod = lower(await parseSource(SOURCES[i]!));
      ctx.MODULE_RES_PATH = null;
      const off = dictIdentityLiteral("__d", "C:/proj/main.gd", mod.vars, "Main");
      ctx.MODULE_RES_PATH = "C:/proj/main.gd";
      const on = dictIdentityLiteral("__d", "C:/proj/main.gd", mod.vars, "Main");
      expect(gd.get(String(i)) ?? []).toEqual([`null|${off}`, `set|${on}`]);
    });
  }
});
