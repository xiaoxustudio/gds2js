import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  computeCaseTable,
  parseCaseFlagsSets,
  parseCaseTableRows,
  renderCaseFlags,
  renderCaseTable,
} from "../../tools/case-codegen.mjs";
import { renderUcaps } from "../../tools/ucaps.mjs";
import { CORPUS, ROOT } from "../support/lib-bridge";

const lf = (s: string): string => s.replace(/\r\n/g, "\n");

function probeDirs(prefix: string): string[] {
  if (!existsSync(CORPUS)) return [];
  return readdirSync(CORPUS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith(prefix))
    .map((d) => d.name)
    .sort();
}

const TABLE_GOLDENS = probeDirs("000-probe-cs-")
  .map((d) => `${CORPUS}/${d}/godot.txt`)
  .filter((p) => existsSync(p));
const FLAGS_GOLDEN = `${CORPUS}/000-probe-cf-0/godot.txt`;

const haveProbes = TABLE_GOLDENS.length > 0 && existsSync(FLAGS_GOLDEN);
const SKIP_WHY = haveProbes
  ? ""
  : `（跳过：探头用例 gitignored，先跑 pnpm regen:case-table 与 pnpm regen:case-flags）`;

describe.skipIf(!haveProbes)(`生成源码无漂移${SKIP_WHY}`, () => {
  it(`case-table.ts 逐字节等于重跑生成流程的产出（由 ${TABLE_GOLDENS.length} 份探头 golden 算出）`, () => {
    const rows = parseCaseTableRows(TABLE_GOLDENS.map((p) => readFileSync(p, "utf8")));
    const want = renderCaseTable(rows, computeCaseTable(rows));
    const got = readFileSync(`${ROOT}/packages/runtime/src/runtime/case-table.ts`, "utf8");
    expect(lf(got), "case-table.ts 漂了：手改了生成物，或 regen:case-table 跑了没提交").toBe(lf(want));
  });

  it("case-flags.ts 逐字节等于重跑生成流程的产出", () => {
    const sets = parseCaseFlagsSets(readFileSync(FLAGS_GOLDEN, "utf8"));
    const want = renderCaseFlags(sets);
    const got = readFileSync(`${ROOT}/packages/runtime/src/runtime/case-flags.ts`, "utf8");
    expect(lf(got), "case-flags.ts 漂了：手改了生成物，或 regen:case-flags 跑了没提交").toBe(lf(want));
  });
});

const SWEEP = `${ROOT}/tmp/ucaps-probe/sweep.txt`;
const haveSweep = existsSync(SWEEP);

describe.skipIf(!haveSweep)(`ucaps 生成源码无漂移${haveSweep ? "" : "（跳过：全码点扫描读数在 tmp/ 下，先跑 pnpm regen:ucaps）"}`, () => {
  it("ucaps.ts 逐字节等于 Godot 全码点扫描重算的产出", () => {
    const want = renderUcaps(readFileSync(SWEEP, "utf8"));
    const got = readFileSync(`${ROOT}/packages/runtime/src/runtime/ucaps.ts`, "utf8");
    expect(lf(got), "ucaps.ts 漂了：手改了生成物，或 Godot 版本不是钉住的 4.6.3").toBe(lf(want));
  });
});
