#!/usr/bin/env node
/**
 * 不带 node 的 gds2js.exe 与 node 侧 CLI 出货一致。
 *
 * 用法：
 *   pnpm test:cli-native            # 全门（含两次 scriptc 出货，几分钟）
 *   pnpm test:cli-native --quick    # 跳过 scriptc 出货那两格（只比 build/run/拒绝语）
 *   pnpm test:cli-native --rebuild  # 先重编原生 exe（默认沿用 tmp/cli-native/gds2js.exe）
 *
 * 前置：`pnpm build`（原生 exe 把 dist 与 runtime 源码嵌进自己）、libtree-sitter（`TS_SRC`）、zig、scriptc。
 */
import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXE = join(ROOT, "tmp", "cli-native", "gds2js.exe");
const WD = join(ROOT, "tmp", "cli-native-check");
const quick = process.argv.includes("--quick");
const SINGLE = ["001-int-division", "021-class-basic", "062-string-escapes", "060-string-utf32"];
const PROJECT_CASE = "032-preload-load";

let okCount = 0;
const bad = [];
function ok(msg) {
  okCount++;
  console.log(`  ✓ ${msg}`);
}
function fail(msg) {
  bad.push(msg);
  console.log(`  ✗ ${msg}`);
}

/** node 那支 CLI：走仓库里的 tsx（与 test:diff 同一口径）。 */
function cliNode(args, cwd) {
  return run("npx", ["tsx", "packages/gds2js/src/cli.ts", ...args], cwd);
}
function cliExe(args, cwd) {
  return run(EXE, args, cwd);
}
function run(bin, args, cwd) {
  const r = spawnSync(bin, args, { encoding: "utf8", cwd: ROOT, timeout: 2_400_000, windowsHide: true });
  if (r.error) throw new Error(`${bin} 起不来：${r.error.message}（args=${JSON.stringify(args)}）`);
  return { status: r.status, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}
function read(p) {
  return readFileSync(p, "utf8");
}

/** 轮询到条件成立为止（`--watch` 那格用它等子进程的输出）。 */
async function until(pred, ms) {
  const stopAt = Date.now() + ms;
  while (Date.now() < stopAt) {
    if (pred()) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return pred();
}
function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  for (const e of readdirSync(from, { withFileTypes: true })) {
    const a = join(from, e.name);
    const b = join(to, e.name);
    if (e.isDirectory()) copyTree(a, b);
    else copyFileSync(a, b);
  }
}
/** 一棵树里的全部文件（相对路径，斜杠统一）。 */
function listFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.push(relative(dir, p).split("\\").join("/"));
    }
  };
  walk(dir);
  return out;
}
/** 两棵树逐文件比字节。返回第一处不一致（或 null）。 */
function diffTrees(a, b) {
  const all = [...new Set([...listFiles(a), ...listFiles(b)])].sort();
  for (const rel of all) {
    const pa = join(a, rel);
    const pb = join(b, rel);
    if (!existsSync(pa) || !existsSync(pb)) return `${rel} 只在一边有`;
    if (read(pa) !== read(pb)) return `${rel} 内容不同`;
  }
  return null;
}

/* 0) 原生 exe 在不在（出货形态：`--dynamic`，岛只跑那几格不能静态翻译的代码） */
if (!existsSync(EXE) || process.argv.includes("--rebuild")) {
  console.log("先编原生 CLI（tools/cli-native.mjs，出货形态默认带 --dynamic；含 zig 编 C + scriptc 出货，慢）…");
  const r = spawnSync("node", [join(ROOT, "tools", "cli-native.mjs"), "--keep"], { encoding: "utf8", cwd: ROOT, timeout: 3_000_000 });
  if (r.status !== 0) {
    console.log(`${r.stdout ?? ""}${r.stderr ?? ""}`);
    console.error("原生 CLI 没编出来 —— 这一门没有意义。");
    process.exit(1);
  }
}

rmSync(WD, { recursive: true, force: true });
mkdirSync(WD, { recursive: true });

