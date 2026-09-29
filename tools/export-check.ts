/**
 * export 回归自检（tools）—— `pnpm test:export`
 * 两支打包器各跑真流程，并把「当前卡在哪」如实分类；分类只认 CLI 自己吐的
 * `gds2js-export[<verdict>]` 标记，不 scrape 上游自由文本（上一轮被 scriptc 的
 * `@override` 措辞骗出过假红灯，教训记在 ROADMAP 5.8）。
 *
 *   ok        打出 exe 且跑起来 stdout 逐字节等于期望
 *   refused   版本/二进制门禁（含 --pack node 在旧 node 上该响的那一声）
 *   no-lib    perry 缺 perry_runtime.lib（npm 包没带，不是我们的问题）
 *   crash     perry 访问违例（RS4GC + Windows try/catch，上游 #7354）
 *   FAIL      以上都不是 —— 真回归，红灯
 *
 * 格子：
 *   A node/出货            需要 SEA-capable 的 node（GDS2JS_NODE_BIN 或当前 node ≥25.7）；
 *                          成了就再跑一遍「运行期抛错必须非 0」那套
 *   B node/版本门禁        当前 node < 25.7 时必须响亮拒绝并给出重跑命令
 *   C perry/默认           预期 crash 或 no-lib
 *   D perry/PERRY_RS4GC=0  预期 no-lib（实测 codegen 是能走完的）
 *   E --pack scriptc       必须被拒（这一支已按实测撤掉，别再悄悄回来）
 *
 * 除 FAIL 外一律记账不红灯。跑：node_modules/.bin/tsx tools/export-check.ts
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TMP = join(ROOT, "tmp", "export-check");
const CLI = join(ROOT, "dist", "cli.mjs");
const WORK = join(ROOT, "examples", "multi", ".gds2js-export");
const SEA_MIN_NODE = "25.7.0";
const MULTI = join(ROOT, "examples", "multi", "main.gd");
const MULTI_ROOT = join(ROOT, "examples", "multi");
const MULTI_WANT = "7\ntrue\nshape-7\nhi bob\ntrue\nhi zed\n";

type Verdict = "ok" | "refused" | "no-lib" | "crash" | "FAIL";
const results: Array<{ cell: string; v: Verdict; note: string }> = [];

function record(cell: string, v: Verdict, note: string): void {
  results.push({ cell, v, note });
  const tag = v === "FAIL" ? "✗ FAIL" : v === "ok" ? "✓ ok" : `- ${v.toUpperCase()}`;
  console.log(`  ${tag}  ${cell}${note ? `：${note}` : ""}`);
}

function nodeVer(bin: string): string | null {
  const r = spawnSync(bin, ["-p", "process.versions.node"], { encoding: "utf8", windowsHide: true, timeout: 60_000 });
  return r.error || r.status !== 0 ? null : (r.stdout || "").trim() || null;
}
function atLeast(v: string, min: string): boolean {
  const a = v.replace(/^v/, "").split(".").map(Number);
  const b = min.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) > (b[i] ?? 0)) return true;
    if ((a[i] ?? 0) < (b[i] ?? 0)) return false;
  }
  return true;
}

/** 从 stdout+stderr 里认我们自己的分类标记。 */
function verdictOf(out: string): { v: Verdict; note: string } | null {
  const m = /gds2js-export\[([\w-]+)\]\s*(.*)/.exec(out);
  if (!m) return null;
  const raw = m[1]!;
  const note = m[2] ?? "";
  if (raw === "failed") return { v: "FAIL", note };
  if (raw === "refused" || raw === "no-lib" || raw === "crash") return { v: raw, note };
  return { v: "FAIL", note: `认不出的分类 ${raw}` };
}

