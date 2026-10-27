import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { GODOT_PIN, ROOT, listCases } from "../../tools/lib.mjs";

function walkUnder(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== "node_modules" && name !== "dist") walkUnder(p, out);
    } else out.push(p);
  }
  return out;
}

describe("文档计数门（AGENTS.md 的读数必须跟着盘面走）", () => {
  it("① 语料用例数", () => {
    const actual = listCases("").length;
    const m = /语料用例\s+(\d+)\s+例/.exec(readFileSync(join(ROOT, "AGENTS.md"), "utf8"));
    if (m === null) bad("AGENTS.md 的语料读数没写成「语料用例 N 例」（探头另计）");
    else if (Number(m[1]) === actual) ok(`AGENTS.md 语料读数 = ${String(actual)} 例`);
    else bad(`AGENTS.md 写 ${m[1]} 例，corpus/cases 实为 ${String(actual)} 例（不含 000-* 探头）`);
  });

  it("② 探头用例走排除口径", () => {
    const probes = listCases("000-");
    const all = new Set<string>(probes);
    if (probes.length > 0 && listCases("").every((n) => !all.has(n))) ok(`探头 ${String(probes.length)} 支不进语料：${probes.join(", ")}`);
    else bad("listCases 的 000- 探头排除口径断了");
  });

  it("③ 裁判版本只有一个字面量，文档与生成器都跟着它走", () => {
    const hits: string[] = [];
    for (const dir of ["tools", "docs", "test", "packages"]) {
      for (const f of walkUnder(join(ROOT, dir))) {
        if (!/\.(ts|mjs|mts|md)$/.test(f)) continue;
        const text = readFileSync(f, "utf8");
        for (const m of text.matchAll(/Godot (\d+\.\d+\.\d+)/g)) {
          if (m[1] !== GODOT_PIN) hits.push(`${f.replace(ROOT, ".")}: Godot ${m[1]}`);
        }
      }
    }
    for (const root of ["AGENTS.md", "README.md"]) {
      if (!existsSync(join(ROOT, root))) continue;
      for (const m of readFileSync(join(ROOT, root), "utf8").matchAll(/Godot (\d+\.\d+\.\d+)/g)) {
        if (m[1] !== GODOT_PIN) hits.push(`${root}: Godot ${m[1]}`);
      }
    }
    for (const h of hits) bad(`${h} 与钉住的裁判版本 ${GODOT_PIN} 不一致：bump 要连文档、生成器头部与探头一起搬`);
    if (hits.length === 0) ok(`全树「Godot x.y.z」字面量都等于 GODOT_PIN=${GODOT_PIN}`);
  });
});
