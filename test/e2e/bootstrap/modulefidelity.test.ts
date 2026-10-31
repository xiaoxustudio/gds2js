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
      .filter((l) => l.startsWith("mi|"))
      .map((l) => {
        const at = l.lastIndexOf("|{");
        const head = l.slice(3, at);
        return { text: head.split("~n").join("\n").split("~t").join("\t"), json: l.slice(at + 1) };
      })
  : [];

describe("bootstrap · 整模块 IR 与 TypeScript lower 逐键对账", () => {
  it("① 读数在盘面且样本够用", (ctx) => {
    if (rows.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(rows.length, "整模块样本少于 14 组").toBeGreaterThanOrEqual(14);
  });

  for (const r of rows) {
    it(`② ${JSON.stringify(r.text.slice(0, 28))}`, async (ctx) => {
      if (rows.length === 0) ctx.skip(true, "缺 gdsrc.txt");
      let ts: unknown = null;
      let refused: string | null = null;
      try {
        ts = lower(await parseSource(r.text));
      } catch (e) {
        if (!(e instanceof UnsupportedError)) throw e;
        refused = e.message;
      }
      const gdRefused = r.json.includes("__error");
      if (refused !== null) {
        expect(gdRefused, `参考侧拒了（${refused}），移植版却给出了模块`).toBe(true);
        return;
      }
      expect(gdRefused, `移植版拒了这一形，参考侧有模块：${r.json}`).toBe(false);
      expect(sortKeys(JSON.parse(r.json)), "整模块 IR 不一致").toEqual(sortKeys(JSON.parse(JSON.stringify(ts, (_k, x) => (typeof x === "bigint" ? Number(x) : x)))));
    });
  }
});
