/** String 的路径族八支（S573），读数 `tmp/d6/s573.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { S } from "./support/variants";

const call = (s: string, name: string, args: ReturnType<typeof S>[] = []): string => String(method(S(s), name, args).v);

const PATHS = ["res://a/b/c.txt", "user://x.tar.gz", "a/b/", "noext", ".hidden", "C:/x/y.txt", "a\\b\\c.txt", "/abs/pos", "res://", "", "a/b.c/d"];

describe("String 路径四支（S573）", () => {
  it("get_extension / get_basename / get_base_dir / get_file 逐格", () => {
    const got = PATHS.map((p) => [call(p, "get_extension"), call(p, "get_basename"), call(p, "get_base_dir"), call(p, "get_file")].join("|")).join(";");
    eq("573", "十一格", got, [
      "txt|res://a/b/c|res://a/b|c.txt",
      "gz|user://x.tar|user://|x.tar.gz",
      "|a/b/|a/b|",
      "|noext||noext",
      "hidden|||.hidden",
      "txt|C:/x/y|C:/x|y.txt",
      "txt|a\\b\\c|a\\b|c.txt",
      "|/abs/pos|/abs|pos",
      "|res://|res://|",
      "|||",
      "|a/b.c/d|a/b.c|d",
    ].join(";"));
  });
  it("is_absolute_path / is_relative_path 是互补", () => {
    const got = PATHS.map((p) => `${call(p, "is_absolute_path")}/${call(p, "is_relative_path")}`).join(",");
    eq("573", "十一格", got, ["true/false", "true/false", "false/true", "false/true", "false/true", "true/false", "false/true", "true/false", "true/false", "false/true", "false/true"].join(","));
  });
});

describe("String.path_join / simplify_path（S573）", () => {
  it("path_join 的三种拼接", () => {
    const cases: [string, string][] = [["res://a", "b"], ["res://a", "/abs"], ["a", "b/c"], ["a/", "b"], ["", "b"], ["res://a", ""], ["a", "C:/x"]];
    const got = cases.map(([l, r]) => call(l, "path_join", [S(r)])).join(",");
    eq("573", "七格", got, "res://a/b,res://a/abs,a/b/c,a/b,b,res://a/,a/C:/x");
  });
  it("simplify_path 折叠 . / .. 与多余分隔符", () => {
    const cases = ["a/./b/../c", "res://a//b", "a/../../b", "./a", "../a", "a/b/../..", "res://a/b/", "/a/./b/", "a//b//c", "a/.."];
    const got = cases.map((p) => `[${call(p, "simplify_path")}]`).join(",");
    eq("573", "十格", got, "[a/c],[res://a/b],[../b],[a],[../a],[],[res://a/b],[/a/b],[a/b/c],[]");
  });
});
