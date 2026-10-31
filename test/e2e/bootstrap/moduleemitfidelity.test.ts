import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { analyze } from "@gds2js/compiler/analyze";
import { emitModuleWithMap, type EmitOptions } from "../../../packages/compiler/src/emit/index";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string>();
for (const l of lines.filter((x) => x.startsWith("me|"))) {
  const parts = l.split("|");
  gd.set(parts[1]!, parts.slice(2).join("|"));
}

const JOBS: Array<{ src: string; opts: EmitOptions }> = [
  {
    src: 'signal hit(x: int)\nconst K = 2\nenum E { A, B }\nclass Inner extends RefCounted:\n\tvar q = 1\n\tfunc ping() -> int:\n\t\treturn q + 1\nvar count: int = 0\nvar label = "x"\nstatic func twice(a: int) -> int:\n\treturn a * 2\nfunc _init():\n\tcount = 1\nfunc go(a: int) -> int:\n\treturn a + K\n',
    opts: { runtimeImport: "./rt.mjs", hostImport: null, className: "Main", sourceFile: "main.gd" },
  },
  {
    src: "var hp: int = 10\nfunc _ready():\n\tprint(hp)\n",
    opts: {
      runtimeImport: "./rt.mjs",
      hostImport: null,
      baseClass: { kind: "engine", name: "Node" },
      scene: { rootName: "Main", rootCls: "Node", children: [] },
      autoRun: true,
      sourcemap: true,
      sourceFile: "main.gd",
      jsFile: "Main.mjs",
      projectName: "demo",
      resPath: "C:/proj/main.gd",
      exportInner: true,
    },
  },
];

describe("bootstrap · 整模块发射与 TypeScript 逐字节对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(gd.size).toBe(JOBS.length);
  });

  for (let i = 0; i < JOBS.length; i++) {
    it(`② emitModule ${String(i)}`, async () => {
      const job = JOBS[i]!;
      const mod = lower(await parseSource(job.src));
      const analysisResult = analyze(mod, new Set<string>(), undefined, false);
      const res = emitModuleWithMap(mod, job.opts, analysisResult);
      expect(JSON.parse(gd.get(String(i))!)).toEqual(res);
    });
  }
});
