import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { emitLit } from "../../../packages/compiler/src/emit/expr-boxed";
import type { Expr } from "../../../packages/compiler/src/lower/ir";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const rows = lines.filter((x) => x.startsWith("el|")).map((l) => l.split("|").slice(2).join("|"));

const TEXTS = ["42", "9007199254740993", "1.5", '"a\\"b"', '&"x"', '^"p/q"', "true", "null"];

describe("bootstrap · 字面量发射与 TypeScript 逐字节对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(rows.length).toBe(TEXTS.length);
  });

  for (let i = 0; i < TEXTS.length; i++) {
    it(`② emitLit ${String(i)}`, async () => {
      const mod = lower(await parseSource(`var __v = ${TEXTS[i]!}\n`));
      const init = (mod.vars[0] as unknown as { init: Extract<Expr, { kind: "lit" }> }).init;
      expect(rows[i]).toBe(emitLit(init.lit, init.value as never));
    });
  }
});
