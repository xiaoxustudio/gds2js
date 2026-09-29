import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { emitModule } from "../src/emit/emitter";
import { lower } from "../src/lower/lower";
import { parseSource } from "../src/parse/parser";

const OUT = resolve("bench/.out");

interface Kernel {
  name: string;
  body: string;
  helpers?: string;
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
    name: "array-write",
    reps: 5,
    body: `
	var a = []
	var i = 0
	while i < 50000:
		a.append(i)
		i += 1
	var j = 0
	while j < 50000:
		a[j] = a[j] * 2
		j += 1
	var k = 0
	while k < 25000:
		var t = a[k]
		a[k] = a[49999 - k]
		a[49999 - k] = t
		k += 1
	return a[0] + a[49999]
`,
  },
  {
    name: "array-for-range",
    reps: 5,
    body: `
	var a = []
	for k in range(30000):
		a.append(k)
	for m in range(30000):
		a[m] = a[m] * 2
	var s = 0
	for n in range(30000):
		s += a[n]
	return s
`,
  },
  {
    name: "array-mutation",
    reps: 5,
    body: `
	var a = [1, 2, 3, 4, 5]
	var i = 0
	while i < 20000:
		a.push_front(i % 2)
		a.pop_back()
		a.insert(2, 7)
		a.remove_at(5)
		i += 1
	var s = 0
	for k in range(a.size()):
		s += a[k]
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
    name: "dict-get-default",
    reps: 5,
    body: `
	var d = {}
	var i = 0
	while i < 20000:
		d[i] = i * 2
		i += 1
	var s = 0
	var j = 0
	while j < 21000:
		s += d.get(j, 0)
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
    name: "string-array",
    reps: 5,
    body: `
	var names = ["a", "b"]
	var s = 0
	var i = 0
	while i < 20000:
		names.append("x" + names[i % 2])
		s += names[i].length()
		i += 1
	return s
`,
  },
  {
    name: "array-2d",
    reps: 5,
    body: `
	var g = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
	var s = 0
	var r = 0
	while r < 300:
		var c = 0
		while c < 3:
			var i = 0
			while i < 3:
				s += g[r % 3][i] + g[i][c]
				i += 1
			c += 1
		r += 1
	return s
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
    inst.bench();
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
