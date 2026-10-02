import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { caseDir, caseScript, listSingleCases } from "./lib.mjs";

const filter = process.argv.slice(2).find((a) => !a.startsWith("--")) || "";
const cases = listSingleCases(filter);

/** 生成物落在 corpus/cases/<id>/：runtime 与测试宿主都按仓库原位（三级回溯）—— 这两个值以前是 emitter 的默认值，现在由调用方声明。 */
const GEN_EMIT_OPTS = {
  runtimeImport: "../../../packages/runtime/src/runtime/index",
  hostImport: "../../../tools/harness/scene-tree",
};

/** scriptc-check 的文本口径：产物里有没有 compress()/decompress()（`rt.method(x, "compress", …)`）。 */
const NEED_ZSTD_TEXT = /,\s*"(?:compress|decompress)"\s*,/;
/** 带 autoRun 尾巴的产物必须自己兜底：直接跑产物时没有 CLI 那层 try/catch。 */
const ENTRY_TAIL = /const __gd_entry = new \w+\(\);/;
const FALLBACK_TAIL = /rt\.reportRunFailure\(/;
const runFallbackMissing: string[] = [];
/** 文本口径（NEED_ZSTD）与 IR 标志（usesPackCodec）必须逐用例一致 —— 两条判据互锁在这里。 */
const packCodecMismatch: string[] = [];

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
    const gen = emitModule(ir, GEN_EMIT_OPTS);
    const saysZstd = NEED_ZSTD_TEXT.test(gen);
    if (saysZstd !== (ir.usesPackCodec === true)) {
      packCodecMismatch.push(`${id}: 文本=${String(saysZstd)} / IR=${String(ir.usesPackCodec === true)}`);
    }
    if (ENTRY_TAIL.test(gen) && !FALLBACK_TAIL.test(gen)) runFallbackMissing.push(id);
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
console.log(`  emitter 不支持 ${unsupported.length}`);
console.log(`  pack codec 口径不一致 ${packCodecMismatch.length}（文本 regex vs IR 标志，应为 0）`);
console.log(`  自兜底缺失 ${runFallbackMissing.length}（有 autoRun 尾巴却没 reportRunFailure，应为 0）`);
if (unsupported.length > 0) {
  console.log("\nemitter 缺口：");
  for (const u of unsupported) console.log(`  ${u.id.padEnd(30)} ${u.msg}`);
}
if (packCodecMismatch.length > 0) {
  for (const m of packCodecMismatch) console.log(`  ✗ ${m}`);
  process.exitCode = 1;
}
if (runFallbackMissing.length > 0) {
  for (const m of runFallbackMissing) console.log(`  ✗ ${m}`);
  process.exitCode = 1;
}
