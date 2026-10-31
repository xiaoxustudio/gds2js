import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");

function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v !== null && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(v as Record<string, unknown>).sort()) o[k] = sortKeys((v as Record<string, unknown>)[k]);
    return o;
  }
  return typeof v === "bigint" ? Number(v) : v;
}

interface Row {
  text: string;
  json: string;
}

const rows: Row[] = existsSync(REF)
  ? readFileSync(REF, "utf8")
      .split("\n")
      .filter((l) => l.startsWith("i|"))
      .map((l) => {
        const at = l.indexOf("|", 2);
        return { text: l.slice(2, at), json: l.slice(at + 1) };
      })
  : [];

describe("bootstrap · 表达式 IR 与 TypeScript lower 逐键对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (rows.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(rows.length, "IR 样本少于 10 组").toBeGreaterThanOrEqual(10);
  });

  for (const r of rows) {
    it(`② ${r.text}`, async (ctx) => {
      if (rows.length === 0) ctx.skip(true, "缺 gdsrc.txt");
      let tsIr: unknown = null;
      let refused: string | null = null;
      try {
        const tree = await parseSource(`var __v = ${r.text}\n`);
        const mod = lower(tree);
        tsIr = (mod.vars[0] as unknown as { init?: unknown }).init ?? null;
      } catch (e) {
        if (!(e instanceof UnsupportedError)) throw e;
        refused = e.message;
      }
      const gdRefused = r.json.includes("__error");
      if (refused !== null) {
        expect(gdRefused, `参考侧拒了（${refused}），移植版却给出了值`).toBe(true);
        return;
      }
      expect(gdRefused, `移植版拒了这一形，参考侧有值：${r.json}`).toBe(false);
      expect(sortKeys(JSON.parse(r.json)), "IR 不一致").toEqual(sortKeys(JSON.parse(JSON.stringify(tsIr, (_k, x) => (typeof x === "bigint" ? Number(x) : x)))));
    });
  }
});
