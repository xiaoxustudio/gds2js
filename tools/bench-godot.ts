import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { GODOT_BIN, runGodot } from "./lib.mjs";
import { KERNELS, compareRows, tableHeader, tableRow, type BenchRow } from "./bench-kernels";

const OUT = resolve("bench/.out");
const TIMEOUT_MS = Number(process.env.GDS2JS_BENCH_GODOT_TIMEOUT_MS) || 900_000;

/** kernel 名 → GDScript 函数名（`-` 不是标识符字符）。 */
function fnName(kernel: string): string {
  return "k_" + kernel.replace(/[^a-zA-Z0-9_]/g, "_");
}

function program(): string {
  const helperBlocks: string[] = [];
  const seenHelper = new Map<string, string>();
  const kernels: string[] = [];
  for (const k of KERNELS) {
    const h = k.helpers ?? "";
    if (h.trim() !== "" && !helperBlocks.includes(h)) {
      for (const m of h.matchAll(/^func\s+([A-Za-z_]\w*)/gm)) {
        const name = m[1] as string;
        const owner = seenHelper.get(name);
        if (owner !== undefined && owner !== h) throw new Error(`kernel 之间 helper 重名（${name}），GDScript 里会互相盖掉，不猜`);
        seenHelper.set(name, h);
      }
      helperBlocks.push(h);
    }
    kernels.push(`func ${fnName(k.name)}():${k.body}\n`);
  }
  const drive = KERNELS.map((k) => `\ttime_it("${k.name}", ${k.reps}, Callable(self, "${fnName(k.name)}"))`).join("\n");
  return `extends SceneTree

var _last = null

func time_it(label, reps, fn):
	fn.call()
	var t0 = Time.get_ticks_usec()
	var r = 0
	while r < reps:
		_last = fn.call()
		r += 1
	var ms = float(Time.get_ticks_usec() - t0) / 1000.0 / float(reps)
	print("BENCH\\t%s\\t%s\\t%s" % [label, str(ms), str(_last)])

${helperBlocks.join("\n")}
${kernels.join("\n")}
func _initialize():
${drive}
	quit()
`;
}

function parse(text: string): BenchRow[] {
  const rows: BenchRow[] = [];
  for (const line of text.split(/\r?\n/)) {
    const f = line.split("\t");
    if (f[0] !== "BENCH" || f.length < 4) continue;
    const ms = Number(f[2]);
    if (!Number.isFinite(ms)) continue;
    rows.push({ name: f[1] as string, ms, checksum: f.slice(3).join("\t") });
  }
  return rows;
}

function readJson(path: string): BenchRow[] | null {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as BenchRow[];
  } catch {
    return null;
  }
}

function main(): void {
  const filter = process.argv[2] || "";
  const gd = join(OUT, "bench-godot.gd");
  mkdirSync(OUT, { recursive: true });
  writeFileSync(gd, program(), "utf8");
  console.log(`Godot benchmark —— ${GODOT_BIN}`);
  console.log(`kernel 定义与 pnpm bench 同源（tools/bench-kernels.ts）；单进程跑完全部，避免把启动开销算进测量\n`);
  const r = runGodot(gd, { timeoutMs: TIMEOUT_MS });
  const rows = parse(r.text).filter((x) => x.name.includes(filter));
  if (rows.length === 0) {
    console.error(`Godot 没吐出一行 BENCH（解析到 ${parse(r.text).length} 行）。原文：\n${r.text.slice(0, 1500)}`);
    process.exit(1);
  }
  console.log(tableHeader(`Godot ${rows.length} 个 kernel（每次 ms，越小越快）`).join("\n"));
  for (const row of rows) console.log(tableRow(row));
  console.log(`---------------------  ---------`);
  console.log(`${"合计".padEnd(20)} ${rows.reduce((a, x) => a + x.ms, 0).toFixed(2).padStart(8)}`);
  writeFileSync(join(OUT, "godot.json"), JSON.stringify(rows, null, 2), "utf8");

  const js = readJson(join(OUT, "js.json"));
  if (!js) {
    console.log(`\n（没找到 bench/.out/js.json —— 先跑 pnpm bench 就能出倍率对照）`);
    return;
  }
  console.log(`\n与 gds2js 对照（倍率 = Godot / gds2js，>1 表示 Godot 更慢、我们更快；<1 表示这个 kernel 我们更慢）`);
  for (const line of compareRows(js, rows)) console.log(line);
}

main();