function runExport(args: string[], env: NodeJS.ProcessEnv): { code: number | null; out: string } {
  const r = spawnSync(process.execPath, [CLI, "export", ...args], {
    cwd: ROOT,
    encoding: "utf8",
    windowsHide: true,
    timeout: 1_500_000,
    env: { ...process.env, ...env },
  });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

/** 跑产物并对期望输出；抛错形状（want=null）则要求非 0 退出 + stderr 有内容。 */
function checkExe(cell: string, exe: string, want: string | null): void {
  if (!existsSync(exe)) return record(cell, "FAIL", `退出码 0 但没有 ${exe}`);
  const run = spawnSync(exe, [], { encoding: "utf8", windowsHide: true, timeout: 120_000 });
  if (want === null) {
    if (run.status === 0) return record(cell, "FAIL", "运行期抛错却退了 0（错误上报丢了）");
    if ((run.stderr || "").trim() === "") return record(cell, "FAIL", `退了 ${run.status} 但 stderr 没任何报错`);
    return record(cell, "ok", `退出码 ${run.status}`);
  }
  if (run.stdout !== want) {
    return record(cell, "FAIL", `输出不符 code=${run.status}\n    got=${JSON.stringify(run.stdout.slice(0, 160))}\n    exp=${JSON.stringify(want)}`);
  }
  if ((run.stderr || "").length > 0) return record(cell, "FAIL", `输出对但 stderr 不干净：${JSON.stringify(run.stderr.slice(0, 120))}`);
  record(cell, "ok", "stdout 逐字节一致、退出码 0、stderr 干净");
  if (existsSync(WORK)) record(`${cell}/清理`, "FAIL", `中间工作目录没清：${WORK}`);
  else record(`${cell}/清理`, "ok", "");
}

function boomProject(): string {
  const proj = join(TMP, "boom");
  mkdirSync(proj, { recursive: true });
  writeFileSync(join(proj, "project.godot"), '[application]\nconfig/name="boom"\n', "utf8");
  // 整数除零：Godot 与我们的运行时都在运行期抛（S27）
  writeFileSync(join(proj, "main.gd"), "extends SceneTree\n\nfunc _initialize():\n\tvar z = 0\n\tprint(100 / z)\n\tquit()\n", "utf8");
  return proj;
}

function main(): void {
  if (process.platform !== "win32") {
    console.log(`- SKIP 只出 Windows 产物，当前平台 ${process.platform}`);
    return;
  }
  if (!existsSync(CLI)) {
    console.error(`找不到 ${CLI} —— 先跑 pnpm build。`);
    process.exit(1);
  }
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });

  const selfV = nodeVer(process.execPath) ?? "0.0.0";
  const envBin = process.env.GDS2JS_NODE_BIN;
  const seaCapable = envBin && atLeast(nodeVer(envBin) ?? "0", SEA_MIN_NODE) ? envBin : atLeast(selfV, SEA_MIN_NODE) ? process.execPath : null;

  console.log("A node/出货（官方一步式 --build-sea）");
  if (!seaCapable) {
    record("node/出货", "refused", `本机没有 Node >= ${SEA_MIN_NODE}（用 GDS2JS_NODE_BIN 指一个）`);
  } else {
    const exe = join(TMP, "node-app.exe");
    const r = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", exe, "--pack", "node", "--node", seaCapable], {});
    const v = verdictOf(r.out);
    if (r.code !== 0) record("node/出货", v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code}\n${r.out.split(/\r?\n/).slice(-6).join("\n")}`);
    else {
      checkExe("node/出货", exe, MULTI_WANT);
      const boom = boomProject();
      const rb = runExport([join(boom, "main.gd"), "--res-root", boom, "-o", join(TMP, "node-boom.exe"), "--pack", "node", "--node", seaCapable], {});
      if (rb.code !== 0) record("node/抛错形状", verdictOf(rb.out)?.v ?? "FAIL", "导出抛错工程时退出码非 0");
      else checkExe("node/抛错形状", join(TMP, "node-boom.exe"), null);
    }
  }

  console.log("B node/版本门禁（SEA 节点不够新时该响，并给出重跑命令）");
  if (atLeast(selfV, SEA_MIN_NODE)) record("node/版本门禁", "refused", `当前 node v${selfV} 已够新，没有更旧的当对照物`);
  else {
    // 显式把 SEA 节点指回当前这个旧 node：整条命令可能被注了 GDS2JS_NODE_BIN=<新 node>，
    // 不覆盖掉的话这一格拿到的就是够新的二进制，门禁根本没被测到（上一版就栽在这）
    const r = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", join(TMP, "old.exe"), "--pack", "node"], { GDS2JS_NODE_BIN: process.execPath });
    const v = verdictOf(r.out);
    if (r.code === 0) record("node/版本门禁", "FAIL", `旧 node（v${selfV}）本该拒绝，却退了 0`);
    else if (v?.v !== "refused") record("node/版本门禁", "FAIL", `拒了但没打分类标记：${v?.note ?? r.out.slice(0, 120)}`);
    else if (!/换够新的 node 重跑/.test(r.out)) record("node/版本门禁", "FAIL", "拒绝却没给出重跑命令");
    else record("node/版本门禁", "ok", `v${selfV} 上响亮拒绝 + 给出重跑命令`);
  }

  console.log("C/D perry（默认 GC 与 PERRY_RS4GC=0 两格，按实测各归各的上游状态）");
  for (const [cell, env] of [
    ["perry/默认RS4GC", {}],
    ["perry/PERRY_RS4GC=0", { PERRY_RS4GC: "0" }],
  ] as Array<[string, NodeJS.ProcessEnv]>) {
    const exe = join(TMP, `${cell.replace(/[=/]/g, "_")}.exe`);
    const r = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", exe, "--pack", "perry"], env);
    const v = verdictOf(r.out);
    if (r.code === 0 && existsSync(exe)) checkExe(cell, exe, MULTI_WANT);
    else record(cell, v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code} 且无分类标记`);
  }

  console.log("E --pack scriptc 必须被拒（这一支已按实测撤掉）");
  const rs = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", join(TMP, "s.exe"), "--pack", "scriptc"], {});
  if (rs.code === 0 || !/--pack 只能是 node \| perry/.test(rs.out)) {
    record("--pack scriptc", "FAIL", `没有拒掉这个已移除的取值：${rs.out.slice(0, 120)}`);
  } else record("--pack scriptc", "ok", "被取值闸门拒了");

  rmSync(TMP, { recursive: true, force: true });
  rmSync(WORK, { recursive: true, force: true }); // 失败格会故意留 bundle 供人工重试，这里替用户收掉
  const failed = results.filter((x) => x.v === "FAIL");
  const okc = results.filter((x) => x.v === "ok").length;
  console.log(`\n汇总：ok ${okc} / 上游或环境记账 ${results.length - okc - failed.length} / FAIL ${failed.length}`);
  if (!results.some((x) => x.cell === "node/出货" && x.v === "ok")) {
    console.log("注意：node 那一支本轮没打出可用 exe（缺 Node>=25.7），逐字节对 golden 的结论来自手工实测。");
  }
  if (failed.length > 0) process.exit(1);
}

main();
