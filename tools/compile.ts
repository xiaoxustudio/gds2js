import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/analyze";
import { NO_ANALYSIS, type AnalysisResult } from "@gds2js/compiler/analyze/analysis-result";
import { lower } from "@gds2js/compiler/lower/lower";
import type { Module } from "@gds2js/compiler/lower/ir";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { caseDir, caseScript, godotOk, listSingleCases, readGolden } from "./lib.mjs";

const filter = process.argv.slice(2).find((a) => !a.startsWith("--")) || "";
const cases = listSingleCases(filter);

const GEN_EMIT_OPTS = {
  runtimeImport: "../../../packages/runtime/src/runtime/index",
  hostImport: "../../../tools/harness/scene-tree",
  resPath: "res://main.gd",
};

let compiled = 0;
const rejected: string[] = [];
const unsupported: Array<{ id: string; msg: string }> = [];
const refused: Array<{ id: string; msg: string }> = [];

const writeStub = (id: string, reason: string): void => {
  writeFileSync(
    join(caseDir(id), "main.gen.mts"),
    `// gds2js：本轮没有生成有效产物。保留文件是为了让 js-runner 报出明确原因。\nthrow new Error(${JSON.stringify(`gds2js 编译失败：${reason}`)});\n`,
    "utf8",
  );
};

for (const id of cases) {
  const src = readFileSync(caseScript(id), "utf8");

  let ir: Module | null = null;
  let diags: Array<{ code: string; message: string }> = [];
  let analysis: AnalysisResult = NO_ANALYSIS;
  try {
    ir = lower(await parseSource(src));
    analysis = analyze(ir, undefined, id);
    diags = analysis.diagnostics;
  } catch (e) {
    if (e instanceof UnsupportedError && !godotOk(readGolden(id))) {
      refused.push({ id, msg: e.message });
      writeStub(id, `lowering 响亮拒（引擎解析期同拒）：${e.message}`);
    } else {
      writeStub(id, `lowering 崩溃：${e instanceof Error ? e.message : String(e)}`);
      unsupported.push({ id, msg: String(e) });
    }
    continue;
  }
  if (diags.length > 0) {
    rejected.push(id);
    writeStub(id, `语义分析拦下：${diags[0]?.message ?? ""}`);
    continue;
  }

  try {
    const gen = emitModule(ir!, GEN_EMIT_OPTS, analysis);
    writeFileSync(join(caseDir(id), "main.gen.mts"), gen, "utf8");
    compiled++;
  } catch (e) {
    const msg = e instanceof UnsupportedError ? e.message : String(e);
    writeStub(id, msg);
    unsupported.push({ id, msg });
  }
}

console.log(`编译成功 ${compiled}/${cases.length}`);
console.log(`  语义分析拦下（预期报错用例） ${rejected.length}`);
console.log(`  lowering 响亮拒（引擎解析期同拒） ${refused.length}`);
console.log(`  emitter 不支持 ${unsupported.length}`);

if (unsupported.length > 0) {
  console.log("\nemitter 缺口：");
  for (const u of unsupported) console.log(`  ${u.id.padEnd(30)} ${u.msg}`);
}
