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
void findGdFiles;
