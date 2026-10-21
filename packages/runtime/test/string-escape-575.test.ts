/** String 的转义 / 缩进 / 校验 / 通配族（S575），读数 `tmp/d6/s575.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { V } from "@gds2js/runtime/runtime/tags";
import { S } from "./support/variants";

const str = (s: string, name: string, args: ReturnType<typeof S>[] = []): string => String(method(S(s), name, args).v);
const bool = (s: string, name: string, args: ReturnType<typeof S>[] = []): boolean => Boolean(method(S(s), name, args).v);

describe("strip_escapes / c_unescape / json_escape / xml_escape（S575）", () => {
  it("strip_escapes 删所有 <32 的码点", () => {
    eq("575", "混合", str("a\tb\nc\rd\u0001e", "strip_escapes"), "abcde");
    eq("575", "空", str("", "strip_escapes"), "");
  });
  it("c_unescape 按引擎顺序替换", () => {
    eq("575", "六种转义", str("a\\nb\\tc\\\\d\\x41\\q\\", "c_unescape"), "a\nb\tc\\d\\x41\\q\\");
    eq("575", "\\\\n 先吃 \\n", str("\\\\n", "c_unescape"), "\\\n");
  });
  it("json_escape 只转五个控制转义 + \\v + 引号", () => {
    eq("575", "混合", str("a\"b\\c\b\f\n\r\t\v\u0001", "json_escape"), "a\\\"b\\\\c\\b\\f\\n\\r\\t\\v\u0001");
  });
  it("xml_escape 默认不转引号", () => {
    eq("575", "默认 / false", `${str("a&b<c>d'e\"f", "xml_escape")}|${str("a&b<c>d'e\"f", "xml_escape", [V.bool(false)])}`, "a&amp;b&lt;c&gt;d'e\"f|a&amp;b&lt;c&gt;d'e\"f");
    eq("575", "true（照源）", str("a&b<c>d'e\"f", "xml_escape", [V.bool(true)]), "a&amp;b&lt;c&gt;d&apos;e&quot;f");
  });
});

describe("indent / dedent（S575）", () => {
  it("indent 只给非空行加前缀", () => {
    eq("575", "空行保留", str("a\n\nb\nc", "indent", [S("  ")]), "  a\n\n  b\n  c");
    eq("575", "尾换行", str("a\nb\n", "indent", [S("  ")]), "  a\n  b\n");
    eq("575", "空串 / 空前缀", `${str("", "indent", [S("  ")])}|${str("a", "indent", [S("")])}`, "|a");
  });
  it("dedent 以第一段文本行的缩进为基准", () => {
    eq("575", "空格", str("  a\n  b\n", "dedent"), "a\nb\n");
    eq("575", "制表符", str("\ta\n\tb", "dedent"), "a\nb");
    eq("575", "多缩进", str("  a\n    b\n", "dedent"), "a\n  b\n");
    eq("575", "空行", str("  a\n\n  b", "dedent"), "a\n\nb");
    eq("575", "空串 / 不匹配", `${str("", "dedent")}|${str("  a\n b\n", "dedent")}`, "|a\nb\n");
  });
});

describe("validate_filename / validate_node_name / match / is_valid_identifier（S575）", () => {
  it("validate_filename 先 trim 再换十个字符", () => {
    eq("575", "十字符", str("a:b/c\\d?e*f\"g|h%i<j>k", "validate_filename"), "a_b_c_d_e_f_g_h_i_j_k");
    eq("575", "trim", str(" a ", "validate_filename"), "a");
  });
  it("validate_node_name 只换五个字符", () => {
    eq("575", "五字符", str("a.b:c@d/e\"f", "validate_node_name"), "a_b_c_d_e_f");
    eq("575", "空白不动", str(" a b ", "validate_node_name"), " a b ");
  });
  it("match 的 * 与 ?（? 不吃点，空串给 false）", () => {
    const cases: [string, string, boolean][] = [["abc", "a*", true], ["abc", "a?c", true], ["abc", "a?d", false], ["abc", "*", true], ["abc", "a*b*c", true], ["a.c", "a?c", false], ["", "", false], ["", "*", false], ["abc", "", false], ["abc", "abc", true], ["abc", "ABC", false], ["abc", "a**c", true]];
    eq("575", "十二格", cases.map(([s, w]) => bool(s, "match", [S(w)])).join(","), cases.map((c) => String(c[2])).join(","));
  });
  it("is_valid_identifier 是 ASCII 判据", () => {
    const cases: [string, boolean][] = [["abc", true], ["1a", false], ["_a", true], ["a_1", true], ["é", false], ["", false], ["a-b", false], ["a b", false]];
    eq("575", "八格", cases.map(([s]) => bool(s, "is_valid_identifier")).join(","), cases.map((c) => String(c[1])).join(","));
  });
});
