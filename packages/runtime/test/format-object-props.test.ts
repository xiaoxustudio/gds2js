// `String.format()` 的实参是 Object 那一族（语料 246 + ops 这一组）：4.6.3 实测的口径是
// 「自己类的脚本变量在前、基类在后，逐个把 ph 里的 `_` 换成属性名再全串替换，换进来的值不再二次替换」，
// 探头在 `tmp/probe-format-nontainer/`（fmt.log / obj.log / prop.log / order.log / edge.log）。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { ClassDesc, GdScriptObject, defineClass, registerScriptProps, setClassBase } from "@gds2js/runtime/runtime/object";
import { nativeClass } from "@gds2js/runtime/runtime/native-class";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { GArray, strFormatV } from "@gds2js/runtime/runtime/values";
import { globalCallable } from "@gds2js/runtime/runtime/methods";
import { I, S } from "./support/variants";

class Base extends GdScriptObject {
  two = I(2);
  holder = S("{three}");
  arr = V.array(GArray.of([I(1), I(2)]));
}
class Kid extends Base {
  three = I(3);
  back = S("{two}");
}
const baseDesc: ClassDesc = defineClass(Base, () => new Base(), (o: object) => o instanceof Base);
const kidDesc: ClassDesc = defineClass(Kid, () => new Kid(), (o: object) => o instanceof Kid);
setClassBase(kidDesc, baseDesc);
registerScriptProps(kidDesc, ["three", "back"]);
registerScriptProps(baseDesc, ["two", "holder", "arr"]);

const of = (text: string, v: Variant, ph?: string): string => {
  try {
    return strFormatV(text, v, ph ?? "{_}");
  } catch (e) {
    return `[${(e as UnsupportedError).code}]`;
  }
};

describe("runtime/format · 实参是 Object 的那一支", () => {
  it("246 · 属性替换按「自己类在前、基类在后」，换进来的值不再二次替换", async () => {
    const k = V.object(new Kid());
    eq("246", "一格出现两次就换两次（p02）", of("{two}|{two}", k), "2|2");
    eq("246", "自己类的属性先走：{holder} 换进来的 {three} 不再被二次替换（p08）", of("{holder}|{three}|{two}", k), "{three}|3|2");
    eq("246", "同一句里两支各自到位（p09）", of("{holder}{back}", k), "{three}2");
    eq("246", "基类的属性名照样认（p10）", of("{two}", k), "2");
    eq("246", "没有的属性名原样留着（p13）", of("{missing}|{two}", k), "{missing}|2");
    eq("246", "属性名大小写是硬的（p04）", of("{Two}|{two}", k), "{Two}|2");
    eq("246", "值是容器就按 print 那套打（p05 同形）", of("{arr}", k), "[1, 2]");
    eq("246", "缺省占位符 `{_}` 对 Object 不成立：文本里没有 `{属性名}` 就一格不换（p11）", of("{_}={_}", k), "{_}={_}");
    eq("246", "显式占位符不含 `_` 时，那一格对所有属性都是同一个字面量（i01）", of("x{two}x", k, "{0}"), "x{two}x");
  });

  it("246 · 不是 Object* 的那些实参：引擎一句 Invalid type，文本原样（我们只比 stdout）", async () => {
    const k = V.object(new Kid());
    eq("246", "Callable 当实参不改串（f09）", of("{alpha}", globalCallable("abs")), "{alpha}");
    eq("246", "pack 当实参不改串（f11）", of("{alpha}", V.object(new GBytes([1, 2], "byte"))), "{alpha}");
    eq("246", "引擎类值当实参不改串（k02）", of("{Node}", V.object(nativeClass("Node"))), "{Node}");
    eq("246", "数组实参的键是下标，`{alpha}` 一格都不换（h12）", of("{alpha}", V.array(GArray.of([I(1), I(2)]))), "{alpha}");
    eq("246", "数字键 `{0}` 对 Object 不成立（p12）", of("{0}", k), "{0}");
  });

  it("246 · 复现不了的那两格响亮拒", async () => {
    const k = V.object(new Kid());
    eq("246", "{script} 那一格引擎打的是 ():<GDScript#一个号>（k01）", of("{script}", k), "[format-object]");
    eq("246", "句里别的属性认得出也一样拒（{script} 那一格是复现不了的号）", of("{two}|{script}", k), "[format-object]");
    eq("246", "没登记属性面的实例（宿主那一侧）不改串", of("{anything}", V.object(new GdScriptObject())), "{anything}");
  });
});
