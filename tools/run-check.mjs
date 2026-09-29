#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { caseIsProject, caseScript, godotOk, listCases, normalize, readGolden } from "./lib.mjs";

const argv = process.argv.slice(2);
const show = argv.includes("--show");
const filter = argv.find((a) => !a.startsWith("--")) || "";
const cases = listCases(filter);
if (cases.length === 0) {
  console.error(`没有匹配的 case（filter="${filter}"）。corpus/cases 是空的吗？`);
  process.exit(1);
}

function cliRun(cmd, file) {
  const r = spawnSync("npx", ["tsx", "src/cli.ts", cmd, file], { encoding: "utf8", shell: true, timeout: 120_000 });
  if (r.error) throw r.error;
  return { code: r.status, out: r.stdout ?? "", err: r.stderr ?? "" };
}

let pass = 0;
let fail = 0;
const failures = [];

for (const id of cases) {
  const golden = readGolden(id);
  const project = caseIsProject(id);
  const entry = caseScript(id);
  if (golden === null) {
    failures.push(`${id}: 没有 golden，跑不了对比`);
    fail++;
    continue;
  }
  let r;
  try {
    r = cliRun(project ? "run-project" : "run", entry);
  } catch (e) {
    failures.push(`${id}: CLI 调用本身炸了 —— ${e.message}`);
    fail++;
    continue;
  }
  const wantedOk = godotOk(golden);
  if (!wantedOk) {
    if (r.code === 0) {
      failures.push(`${id}: 预期报错用例却被 CLI 跑成功了（退出 0）`);
      fail++;
      continue;
    }
    pass++;
    continue;
  }
  if (r.code !== 0) {
    failures.push(`${id}: 退出码 ${r.code} —— ${(r.err || "").trim().split("\n").slice(-1)[0]}`);
    fail++;
    continue;
  }
  const got = normalize(r.out, entry);
  if (got === golden) {
    pass++;
    continue;
  }
  fail++;
  const a = golden.split("\n");
  const b = got.split("\n");
  let line = -1;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) {
      line = i;
      break;
    }
  }
  failures.push(`${id}: 第 ${line + 1} 行不一致 godot=${JSON.stringify(a[line])} run=${JSON.stringify(b[line])}`);
  if (show) console.log(`--- ${id} ---\n${b.slice(Math.max(0, line - 1), line + 3).join("\n")}`);
}

console.log(`\nCLI run 端到端：通过 ${pass}，失败 ${fail}（共 ${cases.length} 例）`);
for (const f of failures) console.log(`  FAIL  ${f}`);
process.exit(fail === 0 ? 0 : 1);