/* 1) 单文件 build：逐字节（把运行时的说明符钉成同一个，比的是**编译器**而不是默认路径） */
console.log("① 原生 exe 的 build 产物 vs node 侧，逐字节");
for (const id of SINGLE) {
  const dir = join(WD, id);
  mkdirSync(dir, { recursive: true });
  copyFileSync(join(ROOT, "corpus", "cases", id, "main.gd"), join(dir, "main.gd"));
  const spec = ["--runtime", "gds2js/runtime", "--host", "gds2js/host"];
  const n = cliNode(["build", join(dir, "main.gd"), "-o", join(dir, "node.mts"), ...spec], ROOT);
  const e = cliExe(["build", join(dir, "main.gd"), "-o", join(dir, "exe.mts"), ...spec], ROOT);
  if (n.status !== 0 || e.status !== 0) {
    fail(`${id}: 退出码 node=${n.status} exe=${e.status}：${(n.out + e.out).slice(0, 200)}`);
    continue;
  }
  if (read(join(dir, "node.mts")) === read(join(dir, "exe.mts"))) ok(`${id}（${String(read(join(dir, "exe.mts")).split("\n").length)} 行）`);
  else fail(`${id}: build 产物不是逐字节`);
}

/* 2) run：输出逐字（原生那支是起外部 node 子进程跑的） */
console.log("② 原生 exe 的 run 输出 vs node 侧，逐字");
for (const id of SINGLE) {
  const dir = join(WD, id);
  const n = cliNode(["run", join(dir, "main.gd")], ROOT);
  const e = cliExe(["run", join(dir, "main.gd")], ROOT);
  if (n.status !== 0 || e.status !== 0) fail(`${id}: run 退出码 node=${n.status} exe=${e.status}：${(n.out + e.out).slice(0, 200)}`);
  else if (n.out === e.out && /\S/.test(n.out)) ok(`${id}: ${JSON.stringify(n.out.trim().split("\n").join(" | "))}`);
  else fail(`${id}: run 输出不同 node=${JSON.stringify(n.out.slice(0, 80))} exe=${JSON.stringify(e.out.slice(0, 80))}`);
}

/* 3) 自带家目录：默认说明符要指进 exe 里那份打平运行时（不能是没人能解析的裸名） */
console.log("③ 原生 exe 的默认运行时说明符 = 家目录里的 file URL");
{
  const dir = join(WD, "home-spec");
  mkdirSync(dir, { recursive: true });
  copyFileSync(join(ROOT, "corpus", "cases", "001-int-division", "main.gd"), join(dir, "main.gd"));
  const e = cliExe(["build", join(dir, "main.gd"), "-o", join(dir, "exe.mts")], ROOT);
  const first = e.status === 0 ? read(join(dir, "exe.mts")).split("\n").find((l) => l.includes("from")) ?? "" : "";
  if (e.status !== 0) fail(`build 退出码 ${e.status}：${e.out.slice(0, 200)}`);
  else if (!first.includes("file:///") || !first.includes("gds2js-home-native")) fail(`默认说明符没指进家目录：${first}`);
  else if (cliNode(["run", join(dir, "main.gd")], ROOT).out !== cliExe(["run", join(dir, "main.gd")], ROOT).out) fail("默认家目录运行时跑出来的输出与 node 侧不同");
  else ok(`import 自家目录那一份（${/from "([^"]+)"/.exec(first)?.[1].split("/").slice(-2).join("/")}）`);
}

