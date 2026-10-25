import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT } from "../../tools/lib.mjs";

function walkTs(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walkTs(p, out);
    else if (entry.name.endsWith(".ts")) out.push(p);
  }
  return out;
}

const rel = (p: string): string => relative(ROOT, p).split("\\").join("/");
const packagesRoot = join(ROOT, "packages");
const shipped = ["runtime", "compiler", "gds2js"];

const srcTrees = readdirSync(packagesRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => ({ pkg: d.name, src: join(packagesRoot, d.name, "src") }))
  .filter((e) => existsSync(e.src))
  .map((e) => ({ pkg: e.pkg, files: walkTs(e.src) }));

describe("src 目录红线门（AGENTS.md 红线 3）", () => {
  it("① src/ 里没有测试文件", () => {
    const offenders = srcTrees.flatMap((e) => e.files).filter((f) => /\.test\.ts$|\.spec\.ts$/.test(f));
    for (const f of offenders) bad(`src/ 里有测试文件：${rel(f)}`);
    if (offenders.length === 0) ok(`${String(srcTrees.length)} 个包的 src/ 零测试文件`);
  });

  it("② 出货三包的 src/ 里不引 vitest 与 testkit", () => {
    const offenders: string[] = [];
    for (const e of srcTrees.filter((t) => shipped.includes(t.pkg))) {
      for (const f of e.files) {
        if (/from\s+"(?:vitest|@vitest\/[^"]*|@gds2js\/testkit)"/.test(readFileSync(f, "utf8"))) offenders.push(rel(f));
      }
    }
    for (const f of offenders) bad(`${f} 引了测试依赖（copyTreeTs 会把它扫进出货产物树）`);
    if (offenders.length === 0) ok(`${shipped.join("/")} 的 src/ 零测试依赖导入（testkit 自身除外：它不进产物树）`);
  });
});
