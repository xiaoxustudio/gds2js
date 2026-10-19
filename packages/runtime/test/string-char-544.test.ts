/** String 的 replace_char(s)/remove_char(s)/uri_file_decode/is_valid_ascii_identifier（S544），读数 `tmp/d6/s544*.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V } from "@gds2js/runtime/runtime/tags";
import { method } from "@gds2js/runtime/runtime/methods";
import { I, S } from "./support/variants";

const call = (s: string, name: string, args: Parameters<typeof method>[2] = []): string => String(method(V.str(s), name, args).v);
const I32 = (n: number) => I(n);

describe("String.replace_char / replace_chars（S544）", () => {
  it("按码点替换；key=-1 未命中；with=0 打 ERROR 并原样返回", () => {
    eq("544", "a→X", call("abc", "replace_char", [I32(97), I32(88)]), "Xbc");
    eq("544", "key 未命中", call("abc", "replace_char", [I32(-1), I32(88)]), "abc");
    eq("544", "é→X", call("aéb", "replace_char", [I32(233), I32(88)]), "aXb");
    const writes: string[] = [];
    const orig = process.stderr.write;
    process.stderr.write = ((chunk: string) => {
      writes.push(String(chunk));
      return true;
    }) as typeof process.stderr.write;
    let got = "";
    try {
      got = call("abc", "replace_char", [I32(97), I32(0)]);
    } finally {
      process.stderr.write = orig;
    }
    eq("544", "with=0 返回原串", got, "abc");
    eq("544", "with=0 的 ERROR 块", writes.join("").split("\n").slice(0, 2).join("|"), "ERROR: `with` must not be the NUL character.|   at: replace_char (core/string/ustring.cpp:3803)");
  });
  it("replace_chars 收码点集合", () => {
    eq("544", "ac→X", call("abc", "replace_chars", [S("ac"), I32(88)]), "XbX");
    eq("544", "空 keys", call("abc", "replace_chars", [S(""), I32(88)]), "abc");
    eq("544", "未命中", call("abc", "replace_chars", [S("xyz"), I32(88)]), "abc");
    eq("544", "é→X", call("aéb", "replace_chars", [S("é"), I32(88)]), "aXb");
    const writes: string[] = [];
    const orig = process.stderr.write;
    process.stderr.write = ((chunk: string) => {
      writes.push(String(chunk));
      return true;
    }) as typeof process.stderr.write;
    let got = "";
    try {
      got = call("abc", "replace_chars", [S("a"), I32(0)]);
    } finally {
      process.stderr.write = orig;
    }
    eq("544", "with=0 返回原串", got, "abc");
    eq("544", "with=0 的 ERROR 块", writes.join("").split("\n").slice(0, 2).join("|"), "ERROR: `with` must not be the NUL character.|   at: _replace_chars_common (core/string/ustring.cpp:3853)");
  });
});

describe("String.remove_char / remove_chars（S544）", () => {
  it("删除全部命中码点", () => {
    eq("544", "remove b", call("abc", "remove_char", [I32(98)]), "ac");
    eq("544", "remove -1", call("abc", "remove_char", [I32(-1)]), "abc");
    eq("544", "remove é", call("aéb", "remove_char", [I32(233)]), "ab");
    eq("544", "remove ac", call("abc", "remove_chars", [S("ac")]), "b");
    eq("544", "remove 空", call("abc", "remove_chars", [S("")]), "abc");
    eq("544", "remove é", call("aéb", "remove_chars", [S("é")]), "ab");
  });
});

describe("String.uri_file_decode 与 is_valid_ascii_identifier（S544）", () => {
  it("uri_file_decode 不把 + 换成空格", () => {
    eq("544", "%20+x", call("%20+x", "uri_file_decode"), " +x");
    eq("544", "%E4%B8%AD+", call("%E4%B8%AD+", "uri_file_decode"), "中+");
    eq("544", "a%2Fb", call("a%2Fb", "uri_file_decode"), "a/b");
    eq("544", "plain", call("plain", "uri_file_decode"), "plain");
  });
  it("is_valid_ascii_identifier 八格", () => {
    const CASES: Array<[string, boolean]> = [
      ["a", true], ["_", true], ["_1", true], ["1a", false],
      ["", false], ["a1", true], ["a-b", false], ["é", false],
    ];
    for (const [s, want] of CASES) {
      eq("544", `"${s}"`, String(method(V.str(s), "is_valid_ascii_identifier", []).v), String(want));
    }
  });
});
