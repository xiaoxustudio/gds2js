/**
 * 生成物漂移门：`packages/runtime/src/runtime/case-{table,flags}.ts` 是 codegen 产物、
 * 文件头自己写着「别手改，改请重跑生成流程」，但此前没有任何门能发现有人手改了它，
 * 也发现不了「跑了 pnpm regen:* 却忘了提交」。做法是调 tools/case-codegen.mjs 里那份
 * **与落盘脚本共用**的纯计算，从探头 golden 算出「现在应该是什么内容」，再与盘上已提交的
 * 文件比 —— 本文件一个字都不写。
 *
 * 探头用例 `corpus/cases/000-probe-cs-*` 与 `000-probe-cf-*` 是 gitignored 的（现搭现弃
 * 不入库），所以新克隆的机器上这道门直接 skip。它防的是「手改生成物」与「regen 跑了没
 * 提交」这两类真实事故；**Godot 侧的分类/映射本身有没有变**，仍要跑 regen:case-table /
 * regen:case-flags（会重搭探头、真起 Godot）才会知道。
 *
 * 比的是**内容**不是行尾：生成脚本用模板字面量渲染，产出恒为 LF；而本机
 * `core.autocrlf=true` 会让 `git checkout` 把工作树里的文件重写成 CRLF（实测 7606 →
 * 7788 字节），逐字节比就会被行尾策略假阳性触发 —— 所以两边先过 `lf()`。
 * golden 比对那边潜伏着同一个坑，本轮没动，建议单开一轮加 .gitattributes。
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  computeCaseTable,
  parseCaseFlagsSets,
  parseCaseTableRows,
  renderCaseFlags,
  renderCaseTable,
} from "../../tools/case-codegen.mjs";
import { CORPUS, ROOT } from "../support/lib-bridge";

/** 归一行尾：见文件头。committed blob 是 LF，工作树可能被 autocrlf 变成 CRLF。 */
const lf = (s: string): string => s.replace(/\r\n/g, "\n");

function probeDirs(prefix: string): string[] {
  if (!existsSync(CORPUS)) return [];
  return readdirSync(CORPUS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith(prefix))
    .map((d) => d.name)
    .sort();
}

/** case-table 吃全部 000-probe-cs-* 的 golden；case-flags 只吃 000-probe-cf-0 一份。 */
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
