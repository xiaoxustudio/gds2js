/** String 的 md5/sha1/sha256、hex_decode、xml_unescape、is_valid_html_color（S577），读数 `tmp/d6/s577.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { V } from "@gds2js/runtime/runtime/tags";
import { S } from "./support/variants";

const call = (s: string, name: string): ReturnType<typeof S> => method(S(s), name, []) as ReturnType<typeof S>;
const str = (s: string, name: string): string => String(call(s, name).v);
const bytes = (s: string, name: string): string => (call(s, name).v as GBytes).raw().map((b) => (b as number).toString(16).padStart(2, "0")).join("");

function capture(f: () => unknown): { value: unknown; lines: string[] } {
  const writes: string[] = [];
  const orig = process.stderr.write;
  process.stderr.write = ((chunk: string) => {
    writes.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;
  let value: unknown;
  try {
    value = f();
  } finally {
    process.stderr.write = orig;
  }
  return { value, lines: writes.join("").split("\n").filter((l) => l !== "") };
}

describe("md5 / sha1 / sha256（S577）", () => {
  it("abc 的六个数与 buffer", () => {
    eq("577", "md5", `${str("abc", "md5_text")}|${bytes("abc", "md5_buffer")}`, "900150983cd24fb0d6963f7d28e17f72|900150983cd24fb0d6963f7d28e17f72");
    eq("577", "sha1", `${str("abc", "sha1_text")}|${bytes("abc", "sha1_buffer")}`, "a9993e364706816aba3e25717850c26c9cd0d89d|a9993e364706816aba3e25717850c26c9cd0d89d");
    eq("577", "sha256", `${str("abc", "sha256_text")}|${bytes("abc", "sha256_buffer")}`, "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad|ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
  it("é 与空串（UTF-8 输入）", () => {
    eq("577", "é", `${str("é", "md5_text")}/${str("é", "sha1_text")}/${str("é", "sha256_text")}`, "66ddcd97cfdeabb2f6fb8a999b4bc76f/bf15be717ac1b080b4f1c456692825891ff5073d/4a99557e4033c3539de2eb65472017cad5f9557f7a0625a09f1c3f6e2ba69c4c");
    eq("577", "空", `${str("", "md5_text")}/${str("", "sha1_text")}/${str("", "sha256_text")}`, "d41d8cd98f00b204e9800998ecf8427e/da39a3ee5e6b4b0d3255bfef95601890afd80709/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });
});

describe("hex_decode（S577）", () => {
  it("偶数位按字节、大写转小写", () => {
    eq("577", "Hello", bytes("48656c6c6f", "hex_decode"), "48656c6c6f");
    eq("577", "ABCDEF", bytes("ABCDEF", "hex_decode"), "abcdef");
    eq("577", "空", bytes("", "hex_decode"), "");
  });
  it("奇数长度打 1658 块给空；非法字符响亮拒", () => {
    const odd = capture(() => call("abc", "hex_decode"));
    eq("577", "奇数", `${(odd.value as ReturnType<typeof S>).v instanceof GBytes ? ((odd.value as ReturnType<typeof S>).v as GBytes).length : -1}|${odd.lines[0]}|${odd.lines[1]}`, "0|ERROR: Hexadecimal string of uneven length.|   at: hex_decode (core/string/ustring.cpp:1658)");
    let code = "";
    try {
      call("zz", "hex_decode");
    } catch (e) {
      code = (e as { code?: string }).code ?? "?";
    }
    eq("577", "非法字符", code, "string-hex-decode");
  });
});

describe("xml_unescape / is_valid_html_color（S577）", () => {
  it("五个命名实体 + 十进制 / 小写 x 十六进制", () => {
    const cells: [string, string][] = [
      ["&amp;&lt;&gt;&quot;&apos;", "&<>\"'"],
      ["&#65;&#x42;&#X43;", "AB&#X43;"],
      ["&unknown;", "&unknown;"],
      ["a&b", "a&b"],
      ["&#0;", "&#0;"],
      ["&#x1F600;", "😀"],
      ["&#65", "&#65"],
      ["&#;", "&#;"],
      ["&#x;", "&#x;"],
    ];
    eq("577", "九格", cells.map(([a]) => str(a, "xml_unescape")).join("|"), cells.map((c) => c[1]).join("|"));
  });
  it("is_valid_html_color 只认 # + 3/4/6/8 个十六进制位", () => {
    const cells: [string, boolean][] = [["#fff", true], ["#ffffff", true], ["#FFFFFFFF", true], ["red", false], ["Red", false], ["notacolor", false], ["#ff", false], ["0xff0000", false], ["rgb(1,2,3)", false], ["", false]];
    eq("577", "十格", cells.map(([s]) => String(method(S(s), "is_valid_html_color", []).v)).join(","), cells.map((c) => String(c[1])).join(","));
    eq("577", "无 # 四格照源", ["fff", "ffff", "ffffff", "ffffffff"].map((s) => String(method(S(s), "is_valid_html_color", []).v)).join(","), "true,true,true,true");
  });
  it("is_valid_ip_address 的 IPv4 / IPv6 / 嵌入形", () => {
    const cells: [string, boolean][] = [["127.0.0.1", true], ["::1", true], ["256.1.1.1", false], ["1.2.3", false], ["abc", false], ["", false], ["::ffff:192.168.0.1", true], ["2001:db8::1", true], ["1.2.3.4.5", false]];
    eq("577", "九格", cells.map(([s]) => String(method(S(s), "is_valid_ip_address", []).v)).join(","), cells.map((c) => String(c[1])).join(","));
  });
});
