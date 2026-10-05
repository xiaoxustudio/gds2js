// 4.6.3 实测的 `char(n)` / `String.chr(n)`：码点不合法那一刻就换成 U+FFFD（不是打印层的事 ——
// `char(0).unicode_at(0)` 就是 65533、`length()` 还是 1），引擎同时往 stderr 打一句 Unicode parsing error，
// 所以这些格子只进 ops、不进语料。读数在 `tmp/probe-unknown-value/ch1.gd`、`tmp/probe-nul/nul.gd`。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, show, stringChr, valueEq, varToStr } from "@gds2js/runtime/runtime/values";
import { globalCallable, method } from "@gds2js/runtime/runtime/methods";
import { I } from "./support/variants";

const cp = (n: number | bigint): number => {
  const s = stringChr(I(n)).v as string;
  return s.codePointAt(0) ?? -1;
};
const bytes = (n: number | bigint): string => {
  const s = stringChr(I(n)).v as string;
  return Array.from(Buffer.from(s, "utf8")).join(",");
};
const callChar = (...args: Variant[]): Variant => method(globalCallable("char"), "call", args);

describe("runtime/char · 码点不合法就换 U+FFFD", () => {
  it("244 · 合法码点照本来的走，四类不合法一律 65533", async () => {
    eq("244", "0 与负数、代理区两位、超过 U+10FFFF 都成 U+FFFD", [cp(0), cp(-1), cp(0xd800), cp(0xdfff), cp(0xffffffff)].join("|"), "65533|65533|65533|65533|65533");
    eq("244", "1 / 65 / 0x7F / 0x80 / U+10FFFF 都保持自己", [cp(1), cp(65), cp(0x7f), cp(0x80), cp(0x10ffff)].join("|"), "1|65|127|128|1114111");
    eq("244", "长度都是 1 个码点，U+FFFD 建出来就是 U+FFFD（不是打印层再换的）", `${stringChr(I(0)).v === "\uFFFD"}|${(stringChr(I(0)).v as string).length}`, "true|1");
    eq("244", "UTF-8 字节：é 两支、U+FFFD 是 ef bf bd", `${bytes(233)}|${bytes(0)}|${bytes(65)}`, "195,169|239,191,189|65");
    eq("244", "与 String.chr 同一条：实测 h04 两格真", `${String(valueEq(callChar(I(0)), stringChr(I(0))))}|${String(valueEq(callChar(I(65)), stringChr(I(65))))}`, "true|true");
  });

  it("244 · 绕不开的那几支打印都跟着换", async () => {
    eq("244", "c_escape 不转义它（实测 h05：出来那一位还是 65533）", String(((method(stringChr(I(0)), "c_escape", []) as Variant).v as string).codePointAt(0)), "65533");
    eq("244", "var_to_str 打出来是「引号 + U+FFFD + 引号」三个字符", String(varToStr(stringChr(I(0))).length), "3");
    eq("244", "print 走的是同一串（JS 侧输出就是 utf8 的 ef bf bd）", show(stringChr(I(0))), "\uFFFD");
    eq("244", "拼进字符串里也不变回来：a + char(0) + b 是 3 个码点", String(("a" + (stringChr(I(0)).v as string) + "b").length), "3");
  });

  it("244 · char 也在「能当值用的全局函数名」那 79 支里", async () => {
    eq("244", "取值 typeof 25、打印 @GDScript::char（实测 h07）", `${String((method(globalCallable("char"), "is_valid", []) as Variant).v)}|${show(globalCallable("char"))}`, "true|@GDScript::char");
    eq("244", "get_argument_count 1、get_method 是 StringName 的 char", `${String((method(globalCallable("char"), "get_argument_count", []) as Variant).v)}|${(method(globalCallable("char"), "get_method", []) as Variant).v}`, "1|char");
    eq("244", ".call 两支实测（h08：65 与 65533）", `${(callChar(I(65)) as Variant).v}|${(callChar(I(0)) as Variant).v}`, "A|\uFFFD");
    eq("244", "等式按名字：char == char 真、char == len 假", `${String(valueEq(globalCallable("char"), globalCallable("char")))}|${String(valueEq(globalCallable("char"), globalCallable("len")))}`, "true|false");
    eq("244", "数组里装着 char 的结果也照 U+FFFD（数组打印给字符串加引号）", show(V.array(GArray.of([callChar(I(0)), callChar(I(65))]))), '["\uFFFD", "A"]');
  });
});
