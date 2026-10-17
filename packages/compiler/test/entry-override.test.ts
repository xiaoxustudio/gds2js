/**
 * 继承链上的 `override` 修饰符（S456）：父脚本**也定义过**那个方法时，子类的实体就是真覆写 —— 漏了修饰符，
 * 静态那支当场给 `SC0001: This member must have an 'override' modifier …`（实测三格：`tmp/d6/ovr-{sync,coro,proc}/`，
 * 同步覆写出货 `SYNC|2`、引擎同字；入口实体与 async 覆写撞 `SC1090`）。宿主基类身上没有 `__gd__<入口>` 这一格，
 * 所以直接挂宿主的父脚本那份实体**不带**修饰符 —— 带了就撞「not declared in the base class」。
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compileProject } from "@gds2js/compiler/compile/project";

const DIR = join(tmpdir(), "gds2js-entry-override");

const BASE = `extends SceneTree

func helper() -> int:
	return 1

func coro() -> int:
	return await helper()

func _initialize():
	pass
`;

const CHILD = `extends "res://base.gd"

func helper() -> int:
	return 2

func coro() -> int:
	return await helper()

func _initialize():
	print("SYNC|", helper(), " CORO|", await coro())
	quit()
`;

let base = "";
let child = "";
let count = 0;

describe("继承链的 override 修饰符", () => {
  beforeAll(async () => {
    rmSync(DIR, { recursive: true, force: true });
    mkdirSync(DIR, { recursive: true });
    writeFileSync(join(DIR, "base.gd"), BASE, "utf8");
    writeFileSync(join(DIR, "main.gd"), CHILD, "utf8");
    const result = await compileProject({
      entries: [join(DIR, "main.gd")],
      resRoot: DIR,
      outDir: join(DIR, "out"),
      runtimeImport: "gds2js/runtime",
      hostImport: "gds2js/host",
      closureOnly: true,
    });
    expect(result.diags).toEqual([]);
    count = result.modules.length;
    child = result.modules.find((m) => m.resPath === "res://main.gd")!.code;
    base = result.modules.find((m) => m.resPath === "res://base.gd")!.code;
  });

  afterAll(() => {
    rmSync(DIR, { recursive: true, force: true });
  });

  it("子类同步覆写父类方法带修饰符", () => {
    expect(child).toContain("  override helper(): rt.Variant {");
  });

  it("子类覆写父类的 async 方法带修饰符（静态那支的 SC1090 就撞在这一格）", () => {
    expect(child).toContain("  override async coro(): Promise<unknown> {");
  });

  it("父类也定义过入口时，子类的入口实体是真覆写：修饰符不能省", () => {
    expect(child).toContain("  override async __gd__initialize(): Promise<void> {");
    expect(child).toContain("  override _initialize(): Promise<void> { return this.__gd__initialize(); }");
  });

  it("挂宿主基类那一头没有 __gd__<入口> 这一格，实体不带修饰符", () => {
    expect(base).toContain("  async __gd__initialize(): Promise<void> {");
    expect(base).not.toContain("override async __gd__initialize");
    expect(base).not.toContain("override helper");
  });

  it("闭包只种入口：树里就入口与父脚本两份", () => {
    expect(count).toBe(2);
  });
});
