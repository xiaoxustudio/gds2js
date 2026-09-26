#!/usr/bin/env node
/**
 * `gds2js run` 的端到端验收：把语料**逐例交给 CLI 真跑一遍**，与 Godot 的 golden 逐字节比。
 *
 *   node tools/run-check.mjs            # 全量
 *   node tools/run-check.mjs 07         # 只跑名字含 07 的
 *   node tools/run-check.mjs --show     # 失败时打印首处差异
 *
 * 为什么要单独一个门：tools/diff.mjs 走的是 tools/js-runner.mjs 的**进程内 import**，
 * 那条路绕过了 CLI 的编译入口（说明符、临时产物、生命周期驱动、退出码）。
 * 这一条走的是用户真正敲的那行命令，所以它证明的是"装好之后能跑"，不只是"运行时算子对"。
 *
 * 预期报错的用例（Godot 侧本身就报错）反过来要求 CLI **非零退出** —— 它们量的正是
 * "编不过/跑不起来时必须响"这条纪律在 CLI 上成立。
 */
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

/** CLI 是 TS 源码，交给 tsx 跑（本机 spawn node 子进程会 EBUSY，npx 这条实测可用）。 */
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
    // Godot 侧就报错的用例：CLI 必须非零退出，且不许把"没实现"混成 0
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
  // 与 diff.mjs 同一条对比契约：golden 是 normalize 过的，产物也走同一个 normalize
  // （空行、Godot 的 banner 与 core/variant 引擎帧诊断都按既有规则塌缩），
  // 拿裸 stdout 去比会把 `print("")` 这种合法空行算成不一致。
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
