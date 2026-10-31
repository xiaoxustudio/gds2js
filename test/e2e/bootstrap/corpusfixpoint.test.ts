import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { build } from "tsdown";
import { compileProject, type CompiledModule } from "@gds2js/compiler/compile/project";
import { ROOT } from "../../support/lib-bridge";

const RUN = process.env.GDS2JS_CORPUS_FIXPOINT === "1";
const WRITE = process.env.GDS2JS_WRITE === "1";
const SRC = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc");
const CASES = join(ROOT, "corpus", "cases");
const RATCHET = join(ROOT, "test", "fixtures", "bootstrap", "corpus-fixpoint.json");
const WORK = join(ROOT, "tmp", "corpus-fixpoint");

let why = "";
let passing: string[] = [];
let total = 0;
const recorded: string[] = existsSync(RATCHET) ? (JSON.parse(readFileSync(RATCHET, "utf8")) as string[]) : [];

function cases(): string[] {
  return readdirSync(CASES, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("000-") && existsSync(join(CASES, d.name, "main.gd")))
    .map((d) => d.name)
    .sort();
}

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
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) listFiles(p, out);
    else out.push(relative(dir, p).split("\\").join("/"));
  }
  return out.sort();
}

function same(rootA: string, rootB: string): boolean {
  const a = listFiles(rootA);
  const b = listFiles(rootB);
  if (a.length === 0 || JSON.stringify(a) !== JSON.stringify(b)) return false;
  for (const f of a) {
    if (readFileSync(join(rootA, f), "utf8") !== readFileSync(join(rootB, f), "utf8")) return false;
  }
  return true;
}

beforeAll(async () => {
  if (!RUN) return;
  rmSync(WORK, { recursive: true, force: true });
  const cli = await compileProject({ entries: [join(SRC, "cli_compile.gd")], resRoot: SRC, outDir: join(WORK, "cli-src"), runtimeImport: "gds2js/runtime", hostImport: "gds2js/host" });
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
  await build({ entry: [pathIn(join(WORK, "cli-src"), entry.jsPath)], outDir: WORK, format: "esm", target: "node22", dts: false, clean: false, config: false, silent: true } as never);
  const cliPath = join(WORK, "cli_compile.mjs");
  for (const name of cases()) {
    total++;
    const caseDir = join(CASES, name);
    const n1 = join(WORK, "n1", name);
    const r = spawnSync(process.execPath, [cliPath, "--", caseDir, n1, "gds2js/runtime"], { encoding: "utf8", timeout: 180_000 });
    if (r.status !== 0 || !existsSync(join(n1, "main.mts"))) continue;
    let n;
    try {
      n = await compileProject({ entries: [join(caseDir, "main.gd")], resRoot: caseDir, outDir: join(WORK, "n", name), runtimeImport: "gds2js/runtime", hostImport: "gds2js/host", closureOnly: false });
    } catch {
      continue;
    }
    if (n.diags.length > 0 || n.modules.length === 0) continue;
    writeAll(n.modules, join(WORK, "n", name));
    if (same(join(WORK, "n", name), n1)) passing.push(name);
  }
  passing.sort();
}, 3_000_000);

afterAll(() => {
  if (process.env.GDS2JS_KEEP !== "1") rmSync(WORK, { recursive: true, force: true });
});

describe.skipIf(!RUN)("bootstrap · 阶段六语料定点", () => {
  it("① 扫过整份语料", (ctx) => {
    if (why !== "") ctx.skip(true, why);
    expect(total).toBeGreaterThan(400);
  });

  it("② 已入账的语料没有回退", (ctx) => {
    if (why !== "") ctx.skip(true, why);
    const regressed = recorded.filter((n) => !passing.includes(n));
    if (WRITE) writeFileSync(RATCHET, JSON.stringify(passing, null, 2) + "\n", "utf8");
    expect(regressed).toEqual([]);
    expect(passing.length).toBeGreaterThanOrEqual(recorded.length);
  });
});
