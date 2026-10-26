/**
 * 属性的具名委托（`get = 名` / `set = 名`）与 static 那一维（S371）：委托目标按 static / 实例分接收者，
 * static 属性委托到实例方法时引擎运行期打一块 ERROR 再给 null，带初值的属性留一个后备槽（初值照评、写属性不动槽）。
 * 尺 `tmp/probe-argtype/{fold60,fold61,fold62,fold63}.mts`（一格一份脚本一次 spawn），读数 `tmp/pos/{compare6,compare7,compare8,compare9}.txt`；
 * 端到端钉在语料 `corpus/cases/371-property-delegation/`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";

const OPTS = { runtimeImport: "rt", hostImport: "host" };

async function compile(src: string, opts: typeof OPTS & { extendedByScript?: boolean } = OPTS): Promise<string> {
  let ir: ReturnType<typeof lower>;
  try {
    ir = lower(await parseSource(src));
  } catch (e) {
    return e instanceof UnsupportedError ? e.message : `非拒答：${e instanceof Error ? e.message : String(e)}`;
  }
  const analysis = analyze(ir);
  const diags = analysis.diagnostics;
  if (diags.length > 0) return diags[0]!.message;
  return emitModule(ir, opts, analysis);
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
    eq("371", "初值仍发进槽", at("this.__gd_store_thing = rt.V.int(9);") > 0, true);
    eq("371", "槽在 a 之后", at("this.__gd_store_thing = ") > at("this.a = rt.V.int(1);"), true);
    eq("371", "槽在 b 之前", at("this.__gd_store_thing = ") < at("this.b = rt.V.int(2);"), true);
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

describe("具名委托的准入拒（句子照引擎原文）", () => {
  const DELEG = (seg: string, funcs = ""): string => `${H}${funcs}var thing: Variant:\n\t${seg}\n${TAIL}`;

  it("名字不在本类里：两句各按 get / set 分", async () => {
    eq("371", "getter 没找到", await compile(DELEG("get = _nope")), 'Getter "_nope" not found.');
    eq("371", "setter 没找到", await compile(DELEG("set = _nope")), 'Setter "_nope" not found.');
  });

  it("宿主裸名与模块 var 都算没找到", async () => {
    eq("371", "宿主名", await compile(DELEG("get = quit")), 'Getter "quit" not found.');
    eq("371", "模块 var", await compile(DELEG("get = cb", "var cb = 1\n\n")), 'Getter "cb" not found.');
  });

  it("继承来的方法也不算找到（内部类链）", async () => {
    const src = `${H}class B:\n\tfunc _g() -> Variant:\n\t\treturn 3\n\nclass C extends B:\n\tvar thing: Variant:\n\t\tget = _g\n${TAIL}`;
    eq("371", "内部类链", await compile(src), 'Getter "_g" not found.');
  });

  it("签名不合格：getter 恰好 0 参、setter 恰好 1 参", async () => {
    eq("371", "getter 一参", await compile(DELEG("get = _g", "func _g(a: Variant) -> Variant:\n\treturn a\n\n")), 'Function "_g" cannot be used as getter because of its signature.');
    eq("371", "setter 零参", await compile(DELEG("set = _s", "func _s() -> void:\n\tpass\n\n")), 'Function "_s" cannot be used as setter because of its signature.');
    eq("371", "setter 两参", await compile(DELEG("set = _s", "func _s(a: Variant, b: Variant) -> void:\n\tpass\n\n")), 'Function "_s" cannot be used as setter because of its signature.');
  });

  it("带默认值也不合格", async () => {
    eq("371", "getter 带默认参", await compile(DELEG("get = _g", "func _g(a: Variant = 1) -> Variant:\n\treturn a\n\n")), 'Function "_g" cannot be used as getter because of its signature.');
    eq("371", "setter 带第二个默认参", await compile(DELEG("set = _s", "func _s(v: Variant, extra: Variant = 2) -> void:\n\tpass\n\n")), 'Function "_s" cannot be used as setter because of its signature.');
  });

  it("参数类型不看：int 形参给 Variant 属性当 setter 合法", async () => {
    const out = await compile(DELEG("set = _s", "func _s(v: int) -> void:\n\tpass\n\n"));
    eq("371", "定型形参不拒", out.startsWith("Getter") || out.startsWith("Setter") || out.startsWith("Function"), false);
  });

  it("static 方法给实例属性当委托目标：合法", async () => {
    const out = await compile(DELEG("get = _sg", "static func _sg() -> Variant:\n\treturn 7\n\n"));
    eq("371", "static 目标不拒", out.startsWith("Getter") || out.startsWith("Function"), false);
  });

  it("两段之间少逗号：引擎那一句（带逗号换行合法，语料 121）", async () => {
    const noComma = `${H}func _g() -> Variant:\n\treturn 3\n\nfunc _s(v: Variant) -> void:\n\tpass\n\nvar thing: Variant:\n\tget = _g\n\tset = _s\n${TAIL}`;
    eq("371", "少逗号", await compile(noComma), "Expected end of indented block for property.");
    const withComma = `${H}func _g() -> Variant:\n\treturn 3\n\nfunc _s(v: Variant) -> void:\n\tpass\n\nvar thing: Variant:\n\tget = _g,\n\tset = _s\n${TAIL}`;
    const out = await compile(withComma);
    eq("371", "带逗号换行不拒", out.includes("return this._g();") && out.includes("this._s(value);"), true);
  });
});

describe("读写器的记号级畸形形（句子照引擎原文）", () => {
  const P = (seg: string): string => `${H}func _g() -> Variant:\n\treturn 3\n\nfunc _s(v: Variant) -> void:\n\tpass\n\nvar thing: Variant:\n\t${seg}\n${TAIL}`;

  it("get 后面漏等号", async () => {
    eq("374", "get 名", await compile(P("get _g")), 'Expected ":" or "(" after "get".');
    eq("374", "get 名 名", await compile(P("get _g _s")), 'Expected ":" or "(" after "get".');
  });

  it("set 后面漏等号：与 get 那一侧不同文", async () => {
    eq("374", "set 名", await compile(P("set _s")), 'Expected "(" after "set".');
  });

  it("等号后不是名字", async () => {
    eq("374", "get = 字面量", await compile(P("get = 5")), 'Expected getter function name after "=".');
    eq("374", "set = 字面量", await compile(P("set = 5")), 'Expected setter function name after "=".');
  });

  it("等号后空着", async () => {
    eq("374", "get = 空", await compile(P("get =")), 'Expected getter function name after "=".');
    eq("374", "set = 空", await compile(P("set =")), 'Expected setter function name after "=".');
  });

  // 内部类里同一形给的是读写器那两句，而**模块级**同一形（`var x:` 不带型 + 换行一段 `get 名`）给的是 `Expected type after ":"` —— 两侧读数 `tmp/probe-inneracc/{compare32.txt,m1.mts}`
  it("内部类里的六形与模块级同句，只多这一处上下文分岔", async () => {
    const C = (seg: string): string =>
      `${H}class Inner:\n\tfunc _g() -> Variant:\n\t\treturn 3\n\n\tfunc _s(v: Variant) -> void:\n\t\tpass\n\n\tvar thing:\n\t\t${seg}\n${TAIL}`;
    eq("384", "类内 get 名", await compile(C("get _g")), 'Expected ":" or "(" after "get".');
    eq("384", "类内 get 名 名", await compile(C("get _g _h")), 'Expected ":" or "(" after "get".');
    eq("384", "类内 set 名", await compile(C("set _s")), 'Expected "(" after "set".');
    eq("384", "类内 get = 字面量", await compile(C("get = 5")), 'Expected getter function name after "=".');
    eq("384", "类内 get = 空", await compile(C("get =")), 'Expected getter function name after "=".');
    eq("384", "类内 set = 字面量", await compile(C("set = 5")), 'Expected setter function name after "=".');
    eq("384", "类内 set = 空", await compile(C("set =")), 'Expected setter function name after "=".');
    eq("384", "类内两段少逗号", await compile(C("get = _g\n\t\tset = _s")), "Expected end of indented block for property.");
    eq("384", "类内合法形不响", (await compile(C("get = _g, set = _s"))).startsWith("Expected"), false);
    eq("384", "模块级不带型的那一形仍是类型句", await compile(`${H}var x:\n\tget _g\n${TAIL}`), 'Expected type after ":"');
  });

  it("合法的四形一句都不许响", async () => {
    for (const seg of ["get:\n\t\treturn 3", "set(v):\n\t\tpass", "get = _g", "set = _s", "get = _g,\n\tset = _s"]) {
      eq("374", `合法形 ${seg.slice(0, 6)}`, (await compile(P(seg))).startsWith("Expected"), false);
    }
  });
});