/* 3b) `--runtime-mode local`：产物旁边那份旁挂包来自 exe 内嵌的 dist/standalone.cjs（第三种运行时模式） */
console.log("③′ local 模式：旁挂内嵌的 standalone，产物在仓库外也能跑");
{
  const dir = join(WD, "local-mode");
  mkdirSync(dir, { recursive: true });
  copyFileSync(join(ROOT, "corpus", "cases", "001-int-division", "main.gd"), join(dir, "main.gd"));
  const n = cliNode(["build", join(dir, "main.gd"), "-o", join(dir, "node.mts"), "--runtime-mode", "local"], ROOT);
  const e = cliExe(["build", join(dir, "main.gd"), "-o", join(dir, "exe.mts"), "--runtime-mode", "local"], ROOT);
  const sideFile = "gds2js-standalone.cjs";
  if (n.status !== 0 || e.status !== 0) fail(`local 模式退出码 node=${n.status} exe=${e.status}：${(n.out + e.out).slice(0, 200)}`);
  else if (!existsSync(join(dir, sideFile))) fail(`旁挂的 ${sideFile} 没落到产物旁边`);
  else if (read(join(dir, "node.mts")) !== read(join(dir, "exe.mts"))) fail("local 模式的产物不是逐字节（两句 requirePath 应当一样）");
  else {
    const played = run("node", [join(dir, "exe.mts")], ROOT);
    const ref = cliExe(["run", join(dir, "main.gd")], ROOT).out;
    if (played.status !== 0) fail(`旁挂产物跑不起来：${played.out.slice(0, 160)}`);
    else if (played.out !== ref) fail(`旁挂产物的输出与 run 不同：exe侧=${JSON.stringify(played.out.slice(0, 80))} 参照=${JSON.stringify(ref.slice(0, 80))}`);
    else ok(`产物 + 旁挂包跑通，输出与 run 逐字一致（${sideFile} ${(statSync(join(dir, sideFile)).size / 1024).toFixed(0)} KB）`);
  }
}

/* 4) 工程出货：原生 exe 自己编一个 scriptc exe，产物树与 node 侧逐字节、跑起来输出逐字 */
if (!quick) {
  console.log(`④ 工程 export --pack scriptc：${PROJECT_CASE}`);
  const src = join(ROOT, "corpus", "cases", PROJECT_CASE);
  const side = { node: join(WD, "proj-node"), exe: join(WD, "proj-exe") };
  const results = {};
  for (const [who, dir] of Object.entries(side)) {
    copyTree(src, dir);
    const args = ["export", join(dir, "main.gd"), "--pack", "scriptc", "-o", join(dir, "game.exe"), "--keep-bundle"];
    const r = who === "node" ? cliNode(args, ROOT) : cliExe(args, ROOT);
    results[who] = r;
  }
  const [rn, re] = [results.node, results.exe];
  if (rn.status !== 0 || re.status !== 0) fail(`export 退出码 node=${rn.status} exe=${re.status}：${(rn.out + re.out).slice(-400)}`);
  else {
    const d = diffTrees(join(side.node, ".gds2js-export"), join(side.exe, ".gds2js-export"));
    if (d === null) ok("两边铺出的模块树逐字节一致（含 runtime 源码图）");
    else fail(`模块树不一致：${d}`);
    // 参照：node 侧 CLI 跑同一个工程（run-project 只支持 import 模式）
    const nodeRun = cliNode(["run-project", join(side.node, "main.gd"), "--res-root", side.node], ROOT);
    // exe 的 run-project 走 exec seam（起外部 node）+ 家目录默认说明符，工程模式另算一格
    const exeRun = cliExe(["run-project", join(side.exe, "main.gd"), "--res-root", side.exe], ROOT);
    if (exeRun.status !== 0) fail(`exe 的 run-project 退出码 ${exeRun.status}：${exeRun.out.slice(0, 200)}`);
    else if (exeRun.out !== nodeRun.out) fail(`exe 的 run-project 输出与 node 侧不同：\n    exe=${JSON.stringify(exeRun.out.slice(0, 160))}\n    node=${JSON.stringify(nodeRun.out.slice(0, 160))}`);
    else ok(`exe 的 run-project 输出逐字一致：${JSON.stringify(exeRun.out.trim().split("\n").join(" | ").slice(0, 60))}`);
    const p = join(side.exe, "game.exe");
    if (!existsSync(p)) fail("原生 exe 没能编出 scriptc 产物");
    else {
      const runOut = run(p, [], ROOT).out;
      const nodeOut = nodeRun.out;
      if (runOut.trim() === nodeOut.trim()) ok(`scriptc 产物跑通：${JSON.stringify(runOut.trim().split("\n").join(" | ").slice(0, 90))}`);
      else fail(`scriptc 产物输出不同：\n    exe=${JSON.stringify(runOut.slice(0, 200))}\n    参照=${JSON.stringify(nodeOut.slice(0, 200))}`);
    }
  }
}

