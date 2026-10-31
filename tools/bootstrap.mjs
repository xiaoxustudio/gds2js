#!/usr/bin/env node
// 自举切片的 golden 取数器：切片不是语料，它只喂阶段零那把两阶段收敛门。
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { DEFAULT_TIMEOUT_MS, GODOT_BIN, ROOT, godotOk, normalize, requireGodotPin, runGodot } from "./lib.mjs";

export const SLICE_ROOT = join(ROOT, "test", "fixtures", "bootstrap", "slices");

export function listSlices(filter = "") {
  if (!existsSync(SLICE_ROOT)) return [];
  return readdirSync(SLICE_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => n.includes(filter))
    .sort();
}

const argv = process.argv.slice(2);
const checkOnly = argv.includes("--check");
const treeMode = argv.includes("--tree");
const filter = argv.find((a) => !a.startsWith("--") && !treeMode) || "";
if (treeMode) {
  requireGodotPin();
  const dir = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc");
  spawnSync(GODOT_BIN, ["--headless", "--path", dir, "--import"], { encoding: "utf8", timeout: 120_000, windowsHide: true });
  const bootCase = join(ROOT, "corpus", "cases", "487-preload-cross-file");
  const run = runGodot(join(dir, "main.gd"), { timeoutMs: 60_000, projectPath: dir, env: { ...process.env, GDS2JS_BOOT_CASE: bootCase } });
  const text = normalize(run.text, join(dir, "main.gd"));
  const ref = join(dir, "gdsrc.txt");
  if (checkOnly) {
    const prev = existsSync(ref) ? readFileSync(ref, "utf8") : null;
    console.log(prev === text ? "gdsrc 参照无变化" : "gdsrc 参照漂移");
    process.exit(prev === text ? 0 : 1);
  }
  writeFileSync(ref, text, "utf8");
  console.log("gdsrc 参照写出：" + String(text.split("\n").length) + " 行");
  process.exit(0);
}
const slices = listSlices(filter);
if (slices.length === 0) {
  console.error(`没有匹配的自举切片（filter="${filter}"）：${SLICE_ROOT}`);
  process.exit(1);
}

console.log(`裁判引擎: ${GODOT_BIN}`);
requireGodotPin();
console.log(`切片数量: ${slices.length}${checkOnly ? "  (check 模式，不写盘)" : ""}\n`);

const goldenPath = (id) => join(SLICE_ROOT, id, "godot.txt");
let drift = 0;
for (const id of slices) {
  const gd = join(SLICE_ROOT, id, "main.gd");
  const run = runGodot(gd, { timeoutMs: DEFAULT_TIMEOUT_MS });
  const norm = normalize(run.text, gd);
  const status = run.timedOut ? "TIMEOUT" : godotOk(norm) ? "OK" : "PARSE/RUN-ERR";
  const prev = existsSync(goldenPath(id)) ? readFileSync(goldenPath(id), "utf8") : null;
  if (checkOnly) {
    if (prev !== norm) {
      drift++;
      console.log(`  ${id.padEnd(30)} ${status.padEnd(12)} 漂移或缺 golden`);
    }
    continue;
  }
  writeFileSync(goldenPath(id), norm, "utf8");
  console.log(`  ${id.padEnd(30)} ${status.padEnd(12)} ${prev === null ? "新建" : prev !== norm ? "已更新" : "无变化"}`);
}
if (checkOnly && drift > 0) process.exit(1);
