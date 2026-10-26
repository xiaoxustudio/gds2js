import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT } from "../../tools/lib.mjs";

const SRC = join(ROOT, "packages", "runtime", "src");
const KNOWN_CIRCLES: Array<string[]> = [
  ["runtime/builtins", "runtime/convert", "runtime/methods"],
  ["runtime/packed", "runtime/values"],
];
const LEAVES = ["runtime/ucaps", "runtime/errors", "runtime/case-flags", "runtime/case-table", "runtime/engine-classes"];

const files = readdirSync(join(SRC, "runtime")).filter((n) => n.endsWith(".ts")).map((n) => "runtime/" + n.replace(/\.ts$/, ""));
for (const n of ["host", "host-node", "host-scriptc", "standalone", "product"]) files.push(n);

const graph = new Map<string, string[]>();
for (const f of files) {
  let text: string;
  try {
    text = readFileSync(join(SRC, f + ".ts"), "utf8");
  } catch {
    continue;
  }
  const deps = new Set<string>();
  for (const m of text.matchAll(/from\s+"(\.\.?\/[^"]+)"/g)) {
    const spec = m[1];
    if (spec === undefined) continue;
    const d = posix.normalize(posix.join(posix.dirname(f), spec));
    if (files.includes(d)) deps.add(d);
  }
  graph.set(f, [...deps]);
}

const reach = (from: string, to: string, seen: Set<string>): boolean => {
  for (const d of graph.get(from) ?? []) {
    if (d === to) return true;
    if (!seen.has(d)) {
      seen.add(d);
      if (reach(d, to, seen)) return true;
    }
  }
  return false;
};

describe("模块环登记册门（runtime 内部的强连通分量只许缩不许长）", () => {
  it("① 实际的环与登记一致", () => {
    const members = new Set(files.filter((a) => files.some((b) => a !== b && reach(a, b, new Set([a])) && reach(b, a, new Set([b])))));
    const actual: string[] = [...members].sort();
    const registered = KNOWN_CIRCLES.flat().sort();
    const fresh = actual.filter((m) => !registered.includes(m));
    const fixed = registered.filter((m) => !actual.includes(m));
    for (const f of fresh) bad(`${f} 落进了新的环：拆分的意义就在解环，别把它塞进登记册`);
    for (const f of fixed) bad(`${f} 已经不在环里了，把它从 KNOWN_CIRCLES 去掉`);
    if (fresh.length === 0 && fixed.length === 0) ok(`环成员恰好是登记的 ${registered.length} 个（两个连通分量）`);
  });

  it("② 已声明的叶子不许长出出边", () => {
    const offenders = LEAVES.filter((l) => (graph.get(l) ?? []).length > 0);
    for (const o of offenders) bad(`${o} 现在 import 了 ${(graph.get(o) ?? []).join(", ")}，它不再是可随迁的叶子`);
    if (offenders.length === 0) ok(`${LEAVES.length} 份叶子模块仍无内部依赖（ucaps 能跟着字符串族一起搬）`);
  });

  it("③ barrel 仍走 export * 而不是具名清单", () => {
    const text = readFileSync(join(SRC, "runtime/index.ts"), "utf8");
    const star = (text.match(/^export \* from /gm) ?? []).length;
    if (star === 0) bad("runtime/index.ts 不再 export * 任何模块，产物公共面会凭空缩水");
    else ok(`barrel 仍再导出 ${String(star)} 个模块（新文件必须挂进来，否则 emit-contract 会红）`);
  });
});
