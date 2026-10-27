import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, posix } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT } from "../../tools/lib.mjs";

const SRC = join(ROOT, "packages", "runtime", "src");
const ENTRIES = ["runtime/index", "standalone", "product", "host", "host-node", "host-scriptc"];

const files: string[] = [];
function walk(dir: string): void {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "vendor") continue;
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".ts") && !name.endsWith(".d.ts")) files.push(p.slice(SRC.length + 1).split("\\").join("/").replace(/\.ts$/, ""));
  }
}
walk(SRC);

function deps(f: string): string[] {
  const text = readFileSync(join(SRC, f + ".ts"), "utf8");
  const out = new Set<string>();
  const add = (spec: string): void => {
    if (!spec.startsWith(".")) return;
    const id = posix.normalize(posix.join(posix.dirname(f), spec));
    if (files.includes(id)) out.add(id);
  };
  for (const m of text.matchAll(/\b(?:import|export)([\s\S]*?)from\s*"([^"]+)";/g)) add(m[2] ?? "");
  for (const m of text.matchAll(/^import\s*"([^"]+)";$/gm)) add(m[1] ?? "");
  return [...out];
}

const graph = new Map(files.map((f) => [f, deps(f)]));
const seen = new Set<string>();
const stack = [...ENTRIES];
while (stack.length > 0) {
  const n = stack.pop() as string;
  if (seen.has(n)) continue;
  seen.add(n);
  for (const d of graph.get(n) ?? []) stack.push(d);
}

describe("模块可达性门（拆出去的每一份 runtime 模块都必须挂在入口上）", () => {
  it("① 入口清单还在，且都算得出依赖", () => {
    const missing = ENTRIES.filter((e) => !files.includes(e));
    for (const m of missing) bad(`入口 ${m} 不在盘面上：runtime 的出货面从哪读？`);
    if (missing.length === 0) ok(`${ENTRIES.length} 份入口全在（barrel / standalone / product / host 三型）`);
  });

  it("② 每份模块都从入口可达，否则它的顶层注册就是静默丢", () => {
    const orphan = files.filter((f) => !seen.has(f));
    for (const o of orphan) {
      const effects = readFileSync(join(SRC, o + ".ts"), "utf8")
        .split("\n")
        .filter((l) => /^(register|set|Object\.|globalThis)/.test(l))
        .slice(0, 2);
      bad(`${o} 不可达${effects.length > 0 ? `，而它还有顶层副作用：${effects.join(" ; ")}` : ""} —— 拆文件要把新模块挂进 barrel 或入口，不然 hook 接线不会发生`);
    }
    if (orphan.length === 0) ok(`${String(seen.size)}/${String(files.length)} 份 runtime 模块从入口可达（.d.ts 除外）`);
  });
});
