import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT } from "../../tools/lib.mjs";

const irCache = join(ROOT, "packages", "compiler", "src", "compile", "ir-cache.ts");
const source = readFileSync(irCache, "utf8");
const list = /const STAMP_SOURCES = \[([^\]]*)\]/.exec(source)?.[1] ?? "";
const rels = [...list.matchAll(/"([^"]+)"/g)].map((m) => m[1]).filter((s): s is string => s !== undefined);

describe("IR 缓存戳清单门", () => {
  it("① STAMP_SOURCES 非空", () => {
    if (rels.length > 0) ok(`清单 ${String(rels.length)} 项`);
    else bad("ir-cache.ts 的 STAMP_SOURCES 解析不出条目（改名或挪动会让缓存戳静默失效）");
  });

  it("② 每一项都指得到文件", () => {
    const missing = rels.filter((r) => !existsSync(resolve(dirname(irCache), r)));
    for (const r of missing) bad(`STAMP_SOURCES 里的 ${r} 不在盘面`);
    if (missing.length === 0) ok(`${String(rels.length)} 项全部在盘面`);
  });

  it("③ lower 直接 import 的同包模块都在清单里", () => {
    const lower = readFileSync(join(ROOT, "packages", "compiler", "src", "lower", "lower.ts"), "utf8");
    const deps = [...lower.matchAll(/from\s+"(\.\/[^"]+)"/g)]
      .map((m) => m[1])
      .filter((s): s is string => s !== undefined)
      .map((s) => "../lower/" + s.slice(2) + ".ts");
    const uncovered = deps.filter((d) => !rels.includes(d));
    for (const d of uncovered) bad(`lower.ts 依赖 ${d}，但缓存戳没算它 —— 改这份表不会让 IR 缓存失效`);
    if (uncovered.length === 0) ok(`lower.ts 的同包依赖全部进了缓存戳（${String(deps.length)} 项）`);
  });
});
