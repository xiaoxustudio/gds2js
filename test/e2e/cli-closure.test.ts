/**
 * 单文件闭包门（S455）：入口用 `extends "<路径>"` 挂父脚本时，`check` / `run` / `build` 三条路要**读依赖**，
 * 出货与引擎同一份字（`C1|25 7` —— 引擎侧的读数与夹具在 `tmp/probe-chain/`：父脚本 `extends SceneTree` 带 `helper()`）。
 *
 * 不用 Godot 也不用 scriptc，只用 node + dist 产物；缺 dist 时按仓库口径 skip（先 `pnpm build`）。
 * 闭包 × 打包那一组合还没做，第四格钉的是**准确拒**（`[closure-pack]`）—— 不是静默出错。
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hasDist } from "../support/env";
import { ROOT } from "../support/lib-bridge";

const DIR = join(ROOT, "tmp", "closure-check");
const MAIN = join(DIR, "main.gd");
const CLI = join(ROOT, "packages", "gds2js", "dist", "cli.mjs");

const PARENT = `extends SceneTree

func helper() -> int:
	return 25

func _initialize():
	pass
`;

const ENTRY = `extends "res://sub.gd"

func _initialize():
	print("C1|", helper(), " ", extra())
	quit()

func extra() -> int:
	return 7
`;

function cli(args: string[]): { code: number | null; out: string } {
  const r = spawnSync(process.execPath, [CLI, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    windowsHide: true,
    timeout: 120_000,
  });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

describe.skipIf(!hasDist)("单文件闭包门 · extends 父脚本", () => {

  beforeAll(() => {
    rmSync(DIR, { recursive: true, force: true });
    mkdirSync(DIR, { recursive: true });
    writeFileSync(join(DIR, "sub.gd"), PARENT, "utf8");
    writeFileSync(MAIN, ENTRY, "utf8");
  });

  afterAll(() => {
    rmSync(DIR, { recursive: true, force: true });
  });

  it("check 读依赖并通过，报出闭包里的脚本数", () => {
    const r = cli(["check", MAIN]);
    expect(r.code, r.out).toBe(0);
    expect(r.out).toContain("静态检查通过（含 2 份依赖脚本）");
  });

  it("run 跑闭包：继承来的方法判得出，输出与引擎同字", () => {
    const r = cli(["run", MAIN]);
    expect(r.code, r.out).toBe(0);
    expect(r.out).toContain("C1|25 7");
  });

  it("build 产出小树，入口那份 node 直跑同字", () => {
    const out = join(DIR, "out", "renamed.mts");
    const r = cli(["build", MAIN, "-o", out]);
    expect(r.code, r.out).toBe(0);
    expect(existsSync(out)).toBe(true);
    expect(existsSync(join(DIR, "out", "sub.mts"))).toBe(true);
    const run = spawnSync(process.execPath, [out], { cwd: ROOT, encoding: "utf8", windowsHide: true, timeout: 60_000 });
    expect(run.status, run.stderr).toBe(0);
    expect(run.stdout).toContain("C1|25 7");
    expect(readFileSync(out, "utf8")).toContain("./sub.mts");
  });

  it("闭包 × 打包那一面给准确拒，不静默", () => {
    const r = cli(["build", MAIN, "-o", join(DIR, "out", "local.mts"), "--runtime-mode", "local"]);
    expect(r.code).not.toBe(0);
    expect(r.out).toContain("[closure-pack]");
  });
});
