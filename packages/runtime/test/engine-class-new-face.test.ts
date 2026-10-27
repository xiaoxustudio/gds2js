/** 引擎类值上的 `new` 面：放行的是实测到的那一形，造实例照旧响亮拒（阶段一切割线）。 */
import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { nativeClassNew } from "@gds2js/runtime/runtime/native-class";
import { method } from "@gds2js/runtime/runtime/methods";
import { show, valueEq } from "@gds2js/runtime/runtime/values";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { V } from "@gds2js/runtime/runtime/tags";

const CLASSES = ["Node", "RefCounted", "Object", "Resource", "FileAccess", "GDScript"];

const STILL_REFUSED: Array<[string, () => unknown]> = [
  ["Node.new()", () => method(nativeClassNew("Node", 0), "call", [])],
  ["Node.new(1) 的实参那一形", () => method(nativeClassNew("Node", 0), "callv", [])],
];

describe("引擎类 .new 的实测面", () => {
  it("typeof 25 / get_method / is_valid / 元数 / bind 后 −1 / is_null / 标签", () => {
    for (const cls of CLASSES) {
      const f = nativeClassNew(cls, 0);
      eq("450", `${cls} typeof`, String(typeOf(f).v), "25");
      eq("450", `${cls} get_method`, String(method(f, "get_method", []).v), "new");
      eq("450", `${cls} is_valid`, String(method(f, "is_valid", []).v), "true");
      eq("450", `${cls} get_argument_count`, String(method(f, "get_argument_count", []).v), "0");
      eq("450", `${cls} is_null`, String(method(f, "is_null", []).v), "false");
      eq("450", `${cls} bind(1) 之后元数`, String(method(method(f, "bind", [V.int(1)]), "get_argument_count", []).v), "-1");
      eq("450", `${cls} 打印标签`, show(f), "GDScriptNativeClass::new");
    }
  });

  it("两次取值等式成立、跨类不等", () => {
    const a = nativeClassNew("Node", 0);
    const b = nativeClassNew("Node", 0);
    const c = nativeClassNew("RefCounted", 0);
    eq("450", "Node.new == Node.new", String(valueEq(a, b)), "true");
    eq("450", "Node.new != RefCounted.new", String(valueEq(a, c)), "false");
    eq("450", "同名字的两支各自缓存", String(a === b), "true");
  });

  it("造实例那一形仍响亮拒", () => {
    for (const [what, fn] of STILL_REFUSED) shouldThrow("450", what, fn);
  });
});
