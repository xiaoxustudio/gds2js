import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT, listCases } from "../../tools/lib.mjs";

describe("文档计数门（AGENTS.md 的读数必须跟着盘面走）", () => {
  it("① 语料用例数", () => {
    const actual = listCases("").length;
    const m = /语料用例\s+(\d+)\s+例/.exec(readFileSync(join(ROOT, "AGENTS.md"), "utf8"));
    if (m === null) bad("AGENTS.md 的语料读数没写成「语料用例 N 例」（探头另计）");
    else if (Number(m[1]) === actual) ok(`AGENTS.md 语料读数 = ${String(actual)} 例`);
    else bad(`AGENTS.md 写 ${m[1]} 例，corpus/cases 实为 ${String(actual)} 例（不含 000-* 探头）`);
  });

  it("② 探头用例走排除口径", () => {
    const probes = listCases("000-");
    const all = new Set<string>(probes);
    if (probes.length > 0 && listCases("").every((n) => !all.has(n))) ok(`探头 ${String(probes.length)} 支不进语料：${probes.join(", ")}`);
    else bad("listCases 的 000- 探头排除口径断了");
  });
});
