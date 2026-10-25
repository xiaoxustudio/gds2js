import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hasDist, seaCapableNode } from "../support/env";
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

function node(file: string): { code: number | null; out: string } {
  const r = spawnSync(process.execPath, [file], { cwd: ROOT, encoding: "utf8", windowsHide: true, timeout: 60_000 });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

describe.skipIf(!hasDist)("单文件闭包门 · extends 父脚本", () => {
  beforeAll(() => {
    rmSync(DIR, { recursive: true, force: true });
    mkdirSync(DIR, { recursive: true });
    writeFileSync(join(DIR, "sub.gd"), PARENT, "utf8");
    writeFileSync(MAIN, ENTRY, "utf8");
    mkdirSync(join(DIR, "above"), { recursive: true });
    writeFileSync(join(DIR, "above", "main.gd"), 'extends "../sub.gd"\n\nfunc _initialize():\n\tprint("A|", helper())\n\tquit()\n', "utf8");
    writeFileSync(join(DIR, "lib.gd"), "class_name Lib\n\nfunc f() -> int:\n\treturn 41\n", "utf8");
    writeFileSync(join(DIR, "pre-const.gd"), 'extends SceneTree\n\nconst L = preload("res://lib.gd")\n\nfunc _initialize():\n\tprint("P1|", L.new().f())\n\tquit()\n', "utf8");
    writeFileSync(join(DIR, "pre-load.gd"), 'extends SceneTree\n\nfunc _initialize():\n\tvar L = load("res://lib.gd")\n\tprint("P2|", L.new().f())\n\tquit()\n', "utf8");
    mkdirSync(join(DIR, "lib"), { recursive: true });
    mkdirSync(join(DIR, "nest"), { recursive: true });
    writeFileSync(join(DIR, "lib", "base.gd"), PARENT, "utf8");
    writeFileSync(join(DIR, "nest", "main.gd"), ENTRY.replace("res://sub.gd", "res://lib/base.gd").replace("C1|", "RR|"), "utf8");
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
    const run = node(out);
    expect(run.code, run.out).toBe(0);
    expect(run.out).toContain("C1|25 7");
    expect(readFileSync(out, "utf8")).toContain("./sub.mts");
  });

  it("build --runtime-mode local：旁挂一份 standalone，小树各自按深度 require 它", () => {
    const out = join(DIR, "out", "local.mts");
    const r = cli(["build", MAIN, "-o", out, "--runtime-mode", "local"]);
    expect(r.code, r.out).toBe(0);
    expect(existsSync(join(DIR, "out", "gds2js-standalone.cjs"))).toBe(true);
    const src = readFileSync(out, "utf8");
    expect(src).toContain("./gds2js-standalone.cjs");
    expect(src).not.toContain("gds2js/runtime");
    const run = node(out);
    expect(run.code, run.out).toBe(0);
    expect(run.out).toContain("C1|25 7");
  });

  it("build --runtime-mode single：压成一个文件，零 import 还能直跑", () => {
    const out = join(DIR, "out", "single.mts");
    const r = cli(["build", MAIN, "-o", out, "--runtime-mode", "single"]);
    expect(r.code, r.out).toBe(0);
    const src = readFileSync(out, "utf8");
    expect(src).not.toContain('from "./sub.mts"');
    expect(src).not.toContain("gds2js/runtime");
    const run = node(out);
    expect(run.code, run.out).toBe(0);
    expect(run.out).toContain("C1|25 7");
  });

  it("run --runtime-mode single：同一张闭包图压成单文件再跑，输出同字", () => {
    const r = cli(["run", MAIN, "--runtime-mode", "single"]);
    expect(r.code, r.out).toBe(0);
    expect(r.out).toContain("C1|25 7");
  });

  it.skipIf(seaCapableNode() === null)("export 读依赖出货：exe 里继承来的方法判得出", () => {
    const exe = join(DIR, "out", "closure.exe");
    const r = cli(["export", MAIN, "-o", exe, "--pack", "node"]);
    expect(r.code, r.out).toBe(0);
    expect(existsSync(exe)).toBe(true);
    const run = spawnSync(exe, [], { cwd: ROOT, encoding: "utf8", windowsHide: true, timeout: 60_000 });
    expect(run.status, run.stderr).toBe(0);
    expect(run.stdout).toContain("C1|25 7");
  });

  it("依赖爬出闭包根给准确拒，不静默绑到根内同名格", () => {
    const r = cli(["run", join(DIR, "above", "main.gd")]);
    expect(r.code).not.toBe(0);
    expect(r.out).toContain("[closure-root]");
  });

  it("preload 的常量格走闭包：脚本类当值、.new() 出来的实例调继承侧方法", () => {
    const r = cli(["run", join(DIR, "pre-const.gd")]);
    expect(r.code, r.out).toBe(0);
    expect(r.out).toContain("P1|41");
  });

  it("load 的那一格同样走闭包（判据要与 compileProject 的收集环一格不差）", () => {
    const r = cli(["run", join(DIR, "pre-load.gd")]);
    expect(r.code, r.out).toBe(0);
    expect(r.out).toContain("P2|41");
  });

  it("--res-root 点名根：入口在下层、父脚本按 res:// 挂在别层也接得住", () => {
    const r = cli(["run", join(DIR, "nest", "main.gd"), "--res-root", DIR]);
    expect(r.code, r.out).toBe(0);
    expect(r.out).toContain("RR|25 7");
  });

  it("--res-root 也是 [closure-root] 那一形的退路：往上爬出的父脚本点名根就判得出", () => {
    const r = cli(["run", join(DIR, "above", "main.gd"), "--res-root", DIR]);
    expect(r.code, r.out).toBe(0);
    expect(r.out).toContain("A|25");
  });

  it("入口在下层又按 `-o` 改名：相对说明符跟着新深度重算，产物照跑", () => {
    const out = join(DIR, "out-nest", "rr.mts");
    const r = cli(["build", join(DIR, "nest", "main.gd"), "--res-root", DIR, "-o", out]);
    expect(r.code, r.out).toBe(0);
    expect(existsSync(join(DIR, "out-nest", "lib", "base.mts"))).toBe(true);
    expect(readFileSync(out, "utf8")).toContain('from "./lib/base.mts"');
    const run = node(out);
    expect(run.code, run.out).toBe(0);
    expect(run.out).toContain("RR|25 7");
  });
});
