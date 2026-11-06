import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { GODOT_PIN, ROOT } from "../../tools/lib.mjs";
import { parseRoster } from "../../tools/compat/roster-parse.mjs";

const DATA = join(ROOT, "site", "public", "data", "v1");
const STATUS = ["implemented", "partial", "missing", "unplanned"] as const;

type Row = { o: string; n: string; k: string; t: (typeof STATUS)[number]; e: Array<[string, string]> };
type Module = { id: string; rows: number; stats: Record<(typeof STATUS)[number], number>; chunk: { rows: Row[] } };

function modules(): Module[] {
  const index = JSON.parse(readFileSync(join(DATA, "index.json"), "utf8"));
  return index.modules.map((m: Module) => ({
    ...m,
    chunk: JSON.parse(readFileSync(join(DATA, "modules", `${m.id.replace(/[^A-Za-z0-9_-]+/g, "-")}.json`), "utf8")),
  }));
}

describe("兼容性账本门", () => {
  it("① 引擎钉版本与行数总账自洽", () => {
    const index = JSON.parse(readFileSync(join(DATA, "index.json"), "utf8"));
    const pin = `${index.engine.major}.${index.engine.minor}.${index.engine.patch}`;
    if (pin === GODOT_PIN) ok(`矩阵引擎 ${pin}`);
    else bad(`矩阵引擎 ${pin} ≠ GODOT_PIN ${GODOT_PIN}`);
    let rows = 0;
    const totals = { implemented: 0, partial: 0, missing: 0, unplanned: 0 };
    for (const m of modules()) {
      rows += m.chunk.rows.length;
      for (const s of STATUS) totals[s] += m.chunk.rows.filter((r) => r.t === s).length;
    }
    if (rows === index.rowCount) ok(`行数 ${rows}`);
    else bad(`模块行数和 ${rows} ≠ index.rowCount ${index.rowCount}`);
    for (const s of STATUS) {
      if (totals[s] === index.stats[s]) ok(`${s} ${totals[s]}`);
      else bad(`${s} 重算 ${totals[s]} ≠ index.stats ${index.stats[s]}`);
    }
    if (index.statsModeled === totals.implemented + totals.partial + totals.missing) ok("已建模行数自洽");
    else bad(`statsModeled ${index.statsModeled} ≠ 已建模三态和`);
    const search = readFileSync(join(DATA, "search.json"), "utf8");
    if (JSON.parse(search).length === index.search.rows) ok("搜索索引行数自洽");
    else bad("search.json 行数与 index.search.rows 不一致");
  });

  it("② 模块元数据与行内容一致", () => {
    let drift = 0;
    for (const m of modules()) {
      if (m.rows !== m.chunk.rows.length) {
        bad(`${m.id} 元数据 ${m.rows} ≠ 实际 ${m.chunk.rows.length}`);
        drift++;
      }
      for (const s of STATUS) {
        const n = m.chunk.rows.filter((r) => r.t === s).length;
        if (m.stats[s] !== n) {
          bad(`${m.id} 的 ${s} 元数据 ${m.stats[s]} ≠ 实际 ${n}`);
          drift++;
        }
      }
    }
    if (drift === 0) ok(`模块元数据一致（${modules().length} 个模块）`);
  });

  it("③ 每一格都有可解释的状态：已实现有证据、没计划有理由", () => {
    let drift = 0;
    for (const m of modules()) {
      for (const r of m.chunk.rows) {
        if (!STATUS.includes(r.t)) {
          bad(`${m.id} ${r.o}.${r.n} 状态非法：${String(r.t)}`);
          drift++;
          continue;
        }
        if (r.t === "implemented" && r.e.length === 0) {
          bad(`${m.id} ${r.o}.${r.n} 标已实现但没有证据`);
          drift++;
        }
        if (r.t === "unplanned") {
          const note = r.e[0];
          if (note === undefined || note[0] !== "n" || note[1].trim() === "") {
            bad(`${m.id} ${r.o}.${r.n} 标没计划但没写理由`);
            drift++;
          }
        }
      }
    }
    if (drift === 0) ok("所有格子的状态都可解释");
  });

  it("④ 没计划规则可编译且都有理由", () => {
    const scope = JSON.parse(readFileSync(join(ROOT, "tools", "compat", "scope.json"), "utf8"));
    const patterns = scope.engine.unplannedPatterns ?? [];
    let drift = 0;
    for (const p of patterns) {
      try {
        new RegExp(p.match);
      } catch (e) {
        bad(`没计划规则不可编译：${String(p.match)}（${String(e)}）`);
        drift++;
      }
      if (!Array.isArray(p.owners) || p.owners.length === 0 || typeof p.reason !== "string" || p.reason.trim() === "") {
        bad(`没计划规则缺 owners / reason：${String(p.match)}`);
        drift++;
      }
    }
    if (drift === 0) ok(`${patterns.length} 条没计划规则可用`);
  });

  it("⑤ roster 格数与矩阵账本同步", () => {
    const index = JSON.parse(readFileSync(join(DATA, "index.json"), "utf8"));
    const cells = parseRoster();
    if (cells.length === index.roster.cells) ok(`拒绝清单 ${cells.length} 格`);
    else bad(`拒绝清单现为 ${cells.length} 格，矩阵记 ${index.roster.cells} 格`);
    const codes = [...new Set(cells.map((c) => c.code))].sort();
    if (codes.join(",") === index.roster.codes.join(",")) ok(`拒绝码 ${codes.length} 个`);
    else bad("roster 拒绝码与矩阵不一致");
  });
});
