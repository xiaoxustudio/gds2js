/**
 * 语义分析的检出率度量。
 *
 * 判据不是"我觉得该报错"，而是 **Godot 到底报没报错**：golden 里有 SCRIPT ERROR 就是预期报错。
 * - 误报：我们报错但 Godot 放过了 —— 会把能跑的代码拦死，最伤
 * - 漏报：Godot 报错但我们放过了 —— 会以"编译成功但语义错"的形式漏出去
 *
 * 跑：node_modules/.bin/tsx tools/sema-check.ts
 */
import { readFileSync } from "node:fs";
import { analyze } from "../src/lower/analyze";
import { lower } from "../src/lower/lower";
import { parseSource } from "../src/parse/parser";
import { caseScript, godotOk, listCases, readGolden } from "./lib.mjs";

interface Row {
  id: string;
  code: string;
  msg: string;
}

const cases = listCases();
let hit = 0;
const falsePositives: Row[] = [];
const misses: Row[] = [];
const crashes: Row[] = [];

for (const id of cases) {
  const golden = readGolden(id) ?? "";
  const expectError = !godotOk(golden);

  let diags: Array<{ code: string; message: string }> = [];
  let crashed = false;
  try {
    diags = analyze(lower(await parseSource(readFileSync(caseScript(id), "utf8"))));
  } catch (e) {
    crashed = true;
    diags = [{ code: "CRASH", message: e instanceof Error ? e.message : String(e) }];
  }

  if (process.argv.includes("--verbose") && diags.length > 0) {
    console.log(`  [${id}] ` + diags.map((d) => `${d.code}: ${d.message}`).join(" | "));
  }

  const gotError = diags.length > 0;
  if (crashed) {
    crashes.push({ id, code: "CRASH", msg: diags[0]?.message ?? "" });
    continue;
  }
  if (gotError === expectError) {
    hit++;
  } else if (gotError) {
    falsePositives.push({ id, code: diags[0]?.code ?? "", msg: diags[0]?.message ?? "" });
  } else {
    misses.push({ id, code: "missed", msg: "Godot 报错但我们放过了" });
  }
}

console.log(`语义分析检出：命中 ${hit}/${cases.length}`);
console.log(`  误报 ${falsePositives.length}   漏报 ${misses.length}   崩溃 ${crashes.length}`);

const dump = (title: string, rows: Row[]) => {
  if (rows.length === 0) return;
  console.log(`\n${title}`);
  for (const r of rows) console.log(`  ${r.id.padEnd(30)} ${r.code.padEnd(22)} ${r.msg}`);
};
dump("误报（我们报错，Godot 通过）", falsePositives);
dump("漏报（Godot 报错，我们放过）", misses);
dump("崩溃", crashes);

if (falsePositives.length + misses.length + crashes.length > 0) process.exit(1);
