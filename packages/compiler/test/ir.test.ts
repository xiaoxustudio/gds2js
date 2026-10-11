/**
 * 语料门 · IR：每个单文件用例都必须能 parse + lower 而不抛（引擎解析期就拒的那几形除外，见下）。
 *
 * 读数 `Lowering 成功 229/229` 由 afterAll 原样打印（docs/ROADMAP.md 记的是这个数），
 * 聚合诊断（按失败原因聚合 + 明细）也在 afterAll 打。一例一个 it() 是为了
 * `vitest run --project compiler -t 088-vector2-write-error` 能一秒重跑单例。
 */
import { readFileSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { cases, caseScript, godotOk, isStaticReject, readGolden } from "./support/corpus";

// 语料根算歪时 listSingleCases() 会静默返回 []，it.each([]) 注册 0 个测试 → 门报绿。
expect(cases.length, `单文件用例数不对劲（${cases.length}），语料根算歪了？`).toBeGreaterThan(200);

interface Row {
  id: string;
  code: string;
  msg: string;
}

let ok = 0;
let refused = 0;
const failures: Row[] = [];
const byCode = new Map<string, number>();

describe("lower · 全语料不抛", () => {
  it.each(cases)("%s", async (id) => {
    const src = readFileSync(caseScript(id), "utf8");
    try {
      lower(await parseSource(src));
      ok++;
    } catch (e) {
      // 引擎在解析期就拒的那一格，lowering 响亮拒是设计取舍；其余抛错一律判红。
      const golden = readGolden(id) ?? "";
      if (e instanceof UnsupportedError && !godotOk(golden) && isStaticReject(golden)) {
        refused++;
        return;
      }
      const msg = e instanceof Error ? e.message : String(e);
      const code = e instanceof UnsupportedError ? e.code : "CRASH";
      failures.push({ id, code, msg });
      byCode.set(code, (byCode.get(code) ?? 0) + 1);
      // 重新抛出去让 Vitest 判红：栈与消息都比自己拼的断言更有用。
      throw e;
    }
  });
});

afterAll(() => {
  console.log(`Lowering 成功 ${ok}/${cases.length}`);
  console.log(`  其中 lowering 响亮拒（引擎解析期同拒） ${refused}`);
  if (failures.length === 0) return;
  console.log("\n按失败原因聚合：");
  for (const [code, n] of [...byCode].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${code.padEnd(22)} ${n}`);
  }
  console.log("\n明细：");
  for (const f of failures) console.log(`  ${f.id.padEnd(30)} ${f.code}: ${f.msg}`);
});
