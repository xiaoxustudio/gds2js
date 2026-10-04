// 5.5 的第三把尺子：同一张 kernel 表（tools/bench-kernels.ts）编成 scriptc 原生 exe，量每次调用的墙钟。
//
// 计时口径（写死在这里，免得读数被误读）：
//   * exe 内部把 kernel 连跑 reps+1 次（第一次当预热），所以「进程墙钟 − 空转基线」≈ (reps+1) × 单次；
//   * 空投基线 = 同一套导出流程编出来的、_initialize 里只 quit() 的 exe，同法取最小；
//   * 每个 exe 跑 RUNS 次取最小值 —— 这台机器单次能飘 ±25%，均值一律不用（见 ROADMAP §1.12）。
//
//   pnpm bench:scriptc            # 全 14 格（要 zig + scriptc；导出四路并发，几分钟）
//   pnpm bench:scriptc array-     # 只跑名字含 "array-" 的
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { join } from "node:path";
import { KERNELS } from "./bench-kernels.ts";
import { ROOT } from "./lib.mjs";

const CLI = join(ROOT, "packages", "gds2js", "dist", "cli.mjs");
if (!existsSync(CLI)) {
  console.error("先 pnpm build（这条门用出货形态的 dist CLI）");
  process.exit(1);
}
const WORK = join(ROOT, "tmp", "bench-scriptc");
const RUNS = Math.max(3, Number(process.env.GDS2JS_BENCH_SCRIPTC_RUNS) || 5);
const JOBS = Math.max(1, Math.min(4, cpus().length));
const filter = process.argv[2] || "";

function exePath(name: string): string {
  return join(WORK, name, "case.exe");
}

/** 一个 kernel 编成一份自跑工程：_initialize 里连跑 reps+1 次再 quit()。 */
function projectSources(name: string, body: string, helpers: string | undefined, calls: number): string {
  const dir = join(WORK, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const gd = `extends SceneTree\n\n${helpers ?? ""}func bench():${body}\nfunc _initialize():\n\tvar r = 0\n\twhile r < ${calls}:\n\t\tbench()\n\t\tr += 1\n\tquit()\n`;
  writeFileSync(join(dir, "main.gd"), gd, "utf8");
  writeFileSync(join(dir, "project.godot"), `[application]\nconfig/name="bench-${name}"\n`, "utf8");
  return dir;
}

function exportExe(dir: string, out: string): { code: number | null; out: string } {
  const r = spawnSync(process.execPath, [CLI, "export", join(dir, "main.gd"), "--pack", "scriptc", "-o", out, "--keep-bundle"], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 900000,
  });
  return { code: r.status, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function runOnce(exe: string): Promise<number> {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const child = spawn(exe, [], { stdio: "ignore" });
    child.on("error", () => resolve(Number.POSITIVE_INFINITY));
    child.on("close", (code) => {
      if (code !== 0) resolve(Number.POSITIVE_INFINITY);
      else resolve(performance.now() - t0);
    });
  });
}

async function timedMin(exe: string): Promise<number> {
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < RUNS; i++) best = Math.min(best, await runOnce(exe));
  return best;
}

const chosen = KERNELS.filter((k) => k.name.includes(filter));
if (chosen.length === 0) {
  console.error(`没有名字含 "${filter}" 的 kernel`);
  process.exit(1);
}
mkdirSync(WORK, { recursive: true });

// 空转基线：同样的导出流程、同样的 quit()，只是不调 bench()
const baseDir = projectSources("__baseline__", "\n\treturn 0\n", undefined, 0);
const baseExe = exePath("__baseline__");
const baseBuild = exportExe(baseDir, baseExe);
if (baseBuild.code !== 0 || !existsSync(baseExe)) {
  console.error(`基线 exe 没编出来，停：\n${baseBuild.out.slice(-600)}`);
  process.exit(1);
}
const baselineStart = await timedMin(baseExe);
let baseline = baselineStart;
console.log(`scriptc 侧基准：空转 exe 一次 ${baselineStart.toFixed(0)} ms（${RUNS} 次取最小）；kernel 并发 ${JOBS}\n`);

interface Row { name: string; wall: number; calls: number; note: string }
const rows: (Row | null)[] = chosen.map(() => null);
let cursor = 0;

async function worker(): Promise<void> {
  for (;;) {
    const i = cursor++;
    if (i >= chosen.length) return;
    const k = chosen[i] as (typeof chosen)[number];
    const calls = k.reps + 1;
    const dir = projectSources(k.name, k.body, k.helpers, calls);
    const exe = exePath(k.name);
    const built = exportExe(dir, exe);
    if (built.code !== 0 || !existsSync(exe)) {
      rows[i] = { name: k.name, wall: Number.NaN, calls, note: "编不过" };
      console.log(`  ${k.name.padEnd(20)} 编不过：${built.out.trim().split("\n").pop()?.slice(0, 120) ?? ""}`);
      continue;
    }
    const wall = await timedMin(exe);
    rows[i] = { name: k.name, wall, calls, note: wall === Number.POSITIVE_INFINITY ? "跑不起来" : "" };
    console.log(`  ${k.name.padEnd(20)} 墙钟 ${wall.toFixed(0)} ms / ${calls} 次`);
  }
}

await Promise.all(Array.from({ length: Math.min(JOBS, chosen.length) }, worker));

// 基线首尾各量一次取小：只在开头量过一次时，机器飘了会让最便宜的格子算出负数（实测 string-concat −1.7 ms）
baseline = Math.min(baselineStart, await timedMin(baseExe));
console.log(`基线复量：首 ${baselineStart.toFixed(0)} ms → 扣掉取小后的 ${baseline.toFixed(0)} ms`);


let js: { name: string; ms: number }[] = [];
try {
  js = JSON.parse(readFileSync(join(ROOT, "bench", ".out", "js.json"), "utf8")) as { name: string; ms: number }[];
} catch {
  console.log("\n（没找到 bench/.out/js.json —— 先 pnpm bench 才能并排出 node 侧对照）");
}
const jmap = new Map(js.map((r) => [r.name, r.ms]));
console.log("\nkernel                 scriptc(ms/次)   node(ms/次)   node/scriptc");
for (const r of rows) {
  const perCall = r === null ? Number.NaN : (r.wall - baseline) / r.calls;
  if (r === null || Number.isNaN(r.wall)) {
    console.log(`${(r?.name ?? "?").padEnd(22)} ${r?.note || "缺"}`);
    continue;
  }
  if (perCall <= 0) {
    console.log(`${r.name.padEnd(22)} 墙钟 ${r.wall.toFixed(0)} ms 低于基线 —— 读数不可信（这一格别引用）`);
    continue;
  }
  const nodeMs = jmap.get(r.name);
  const ratio = nodeMs === undefined ? Number.NaN : nodeMs / perCall;
  console.log(
    `${r.name.padEnd(22)} ${perCall.toFixed(3).padStart(12)}   ${(nodeMs === undefined ? "—" : nodeMs.toFixed(2)).padStart(10)}   ${(Number.isNaN(ratio) ? "—" : ratio.toFixed(2) + "×").padStart(8)}`,
  );
}
console.log(`\n口径提醒：scriptc 那一列是「进程墙钟 − 空转基线」摊到每次调用，含原生启动与退出；node 那一列是进程内计时循环。两者不完全同尺，别当倍数结论直接引用。`);
writeFileSync(join(ROOT, "tmp", "bench-scriptc.json"), JSON.stringify(rows, null, 2), "utf8");
console.log(`读数已写 tmp/bench-scriptc.json`);
