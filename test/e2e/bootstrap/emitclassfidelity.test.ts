import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { emitClassDecl } from "../../../packages/compiler/src/emit/class";
import { beginEmit } from "../../../packages/compiler/src/emit/context";
import { NO_ANALYSIS } from "../../../packages/compiler/src/analyze/analysis-result";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string>();
for (const l of lines.filter((x) => x.startsWith("cd|"))) {
  const parts = l.split("|");
  gd.set(parts[1]!, parts.slice(2).join("|"));
}

const SOURCES = [
  "class K:\n\tvar a = 1\n",
  "class K:\n\tvar v: int:\n\t\tget:\n\t\t\treturn 1\n",
  "class K:\n\tstatic var s = 1\n\tfunc f():\n\t\treturn s\n",
  "class K:\n\tsignal sig\n",
  "class K:\n\tvar a = 1\n\tfunc _init(x = 1):\n\t\tself.a = x\n",
];

describe("bootstrap · 类声明发射与 TypeScript 逐字节对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(gd.size).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② emitClassDecl ${String(i)}`, async () => {
      beginEmit(NO_ANALYSIS);
      const mod = lower(await parseSource(SOURCES[i]!));
      expect(JSON.parse(gd.get(String(i))!)).toEqual(emitClassDecl(mod.innerClasses[0]!, 0));
    });
  }
});
