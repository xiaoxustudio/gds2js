import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { kindOfExpr } from "../../../packages/compiler/src/emit/abi";
import { ctx } from "../../../packages/compiler/src/emit/context";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const rows = lines.filter((x) => x.startsWith("k|") && x.split("|").length === 3);
const gd = rows.map((l) => l.split("|").slice(2).join("|"));

const EXPRS = ["1 + 2", "1.5 + 2", "x + y", "x * 2", "x < y", "x < 2", 's + "a"', "-x", "a[0]", "g[1][2]", "d[0]", 'd["k"]', "a.size()", "d.get(0, 1)", "b"];
const IDS: Record<string, "int" | "float" | "str"> = { x: "int", y: "float", s: "str" };

describe("bootstrap · 裸轨表达式类型与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctxSkip) => {
    if (lines.length === 0) ctxSkip.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(rows.length).toBe(EXPRS.length);
  });

  for (let i = 0; i < EXPRS.length; i++) {
    it(`② kindOfExpr ${String(i)}`, async () => {
      ctx.RAW_ABIS.clear();
      const mod = lower(await parseSource(`var __v = ${EXPRS[i]!}\n`));
      const init = (mod.vars[0] as unknown as { init: unknown }).init as never;
      const arrays = new Map<string, "int" | "float" | "str" | "int[]" | "float[]" | "str[]">([["a", "int"], ["g", "int[]"]]);
      const dict = new Map<string, "int" | "float">([["d", "int"]]);
      const k = kindOfExpr(init, (n) => IDS[n] ?? null, arrays, dict);
      expect(gd[i]).toBe(k === null ? "null" : k);
    });
  }
});
