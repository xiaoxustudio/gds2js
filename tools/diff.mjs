#!/usr/bin/env node
/**
 * 分层对比：Godot（裁判） vs gds2js 编译产物（被测）。
 *
 *   node tools/diff.mjs            # 全量
 *   node tools/diff.mjs 01         # 只跑名字含 01 的
 *   node tools/diff.mjs --show     # 打印不一致用例的首个差异行
 *
 * 度量必须分层 —— 一个笼统的通过率会把「未实现」和「跑错了」混成一件事，
 * 而这两件事的优先级完全不同：前者是排期问题，后者是 bug。
 */
import { caseScript, godotOk, listCases, normalize, readGolden, runGodot } from "./lib.mjs";

const argv = process.argv.slice(2);
const show = argv.includes("--show");
// 默认信任 golden，跑一次全量对比要几分钟；漂移检测交给 tools/golden.mjs --check。
const refresh = argv.includes("--refresh");
const filter = argv.find((a) => !a.startsWith("--")) || "";

// JS 侧运行器是可选的：编译器还没落地时它就是不存在，这时不该报错，
// 而应该诚实地把每个 case 记成「未实现」。
let jsRunner = null;
try {
  jsRunner = (await import("./js-runner.mjs")).default;
} catch {
  jsRunner = null;
}

const cases = listCases(filter);
if (cases.length === 0) {
  console.error(`没有匹配的 case（filter="${filter}"）`);
  process.exit(1);
}

const rows = [];
for (const id of cases) {
  const gd = caseScript(id);
  const golden = readGolden(id);
  let godotNow = golden;
  let stale = golden === null;
  if (refresh && golden !== null) {
    const { text } = runGodot(gd);
    godotNow = normalize(text, gd);
    stale = godotNow !== golden;
  }

  const row = { id, godotOk: godotOk(godotNow), stale, js: null, jsErr: null };
  if (row.godotOk) {
    try {
      // 注意：不能直接 String(await jsRunner(id)) —— String(null) 是 "null"，
      // 会把「未实现」算成「跑出结果」，把度量整个带偏。
      const raw = jsRunner ? await jsRunner(id) : null;
      row.js = raw === null || raw === undefined ? null : normalize(String(raw), gd);
    } catch (e) {
      row.jsErr = e.message || String(e);
    }
  }
  rows.push(row);
}

const godotRunnable = rows.filter((r) => r.godotOk).length;
const jsRan = rows.filter((r) => r.js !== null).length;
const match = rows.filter((r) => r.js !== null && r.js === readGolden(r.id)).length;
const silent = rows.filter((r) => r.js !== null && r.js !== readGolden(r.id));
const todo = rows.filter((r) => r.godotOk && r.js === null);
const expectedErr = rows.filter((r) => !r.godotOk).length;
const stale = rows.filter((r) => r.stale).length;

console.log(`用例 ${rows.length}\n`);
console.log("状态层");
console.log(`  Godot 侧可编译+运行      ${godotRunnable}/${rows.length}`);
console.log(`  Godot 侧预期报错用例      ${expectedErr}/${rows.length}`);
console.log(`  golden 未漂移            ${rows.length - stale}/${rows.length}`);
console.log(`  JS 侧已实现并跑出结果     ${jsRan}/${godotRunnable}`);
console.log("\n内容层");
console.log(`  逐字节一致               ${match}/${godotRunnable}`);
console.log("\n缺口（按处理优先级）");
console.log(`  静默错误（能跑但输出错）  ${silent.length}   <- 最优先`);
console.log(`  未实现                   ${todo.length}   <- 排期`);

if (show && (silent.length > 0 || stale > 0)) {
  console.log("\n--- 细节 ---");
  for (const r of rows) {
    if (r.stale) console.log(`\n[漂移] ${r.id}  golden 与当前 Godot 输出不一致，先跑 tools/golden.mjs`);
    if (!r.js || r.js === readGolden(r.id)) continue;
    const g = readGolden(r.id).split("\n");
    const j = r.js.split("\n");
    const i = g.findIndex((line, idx) => line !== j[idx]);
    console.log(`\n[不一致] ${r.id}  第 ${i + 1} 行`);
    console.log(`  godot: ${g[i] ?? "<无>"}`);
    console.log(`  js   : ${j[i] ?? "<无>"}`);
  }
}

if (silent.length > 0) process.exit(1);
