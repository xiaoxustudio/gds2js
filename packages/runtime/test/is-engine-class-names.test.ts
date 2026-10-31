// 引擎类名的 `is`（探头 `tmp/probe-is-class/` 两张矩阵 is.log / is2.log 与 `tmp/probe-is-unprobed/is.log` 那 208 格）：
// 量过的七个名 + Callable 按形状表回答；表外的**引擎类名**对 Tier 1 每一种形状都是假（那 208 格量的就是这件事，
// 里面 14 个真值全落在表内那 7 支的链上），信号值对每一支类名也假。真不在名单里的名字（`HttpRequest` 这种大小写不对的）照旧响亮拒。
// 语料 248 钉的是表内那 14 行，语料 258 钉的是整张 208 格矩阵；这里补拒口与引擎类值那两格。

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
} from "@gds2js/runtime/runtime/class/object/script-object";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import { Signal } from "@gds2js/runtime/runtime/class/identity/signal";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { vector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { callable } from "@gds2js/runtime/runtime/class/object/script-object";
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
registerScriptProps(plainDesc, ["v"], (o: object) => [(o as Plain).v]);

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

  it("258 · 表外的引擎类名与信号值按实测给假，只有不成其为类名的才拒", async () => {
    const inst = wrapValue(new Plain());
    const sig = V.object(new Signal("fired"));
    const outside = ["Node2D", "Label", "Timer", "HTTPRequest", "Image", "InputEvent", "Camera3D", "StyleBoxFlat"];
    const inside = ["Object", "RefCounted", "Resource", "GDScript", "Node", "SceneTree", "MainLoop", "Callable"];
    eq("258", "脚本实例对表外那 8 支全假（is.log c001–c016 那两列）", outside.map((n) => is(inst, n)).join("|"), "false|false|false|false|false|false|false|false");
    eq("258", "引擎类值对表外那 8 支也假（n07「Node is Node 假」的推广）", outside.map((n) => is(nativeClass("Node"), n)).join("|"), "false|false|false|false|false|false|false|false");
    eq("258", "脚本类值对表外那 8 支也假", outside.map((n) => is(V.object(plainDesc), n)).join("|"), "false|false|false|false|false|false|false|false");
    eq("258", "信号值对表内那 7 支与 Callable 全假（is.log 那 16 格里信号的那 15 支）", inside.map((n) => is(sig, n)).join("|"), "false|false|false|false|false|false|false|false");
    eq("258", "信号值对表外的引擎类名也假", outside.map((n) => is(sig, n)).join("|"), "false|false|false|false|false|false|false|false");
    eq("258", "非对象形状对表外的引擎类名假（不走进表内那张链表）", `${is(vector2(1, 2), "Node2D")}|${is(S("x"), "Image")}|${is(I(1), "Timer")}|${is(V.nil(), "Label")}`, "false|false|false|false");
    eq("258", "大小写不对的名字不是类名，照旧响亮拒", is(inst, "HttpRequest"), "[is-type]");
    eq("258", "没登记引擎基类的实例（`extends Resource` 那一族）不猜", (() => {
      class Weird extends GdScriptObject {}
      const d = defineClass(Weird, () => new Weird(), (o: object) => o instanceof Weird);
      void d;
      return is(wrapValue(new Weird()), "RefCounted");
    })(), "[is-type]");
  });
});
