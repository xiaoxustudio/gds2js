import { readdirSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT } from "../../tools/lib.mjs";

const SRC = join(ROOT, "packages", "runtime", "src");
const KNOWN_CIRCLES: Array<string[]> = [];
const LEAVES = ["runtime/ucaps", "runtime/errors", "runtime/case-flags", "runtime/case-table", "runtime/engine-classes"];

const walkRuntime = (rel: string): string[] =>
  readdirSync(join(SRC, rel), { withFileTypes: true }).flatMap((ent) =>
    ent.isDirectory() ? walkRuntime(`${rel}/${ent.name}`) : ent.name.endsWith(".ts") ? [`${rel}/${ent.name.replace(/\.ts$/, "")}`] : [],
  );
const files = walkRuntime("runtime");
for (const n of ["host", "host-node", "host-scriptc", "standalone", "product"]) files.push(n);

function valueDeps(f: string, text: string): string[] {
  const deps = new Set<string>();
  const add = (spec: string): void => {
    const id = posix.normalize(posix.join(posix.dirname(f), spec));
    if (files.includes(id)) deps.add(id);
  };
  for (const m of text.matchAll(/\b(import|export)([\s\S]*?)from\s*"(\.\.?\/[^"]+)";/g)) {
    const clause = m[2] ?? "";
    const spec = m[3] ?? "";
    if (/^\s*type[\s{*]/.test(clause)) continue;
    const names = (/\{([\s\S]*)\}/.exec(clause)?.[1] ?? "").split(",").map((s) => s.trim()).filter((s) => s !== "");
    if (names.length > 0 && names.every((s) => s.startsWith("type "))) continue;
    add(spec);
  }
  for (const m of text.matchAll(/^import\s*"(\.\.?\/[^"]+)";/gm)) add(m[1] ?? "");
  return [...deps];
}

const graph = new Map<string, string[]>();
for (const f of files) {
  try {
    graph.set(f, valueDeps(f, readFileSync(join(SRC, f + ".ts"), "utf8")));
  } catch {
    continue;
  }
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

describe("模块环登记册门（runtime 内部的价值环只许缩不许长）", () => {
  it("① 实际的价值环与登记一致", () => {
    const members = files.filter((a) => a !== "runtime/index" && files.some((b) => a !== b && reach(a, b, new Set([a])) && reach(b, a, new Set([b])))).sort();
    const registered = KNOWN_CIRCLES.flat().sort();
    const fresh = members.filter((m) => !registered.includes(m));
    const gone = registered.filter((m) => !members.includes(m));
    for (const f of fresh) bad(`${f} 落进了新的价值环：拆分的意义就在解环，别把它塞进登记册`);
    for (const g of gone) bad(`${g} 已经不在价值环里了，把它从 KNOWN_CIRCLES 去掉`);
    if (fresh.length === 0 && gone.length === 0) ok(`价值环成员恰好是登记的 ${String(registered.length)} 个`);
  });

  it("② 已声明的叶子不许长出出边", () => {
    const offenders = LEAVES.filter((l) => (graph.get(l) ?? []).length > 0);
    for (const o of offenders) bad(`${o} 现在 import 了 ${(graph.get(o) ?? []).join(", ")}，它不再是可随迁的叶子`);
    if (offenders.length === 0) ok(`${String(LEAVES.length)} 份叶子模块仍无内部依赖（ucaps 能跟着字符串族一起搬）`);
  });

  it("③ barrel 仍走 export * 而不是具名清单", () => {
    const text = readFileSync(join(SRC, "runtime/index.ts"), "utf8");
    const star = (text.match(/^export \* from /gm) ?? []).length;
    if (star === 0) bad("runtime/index.ts 不再 export * 任何模块，产物公共面会凭空缩水");
    else ok(`barrel 仍再导出 ${String(star)} 个模块（新文件必须挂进来，否则 emit-contract 会红）`);
  });
});
