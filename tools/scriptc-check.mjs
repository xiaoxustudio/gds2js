#!/usr/bin/env node
// scriptc 出货门：把语料的产物喂给 scriptc 编成原生 exe，再逐字节对拍 Godot 的 golden。
// 单文件用例走「产物 + 换宿主 import → scriptc build」这条短路，项目树用例走真命令 `export --pack scriptc`。
//
//   pnpm test:scriptc              默认的代表集（一族一格，秒级到分钟级）
//   pnpm test:scriptc 064          只跑 id 含 064 的
//   pnpm test:scriptc --all        全量（150 个：141 单文件 + 9 项目树；默认 4 路并发）
//   pnpm test:scriptc --jobs=1     改并发度（1 就是老的串行跑法；筛选/代表集默认 1，全量与 --project 默认 4）
//
// 每个用例一份替身树（`tmp/sc-gate/<id>/`），并发铺开互不干扰；收尾只删本进程建过的那几份。
// 剩一个口：两个进程**同时跑同一个 id** 还是会互删替身树（开工先清自己那个目录）。
import { spawn } from "node:child_process";
import { cpus } from "node:os";

/** 异步版 spawnSync：全量门要靠它把用例铺开跑。stdout 与 stderr 分开存，out 是合成后的原文。 */
function sp(cmd, cmdArgs, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, cmdArgs, { ...opts, shell: opts.shell === true });
    let stdout = "";
    let stderr = "";
    if (child.stdout !== null) child.stdout.setEncoding("utf8").on("data", (d) => (stdout += d));
    if (child.stderr !== null) child.stderr.setEncoding("utf8").on("data", (d) => (stderr += d));
    const done = (status) => resolve({ status, stdout, stderr, out: stdout + stderr });
    child.on("error", (e) => {
      stderr += String(e);
      done(-1);
    });
    child.on("close", done);
  });
}
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT, caseDir, caseIsProject, caseScript, godotOk, listCases, normalize, readGolden } from "./lib.mjs";
import { TREE_FACE } from "../packages/runtime/src/tree-face.ts";

const args = process.argv.slice(2);
const all = args.includes("--all");
const keep = args.includes("--keep");
// `--project`：只跑项目树那几个用例，走真命令 `export --pack scriptc`；单跑一轮几十分钟。
const projectOnly = args.includes("--project");
const filter = args.find((a) => !a.startsWith("--")) || "";
// `--jobs=N`：并行跑几个用例。全量/项目树默认铺到 4，筛选和代表集仍是 1。
const jobsArg = args.find((a) => a.startsWith("--jobs="));
const jobsParsed = jobsArg === undefined ? NaN : Number(jobsArg.split("=")[1]);
const JOBS =
  Number.isFinite(jobsParsed) && jobsParsed >= 1 ? Math.floor(jobsParsed) : all || projectOnly ? Math.min(4, cpus().length) : 1;
const WORK = join(ROOT, "tmp", "sc-gate");
/** 本进程建过的替身树；收尾只删这些，不连锅端 `tmp/sc-gate` —— 否则会把另一个门进程正在编的那份删掉。 */
const created = [];

// 代表集：一族一格各一个
const DEFAULT_SET = [
  "001-int-division",
  "064-float-render",
  "082-array-callable",
  "124-static-func",
  "128-static-var",
  "133-callable-signal-methods",
  "155-param-defaults",
  "200-module-const-shadows-global",
  "234-string-methods-batch",
  "032-preload-load",
];

function genFile(id) {
  return join(caseDir(id), "main.gen.mts");
}

/** 产物里有没有 PackedByteArray 的 compress()/decompress() 调用（发射器的形状是 `rt.method(x, "compress", …)`）——有就换带 zstd 的宿主、scriptc 加 --dynamic。口径与 cli.ts 的 IR 标志（usesPackCodec）经 test:compile 的交叉断言互锁。 */
const NEED_ZSTD = /,\s*"(?:compress|decompress)"\s*,/;

