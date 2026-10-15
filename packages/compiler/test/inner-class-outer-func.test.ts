/**
 * 内部类调外层方法那一句在**五个位置**上都得响（S373）：函数体此前已接，字段初值、形参默认值、
 * getter 体与 setter 体这四处此前一路放到运行期才炸 `this.p is not a function`。
 * 尺 `tmp/probe-inner/round1.mts` 与 `tmp/pos/n{13,14}.gd`（一格一份脚本一次 spawn），读数 `tmp/pos/compare13.txt`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function diags(src: string): Promise<string[]> {
  return analyze(lower(await parseSource(src))).map((d) => d.message);
}

const H = "extends SceneTree\n\n";
const OUTER = "func p() -> Variant:\n\treturn 4\n\n";
const RUN = (body: string): string => `\nfunc _initialize():\n${body}\n\tquit()\n`;
const WANT = 'Function "p()" not found in base self.';
const INNER = (member: string): string => `${H}${OUTER}class C:\n${member}\n${RUN('\tprint(C.new())')}`;

describe("内部类调外层方法：五个位置同一句", () => {
  it("函数体（此前已接）", async () => {
    eq("373", "函数体", await diags(INNER("\tfunc go() -> Variant:\n\t\treturn p()")), [WANT]);
  });

  it("形参默认值", async () => {
    eq("373", "形参默认值", await diags(INNER("\tfunc go(a = p()) -> Variant:\n\t\treturn a")), [WANT]);
  });

  it("字段初值", async () => {
    eq("373", "字段初值", await diags(INNER("\tvar f = p()")), [WANT]);
  });

  it("getter 体", async () => {
    eq("373", "getter 体", await diags(INNER("\tvar x: Variant:\n\t\tget:\n\t\t\treturn p()")), [WANT]);
  });

  it("setter 体", async () => {
    eq("373", "setter 体", await diags(INNER("\tvar x: Variant:\n\t\tset(v):\n\t\t\tprint(p())")), [WANT]);
  });
});

describe("不许跟着一起拦的三格", () => {
  it("内部类调自己的方法", async () => {
    eq("373", "自己的方法", await diags(INNER("\tfunc q() -> Variant:\n\t\treturn 6\n\n\tfunc go() -> Variant:\n\t\treturn q()")), []);
  });

  it("内部类里同名的自己的方法盖住外层", async () => {
    eq("373", "同名遮蔽", await diags(INNER("\tfunc p() -> Variant:\n\t\treturn 6\n\n\tvar f = p()")), []);
  });

  it("setter 形参与外层方法同名：形参盖住它", async () => {
    eq("373", "形参遮蔽", await diags(INNER("\tvar x: Variant:\n\t\tset(p):\n\t\t\tprint(p())")), []);
  });

  it("模块级调自己那一层的方法（对照格）", async () => {
    eq("373", "模块级", await diags(`${H}${OUTER}${RUN('\tprint(p())')}`), []);
  });
});

// 内部类那一只眼睛能看见模块级的哪些名字：15 格逐名量的（尺 `tmp/probe-innerscope/round14.mts`，读数 `compare97.txt`，
// 出货端到端 15 格对照 `tmp/probe-innerscope/ours.mts` 不合 0）。看得见的是 const、enum 名、兄弟类、自己类的成员与信号；
// 看不见的是模块 func / var / signal / static var 与裸写的枚举成员名。
describe("内部类看得见的模块级名字：15 格逐名", () => {
  const SEE = "class Thing:\n\tfunc g():\n";
  const CALL = "\nfunc _initialize():\n\tvar t = Thing.new()\n\tt.g()\n\tquit()\n";

  const ROWS: Array<[string, string, string[]]> = [
    ["模块 var 看不见", `${H}var mod_v = 1\n\n${SEE}\t\tprint(mod_v)\n${CALL}`, ['Identifier "mod_v" not declared in the current scope.']],
    ["模块 signal 看不见", `${H}signal mod_sig\n\n${SEE}\t\tmod_sig.emit()\n${CALL}`, ['Identifier "mod_sig" not declared in the current scope.']],
    ["模块 static var 看不见", `${H}static var mod_s = 1\n\n${SEE}\t\tprint(mod_s)\n${CALL}`, ['Identifier "mod_s" not declared in the current scope.']],
    ["裸枚举成员名看不见", `${H}enum Col { RED = 1 }\n\n${SEE}\t\tprint(RED)\n${CALL}`, ['Identifier "RED" not declared in the current scope.']],
    ["模块 const 看得见", `${H}const MOD_C = 1\n\n${SEE}\t\tprint(MOD_C)\n${CALL}`, []],
    ["枚举名看得见", `${H}enum Col { RED = 1 }\n\n${SEE}\t\tprint(Col.RED)\n${CALL}`, []],
    ["兄弟类看得见", `${H}class Other:\n\tpass\n\n${SEE}\t\tprint(Other.new() != null)\n${CALL}`, []],
    ["全局类型名与全局函数看得见", `${SEE}\t\tprint(Vector2(1, 2) == Vector2(1, 2) and abs(-1))\n${CALL}`, []],
    ["自己类的信号看得见", `class Thing:\n\tsignal own_sig\n\tfunc g():\n\t\town_sig.emit()\n${CALL}`, []],
  ];

  it("九格按名对账", async () => {
    for (const [label, src, want] of ROWS) {
      eq("373", label, await diags(src), want);
    }
  });

  it("自己类的信号取值发的是装箱过的 this 字段", async () => {
    const ir = lower(await parseSource(`${H}class Thing:\n\tsignal own_sig\n\tfunc g():\n\t\town_sig.emit()\n${CALL}`));
    const code = emitModule(ir, { runtimeImport: "rt", hostImport: "host" });
    const thing = code.slice(code.indexOf("class Thing "), code.indexOf("const __gd_d_Thing"));
    eq("373", "信号取值要装箱", thing.includes("rt.wrapValue(this.own_sig)"), true);
    eq("373", "不再发裸标识符", thing.includes("rt.method(own_sig,"), false);
  });
});
