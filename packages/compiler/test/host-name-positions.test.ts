/**
 * 宿主裸方法名与 `self` 在**函数体之外**的那些位置（字段初值、形参默认值、静态语境）各给什么（S367）：
 * 合法的那些格子出货必须照引擎放行（放行后发射器发真 Callable），拒的那三格钉引擎原句。
 * 尺 `tmp/probe-argtype/fold55.mts`（一格一份脚本一次 spawn），读数 `tmp/pos/compare.txt`；端到端取值钉在语料 `corpus/cases/369-host-name-positions/`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const OPTS = { runtimeImport: "rt", hostImport: "host" };

async function compile(src: string): Promise<string> {
  const ir = lower(await parseSource(src));
  const diags = analyze(ir);
  if (diags.length > 0) return diags[0]!.message;
  return emitModule(ir, OPTS);
}

const H = "extends SceneTree\n\n";

describe("字段初值与形参默认值里宿主名合法（引擎收下）", () => {
  it("模块级 var 初值", async () => {
    const out = await compile(`${H}var f = quit\n\nfunc _initialize():\n\tquit()\n`);
    eq("367", "模块级 var 出 Callable", out.includes('methodCallable(rt.V.object(this), "quit")'), true);
  });

  it("模块级带型 var 初值", async () => {
    const out = await compile(`${H}var f: Callable = quit\n\nfunc _initialize():\n\tquit()\n`);
    eq("367", "带型模块 var 出 Callable", out.includes('methodCallable(rt.V.object(this), "quit")'), true);
  });

  it("static var / const 初值之外的 self", async () => {
    const out = await compile(`${H}var f = self\n\nfunc _initialize():\n\tquit()\n`);
    eq("367", "模块级 var 的 self 不拒", out.startsWith("Identifier") || out.startsWith("Cannot"), false);
  });

  it("实例方法形参默认值", async () => {
    const out = await compile(`${H}func take(x = quit):\n\tprint(x)\n\nfunc _initialize():\n\tquit()\n`);
    eq("367", "形参默认值出 Callable", out.includes('methodCallable(rt.V.object(this), "quit")'), true);
  });

  it("lambda 体里照根类实例方法认", async () => {
    const out = await compile(`${H}func _initialize():\n\tvar lam = func():\n\t\treturn typeof(quit)\n\tprint(lam.call())\n\tquit()\n`);
    eq("367", "lambda 体出 Callable", out.includes('methodCallable(rt.V.object(this), "quit")'), true);
  });

  it("局部绑定盖住同名时取的是变量", async () => {
    const out = await compile(`${H}func _initialize():\n\tfor quit in [1, 2]:\n\t\tprint(quit)\n\t\tbreak\n\tquit()\n`);
    eq("367", "for 变量优先", out.includes("methodCallable"), false);
  });
});

describe("静态语境里读到宿主名：引擎三处各一句", () => {
  it("static func 体", async () => {
    const out = await compile(`${H}static func s():\n\tvar f = quit\n\nfunc _initialize():\n\ts()\n\tquit()\n`);
    eq(
      "367",
      "静态函数那一句",
      out,
      'Cannot access non-static variable "quit" from the static function "s()".',
    );
  });

  it("static var 初值", async () => {
    const out = await compile(`${H}static var f = quit\n\nfunc _initialize():\n\tquit()\n`);
    eq("367", "静态变量初值那一句", out, 'Cannot access non-static variable "quit" from a static variable initializer.');
  });

  it("const 初值", async () => {
    const out = await compile(`${H}const F = quit\n\nfunc _initialize():\n\tquit()\n`);
    eq("367", "常量初值那一句", out, 'Assigned value for constant "F" isn\'t a constant expression.');
  });

  it("static func 里写宿主名同一句", async () => {
    const out = await compile(`${H}static func s():\n\tquit = 5\n\nfunc _initialize():\n\ts()\n\tquit()\n`);
    eq("367", "静态函数里赋值那一句", out, 'Cannot access non-static variable "quit" from the static function "s()".');
  });
});

describe("self 在 static var 与 const 初值里：一个给 null，一个直接拒", () => {
  it("static var 初值里的 self 发 null 盒子（实测 typeof 0）", async () => {
    const out = await compile(`${H}static var f = self\n\nfunc _initialize():\n\tquit()\n`);
    eq("367", "静态变量初值发 nil", /static f = rt\.V\.nil\(\)/.test(out), true);
  });

  it("const 初值里的 self 是引擎那句「不是常量表达式」", async () => {
    const out = await compile(`${H}const F = self\n\nfunc _initialize():\n\tquit()\n`);
    eq("367", "常量初值的 self", out, 'Assigned value for constant "F" isn\'t a constant expression.');
  });

  it("内部类字段初值与实例方法形参默认值里的 self 照旧合法（实测 typeof 24）", async () => {
    const inner = await compile(`${H}class Inner:\n\tvar g = self\n\nfunc _initialize():\n\tquit()\n`);
    eq("367", "内部类字段初值不拒", inner.startsWith("Identifier") || inner.startsWith("Cannot"), false);
    const param = await compile(`${H}func take(x = self):\n\tprint(x)\n\nfunc _initialize():\n\tquit()\n`);
    eq("367", "形参默认值不拒", param.startsWith("Identifier") || param.startsWith("Cannot"), false);
  });
});

describe("字段初值与默认值照样查名字（引擎是解析期拒）", () => {
  it("三处未声明名同一句", async () => {
    const want = 'Identifier "nosuch" not declared in the current scope.';
    eq("367", "模块 var 初值", await compile(`${H}var f = nosuch\n\nfunc _initialize():\n\tquit()\n`), want);
    eq("367", "static var 初值", await compile(`${H}static var f = nosuch\n\nfunc _initialize():\n\tquit()\n`), want);
    eq("367", "形参默认值", await compile(`${H}func take(x = nosuch):\n\tprint(x)\n\nfunc _initialize():\n\tquit()\n`), want);
  });

  it("内部类里看不见宿主那面", async () => {
    const src = `${H}class Inner:\n\tvar g = quit\n\nfunc _initialize():\n\tquit()\n`;
    eq("367", "内部类字段初值", await compile(src), 'Identifier "quit" not declared in the current scope.');
  });
});