/** 替身树里的 zstd 宿主：直接读真实的 zstdHost 源码，按 tree-face 清单把它那些相对说明符改写成回指仓库源（深度按替身树位置算）—— 不再有同形副本。 */
function zstdHostSource(dir) {
  const rtSrc = join(ROOT, TREE_FACE.repo.runtimeSrcRoot);
  const src = readFileSync(join(rtSrc, TREE_FACE.repo.zstdHost), "utf8");
  return src.replace(/"\.\/[^"]+"/g, (spec) => {
    const target = join(rtSrc, spec.slice(3, -1));
    let rel = relative(dir, target).split("\\").join("/");
    if (!rel.startsWith(".")) rel = "./" + rel;
    return `"${rel}"`;
  });
}

function copyTreeAll(from, to) {
  if (!statSync(from).isDirectory()) {
    copyFileSync(from, to);
    return;
  }
  mkdirSync(to, { recursive: true });
  for (const e of readdirSync(from, { withFileTypes: true })) {
    const a = join(from, e.name);
    const b = join(to, e.name);
    if (e.isDirectory()) copyTreeAll(a, b);
    else copyFileSync(a, b);
  }
}

/** 把 vendor 里两个包铺到 `tmp/sc-gate/node_modules`（替身宿主从 tmp/sc-gate/<id>/ 往上正好找得到）。 */
function ensureZstdPackages() {
  const from = join(ROOT, TREE_FACE.repo.runtimeSrcRoot, TREE_FACE.repo.vendorDir);
  const to = join(WORK, "node_modules");
  for (const pkg of TREE_FACE.tree.zstdPackages) {
    if (!existsSync(join(from, pkg))) {
      console.log(`缺 ${TREE_FACE.repo.vendorDir}/${pkg}（${TREE_FACE.repo.runtimeSrcRoot} 下）—— zstd 用例没法铺驱动包`);
      process.exit(1);
    }
    copyTreeAll(join(from, pkg), join(to, pkg));
  }
}

function pickCases() {
  // 项目树用例走真 CLI 的 `export --pack scriptc`，不需要 `main.gen.mts`（那一支只发单文件产物）
  const allIds = listCases(filter)
    .filter((id) => (projectOnly ? caseIsProject(id) : true))
    .filter((id) => godotOk(readGolden(id)) && (caseIsProject(id) || existsSync(genFile(id))));
  if (all || projectOnly || filter !== "") return allIds;
  const missing = DEFAULT_SET.filter((id) => !allIds.includes(id));
  if (missing.length > 0) console.log(`(代表集里有 ${missing.length} 个用例这次没进：${missing.join(", ")})`);
  return DEFAULT_SET.filter((id) => allIds.includes(id));
}

