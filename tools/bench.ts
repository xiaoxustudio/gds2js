/**
 * 性能 benchmark —— D2 性能阶段的度量 + 每步优化的回归护栏。
 * 跑：node_modules/.bin/tsx tools/bench.ts（需先 pnpm build，kernel 走 gds2js/runtime 自引用）
 *
 * 把若干计算密集的 GDScript kernel 用真正的编译管线（parse→lower→emitModule）编成 .mts，
 * 在 node 下计时。校验值用于确认优化前后语义不变（必须逐一相同）。
 *
 * 基线（纯 ops.* 动态路径 + Variant 装箱）合计 ~160ms；
 * 保守 int 单态化解箱后 ~91ms（int-sum 3.8x，循环计数器解箱是主要来源）。
 * 不引入任何新编译器代码——只复用 emitModule，所以 bench 本身不会带来语义风险。
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { emitModule } from "../src/emit/emitter";
import { lower } from "../src/lower/lower";
import { parseSource } from "../src/parse/parser";

const OUT = resolve("bench/.out");

interface Kernel {
  name: string;
  /** 每个 kernel 是一个无参 `bench()` 方法，返回一个校验值（防 DCE）。 */
  body: string;
  /** 可选：bench() 之外的辅助方法源码（放在 bench 前），用于测函数调用边界的装箱开销。 */
  helpers?: string;
  /** 计时重复次数（loop 量已写进 body，这里只是多跑几遍取稳定值）。 */
  reps: number;
}

const KERNELS: Kernel[] = [
  {
    name: "int-sum",
    reps: 5,
    body: `
	var s = 0
	var i = 0
	while i < 300000:
		s += i
		i += 1
	return s
`,
  },
  {
    name: "int-fib",
    reps: 5,
    body: `
	var a = 0
	var b = 1
	var i = 0
	while i < 300000:
		var t = (a + b) % 1000000007
		a = b
		b = t
		i += 1
	return a
`,
  },
  {
    name: "float-math",
    reps: 5,
    body: `
	var x = 0.0
	var i = 0
	while i < 300000:
		x = x + 0.5 * 1.0001 - 0.25
		i += 1
	return x
`,
  },
  {
    name: "array-append-sum",
    reps: 5,
    body: `
	var a = []
	var i = 0
	while i < 30000:
		a.append(i)
		i += 1
	var s = 0
	var j = 0
	while j < a.size():
		s += a[j]
		j += 1
	return s
`,
  },
  {
    name: "dict-set-get",
    reps: 5,
    body: `
	var d = {}
	var i = 0
	while i < 30000:
		d[i] = i * 2
		i += 1
	var s = 0
	var j = 0
	while j < 30000:
		s += d[j]
		j += 1
	return s
`,
  },
  {
    name: "string-concat",
    reps: 3,
    body: `
	var s = ""
	var i = 0
	while i < 3000:
		s = s + "x"
		i += 1
	return s.length()
`,
  },
  {
    name: "helper-int",
    reps: 5,
    helpers: `func add2(a, b):
	return a + b

`,
    body: `
	var s = 0
	var i = 0
	while i < 300000:
		s = add2(s, i)
		i += 1
	return s
`,
  },
  {
    name: "helper-assign",
    reps: 5,
    helpers: `func tri(x):
	var y = x * 3
	var z = y + x
	return z

`,
    body: `
	var s = 0
	var i = 0
	while i < 300000:
		s = tri(i)
		i += 1
	return s
`,
  },
];

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
  console.log(`gds2js benchmark — 基线（emitter 全程 ops.* 动态路径 + Variant 装箱）\n`);
  console.log(`kernel                 每次(ms)     校验值`);
  console.log(`---------------------  ---------    ----------`);

  let totalMs = 0;
  for (const k of KERNELS) {
    const file = await compileKernel(k);
    const mod = (await import(pathToFileURL(file).href)) as { K: new () => { bench: () => { v: unknown } } };
    const inst = new mod.K();
    inst.bench(); // 预热，触发 JIT
    let checksum: unknown = null;
    const t0 = performance.now();
    for (let r = 0; r < k.reps; r++) checksum = inst.bench().v;
    const t1 = performance.now();
    const perRun = (t1 - t0) / k.reps;
    totalMs += perRun;
    console.log(`${k.name.padEnd(22)} ${perRun.toFixed(2).padStart(8)}    ${String(checksum)}`);
  }
  console.log(`---------------------  ---------`);
  console.log(`${"合计".padEnd(20)} ${totalMs.toFixed(2).padStart(8)}`);
}

await main();
