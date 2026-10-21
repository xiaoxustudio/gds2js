/** String 的比较 / 大小写不敏感查找 / 通配 / 剥离族（S576），读数 `tmp/d6/s576.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { S } from "./support/variants";

const num = (s: string, name: string, arg: string): number => Number(method(S(s), name, [S(arg)]).v);
const bool = (s: string, name: string, arg: string): boolean => Boolean(method(S(s), name, [S(arg)]).v);
const str = (s: string, name: string, arg: string): string => String(method(S(s), name, [S(arg)]).v);
const zero = (s: string, name: string): string => String(method(S(s), name, []).v);

describe("nocasecmp_to / natural / file 比较（S576）", () => {
  it("nocasecmp_to 逐码点比 _find_upper", () => {
    const cells: [string, string, number][] = [["abc", "ABC", 0], ["a", "B", -1], ["é", "É", 0], ["ß", "SS", 1], ["İ", "i", 1], ["a", "", 1], ["", "a", -1], ["😀", "😀", 0], ["Z", "a", 1], ["_", "-", 1]];
    eq("576", "十格", cells.map(([a, b]) => num(a, "nocasecmp_to", b)).join(","), cells.map((c) => String(c[2])).join(","));
  });
  it("naturalcasecmp_to 的数字段与前导零", () => {
    const cells: [string, string, number][] = [["a2", "a10", -1], ["a02", "a2", 0], ["a02b", "a2b", 0], ["a.2", "a2", 1], ["a2", "a2.1", -1], ["1.2", "1.10", -1], ["a", "a.", -1], ["x", "x", 0], ["file1.txt", "file10.txt", -1], ["a0", "a00", 0]];
    eq("576", "十格", cells.map(([a, b]) => num(a, "naturalcasecmp_to", b)).join(","), cells.map((c) => String(c[2])).join(","));
  });
  it("naturalnocasecmp_to", () => {
    eq("576", "三格", ([["A2", "a10"], ["Ab", "aB"], ["A02", "a2"]] as [string, string][]).map(([a, b]) => num(a, "naturalnocasecmp_to", b)).join(","), "-1,0,0");
  });
  it("filecasecmp_to / filenocasecmp_to 的下划线前缀", () => {
    eq("576", "filecase", ([["_a", "a"], ["a", "_a"], [".a", "_a"], ["_a", "_b"], ["a_", "a"], ["A", "a"], ["a2", "a10"]] as [string, string][]).map(([a, b]) => num(a, "filecasecmp_to", b)).join(","), "-1,1,-1,-1,1,-1,-1");
    eq("576", "filenocase", ([["A", "a"], ["_A", "_a"], ["_A", "a"], ["A2", "a10"]] as [string, string][]).map(([a, b]) => num(a, "filenocasecmp_to", b)).join(","), "0,0,-1,-1");
  });
});

describe("containsn / matchn / 子序列（S576）", () => {
  it("containsn 走 _find_lower", () => {
    eq("576", "四格", ([["AbC", "bc"], ["abc", ""], ["é", "É"], ["abc", "bcd"]] as [string, string][]).map(([a, b]) => bool(a, "containsn", b)).join(","), "true,false,true,false");
  });
  it("matchn 的通配与大小写", () => {
    const cells: [string, string, boolean][] = [["abc", "A*", true], ["a.c", "A?C", false], ["ABC", "a*c", true], ["abc", "*", true], ["", "", false], ["abc", "A?C", true]];
    eq("576", "六格", cells.map(([a, b]) => bool(a, "matchn", b)).join(","), cells.map((c) => String(c[2])).join(","));
  });
  it("is_subsequence_of / ofn", () => {
    const cells: [string, string, boolean][] = [["abc", "a1b2c", true], ["abc", "acb", false], ["", "x", true], ["a", "", false], ["é", "É", false], ["abc", "abc", true]];
    eq("576", "六格", cells.map(([a, b]) => bool(a, "is_subsequence_of", b)).join(","), cells.map((c) => String(c[2])).join(","));
    eq("576", "ofn 三格", ([["é", "É"], ["abc", "ACB"], ["AbC", "abc"]] as [string, string][]).map(([a, b]) => bool(a, "is_subsequence_ofn", b)).join(","), "true,false,true");
  });
});

describe("lstrip / rstrip / to_pascal_case（S576）", () => {
  it("lstrip / rstrip 的字符集", () => {
    const cells: [string, string, string, string][] = [["xxabcxx", "x", "abcxx", "xxabc"], ["abc", "abc", "", ""], ["", "a", "", ""], ["aéa", "aé", "", ""], ["aaab", "a", "b", "aaab"]];
    eq("576", "五格", cells.map(([a, b]) => `${str(a, "lstrip", b)}|${str(a, "rstrip", b)}`).join(";"), cells.map((c) => `${c[2]}|${c[3]}`).join(";"));
  });
  it("to_pascal_case 拆词后每段首码点大写", () => {
    const cells: [string, string][] = [["hello_world", "HelloWorld"], ["helloWorld", "HelloWorld"], ["HELLO_WORLD", "HelloWorld"], ["hello world", "HelloWorld"], ["a-b", "AB"], ["abc123def", "Abc123Def"], ["éclair noir", "ÉclairNoir"], ["", ""], ["aA", "AA"], ["A2B", "A2b"]];
    eq("576", "十格", cells.map(([a]) => zero(a, "to_pascal_case")).join(","), cells.map((c) => c[1]).join(","));
  });
});
