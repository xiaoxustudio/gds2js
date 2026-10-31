// 对象身份族（语料 260 钉了 39 格引擎读数，号在两侧都掩成 `<类名#号>`；本门钉的是掩号之后看不见的：
// 我们自己那串号的相对关系、空对象引用那一形的等式，以及仍然响亮拒的三处）。
// 读数：`tmp/probe-ids/{ids2,ids3,ids4}.log`。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { show, valueEq } from "@gds2js/runtime/runtime/values";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import {
  ClassDesc,
  GdScriptObject,
  defineClass,
  registerNativeBase,
  registerScriptProps,
  wrapValue,
} from "@gds2js/runtime/runtime/class/object/script-object";
import {
  gInstanceFromId,
  gIsInstanceValid,
  gIsInstanceIdValid,
  gWeakref,
} from "@gds2js/runtime/runtime/builtins";
import { method } from "@gds2js/runtime/runtime/methods";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import { I, S } from "./support/variants";

class Plain extends GdScriptObject {
  v = I(1);
}
const plainDesc: ClassDesc = defineClass(Plain, () => new Plain(), (o: object) => o instanceof Plain);
registerNativeBase(plainDesc, "RefCounted");
registerScriptProps(plainDesc, ["v"], (o: object) => [(o as Plain).v]);

const idOf = (v: Variant): number => (v.v as { gdObjectId: number }).gdObjectId;
const maskId = (s: string): string => s.replace(/#-?\d+>/, "#号>");
const run = (f: () => unknown): string => {
  try {
    return String(f());
  } catch (e) {
    return `[${(e as { code?: string }).code ?? "?"}]`;
  }
};

describe("runtime · 对象身份族", () => {
  it("打印形状与号的相对关系", () => {
    const a = wrapValue(new Plain());
    const c = wrapValue(new Plain());
    eq("260", "脚本实例印成 `<原生基类名#号>`，不是脚本类名", maskId(show(a)), "<RefCounted#号>");
    eq("260", "同一对象两次打印同一号、不同对象不同号", `${String(show(a) === show(a))}|${String(show(a) === show(c))}`, "true|false");
    eq("260", "号按分配顺序递增（引擎那侧 `a < b` 那格也是 true）", String(idOf(a) < idOf(c)), "true");
    eq("260", "weakref 自己印 `<WeakRef#号>`", maskId(show(gWeakref(a))), "<WeakRef#号>");
  });

  it("instance_from_id 与两个 validity", () => {
    const a = wrapValue(new Plain());
    const id = V.int(BigInt(idOf(a)));
    eq("260", "号找得回来、与对象相等", `${String(valueEq(gInstanceFromId(id), a))}|${String(show(gInstanceFromId(id)) === show(a))}`, "true|true");
    eq("260", "没这个号给空对象引用：typeof 24、与 null 相等、印 <Object#null>", (() => {
      const n = gInstanceFromId(I(1234567));
      return `${String((typeOf(n) as { v: number }).v)}|${String(valueEq(n, V.nil()))}|${show(n)}`;
    })(), "24|true|<Object#null>");
    eq("260", "is_instance_valid：实例 / 脚本类值 / 引擎类值 / weakref 都真，其余假", [
      a,
      V.object(plainDesc),
      nativeClass("Node"),
      gWeakref(a),
      gWeakref(V.nil()),
      V.nil(),
      I(5),
      S("s"),
      V.array([] as Variant[]),
    ].map((v) => String(gIsInstanceValid(v).v)).join("|"), "true|true|true|true|true|false|false|false|false");
    eq("260", "is_instance_id_valid 认得发过的号、0 不认", `${String(gIsInstanceIdValid(id).v)}|${String(gIsInstanceIdValid(I(0)).v)}`, "true|false");
  });

  it("weakref 与 get_ref", () => {
    const a = wrapValue(new Plain());
    const w = gWeakref(a);
    eq("260", "get_ref() 回来还是那个对象", String(valueEq(method(w, "get_ref", []), a)), "true");
    eq("260", "weakref(null).get_ref() 是 <null>，不是空对象引用", show(method(gWeakref(V.nil()), "get_ref", [])), "<null>");
    eq("260", "两次 weakref 是两个盒子（引擎那格也是 false）", String(valueEq(gWeakref(a), gWeakref(a))), "false");
    eq("260", "weakref 的盒子自己也是对象身份（同一个号可查回来）", String(valueEq(gInstanceFromId(V.int(BigInt(idOf(w)))), w)), "true");
  });

  it("没量过的形状照旧响亮拒", () => {
    eq("260", "weakref 的实参只量过对象与 null", run(() => gWeakref(I(5))), "[weakref-arg]");
    eq("260", "脚本类值的打印没量过（引擎给 `():<GDScript#号>`，那一形没在我们能造的场景里量全）", run(() => show(V.object(plainDesc))), "[show-type]");
    eq("260", "WeakRef 只发得出 get_ref", run(() => method(gWeakref(V.nil()), "is_null", [])), "[weakref-method]");
  });
});
