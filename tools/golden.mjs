#!/usr/bin/env node
/**
 * 生成 / 刷新 golden：用裁判引擎跑每个 case，把归一化后的输出写进 godot.txt。
 *
 *   node tools/golden.mjs                # 全量
 *   node tools/golden.mjs 01             # 只跑名字含 01 的
 *   node tools/golden.mjs --check        # 不写盘，只报漂移
 */
import {
  caseScript,
  godotOk,
  listCases,
  normalize,
  readGolden,
  runGodot,
  writeGolden,
  GODOT_BIN,
} from "./lib.mjs";

const argv = process.argv.slice(2);
const checkOnly = argv.includes("--check");
const filter = argv.find((a) => !a.startsWith("--")) || "";

const cases = listCases(filter);
if (cases.length === 0) {
  console.error(`没有匹配的 case（filter="${filter}"）。corpus/cases 是空的吗？`);
  process.exit(1);
}

console.log(`裁判引擎: ${GODOT_BIN}`);
console.log(`用例数量: ${cases.length}${checkOnly ? "  (check 模式，不写盘)" : ""}\n`);

let ok = 0;
let parseErr = 0;
let timeout = 0;
let drift = 0;

for (const id of cases) {
  const gd = caseScript(id);
  const { text, timedOut } = runGodot(gd);
  const norm = normalize(text, gd);
  const status = timedOut ? "TIMEOUT" : godotOk(norm) ? "OK" : "PARSE/RUN-ERR";
  if (timedOut) timeout++;
  else if (status === "OK") ok++;
  else parseErr++;

  if (checkOnly) {
    const prev = readGolden(id);
    if (prev === null) {
      console.log(`  ${id.padEnd(34)} ${status.padEnd(12)} 缺 golden`);
      drift++;
    } else if (prev !== norm) {
      console.log(`  ${id.padEnd(34)} ${status.padEnd(12)} 漂移`);
      drift++;
    }
    continue;
  }

  const prev = readGolden(id);
  const changed = prev !== null && prev !== norm;
  if (changed) drift++;
  writeGolden(id, norm);
  console.log(`  ${id.padEnd(34)} ${status.padEnd(12)} ${changed ? "已更新" : prev === null ? "新建" : "无变化"}`);
}

console.log(
  `\n合计: OK ${ok} / 编译或运行报错 ${parseErr} / 超时 ${timeout}` +
    (checkOnly ? ` / 漂移或缺 golden ${drift}` : ` / 内容变更 ${drift}`),
);
if (drift > 0 && checkOnly) process.exit(1);
