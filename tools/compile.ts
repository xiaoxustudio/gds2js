import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { emitModule } from "../src/emit/emitter";
import { analyze } from "../src/lower/analyze";
import { lower } from "../src/lower/lower";
import { parseSource } from "../src/parse/parser";
import { UnsupportedError } from "../src/runtime/errors";
import { caseDir, caseScript, listSingleCases } from "./lib.mjs";

const filter = process.argv.slice(2).find((a) => !a.startsWith("--")) || "";
const cases = listSingleCases(filter);

let compiled = 0;
const rejected: string[] = [];
const unsupported: Array<{ id: string; msg: string }> = [];

/**
 * 不用 rmSync 删旧产物 —— 沙箱里 rmSync 会走回收站且可能超时。
 * 改成直接**覆写**：失败用例留一个抛错的占位文件，
 * js-runner 跑到它时会把明确原因记进「崩溃」桶，而不是跑到上一轮的陈旧代码。
 */
const writeStub = (id: string, reason: string): void => {
  writeFileSync(
    join(caseDir(id), "main.gen.mts"),
    `// gds2js：本轮没有生成有效产物。保留文件是为了让 js-runner 报出明确原因。\nthrow new Error(${JSON.stringify(`gds2js 编译失败：${reason}`)});\n`,
    "utf8",
  );
};

for (const id of cases) {
  const src = readFileSync(caseScript(id), "utf8");

  let diags: Array<{ code: string; message: string }> = [];
  try {
    diags = analyze(lower(await parseSource(src)));
  } catch (e) {
    writeStub(id, `lowering 崩溃：${e instanceof Error ? e.message : String(e)}`);
    unsupported.push({ id, msg: String(e) });
    continue;
  }
  if (diags.length > 0) {
    rejected.push(id);
    writeStub(id, `语义分析拦下：${diags[0]?.message ?? ""}`);
    continue;
  }

  try {
    const ir = lower(await parseSource(src));
    writeFileSync(join(caseDir(id), "main.gen.mts"), emitModule(ir), "utf8");
    compiled++;
  } catch (e) {
    const msg = e instanceof UnsupportedError ? e.message : String(e);
    writeStub(id, msg);
    unsupported.push({ id, msg });
  }
}

console.log(`编译成功 ${compiled}/${cases.length}`);
console.log(`  语义分析拦下（预期报错用例） ${rejected.length}`);
console.log(`  emitter 不支持 ${unsupported.length}`);
if (unsupported.length > 0) {
  console.log("\nemitter 缺口：");
  for (const u of unsupported) console.log(`  ${u.id.padEnd(30)} ${u.msg}`);
}
