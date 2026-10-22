/** 运行期「方法不存在」按面表判（S627 / S628）：表外名发引擎那句、面标签跟着接收者走；表内没实现的仍响亮拒。读数 `tmp/probe624/u1..u12`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { GodotRuntimeError, UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { V } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict } from "@gds2js/runtime/runtime/values";
import { method } from "@gds2js/runtime/runtime/methods";

const say = (v: Parameters<typeof method>[0], name: string): string => {
  try {
    method(v, name, []);
    return "没抛";
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return err.code === undefined ? "?" : `[${err.code}] ${err.message ?? ""}`;
  }
};

describe("runtime/methods · 表外名的运行期那一句（S627）", () => {
  it("四面各发自己那句，与引擎一字一样", () => {
    eq("627", "Array", say(V.array(new GArray()), "nope"), "[array-no-method] Invalid call. Nonexistent function 'nope' in base 'Array'.");
    eq("627", "Dictionary 只此一句", say(V.dict(new GDict()), "nope"), "[dict-no-method] Invalid call. Nonexistent function 'nope' in base 'Dictionary'.");
    eq("627", "String", say(V.str("ab"), "nope"), "[string-no-method] Invalid call. Nonexistent function 'nope' in base 'String'.");
    eq("628", "StringName 的面标签不跟 String（u11）", say(V.stringName("ab"), "nope"), "[stringname-no-method] Invalid call. Nonexistent function 'nope' in base 'StringName'.");
  });
  it("表内的名字不误判成不存在", () => {
    const a = V.array(GArray.of([V.int(1)]));
    eq("627", "Array.size 照旧能调", String(method(a, "size", []).v), "1");
    eq("627", "字典 is_typed 在表内", say(V.dict(new GDict()), "is_typed").startsWith("[dict-no-method]"), "false");
    eq("627", "Array.set 走「表外存在名单」", say(V.array(GArray.of([V.int(1)])), "set").includes("Nonexistent"), "false");
  });
  it("量过不存在的旧名单仍发同一句", () => {
    eq("627", "join 在 Array 上没有（S300）", say(V.array(new GArray()), "join").includes("Nonexistent function 'join' in base 'Array'"), "true");
    eq("627", "concat 也一样", say(V.array(new GArray()), "concat").includes("Nonexistent function 'concat'"), "true");
    eq("627", "字典的 count 没有（m04）", say(V.dict(new GDict()), "count").includes("in base 'Dictionary'"), "true");
    eq("627", "未实现的类常量等仍响亮拒", say(V.array(new GArray()), "shuffle").includes("Nonexistent") ? "拒错" : "未实现", "未实现");
  });
});
