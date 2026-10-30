import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { build } from "tsdown";
import { compileProject } from "@gds2js/compiler/compile/project";
import { GODOT_BIN, ROOT, normalize } from "../../support/lib-bridge";
import { hasGodot, missing } from "../../support/env";

const SRC = join(ROOT, "test", "fixtures", "bootstrap", "procface");
const GD = join(SRC, "main.gd");
const WORK = join(ROOT, "tmp", "procface-bundle");
const USER_ARGS = ["alpha", "beta gamma", "--flag=1"];
const ENV = { ...process.env, GDS2JS_PROBE_VAR: "probe-value", GDS2JS_PROBE_OTHER: "" };

let godotOut = "";
let nodeOut = "";
let why = "";
let iso = "";

function runGodotSide(): string {
  const r = spawnSync(GODOT_BIN, ["--headless", "--script", GD, "--", ...USER_ARGS], { encoding: "utf8", timeout: 60_000, windowsHide: true, env: ENV, cwd: SRC });
  return normalize((r.stdout ?? "") + (r.stderr ?? ""), GD);
}

beforeAll(async () => {
  if (!hasGodot) {
    why = missing("GODOT_BIN 指到的 Godot 4.6.3");
    return;
  }
  rmSync(WORK, { recursive: true, force: true });
  const result = await compileProject({ entries: [GD], resRoot: SRC, outDir: join(WORK, "src"), runtimeImport: "gds2js/runtime", hostImport: "gds2js/host" });
  if (result.diags.length > 0) {
    why = `静态检查拦下：${result.diags[0]!.diagnostic.message}`;
    return;
  }
  const entry = result.modules.find((m) => m.resPath === "res://main.gd");
  if (entry === undefined) {
    why = "没产出入口 main.mts";
    return;
  }
  for (const m of result.modules) {
    mkdirSync(dirname(m.jsPath), { recursive: true });
    writeFileSync(m.jsPath, m.code, "utf8");
  }
  await build({ entry: [join(WORK, "src", "main.mts")], outDir: WORK, format: "esm", target: "node22", dts: false, clean: false, config: false, silent: true } as unknown as Parameters<typeof build>[0]);
  iso = mkdtempSync(join(tmpdir(), "gds-procface-"));
  copyFileSync(join(WORK, "main.mjs"), join(iso, "app.mjs"));
  const r = spawnSync(process.execPath, [join(iso, "app.mjs"), "compile", "--", ...USER_ARGS], { encoding: "utf8", timeout: 60_000, env: ENV, cwd: iso });
  nodeOut = (r.stdout ?? "") + (r.stderr ?? "");
  godotOut = runGodotSide();
});

afterAll(() => {
  rmSync(WORK, { recursive: true, force: true });
  if (iso !== "") rmSync(iso, { recursive: true, force: true });
});

describe("bootstrap · 同一份 GDScript 的两种宿主进程面", () => {
  it("① 裁判引擎在场", (ctx) => {
    if (why !== "") ctx.skip(true, why);
    expect(hasGodot, "缺 GODOT_BIN").toBe(true);
  });

  it("② user args 与环境变量两侧逐字节相同", (ctx) => {
    if (why !== "") ctx.skip(true, why);
    expect(nodeOut, `node 侧没跑出一行\n${nodeOut}`).not.toBe("");
    expect(nodeOut, "node 侧少了带 --flag=1 的那一格").toContain("--flag=1");
    expect(nodeOut, "node 侧的 user args 不是只有 -- 之后那一段").not.toContain("compile");
    expect(nodeOut, `两侧输出不一致\n  godot: ${JSON.stringify(godotOut)}\n  node : ${JSON.stringify(nodeOut)}`).toBe(godotOut);
  });

  it("③ 读数逐格对得上", (ctx) => {
    if (why !== "") ctx.skip(true, why);
    const cells = new Map(godotOut.split("\n").filter((l) => l !== "").map((l) => [l.slice(0, 1), l]));
    expect(cells.get("n") ?? "", "user args 是三支").toBe("n|3");
    expect(cells.get("e") ?? "", "取到实参环境变量").toBe("e|probe-value");
    expect(cells.get("h") ?? "", "空值与没设分得开").toBe("h|true|false");
    expect(cells.get("m") ?? "", "没设的那一格回空串").toBe("m|true");
    expect(cells.get("t") ?? "", "首支实参可按下标取").toBe("t|true");
  });
});
