import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { compileProject } from "../../../packages/compiler/src/compile/project";
import { normalize } from "../../../tools/lib.mjs";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const MAIN = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "main.gd");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string>();
for (const l of lines.filter((x) => x.startsWith("pj|"))) {
  const parts = l.split("|");
  gd.set(parts[1]!, parts.slice(2).join("|"));
}

const CASE = join(ROOT, "corpus", "cases", "487-preload-cross-file");

const OPTS = {
  entries: [join(CASE, "main.gd")],
  resRoot: CASE,
  outDir: "C:/out",
  closureOnly: true,
  runtimeImport: "./rt.mjs",
  hostImport: null,
  autoRun: true,
  runtimeMode: "import" as const,
  sceneFile: null,
};

describe("bootstrap · 工程编译与 TypeScript 逐字节对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(gd.size).toBe(1);
  });

  it("② compileProject 487-preload-cross-file", async () => {
    const slash = (r: { modules: Array<{ jsPath: string }> }): unknown => {
      for (const m of r.modules) m.jsPath = m.jsPath.split("\\").join("/");
      return r;
    };
    const gdRes = slash(JSON.parse(normalize(gd.get("0")!, MAIN)));
    const res = await compileProject(OPTS);
    const tsRes = slash(JSON.parse(normalize(JSON.stringify(res), MAIN)));
    expect(gdRes).toEqual(tsRes);
  });
});
