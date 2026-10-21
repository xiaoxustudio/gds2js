/** String 的反转 / bigrams / 切割 / 填充 / 修剪族（S574），读数 `tmp/d6/s574.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { show } from "@gds2js/runtime/runtime/values";
import { V } from "@gds2js/runtime/runtime/tags";
import { S } from "./support/variants";

const call = (s: string, name: string, args: ReturnType<typeof S>[] = []): ReturnType<typeof S> => method(S(s), name, args) as ReturnType<typeof S>;
const str = (s: string, name: string, args: ReturnType<typeof S>[] = []): string => String(call(s, name, args).v);
const shown = (s: string, name: string, args: ReturnType<typeof S>[] = []): string => show(call(s, name, args));

describe("reverse / bigrams / get_slice_count（S574）", () => {
  it("按码点反转与相邻二格", () => {
    eq("574", "混合", `${str("aé😀", "reverse")}|${shown("aé😀", "bigrams")}`, "😀éa|[\"aé\", \"é😀\"]");
    eq("574", "abc", `${str("abc", "reverse")}|${shown("abc", "bigrams")}`, "cba|[\"ab\", \"bc\"]");
    eq("574", "单字 / 空", `${str("a", "reverse")}|${str("", "reverse")}|${shown("a", "bigrams")}`, "a||[]");
    eq("574", "aa", shown("aa", "bigrams"), "[\"aa\"]");
  });
  it("get_slice_count 的四种边界", () => {
    eq("574", "普通", call("a,b,c", "get_slice_count", [S(",")]).v, 3);
    eq("574", "空段照算", call("a,,b", "get_slice_count", [S(",")]).v, 3);
    eq("574", "空源 / 空分隔符", `${call("", "get_slice_count", [S(",")]).v}/${call("abc", "get_slice_count", [S("")]).v}`, "0/0");
    eq("574", "不重叠", `${call("aaa", "get_slice_count", [S("aa")]).v}/${call("a,b,c", "get_slice_count", [S(",,")]).v}`, "2/1");
  });
});

describe("rsplit / split_floats（S574）", () => {
  it("rsplit 默认与 maxsplit", () => {
    eq("574", "默认", shown("a,b,c", "rsplit", [S(",")]), "[\"a\", \"b\", \"c\"]");
    eq("574", "maxsplit 1", shown("a,b,c", "rsplit", [S(","), V.bool(true), V.int(1)]), "[\"a,b\", \"c\"]");
    eq("574", "maxsplit 2", shown("a,b,c", "rsplit", [S(","), V.bool(true), V.int(2)]), "[\"a\", \"b\", \"c\"]");
    eq("574", "maxsplit -1 / 9", `${shown("a,b,c", "rsplit", [S(","), V.bool(true), V.int(-1)])}|${shown("a,b,c", "rsplit", [S(","), V.bool(true), V.int(9)])}`, "[\"a\", \"b\", \"c\"]|[\"a\", \"b\", \"c\"]");
  });
  it("rsplit 的 allow_empty 与空分隔符", () => {
    eq("574", "保留空段", shown("a,,b", "rsplit", [S(",")]), "[\"a\", \"\", \"b\"]");
    eq("574", "丢掉空段", shown("a,,b", "rsplit", [S(","), V.bool(false)]), "[\"a\", \"b\"]");
    eq("574", "空分隔符", shown("abc", "rsplit", [S("")]), "[\"a\", \"b\", \"c\"]");
    eq("574", "空源", shown("", "rsplit", [S(",")]), "[\"\"]");
    eq("574", "尾分隔符", `${shown("a,b,", "rsplit", [S(",")])}|${shown("a,b,", "rsplit", [S(","), V.bool(false)])}`, "[\"a\", \"b\", \"\"]|[\"a\", \"b\"]");
  });
  it("split_floats 的前导解析与 allow_empty", () => {
    eq("574", "混合", shown("1,2.5,-3,abc", "split_floats", [S(",")]), "[1.0, 2.5, -3.0, 0.0]");
    eq("574", "空段", shown("1,,2", "split_floats", [S(",")]), "[1.0, 0.0, 2.0]");
    eq("574", "不保留空段", shown("1,,2", "split_floats", [S(","), V.bool(false)]), "[1.0, 2.0]");
    eq("574", "空源 / 尾分隔", `${shown("", "split_floats", [S(",")])}|${shown("1,", "split_floats", [S(",")])}|${shown("1,", "split_floats", [S(","), V.bool(false)])}`, "[]|[1.0, 0.0]|[1.0]");
    eq("574", "空格分隔 / 空分隔符", `${shown("1 2", "split_floats", [S(" ")])}|${shown("1;2", "split_floats", [S(",,")])}`, "[1.0, 2.0]|[1.0]");
  });
});

describe("lpad / rpad / pad_decimals / trim（S574）", () => {
  it("lpad / rpad 的默认字符与重复语义", () => {
    eq("574", "lpad", `${str("abc", "lpad", [V.int(5)])}|${str("abc", "lpad", [V.int(5), S("xy")])}|${str("abc", "lpad", [V.int(2), S("x")])}|${str("abc", "lpad", [V.int(5), S("")])}`, "  abc|xyxyabc|abc|abc");
    eq("574", "rpad", `${str("abc", "rpad", [V.int(5)])}|${str("abc", "rpad", [V.int(5), S("xy")])}|${str("abc", "rpad", [V.int(2), S("x")])}`, "abc  |abcxyxy|abc");
    eq("574", "按码点计长", str("abc", "lpad", [V.int(4), S("é")]), "éabc");
  });
  it("pad_decimals 的补点 / 截断 / 补零", () => {
    const cases: [string, number, string][] = [["1.5", 3, "1.500"], ["1.5", 1, "1.5"], ["1.5", 0, "1"], ["1", 2, "1.00"], ["abc", 2, "abc.00"], ["1.23456", 2, "1.23"], ["1.", 2, "1.00"], [".5", 2, ".50"], ["-1.5", 3, "-1.500"], ["", 2, ".00"]];
    eq("574", "十格", cases.map(([s, n]) => str(s, "pad_decimals", [V.int(n)])).join(","), cases.map((c) => c[2]).join(","));
  });
  it("trim_prefix / trim_suffix", () => {
    eq("574", "prefix", `${str("res://a", "trim_prefix", [S("res://")])}|${str("a", "trim_prefix", [S("res://")])}|${str("a", "trim_prefix", [S("")])}`, "a|a|a");
    eq("574", "suffix", `${str("a.txt", "trim_suffix", [S(".txt")])}|${str("a", "trim_suffix", [S(".txt")])}|${str("a", "trim_suffix", [S("")])}`, "a|a|a");
    eq("574", "重复段只削一次", `${str("aaaa", "trim_prefix", [S("aa")])}|${str("aaaa", "trim_suffix", [S("aa")])}`, "aa|aa");
  });
});
