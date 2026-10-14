/**
 * 属性的具名委托（`get = 名` / `set = 名`）与 static 那一维（S371）：委托目标按 static / 实例分接收者，
 * static 属性委托到实例方法时引擎运行期打一块 ERROR 再给 null，带初值的属性留一个后备槽（初值照评、写属性不动槽）。
 * 尺 `tmp/probe-argtype/{fold60,fold61,fold62,fold63}.mts`（一格一份脚本一次 spawn），读数 `tmp/pos/{compare6,compare7,compare8,compare9}.txt`；
 * 端到端钉在语料 `corpus/cases/371-property-delegation/`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const OPTS = { runtimeImport: "rt", hostImport: "host" };

async function compile(src: string, opts: typeof OPTS & { extendedByScript?: boolean } = OPTS): Promise<string> {
  const ir = lower(await parseSource(src));
  const diags = analyze(ir);
  if (diags.length > 0) return diags[0]!.message;
  return emitModule(ir, opts);
}

const H = "extends SceneTree\n\n";
const G = "func _g() -> Variant:\n\treturn 3\n\n";
const SG = "static func _sg() -> Variant:\n\treturn 7\n\n";
const TAIL = "\nfunc _initialize():\n\tquit()\n";

describe("具名委托的发射式子", () => {
  it("实例属性委托实例方法：接收者是 this", async () => {
    const out = await compile(`${H}${G}var thing: Variant:\n\tget = _g\n${TAIL}`);
    eq("371", "具名 getter", out.includes("return this._g();"), true);
  });

  it("实例属性委托 static 方法：接收者是类", async () => {
    const out = await compile(`${H}${SG}var thing: Variant:\n\tget = _sg\n${TAIL}`);
    eq("371", "委托到 static 方法", out.includes("return Main._sg();"), true);
  });

  it("一行并列的 get/set 都发出来", async () => {
    const out = await compile(`${H}var store = 0\n\n${G}func _s(v: Variant) -> void:\n\tstore = v\n\nvar thing: Variant: get = _g, set = _s\n${TAIL}`);
    eq("371", "并列的 getter", out.includes("return this._g();"), true);
    eq("371", "并列的 setter", out.includes("this._s(value);"), true);
  });
});

describe("static 属性那一维", () => {
  it("inline 读写器发成 static 访问器", async () => {
    const out = await compile(`${H}static var store = 1\n\nstatic var thing: Variant:\n\tget:\n\t\treturn store\n\tset(v):\n\t\tstore = v\n${TAIL}`);
    eq("371", "static getter", out.includes("static get thing() {"), true);
    eq("371", "static setter", out.includes("static set thing(v) {"), true);
  });

  it("具名成对也发成 static 访问器，接收者是类", async () => {
    const out = await compile(`${H}${SG}static func _ss(v: Variant) -> void:\n\tpass\n\nstatic var thing: Variant: get = _sg, set = _ss\n${TAIL}`);
    eq("371", "static 具名 getter", out.includes("static get thing() {"), true);
    eq("371", "static 具名 getter 的接收者", out.includes("return Main._sg();"), true);
    eq("371", "static 具名 setter 的接收者", out.includes("Main._ss(value);"), true);
  });

  it("委托到实例方法：那一次调用不发生，改成打引擎那块 ERROR", async () => {
    const out = await compile(`${H}${G}func _s(v: Variant) -> void:\n\tpass\n\nstatic var thing: Variant:\n\tget = _g\n\nstatic var other: Variant:\n\tset = _s\n${TAIL}`);
    eq("371", "getter 那一支", out.includes('return rt.reportNonStaticCall("_g");'), true);
    eq("371", "setter 那一支", out.includes('rt.reportNonStaticCall("_s");'), true);
    const body = (sig: string): string => {
      const at = out.indexOf(sig);
      return at < 0 ? "" : out.slice(at, out.indexOf("\n  }", at));
    };
    eq("371", "getter 体里不再发那次调用", body("static get thing() {").includes("_g()"), false);
    eq("371", "setter 体里不再发那次调用", body("static set other(value) {").includes("_s("), false);
  });
});

describe("带初值的属性留一个后备槽", () => {
  it("只带 set 且有初值：读出来是那个初值", async () => {
    const out = await compile(`${H}var store = 0\n\nvar thing: Variant = 9:\n\tset(v):\n\t\tstore = v\n${TAIL}`);
    eq("371", "槽的初值", out.includes("__gd_store_thing = rt.V.int(9);"), true);
    eq("371", "读的是槽", out.includes("return this.__gd_store_thing;"), true);
  });

  it("具名 setter 同一口径", async () => {
    const out = await compile(`${H}func _s(v: Variant) -> void:\n\tpass\n\nvar thing: Variant = 9:\n\tset = _s\n${TAIL}`);
    eq("371", "具名 setter 的槽", out.includes("return this.__gd_store_thing;"), true);
  });

  it("没初值时槽装的是声明类型的零值：Variant 给 null 盒子", async () => {
    const out = await compile(`${H}var thing: Variant:\n\tset(v):\n\t\tpass\n${TAIL}`);
    eq("371", "槽装 nil", out.includes("__gd_store_thing = rt.V.nil();"), true);
    eq("371", "读的是槽", out.includes("return this.__gd_store_thing;"), true);
  });

  it("定型属性只带 setter：槽装那一型的零值，不是 null", async () => {
    const out = await compile(`${H}func _s(v: Variant) -> void:\n\tpass\n\nvar thing: int:\n\tset = _s\n${TAIL}`);
    eq("371", "槽装 int 零值", out.includes("__gd_store_thing = rt.toInt(rt.V.int(0));"), true);
    eq("371", "读的是槽", out.includes("return this.__gd_store_thing;"), true);
  });

  it("有 getter 时初值照评（副作用是实测的），槽按声明次序落在邻字段之间", async () => {
    const out = await compile(`${H}${G}var a = 1\n\nvar thing: Variant = 9:\n\tget = _g\n\nvar b = 2\n${TAIL}`);
    const at = (s: string): number => out.indexOf(s);
    eq("371", "初值仍发进槽", at("__gd_store_thing = rt.V.int(9);") > 0, true);
    eq("371", "槽在 a 之后", at("__gd_store_thing") > at("a = rt.V.int(1);"), true);
    eq("371", "槽在 b 之前", at("__gd_store_thing") < at("b = rt.V.int(2);"), true);
    eq("371", "getter 照发委托", out.includes("return this._g();"), true);
  });

  it("static 属性的槽发成 static 字段", async () => {
    const out = await compile(`${H}static func _ss(v: Variant) -> void:\n\tpass\n\nstatic var thing: Variant = 9:\n\tset = _ss\n${TAIL}`);
    eq("371", "static 槽", out.includes("static __gd_store_thing = rt.V.int(9);"), true);
    eq("371", "static 槽的读", out.includes("return Main.__gd_store_thing;"), true);
  });

  it("proto 形状下槽有 declare，初值落进 __gd_fields__", async () => {
    const out = await compile(`${H}var thing: Variant = 9:\n\tset(v):\n\t\tpass\n${TAIL}`, { ...OPTS, extendedByScript: true });
    eq("371", "槽的类型声明", out.includes("declare __gd_store_thing: rt.Variant;"), true);
    eq("371", "槽在初始化子里", out.includes("this.__gd_store_thing = rt.V.int(9);"), true);
  });

  it("inst_to_dict 的读数器读槽，不再是死写的 nil", async () => {
    const out = await compile(`${H}var thing: Variant = 9:\n\tset(v):\n\t\tpass\n${TAIL}`);
    eq("371", "读数器", out.includes("return [s.__gd_store_thing];"), true);
    const bare = await compile(`${H}var thing: Variant:\n\tget:\n\t\treturn 3\n${TAIL}`);
    eq("371", "没槽时仍是 nil", bare.includes("return [rt.V.nil()];"), true);
  });
});
