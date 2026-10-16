/**
 * 运行期错误只作废当前那一支函数（S406）：发射器给每支 GDScript 函数（含 `_init`、lambda、字段初始化子那一格 `@implicit_new`）
 * 包一层「接住自己抛的运行期错 → 按引擎那一块打印一次 → 按返回型给默认值返回」。
 * 默认值那一张表逐格对过引擎（读数 `tmp/probe-errorflow/compare{85,86,87}.txt`，出货侧 51 格对账 `tmp/probe-errorflow/ours.mts`）。
 */
import { describe, expect, it } from "vitest";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const OPTS = { runtimeImport: "rt", hostImport: "host" };
const H = "extends SceneTree\n\n";

async function emitted(src: string): Promise<string> {
  const ir = lower(await parseSource(src));
  const diags = analyze(ir);
  if (diags.length > 0) return `diag:${diags[0]!.message}`;
  return emitModule(ir, OPTS);
}

/** 从 `from` 那一处往后找第一个接住点，返回它后面紧跟的那一句返回。 */
function catchReturn(code: string, from: string): string {
  const i = code.indexOf(from);
  if (i < 0) return "没找着那一支";
  const m = /rt\.gdFunctionError\(__gd_err\);\n\s*(return[^;\n]*;)/.exec(code.slice(i));
  return m?.[1] ?? "接住点没给返回";
}

/** 产物里每一个用户类都自带一份 `__gd_fields__`，所以要按类名切出那一截再谈它的接住点。 */
function classBody(code: string, name: string): string {
  const from = code.indexOf(`class ${name} `);
  return from < 0 ? "" : code.slice(from, code.indexOf(`const __gd_d_${name}`));
}

const TAIL = "\nfunc _initialize():\n\tT()\n\tquit()\n";
const initCell = (decl: string): string => `${H}class Thing:\n\tpass\n\nfunc T()${decl}:\n\tvar a: Dictionary = {1: 2}\n\treturn a[0]\n${TAIL}`;

describe("接住点按返回型给默认值", () => {
  const ROWS: Array<[string, string, string]> = [
    ["无标注", "", "return rt.V.nil();"],
    ["-> Variant", " -> Variant", "return rt.V.nil();"],
    ["-> int", " -> int", "return rt.V.int(0);"],
    ["-> float", " -> float", "return rt.V.float(0);"],
    ["-> bool", " -> bool", "return rt.V.bool(false);"],
    ["-> String", " -> String", 'return rt.V.str("");'],
    ["-> StringName", " -> StringName", 'return rt.V.stringName("");'],
    ["-> Array", " -> Array", "return rt.V.array(rt.GArray.of([]));"],
    ["-> Array[int]", " -> Array[int]", "return rt.V.array(rt.GArray.of([]));"],
    ["-> Dictionary", " -> Dictionary", "return rt.dictOf([]);"],
    ["-> Dictionary[int, String]", " -> Dictionary[int, String]", "return rt.dictOf([]);"],
    ["-> Vector2", " -> Vector2", "return rt.vector2(0, 0);"],
    ["-> Vector3", " -> Vector3", "return rt.vector3(0, 0, 0);"],
    ["-> Color", " -> Color", "return rt.color(0, 0, 0, 1);"],
    ["-> PackedInt32Array", " -> PackedInt32Array", 'return rt.packCtor("int32", []);'],
    ["-> PackedStringArray", " -> PackedStringArray", 'return rt.packCtor("string", []);'],
    ["-> Thing", " -> Thing", "return rt.V.nil();"],
  ];

  it.each(ROWS)("%s 出错后返回的那一格", async (label, decl, want) => {
    expect(catchReturn(await emitted(initCell(decl)), "T("), `${label} 的接住返回值`).toBe(want);
  });

  it("不返回值的函数与入口接住后按原样返回", async () => {
    const code = await emitted(`${H}func T():\n\tvar a: Dictionary = {1: 2}\n\ta[0]\n${TAIL}`);
    expect(catchReturn(code, "T()"), "void 那支").toBe("return;");
    expect(catchReturn(code, "__gd__initialize()"), "入口那支").toBe("return;");
  });

  it("协程也按返回型给默认值", async () => {
    const code = await emitted(
      `${H}func T() -> int:\n\tawait create_timer(0.0).timeout\n\tvar a: Dictionary = {1: 2}\n\treturn a[0]\n\nfunc _initialize():\n\tvar v = await T()\n\tquit()\n`,
    );
    expect(catchReturn(code, "async T()"), "协程出错给 int 的零值").toBe("return rt.V.int(0);");
  });

  it("lambda 的接住点给 null 盒子", async () => {
    const code = await emitted(`${H}func _initialize():\n\tvar c = func():\n\t\tvar a: Dictionary = {1: 2}\n\t\treturn a[0]\n\tc.call()\n\tquit()\n`);
    expect(catchReturn(code, "<anonymous lambda>"), "lambda 出错那一格").toBe("return rt.V.nil();");
  });

  it("字段初始化子那一格叫 @implicit_new，接住后其余初始化子不再跑", async () => {
    const code = await emitted(`${H}class Thing:\n\tvar x = ({1: 2})[0]\n\tvar y = 5\n\nfunc _initialize():\n\tThing.new()\n\tquit()\n`);
    const thing = classBody(code, "Thing");
    expect(thing, "那一格进的是 @implicit_new 帧").toContain('rt.frameEnter("Main.gd", "@implicit_new")');
    const block = /__gd_fields__\(\) \{[\s\S]*?\n {2}\}/.exec(thing)?.[0] ?? "";
    expect(catchReturn(block, "__gd_fields__()"), "初始化子那格接住后直接返回").toBe("return;");
    expect(block, "两支初始化子都在同一格里").toContain("this.y = rt.V.int(5);");
    expect(block, "出错那一格也在").toContain("this.x = ");
  });

  it("_init 自己也有接住点", async () => {
    const code = classBody(await emitted(`${H}class Thing:\n\tfunc _init():\n\t\tvar a: Dictionary = {1: 2}\n\t\ta[0]\n\nfunc _initialize():\n\tThing.new()\n\tquit()\n`), "Thing");
    expect(catchReturn(code, "constructor("), "_init 的接住返回").toBe("return;");
  });

  it("每支函数各有一个接住点", async () => {
    const code = await emitted(`${H}func a1():\n\tpass\n\nfunc a2() -> int:\n\treturn 1\n\nstatic func a3():\n\tpass\n\nfunc _initialize():\n\tquit()\n`);
    expect(code.split("rt.gdFunctionError(__gd_err);").length - 1, "三支函数、入口与字段初始化子那一格各一次").toBe(5);
  });
});

