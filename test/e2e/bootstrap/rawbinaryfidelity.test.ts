import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { propSlotInit, slotInit, tryRawBinary } from "../../../packages/compiler/src/emit/abi";
import { beginEmit, ctx } from "../../../packages/compiler/src/emit/context";
import { NO_ANALYSIS } from "../../../packages/compiler/src/analyze/analysis-result";
import type { Expr } from "../../../packages/compiler/src/lower/ir";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const rbRows = lines.filter((x) => x.startsWith("rb|")).map((l) => l.split("|").slice(2).join("|"));
const siRows = lines.filter((x) => x.startsWith("si|")).map((l) => l.split("|").slice(2).join("|"));
const spRows = lines.filter((x) => x.startsWith("sp|")).map((l) => l.split("|").slice(2).join("|"));

const BIN = ["x + 1", "1 + 2", "x < 1", "y + 1.5", 's + "a"', "1 + 2.5"];
const VARS = ["var a\n", "var a = 1\n", "var a: int = 2\n", "var a: Array[int] = [1]\n"];

describe("bootstrap · 裸轨二元与槽位初值与 TypeScript 逐字节对账", () => {
  it("① 读数在盘面", (ctxSkip) => {
    if (lines.length === 0) ctxSkip.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(rbRows.length).toBe(BIN.length);
    expect(siRows.length).toBe(VARS.length);
    expect(spRows.length).toBe(2);
  });

  for (let i = 0; i < BIN.length; i++) {
    it(`② tryRawBinary ${String(i)}`, async () => {
      beginEmit(NO_ANALYSIS);
      ctx.UNBOXED = new Map([["x", "int"], ["y", "float"], ["s", "str"]]);
      const mod = lower(await parseSource(`var __v = ${BIN[i]!}\n`));
      const init = (mod.vars[0] as unknown as { init: Extract<Expr, { kind: "binary" }> }).init;
      const r = tryRawBinary(init);
      expect(rbRows[i]).toBe(r === null ? "null" : `${r.code}|${r.rep}`);
    });
  }

  for (let j = 0; j < VARS.length; j++) {
    it(`③ slotInit ${String(j)}`, async () => {
      beginEmit(NO_ANALYSIS);
      const mod = lower(await parseSource(VARS[j]!));
      const v = mod.vars[0]!;
      expect(siRows[j]).toBe(slotInit(v.type, v.init, false));
    });
  }

  it("④ propSlotInit", async () => {
    beginEmit(NO_ANALYSIS);
    const mod = lower(await parseSource("var a = 1\nstatic var b = 2\n"));
    expect(spRows).toEqual(mod.vars.map((v) => propSlotInit(v)));
  });
});
