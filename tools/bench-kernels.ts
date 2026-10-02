/**
 * gds2js 与 Godot 两份 benchmark 共用这 14 个 kernel：同一份源定义，两边读数才可直接对撞。
 * 每条带 reps（计时重复次数，前面另有一次不计时预热）与可选 helpers（模块级函数，用来量调用/赋值开销）。
 */
export interface Kernel {
  name: string;
  body: string;
  helpers?: string;
  reps: number;
}

export const KERNELS: Kernel[] = [
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

/** 一次 kernel 计时的结果；两份 bench 共用这个形状，才能并排印与算倍率。 */
export interface BenchRow {
  name: string;
  ms: number;
  checksum: string;
}

/** 表格列宽与表头：两份 bench 用同一个，终端里上下对齐才好看得出差多少。 */
export function tableHeader(title: string): string[] {
  return [
    title,
    "kernel                 每次(ms)     校验值",
    "---------------------  ---------    ----------",
  ];
}

export function tableRow(r: BenchRow): string {
  return `${r.name.padEnd(22)} ${r.ms.toFixed(2).padStart(8)}    ${r.checksum}`;
}

/** 两边同一 kernel 的倍率（Godot / gds2js，>1 = Godot 更慢）；校验值只列出来，不判等。 */
export function compareRows(js: BenchRow[], godot: BenchRow[]): string[] {
  const jmap = new Map(js.map((r) => [r.name, r]));
  const out = ["kernel                 gds2js(ms)   Godot(ms)   倍率    校验值是否同字面", "----------------------  ---------   ---------  ------   --------------"];  let jsSum = 0, gdSum = 0;
  for (const g of godot) {
    const j = jmap.get(g.name);
    if (!j) { out.push(`${g.name.padEnd(22)}   ——未找到——   ${g.ms.toFixed(2).padStart(8)}`); continue; }
    jsSum += j.ms;
    gdSum += g.ms;
    const same = String(j.checksum) === g.checksum ? "同" : `异(gds2js=${j.checksum})`;
    out.push(`${g.name.padEnd(22)} ${j.ms.toFixed(2).padStart(9)}   ${g.ms.toFixed(2).padStart(9)}  ${(g.ms / j.ms).toFixed(1).padStart(6)}   ${same}`);
  }
  out.push("-".repeat(70));
  out.push(`${"合计".padEnd(20)} ${jsSum.toFixed(2).padStart(9)}   ${gdSum.toFixed(2).padStart(9)}  ${(gdSum / jsSum).toFixed(1).padStart(6)}`);
  return out;
}