function prepare(id) {
  // 与 `corpus/cases/<case>/` 同深（三级），runtime 的 import 原样保留，只把宿主那一行换成静态可用的宿主
  const dir = join(WORK, id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  created.push(dir);
  const src = readFileSync(genFile(id), "utf8");
  const zstd = NEED_ZSTD.test(src);
  // 产物树里的替身宿主（zstd）或仓库源码宿主（普通）——两个说明符都从 tree-face 清单算。
  const zstdSpec = "./" + TREE_FACE.tree.zstdHost.replace(/\.ts$/, "");
  const repoHostSpec = relative(dir, join(ROOT, TREE_FACE.repo.runtimeSrcRoot, TREE_FACE.repo.host)).split("\\").join("/").replace(/\.ts$/, "");
  const moved = src.split("../../../tools/harness/scene-tree").join(zstd ? zstdSpec : repoHostSpec);
  const file = join(dir, "main.mts");
  writeFileSync(file, moved, "utf8");
  if (zstd) {
    writeFileSync(join(dir, TREE_FACE.tree.zstdHost), zstdHostSource(dir), "utf8");
    ensureZstdPackages();
  }
  return { dir, file, zstd };
}

async function scBuild(file, dynamic) {
  const args = ["build", file, "--strip"];
  if (dynamic === true) args.push("--dynamic");
  const r = await sp("scriptc", args, { cwd: ROOT, timeout: 600000 });
  return { code: r.status, out: r.out };
}

function exePath(dir) {
  const p = join(dir, ".scriptc", process.platform === "win32" ? "main.exe" : "main");
  return existsSync(p) ? p : null;
}

/** 编不过时说人话：优先给 SC 码，其次给最后一行。 */
function scNote(out, fallback) {
  const m = out.match(/error SC\d+:[^\n]*/g) || [];
  if (m.length > 0) return `${m.length} 个 SC 错，首个：${m[0].slice(0, 120)}`;
  return `${fallback}：${out.trim().split("\n").pop()?.slice(0, 120) ?? ""}`;
}

/** 项目树用例：走用户那条命令 `export --pack scriptc`，门才同时量到「树里只有一份 runtime 源码」。 */
async function gateProject(id) {
  const dir = join(WORK, id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  created.push(dir);
  const exe = join(dir, "case.exe");
  const treeDir = join(caseDir(id), ".gds2js-export");
  const r = await sp(
    "npx",
    ["tsx", "packages/gds2js/src/cli.ts", "export", caseScript(id), "--pack", "scriptc", "-o", exe, "--keep-bundle"],
    { shell: true, cwd: ROOT, timeout: 1_500_000 },
  );
  const built = existsSync(exe);
  if (!keep && built) rmSync(treeDir, { recursive: true, force: true });
  return { built, exe, out: r.out, code: r.status };
}

const rows = [];
const cases = pickCases();
console.log(
  `scriptc 出货门：${cases.length} 个用例${all ? "（全量）" : projectOnly ? "（项目树）" : filter !== "" ? "（筛选）" : "（代表集）"}，并发 ${JOBS}\n`,
);

async function gateOne(id) {
  const row = { id, built: false, ran: false, exact: false, note: "" };
  let exe = null;
  if (caseIsProject(id)) {
    const g = await gateProject(id);
    row.built = g.built;
    exe = g.exe;
    if (!g.built) row.note = scNote(g.out, `export 退出 ${String(g.code)}`);
  } else {
    const { dir, file, zstd } = prepare(id);
    const build = await scBuild(file, zstd);
    exe = exePath(dir);
    row.built = build.code === 0 && exe !== null;
    if (!row.built) row.note = scNote(build.out, `build 退出 ${String(build.code)}`);
  }
  if (row.built) {
    const run = await sp(exe, [], { timeout: 30000 });
    row.ran = run.status === 0;
    if (!row.ran) row.note = `exe 退出 ${String(run.status)}：${run.stderr.trim().split("\n")[0]?.slice(0, 140) ?? ""}`;
    else {
      const got = normalize(run.stdout, caseScript(id));
      row.exact = got === readGolden(id);
      if (!row.exact) {
        const g = readGolden(id).split("\n");
        const j = got.split("\n");
        const i = g.findIndex((line, idx) => line !== j[idx]);
        row.note = `第 ${(i < 0 ? Math.min(g.length, j.length) : i) + 1} 行 godot=${JSON.stringify(g[i] ?? "<无>")} js=${JSON.stringify(j[i] ?? "<无>")}`;
      }
    }
  }
  return row;
}

const markOf = (row) => (row.exact ? "✓ 出货一致" : row.built ? (row.ran ? "✗ 输出不符" : "✗ 跑挂") : "✗ 编不过");

// 每个用例只碰自己的 tmp/sc-gate/<id>/，铺开跑互不干扰；输出按用例原序回显。
const results = new Array(cases.length);
let cursor = 0;
async function worker() {
  for (;;) {
    const i = cursor++;
    if (i >= cases.length) return;
    const row = await gateOne(cases[i]);
    results[i] = row;
    console.log(`  ${row.id.padEnd(34)} ${markOf(row)}${row.note ? `  ${row.note}` : ""}`);
  }
}
await Promise.all(Array.from({ length: Math.min(JOBS, cases.length) }, worker));
for (const row of results) rows.push(row);

const built = rows.filter((r) => r.built).length;
const ran = rows.filter((r) => r.ran).length;
const exact = rows.filter((r) => r.exact).length;
console.log(`\n出货 ${built}/${rows.length} 编过、${ran}/${rows.length} 跑通、逐字节一致 ${exact}/${rows.length}`);
if (!keep) for (const dir of created) rmSync(dir, { recursive: true, force: true });
process.exit(exact === cases.length ? 0 : 1);
