// 4.6.3 实测的「引擎类名当值用」：身份、等式、字典键都发得出，带进程内号的那两支（打印、`.new()`）各自响亮拒。
// 读数在 tmp/probe-class-names/{list,shadow}.log 与 corpus/cases/243 的 golden。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show, valueEq } from "@gds2js/runtime/runtime/values";
import { nativeClass } from "@gds2js/runtime/runtime/native-class";
import { attribute, method } from "@gds2js/runtime/runtime/methods";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { I } from "./support/variants";

const tn = (v: Variant): string => String((typeOf(v) as { v: number }).v);
const code = (f: () => unknown): string => {
  try {
    return `通过:${String(f())}`;
  } catch (e) {
    return `[${(e as UnsupportedError).code}]`;
  }
};

describe("runtime/native-class · 引擎类值", () => {
  it("243 · 身份、等式与容器键位", async () => {
    eq("243", "typeof 24，同一个类名两次取值是同一个盒子", `${tn(nativeClass("Node"))}|${String(nativeClass("Node") === nativeClass("Node"))}`, "24|true");
    eq("243", "等式按类：Node 等 Node、不等 Label、不等 int", `${String(valueEq(nativeClass("Node"), nativeClass("Node")))}|${String(valueEq(nativeClass("Node"), nativeClass("Label")))}|${String(valueEq(nativeClass("Node"), I(1)))}`, "true|false|false");
    eq("243", "字典键按类分格（实测 n04：两支各一格、has 与取值都对）", (() => {
      const d = new GDict();
      d.set(nativeClass("Node"), I(1));
      d.set(nativeClass("Label"), I(2));
      return `${String(d.size())}|${String(d.has(nativeClass("Node")))}|${String((d.get(nativeClass("Node")) as Variant).v)}|${String((d.get(nativeClass("Label")) as Variant).v)}|${String(d.erase(nativeClass("Label")))}|${String(d.size())}`;
    })(), "2|true|1|2|true|1");
    eq("243", "数组成员判定走同一条身份（实测 n06 的 count 2）", (() => {
      const a = GArray.of([nativeClass("Node"), nativeClass("Label"), nativeClass("Node")]);
      return `${String(a.size())}|${String(a.raw().filter((x) => valueEq(x, nativeClass("Node"))).length)}`;
    })(), "3|2");
  });

  it("243 · 带号的打印发得出形状，没建模的成员面仍响亮拒", async () => {
    // 号是我们自己按分配顺序发的，语料两侧都先掩成 `<类名#号>` 再比（S263）；形状与身份关系照样钉得住。
    const mask = (s: string): string => s.replace(/#-?\d+>/, "#号>");
    eq("243", "引擎类值印 <GDScriptNativeClass#号>", mask(show(nativeClass("Node"))), "<GDScriptNativeClass#号>");
    eq("243", "同名两次是同一个号（`Node == Node` 那条身份的另一半）", `${mask(show(nativeClass("Resource")))}|${String(show(nativeClass("Node")) === show(nativeClass("Node")))}`, "<GDScriptNativeClass#号>|true");
    eq("243", ".new() 不发 → [native-class-member]", code(() => method(nativeClass("Node"), "new", [])), "[native-class-member]");
    eq("243", "属性面同样拒（名字进那句文案）", code(() => attribute(nativeClass("Label"), "text")), "[native-class-member]");
    eq("243", "容器里也走得通（var_to_str 那一支仍没量，走它自己那条拒）", mask(show(V.array(GArray.of([nativeClass("Node")])))), "[<GDScriptNativeClass#号>]");
  });
});
