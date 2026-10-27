#!/usr/bin/env node
import {
  caseDir,
  caseIsProject,
  caseScript,
  godotOk,
  hangBudget,
  listCases,
  normalize,
  readGolden,
  requireGodotPin,
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
requireGodotPin();
console.log(`用例数量: ${cases.length}${checkOnly ? "  (check 模式，不写盘)" : ""}\n`);

let ok = 0;
let parseErr = 0;
let timeout = 0;
let drift = 0;

for (const id of cases) {
  const gd = caseScript(id);
  const projectPath = caseIsProject(id) ? caseDir(id) : null;
  const prev = readGolden(id);
  const { text, timedOut } = runGodot(gd, { projectPath, timeoutMs: hangBudget(prev) });
  const norm = normalize(text, gd);
  const status = timedOut ? "TIMEOUT" : godotOk(norm) ? "OK" : "PARSE/RUN-ERR";
  if (timedOut) timeout++;
  else if (status === "OK") ok++;
  else parseErr++;

  if (checkOnly) {
    if (prev === null) {
      console.log(`  ${id.padEnd(34)} ${status.padEnd(12)} 缺 golden`);
      drift++;
    } else if (prev !== norm) {
      console.log(`  ${id.padEnd(34)} ${status.padEnd(12)} 漂移`);
      drift++;
    }
    continue;
  }

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
