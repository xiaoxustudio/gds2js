/** `Array(base, type, class_name, script)` 四参定形构造（S605），读数 `tmp/d6/s605.gd` / `s607.gd` / `s609.gd` 与语料 399 的 golden。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { arrayFromArgs } from "@gds2js/runtime/runtime/builtins";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { GArray, show } from "@gds2js/runtime/runtime/values";
import { method } from "@gds2js/runtime/runtime/methods";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { I } from "./support/variants";

const arr = (items: Variant[]): Variant => V.array(GArray.of(items));
const NIL = V.nil();
const EMPTY_NAME = V.stringName("");
const err = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { message?: string }).message ?? "?";
  }
};
const typed = (base: Variant, code: number): Variant => arrayFromArgs([base, I(code), EMPTY_NAME, NIL]);
const shape = (a: Variant): string =>
  `${show(a)} ${method(a, "is_typed", []).v} ${method(a, "get_typed_builtin", []).v}`;

describe("Array(base, type, class_name, script)（S605）", () => {
  it("逐格转换与单参形之别", () => {
    eq("605", "零参给空不 typed", show(arrayFromArgs([])), "[]");
    const src = arr([I(1)]);
    eq("605", "单参仍是别名", `${arrayFromArgs([src]) === src ? "true" : "false"}`, "true");
    eq("605", "四参新建", `${shape(typed(arr([I(1)]), 2))} ${(typed(arr([I(1)]), 2) === src ? "同" : "新")}`, "[1] true 2 新");
    eq("605", "float → int 截断", shape(typed(arr([V.float(1.7)]), 2)), "[1] true 2");
    eq("605", "int → float 升格", shape(typed(arr([I(1)]), 3)), "[1.0] true 3");
    eq("605", "int → bool", shape(typed(arr([I(1)]), 1)), "[true] true 1");
    eq("605", "型码 0 不 typed", shape(typed(arr([I(1)]), 0)), "[1] false 0");
  });
  it("转不过的那格给空的定型数组（引擎另推的 ERROR 块由 normalize 滤掉）", () => {
    eq("605", "Nil → int", shape(typed(arr([NIL]), 2)), "[] true 2");
    eq("605", "String → int", shape(typed(arr([V.str("1")]), 2)), "[] true 2");
    eq("605", "int → String", shape(typed(arr([I(1)]), 4)), "[] true 4");
    eq("605", "类名位被丢", shape(typed(arr([I(1)]), 2)), "[1] true 2");
  });
  it("第一参是 pack 走引擎原句，其余没量过的形响亮拒", () => {
    eq("605", "pack 当底", err(() => arrayFromArgs([V.object(GBytes.of([1, 2])), I(2), EMPTY_NAME, NIL])),
      "Invalid type in 'Array' constructor. Cannot convert argument 1 from PackedByteArray to Array.");
    eq("605", "二参没接", err(() => arrayFromArgs([arr([I(1)]), I(2)])).startsWith("Array(...) 只实测过 0 / 1 / 4 参三形") ? "拒" : "没拒", "拒");
    eq("605", "第四参非 null 拒", err(() => arrayFromArgs([arr([I(1)]), I(2), EMPTY_NAME, I(3)])).includes("只实测过 null") ? "拒" : "没拒", "拒");
    eq("605", "第二参非 int 拒", err(() => arrayFromArgs([arr([I(1)]), V.str("x"), EMPTY_NAME, NIL])).includes("只实测过 int 型码") ? "拒" : "没拒", "拒");
  });
});
