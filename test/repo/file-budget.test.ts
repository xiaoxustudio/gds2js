import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT } from "../../tools/lib.mjs";

const EXEMPT_FROM_BUDGET = ["ucaps", "engine-classes", "case-flags", "case-table"];
const REGENERATED = ["case-table", "case-flags", "ucaps"];
const PROVENANCE_DEBT = ["engine-classes"];
const CODE_BUDGET: Array<[string, number]> = [
  ["packages/runtime/src/runtime/values", 2238],
  ["packages/runtime/src/runtime/methods", 59],
  ["packages/runtime/src/runtime/builtins", 1674],
  ["packages/runtime/src/runtime/packed", 1098],
  ["packages/compiler/src/lower/lower", 1269],
  ["packages/compiler/src/analyze/checks-collections", 1153],
];

function tsUnder(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) tsUnder(p, out);
    else if (name.endsWith(".ts")) out.push(p);
  }
  return out;
}

const modules: Array<{ id: string; lines: number }> = [];
for (const pkg of ["runtime", "compiler"]) {
  const root = join(ROOT, "packages", pkg, "src");
  for (const f of tsUnder(root)) {
    const id = f.slice(ROOT.length + 1).split("\\").join("/").replace(/\.ts$/, "");
    if (id.includes("vendor")) continue;
    modules.push({ id, lines: readFileSync(f, "utf8").split("\n").length });
  }
}

const exempt = (id: string): boolean => EXEMPT_FROM_BUDGET.some((d) => id.endsWith("/" + d));

describe("文件预算门（超千行的手写码只减不增、无来源的数据表要记账且只能销账）", () => {
  it("① 每份登记过的超千行文件不得再长", () => {
    const broke: string[] = [];
    for (const [id, budget] of CODE_BUDGET) {
      const m = modules.find((x) => x.id === id);
      if (m === undefined) broke.push(`${id} 登记了预算但文件已不在盘面（拆完请把预算一起删掉）`);
      else if (m.lines > budget) broke.push(`${id} 现有 ${String(m.lines)} 行，超出登记的 ${String(budget)} 行`);
    }
    for (const b of broke) bad(b);
    if (broke.length === 0) ok(`${String(CODE_BUDGET.length)} 份登记文件全部在预算内（棘轮只降不升）`);
  });

  it("② 超千行的手写码必须登记预算，不许靠豁免清单漏过去", () => {
    const unstocked = modules
      .filter((m) => m.lines > 1500)
      .filter((m) => !exempt(m.id))
      .filter((m) => !CODE_BUDGET.some(([id]) => m.id === id))
      .map((m) => `${m.id} ${String(m.lines)} 行`);
    for (const u of unstocked) bad(`${u} —— 拆它，或登记进 CODE_BUDGET 并解释为什么不能拆`);
    if (unstocked.length === 0) ok("没有未登记、又没过 1500 行线的文件");
  });

  it("③ 豁免清单里的表要真的还是表", () => {
    const stale = EXEMPT_FROM_BUDGET.filter((d) => !modules.some((m) => m.id.endsWith("/" + d)));
    for (const s of stale) bad(`${s} 已不在盘面，豁免清单要跟着瘦`);
    if (stale.length === 0) ok(`${String(EXEMPT_FROM_BUDGET.length)} 份数据表豁免全部有效`);
  });

  it("④ 无生成器的数据表只许是登记的那几份", () => {
    const actual = EXEMPT_FROM_BUDGET.filter((d) => !REGENERATED.includes(d) && modules.some((m) => m.id.endsWith("/" + d))).sort();
    const extra = actual.filter((d) => !PROVENANCE_DEBT.includes(d));
    const gone = PROVENANCE_DEBT.filter((d) => !actual.includes(d));
    for (const e of extra) bad(`${e} 是无来源的新数据表：要 tools/ 生成器 + regen 脚本 + codegen-drift 覆盖`);
    for (const g of gone) bad(`${g} 已经可重算了，从 PROVENANCE_DEBT 里去掉`);
    if (extra.length === 0 && gone.length === 0) ok(`无来源数据表恰好登记的这几份：${actual.join(" / ")}`);
  });
});
