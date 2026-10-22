/** 类名槽的元素收拒（S621 续二）：`nil` 与对象都收，标量照旧丢。读数 `corpus/cases/407`（A / C 两行）与 `tmp/probe618/`（b12 / d5）。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, Tag } from "@gds2js/runtime/runtime/tags";
import { GArray, elemConvert, stampScriptArray } from "@gds2js/runtime/runtime/values";
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
  it("盖章后 append 看得见，且别名同支", () => {
    const a = stampScriptArray(V.array(GArray.of([])), "Inner", "RefCounted", true);
    const g = a.v as GArray;
    g.append(V.object(new (class {})()));
    const alias = stampScriptArray(a, "Inner", "RefCounted", false);
    eq("621", "章挂上", String(g.typedAny()) + String(g.get(0).t), "true7");
    eq("621", "同名收下并同一支", String((alias.v as GArray) === g), "true");
    g.append(V.int(1));
    eq("621", "标量那一位照旧不收", String(g.size()), "1");
  });
});
