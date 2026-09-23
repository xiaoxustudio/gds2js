/**
 * Lowering 覆盖率：拿全部语料喂给 CST→IR，看有多少能降下来、卡在什么节点上。
 * 这是**状态层**的度量，不代表语义正确 —— 正确性由 Godot 的 golden 判。
 * 跑：node_modules/.bin/tsx tools/ir-check.ts
 */
import { readFileSync } from "node:fs";
import { parseSource } from "../src/parse/parser";
import { lower } from "../src/lower/lower";
import { UnsupportedError } from "../src/runtime/errors";
import { caseScript, listSingleCases } from "./lib.mjs";

const cases = listSingleCases();
let ok = 0;
const failures: Array<{ id: string; code: string; msg: string }> = [];
const byCode = new Map<string, number>();

for (const id of cases) {
  const src = readFileSync(caseScript(id), "utf8");
  try {
    const tree = await parseSource(src);
    lower(tree);
    ok++;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const code = e instanceof UnsupportedError ? e.code : "CRASH";
    failures.push({ id, code, msg });
    byCode.set(code, (byCode.get(code) ?? 0) + 1);
  }
}

console.log(`Lowering 成功 ${ok}/${cases.length}`);
if (failures.length > 0) {
  console.log("\n按失败原因聚合：");
  for (const [code, n] of [...byCode].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${code.padEnd(22)} ${n}`);
  }
  console.log("\n明细：");
  for (const f of failures) console.log(`  ${f.id.padEnd(30)} ${f.code}: ${f.msg}`);
  process.exit(1);
}
