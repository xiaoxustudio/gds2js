/** 类名槽的元素收拒（S621 续二）：`nil` 与对象都收，标量照旧丢。读数 `corpus/cases/407`（A / C 两行）与 `tmp/probe618/`（b12 / d5）。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, Tag } from "@gds2js/runtime/runtime/tags";
import { GArray, elemConvert, stampArray, stampScriptArray } from "@gds2js/runtime/runtime/values";
import { registerClass } from "@gds2js/runtime/runtime/class/object/script-object";
import { I, S } from "./support/variants";

const say = (kind: string, v: Parameters<typeof elemConvert>[1]): string => {
  const out = elemConvert(kind as never, v);
  return out === null ? "丢" : out.t === Tag.NIL ? "nil" : TagName(out.t);
};
const TagName = (t: number): string => (t === Tag.OBJECT ? "object" : String(t));

describe("runtime/元素槽 · 类名槽（S621）", () => {
  it("Object 槽收 nil 与对象，标量与串照旧丢", () => {
    eq("621", "null 收", say("Object", V.nil()), "nil");
    eq("621", "脚本类实例收（407 的 C 行）", say("Object", V.object(new (class {})())), "object");
    eq("621", "int 丢（b12 / d5）", say("Object", I(1)), "丢");
    eq("621", "String 丢", say("Object", S("a")), "丢");
  });
  it("本类收下、异类丢掉，同名源是同一支（s1 / s2 / q10）", () => {
    class Inner622 {}
    class Other622 {}
    registerClass("Inner622", Inner622, () => new Inner622(), (o) => o instanceof Inner622);
    registerClass("Other622", Other622, () => new Other622(), (o) => o instanceof Other622);
    const a = stampScriptArray(V.array(GArray.of([])), "Inner622", "RefCounted", true);
    const g = a.v as GArray;
    g.append(V.object(new (class {})()));
    eq("622", "没登记的异类丢掉", String(g.size()), "0");
    g.append(V.object(new Inner622()));
    eq("622", "本类收下", String(g.size() === 1 && g.get(0).t === Tag.OBJECT), "true");
    g.append(V.int(1));
    eq("622", "标量丢掉（b12 / d5）", String(g.size()), "1");
    eq("622", "同名源收下并且同一支", String((stampScriptArray(a, "Inner622", "RefCounted", false).v as GArray) === g), "true");
    const any = stampArray(V.array(GArray.of([])), "Object", true);
    (any.v as GArray).append(V.object(new Inner622()));
    eq("622", "Array[Object] 收脚本实例（s3）", String((any.v as GArray).size()), "1");
  });
});
