// 由 tools/ops-check.ts 机械搬迁：region 225-278。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { registerClass, registerNativeBase } from "@gds2js/runtime/runtime/class/object/script-object";
import { paramSlot } from "@gds2js/runtime/runtime/slots";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, show } from "@gds2js/runtime/runtime/values";
import { colorNew } from "@gds2js/runtime/runtime/class/color/color";
import { vector2New } from "@gds2js/runtime/runtime/class/vector/vector2";
import { vector3New } from "@gds2js/runtime/runtime/class/vector/vector3";
import { vector2iNew } from "@gds2js/runtime/runtime/class/vector/vector2i";
import { vector3iNew } from "@gds2js/runtime/runtime/class/vector/vector3i";

describe("runtime/slots · 参数槽", () => {
  it("156 +3 · 形参的入口槽位：「能转的」与「该抛的」各钉一格", async () => {
    // 形参的入口槽位：「能转的」与「该抛的」各钉一格
    class SlotA {}
    const dSlotA = registerClass("SlotA", SlotA, () => new SlotA(), (o) => o instanceof SlotA);
    registerNativeBase(dSlotA, "RefCounted");
    const self = new SlotA();
    const errOf = (v: Variant, to: string, i: number, fn: string): string => {
      try {
        paramSlot(v, to, i, fn, self);
        return "<没抛>";
      } catch (e) {
        return String((e as Error).message);
      }
    };
    eq("156", "int 槽吃 2.7 向零截断", show(paramSlot(V.float(2.7), "int", 1, "p", self)), "2");
    eq("156", "int 槽吃 true → 1", show(paramSlot(V.bool(true), "int", 1, "p", self)), "1");
    eq("156", "int 槽吃 1e30 → int64 最小值", show(paramSlot(V.float(1e30), "int", 1, "p", self)), "-9223372036854775808");
    eq("156", "float 槽吃 1 → 1.0", show(paramSlot(V.int(1), "float", 1, "p", self)), "1.0");
    eq("156", "bool 槽吃 2.7 → true", show(paramSlot(V.float(2.7), "bool", 1, "p", self)), "true");
    eq("156", "String 槽吃 StringName", show(paramSlot(V.stringName("nm"), "String", 1, "p", self)), "nm");
    eq("156", "Vector2 槽吃 Vector2i", show(paramSlot(vector2iNew([V.int(3), V.int(4)]), "Vector2", 1, "p", self)), "(3.0, 4.0)");
    eq("156", "Vector2i 槽吃 Vector2", show(paramSlot(vector2New([V.float(1.7), V.float(2.2)]), "Vector2i", 1, "p", self)), "(1, 2)");
    eq("156", "Color 槽吃字符串色名", show(paramSlot(V.str("abc"), "Color", 1, "p", self)), "(0.6667, 0.7333, 0.8, 1.0)");
    eq("156", "同类实参原样过", show(paramSlot(V.int(7), "int", 1, "p", self)), "7");
    eq(
      "157",
      "String 塞 int 槽抛的是实测那句",
      errOf(V.str("12abc"), "int", 1, "p"),
      "Invalid type in function 'p' in base 'RefCounted (SlotA)'. Cannot convert argument 1 from String to int.",
    );
    eq("157", "null 的来源在文本里叫 Nil", errOf(V.nil(), "int", 2, "q"), "Invalid type in function 'q' in base 'RefCounted (SlotA)'. Cannot convert argument 2 from Nil to int.");
    eq("157", "Array 塞 Color 槽", errOf(V.array(GArray.of([])), "Color", 1, "r"), "Invalid type in function 'r' in base 'RefCounted (SlotA)'. Cannot convert argument 1 from Array to Color.");

    // Color 槽吃 int 走 packed RGBA（r=24..31、g=16..23、b=8..15、a=0..7，各除 255，先按 2³² 取模）
    const colorSlot = (n: number | bigint): string => show(paramSlot(V.int(n), "Color", 1, "p", self));
    eq("172", "Color 槽吃 int：逐通道", `${colorSlot(1)}/${colorSlot(255)}/${colorSlot(256)}/${colorSlot(16711680)}/${colorSlot(65280)}`, "(0.0, 0.0, 0.0, 0.0039)/(0.0, 0.0, 0.0, 1.0)/(0.0, 0.0, 0.0039, 0.0)/(0.0, 1.0, 0.0, 0.0)/(0.0, 0.0, 1.0, 0.0)");
    eq("172", "Color 槽吃 int：混合色", colorSlot(123456789), "(0.0275, 0.3569, 0.8039, 0.0824)");
    eq("172", "Color 槽吃 int：负数与 2³² 边界", `${colorSlot(-1)}/${colorSlot(4294967295)}/${colorSlot(4294967296)}/${colorSlot(0)}`, "(1.0, 1.0, 1.0, 1.0)/(1.0, 1.0, 1.0, 1.0)/(0.0, 0.0, 0.0, 0.0)/(0.0, 0.0, 0.0, 0.0)");
    eq("172", "构造器 Color(int) 与槽同一套解析", `${show(colorNew([V.int(123456789)]))}/${show(colorNew([V.int(0)]))}`, "(0.0275, 0.3569, 0.8039, 0.0824)/(0.0, 0.0, 0.0, 0.0)");
    eq("172", "Color 槽吃 Color 原样过", show(paramSlot(colorNew([V.int(-1)]), "Color", 1, "p", self)), "(1.0, 1.0, 1.0, 1.0)");

    // Vector3 / Vector3i / StringName 三个槽：只有同型与一条加宽/截断能转，其余来源在运行时抛入口那句
    eq("173", "Vector3 槽吃 Vector3i → 升 float", show(paramSlot(vector3iNew([V.int(1), V.int(2), V.int(3)]), "Vector3", 1, "p", self)), "(1.0, 2.0, 3.0)");
    eq("173", "Vector3i 槽吃 Vector3 → 逐分量向零截断", show(paramSlot(vector3New([V.float(1.7), V.float(-2.9), V.float(3.1)]), "Vector3i", 1, "p", self)), "(1, -2, 3)");
    eq("173", "StringName 槽吃 String", show(paramSlot(V.str("nm"), "StringName", 1, "p", self)), "nm");
    eq(
      "173",
      "Vector2 塞 Vector3i 槽",
      errOf(vector2New([V.float(1.7), V.float(2.9)]), "Vector3i", 1, "f"),
      "Invalid type in function 'f' in base 'RefCounted (SlotA)'. Cannot convert argument 1 from Vector2 to Vector3i.",
    );
    eq("173", "Nil 塞 Vector3 槽", errOf(V.nil(), "Vector3", 1, "f"), "Invalid type in function 'f' in base 'RefCounted (SlotA)'. Cannot convert argument 1 from Nil to Vector3.");
    eq("173", "int 塞 StringName 槽", errOf(V.int(5), "StringName", 1, "f"), "Invalid type in function 'f' in base 'RefCounted (SlotA)'. Cannot convert argument 1 from int to StringName.");
  });
});
