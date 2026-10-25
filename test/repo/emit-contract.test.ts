import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT } from "../../tools/lib.mjs";
import { FAST_NAMES, OPS_NAMES, RT_NAMES, V_NAMES } from "@gds2js/compiler/emit";
import * as rt from "@gds2js/runtime";

const emitDir = join(ROOT, "packages", "compiler", "src", "emit");
const tables: Record<string, string[]> = {
  "": [...RT_NAMES] as string[],
  fast: [...FAST_NAMES] as string[],
  ops: [...OPS_NAMES] as string[],
  V: [...V_NAMES] as string[],
};

const reads = readdirSync(emitDir)
  .filter((n) => n.endsWith(".ts") && n !== "surface.ts")
  .map((n) => [n, readFileSync(join(emitDir, n), "utf8")] as [string, string]);

describe("发射面契约门", () => {
  it("① 名表覆盖 emitter 源码写出的每个 rt.* 名字", () => {
    let misses = 0;
    for (const [name, text] of reads) {
      for (const m of text.matchAll(/rt\.(fast|ops|V|strOps)?\.?([A-Za-z_][A-Za-z0-9_]*)(\$\{[^}]*\})?(2?)\(/g)) {
        const face = m[1] ?? "";
        const base = m[2];
        if (base === undefined) continue;
        const dynamic = m[3] !== undefined || m[4] !== "";
        const list = tables[face === "strOps" ? "ops" : face] ?? [];
        const hit = dynamic ? list.some((n: string): boolean => n.startsWith(base)) : list.includes(base);
        if (!hit) {
          bad(`emit/${name} 写出 rt.${face === "" ? "" : face + "."}${base}，但名表里没有它`);
          misses++;
        }
      }
    }
    const flatCount = tables[""]?.length ?? 0;
    if (misses === 0) ok(`emit 源码的 rt.* 全部在册（平名 ${String(flatCount)}、fast ${String(tables["fast"]?.length ?? 0)}、ops ${String(tables["ops"]?.length ?? 0)}、V ${String(tables["V"]?.length ?? 0)}）`);
  });

  it("② 名表里的每个名字在 runtime 导出面上真的存在", () => {
    const surface = new Set(Object.keys(rt as Record<string, unknown>));
    const missing = (tables[""] ?? []).filter((n: string): boolean => !surface.has(n));
    for (const n of missing) bad(`rt.${n} 不在 runtime 导出面上`);
    if (missing.length === 0) ok(`名表的 ${String((tables[""] ?? []).length)} 个平名逐一命中 runtime 导出表`);
  });

  it("③ 名表是产物实际用量的超集", () => {
    const emitted = new Set<string>();
    for (const id of readdirSync(join(ROOT, "corpus", "cases"))) {
      let src: string;
      try {
        src = readFileSync(join(ROOT, "corpus", "cases", id, "main.gen.mts"), "utf8");
      } catch {
        continue;
      }
      for (const m of src.matchAll(/rt\.([A-Za-z_][A-Za-z0-9_]*)\(/g)) {
        if (!["fast", "ops", "V", "strOps"].includes(String(m[1]))) emitted.add(String(m[1]));
      }
    }
    const missing = [...emitted].filter((n: string): boolean => !(tables[""] ?? []).includes(n));
    for (const n of missing) bad(`产物写出了 rt.${n}，名表却没登记它`);
    if (missing.length === 0) ok(`产物的 ${String(emitted.size)} 个 rt.* 全部在册`);
  });
});
