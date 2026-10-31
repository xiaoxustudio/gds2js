import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT } from "../../tools/lib.mjs";
import { coverage, totals } from "../../tools/port-coverage";

const PIN = join(ROOT, "test", "fixtures", "bootstrap", "port-coverage.json");

describe("自举移植覆盖率棘轮（只许涨，不许跌）", () => {
  it("① 棘轮在盘面且可读", () => {
    if (!existsSync(PIN)) bad("缺 port-coverage.json：先跑 node_modules/.bin/tsx tools/port-coverage.ts --write");
  });

  it("② 每个模块的覆盖函数数不许回退", () => {
    if (!existsSync(PIN)) return;
    const pin = JSON.parse(readFileSync(PIN, "utf8")) as { totals: { covered: number; funcs: number; modules: number; ported: number }; modules: Record<string, number> };
    const rows = coverage();
    const byModule = new Map(rows.map((r) => [r.module, r.covered]));
    for (const [module, was] of Object.entries(pin.modules)) {
      const now = byModule.get(module);
      if (now === undefined) bad(`模块消失了：${module}（棘轮记着 ${String(was)}）`);
      else if (now < was) bad(`${module} 覆盖回退：${String(was)} → ${String(now)}`);
    }
    const t = totals(rows);
    if (t.covered < pin.totals.covered) bad(`总覆盖回退：${String(pin.totals.covered)} → ${String(t.covered)}`);
    else if (t.covered === pin.totals.covered) ok(`总覆盖 ${String(t.covered)}/${String(t.funcs)} 持平`);
    else bad(`总覆盖已涨到 ${String(t.covered)}/${String(t.funcs)}（模块 ${String(t.modules)}，已建 ${String(t.ported)}）：把 port-coverage.json 往前扳`);
  });
});