/* 5) 原生构建做不了的事：响亮拒，不许静默或者崩 */
console.log("⑤ 能力边界要响亮拒");
{
  const dir = join(WD, "refuse");
  mkdirSync(dir, { recursive: true });
  copyFileSync(join(ROOT, "corpus", "cases", "001-int-division", "main.gd"), join(dir, "main.gd"));
  const single = cliExe(["build-project", join(dir, "main.gd"), "--runtime-mode", "single"], ROOT);
  if (single.status === 0 || !single.out.includes("打包器")) fail(`single 没拒到位：退出码 ${single.status} ${single.out.slice(0, 160)}`);
  else ok(`single → 「没带打包器」那一句（退出码 ${single.status}）`);
  const missing = cliExe(["check", join(dir, "nope.gd")], ROOT);
  if (!/读不到文件/.test(missing.out)) fail(`缺文件没走到「读不到文件」那一句：${missing.out.slice(0, 160)}`);
  else ok("缺文件给的是错误行，不是 Uncaught");
}

/* 6) `--pack node`：exe 里没有 node，这一支要么找到外部 node（≥25.7）出货，要么把版本门槛说清楚 —— 都不许崩 */
if (!quick) {
  console.log("⑥ --pack node 走外部 node：出货就跑一遍，没够新的 node 就报版本门槛");
  const dir = join(WD, "sea");
  mkdirSync(dir, { recursive: true });
  copyFileSync(join(ROOT, "corpus", "cases", "021-class-basic", "main.gd"), join(dir, "main.gd"));
  const out = join(dir, "sea.exe");
  const r = cliExe(["export", join(dir, "main.gd"), "--pack", "node", "-o", out], ROOT);
  if (/Uncaught/.test(r.out)) fail(`--pack node 崩了：${r.out.slice(0, 200)}`);
  else if (r.status === 0 && existsSync(out)) {
    const played = run(out, [], ROOT);
    if (played.status === 0 && /base-10/.test(played.out)) ok(`SEA 产物跑通（${(statSync(out).size / 1048576).toFixed(1)} MB）`);
    else fail(`SEA 产物跑不出东西：退出码 ${played.status} ${played.out.slice(0, 160)}`);
  } else if (/Node >=/.test(r.out)) ok("外部 node 不够新 → 报的是版本门槛那三行，不是崩溃");
  else fail(`--pack node 既没出货也没报门槛：${r.out.slice(0, 200)}`);
}

/* 7) `check-project`：跨文件静态检查，exe 与 node 侧逐字 */
console.log("⑦ check-project：跨文件静态检查，exe 与 node 侧逐字");
{
  const dir = join(WD, "checkproj");
  copyTree(join(ROOT, "corpus", "cases", "032-preload-load"), dir);
  const args = ["check-project", join(dir, "main.gd"), "--res-root", dir];
  const n = cliNode(args, ROOT);
  const e = cliExe(args, ROOT);
  if (n.status !== 0 || e.status !== 0) fail(`check-project 退出码 node=${n.status} exe=${e.status}：${(n.out + e.out).slice(0, 200)}`);
  else if (n.out !== e.out) fail(`check-project 输出不同：node=${JSON.stringify(n.out.slice(0, 100))} exe=${JSON.stringify(e.out.slice(0, 100))}`);
  else ok(`与 node 侧逐字一致：${JSON.stringify(n.out.trim().split("\n").join(" | ").slice(0, 70))}`);
}

