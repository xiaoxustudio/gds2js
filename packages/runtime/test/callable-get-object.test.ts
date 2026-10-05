// `Callable.get_object()` 实测到的四形（探头 `tmp/probe-callable-object/`）：
// 方法与静态给的是能对上身份的接收者 / 类值，lambda 给的是**定义它那个类的 GDScript 对象**，
// 空 Callable 与全局内置给的是 typeof 24 的 null Object（打 `<Object#null>`、`== null` 真）——
// 后两形我们没有，响亮拒。读数 t01–t10 / u01–u09，语料 247 钉的是前 two 形。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import {
  GdScriptObject,
  callableOf,
  methodCallable,
  nullCallable,
  wrapValue,
} from "@gds2js/runtime/runtime/object";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { globalCallable, method } from "@gds2js/runtime/runtime/methods";

const objOf = (c: Variant): string => {
  try {
    method(c, "get_object", []);
    return "居然给得出";
  } catch (e) {
    return `[${(e as UnsupportedError).code}]`;
  }
};

describe("runtime/callable · get_object()", () => {
  it("247 · 方法与静态给接收者，其余三形响亮拒", async () => {
    const o = wrapValue(new GdScriptObject());
    const cm = methodCallable(o, "m");
    eq("247", "方法 Callable 给的就是那个实例（t01：`== o` 真）", String((method(cm, "get_object", []) as Variant) === o), "true");
    const b = method(cm, "bind", [V.int(1)]) as Variant;
    eq("247", "绑过实参不改 owner（q06）", String((method(b, "get_object", []) as Variant) === o), "true");
    const cls = wrapValue(new GdScriptObject());
    const cs = methodCallable(cls, "sstat");
    eq("247", "静态给的是类值（q05：`== Inner` 真、`== 实例` 假）", String((method(cs, "get_object", []) as Variant) === cls), "true");
    eq("247", "空 Callable 要给 null Object（typeof 24）→ 拒", objOf(nullCallable()), "[callable-get-object]");
    eq("247", "全局内置也要给 null Object → 拒", objOf(globalCallable("abs")), "[callable-get-object]");
    eq("247", "lambda 要给定义它那个类的 GDScript 对象 → 拒", objOf(callableOf((args: Variant[]) => args[0] as Variant, 1)), "[callable-get-object]");
  });
});
