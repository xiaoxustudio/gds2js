/**
 * inline 读写器（`get:` / `set(v):`）体里的名字给什么（S368）：出货此前那两段从没进过作用域走查，
 * 宿主裸名发成裸标识符、跑起来 `quit is not defined`；只带 set 的属性引擎收下而我们响亮拒。
 * 尺 `tmp/probe-argtype/{fold57,fold58,fold59}.mts`（一格一份脚本一次 spawn），读数 `tmp/pos/{compare4.txt,compare5.txt}`；端到端钉在语料 `corpus/cases/370-property-accessor-names/`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { emitModule } from "@gds2js/compiler/emit";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const OPTS = { runtimeImport: "rt", hostImport: "host" };

async function compile(src: string): Promise<string> {
  const ir = lower(await parseSource(src));
  const analysis = analyze(ir);
  const diags = analysis.diagnostics;
  if (diags.length > 0) return diags[0]!.message;
  return emitModule(ir, OPTS, analysis);
}

const H = "extends SceneTree\n\n";
const GET = (body: string): string => `${H}var thing: Variant:\n\tget:\n\t\t${body}\n\nfunc _initialize():\n\tquit()\n`;
const SET = (param: string, body: string): string =>
  `${H}var s = 0\n\nvar thing: Variant:\n\tset(${param}):\n\t\t${body}\n\nfunc _initialize():\n\tquit()\n`;
const REFUSED = (out: string): boolean => out.startsWith("Identifier") || out.startsWith("Cannot") || out.startsWith("Assigned");

describe("读写器体里引擎收下的一切", () => {
  it("宿主裸名给 Callable", async () => {
    const out = await compile(GET("return quit"));
    eq("368", "getter 里宿主名", out.includes('methodCallable(rt.V.object(this), "quit")'), true);
  });

  it("全局函数名给 Callable", async () => {
    const out = await compile(GET("return abs"));
    eq("368", "getter 里全局函数名", out.includes('rt.globalCallable("abs")'), true);
  });

  it("引擎类名给类身份盒子", async () => {
    const out = await compile(GET("return Node"));
    eq("368", "getter 里引擎类名", out.includes('rt.nativeClass("Node")'), true);
  });

  it("self 不拒", async () => {
    const out = await compile(GET("return self"));
    eq("368", "getter 里 self", REFUSED(out), false);
  });

  it("只带 set 的属性合法（实测读出来是 typeof 0）", async () => {
    const out = await compile(SET("v", "s = v"));
    eq("368", "setter 单独存在", REFUSED(out), false);
    eq("368", "读只带 set 的属性发 null 盒子", out.includes("__gd_store_thing = rt.V.nil();") && out.includes("return this.__gd_store_thing;"), true);
  });

  it("setter 体里宿主名给 Callable", async () => {
    const out = await compile(SET("v", "print(quit)"));
    eq("368", "setter 里宿主名", out.includes('methodCallable(rt.V.object(this), "quit")'), true);
  });

  it("setter 形参与宿主名同名：取的是形参", async () => {
    const out = await compile(SET("quit", "s = quit"));
    eq("368", "形参盖住同名", out.includes("methodCallable"), false);
    eq("368", "发的就是那个形参", /set thing\(quit\) \{/.test(out), true);
  });

  it("读写器成对与只带 get 都合法", async () => {
    const both = await compile(`${H}var thing: Variant:\n\tget:\n\t\treturn quit\n\tset(v):\n\t\tprint(v)\n\nfunc _initialize():\n\tquit()\n`);
    eq("368", "成对的读写器", REFUSED(both), false);
    const getOnly = await compile(GET("return 3"));
    eq("368", "只带 get", REFUSED(getOnly), false);
  });
});

describe("读写器体里引擎拒的那几格", () => {
  it("没声明的名字：两处同一句", async () => {
    const want = 'Identifier "nosuch" not declared in the current scope.';
    eq("368", "getter 里没声明名", await compile(GET("return nosuch")), want);
    eq("368", "setter 里没声明名", await compile(SET("v", "var f = nosuch")), want);
  });

  it("setter 里写宿主名是那句「常量」", async () => {
    eq("368", "setter 里写宿主名", await compile(SET("v", "quit = 5")), "Cannot assign a new value to a constant.");
  });

  it("内部类看不见宿主那面", async () => {
    const src = `${H}class Inner:\n\tvar thing: Variant:\n\t\tget:\n\t\t\treturn quit\n\nfunc _initialize():\n\tquit()\n`;
    eq("368", "内部类的 getter", await compile(src), 'Identifier "quit" not declared in the current scope.');
  });

  it("static var 的两支：引擎用的是合成函数名", async () => {
    const g = await compile(`${H}static var thing: Variant:\n\tget:\n\t\treturn quit\n\nfunc _initialize():\n\tquit()\n`);
    eq("368", "静态变量的 getter", g, 'Cannot access non-static variable "quit" from the static function "@thing_getter()".');
    const s = await compile(`${H}static var thing: Variant:\n\tset(v):\n\t\tvar f = quit\n\nfunc _initialize():\n\tquit()\n`);
    eq("368", "静态变量的 setter", s, 'Cannot access non-static variable "quit" from the static function "@thing_setter()".');
  });
});
