// 由 tools/ops-check.ts 机械搬迁：region 392-410, 412-429, 430-442, 546-584, 605-618, 619-628, 629-658, 659-694, 874-895, 913-938, 940-956, 958-970, 972-996, 998-1033, 1896-1944, 2122-2141, 2143-2187, 2189-2214。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { lengthOf, toInt } from "@gds2js/runtime/runtime/builtins";
import { index, method } from "@gds2js/runtime/runtime/methods";
import { isLess, ops, strOps } from "@gds2js/runtime/runtime/ops";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, keyOf, show, strBinToInt, strCase, strCaseStyle, strCapitalize, strCEscape, strCount, strEndsWith, strEraseAt, strFind, strFloat, strGetSlice, strInsertAt, strIsValidFilename, strGetSlicec, strPadZeros, strRepeat, strStartsWith, strStripEdges, strUriDecode, strUnicodeAt, strUriEncode, strFormat, strReplace, stringCtor, stringNameCtor, stringStatic, truthyOf, valueEq } from "@gds2js/runtime/runtime/values";
import { F, I, S } from "./support/variants";

describe("runtime/values · String 方法族", () => {
  it("061 · 😀 < U+FFFF 为 false", async () => {
    const EMO = String.fromCodePoint(0x1f600);
    const S = (s: string) => V.str(s);
    eq("061", "😀 < U+FFFF 为 false", show(ops.lt(S(EMO), S("\uFFFF"))), "false");
    eq("061", "U+FFFF < 😀 为 true", show(ops.lt(S("\uFFFF"), S(EMO))), "true");
    eq("061", "😀 > U+FFFF 为 true", show(ops.gt(S(EMO), S("\uFFFF"))), "true");
    eq("061", "z < 😀 为 true", show(ops.lt(S("z"), S(EMO))), "true");
    eq("061", "快路 apple < z", show(ops.lt(S("apple"), S("z"))), "true");
    eq("061", "快路 前缀短者小", show(ops.lt(S("ab"), S("abc"))), "true");
    eq("061", "快路相等", show(ops.eq(S("abc"), S("abc"))), "true");
    const g = GArray.of([S(EMO), S("\uFFFF"), S("z"), S("apple")]);
    g.sort();
    eq(
      "061",
      "含 emoji 的字符串数组按码点排序",
      g.raw().map((v) => show(v)).join("|"),
      "apple|z|\uFFFF|" + EMO,
    );
  });

  it("063 · %f 默认 6 位小数", async () => {
    const F = (fmt: string, args: unknown[]) => strFormat(fmt, args as never);
    eq("063", "%f 默认 6 位小数", F("%f", [V.float(3.5)]), "3.500000");
    eq("063", "%d 收 float 向零截断", F("%d", [V.float(-3.7)]), "-3");
    eq("063", "%.0f 四舍五入远离零", F("%.0f", [V.float(2.5)]), "3");
    eq("063", "%% 出字面百分号", F("50%% of %d", [V.int(7)]), "50% of 7");
    eq("063", "%05d 负数符号在前", F("%05d", [V.int(-42)]), "-0042");
    eq("063", "%x 负数给符号加绝对值", F("%x", [V.int(-1)]), "-1");
    shouldThrow("063", "%i 不支持要抛", () => F("%i", [V.int(1)]));
    shouldThrow("063", "%e 不支持要抛", () => F("%e", [V.float(1)]));
    shouldThrow("063", "%g 不支持要抛", () => F("%g", [V.float(1)]));
    shouldThrow("063", "# 标志不支持要抛", () => F("%#x", [V.int(1)]));
    shouldThrow("063", "%d 收字符串要抛", () => F("%d", [V.str("abc")]));
    shouldThrow("063", "%f 收字符串要抛", () => F("%f", [V.str("abc")]));
    shouldThrow("063", "%x 收 float 未实测要抛", () => F("%x", [V.float(3.5)]));
    shouldThrow("063", "参数不足要抛", () => F("%d %d", [V.int(1)]));
    eq("063", "实参多余则原样返回格式串", F("%d", [V.int(1), V.int(2)]), "%d");
  });

  it("064 · inf 渲染", async () => {

    eq("064", "inf 渲染", strFloat(Infinity), "inf");
    eq("064", "-inf 渲染", strFloat(-Infinity), "-inf");
    eq("064", "nan 渲染", strFloat(NaN), "nan");
    eq("064", "溢出成 inf 后照渲染", strFloat(1e308 * 10), "inf");
    eq("064", "1e21 精确展开", strFloat(1e21), "1000000000000000000000.0");
    eq(
      "064",
      "1e300 按 Godot 取 17 位有效数字再展开（不是 double 的精确值）",
      strFloat(1e300),
      "10000000000000001" + "0".repeat(284) + ".0",
    );
  });

  it("017 +3 · str(0.0/0.0)", async () => {
    eq("017", "str(0.0/0.0)", strOps.float(NaN), "nan");
    eq("017", "1.0/0.0", strOps.float(Infinity), "inf");
    eq("017", "-1.0/0.0", strOps.float(-Infinity), "-inf");
    eq("064", "15 位有效数字", strFloat(1.2345678901234567), "1.23456789012346");
    eq("064", "12345.678901234567", strFloat(12345.678901234567), "12345.6789012346");
    eq("064", "小数位夹到 2 位", strFloat(1234567890123.45), "1234567890123.45");
    eq("017", "1e30 整数值精确展开", strFloat(1e30), "1000000000000000000000000000000.0");

    eq("018", "\"hello\"[0]", strOps.at("hello", 0), "h");
    eq("018", "length()", strOps.length("hello"), 5);
    eq("018", "substr(1,3)", strOps.substr("hello", 1, 3), "ell");
    eq("018", "to_upper()", strCase("hello", "upper"), "HELLO");
    eq("018", "\"%d/%s\"%[5,\"x\"]", strOps.format("%d/%s", [I(5), S("x")]), "5/x");
    eq("018", "UTF-32 length（emoji 算 1 个码点）", strOps.length("a\u{1F600}"), 2);

    eq("226", "replace 全量替换", strReplace("hello", "l", "L"), "heLLo");
    eq("226", "replace 分大小写", strReplace("hello", "L", "l"), "hello");
    eq("226", "replacen 不分大小写", strReplace("HELLO hello", "l", "1", true), "HE11O he11o");
    eq("226", "replace 左起、不重叠", `${strReplace("aaa", "aa", "b")}|${strReplace("aaaa", "aa", "b")}`, "ba|bb");
    eq("226", "replace 空 what 原样返回", strReplace("hello", "", "X"), "hello");
    eq("226", "replace 空 by 是删除", strReplace("hello", "l", ""), "heo");
    eq("226", "find 命中位含起点", `${strFind("hello", "l", 1, false)}|${strFind("hello", "l", 2, false)}|${strFind("hello", "l", 3, false)}`, "2|2|3");
    eq("226", "find 空 needle 恒 -1", strFind("hello", "", 0, false), -1);
    eq("226", "find 负 from 按「可落点数」折回", strFind("hello", "ll", -2, false), 2);
    eq("226", "find 折完仍为负就没命中", strFind("hello", "ll", -6, false), -1);
    eq("226", "rfind 默认从尾（-1）", strFind("hello", "l", -1, true), 3);
    eq("226", "rfind 越过最后一个可落点直接 -1", strFind("0123456789", "456", 8, true), -1);
    eq("226", "rfind 同一个 -1 却能命中", strFind("0123456789", "456", -1, true), 4);
    eq("226", "find/rfind 的负 from 分界不对称", `${strFind("0123456789", "456", -4, false)}|${strFind("0123456789", "456", -4, true)}`, "4|4");
    eq("226", "码点下标：emoji 不当两个", strFind("\u{1F600}a\u{1F600}", "a", 0, false), 1);
  });

  it("226 · capitalize 单词首字母", async () => {

    eq("226", "capitalize 单词首字母", strCapitalize("hello world"), "Hello World");
    eq("226", "capitalize 把连续大写拆成多词", strCapitalize("hELLo wORLd"), "H El Lo W Or Ld");
    eq("226", "capitalize 拆 AAa 这类前缀", `${strCapitalize("AAa")}|${strCapitalize("AAAa")}|${strCapitalize("aAA")}`, "A Aa|Aa Aa|A Aa");
    eq("226", "capitalize 下划线/连字符折成空格", `${strCapitalize("test_case")}|${strCapitalize("test-case")}`, "Test Case|Test Case");
    eq("226", "capitalize 点号不折", strCapitalize("test.case"), "Test.case");
    eq("226", "capitalize 数字两侧都拆词", `${strCapitalize("hello123world")}|${strCapitalize("I23")}|${strCapitalize("2aA")}`, "Hello 123 World|I 23|2a A");
    eq("226", "capitalize 首尾空白抹掉", `${strCapitalize("  hello  world  ")}|${strCapitalize("   ")}|${strCapitalize("")}`, "Hello World||");
    eq("226", "capitalize 不照顾罗马数字", strCapitalize("xi ii iii iv v vi vii viii ix x"), "Xi Ii Iii Iv V Vi Vii Viii Ix X");
    eq("226", "capitalize 非 ASCII 数字不拆词也不开大写", strCapitalize("\u0660ab"), "\u0660ab");
    eq("226", "capitalize ASCII 数字才拆词", strCapitalize("0ab"), "0 Ab");
    eq("226", "capitalize 词内一律降档", strCapitalize("McDonald"), "Mc Donald");
    eq("226", "capitalize 首码元取简单大写（标题大写字母也一样）", strCapitalize("\u01C5 digraph"), "\u01C4 Digraph");
    eq("226", "capitalize 希腊终 s 升档", strCapitalize("\u03C2 end"), "\u03A3 End");
  });

  it("226 · String.replace 走 method 分发", async () => {
    const s = V.str("hello");
    eq("226", "String.replace 走 method 分发", show(method(s, "replace", [V.str("l"), V.str("L")])), "heLLo");
    eq("226", "String.find 走 method 分发", show(method(s, "find", [V.str("l"), I(3)])), "3");
    eq("226", "String.rfind 缺省 from=-1", show(method(s, "rfind", [V.str("l")])), "3");
    eq("226", "String.capitalize 走 method 分发", show(method(V.str("ab cd"), "capitalize", [])), "Ab Cd");
    shouldThrow("226", "replace 只收 2 个参数", () => method(s, "replace", [V.str("l"), V.str("L"), V.bool(false)]));
    shouldThrow("226", "replace 少一个参数就抛", () => method(s, "replace", [V.str("l")]));
    shouldThrow("226", "capitalize 不接受参数", () => method(V.str("ab"), "capitalize", [I(1)]));
  });

  it("234 · get_slice 无分隔符时整串就是那一段", async () => {

    eq("234", "get_slice 无分隔符时整串就是那一段", `${strGetSlice("abc", "/", 0)}|${strGetSlice("abc", "/", 9)}`, "abc|abc");
    eq("234", "get_slice 负数与越界给空", `[${strGetSlice("a/b/c", "/", -1)}][${strGetSlice("a/b/c", "/", 3)}]`, "[][]");
    eq("234", "get_slice 空分隔符给空", strGetSlice("a/b", "", 0), "");
    eq("234", "get_slice 多字符分隔符", strGetSlice("ab-cd-ef", "cd", 1), "-ef");
    eq("234", "insert 负位置原样、超末尾接尾", `${strInsertAt("ac", -1, "b")}|${strInsertAt("ac", 9, "b")}`, "ac|acb");
    eq("234", "erase 负起点给空串", strEraseAt("abc", -1, 1), "");
    eq("234", "erase 零长与起点越界都不动", `${strEraseAt("abc", 1, 0)}|${strEraseAt("abc", 5, 1)}`, "abc|abc");
    eq("234", "repeat 非正数给空串", `[${strRepeat("ab", 0)}][${strRepeat("ab", -2)}]`, "[][]");
    eq("234", "unicode_at 越界与负数给 0", `${strUnicodeAt("abc", 3)}|${strUnicodeAt("abc", -1)}|${strUnicodeAt("", 0)}`, "0|0|0");
    eq("234", "unicode_at 按码点走", `${strUnicodeAt("\u{1F600}a", 0)}|${strUnicodeAt("\u{1F600}a", 1)}`, "128512|97");
    eq("234", "bin_to_int 只认负号", `${strBinToInt("+101")}|${strBinToInt("-101")}`, "0|-5");
    eq("234", "bin_to_int 混进非 01 就整串判 0", `${strBinToInt("10a0")}|${strBinToInt("1_0")}|${strBinToInt(" 101")}`, "0|0|0");
    eq("234", "bin_to_int 认 0b 前缀", strBinToInt("0b101"), 5n);
    eq("234", "bin_to_int 溢出饱和到 INT64_MAX", `${strBinToInt("1".repeat(64))}|${strBinToInt("-" + "1".repeat(63))}`, "9223372036854775807|-9223372036854775807");

    eq("234", "count 非重叠", `${strCount("aaaa", "aa")}|${strCount("aaa", "aa")}`, "2|1");
    eq("234", "count 空针子给 0", `${strCount("hello", "")}|${strCount("", "")}`, "0|0");
    eq("234", "countn 不分大小写", strCount("HELLO hello", "l", true), 4);
    eq("234", "空针子恒真", `${strStartsWith("abc", "")}|${strEndsWith("abc", "")}`, "true|true");
    eq("234", "begins_with 针子更长即假", strStartsWith("abc", "abcd"), false);
    eq("234", "strip_edges 只裁两端不碰中间", strStripEdges("  a\tb\r\n "), "a\tb");
    eq("234", "strip_edges 不动高位空白", strStripEdges(" a "), " a ");
    eq("234", "uri_encode 保留集", `${strUriEncode("a-z0.~_!")}|${strUriEncode("*'")}`, "a-z0.~_%21|%2A%27");
    eq("234", "uri_encode 非 ASCII 走字节", strUriEncode("\t"), "%09");
    eq("234", "c_escape 只转实测那十个", strCEscape("a\n\""), "a\\n\\\"");

    eq("234", "case_style 三种拼法", `${strCaseStyle("fooBar_baz", "kebab")}|${strCaseStyle("ABCdef", "snake")}|${strCaseStyle("_foo bar", "camel")}`, "foo-bar-baz|ab_cdef|fooBar");
    eq("234", "case_style 数字与点号", `${strCaseStyle("a1_b2", "snake")}|${strCaseStyle("XMLHttpRequest", "snake")}|${strCaseStyle("a.b", "kebab")}`, "a_1_b_2|xml_http_request|a.b");
    eq("234", "文件名非法字符表", `${strIsValidFilename("a/b")}|${strIsValidFilename("a b")}|${strIsValidFilename("con")}|${strIsValidFilename("")}`, "false|true|true|false");
  });

  it("234 · get_slice 走 method 分发", async () => {
    const s = V.str("a/b/c");
    eq("234", "get_slice 走 method 分发", show(method(s, "get_slice", [V.str("/"), I(1)])), "b");
    eq("234", "count 走 method 分发", show(method(V.str("hello"), "count", [V.str("l")])), "2");
    eq("234", "casecmp_to 走 method 分发", show(method(V.str("a"), "casecmp_to", [V.str("B")])), "1");
    shouldThrow("234", "count 的 chars 真值响亮拒", () => method(V.str("hello"), "count", [V.str("l"), V.bool(true)]));
    shouldThrow("234", "count 的第 3 个参数没量过", () => method(V.str("hello"), "count", [V.str("l"), V.bool(false), I(1)]));
    eq("234", "pad_zeros 以小数点为界补零", `${strPadZeros("0.5", 3)}|${strPadZeros(".5", 3)}|${strPadZeros("5", 3)}`, "000.5|.5|005");
    eq("234", "pad_zeros 跳过前导非数字再插到数字段开头", `${strPadZeros("--5", 2)}|${strPadZeros("+5", 3)}|${strPadZeros(" 5", 3)}|${strPadZeros("-.5", 3)}`, "--05|+005| 005|-000.5");
    eq("234", "pad_zeros 界内没数字就是往后贴", `${strPadZeros("abc", 5)}|${strPadZeros("x", 3)}|${strPadZeros("a.b", 5)}`, "abc00000|x000|a00000.b");
    eq("234", "pad_zeros 够宽、空串都不动", `${strPadZeros("12", 2)}|${strPadZeros("12345", 3)}|${strPadZeros("", 3)}`, "12|12345|");
    eq("234", "pad_zeros 走 method 分发", show(method(V.str("0.5"), "pad_zeros", [I(3)])), "000.5");
    eq("234", "similarity 是交叠 bigram 的 Dice 系数（引擎读数 1.5 那格）", show(method(V.str("aaaa"), "similarity", [V.str("aa")])), "1.5");
    eq("234", "similarity 的返回是 float32（4/3 那格）", show(method(V.str("aaaaa"), "similarity", [V.str("aaa")])), "1.33333337306976");
    eq("234", "similarity 无公共 bigram", show(method(V.str("abc"), "similarity", [V.str("axc")])), "0.0");
    eq("234", "similarity hello/hallo", show(method(V.str("hello"), "similarity", [V.str("hallo")])), "0.5");
    eq("234", "similarity 分大小写", show(method(V.str("Hello"), "similarity", [V.str("hello")])), "0.75");
    eq("234", "similarity kitten/sitting", show(method(V.str("kitten"), "similarity", [V.str("sitting")])), "0.36363637447357");
    eq("234", "similarity hello/hell", show(method(V.str("hello"), "similarity", [V.str("hell")])), "0.85714286565781");
    eq("234", "similarity 一边是另一边的前缀", show(method(V.str("abcde"), "similarity", [V.str("abcdefgh")])), "0.72727274894714");
    eq("234", "similarity 全等先给 1（空串也算全等）", `${show(method(V.str("abc"), "similarity", [V.str("abc")]))}|${show(method(V.str(""), "similarity", [V.str("")]))}`, "1.0|1.0");
    eq("234", "similarity 任一边不足两个码点给 0", `${show(method(V.str("a"), "similarity", [V.str("ab")]))}|${show(method(V.str(""), "similarity", [V.str("ab")]))}`, "0.0|0.0");
    eq("234", "uri_decode 只认 0-9 与 A-Z 当 hex 位", `${strUriDecode("%2F")}|${strUriDecode("%2f")}`, "/|2f");
    eq("234", "uri_decode 第一位不合式就留下百分号", `${strUriDecode("%%41")}|${strUriDecode("%zz")}`, "%A|%zz");
    eq("234", "uri_decode 的「还剩两位」是严格小于", `${strUriDecode("a%41")}|${strUriDecode("x%4")}|${strUriDecode("%%4")}`, "aA|x%4|%%4");
    eq("234", "uri_decode 的 strtol 是部分解析，撞 NUL 就截断", `${strUriDecode("%G1")}|${strUriDecode("%4Z")}`, "|\u0004");
    eq("234", "uri_decode 把加号换成空格", `${strUriDecode("a+b")}|${strUriDecode("+")}|${strUriDecode("%25")}`, "a b| |%");
    eq("234", "uri_decode 多字节按 UTF-8 重组成一个码点", `${strUriDecode("%C3%A9")}|${strUriDecode("%F0%9F%98%80")}|${strUriDecode("%41%42%43")}`, "é|😀|ABC");
    eq("234", "uri_decode 非法字节给一个 U+FFFD", strUriDecode("%FF"), "\uFFFD");
    eq("234", "uri_decode 走 method 分发", show(method(V.str("a%2"), "uri_decode", [])), "a%2");
    eq("234", "get_slicec 的分隔符是码点不是串", `${strGetSlicec("a/b/c", 47, 0)}|${strGetSlicec("a/b/c", 47, 1)}|${strGetSlicec("a/b/c", 47, 2)}|${strGetSlicec("a.b", 46, 1)}`, "a|b|c|b");
    eq("234", "get_slicec 负段号与越界给空串", `${strGetSlicec("a/b/c", 47, -1)}|${strGetSlicec("a/b/c", 47, 5)}|${strGetSlicec("1,2", 44, 9)}`, "||");
    eq("234", "get_slicec 空串与空段", `${strGetSlicec("", 47, 0)}|${strGetSlicec("a//b", 47, 1)}`, "|");
    eq("234", "get_slicec 找不到分隔符：0 段是整串、其余空", `${strGetSlicec("abc", 1, 0)}|${strGetSlicec("abc", 1, 3)}`, "abc|");
    eq("234", "get_slicec 走 method 分发", show(method(V.str("a/b/c"), "get_slicec", [I(47), I(1)])), "b");
  });

  it("072 · \\u00DF 上档保持", async () => {
    eq("072", "\u00DF 上档保持", strCase("\u00DF", "upper"), "\u00DF");
    eq("072", "\u00DF 下档保持", strCase("\u00DF", "lower"), "\u00DF");
    eq("072", "\uFB00 上档保持（旧实现响亮报缺）", strCase("\uFB00", "upper"), "\uFB00");
    eq("072", "\uFB01 上档保持（旧实现响亮报缺）", strCase("\uFB01", "upper"), "\uFB01");
    eq("072", "\uFB13 上档保持（亚美尼亚连字）", strCase("\uFB13", "upper"), "\uFB13");
    eq("072", "\u0130 下档给单个 i", strCase("\u0130", "lower"), "i");
    eq("072", "\u0130 上档保持", strCase("\u0130", "upper"), "\u0130");
    eq("072", "\u0131 上档给 I", strCase("\u0131", "upper"), "I");
    eq("072", "\u01F3 上档给单码点 \u01F1", strCase("\u01F3", "upper"), "\u01F1");
    eq("072", "\u01C5 上档给 \u01C4", strCase("\u01C5", "upper"), "\u01C4");
    eq("072", "\u0149 上档不被拆成 \u02BCN", strCase("\u0149", "upper"), "\u0149");
    eq("072", "\u0390 上档不被拆成 \u0399..", strCase("\u0390", "upper"), "\u0390");
    eq("072", "\u1FBC 下档给 \u1FB3", strCase("\u1FBC", "lower"), "\u1FB3");
    eq("072", "\uA7CE 下档不被 JS 改成 \uA7CF", strCase("\uA7CE", "lower"), "\uA7CE");
    eq("072", "\uA7CF 上档不被 JS 改成 \uA7CE", strCase("\uA7CF", "upper"), "\uA7CF");
    eq("072", "Bassa Vah 下档保持（JS 会互映射）", strCase("\u{16EA0}", "lower"), "\u{16EA0}");
    eq("072", "Bassa Vah 上档保持", strCase("\u{16EBB}", "upper"), "\u{16EBB}");
    eq("072", "Straße 上档只改日常字母", strCase("Stra\u00DFe", "upper"), "STRA\u00DFE");
    eq("072", "日常 ASCII 仍走 JS 单码点结果", strCase("hello", "upper"), "HELLO");
    eq("072", "无映射字符两边都保持", strCase("\u4E2D\u{1F600}", "upper"), "\u4E2D\u{1F600}");
  });

  it("076 · chr(65) 是 A", async () => {
    const S = (v: Variant) => v.v as string;
    const str = (x: string) => V.str(x);
    const FF = String.fromCharCode(0xfffd);
    eq("076", "chr(65) 是 A", S(stringStatic("chr", [I(65)])), "A");
    eq("076", "chr(0x1F600) 是 emoji", S(stringStatic("chr", [I(0x1f600)])), "\u{1F600}");
    eq("076", "chr(0) 被换成 U+FFFD", S(stringStatic("chr", [I(0)])), FF);
    eq("076", "chr(-1) 被换成 U+FFFD", S(stringStatic("chr", [I(-1)])), FF);
    eq("076", "chr(0xD800) 代理区换 U+FFFD", S(stringStatic("chr", [I(0xd800)])), FF);
    eq("076", "chr(0x10FFFF) 还在上界内", S(stringStatic("chr", [I(0x10ffff)])), String.fromCodePoint(0x10ffff));
    eq("076", "chr 的 bigint 载荷越界换 U+FFFD", S(stringStatic("chr", [I(9007199254740993n)])), FF);
    eq("076", "chr(2.7) 向零截断", S(stringStatic("chr", [F(2.7)])), S(stringStatic("chr", [I(2)])));
    eq("076", "chr(true) 当 1", S(stringStatic("chr", [V.bool(true)])), S(stringStatic("chr", [I(1)])));
    eq("076", "num(42) 走浮点格式", S(stringStatic("num", [I(42)])), "42.0");
    eq("076", "num(-0.0) 保住符号（print 不给）", S(stringStatic("num", [F(-0)])), "-0.0");
    eq("076", "num(0.0) 仍是 0.0", S(stringStatic("num", [F(0)])), "0.0");
    eq("076", "num(1e20) 与 str 同路", S(stringStatic("num", [F(1e20)])), strFloat(1e20));
    eq("076", "num_int64 逐位精确", S(stringStatic("num_int64", [I(9007199254740993n)])), "9007199254740993");
    eq("076", "num_int64 也向零截断", S(stringStatic("num_int64", [F(1.7)])), "1");
    eq("076", "String 构造器原样返回", S(stringCtor([str("x")])), "x");
    shouldThrow("076", "chr 不接受 String 参数", () => stringStatic("chr", [str("65")]));
    shouldThrow("076", "num 不接受 String 参数", () => stringStatic("num", [str("1.5")]));
    shouldThrow("076", "没实现的静态成员要响", () => stringStatic("md5_text", [str("abc")]));
    shouldThrow("076", "没有 String(int) 构造器", () => stringCtor([I(1)]));
    shouldThrow("076", "String() 只接受一个参数", () => stringCtor([]));
  });

  it("077 · num_scientific(1e-7) 指数补两位", async () => {
    const SC = (n: number) => ((stringStatic("num_scientific", [F(n)]) as Variant).v as string);
    eq("077", "num_scientific(1e-7) 指数补两位", SC(1e-7), "1e-07");
    eq("077", "num_scientific(1e-5)", SC(1e-5), "1e-05");
    eq("077", "1e-4 还在普通区", SC(1e-4), "0.0001");
    eq("077", "1e14 用普通展开", SC(1e14), "100000000000000");
    eq("077", "1e15 起走科学计数法", SC(1e15), "1e+15");
    eq("077", "1e-20 两位以上指数原样", SC(1e-20), "1e-20");
    eq("077", "尾数是最短可回读", SC(9.9999999e-7), "9.9999999e-07");
    eq("077", "0 不给 .0", SC(0), "0");
    eq("077", "inf / nan 与 str 同名", `${SC(Infinity)}/${SC(NaN)}`, "inf/nan");
    eq("077", "int 实参先收数", (stringStatic("num_scientific", [I(42)]) as Variant).v, "42");
  });

  it("078 · 0 给 0 B", async () => {
    const HZ = (v: Variant) => ((stringStatic("humanize_size", [v]) as Variant).v as string);
    eq("078", "0 给 0 B", HZ(I(0)), "0 B");
    eq("078", "1024 仍是整数档", HZ(I(1024)), "1024 B");
    eq("078", "1025 进 KiB 且截断", HZ(I(1025)), "1.00 KiB");
    eq("078", "1075 截成 1.04 不是 1.05", HZ(I(1075)), "1.04 KiB");
    eq("078", "102400 只留一位", HZ(I(102400)), "100.0 KiB");
    eq("078", "1048576 停在 KiB 档不留小数", HZ(I(1048576)), "1024 KiB");
    eq("078", "1048577 才升到 MiB", HZ(I(1048577)), "1.00 MiB");
    eq("078", "int64 上界给 8.00 EiB", HZ(I(9223372036854775807n)), "8.00 EiB");
    eq("078", "负数按 uint64 解释", HZ(I(-1024)), "16.00 EiB");
    shouldThrow("078", "humanize_size 缺参数要响", () => stringStatic("humanize_size", []));
  });

  it("079 · print 是裸串", async () => {
    const sn = (x: string) => V.stringName(x);
    eq("079", "print 是裸串", show(sn("abc")), "abc");
    eq("079", "装进数组要带 &\"…\"", show(V.array(GArray.of([sn("abc")]))), '[&"abc"]');
    {
      const d = new GDict();
      d.set(sn("k"), I(1));
      eq("079", "字典里的键带前缀", show(V.dict(d)), '{ &"k": 1 }');
      eq("079", "String 键能查到 StringName 键", show(d.get(S("k"))), "1");
    }
    eq("079", "键与等值 String 合一", keyOf(sn("k")) === keyOf(S("k")), true);
    eq("079", "与等值 String 相等", valueEq(sn("abc"), S("abc")), true);
    eq("079", "相等仍是大小写敏感", valueEq(sn("A"), sn("a")), false);
    eq("079", "空 StringName 为假", truthyOf(sn("")), false);
    eq("079", "len 同 String", show(lengthOf(sn("abc"))), "3");
    eq("079", "方法转发后拿到的是 String 而非 StringName", method(sn("abc"), "to_upper", []).t, Tag.STRING);
    eq("079", "混着加结果是 String", ops.add(sn("a"), S("b")).t, Tag.STRING);
    eq("079", "String(&\"k\") 降成 String", stringCtor([sn("k")]).t, Tag.STRING);
    shouldThrow("079", "StringName 不能下标（Godot: Invalid access to property or key）", () => index(sn("abc"), I(0)));
    shouldThrow("079", "StringName 与 String 混比大小（Godot 当场炸）", () => isLess(sn("a"), S("b")));
    shouldThrow("079", "两个 StringName 比大小也无口径（Godot 按内部指针序：&\"zzz\" < &\"abc\" 为真）", () =>
      isLess(sn("zzz"), sn("abc")),
    );
    shouldThrow("079", "StringName(42) 没有这个构造器", () => stringNameCtor([I(1)]));
  });

  it("079 · left(2)", async () => {
    const EMO = String.fromCodePoint(0x1f45d);
    const sm = (base: string, name: string, args: Variant[]) => method(S(base), name, args);
    const L = (n: number, base = "abc") => show(sm(base, "left", [I(n)]));
    const R = (n: number, base = "abc") => show(sm(base, "right", [I(n)]));
    const SP = (base: string, delim: string, allow?: Variant) =>
      show(sm(base, "split", allow === undefined ? [S(delim)] : [S(delim), allow]));
    eq("079", "left(2)", L(2), "ab");
    eq("079", "left(0) 空串", L(0), "");
    eq("079", "left 超界给整串", L(5), "abc");
    eq("079", "left(-1) 是各丢一个而非从尾部数", L(-1), "ab");
    eq("079", "left(-5) 夹成空", L(-5), "");
    eq("079", "right(2)", R(2), "bc");
    eq("079", "right(-1)", R(-1), "bc");
    eq("079", "right(-2)", R(-2), "c");
    eq("079", "left 按码点：emoji 不拦腰", L(1, `${EMO}xy`), EMO);
    eq("079", "contains 空针不算命中（JS 的 includes 会给 true）", show(sm("abc", "contains", [S("")])), "false");
    eq("079", "contains 命中", show(sm("abc", "contains", [S("bc")])), "true");
    eq("079", "contains 大小写敏感", show(sm("abc", "contains", [S("A")])), "false");
    eq("079", "is_empty 只对空串", `${show(sm("", "is_empty", []))}/${show(sm("a", "is_empty", []))}`, "true/false");
    eq("079", "substr 缺长度截到串尾", show(sm("abc", "substr", [I(2)])), "c");
    eq("079", "substr 负起点给空串（JS slice 会从尾部数）", show(sm("abc", "substr", [I(-2)])), "");
    eq("079", "substr 负长度截到串尾", show(sm("abc", "substr", [I(0), I(-1)])), "abc");
    eq("079", "substr 越界给空串", show(sm("abc", "substr", [I(5)])), "");
    eq("079", "split 保留空片段", SP("a,b,c", ","), '["a", "b", "c"]');
    eq("079", "split 中间的空串留着", SP("a,,b", ","), '["a", "", "b"]');
    eq("079", "split 末尾的空串也留着", SP("a,b,", ","), '["a", "b", ""]');
    eq("079", "split allow_empty=false 丢掉全部空片段", SP("a,,b", ",", V.bool(false)), '["a", "b"]');
    eq("079", "空串 split 出一个空片段", SP("", ","), '[""]');
    eq("079", "空串 split 空分隔符也是空片段", SP("", ""), '[""]');
    eq("079", "空分隔符逐码点切", SP("abc", ""), '["a", "b", "c"]');
    eq("079", "分隔符不命中给整串", SP("abc", "x"), '["abc"]');
    eq("079", "含 emoji 的串按码点切", SP(`${EMO}x${EMO}`, "x"), `["${EMO}", "${EMO}"]`);
    eq("079", "孤立代理元分隔符不截断 emoji", SP(`${EMO}ab`, String.fromCharCode(0xd83d)), `["${EMO}ab"]`);
    eq("079", "max_splits 现在给值、不再报缺", show(method(V.str("a,b,c"), "split", [V.str(","), V.bool(true), V.int(1)])), "[\"a\", \"b,c\"]");
  });

  it("099 · max_splits=0 就是不限刀", async () => {
    const SP = (s: string, d: string, allow: boolean, cap: number) =>
      show(method(V.str(s), "split", [V.str(d), V.bool(allow), V.int(cap)]));
    const T: Array<[string, string, boolean, number, string]> = [
      ["a,b,c", ",", true, 1, '["a", "b,c"]'],
      ["a,,b", ",", true, 1, '["a", ",b"]'],
      ["a,,b", ",", false, 1, '["a", "b"]'],
      ["a,,b", ",", false, 2, '["a", "b"]'],
      ["a,,,b", ",", true, 1, '["a", ",,b"]'],
      ["a,b,,c,d", ",", false, 2, '["a", "b", "c,d"]'],
      ["a,b,,c,d", ",", true, 3, '["a", "b", "", "c,d"]'],
      [",a,", ",", true, 1, '["", "a,"]'],
      [",a,", ",", false, 1, '["a"]'],
      [",a,,b,", ",", false, 1, '["a", "b,"]'],
      [",a,,b,", ",", false, 2, '["a", "b"]'],
      ["  a  ", " ", false, 2, '["a"]'],
      [",,,", ",", false, 1, "[]"],
      [",,,", ",", false, 2, "[]"],
      [",,,", ",", true, 1, '["", ",,"]'],
      ["aa", "a", true, 1, '["", "a"]'],
      ["aa", "a", false, 1, "[]"],
      ["aaa", "aa", true, 1, '["", "a"]'],
      ["a,b,", ",", false, 1, '["a", "b,"]'],
      ["a, ,b", ",", false, 1, '["a", " ,b"]'],
      ["abc", "", true, 1, '["a", "bc"]'],
      ["abc", "", false, 1, '["a", "bc"]'],
      ["abc", "", true, 2, '["a", "b", "c"]'],
      ["ab,,cd", "", false, 2, '["a", "b", ",,cd"]'],
      ["a::b::c", "::", true, 1, '["a", "b::c"]'],
      ["aXXbXXc", "XX", false, 1, '["a", "bXXc"]'],
      ["a,b,c", ",", true, 5, '["a", "b", "c"]'],
      ["", ",", true, 1, '[""]'],
      ["", ",", false, 1, "[]"],
      ["x", ",", true, 1, '["x"]'],
    ];
    for (const [s, d, allow, cap, want] of T) {
      eq("099", `split(${JSON.stringify(s)}, ${JSON.stringify(d)}, ${allow}, ${cap})`, SP(s, d, allow, cap), want);
    }
    eq("099", "max_splits=0 就是不限刀", SP("a,b,c", ",", true, 0), '["a", "b", "c"]');
    eq("099", "max_splits 负数同样不限刀", SP("a,b,c", ",", false, -1), '["a", "b", "c"]');
    eq("099", "两参版口径没被带跑（回归位）", show(method(V.str("a,,b"), "split", [V.str(","), V.bool(false)])), '["a", "b"]');
    eq("099", "空分隔符的两参版仍逐码点", show(method(V.str("ab"), "split", [V.str("")])), '["a", "b"]');
    shouldThrow("099", "split() 不收第四个参数", () =>
      method(V.str("a,b"), "split", [V.str(","), V.bool(true), V.int(1), V.bool(true)]),
    );
    shouldThrow("099", "max_splits 要 int（float 实测是类型错）", () =>
      method(V.str("a,b"), "split", [V.str(","), V.bool(true), V.float(1.5)]),
    );
  });

  it("103 · to_float 与字面量共用两次舍入（…993.0 → …994）", async () => {
    const tf = (s: string) => (method(V.str(s), "to_float", []) as Variant).v as number;
    const VF = (s: string) => String(method(V.str(s), "is_valid_float", []).v);
    eq("103", "to_float 与字面量共用两次舍入（…993.0 → …994）", String(Math.trunc(tf("9007199254740993.0")) === 9007199254740994), "true");
    eq("103", "前导零吃小数预算：只剩 11 位", String(Math.trunc(tf("0.0000001234567890123456789") * 1e25) === 1234567890100000256), "true");
    eq("103", "1+2⁻⁵³ 的 54 位展开落回 1.0", String(Math.trunc(tf("1.000000000000000083266726846886739642044414197265625") * 1e18) === 1000000000000000000), "true");
    eq("103", "下划线在字符串这条路**不算**数字（与字面量相反）", `${tf("1_000_000.25")}/${VF("1_000_000.25")}`, "1/false");
    eq("103", "空格：to_float 吃前缀、is_valid 一律假", `${tf(" 1.5 ")}|${VF(" 1.5 ")}|${tf("1e5 ")}|${VF("1e5 ")}`, "1.5|false|100000|false");
    eq("103", "取不到数字就是 0", `${tf("abc")}/${tf("")}/${tf("inf")}/${tf("nan")}/${tf("0x10")}`, "0/0/0/0/0");
    eq("103", "前缀截断（Godot 一路如此）", `${tf("1.2.3.4")}/${tf("1 2")}/${tf("  -2.5x")}/${tf("-.5")}/${tf("+5.5")}`, "1.2/1/-2.5/-0.5/5.5");
    for (const s of [".5", "5.", "1e", "1e+", "1e-2", "01.50", "-.5", "+5.5", "0.999999999999999999999", "1e-23", "9007199254740993.0"]) {
      eq("103", `is_valid_float(${JSON.stringify(s)}) 为真`, VF(s), "true");
    }
    for (const s of ["+-1", "0x10", "1.5abc", ".e5", "inf", "INF", "nan", "1.2.3.4", "1 E5", "1e5 ", " 1.5 ", "  -2.5x", "", ".", "1_000_000.25"]) {
      eq("103", `is_valid_float(${JSON.stringify(s)}) 为假`, VF(s), "false");
    }
    eq("103", "StringName 走同一条降格路", String((method(V.stringName("1.5"), "to_float", []) as Variant).v), "1.5");
    shouldThrow("103", "to_float 不收实参", () => method(V.str("1.5"), "to_float", [V.int(1)]));
    shouldThrow("103", "is_valid_float 不收实参", () => method(V.str("1"), "is_valid_float", [V.int(1)]));
  });

  it("104 · to_int 与 int(字符串) 同值（跳过非数字继续攒）", async () => {
    const TI = (s: string) => String((method(V.str(s), "to_int", []) as Variant).v);
    const VI = (s: string) => String(method(V.str(s), "is_valid_int", []).v);
    const HI = (s: string) => String((method(V.str(s), "hex_to_int", []) as Variant).v);
    const VH = (s: string, sign = false) => String(method(V.str(s), "is_valid_hex_number", sign ? [V.bool(true)] : []).v);
    const toI = (s: string) => String(toInt(V.str(s)).v);

    eq("104", "to_int 与 int(字符串) 同值（跳过非数字继续攒）", `${TI("42")}|${TI("-42")}|${TI("+42")}|${TI(" 42 ")}|${TI("42abc")}`, "42|-42|42|42|42");
    eq("104", "1e5 → 15、0x10 → 10、0b101 → 101", `${TI("1e5")}|${TI("0x10")}|${TI("0b101")}`, "15|10|101");
    eq("104", "遇 `.` 就停（不是把后面的数字也攒上）", TI("1.5"), "1");
    eq("104", "取不到数字给 0", `${TI("abc")}|${TI("")}|${TI("f f")}`, "0|0|0");
    eq("104", "溢出按 int64 回绕", `${TI("9223372036854775808")}|${TI("-9223372036854775809")}`, "-9223372036854775808|9223372036854775807");
    eq("104", "is_valid_int 严格整串、不看范围", `${VI("42")}|${VI("+42")}|${VI("007")}|${VI("9223372036854775808")}`, "true|true|true|true");
    eq("104", "is_valid_int 一律拒空格/前缀/下划线/小数/空", `${VI(" 42 ")}|${VI("0x10")}|${VI("1_000")}|${VI("1.5")}|${VI("")}|${VI("-")}`, "false|false|false|false|false|false");
    eq("104", "hex_to_int 认 0x / 0X 前缀与负号", `${HI("ff")}|${HI("0x10")}|${HI("0X1f")}|${HI("-ff")}|${HI("-0x10")}|${HI("abc")}`, "255|16|31|-255|-16|2748");
    eq("104", "0b101 整串读作 0xb101", HI("0b101"), "45313");
    eq("104", "不合式的十六进制串一律 0（不是取前缀）", `${HI("1.5")}|${HI("f f")}|${HI("+ff")}|${HI("zz")}|${HI("0x")}|${HI("")}`, "0|0|0|0|0|0");
    eq("104", "is_valid_hex_number 默认可带负号、不带前缀", `${VH("ff")}|${VH("-ff")}|${VH("1e5")}|${VH("0x10")}|${VH("zz")}|${VH("")}`, "true|true|true|false|false|false");
    eq("104", "参数为真时反过来：必须带 0x、不认负号与前缀大写", `${VH("0x10", true)}|${VH("-ff", true)}|${VH("ff", true)}|${VH("0X1f", true)}`, "true|false|false|false");
    eq("104", "StringName 也走同一条降格路", String((method(V.stringName("ff"), "hex_to_int", []) as Variant).v), "255");
    eq("104", "见过数字之前 `-` 才翻符号（垃圾字符不断它）", `${TI("a-5")}|${TI("a--5")}|${TI("-a-2")}|${TI("+ -3")}`, "-5|5|2|-3");
    eq("104", "见过数字之后 `-` 彻底惰性", `${TI("5-3")}|${TI("1--2")}`, "53|12");
    eq("104", "符号连写按奇偶翻", `${TI("--5")}|${TI("---5")}|${TI("+-5")}|${TI("-+5")}|${TI("- 5")}|${TI("-- 5")}|${TI("--1.9")}`, "5|-5|-5|-5|-5|5|1");
    eq("104", "空白/控制符/前缀里的点都只是被跳过", `${TI(" -5")}|${TI("x-5")}|${TI("e-5")}`, "-5|-5|-5");
    eq("104", "遇 `.` 立刻停：点后面的数字与符号都不算", `${TI("1.5")}|${TI(".-5")}|${TI("x.5")}|${TI("-1.5x2")}|${TI("1.5.6")}|${TI("1 .5")}`, "1|0|0|-1|1|1");
    eq("104", "19 位再大也是回绕，不是饱和", `${TI("9500000000000000009")}|${TI("9999999999999999991")}|${TI("9223372036854775811")}|${TI("9223372036854775801")}`, "-8946744073709551607|-8446744073709551625|-9223372036854775805|9223372036854775801");
    eq("104", "2^63 与 -2^63 两侧都还是回绕", `${TI("9223372036854775808")}|${TI("-9223372036854775808")}|${TI("-9223372036854775809")}|${TI("-9223372036854775810")}`, "-9223372036854775808|-9223372036854775808|9223372036854775807|9223372036854775806");
    eq("104", "撞上 10^18 闸门就饱和（且 Godot 侧另打一行 ERROR，故不进语料）", `${TI("10000000000000000000")}|${TI("-10000000000000000000")}|${TI("18446744073709551615")}|${TI("18446744073709551617")}|${TI("99999999999999999999")}`, "9223372036854775807|-9223372036854775808|9223372036854775807|9223372036854775807|9223372036854775807");
    eq("104", "前导零不吃闸门（21 个字符攒出来还是 42）", TI("0000000000000000000042"), "42");
    eq("104", "全局 int(字符串) 与 to_int() 同路", `${toI("a-5")}|${toI("9223372036854775808")}|${toI("9500000000000000009")}|${toI("--1.9")}|${toI("ffffffffffffffff")}`, "-5|-9223372036854775808|-8946744073709551607|1|0");
    eq("104", "hex_to_int 也是整串读作十六进制", `${HI("0x1f")}|${HI("-0x1f")}|${HI("0")}|${HI("-0")}|${HI("0x0")}`, "31|-31|0|0|0");
    eq("104", "hex_to_int 越界是**饱和**（十进制那侧是回绕）", `${HI("7fffffffffffffff")}|${HI("-0x7fffffffffffffff")}`, "9223372036854775807|-9223372036854775807");
    eq("104", "hex_to_int 越过 INT64_MAX 饱和到两端", `${HI("ffffffffffffffff")}|${HI("8000000000000000")}|${HI("0x10000000000000000")}|${HI("-0x8000000000000000")}`, "9223372036854775807|9223372036854775807|9223372036854775807|-9223372036854775808");
    eq("104", "不合式的形状整个给 0（不取前缀）", `${HI("+ff")}|${HI("--ff")}|${HI(" 0x10")}|${HI("0x10 ")}|${HI("-0x-10")}|${HI("0x")}`, "0|0|0|0|0|0");
    eq("104", "is_valid_hex_number 默认接受一个正负号", `${VH("+ff")}|${VH("+1")}|${VH("--ff")}|${VH("++ff")}|${VH(" ff")}|${VH("-1.5")}`, "true|true|false|false|false|false");
    eq("104", "带参数那条也要前缀、符号仍可带一个", `${VH("-0x10", true)}|${VH("+0x10", true)}|${VH("-0X10", true)}|${VH("+-0x10", true)}|${VH(" 0x10", true)}|${VH("0x0", true)}`, "true|true|false|false|false|true");
    eq("104", "is_valid_int 不吃连写符号与空格", `${VI("+-5")}|${VI("--5")}|${VI("+ 5")}|${VI("00")}|${VI("1 .5")}|${VI("x-5")}`, "false|false|false|true|false|false");
    eq("104", "StringName 那侧实测 5 点全走同一条路", `${String((method(V.stringName("42"), "to_int", []) as Variant).v)}|${String(method(V.stringName("42"), "is_valid_int", []).v)}|${String(method(V.stringName("0x10"), "is_valid_hex_number", [V.bool(true)]).v)}|${String(method(V.stringName("42"), "is_valid_hex_number", []).v)}`, "42|true|true|true");
    shouldThrow("104", "to_int 不收实参", () => method(V.str("1"), "to_int", [V.int(1)]));
    shouldThrow("104", "is_valid_int 不收实参", () => method(V.str("1"), "is_valid_int", [V.bool(true)]));
    shouldThrow("104", "hex_to_int 不收实参", () => method(V.str("ff"), "hex_to_int", [V.bool(true)]));
    shouldThrow("104", "is_valid_hex_number 最多一个参数", () =>
      method(V.str("0x1"), "is_valid_hex_number", [V.bool(true), V.bool(true)]),
    );
  });

  it("106 · 字符串元素原样、无引号", async () => {
    const arr = (...xs: Variant[]) => V.array(GArray.of(xs));
    const J = (sep: string, a: Variant) => String((method(V.str(sep), "join", [a]) as Variant).v);
    const S = (x: string) => V.str(x);

    eq("106", "字符串元素原样、无引号", J(", ", arr(S("a"), S("b"), S("c"))), "a, b, c");
    eq("106", "空数组给空串；单元素不加尾分隔符", `${J("-", arr())}|${J("-", arr(S("x")))}`, "|x");
    eq("106", "空分隔符就是粘连", J("", arr(S("a"), S("b"))), "ab");
    eq("106", "空串元素占一格（分隔符照加）", `${J(", ", arr(S("a"), S(""), S("b")))}|${J(", ", arr(S(""), S("")))}`, "a, , b|, ");
    eq("106", "非字符串元素走 print 口径", `${J(", ", arr(V.int(1), V.int(2), V.int(3)))}|${J(", ", arr(V.bool(true), V.bool(false)))}`, "1, 2, 3|true, false");
    eq("106", "null 给 <null>", `${J(", ", arr(V.nil()))}|${J(", ", arr(S("a"), V.nil()))}`, "<null>|a, <null>");
    eq("106", "嵌套数组元素仍按容器形式", J(", ", arr(arr(V.int(1)), S("a"))), "[1], a");
    eq("106", "StringName 元素给内容（不带 &\"\"）", J(", ", arr(V.stringName("z"), S("y"))), "z, y");
    eq("106", "StringName 当接收者也一样", String((method(V.stringName("sep"), "join", [arr(S("a"), S("b"))]) as Variant).v), "asepb");
    eq("106", "浮点元素按 15 位口径", J(", ", arr(V.float(1 / 3), V.float(1e20), V.float(0.1 + 0.2), V.float(Infinity), V.float(-Infinity))),
      "0.33333333333333, 100000000000000000000.0, 0.3, inf, -inf");
    eq("106", "200 个整数拼出来 689 个字符", J(",", arr(...Array.from({ length: 200 }, (_, i) => V.int(i)))),
      Array.from({ length: 200 }, (_, i) => String(i)).join(","));
    shouldThrow("106", "join 少一个实参要响（Godot 是解析期 Too few arguments）", () => method(V.str("|"), "join", []));
    shouldThrow("106", "join 多一个实参要响（Too many arguments，Expected at most 1）", () => method(V.str("|"), "join", [arr(S("a")), V.int(2)]));
    shouldThrow("106", "join 收非数组实参要响（形参是 PackedStringArray）", () => {
      const d = new GDict();
      d.set(V.str("a"), V.int(1));
      return method(V.str(", "), "join", [V.dict(d)]);
    });
  });
});
