/**
 * 脚本基类的三张登记（阶段三第 3 步的最后一格）：`extends` 的答案只由实测派生的表决定 ——
 * 宿主的 `SceneTree`、量过的引擎节点基类（Node / Node2D）、其余引擎类一律响亮拒，
 * 而「这个类名在不在引擎里」由 `regen:engine-classes` 那张 ClassDB 全量表回答，不再是手抄名单。
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compileProject } from "@gds2js/compiler/compile/project";

const DIR = join(tmpdir(), "gds2js-script-base-sets");

function body(base: string): string {
  return `extends ${base}

func helper() -> int:
	return 1

func _ready():
	print("B|", helper())
`;
}

async function emitOne(base: string, src?: string): Promise<string> {
  const file = join(DIR, "main.gd");
  writeFileSync(file, src ?? body(base), "utf8");
  const r = await compileProject({
    entries: [file],
    resRoot: DIR,
    outDir: join(DIR, ".gen"),
    runtimeImport: "@gds2js/runtime/runtime/index",
    hostImport: "@gds2js/runtime/host",
    autoRun: false,
  });
  if (r.diags.length > 0) throw new Error(`静态检查拦下：${r.diags[0]!.diagnostic.message}`);
  return r.modules[0]!.code;
}

async function codeOfThrow(base: string): Promise<string> {
  try {
    await emitOne(base);
  } catch (e) {
    const err = e as { code?: string };
    return `[${String(err.code)}]`;
  }
  return "没抛";
}

describe("脚本基类只认实测派生的登记", () => {
  beforeAll(() => {
    rmSync(DIR, { recursive: true, force: true });
    mkdirSync(DIR, { recursive: true });
  });
  afterAll(() => {
    rmSync(DIR, { recursive: true, force: true });
  });

  it("SceneTree 仍走宿主那支", async () => {
    const code = await emitOne("SceneTree", `extends SceneTree

func _initialize():
	print("B|1")
	quit()
`);
    expect(code, "基类是宿主导入的那个 SceneTree").toContain("export class Main extends SceneTree {");
    expect(code).toContain('rt.registerNativeBase(__gd_d_Main, "SceneTree");');
  });

  it.each(["Node", "Node2D", "Control", "Node3D"])("%s 发引擎基类那支，并带上节点面的五个字段", async (base) => {
    const code = await emitOne(base);
    expect(code).toContain(`rt.registerNativeBase(__gd_d_Main, "${base}");`);
    expect(code, "引擎基类的类体不 JS 继承，节点面靠字段").toContain("export class Main extends rt.GdScriptObject {");
    expect(code).toContain(`  __gd_engine_class__ = "${base}";`);
    expect(code).toContain("  __gd_node_children__: unknown[] = [];");
  });

  it("类体里的裸名引擎方法翻成 rt.method(self, …)", async () => {
    const code = await emitOne("Node", `extends Node

func _ready():
	print("B|", get_class(), "|", get_child_count())
`);
    expect(code, "get_class() 落在引擎面，不冒充脚本方法").toContain('rt.method(this, "get_class", [])');
    expect(code, "元数为 0 的那支也一样").toContain('rt.method(this, "get_child_count", [])');
  });

  it("引擎面表外的裸名仍按找不到拒（queue_free 要帧，没进表）", async () => {
    const src = `extends Node

func _initialize():
	queue_free()
	quit()
`;
    await expect(emitOne("Node", src), "拒的是那张实测表之外的名字").rejects.toThrow(/not found in base self/);
  });

  it("分组面四支也走那张裸名表", async () => {
    const code = await emitOne("Node", `extends Node

func _ready():
	add_to_group("g")
	print("B|", get_groups(), "|", is_in_group("g"))
	remove_from_group("g")
`);
    expect(code).toContain('rt.method(this, "add_to_group", ');
    expect(code).toContain('rt.method(this, "get_groups", [])');
    expect(code).toContain('rt.method(this, "is_in_group", ');
    expect(code).toContain('rt.method(this, "remove_from_group", ');
  });

  it("类体里裸名读写引擎成员按量过的那张名单翻成属性面", async () => {
    const code = await emitOne("Node2D", `extends Node2D

func _ready():
	print("B|", name, "|", position)
	name = "r2"
	position += Vector2(1, 2)
`);
    expect(code).toContain('rt.wrapValue(rt.attribute(rt.V.object(this), "name"))');
    expect(code).toContain('rt.writeProp(rt.V.object(this), "name", rt.V.str("r2"))');
    expect(code, "增广赋值读的还是同一个属性面").toContain('rt.writeProp(rt.V.object(this), "position", ');
    expect(code.match(/rt\.attribute\(rt\.V\.object\(this\), "position"\)/g)?.length).toBe(2);
  });

  it("Node 那一支只量过 name，其余成员名仍按找不到拒", async () => {
    await expect(emitOne("Node", `extends Node

func _ready():
	print("B|", position)
`)).rejects.toThrow(/not declared in the current scope/);
  });

  it("静态函数里读引擎成员不放行", async () => {
    await expect(emitOne("Node", `extends Node

static func probe():
	print("B|", name)
`)).rejects.toThrow(/not declared in the current scope/);
  });

  it.each(["Sprite2D", "Label", "Resource", "RefCounted"])(
    "引擎里的 %s 还没量过基类面，响亮拒",
    async (base) => {
      expect(await codeOfThrow(base), "名单来自 ClassDB 全量表").toBe("[engine-base]");
    },
  );

  it("不在引擎表里的名字走 extends-unknown", async () => {
    expect(await codeOfThrow("NotAClass")).toBe("[extends-unknown]");
  });
});
