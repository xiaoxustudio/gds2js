import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { emitBinary, emitCall } from "../../../packages/compiler/src/emit/call";
import { beginEmit } from "../../../packages/compiler/src/emit/context";
import { NO_ANALYSIS } from "../../../packages/compiler/src/analyze/analysis-result";
import { BUILTIN } from "../../../packages/compiler/src/emit/surface";
import type { Expr } from "../../../packages/compiler/src/lower/ir";
import { ROOT } from "../../support/lib-bridge";
import { builtinArity, renderBuiltinTables } from "../../../tools/gdsrc-builtin";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const TABLE = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "builtin_tables.gd");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const bf = new Map<string, string>();
for (const l of lines.filter((x) => x.startsWith("bf|"))) {
  const parts = l.split("|");
  bf.set(parts[1]!, parts.slice(2).join("|"));
}
const bnRows = lines.filter((x) => x.startsWith("bn|")).map((l) => l.split("|").slice(2).join("|"));
const clRows = lines.filter((x) => x.startsWith("bcl|")).map((l) => l.split("|").slice(2).join("|"));

const BIN = ["1 + 2", '"a" + "b"', "1 % 2", "x in y", "a and b", "a or b", "1 << 2"];
const CALLS = ["print(1)", "pow(1, 2)", "len([1])", "sqrt(2)"];

describe("bootstrap · 内置函数与二元/调用发射与 TypeScript 逐字节对账", () => {
  it("① 表与读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(readFileSync(TABLE, "utf8")).toBe(renderBuiltinTables());
    expect(bf.size).toBe(Object.keys(BUILTIN).length);
    expect(bnRows.length).toBe(BIN.length);
    expect(clRows.length).toBe(CALLS.length);
  });

  it("② 全部内置函数", () => {
    for (const name of Object.keys(BUILTIN).sort()) {
      const k = builtinArity(name);
      const n = k < 0 ? 3 : k;
      const args = Array.from({ length: n }, (_, i) => `A${String(i)}`);
      expect(bf.get(name), name).toBe(BUILTIN[name]!(args));
    }
  });

  for (let i = 0; i < BIN.length; i++) {
    it(`③ emitBinary ${String(i)}`, async () => {
      beginEmit(NO_ANALYSIS);
      const mod = lower(await parseSource(`var __v = ${BIN[i]!}\n`));
      const init = (mod.vars[0] as unknown as { init: Extract<Expr, { kind: "binary" }> }).init;
      expect(bnRows[i]).toBe(emitBinary(init));
    });
  }

  for (let j = 0; j < CALLS.length; j++) {
    it(`④ emitCall ${String(j)}`, async () => {
      beginEmit(NO_ANALYSIS);
      const mod = lower(await parseSource(`var __v = ${CALLS[j]!}\n`));
      const init = (mod.vars[0] as unknown as { init: Extract<Expr, { kind: "call" }> }).init;
      expect(clRows[j]).toBe(emitCall(init));
    });
  }
});