describe("解析期那三句也管到 lambda 与初始化子", () => {
  const idx = 'Invalid index type "String" for a base of type "Array".';

  it("lambda 体里的位置型基下标型照拒", async () => {
    const src = `${H}func _initialize():\n\tvar c = func():\n\t\tprint([1, 2]["a"])\n\tc.call()\n\tquit()\n`;
    expect(await emitted(src), "引擎同句（compare91 r1）").toBe(`diag:${idx}`);
  });

  it("lambda 体里的定形字典键型照拒", async () => {
    const src = `${H}func _initialize():\n\tvar c = func():\n\t\tvar d: Dictionary[String, int] = {}\n\t\tprint(d[0])\n\tc.call()\n\tquit()\n`;
    expect(await emitted(src), "引擎同句（compare91 r2）").toBe('diag:Invalid index type "int" for a base of type "Dictionary[String, int]".');
  });

  it("lambda 体里取 void 方法的返回值照拒", async () => {
    const src = `${H}func _initialize():\n\tvar c = func():\n\t\tvar arr: Array = []\n\t\tprint(arr.append(1))\n\tc.call()\n\tquit()\n`;
    expect(await emitted(src), "引擎同句（compare91 r3）").toBe('diag:Cannot get return value of call to "append()" because it returns "void".');
  });

  it("字段初始化子与模块 var 的初值里照拒", async () => {
    const field = `${H}class Thing:\n\tvar x = [1, 2]["a"]\n\nfunc _initialize():\n\tquit()\n`;
    expect(await emitted(field), "字段初始化子（compare91 r4）").toBe(`diag:${idx}`);
    const mod = `${H}var v = [1, 2]["a"]\n\nfunc _initialize():\n\tquit()\n`;
    expect(await emitted(mod), "模块 var 的初值（compare91 r5）").toBe(`diag:${idx}`);
  });

  it("字典字面量直接下标走数组那一式", async () => {
    const code = await emitted(`${H}func _initialize():\n\tprint(({1: 2})[0])\n\tquit()\n`);
    expect(code, "发的是那一式专用的读取").toContain("rt.dictIndexInt(");
  });
});

describe("D6 那七型的默认值站点响亮拒", () => {
  const SEVEN = ["Rect2", "Rect2i", "Transform2D", "Plane", "Quaternion", "Basis", "AABB"];

  it.each(SEVEN)("%s 的接住点发不出默认值（读数 tmp/probe-valuedefault/compare96.txt 的 B 站）", async (t) => {
    expect(catchReturn(await emitted(initCell(` -> ${t}`)), "T("), `${t} 的接住返回`).toBe(`return rt.unsupportedValueDefault("${t}");`);
  });

  it("无初值的声明与类字段两站同一条拒（A 站与 C 站）", async () => {
    const mod = await emitted(`${H}var r: Rect2

func _initialize():
	print(r)
	quit()
`);
    expect(mod, "模块 var 那一站").toContain('r = rt.unsupportedValueDefault("Rect2")');
    const thing = classBody(await emitted(`${H}class Thing:
	var r: Rect2

func _initialize():
	Thing.new()
	quit()
`), "Thing");
    expect(thing, "类字段那一站").toContain('this.r = rt.unsupportedValueDefault("Rect2");');
  });
});
