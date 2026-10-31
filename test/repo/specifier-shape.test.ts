import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT } from "../../tools/lib.mjs";

function tsUnder(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) tsUnder(p, out);
    else if (name.endsWith(".ts")) out.push(p);
  }
  return out;
}

const srcFiles = ["runtime", "compiler", "gds2js"].flatMap((pkg) => tsUnder(join(ROOT, "packages", pkg, "src")));

describe("跨包说明符形状门", () => {
  it("① src/ 里的 @gds2js/* 一律带子路径", () => {
    const offenders: string[] = [];
    for (const f of srcFiles) {
      const text = readFileSync(f, "utf8");
      text.split("\n").forEach((line, i) => {
        if (/from\s+"@gds2js\/(runtime|compiler|testkit)"/.test(line)) offenders.push(`${f.slice(ROOT.length + 1)}:${String(i + 1)}`);
      });
    }
    for (const o of offenders) bad(`${o} 用了裸包名说明符`);
    if (offenders.length === 0) ok(`${String(srcFiles.length)} 份 src 文件的跨包说明符全部带子路径`);
  });

  it("② 带子路径的说明符必须落得进 packages/<pkg>/src", () => {
    const bads: string[] = [];
    for (const f of srcFiles) {
      const text = readFileSync(f, "utf8");
      for (const m of text.matchAll(/from\s+"@gds2js\/(runtime|compiler)\/([^"]+)"/g)) {
        const pkg = m[1];
        const rest = m[2];
        if (pkg === undefined || rest === undefined) continue;
        const root = join(ROOT, "packages", pkg, "src");
        const hit = [join(root, rest + ".ts"), join(root, rest, "index.ts")].some((p) => {
          try {
            return statSync(p).isFile();
          } catch {
            return false;
          }
        });
        if (!hit) bads.push(`${pkg}/${rest}`);
      }
    }
    const unique = [...new Set(bads)];
    for (const u of unique) bad(`说明符 @gds2js/${u} 解析不到文件，原生铺树会当场失败`);
    if (unique.length === 0) ok("每个 @gds2js/<pkg>/<子路径> 都能按 cli-native 的解析规则落到文件");
  });

  it("③ 每支包的 exports 目标都在盘面", () => {
    const missing: string[] = [];
    for (const pkg of ["runtime", "compiler", "testkit", "gds2js"]) {
      const dir = join(ROOT, "packages", pkg);
      const map = (JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).exports ?? {}) as Record<string, string>;
      for (const [key, value] of Object.entries(map)) {
        if (typeof value !== "string" || value.includes("*")) continue;
        if (!existsSync(join(dir, value))) missing.push(`${pkg}:${key} -> ${value}`);
      }
    }
    for (const m of missing) bad(`${m} 落不到文件，产物轨与 node 轨都会当场解析失败`);
    if (missing.length === 0) ok("四份包的 exports 目标全部在盘面");
  });
});
