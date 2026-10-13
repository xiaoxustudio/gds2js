/**
 * 容器一侧**引擎收下来**的实参折法：int 位吃 float / bool（截断、折 0 / 1）、bool 位吃 int，
 * 以及 `Dictionary.set` 的返回值 —— 21 行读数就是语料 354 的 golden（`corpus/cases/354-slot-coercion-folds/godot.txt`）。
 * 改前出货对 D / E / F / G 四行全抛 `需要 int` / `需要 bool`，`set` 还给 `null`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method, dictOf } from "@gds2js/runtime/runtime/methods";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, show } from "@gds2js/runtime/runtime/values";

const arr = (els: Variant[]): Variant => V.array(GArray.of(els));

describe("runtime/methods · 容器实参位的折法", () => {
  it("354 · slice / find / pop_at / insert / resize 的 int 位收 float 与 bool", async () => {
    const a = arr([V.int(1), V.int(2), V.int(3)]);
    eq("354", "slice 的两位收 float", show(method(a, "slice", [V.float(1.0), V.float(3.0)])), "[2, 3]");
    eq("354", "find 的 bool 位折成 true", show(method(a, "find", [V.int(2), V.bool(true)])), "1");
    eq("354", "pop_at 收 float 按截断（1.5 → 1）", show(method(a, "pop_at", [V.float(1.5)])), "2");
    eq("354", "pop_at 之后剩两个", show(a), "[1, 3]");
    eq("354", "size 跟着走", show(method(a, "size", [])), "2");
    eq("354", "insert 的下标收 float", show(method(a, "insert", [V.float(1.5), V.int(9)])), "0");
    eq("354", "insert 真的插进去了", show(a), "[1, 9, 3]");
    eq("354", "resize 收 float 按截断（2.9 → 2）", show(method(a, "resize", [V.float(2.9)])), "0");
    eq("354", "resize 之后只剩两个", show(a), "[1, 9]");
  });

  it("354 · Dictionary.set 给的是 true，不是 null", async () => {
    const d = dictOf([[V.str("a"), V.int(1)]]);
    eq("354", "set 已存在的键给 true", show(method(d, "set", [V.str("a"), V.int(2)])), "true");
    eq("354", "set 换掉了值", show(d), '{ "a": 2 }');
    eq("354", "set 整数键也给 true", show(method(d, "set", [V.int(1), V.int(5)])), "true");
    eq("354", "两次 set 之后的字典", show(d), '{ "a": 2, 1: 5 }');
  });
});
