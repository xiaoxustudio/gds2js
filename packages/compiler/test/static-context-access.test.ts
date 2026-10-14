/**
 * static 语境的准入面（S372）：静态函数体、静态变量初值、静态读写器体三处的 `self` 与非静态成员各给哪一句。
 * 尺 `tmp/probe-static/round1.mts`（一格一份脚本一次 spawn），读数 `tmp/pos/compare12.txt` + 逐格原文 `tmp/pos/static-*.txt`。
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
const INST = "var iv = 1\n\nfunc p() -> Variant:\n\treturn 2\n\n";
const RUN = (body: string): string => `\nfunc _initialize():\n${body}\n\tquit()\n`;
const SELF_ERR = 'Cannot use "self" inside a static function.';

describe("静态变量初值那一形", () => {
  it("调非静态函数：初值那一句", async () => {
    eq("372", "初值调非静态函数", await diags(`${H}${INST}static var x = p()\n${RUN('\tprint(x)')}`), [
      'Cannot call non-static function "p()" from a static variable initializer.',
    ]);
  });

  it("读非静态变量：初值那一句", async () => {
    eq("372", "初值读非静态变量", await diags(`${H}${INST}static var x = iv\n${RUN('\tprint(x)')}`), [
      'Cannot access non-static variable "iv" from a static variable initializer.',
    ]);
  });

  it("初值里的 self 不拒（实测给 typeof 0）", async () => {
    eq("372", "初值里的 self", await diags(`${H}${INST}static var x = typeof(self)\n${RUN('\tprint(x)')}`), []);
  });
});

describe("静态函数体那一形", () => {
  it("self 两句形状都拒", async () => {
    eq("372", "函数体 typeof(self)", await diags(`${H}${INST}static func f() -> Variant:\n\treturn typeof(self)\n${RUN('\tprint(f())')}`), [SELF_ERR]);
    eq("372", "函数体 self 赋给局部", await diags(`${H}${INST}static func f() -> Variant:\n\tvar a = self\n\treturn a\n${RUN('\tprint(f())')}`), [SELF_ERR]);
  });

  it("读非静态变量仍是原来那一句", async () => {
    eq("372", "函数体读非静态变量", await diags(`${H}${INST}static func f() -> Variant:\n\treturn iv\n${RUN('\tprint(f())')}`), [
      'Cannot access non-static variable "iv" from the static function "f()".',
    ]);
  });
});

describe("静态读写器体那一形（合成函数名进句子）", () => {
  const GET = (body: string): string => `${H}${INST}static var thing: Variant:\n\tget:\n${body}\n${RUN('\tprint(thing)')}`;
  const SET = (body: string): string => `${H}${INST}static var thing: Variant:\n\tset(v):\n${body}\n${RUN('\tthing = 5')}`;

  it("getter 体里的 self", async () => {
    eq("372", "getter 体 self", await diags(GET("\t\treturn typeof(self)")), [SELF_ERR]);
  });

  it("setter 体里的 self", async () => {
    eq("372", "setter 体 self", await diags(SET("\t\tprint(typeof(self))")), [SELF_ERR]);
  });

  it("getter 体读非静态变量：合成名 @thing_getter()", async () => {
    eq("372", "getter 体读非静态变量", await diags(GET("\t\treturn iv")), [
      'Cannot access non-static variable "iv" from the static function "@thing_getter()".',
    ]);
  });

  it("setter 体写非静态变量：合成名 @thing_setter()", async () => {
    eq("372", "setter 体写非静态变量", await diags(SET("\t\tiv = v")), [
      'Cannot access non-static variable "iv" from the static function "@thing_setter()".',
    ]);
  });

  it("getter 体调非静态函数", async () => {
    eq("372", "getter 体调非静态函数", await diags(GET("\t\treturn p()")), [
      'Cannot call non-static function "p()" from the static function "@thing_getter()".',
    ]);
  });

  it("setter 的形参遮蔽同名字段：不拒", async () => {
    const src = `${H}${INST}static var thing: Variant:\n\tset(iv):\n\t\tprint(iv)\n${RUN('\tthing = 5')}`;
    eq("372", "形参遮蔽", await diags(src), []);
  });
});

describe("内部类里的静态语境同一套口径", () => {
  it("内部类静态函数体里的 self", async () => {
    const src = `${H}class C:\n\tvar iv = 1\n\n\tstatic func f() -> Variant:\n\t\treturn typeof(self)\n${RUN('\tprint(C.f())')}`;
    eq("372", "内部类静态函数", await diags(src), [SELF_ERR]);
  });

  it("内部类静态变量初值读非静态字段", async () => {
    const src = `${H}class C:\n\tvar iv = 1\n\n\tstatic var x = iv\n${RUN('\tprint(C.x)')}`;
    eq("372", "内部类静态初值", await diags(src), [
      'Cannot access non-static variable "iv" from a static variable initializer.',
    ]);
  });
});
