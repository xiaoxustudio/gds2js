/**
 * 跨文件编译的最小本地验证（tools/golden 之外的多文件冒烟）。
 * 跑：node_modules/.bin/tsx tools/multi-demo.ts
 *
 * 用 gds2js 自引用说明符编译 examples/multi，写进 examples/multi/dist，
 * 再 import 入口产物，证明 class_name 全局注册 + 跨文件 extends + 跨文件 new/is 真跑通。
 * 语义以 Godot golden 为准（由 corpus 流程负责），这里只证明"编译产物结构正确且能执行"。
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { compileProject, findGdFiles } from "../src/compile/project";

const root = resolve("examples/multi");
const outDir = join(root, "dist");

const result = await compileProject({
  entries: [join(root, "main.gd")],
  resRoot: root,
  outDir,
  runtimeImport: "gds2js/runtime",
  hostImport: "gds2js/host",
});

for (const m of result.modules) {
  mkdirSync(dirname(m.jsPath), { recursive: true });
  writeFileSync(m.jsPath, m.code, "utf8");
  console.error(`生成 ${m.jsPath}`);
}
if (result.diags.length > 0) {
  for (const d of result.diags) console.error(`  ${d.resPath}:${d.diagnostic.loc.line} ${d.diagnostic.message}`);
}

const entry = result.modules.find((m) => m.resPath === "res://main.gd");
if (!entry) throw new Error("入口未产出");
console.error("--- 运行产物 ---");
await import(pathToFileURL(entry.jsPath).href);
// 产物末尾的 autoRun 已驱动；host 的 flush 在 run() 里执行。
void findGdFiles;
