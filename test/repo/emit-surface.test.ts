/**
 * 发射面 ↔ runtime 导出表对账门（§2 的 0c 那笔里「自动对账」那半条）。
 *   产物里每个 `rt.<名>(` 都必须落在 runtime 的公开导出表上 —— 名字对不上就是
 *   「编译期放过、运行期撞 undefined」那一族，语料门未必走到那一行。
 *
 * `rt.ops.*` / `rt.fast.*` / `rt.V.*` 这类带点的走的是各自的表，不在这一趟里。
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import * as rt from "@gds2js/runtime";
import { ROOT } from "../support/lib-bridge";

const CASES = join(ROOT, "corpus", "cases");

function emittedNames(): Map<string, string> {
  const found = new Map<string, string>();
  for (const id of readdirSync(CASES).sort()) {
    const file = join(CASES, id, "main.gen.mts");
    if (!existsSync(file)) continue;
    for (const m of readFileSync(file, "utf8").matchAll(/rt\.([A-Za-z_]\w*)\(/g)) {
      const name = m[1];
      if (name === undefined) continue;
      if (!found.has(name)) found.set(name, `${id}/main.gen.mts`);
    }
  }
  return found;
}

it("产物里每个 rt.<名>() 都在 runtime 导出表上", () => {
  const names = emittedNames();
  expect(names.size, "corpus/cases 里一份 main.gen.mts 都没有（先跑 pnpm test:compile）").toBeGreaterThan(0);
  const surface = new Set(Object.keys(rt));
  const missing = [...names].filter(([name]) => !surface.has(name));
  expect(missing.map(([name, at]) => `${name} ← ${at}`).join("\n"), `对过 ${names.size} 个名`).toBe("");
});
