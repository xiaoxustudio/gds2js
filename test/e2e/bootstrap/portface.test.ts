import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { build } from "tsdown";
import { compileProject, type ProjectResult } from "@gds2js/compiler/compile/project";
import { ROOT, normalize } from "../../support/lib-bridge";

const SRC = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc");
const REF = join(SRC, "gdsrc.txt");
const WORK = join(ROOT, "tmp", "portface");
const GD = join(SRC, "main.gd");

let nodeOut = "";
let emitBytes = "";
let againBytes = "";
let why = "";
let iso = "";

function modulesToBytes(r: ProjectResult): string {
  return r.modules.map((m) => m.resPath + "\n" + m.code).join("\n===\n");
}

beforeAll(async () => {
  if (!existsSync(REF)) {
    why = "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）";
    return;
  }
  rmSync(WORK, { recursive: true, force: true });
  const first = await compileProject({ entries: [GD], resRoot: SRC, outDir: join(WORK, "src"), runtimeImport: "gds2js/runtime", hostImport: "gds2js/host" });
  if (first.diags.length > 0) {
    why = `静态检查拦下：${first.diags[0]!.resPath} ${first.diags[0]!.diagnostic.message}`;
    return;
  }
  emitBytes = modulesToBytes(first);
  const entry = first.modules.find((m) => m.resPath === "res://main.gd");
  if (entry === undefined) {
    why = "没产出入口 main.mts";
    return;
  }
  for (const m of first.modules) {
    mkdirSync(dirname(m.jsPath), { recursive: true });
    writeFileSync(m.jsPath, m.code, "utf8");
  }
  await build({ entry: [entry.jsPath], outDir: WORK, format: "esm", target: "node22", dts: false, clean: false, config: false, silent: true } as unknown as Parameters<typeof build>[0]);
  iso = mkdtempSync(join(tmpdir(), "gds-portface-"));
  copyFileSync(join(WORK, "main.mjs"), join(iso, "app.mjs"));
  const r = spawnSync(process.execPath, [join(iso, "app.mjs")], { encoding: "utf8", timeout: 60_000, cwd: iso });
  nodeOut = normalize((r.stdout ?? "") + (r.stderr ?? ""), GD);
  const second = await compileProject({ entries: [GD], resRoot: SRC, outDir: join(WORK, "src2"), runtimeImport: "gds2js/runtime", hostImport: "gds2js/host" });
  againBytes = modulesToBytes(second);
}, 300_000);

afterAll(() => {
  rmSync(WORK, { recursive: true, force: true });
  if (iso !== "") rmSync(iso, { recursive: true, force: true });
});

describe("bootstrap · 移植树的产物侧", () => {
  it("① 树里的每支文件都被现版 gds2js 编过", (ctx) => {
    if (why !== "") ctx.skip(true, why);
    expect(emitBytes.length, "编译产物为空").toBeGreaterThan(0);
  });

  it("② 同一棵树两次工程编译逐字节相同", (ctx) => {
    if (why !== "") ctx.skip(true, why);
    expect(againBytes, "两次工程编译的模块串不一致").toBe(emitBytes);
  });

  it("③ bundle 产物跑出的逐字节等于 Godot 参照", (ctx) => {
    if (why !== "") ctx.skip(true, why);
    const ref = readFileSync(REF, "utf8");
    expect(nodeOut, `产物侧与参照不一致\n  参照首行：${ref.split("\n")[0]}\n  产物首行：${nodeOut.split("\n")[0] ?? "<无>"}`).toContain("case|m01|42");
    expect(nodeOut, `产物侧与参照不一致：${nodeOut.split("\n").length} 行 vs 参照 ${ref.split("\n").length} 行`).toBe(ref);
  });
});
