/**
 * 畸形输入的对外契约：解析期拒答的**句子与行号**逐格钉在语料 golden 上。
 *
 * 解析器不合成 `type:"ERROR"` 子树、也不置 `hasError`，畸形输入的证据全在 `syntaxErrors` 里；
 * 下行原先那几处寄生在 ERROR 落点上的记号级重扫已经换到解析器侧发出。这一门只比对外的两样东西：
 * `UnsupportedError.message` 与它带的 `line`，逐格钉在 Godot 4.6.3 的读数上。
 * 语料里带解析期读数的 143 格中，39 格在 lowering 就拒（其余归语义分析层管，不在这一门里）。
 * 多句的那 6 格（330/331/332/333/422/423）引擎按行分两次报，我们拼成一条消息，行号取头一句那行。
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { cases, caseScript, readGolden } from "./support/corpus";

const PAIR = /Parse Error: (.*)\r?\n\s+at: GDScript::reload \(<case>\/main\.gd:(\d+)\)/g;

const pairsOf = (golden: string): Array<{ sentence: string; line: number }> =>
  [...golden.matchAll(PAIR)].map((m) => ({ sentence: m[1]!.trim(), line: Number(m[2]) }));

const REFUSED = 39;
const refused: string[] = [];

describe("畸形输入 · lowering 拒答的句子与行号钉在 golden 上", () => {
  it.each(cases)("%s", async (id) => {
    let err: unknown = null;
    try {
      lower(await parseSource(readFileSync(caseScript(id), "utf8")));
    } catch (e) {
      err = e;
    }
    if (err === null) return;
    refused.push(id);
    expect(err, `[${id}] 拒答得是响亮拒，不能是别的错`).toBeInstanceOf(UnsupportedError);
    const e = err as UnsupportedError & { line?: number };
    const pairs = pairsOf(readGolden(id) ?? "");
    expect(pairs.length, `[${id}] golden 里没有解析期读数，这一格不该在 lowering 拒`).toBeGreaterThan(0);
    expect(e.message, `[${id}] 句子与引擎不一致`).toBe(pairs.map((p) => p.sentence).join("\n"));
    expect(e.line, `[${id}] 行号与引擎不一致`).toBe(pairs[0]!.line);
  });

  it(`拒答格数不缩水（恒 ${REFUSED} 格）`, () => {
    expect(refused.length, `实拒：${refused.join(", ")}`).toBe(REFUSED);
  });
});
