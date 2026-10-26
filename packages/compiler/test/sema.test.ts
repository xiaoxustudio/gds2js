/**
 * 语料门 · 语义分析：analyze 必须**恰好**在 Godot 的 golden 含 Parse Error 的那些用例上拒答。
 *
 * 三行读数与三段明细 dump 由 afterAll 原样打印：
 *   语义分析检出：命中 229/229
 *     误报 0   漏报 0   崩溃 0
 *     另有 17 例是 Godot 运行期才报错、语义分析层不管辖的：<清单>
 * 那 17 例的清单是很强的行为指纹，改动必须逐条对得上。
 *
 * `--verbose` 改成 GDS2JS_SEMA_VERBOSE=1 —— Vitest 下 process.argv 是 runner 自己的。
 */
import { readFileSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { cases, caseScript, godotOk, isStaticReject, readGolden } from "./support/corpus";

// 0 例会让 it.each([]) 注册 0 个测试而门报绿，理由见 ir.test.ts。
expect(cases.length, `单文件用例数不对劲（${cases.length}），语料根算歪了？`).toBeGreaterThan(200);

const VERBOSE = process.env.GDS2JS_SEMA_VERBOSE === "1";

interface Row {
  id: string;
  code: string;
  msg: string;
}

let hit = 0;
const falsePositives: Row[] = [];
const misses: Row[] = [];
const crashes: Row[] = [];
const runtimeOnly: string[] = [];

describe("analyze · 静态拒答口径与 Godot 对齐", () => {
  it.each(cases)("%s", async (id) => {
    const golden = readGolden(id) ?? "";
    const expectError = !godotOk(golden) && isStaticReject(golden);
    if (!godotOk(golden) && !expectError) runtimeOnly.push(id);

    let diags: Array<{ code: string; message: string }> = [];
    let crashed = false;
    try {
      diags = analyze(lower(await parseSource(readFileSync(caseScript(id), "utf8")))).diagnostics;
    } catch (e) {
      // lowering 期的 UnsupportedError 与 analyze 的报错同格（都是响亮拒），不进「崩溃」桶。
      if (e instanceof UnsupportedError) diags = [{ code: e.code, message: e.message }];
      else {
        crashed = true;
        diags = [{ code: "CRASH", message: e instanceof Error ? e.message : String(e) }];
      }
    }

    if (VERBOSE && diags.length > 0) {
      console.log(`  [${id}] ` + diags.map((d) => `${d.code}: ${d.message}`).join(" | "));
    }

    if (crashed) {
      crashes.push({ id, code: "CRASH", msg: diags[0]?.message ?? "" });
      expect(crashed, `[${id}] 语义分析崩溃：${diags[0]?.message ?? ""}`).toBe(false);
      return;
    }

    const gotError = diags.length > 0;
    if (gotError === expectError) {
      hit++;
      return;
    }
    if (gotError) {
      const row = { id, code: diags[0]?.code ?? "", msg: diags[0]?.message ?? "" };
      falsePositives.push(row);
      expect(gotError, `[${id}] 误报（我们报错，Godot 通过）：${row.code}: ${row.msg}`).toBe(expectError);
    } else {
      misses.push({ id, code: "missed", msg: "Godot 报错但我们放过了" });
      expect(gotError, `[${id}] 漏报（Godot 报错，我们放过）`).toBe(expectError);
    }
  });
});

afterAll(() => {
  console.log(`语义分析检出：命中 ${hit}/${cases.length}`);
  console.log(`  误报 ${falsePositives.length}   漏报 ${misses.length}   崩溃 ${crashes.length}`);
  console.log(
    `  另有 ${runtimeOnly.length} 例是 Godot 运行期才报错、语义分析层不管辖的：${runtimeOnly.join(", ") || "无"}`,
  );

  const dump = (title: string, rows: Row[]): void => {
    if (rows.length === 0) return;
    console.log(`\n${title}`);
    for (const r of rows) console.log(`  ${r.id.padEnd(30)} ${r.code.padEnd(22)} ${r.msg}`);
  };
  dump("误报（我们报错，Godot 通过）", falsePositives);
  dump("漏报（Godot 报错，我们放过）", misses);
  dump("崩溃", crashes);
});
