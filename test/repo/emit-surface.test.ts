import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import * as rt from "@gds2js/runtime";
import { ROOT } from "../support/lib-bridge";

const CASES = join(ROOT, "corpus", "cases");
const NAMESPACES = ["ops", "fast", "V"] as const;

function scan(): Map<string, string> {
  const found = new Map<string, string>();
  for (const id of readdirSync(CASES).sort()) {
    const file = join(CASES, id, "main.gen.mts");
    if (!existsSync(file)) continue;
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/rt\.([A-Za-z_]\w*)\(/g)) {
      const name = m[1];
      if (name === undefined) continue;
      if (!found.has(name)) found.set(name, `${id}/main.gen.mts`);
    }
    for (const m of src.matchAll(/rt\.(ops|fast|V)\.([A-Za-z_]\w*)\(/g)) {
      const ns = m[1];
      const name = m[2];
      if (ns === undefined || name === undefined) continue;
      const key = `${ns}.${name}`;
      if (!found.has(key)) found.set(key, `${id}/main.gen.mts`);
    }
  }
  return found;
}

function surfaceKeys(ns: string): Set<string> {
  const box = (rt as Record<string, unknown>)[ns];
  return new Set(Object.keys(box as Record<string, unknown>));
}

it("产物里每个 rt.<名>() 都在 runtime 导出表上", () => {
  const names = scan();
  expect(names.size, "corpus/cases 里一份 main.gen.mts 都没有（先跑 pnpm test:compile）").toBeGreaterThan(0);
  const flat = new Set(Object.keys(rt));
  const nsTables = new Map<string, Set<string>>(NAMESPACES.map((ns) => [ns, surfaceKeys(ns)]));
  const missing: string[] = [];
  for (const [name, at] of names) {
    const dot = name.indexOf(".");
    if (dot < 0) {
      if (!flat.has(name)) missing.push(`${name} ← ${at}`);
      continue;
    }
    const ns = name.slice(0, dot);
    if (!nsTables.get(ns)?.has(name.slice(dot + 1))) missing.push(`${name} ← ${at}`);
  }
  expect(missing.join("\n"), `对过 ${names.size} 个名（裸调用 + ops / fast / V 三张表）`).toBe("");
});
