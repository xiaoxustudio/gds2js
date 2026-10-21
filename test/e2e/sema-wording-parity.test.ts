/**
 * 预期报错用例的**正文对账门**（S612）：语料里那些 golden 带 `Parse Error` 的用例，
 * 把编译期诊断逐条（**行号 + 句子 + 发序**）与引擎原文对。
 *
 * 这道门此前不存在 —— `corpus-diff` 只把预期报错用例归桶跳过，各笔 S 编号靠 tmp 探头人工对账，
 * 于是「文案漂了 / 多发一条 / 少发一条 / 次序不同」全都静默过关（S608–S612 一路就是这么挖出来的）。
 * lowering 抛出的那一批没有 loc（抛在走 IR 之前），所以那一族只比**句子与条数**，不比行号 —— 差距记在每条 it 的名字里。
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { CORPUS } from "../support/lib-bridge";

type Loc = { line: number; col: number } | null;

/** golden 里的解析期句：句子与紧跟那行 `at: … (…:NN)` 配成一条。 */
function engineLines(gold: string): Array<{ line: string; text: string }> {
  const out: Array<{ line: string; text: string }> = [];
  const rows = gold.split(/\r?\n/);
  for (let i = 0; i < rows.length; i++) {
    const m = /^SCRIPT ERROR: Parse Error: (.*)$/.exec(rows[i] ?? "");
    if (m === null) continue;
    const at = /\.gd:(\d+)/.exec(rows[i + 1] ?? "");
    out.push({ line: at?.[1] ?? "?", text: m[1] });
  }
  return out;
}

const CASES = existsSync(CORPUS)
  ? readdirSync(CORPUS, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^\d{3}-/.test(d.name))
      .map((d) => d.name)
      .sort()
      .map((id) => ({ id, eng: engineLines(readFileSync(`${CORPUS}/${id}/godot.txt`, "utf8")) }))
      .filter((c) => c.eng.length > 0)
  : [];

describe.each(CASES)("预期报错正文 $id（$eng 条）", ({ id, eng }) => {
  it("编译期诊断与引擎逐条同句、同行、同序", async () => {
    const src = readFileSync(`${CORPUS}/${id}/main.gd`, "utf8");
    let diags: Array<{ loc: Loc; message: string }> | null = null;
    let thrown: string | null = null;
    try {
      diags = analyze(lower(await parseSource(src)), undefined, id) as Array<{ loc: Loc; message: string }>;
    } catch (e) {
      thrown = (e as Error).message;
    }
    if (diags === null) {
      const parts = (thrown ?? "").split("\n");
      expect(parts.map((p) => p.trim()), `${id}：lowering 抛出的句子集合`).toEqual(eng.map((x) => x.text));
      return;
    }
    expect(diags.map((d) => `${String(d.loc?.line ?? "?")}|${d.message}`), `${id}：诊断序`).toEqual(
      eng.map((x) => `${x.line}|${x.text}`),
    );
  });
});
