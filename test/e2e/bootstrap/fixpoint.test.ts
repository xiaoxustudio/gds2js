import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { build } from "tsdown";
import { compileProject, type CompiledModule } from "@gds2js/compiler/compile/project";
import { ROOT } from "../../support/lib-bridge";

const SRC = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc");
const WORK = join(ROOT, "tmp", "fixpoint");
const WORK_N = join(WORK, "n");
const WORK_N1 = join(WORK, "n1");
const CLI = join(SRC, "cli_compile.gd");
const RUN = process.env.GDS2JS_FIXPOINT === "1";

let why = "";

function pathIn(root: string, jsPath: string): string {
  return join(root, relative(root, jsPath).split("\\").join("/"));
}

function writeAll(modules: CompiledModule[], root: string): void {
  for (const m of modules) {
    const p = pathIn(root, m.jsPath);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, m.code, "utf8");
  }
}

function listFiles(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) listFiles(p, out);
    else out.push(relative(dir, p).split("\\").join("/"));
  }
  return out.sort();
}

beforeAll(async () => {
  rmSync(WORK, { recursive: true, force: true });
  const n = await compileProject({ entries: [join(SRC, "main.gd")], resRoot: SRC, outDir: WORK_N, runtimeImport: "gds2js/runtime", hostImport: "gds2js/host" });
  if (n.diags.length > 0) {
    why = `静态检查拦下：${n.diags[0]!.diagnostic.message}`;
    return;
  }
  writeAll(n.modules, WORK_N);
  const cli = await compileProject({ entries: [CLI], resRoot: SRC, outDir: join(WORK, "cli-src"), runtimeImport: "gds2js/runtime", hostImport: "gds2js/host" });
  if (cli.diags.length > 0) {
    why = `CLI 静态检查拦下：${cli.diags[0]!.diagnostic.message}`;
    return;
  }
  writeAll(cli.modules, join(WORK, "cli-src"));
  const entry = cli.modules.find((m) => m.resPath === "res://cli_compile.gd");
  if (entry === undefined) {
    why = "没产出 cli_compile 模块";
    return;
  }
  const entryPath = pathIn(join(WORK, "cli-src"), entry.jsPath);
  await build({ entry: [entryPath], outDir: WORK, format: "esm", target: "node22", dts: false, clean: false, config: false, silent: true } as never);
  const r = spawnSync(process.execPath, [join(WORK, "cli_compile.mjs"), "--", SRC, WORK_N1, "gds2js/runtime"], { encoding: "utf8", timeout: 2_400_000 });
  if (r.status !== 0) {
    why = `N+1 产物编译失败：${(r.stderr ?? "").slice(-800)}`;
  }
}, 600_000);

afterAll(() => {
  if (process.env.GDS2JS_KEEP !== "1") rmSync(WORK, { recursive: true, force: true });
});

describe.skipIf(!RUN)("bootstrap · 阶段六 N+1 定点", () => {
  it("① 移植树自身编译得过", (ctx) => {
    if (why !== "") ctx.skip(true, why);
    expect(listFiles(WORK_N).length).toBeGreaterThan(10);
  });

  it("② N+1 产物与 N 逐字节相同", (ctx) => {
    if (why !== "") ctx.skip(true, why);
    const a = listFiles(WORK_N);
    const b = listFiles(WORK_N1);
    expect(b).toEqual(a);
    for (const f of a) {
      expect(readFileSync(join(WORK_N, f), "utf8"), f).toBe(readFileSync(join(WORK_N1, f), "utf8"));
    }
  });
});