/* 8) `--sourcemap`：同一份输入、两个目录里的同名输出 → 产物与 map 都应当逐字节相同 */
console.log("⑧ --sourcemap：map 落盘、指回 .gd，两侧 map 逐字节");
{
  const src = join(WD, "smap");
  mkdirSync(src, { recursive: true });
  const gd = join(src, "main.gd");
  copyFileSync(join(ROOT, "corpus", "cases", "001-int-division", "main.gd"), gd);
  const dirN = join(src, "node");
  const dirE = join(src, "exe");
  // 钉住运行时说明符：exe 的默认值指内嵌家目录（那是 ③ 那一格管的事），这里比的是 sourcemap 那条路
  const spec = ["--runtime", "gds2js/runtime", "--host", "gds2js/host"];
  const n = cliNode(["build", gd, "-o", join(dirN, "out.mts"), "--sourcemap", ...spec], ROOT);
  const e = cliExe(["build", gd, "-o", join(dirE, "out.mts"), "--sourcemap", ...spec], ROOT);
  const mapN = join(dirN, "out.mts.map");
  const mapE = join(dirE, "out.mts.map");
  if (n.status !== 0 || e.status !== 0) fail(`--sourcemap 退出码 node=${n.status} exe=${e.status}：${(n.out + e.out).slice(0, 200)}`);
  else if (!existsSync(mapN) || !existsSync(mapE)) fail("map 没落盘（node 侧或 exe 侧）");
  else if (read(join(dirN, "out.mts")) !== read(join(dirE, "out.mts"))) fail("带 map 的产物不是逐字节");
  else if (read(mapN) !== read(mapE)) fail("两侧 map 不是逐字节（同一输入、同名输出应当全等）");
  else {
    const m = JSON.parse(read(mapE));
    const code = read(join(dirE, "out.mts"));
    const tail = code.trimEnd().split("\n").pop() ?? "";
    if (m.sources.length !== 1 || m.sources[0] !== gd) fail(`map 的 sources 没指回 .gd：${JSON.stringify(m.sources)}`);
    else if (typeof m.mappings !== "string" || m.mappings.length === 0) fail("map 的 mappings 是空的");
    else if (!tail.includes("sourceMappingURL=out.mts.map")) fail(`产物尾巴没有 sourceMappingURL 那句：${JSON.stringify(tail)}`);
    else ok(`map 与产物都逐字节（mappings ${String(m.mappings.split(";").length)} 行）`);
  }
}

/* 9) `--watch`：验的是 exe 里那份轮询摘要实现（`fs.watch` 的 recursive 与 listener 形状都没有 lowering） */
console.log("⑨ --watch：改 .gd 要真的重跑");
{
  const dir = join(WD, "watch");
  mkdirSync(dir, { recursive: true });
  const gd = join(dir, "main.gd");
  copyFileSync(join(ROOT, "corpus", "cases", "001-int-division", "main.gd"), gd);
  const child = spawn(EXE, ["check", gd, "--watch"], { cwd: ROOT, windowsHide: true });
  let buf = "";
  child.stdout.on("data", (c) => { buf += String(c); });
  child.stderr.on("data", (c) => { buf += String(c); });
  const sawStart = await until(() => buf.includes("监听"), 15000);
  appendFileSync(gd, "\n# 改一次\n", "utf8");
  const sawRerun = sawStart && (await until(() => buf.includes("重新运行"), 15000));
  child.kill();
  await until(() => child.exitCode !== null, 5000);
  if (!sawStart) fail(`没打出「监听 …」那一句（15 秒内）：${buf.slice(0, 200)}`);
  else if (!sawRerun) fail(`改了 .gd 没触发重跑（15 秒内）：${buf.slice(-200)}`);
  else ok("监听起来了，改 .gd 触发了一次重新运行");
}

console.log("");
console.log(`原生 CLI 等价性门：通过 ${String(okCount)} 项，失败 ${String(bad.length)} 项`);
for (const b of bad) console.log(`  红：${b}`);
if (bad.length > 0) process.exit(1);
