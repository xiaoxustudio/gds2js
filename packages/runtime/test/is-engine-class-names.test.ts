// 引擎类名的 `is`（探头 `tmp/probe-is-class/` 两张矩阵 is.log / is2.log）：
// 量过的七个名 + Callable 按形状表回答，表外的名与没量过的形状一律响亮拒。
// 语料 248 钉的是不报警的那 14 行；这里补拒口与引擎类值那两格。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import {
  ClassDesc,
  GdScriptObject,
  defineClass,
  registerNativeBase,
  registerScriptProps,
  wrapValue,
} from "@gds2js/runtime/runtime/object";
import { nativeClass } from "@gds2js/runtime/runtime/native-class";
import { Signal } from "@gds2js/runtime/runtime/signal";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { vector2 } from "@gds2js/runtime/runtime/vector2";
import { callable } from "@gds2js/runtime/runtime/object";
import { isType } from "@gds2js/runtime/runtime/patterns";
import { I, S } from "./support/variants";

const is = (v: Variant, name: string): string => {
  try {
    return String((isType(v, name) as Variant).v);
  } catch (e) {
    return `[${(e as UnsupportedError).code}]`;
  }
};

class Plain extends GdScriptObject {
  v = I(1);
}
const plainDesc: ClassDesc = defineClass(Plain, () => new Plain(), (o: object) => o instanceof Plain);
registerNativeBase(plainDesc, "RefCounted");
registerScriptProps(plainDesc, ["v"]);

describe("runtime/patterns · 引擎类名的 is", () => {
  it("248 · 三条形状表与拒口", async () => {
    const inst = wrapValue(new Plain());
    eq("248", "RefCounted 那条链：Object / RefCounted 真，其余量过的假（m01 / n12）", `${is(inst, "Object")}|${is(inst, "RefCounted")}|${is(inst, "Resource")}|${is(inst, "Node")}|${is(inst, "SceneTree")}|${is(inst, "MainLoop")}|${is(inst, "GDScript")}`, "true|true|false|false|false|false|false");
    eq("248", "脚本类值是 GDScript 那一族（m06 / n08：四真三假）", is(V.object(plainDesc), "GDScript"), "true");
    eq("248", "脚本类值不是 Node（n08）", `${is(V.object(plainDesc), "Node")}|${is(V.object(plainDesc), "SceneTree")}|${is(V.object(plainDesc), "Callable")}`, "false|false|false");
    eq("248", "引擎类值是 Object 与 RefCounted 两真，连它自己都不算（n07：Node is Node 假）", `${is(nativeClass("Node"), "Object")}|${is(nativeClass("Node"), "RefCounted")}|${is(nativeClass("Node"), "Node")}|${is(nativeClass("Node"), "Resource")}`, "true|true|false|false");
    eq("248", "结构体、pack、Callable、串与容器都不是 Object（m07–m12 / n01）", [vector2(1, 2), V.object(new GBytes([1], "byte")), callable(() => V.nil(), 1), S("x"), V.array([] as Variant[]), I(1)].map((v) => is(v, "Object")).join("|"), "false|false|false|false|false|false");
    eq("248", "Callable 那一支：方法与空 Callable 都真，别的内容假（n01 / n10）", `${is(callable(() => V.nil(), 1), "Callable")}|${is(nativeClass("Node"), "Callable")}`, "true|false");
    eq("248", "null 什么都不是（m12 同形：y11）", `${is(V.nil(), "Object")}|${is(V.nil(), "RefCounted")}`, "false|false");
  });

  it("248 · 没量过的名与形状响亮拒", async () => {
    const inst = wrapValue(new Plain());
    eq("248", "表外的引擎类名不猜（HttpRequest 只量过它是 1053 支名单里的一支）", is(inst, "HttpRequest"), "[is-type]");
    eq("248", "信号值对任何类名都没量过", is(V.object(new Signal("fired")), "Object"), "[is-type]");
    eq("248", "没登记引擎基类的实例（`extends Resource` 那一族）不猜", (() => {
      class Weird extends GdScriptObject {}
      const d = defineClass(Weird, () => new Weird(), (o: object) => o instanceof Weird);
      void d;
      return is(wrapValue(new Weird()), "RefCounted");
    })(), "[is-type]");
  });
});
