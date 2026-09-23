/**
 * 把语料编译成 JS。产出 `corpus/cases/<id>/main.gen.mts`（emitter 的产物，
 * 与手写的 main.mts 区分开）。
 *
 * 跑：node_modules/.bin/tsx tools/compile.ts [filter]
 */
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { emitModule } from "../src/emit/emitter";
import { analyze } from "../src/lower/analyze";
import { lower } from "../src/lower/lower";
import { parseSource } from "../src/parse/parser";
import { UnsupportedError } from "../src/runtime/errors";
import { caseDir, caseScript, listCases } from "./lib.mjs";

const filter = process.argv.slice(2).find((a) => !a.startsWith("--")) || "";
const cases = listCases(filter);

let compiled = 0;
const rejected: string[] = [];
const unsupported: Array<{ id: string; msg: string }> = [];

for (const id of cases) {
  // 先清掉上一轮的产物。编译失败 / 被语义分析拦下的用例会留下**陈旧的** main.gen.mts，
  // 它半路抛错后没 flush 的输出会串到下一个用例，把度量整个带偏（实测踩过）。
  rmSync(join(caseDir(id), "main.gen.mts"), { force: true });

  const src = readFileSync(caseScript(id), "utf8");
  const ir = lower(await parseSource(src));

  const diags = analyze(ir);
  if (diags.length > 0) {
    rejected.push(id);
    continue;
  }
  try {
    writeFileSync(join(caseDir(id), "main.gen.mts"), emitModule(ir), "utf8");
    compiled++;
  } catch (e) {
    unsupported.push({ id, msg: e instanceof UnsupportedError ? e.message : String(e) });
  }
}

console.log(`编译成功 ${compiled}/${cases.length}`);
console.log(`  语义分析拦下（预期报错用例） ${rejected.length}`);
console.log(`  emitter 不支持 ${unsupported.length}`);
if (unsupported.length > 0) {
  console.log("\nemitter 缺口：");
  for (const u of unsupported) console.log(`  ${u.id.padEnd(30)} ${u.msg}`);
}
