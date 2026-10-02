import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { KERNELS, tableHeader, tableRow, type BenchRow, type Kernel } from "./bench-kernels";

const OUT = resolve("bench/.out");

async function compileKernel(k: Kernel): Promise<string> {
  const src = `class_name K\n\n${k.helpers ?? ""}func bench():${k.body}`;
  const ir = lower(await parseSource(src));
  const code = emitModule(ir, {
    runtimeImport: "gds2js/runtime",
    hostImport: null,
    autoRun: false,
    className: "K",
  });
  const file = join(OUT, `${k.name}.mts`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, code, "utf8");
  return file;
}

async function main(): Promise<void> {
  const filter = process.argv[2] || "";
  const rows: BenchRow[] = [];
  for (const k of KERNELS.filter((k) => k.name.includes(filter))) {
    const file = await compileKernel(k);
    const mod = (await import(pathToFileURL(file).href)) as { K: new () => { bench: () => { v: unknown } } };
    const inst = new mod.K();
    inst.bench();
    let checksum: unknown = null;
    const t0 = performance.now();
    for (let r = 0; r < k.reps; r++) checksum = inst.bench().v;
    rows.push({ name: k.name, ms: (performance.now() - t0) / k.reps, checksum: String(checksum) });
  }
  console.log(tableHeader("gds2js benchmark —— 基线（emitter 全程 ops.* 动态路径 + Variant 装箱）\n").join("\n"));
  for (const r of rows) console.log(tableRow(r));
  console.log(`---------------------  ---------`);
  console.log(`${"合计".padEnd(20)} ${rows.reduce((a, r) => a + r.ms, 0).toFixed(2).padStart(8)}`);
  writeFileSync(join(OUT, "js.json"), JSON.stringify(rows, null, 2), "utf8");
  console.log(`\n结果已写 ${join(OUT, "js.json")} —— pnpm bench:godot 会拿它算倍率`);
}

await main();
