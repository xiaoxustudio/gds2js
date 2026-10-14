/**
 * 内部类调外层方法那一句在**五个位置**上都得响（S373）：函数体此前已接，字段初值、形参默认值、
 * getter 体与 setter 体这四处此前一路放到运行期才炸 `this.p is not a function`。
 * 尺 `tmp/probe-inner/round1.mts` 与 `tmp/pos/n{13,14}.gd`（一格一份脚本一次 spawn），读数 `tmp/pos/compare13.txt`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
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
