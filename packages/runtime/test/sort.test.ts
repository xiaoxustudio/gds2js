// 由 tools/ops-check.ts 机械搬迁：region 827-858, 3067-3093。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { isLess } from "@gds2js/runtime/runtime/ops";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, show } from "@gds2js/runtime/runtime/values";
import { GVector2, vecCmp, vector2 } from "@gds2js/runtime/runtime/vector2";
import { GVector2i, asVec2i, vector2i } from "@gds2js/runtime/runtime/vector2i";
import { F, I, S } from "./support/variants";

describe("runtime/values · 排序", () => {
  it("070 · int/float 混排按数值、各自保留原类型", async () => {
    const nums = GArray.of([I(3), F(1.5), I(1)]);
    nums.sort();
    eq("070", "int/float 混排按数值、各自保留原类型", show(V.array(nums)), "[1, 1.5, 3]");
    const bools = GArray.of([V.bool(true), V.bool(false), V.bool(true)]);
    bools.sort();
    eq("070", "纯 bool 可排且 false 在前", show(V.array(bools)), "[false, true, true]");
    const vecs = GArray.of([vector2(1, 2), vector2(0, 3)]);
    vecs.sort();
    eq("070", "Vector2 数组按字典序排", show(V.array(vecs)), "[(0.0, 3.0), (1.0, 2.0)]");
    const big = GArray.of([I(9007199254740993n), I(9007199254740992n), I(1)]);
    big.sort();
    eq("070", ">2^53 的 int 排序不被折成同值", show(V.array(big)), "[1, 9007199254740992, 9007199254740993]");
    const pair = (k: number, tag: string) => V.array(GArray.of([I(k), S(tag)]));
    const first = (v: Variant) => ((v.v as GArray).raw()[0] as Variant).v as number;
    const ties = GArray.of([pair(1, "a"), pair(2, "b"), pair(1, "c"), pair(2, "d"), pair(1, "e")]);
    ties.sortCustom((x, y) => first(x) < first(y));
    eq("070", "sort_custom 同键保持插入序", show(V.array(ties)), '[[1, "a"], [1, "c"], [1, "e"], [2, "b"], [2, "d"]]');
    const sorted = GArray.of([I(1), I(3), I(5)]);
    eq("070", "bsearch 命中给下标", sorted.bsearch(I(3), isLess), 1);
    eq("070", "bsearch 未命中给插入位置", sorted.bsearch(I(4), isLess), 2);
    const unsorted = GArray.of([I(3), I(1), I(2)]);
    eq("070", "bsearch 不检查有序、照二分走法给值", unsorted.bsearch(I(2), isLess), 2);
    eq("070", "bsearch 超出上界给 size", unsorted.bsearch(I(99), isLess), 3);
    eq("070", "find 用深度相等", GArray.of([pair(1, "a"), pair(3, "b")]).findSame(pair(3, "b")), 1);
    eq("070", "find 未命中给 -1", unsorted.findSame(I(9)), -1);
    eq("070", "count 数深度相等的个数", unsorted.count(I(3)), 1);
    eq("070", "min 走同一个比较口径", show(unsorted.extreme(true, isLess) as Variant), "1");
    eq("070", "空数组 extreme 给 null", GArray.of([]).extreme(true, isLess), null);
    shouldThrow("070", "混合类型排序仍然响亮报缺", () => GArray.of([I(1), S("a")]).sort());
    eq("070", "字典序比较不是逐分量", vecCmp(new GVector2(3, 4), new GVector2(2, 5)), 1);
  });

  it("189 · sort_custom 走引擎那份置换：packages/runtime/src…", async () => {
    // sort_custom 走引擎那份置换：packages/runtime/src/runtime/sort.ts 逐行转写 core/templates/sort_array.h
    const perm = (n: number, key: (i: number) => number, cmp: (x: number, y: number) => boolean): string => {
      const g = GArray.of(Array.from({ length: n }, (_x, i) => vector2i(key(i), i)));
      g.sortCustom((x, y) => cmp((asVec2i(x) as GVector2i).x, (asVec2i(y) as GVector2i).x));
      return g.raw().map((v) => String((asVec2i(v) as GVector2i).y)).join(" ");
    };
    const lt = (x: number, y: number): boolean => x < y;
    eq("189", "n≤16 全等键不动 —— 插入趟本来就是稳定的，这是用例 105 一直对得上的原因", perm(16, () => 0, lt), "0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15");
    eq("189", "n=17 全等键整段反序（n≥17 起 introsort 接管）", perm(17, () => 0, lt), "16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0");
    eq("189", "n=19 也整段反序（没参与拟合的那格）", perm(19, () => 0, lt), "18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0");
    eq(
      "189",
      "n=100 全等键是四块 × 25、块内降序、块序 Q2 Q3 Q0 Q1",
      perm(100, () => 0, lt),
      "74 73 72 71 70 69 68 67 66 65 64 63 62 61 60 59 58 57 56 55 54 53 52 51 50 99 98 97 96 95 94 93 92 91 90 89 88 87 86 85 84 83 82 81 80 79 78 77 76 75 24 23 22 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0 49 48 47 46 45 44 43 42 41 40 39 38 37 36 35 34 33 32 31 30 29 28 27 26 25",
    );
    eq(
      "189",
      "mod7 的 n=30：分块不再是 25 一份，键散开后排成 Godot 那一条",
      perm(30, (i) => i % 7, lt),
      "0 28 21 14 7 29 22 15 1 8 2 23 16 9 10 24 17 3 25 11 4 18 19 12 5 26 20 27 6 13",
    );
    // 非自洽比较器：置换能复现，Godot 那行 `ERROR: bad comparison function; sorting will be broken` 复现不了 → 只进这里，不进语料
    eq("189", "`<=` 比较器走 ERR_BAD_COMPARE 的 break 分支（只中断当前那个扫描 while）", perm(10, (i) => i % 3, (x, y) => x <= y), "9 6 3 0 7 4 1 8 5 2");
    eq("189", "恒真比较器 n=17：收尾插入趟被 `next == 0` 那道 break 截住，头两格换了个位", perm(17, (i) => i, () => true), "15 16 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0");
  });
});
