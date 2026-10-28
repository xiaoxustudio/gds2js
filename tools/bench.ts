import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { emitModule } from "@gds2js/compiler/emit";
import { NO_ANALYSIS } from "@gds2js/compiler/analyze/analysis-result";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import type { CsNode } from "@gds2js/compiler/parse/cst";
import { CORPUS } from "./lib.mjs";
import { KERNELS, tableHeader, tableRow, type BenchRow, type Kernel } from "./bench-kernels";

const OUT = resolve("bench/.out");
const ROUNDS = Math.max(1, Number(process.env.GDS2JS_BENCH_ROUNDS) || 3);

/** 语料里会被解析到的每一支 .gd（含工程用例的跨文件脚本，仍排除 000- 探头）。 */
function corpusScripts(dir = CORPUS, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (!e.name.startsWith("000-")) corpusScripts(p, out);
    } else if (e.name.endsWith(".gd")) out.push(p);
  }
  return out.sort();
}

function countNodes(n: CsNode): number {
  let total = 1;
  for (const c of n.children) total += countNodes(c);
  return total;
}

/**
 * 解析期那一把尺：整轮语料 parse 的最小耗时，校验值是节点总数 —— 耗时说明快慢，
 * 节点总数说明「同样这些源码仍然折成同样这棵树」，两者一起才顶得住一次解析器改动。
 */
async function benchParse(): Promise<void> {
  const files = corpusScripts();
  const srcs = files.map((f) => readFileSync(f, "utf8"));
  const kb = Math.round(srcs.reduce((a, s) => a + s.length, 0) / 1024);
  const cold = performance.now();
  await parseSource(srcs[0]!);
  const coldMs = performance.now() - cold;
  let nodes = 0;
  for (const s of srcs) nodes += countNodes((await parseSource(s)).rootNode);
  let best = Number.POSITIVE_INFINITY;
  for (let q = 0; q < ROUNDS; q++) {
    const t0 = performance.now();
    for (const s of srcs) await parseSource(s);
    best = Math.min(best, performance.now() - t0);
  }
  const rows: BenchRow[] = [
    { name: "parse-cold", ms: coldMs, checksum: `${String(files.length)} 份 / ${String(kb)} KB` },
    { name: "parse-corpus", ms: best, checksum: String(nodes) },
  ];
  console.log(tableHeader(`gds2js benchmark —— 解析期（手写递归下降，无 wasm）· 每个 kernel ${ROUNDS} 轮取最小\n`).join("\n"));
  for (const r of rows) console.log(tableRow(r));
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "parse.json"), JSON.stringify(rows, null, 2), "utf8");
  console.log(`\n结果已写 ${join(OUT, "parse.json")} —— 改解析器前后各跑一次，两个数一起对`);
}

async function compileKernel(k: Kernel): Promise<string> {
  const src = `class_name K\n\n${k.helpers ?? ""}func bench():${k.body}`;
  const ir = lower(await parseSource(src));
  const code = emitModule(ir, {
    runtimeImport: "gds2js/runtime",
    hostImport: null,
    autoRun: false,
    className: "K",
  }, NO_ANALYSIS);
  const file = join(OUT, `${k.name}.mts`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, code, "utf8");
  return file;
}

async function main(): Promise<void> {
  if (process.argv.includes("--parse")) return benchParse();
  const filter = process.argv[2] || "";
  const rows: BenchRow[] = [];
  for (const k of KERNELS.filter((k) => k.name.includes(filter))) {
    const file = await compileKernel(k);
    const mod = (await import(pathToFileURL(file).href)) as { K: new () => { bench: () => { v: unknown } } };
    const inst = new mod.K();
    inst.bench();
    let checksum: unknown = null;
    let best = Number.POSITIVE_INFINITY;
    for (let q = 0; q < ROUNDS; q++) {
      const t0 = performance.now();
      for (let r = 0; r < k.reps; r++) checksum = inst.bench().v;
      best = Math.min(best, (performance.now() - t0) / k.reps);
    }
    rows.push({ name: k.name, ms: best, checksum: String(checksum) });
  }
  console.log(tableHeader(`gds2js benchmark —— 基线（emitter 全程 ops.* 动态路径 + Variant 装箱）· 每个 kernel ${ROUNDS} 轮取最小\n`).join("\n"));
  for (const r of rows) console.log(tableRow(r));
  console.log(`---------------------  ---------`);
  console.log(`${"合计".padEnd(20)} ${rows.reduce((a, r) => a + r.ms, 0).toFixed(2).padStart(8)}`);
  writeFileSync(join(OUT, "js.json"), JSON.stringify(rows, null, 2), "utf8");
  console.log(`\n结果已写 ${join(OUT, "js.json")} —— pnpm bench:godot 会拿它算倍率`);
}

await main();
