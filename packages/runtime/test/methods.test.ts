// 由 tools/ops-check.ts 机械搬迁：region 585-604。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { range } from "@gds2js/runtime/runtime/builtins";
import { iter } from "@gds2js/runtime/runtime/methods";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { GBytes } from "@gds2js/runtime/runtime/packed";

describe("runtime/methods · iter 与属性派发", () => {
  it("229 · for i in 5 数到 4", async () => {
    const els = (v: Variant) =>
      iter(v)
        .map((x) => show(x))
        .join("|");
    eq("229", "for i in 5 数到 4", els(V.int(5)), "0|1|2|3|4");
    eq("229", "for i in 0 空转", els(V.int(0)), "");
    eq("229", "for i in -3 空转", els(V.int(-3)), "");
    eq("229", "for i in 1 只走一圈", els(V.int(1)), "0");
    eq("229", "与 range(4) 同形", els(V.int(4)), els(V.array(range([V.int(4)]))));
    eq("229", "float 上界给 float 元素", els(V.float(2)), "0.0|1.0");
    eq("229", "0.5 也走一圈", els(V.float(0.5)), "0.0");
    eq("229", "负 float 空转", els(V.float(-1)), "");
    eq("229", "PackedByteArray 可迭代", els(V.object(new GBytes([9, 8]))), "9|8");
    eq("229", "String 迭代仍按码点", els(V.str("é😀a")), "é|😀|a");
    shouldThrow("229", "nan 上界响亮拒", () => iter(V.float(NaN)));
    shouldThrow("229", "inf 上界响亮拒", () => iter(V.float(Infinity)));
    shouldThrow("229", "越界整数上界响亮拒", () => iter(V.int(2n ** 53n)));
    shouldThrow("229", "bool 不可迭代", () => iter(V.bool(true)));
  });
});
