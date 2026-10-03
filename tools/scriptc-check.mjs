#!/usr/bin/env node
// scriptc 出货门：把语料的产物喂给 scriptc 编成原生 exe，再逐字节对拍 Godot 的 golden。
// 单文件用例走「产物 + 换宿主 import → scriptc build」这条短路，项目树用例走真命令 `export --pack scriptc`。
//
//   pnpm test:scriptc              默认的代表集（一族一格，秒级到分钟级）
//   pnpm test:scriptc 064          只跑 id 含 064 的
//   pnpm test:scriptc --all        全量（单文件 + 项目树，142 个上下，一轮要几十分钟）
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, caseDir, caseIsProject, caseScript, godotOk, listCases, normalize, readGolden } from "./lib.mjs";

const args = process.argv.slice(2);
const all = args.includes("--all");
const keep = args.includes("--keep");
// `--project`：只跑项目树那几个用例，走真命令 `export --pack scriptc`；单跑一轮几十分钟。
const projectOnly = args.includes("--project");
const filter = args.find((a) => !a.startsWith("--")) || "";
const WORK = join(ROOT, "tmp", "sc-gate");

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
  "032-preload-load",
];

function genFile(id) {
  return join(caseDir(id), "main.gen.mts");
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
  // 与 `corpus/cases/<case>/` 同深（三级），runtime 的 import 原样保留，只把宿主那一行换成静态可用的 `src/host`
  const dir = join(WORK, id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const src = readFileSync(genFile(id), "utf8");
  const moved = src.split("../../../tools/harness/scene-tree").join("../../../src/host");
  const file = join(dir, "main.mts");
  writeFileSync(file, moved, "utf8");
  return { dir, file };
}

function scBuild(file) {
  const r = spawnSync("scriptc", ["build", file, "--strip"], { encoding: "utf8", cwd: ROOT, timeout: 600000 });
  return { code: r.status, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
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
function gateProject(id) {
  const dir = join(WORK, id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const exe = join(dir, "case.exe");
  const treeDir = join(caseDir(id), ".gds2js-export");
  const r = spawnSync(
    "npx",
    ["tsx", "src/cli.ts", "export", caseScript(id), "--pack", "scriptc", "-o", exe, "--keep-bundle"],
    { encoding: "utf8", shell: true, cwd: ROOT, timeout: 1_500_000 },
  );
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const built = existsSync(exe);
  if (!keep && built) rmSync(treeDir, { recursive: true, force: true });
  return { built, exe, out, code: r.status };
}

const rows = [];
const cases = pickCases();
console.log(
  `scriptc 出货门：${cases.length} 个用例${all ? "（全量）" : projectOnly ? "（项目树）" : filter !== "" ? "（筛选）" : "（代表集）"}\n`,
);
for (const id of cases) {
  const row = { id, built: false, ran: false, exact: false, note: "" };
  let exe = null;
  if (caseIsProject(id)) {
    const g = gateProject(id);
    row.built = g.built;
    exe = g.exe;
    if (!g.built) row.note = scNote(g.out, `export 退出 ${g.code}`);
  } else {
    const { dir, file } = prepare(id);
    const build = scBuild(file);
    exe = exePath(dir);
    row.built = build.code === 0 && exe !== null;
    if (!row.built) row.note = scNote(build.out, `build 退出 ${build.code}`);
  }
  if (row.built) {
    const run = spawnSync(exe, [], { encoding: "utf8", timeout: 30000 });
    const raw = `${run.stdout ?? ""}`;
    row.ran = run.status === 0;
    if (!row.ran) row.note = `exe 退出 ${run.status}：${((run.stderr ?? "") || "").trim().split("\n")[0]?.slice(0, 140) ?? ""}`;
    else {
      const got = normalize(raw, caseScript(id));
      row.exact = got === readGolden(id);
      if (!row.exact) {
        const g = readGolden(id).split("\n");
        const j = got.split("\n");
        const i = g.findIndex((line, idx) => line !== j[idx]);
        row.note = `第 ${(i < 0 ? Math.min(g.length, j.length) : i) + 1} 行 godot=${JSON.stringify(g[i] ?? "<无>")} js=${JSON.stringify(j[i] ?? "<无>")}`;
      }
    }
  }
  rows.push(row);
  const mark = row.exact ? "✓ 出货一致" : row.built ? (row.ran ? "✗ 输出不符" : "✗ 跑挂") : "✗ 编不过";
  console.log(`  ${id.padEnd(34)} ${mark}${row.note ? `  ${row.note}` : ""}`);
}

const built = rows.filter((r) => r.built).length;
const ran = rows.filter((r) => r.ran).length;
const exact = rows.filter((r) => r.exact).length;
console.log(`\n出货 ${built}/${rows.length} 编过、${ran}/${rows.length} 跑通、逐字节一致 ${exact}/${rows.length}`);
if (!keep) rmSync(WORK, { recursive: true, force: true });
process.exit(exact === rows.length ? 0 : 1);
