#!/usr/bin/env node
// CLI 延迟门：交替配对量端到端延迟，抵消这台机器的跨窗口漂移（独立两批能飘 ±40%）。
//
//   node tools/cli-latency.mjs --rounds=8 --baseline=dist \
//        "dist=node packages/gds2js/dist/cli.mjs run examples/test1.gd" \
//        "cc=[NODE_COMPILE_CACHE=tmp/cc] node packages/gds2js/dist/cli.mjs run examples/test1.gd"
import { spawnSync } from "node:child_process";
import { cpus } from "node:os";
import { join } from "node:path";
import { ROOT } from "./lib.mjs";

const argv = process.argv.slice(2);
const numArg = (name, dflt) => {
  const a = argv.find((x) => x.startsWith(`--${name}=`));
  return a === undefined ? dflt : Number(a.split("=")[1]);
};
const ROUNDS = Math.max(3, numArg("rounds", 8));
const WARMUP = Math.max(0, numArg("warmup", 1));
const baselineArg = argv.find((a) => a.startsWith("--baseline="));
const baseline = baselineArg === undefined ? null : baselineArg.split("=")[1];
const specs = argv.filter((a) => !a.startsWith("--"));
if (specs.length === 0) throw new Error('至少给一个变体："名字=命令"');

/** 命令前的 `[K=V ...]` 是这条变体独有的环境变量；命令按空格拆、不过 shell，免得把 shell 自己的启动钱算进读数。 */
function parse(spec) {
  const eq = spec.indexOf("=");
  if (eq < 1) throw new Error(`变体要写成 "名字=命令"，收到 ${spec}`);
  const name = spec.slice(0, eq).trim();
  let cmd = spec.slice(eq + 1).trim();
  const env = { ...process.env };
  const m = cmd.match(/^\[([^\]]*)\]\s*(.*)$/);
  if (m !== null) {
    for (const kv of m[1].split(/\s+/).filter((x) => x !== "")) {
      const i = kv.indexOf("=");
      env[kv.slice(0, i)] = i === kv.length - 1 ? "" : kv.slice(i + 1);
    }
    cmd = m[2];
  }
  const parts = cmd.split(/\s+/);
  const head = parts[0];
  // 只有 pnpm/.cmd 这类需要 shell；.exe 直接执行 —— 交给 shell 会被拼参数而不是转义，实测会把成功跑成 exit 1。
  const shell = /^(pnpm|npx|npm|yarn|corepack)$/.test(head) || head.endsWith(".cmd");
  // 带分隔符又不是绝对路径的，按仓库根解析；裸命令名（node / scriptc / git）留给 PATH 查找。
  if (!shell && /[\\/]/.test(head) && !head.startsWith("/") && !/^[A-Za-z]:/.test(head)) parts[0] = join(ROOT, head);
  return { name, parts, env, shell };
}

const variants = specs.map(parse);
const samples = new Map(variants.map((v) => [v.name, []]));
const badExit = new Map();
const call = (v) => spawnSync(v.parts[0], v.parts.slice(1), { cwd: ROOT, env: v.env, shell: v.shell, stdio: "ignore" });

for (let i = 0; i < WARMUP; i++) for (const v of variants) call(v);

for (let r = 0; r < ROUNDS; r++) {
  // 变体顺序每轮翻转：同一轮里固定「A 先 B 后」会把位置偏置（热身、文件缓存、频率爬坡）算成 A/B 差 ——
  // 实测过这种偏置能把符号都翻过来（6 轮 +48 ms、12 轮 −52 ms，两边 |t| 都 > 2）。
  const order = r % 2 === 0 ? variants : [...variants].reverse();
  for (const v of order) {
    const t0 = performance.now();
    const res = call(v);
    if (res.status !== 0) badExit.set(v.name, res.error !== undefined ? `起不来：${res.error.message}` : `退出码 ${String(res.status)}`);
    samples.get(v.name).push(performance.now() - t0);
  }
}

const pct = (xs, p) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))];
};
console.log(`CLI 延迟门：${variants.length} 个变体 × ${ROUNDS} 轮交替（CPU ${cpus().length} 核）\n`);
console.log("变体                     最小    中位    p90     全部(ms)");
for (const v of variants) {
  const xs = samples.get(v.name);
  console.log(
    `${v.name.padEnd(24)} ${Math.min(...xs).toFixed(0).padStart(6)} ${pct(xs, 0.5).toFixed(0).padStart(6)} ${pct(xs, 0.9).toFixed(0).padStart(6)}   [${xs.map((x) => x.toFixed(0)).join(" ")}]`,
  );
}
if (baseline !== null) {
  const b = samples.get(baseline);
  if (b === undefined) throw new Error(`--baseline=${baseline} 不在变体里`);
  console.log(`\n对基线「${baseline}」的配对差（每轮内比，负=更快）：`);
  for (const v of variants) {
    if (v.name === baseline) continue;
    const d = samples.get(v.name).map((x, i) => x - b[i]);
    const mean = d.reduce((a, x) => a + x, 0) / d.length;
    const sd = Math.sqrt(d.reduce((a, x) => a + (x - mean) ** 2, 0) / (d.length - 1));
    const se = sd / Math.sqrt(d.length);
    const t = se === 0 ? 0 : mean / se;
    console.log(
      `  ${v.name.padEnd(22)} ${mean >= 0 ? "+" : ""}${mean.toFixed(1)} ms ± ${se.toFixed(1)}（SE）= ${((mean / pct(b, 0.5)) * 100).toFixed(1)}%  |t|=${Math.abs(t).toFixed(2)}${Math.abs(t) >= 2 ? " ← 成立" : " ← 量不出来"}  ${d.filter((x) => x < 0).length}/${d.length} 轮更快`,
    );
  }
  console.log("\n规矩：|t| < 2 就是这份噪声读不出效应 —— 别拿独立两批数对比（同 bench:ab）。");
}
for (const [n, msg] of badExit) {
  console.log(`✗ 变体 ${n} ${msg} —— 这条读数不算（别让起不来的变体冒充快）`);
  process.exitCode = 1;
}
