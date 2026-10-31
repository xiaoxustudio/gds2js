/** 引擎类值上的 `new` 面：Callable 面是阶段一的读数，造实例按阶段三的实测一支一支放行。 */
import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { nativeClassNew } from "@gds2js/runtime/runtime/class/identity/native-class";
import { method } from "@gds2js/runtime/runtime/methods";
import { show, valueEq } from "@gds2js/runtime/runtime/values";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { V } from "@gds2js/runtime/runtime/tags";

const CLASSES = ["Node", "RefCounted", "Object", "Resource", "FileAccess", "GDScript"];

const STILL_REFUSED: Array<[string, () => unknown]> = [
  ["Resource.new()", () => method(nativeClassNew("Resource", 0), "call", [])],
  ["FileAccess.new()", () => method(nativeClassNew("FileAccess", 0), "call", [])],
  ["GDScript.new()", () => method(nativeClassNew("GDScript", 0), "call", [])],
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

  it("量过的那四支造得出实例，其余仍响亮拒", () => {
    for (const cls of ["Node", "Node2D", "RefCounted", "Object"]) {
      const v = method(nativeClassNew(cls, 0), "call", []);
      eq("459", `${cls}.new() 的 get_class`, String(method(v, "get_class", []).v), cls);
    }
    for (const [what, fn] of STILL_REFUSED) shouldThrow("450", what, fn);
  });
});
