import { expect, type TestContext } from "vitest";

export type Verdict = "ok" | "refused" | "no-lib" | "crash" | "FAIL";

export interface Tally {
  ok: number;
  booked: number;
  fail: number;
}

export function newTally(): Tally {
  return { ok: 0, booked: 0, fail: 0 };
}

export function settle(cell: string, v: Verdict, note: string, ctx: TestContext, tally: Tally): void {
  if (v === "ok") {
    tally.ok++;
    return;
  }
  if (v === "FAIL" || v === "crash") {
    tally.fail++;
    expect(v, `${cell}：${note}`).toBe("ok");
    return;
  }
  tally.booked++;
  ctx.skip(true, `${v}${note === "" ? "" : `：${note}`}`);
}

/**
 * 从子进程的 stdout+stderr 里认 export CLI 打出的分类标记。
 * 这是**产品代码与门之间的契约**（标记由 packages/gds2js/src/cli/export-common.ts:27 打出），
 * 不是门的内部实现，所以两边必须同形：认不出的 tag 一律当 FAIL，绝不静默放过。
 */
export function verdictOf(out: string): { v: Verdict; note: string } | null {
  const m = /gds2js-export\[([\w-]+)\]\s*(.*)/.exec(out);
  if (m === null) return null;
  const raw = m[1]!;
  const note = m[2] ?? "";
  if (raw === "failed") return { v: "FAIL", note };
  if (raw === "refused" || raw === "no-lib" || raw === "crash") return { v: raw, note };
  return { v: "FAIL", note: `认不出的分类 ${raw}` };
}

/** 出货门的汇总行，文本沿用旧门脚本的措辞以便按老样子 grep。 */
export function summaryLine(t: Tally): string {
  return `汇总：ok ${t.ok} / 上游或环境记账 ${t.booked} / FAIL ${t.fail}`;
}
