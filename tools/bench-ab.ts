// 配对 A/B：同一台机器上，把「基线」和「候选」交替测量，抵消跨窗口的漂移。
// 单次 `pnpm bench` 的读数在这台机器上能飘 ±25%（12 轮自对照：+23.5% / +2.2% / −1.1% / +14.9%），
// 所以「改了什么、快了多少」必须走这里，不能靠两次独立运行对比。
//
//   pnpm bench:ab --rounds 6 packages/runtime/src/runtime/tags.ts=tmp/candidate.ts
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT } from "./lib.mjs";

const argv = process.argv.slice(2);
const roundsArg = argv.find((a) => a.startsWith("--rounds="));
const ROUNDS = Math.max(1, roundsArg === undefined ? 4 : Number(roundsArg.split("=")[1]) || 4);
const pairs = argv.filter((a) => !a.startsWith("--")).map((a) => {
  const i = a.indexOf("=");
  if (i < 1) throw new Error(`要的是 <仓内文件>=<候选文件>，收到 ${a}`);
  return { target: a.slice(0, i), candidate: resolve(a.slice(i + 1)) };
});
if (pairs.length === 0) throw new Error("至少给一对：<仓内文件>=<候选文件>");

// 工作树里那些文件在测量期间是被覆盖的：原始字节全部留在内存里，恢复也从内存里写 ——
// 走文件的备份曾经把两个目标串成一个（pairs 多于一条时共用同一个 orig 路径），那等于毁掉一个源文件。
const original = new Map<string, string>();
const absTargets = pairs.map((p) => {
  const abs = join(ROOT, p.target);
  if (abs === p.candidate) throw new Error(`候选文件不能就是目标本身：${p.target}`);
  return { spec: p, abs };
});

function measure(): { name: string; ms: number; checksum: string }[] {
  execFileSync(process.execPath, ["--import", "tsx", join(ROOT, "tools", "bench.ts")], { cwd: ROOT, stdio: "ignore" });
  return JSON.parse(readFileSync(join(ROOT, "bench/.out/js.json"), "utf8")) as { name: string; ms: number; checksum: string }[];
}

try {
  for (const { spec, abs } of absTargets) original.set(abs, readFileSync(abs, "utf8"));
  const rows: { side: string; json: { name: string; ms: number; checksum: string }[] }[] = [];
  for (let i = 0; i < ROUNDS; i++) {
    for (const side of ["base", "cand"] as const) {
      for (const { spec, abs } of absTargets) {
        if (side === "base") writeFileSync(abs, original.get(abs) as string, "utf8");
        else copyFileSync(spec.candidate, abs);
      }
      const json = measure();
      rows.push({ side, json });
      console.log(`${i + 1}/${ROUNDS} ${side.padEnd(5)} 合计 ${json.reduce((a, r) => a + r.ms, 0).toFixed(2)}`);
    }
  }
  const totals = rows.map((r) => r.json.reduce((a, x) => a + x.ms, 0));
  const diffs: number[] = [];
  for (let i = 0; i + 1 < totals.length; i += 2) diffs.push(totals[i + 1] - totals[i]);
  const mean = diffs.reduce((a, x) => a + x, 0) / diffs.length;
  const sd = Math.sqrt(diffs.reduce((a, x) => a + (x - mean) ** 2, 0) / Math.max(1, diffs.length - 1));
  const se = sd / Math.sqrt(diffs.length);
  const baseSum = diffs.reduce((a, _, k) => a + totals[k * 2], 0) / diffs.length;
  console.log(`\n配对差均值 ${mean.toFixed(2)} ms ± ${se.toFixed(2)}（SE）= ${((mean / baseSum) * 100).toFixed(2)}%  |t|=${Math.abs(mean / se).toFixed(2)}`);
  console.log(`候选更快的轮次 ${diffs.filter((x) => x < 0).length}/${diffs.length}；|t| < 2 就是这份噪声读不出效应，别按单次运行下结论。`);
  const names = rows[0].json.map((r) => r.name);
  console.log("\n按 kernel 的配对中位差（负=候选更快）：");
  for (const n of names) {
    const ds = diffs.map((_, k) => {
      const b = rows[k * 2].json.find((x) => x.name === n)?.ms ?? 0;
      const c = rows[k * 2 + 1].json.find((x) => x.name === n)?.ms ?? 0;
      return c - b;
    });
    const s = [...ds].sort((a, b) => a - b);
    console.log(`  ${n.padEnd(20)} ${s[Math.floor(s.length / 2)] >= 0 ? "+" : ""}${s[Math.floor(s.length / 2)].toFixed(2)} ms`);
  }
  const drift = new Map<string, Set<string>>();
  for (const r of rows) for (const x of r.json) (drift.get(x.name) ?? new Set()).add(x.checksum);
  for (const [n, set] of drift) if (set.size > 1) console.log(`校验值在轮次间不一致：${n} → ${[...set].join(" | ")}`);
} finally {
  let broken = 0;
  for (const { abs } of absTargets) {
    const want = original.get(abs);
    if (want === undefined) continue;
    try {
      writeFileSync(abs, want, "utf8");
      if (readFileSync(abs, "utf8") !== want) {
        console.log(`✗ 没能把 ${abs} 还原成测量前的样子 —— 立刻手工核对工作树`);
        broken++;
      }
    } catch (e) {
      console.log(`✗ 还原 ${abs} 失败：${String(e)}`);
      broken++;
    }
  }
  if (broken > 0) process.exitCode = 1;
}
