// 由 tools/ops-check.ts 机械搬迁：region 181-197, 501-509, 1035-1271, 1273-1323, 1325-1421, 1946-2003, 2005-2102, 2216-2244。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { callable } from "@gds2js/runtime/runtime/object";
import { method } from "@gds2js/runtime/runtime/methods";
import { ops } from "@gds2js/runtime/runtime/ops";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show, elemConvert, elemDefault, stampArray, stampDict, valueEq, valueSame } from "@gds2js/runtime/runtime/values";
import { vector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { F, I, S } from "./support/variants";

describe("runtime/values · GArray", () => {
  it("056 · 装箱 a[-1] 读末格", async () => {
    const g = GArray.of([I(1), I(2), I(3)]);
    eq("056", "装箱 a[-1] 读末格", show(g.get(-1)), "3");
    eq("056", "装箱 a[-3] 读首格", show(g.get(-3)), "1");
    g.set(-1, I(9));
    eq("056", "装箱 a[-1]=9 写末格", show(V.array(g)), "[1, 2, 9]");
    g.set(-2, I(8));
    eq("056", "装箱 a[-2]=8 写倒数第二格", show(V.array(g)), "[1, 8, 9]");
    shouldThrow("056", "装箱读越界抛错", () => g.get(3));
    shouldThrow("056", "装箱负索引超出抛错", () => g.get(-4));
    shouldThrow("056", "装箱写越界抛错", () => g.set(5, I(0)));
    try {
      g.set(5, I(0));
    } catch {
    }
    eq("056", "写越界被拒后数组长度不变", g.size(), 3);
  });

  it("007 · b.append 后 a 也变", async () => {
    const a = GArray.of([I(1), I(2)]);
    const b = a;
    b.append(I(3));
    eq("007", "b.append 后 a 也变", show(V.array(a)), "[1, 2, 3]");
    const c = a.duplicate();
    c.append(I(9));
    eq("007", "duplicate 后 a 不受影响", show(V.array(a)), "[1, 2, 3]");
  });

  it("080 +1 · insert(0) 插到最前", async () => {
    const arrOf = (xs: Variant[]) => V.array(GArray.of(xs));
    const call = (v: Variant, name: string, args: Variant[] = []) => method(v, name, args);
    const N = V.nil();
    const B = (b: boolean) => V.bool(b);
    const vec = (x: number, y: number) => vector2(x, y);
    const dict = (pairs: [Variant, Variant][]) => {
      const g = new GDict();
      for (const [k, v] of pairs) g.set(k, v);
      return V.dict(g);
    };

    const ins = arrOf([I(1), I(2), I(3)]);
    call(ins, "insert", [I(0), I(9)]);
    eq("080", "insert(0) 插到最前", show(ins), "[9, 1, 2, 3]");
    call(ins, "insert", [I(2), I(8)]);
    eq("080", "insert(2) 插到中间", show(ins), "[9, 1, 8, 2, 3]");
    call(ins, "insert", [I(10), I(7)]);
    eq("080", "insert 越界静默不插入", show(ins), "[9, 1, 8, 2, 3]");
    call(ins, "insert", [I(6), I(7)]);
    eq("080", "insert 的 at 越过尾也不插入", show(ins), "[9, 1, 8, 2, 3]");
    call(ins, "insert", [I(5), I(7)]);
    eq("080", "insert(at == size) 尾接", show(ins), "[9, 1, 8, 2, 3, 7]");
    const neg = arrOf([I(1), I(2), I(3)]);
    call(neg, "insert", [I(-1), I(5)]);
    eq("080", "insert(-1) 从尾部折算", show(neg), "[1, 2, 5, 3]");
    call(neg, "insert", [I(-9), I(4)]);
    eq("080", "insert 负向越界也不插入", show(neg), "[1, 2, 5, 3]");
    const fresh = arrOf([]);
    call(fresh, "insert", [I(0), I(1)]);
    eq("080", "空数组 insert(0) 给一格", show(fresh), "[1]");

    const pp = arrOf([I(1), I(2), I(3)]);
    eq("080", "pop_front 给值并移除", show(call(pp, "pop_front")), "1");
    eq("080", "pop_back 给值并移除", show(call(pp, "pop_back")), "3");
    eq("080", "pop 之后剩中间那格", show(pp), "[2]");
    eq("080", "pop_at(5) 越界给 null", show(call(pp, "pop_at", [I(5)])), "<null>");
    eq("080", "pop_at 越界不改数组", show(pp), "[2]");
    eq("080", "pop_at(-9) 折算后仍越界给 null", show(call(pp, "pop_at", [I(-9)])), "<null>");
    const last = arrOf([I(1), I(2), I(3)]);
    eq("080", "pop_at(-1) 是最后一格", show(call(last, "pop_at", [I(-1)])), "3");
    eq("080", "pop_at(-1) 之后数组缩短", show(last), "[1, 2]");
    const empt = arrOf([]);
    eq("080", "空数组 pop_front 给 null", show(call(empt, "pop_front")), "<null>");
    eq("080", "空数组 pop_back 给 null", show(call(empt, "pop_back")), "<null>");
    eq("080", "空数组 pop_at 给 null", show(call(empt, "pop_at", [I(0)])), "<null>");

    const rm = arrOf([I(1), I(2), I(3)]);
    call(rm, "remove_at", [I(0)]);
    eq("080", "remove_at(0)", show(rm), "[2, 3]");
    call(rm, "remove_at", [I(5)]);
    eq("080", "remove_at 越界静默无操作", show(rm), "[2, 3]");
    call(rm, "remove_at", [I(-1)]);
    eq("080", "remove_at(-1) 删最后一格", show(rm), "[2]");
    const er = arrOf([I(1), I(2), I(3), I(1)]);
    call(er, "erase", [I(2)]);
    eq("080", "erase 删掉第一个匹配", show(er), "[1, 3, 1]");
    call(er, "erase", [I(9)]);
    eq("080", "erase 没匹配就什么都不做", show(er), "[1, 3, 1]");
    call(er, "erase", [I(1)]);
    eq("080", "erase 只删第一个、不删全部", show(er), "[3, 1]");
    const erNest = arrOf([V.array(GArray.of([I(1), I(2)])), I(3)]);
    call(erNest, "erase", [V.array(GArray.of([I(1), I(2)]))]);
    eq("080", "erase 嵌套数组按值匹配", show(erNest), "[3]");
    const erMix = arrOf([F(1), I(1)]);
    call(erMix, "erase", [I(1)]);
    eq("080", "erase 用身份口径：1 不碰 1.0", show(erMix), "[1.0]");
    const rv = arrOf([I(1), I(2), I(3)]);
    call(rv, "reverse");
    eq("080", "reverse 原地反转", show(rv), "[3, 2, 1]");
    call(rv, "clear");
    eq("080", "clear 清空", `${show(rv)}/${show(call(rv, "is_empty"))}`, "[]/true");
    eq("080", "is_empty 对非空是 false", show(call(arrOf([I(1)]), "is_empty")), "false");

    const fl = arrOf([I(1), I(2)]);
    const srcArr = arrOf([I(9)]);
    call(fl, "fill", [srcArr]);
    eq("080", "fill 填进去的是引用", show(fl), "[[9], [9]]");
    call(srcArr, "assign", [arrOf([I(5)])]);
    eq("080", "改源数组会串进每一格", show(fl), "[[5], [5]]");

    const SL = (begin: number, end?: number, step?: number, deep?: boolean) =>
      show(
        call(
          arrOf([I(1), I(2), I(3), I(4), I(5)]),
          "slice",
          [
            I(begin),
            ...(end === undefined ? [] : [I(end)]),
            ...(step === undefined ? [] : [I(step)]),
            ...(deep === undefined ? [] : [B(deep)]),
          ],
        ),
      );
    eq("080", "slice(1,3)", SL(1, 3), "[2, 3]");
    eq("080", "slice(-2) 从尾部", SL(-2), "[4, 5]");
    eq("080", "slice(1) 缺 end 截到尾", SL(1), "[2, 3, 4, 5]");
    eq("080", "slice(0,10) 越界夹紧", SL(0, 10), "[1, 2, 3, 4, 5]");
    eq("080", "slice(3,1) 反向不给倒序", SL(3, 1), "[]");
    eq("080", "slice(0,0) 空", SL(0, 0), "[]");
    eq("080", "slice(-9) 起点夹到 0", SL(-9), "[1, 2, 3, 4, 5]");
    eq("080", "slice(-9,-6) 两头都夹", SL(-9, -6), "[]");
    eq("080", "显式 slice(2,-1) 是「末位前一格」为终点", SL(2, -1), "[3, 4]");
    eq("080", "slice(0,5,2) 步长", SL(0, 5, 2), "[1, 3, 5]");
    eq("080", "slice(1,4,3)", SL(1, 4, 3), "[2]");
    eq("080", "负步长方向不对给空", SL(0, 5, -1), "[]");
    eq("080", "slice(4,1,-1) 往回走", SL(4, 1, -1), "[5, 4, 3]");
    eq("080", "slice(-1,-6,-1) 走到下标 0 为止", SL(-1, -6, -1), "[5, 4, 3, 2, 1]");
    eq("080", "起点越界从末位开始", SL(9, 1, -1), "[5, 4, 3]");
    eq("080", "步长 0 实测给空数组", SL(0, 5, 0), "[]");
    const sh2 = arrOf([V.array(GArray.of([I(1)])), V.array(GArray.of([I(2)]))]);
    const cut = call(sh2, "slice", [I(0), I(2)]) as Variant;
    call(call(cut, "pop_front") as Variant, "erase", [I(1)]);
    eq("080", "slice 默认浅切：内层共享", show(sh2), "[[], [2]]");
    const sh3 = arrOf([V.array(GArray.of([I(1)])), V.array(GArray.of([I(2)]))]);
    const deepCut = call(sh3, "slice", [I(0), I(2), I(1), B(true)]) as Variant;
    call(deepCut, "assign", [arrOf([V.array(GArray.of([I(9)]))])]);
    eq("080", "slice(..., true) 深切：改不到原表", show(sh3), "[[1], [2]]");

    const dupSrc = arrOf([arrOf([I(1)])]);
    const shallowInner = call(call(dupSrc, "duplicate"), "pop_front") as Variant;
    call(shallowInner, "erase", [I(1)]);
    eq("080", "duplicate() 是浅拷贝：改副本的内层会串回原表", show(dupSrc), "[[]]");
    const dupSrc2 = arrOf([arrOf([I(1)])]);
    const deepInner = call(call(dupSrc2, "duplicate", [B(true)]), "pop_front") as Variant;
    call(deepInner, "erase", [I(1)]);
    eq("080", "duplicate(true) 断开内层", show(dupSrc2), "[[1]]");
    const ap = arrOf([I(1)]);
    const asrc = arrOf([arrOf([I(9)])]);
    call(ap, "append_array", [asrc]);
    call(asrc, "pop_back");
    eq("080", "append_array 之后动源数组的外层不影响 ap", show(ap), "[1, [9]]");
    const ap2 = arrOf([]);
    const asrc2 = arrOf([arrOf([I(9)])]);
    call(ap2, "append_array", [asrc2]);
    call(call(asrc2, "pop_back"), "erase", [I(9)]);
    eq("080", "append_array 接的是同一个内层引用", show(ap2), "[[]]");
    const asg = arrOf([I(1), I(2)]);
    const bsrc = arrOf([I(3)]);
    call(asg, "assign", [bsrc]);
    call(bsrc, "push_back", [I(9)]);
    eq("080", "assign 换整层但不共享外层结构", show(asg), "[3]");
    const asg2 = arrOf([]);
    const nsrc = arrOf([V.array(GArray.of([I(1)]))]);
    call(asg2, "assign", [nsrc]);
    call(call(nsrc, "pop_front"), "erase", [I(1)]);
    eq("080", "assign 的元素仍共享", show(asg2), "[[]]");

    const idn = arrOf([I(1), F(1), B(true), N, V.stringName("a")]);
    eq("080", "has 命中 int 1", show(call(idn, "has", [I(1)])), "true");
    eq("080", "has 命中 float 1.0", show(call(idn, "has", [F(1)])), "true");
    eq("080", "has 命中 true", show(call(idn, "has", [B(true)])), "true");
    eq("080", "has 命中 null", show(call(idn, "has", [N])), "true");
    eq("080", "StringName 与 String 身份合一", show(call(idn, "has", [S("a")])), "true");
    eq("080", "[1] 里没有 1.0（has 不看 ==）", show(call(arrOf([I(1)]), "has", [F(1)])), "false");
    eq("080", "[1] 里 find(1.0) 给 -1", show(call(arrOf([I(1)]), "find", [F(1)])), "-1");
    eq("080", "[1] 里 count(1.0) 给 0", show(call(arrOf([I(1)]), "count", [F(1)])), "0");
    eq("080", "[0] 里没有 false", show(call(arrOf([I(0)]), "has", [B(false)])), "false");
    eq("080", "[null] 里没有 0", show(call(arrOf([N]), "has", [I(0)])), "false");
    eq("080", "嵌套容器也按身份递归", show(call(arrOf([V.array(GArray.of([I(1)]))]), "has", [V.array(GArray.of([F(1)]))])), "false");
    eq("080", "字典身份不看键序", show(call(arrOf([dict([[S("x"), I(1)], [S("y"), I(2)]])]), "count", [dict([[S("y"), I(2)], [S("x"), I(1)]])])), "1");
    eq("080", "Vector2 按分量身份", show(call(arrOf([vec(1, 2)]), "count", [vec(1.0, 2.0)])), "1");
    eq("080", "1 == 1.0 运算符仍是真（口径不同）", show(ops.eq(I(1), F(1))), "true");

    const fr = arrOf([I(1), I(2), I(1), I(2)]);
    eq("080", "find 默认从头", show(call(fr, "find", [I(1)])), "0");
    eq("080", "find(1,1) 从下标 1 往后", show(call(fr, "find", [I(1), I(1)])), "2");
    eq("080", "find 起点越过尾给 -1", show(call(fr, "find", [I(1), I(9)])), "-1");
    eq("080", "find 的负 from 不做尾部折算", show(call(fr, "find", [I(1), I(-1)])), "-1");
    eq("080", "rfind 默认从尾往回", show(call(fr, "rfind", [I(1)])), "2");
    eq("080", "rfind(1,0) 只看下标 0", show(call(fr, "rfind", [I(1), I(0)])), "0");
    eq("080", "rfind(1,1) 回看 1、0", show(call(fr, "rfind", [I(1), I(1)])), "0");
    eq("080", "rfind(1,-2) 折算到下标 2", show(call(fr, "rfind", [I(1), I(-2)])), "2");
    eq("080", "rfind(1,-4) 折算到 0", show(call(fr, "rfind", [I(1), I(-4)])), "0");
    eq("080", "rfind(1,-9) 折算仍越界 → 退回整段", show(call(fr, "rfind", [I(1), I(-9)])), "2");
    eq("080", "rfind 未命中给 -1", show(call(fr, "rfind", [I(9)])), "-1");
    const ru = arrOf([I(1)]);
    call(ru, "resize", [I(3)]);
    eq("080", "未定型数组 resize 填 null", show(ru), "[1, <null>, <null>]");

    const dm = new GDict();
    dm.set(S("a"), I(1));
    dm.set(S("b"), I(2));
    const dmv = V.dict(dm);
    eq("081", "erase 命中给 true", show(call(dmv, "erase", [S("a")])), "true");
    eq("081", "erase 之后只剩 b", show(dmv), '{ "b": 2 }');
    eq("081", "erase 没命中给 false", show(call(dmv, "erase", [S("zz")])), "false");
    eq("081", "erase 没命中不改内容", show(dmv), '{ "b": 2 }');
    const dc = dict([[I(1), I(2)]]);
    call(dc, "clear");
    eq("081", "clear 之后是空表", `${show(dc)}/${show(call(dc, "is_empty"))}/${show(call(dc, "size"))}`, "{  }/true/0");
    const mg = new GDict();
    mg.set(S("a"), I(1));
    const mgv = V.dict(mg);
    call(mgv, "merge", [dict([[S("a"), I(9)], [S("b"), I(2)]])]);
    eq("081", "merge 默认不覆盖已有键", show(mgv), '{ "a": 1, "b": 2 }');
    call(mgv, "merge", [dict([[S("a"), I(9)]]), B(true)]);
    eq("081", "merge(..., true) 才顶掉", show(mgv), '{ "a": 9, "b": 2 }');
    call(mgv, "merge", [V.dict(new GDict())]);
    eq("081", "merge 空表什么都不改", show(mgv), '{ "a": 9, "b": 2 }');
    const ha = dict([[S("a"), I(1)], [S("b"), I(2)]]);
    eq("081", "has_all 全中", show(call(ha, "has_all", [arrOf([S("a"), S("b")])])), "true");
    eq("081", "has_all 缺一个就 false", show(call(ha, "has_all", [arrOf([S("a"), S("z")])])), "false");
    eq("081", "has_all 空数组为真", show(call(ha, "has_all", [arrOf([])])), "true");
    const fk = dict([[S("a"), I(1)], [S("b"), I(2)]]);
    eq("081", "find_key 给键", show(call(fk, "find_key", [I(2)])), "b");
    eq("081", "find_key 未命中给 null", show(call(fk, "find_key", [I(99)])), "<null>");
    eq("081", "get 缺键给 null", show(call(fk, "get", [S("zz")])), "<null>");
    eq("081", "get 缺键带默认值给默认", show(call(fk, "get", [S("zz"), I(7)])), "7");
    eq("081", "get 命中给值", show(call(fk, "get", [S("a")])), "1");
    const dsrc = dict([[S("k"), arrOf([I(1)])]]);
    const dsh = call(dsrc, "duplicate") as Variant;
    call(dsh, "set", [S("k"), arrOf([I(9)])]);
    eq("081", "字典 duplicate() 浅：换整格不影响原表", show(dsrc), '{ "k": [1] }');
    const dsrc2 = dict([[S("k"), arrOf([I(1)])]]);
    const ddp = call(dsrc2, "duplicate", [B(true)]) as Variant;
    call(call(ddp, "get", [S("k")]), "push_back", [I(9)]);
    eq("081", "字典 duplicate(true) 深：内层断开", show(dsrc2), '{ "k": [1] }');
    const dasg = dict([[S("x"), I(1)]]);
    const dsrc3 = dict([[S("y"), I(2)]]);
    call(dasg, "assign", [dsrc3]);
    call(dsrc3, "set", [S("y"), I(9)]);
    eq("081", "字典 assign 换成实参的拷贝", show(dasg), '{ "y": 2 }');
    eq("081", "字典相等不看键序", show(ops.eq(dict([[S("x"), I(1)], [S("y"), I(2)]]), dict([[S("y"), I(2)], [S("x"), I(1)]]))), "true");
    const ko = new GDict();
    ko.set(S("b"), I(1));
    ko.set(S("a"), I(2));
    ko.set(S("b"), I(3));
    eq("081", "改已有键不挪位置", show(V.dict(ko)), '{ "b": 3, "a": 2 }');
    ko.erase(S("b"));
    ko.set(S("b"), I(4));
    eq("081", "erase 再插会排到末尾", show(V.dict(ko)), '{ "a": 2, "b": 4 }');
    eq("081", "erase 之后索引紧凑、旧键仍可查", `${show(ko.get(S("a")))}/${show(ko.get(S("b")))}`, "2/4");
    shouldThrow("081", "Dictionary.count() 不存在（实测 Nonexistent function）", () => call(ha, "count", [I(1)]));
    shouldThrow("081", "Dictionary.merge_recursive 不存在", () => call(mgv, "merge_recursive", [dsrc3]));
    shouldThrow("080", "Array.has_all 不存在（实测 Nonexistent function）", () => call(fr, "has_all", [arrOf([I(1)])]));
  });

  it("082 · filter 给新数组", async () => {
    const arrOf = (xs: Variant[]) => V.array(GArray.of(xs));
    const call = (v: Variant, name: string, args: Variant[] = []) => method(v, name, args);
    const A = arrOf([I(1), I(2), I(3), I(4)]);
    const one = (f: (x: Variant) => boolean) => callable((a: Variant[]) => V.bool(f(a[0] as Variant)), 1);
    const two = (f: (a: Variant, b: Variant) => Variant) => callable((a: Variant[]) => f(a[0] as Variant, a[1] as Variant), 2);
    const isGt2 = (x: Variant) => (x.v as number) > 2;

    eq("082", "filter 给新数组", show(call(A, "filter", [one(isGt2)])), "[3, 4]");
    eq("082", "filter 不改原数组", show(A), "[1, 2, 3, 4]");
    eq("082", "map 收的是返回值", show(call(A, "map", [one((x) => (x.v as number) % 2 === 0)])), "[false, true, false, true]");
    eq("082", "空数组 filter 给空", show(call(arrOf([]), "filter", [one(() => true)])), "[]");
    eq("082", "空数组 map 给空", show(call(arrOf([]), "map", [one(() => true)])), "[]");
    eq("082", "any 命中", show(call(A, "any", [one(isGt2)])), "true");
    eq("082", "all 全过", show(call(A, "all", [one((x) => (x.v as number) > 0)])), "true");
    eq("082", "all 有一个不过就 false", show(call(A, "all", [one(isGt2)])), "false");
    eq("082", "空数组 any 假", show(call(arrOf([]), "any", [one(() => true)])), "false");
    eq("082", "空数组 all 真", show(call(arrOf([]), "all", [one(() => false)])), "true");
    let hits = 0;
    call(A, "any", [one((x) => { hits++; return (x.v as number) > 2; })]);
    eq("082", "any 命中就停（1、2、3 三次）", hits, 3);
    hits = 0;
    call(A, "all", [one((x) => { hits++; return (x.v as number) > 2; })]);
    eq("082", "all 遇假就停（只调 1）", hits, 1);
    hits = 0;
    call(A, "filter", [one((x) => { hits++; return (x.v as number) > 2; })]);
    eq("082", "filter 不短路（四格全问）", hits, 4);
    eq("082", "find_custom 给下标", show(call(A, "find_custom", [one(isGt2)])), "2");
    eq("082", "find_custom 未命中 -1", show(call(A, "find_custom", [one((x) => (x.v as number) > 99)])), "-1");
    eq("082", "find_custom 的 from 不折负数", show(call(A, "find_custom", [one(isGt2), I(-1)])), "-1");
    eq("082", "find_custom 从 from 往后", show(call(A, "find_custom", [one((x) => (x.v as number) > 0), I(3)])), "3");
    eq("082", "rfind_custom 给下标", show(call(A, "rfind_custom", [one(isGt2)])), "3");
    eq("082", "rfind_custom(…, 0) 只看下标 0", show(call(A, "rfind_custom", [one(isGt2), I(0)])), "-1");
    eq("082", "rfind_custom 折算后越界退回整段", show(call(A, "rfind_custom", [one((x) => (x.v as number) === 1), I(-99)])), "0");
    eq("082", "reduce 带 acc 从下标 0 折", show(call(A, "reduce", [two((a, x) => V.int((a.v as number) + (x.v as number))), I(100)])), "110");
    eq("082", "reduce 省略 acc 拿首元素起折", show(call(arrOf([I(1), I(2), I(3)]), "reduce", [two((a, x) => V.int((a.v as number) * 10 + (x.v as number)))])), "123");
    eq("082", "reduce 单元素省略 acc", show(call(arrOf([I(5)]), "reduce", [two((a, x) => V.int((a.v as number) + (x.v as number)))])), "5");
    eq("082", "reduce 空数组带 acc 给 acc", show(call(arrOf([]), "reduce", [two((a) => a), I(5)])), "5");
    eq("082", "reduce 空数组省略 acc 给 null", show(call(arrOf([]), "reduce", [two((a) => a)])), "<null>");
    const wrongArity = callable(() => V.bool(true), 0);
    eq("082", "map 遇到调用失败就不收这一格", show(call(A, "map", [wrongArity])), "[]");
    eq("082", "filter 遇到调用失败全丢", show(call(A, "filter", [wrongArity])), "[]");
    eq("082", "any 遇到调用失败给 false", show(call(A, "any", [wrongArity])), "false");
    eq("082", "all 遇到调用失败也给 false", show(call(A, "all", [wrongArity])), "false");
    eq("082", "find_custom 遇到调用失败给 -1", show(call(A, "find_custom", [wrongArity])), "-1");
    eq("082", "reduce 遇到调用失败整表给 null", show(call(A, "reduce", [wrongArity, I(0)])), "<null>");
    const unsorted = arrOf([I(2), I(1)]);
    call(unsorted, "sort_custom", [one(() => true)]);
    eq("082", "实参个数不对的比较器保持原序", show(unsorted), "[2, 1]");
    shouldThrow("082", "filter 的非 Callable 实参要响", () => call(A, "filter", [I(1)]));
  });

  it("083 · int ← float 向零截断", async () => {
    const call = (v: Variant, name: string, args: Variant[] = []) => method(v, name, args);
    const typed = (kind: string, xs: Variant[]) => stampArray(V.array(GArray.of(xs)), kind as never, true);
    const SHOW = (v: Variant | null) => (v === null ? "<reject>" : show(v));

    eq("083", "int ← float 向零截断", SHOW(elemConvert("int", F(2.9))), "2");
    eq("083", "int ← 负 float 也向零", SHOW(elemConvert("int", F(-1.9))), "-1");
    eq("083", "int ← 越界 float 饱和到 INT64_MIN", SHOW(elemConvert("int", F(1e20))), "-9223372036854775808");
    eq("083", "int ← bool", SHOW(elemConvert("int", V.bool(true))), "1");
    eq("083", "int ← String 拒绝", SHOW(elemConvert("int", S("3"))), "<reject>");
    eq("083", "int ← null 拒绝", SHOW(elemConvert("int", V.nil())), "<reject>");
    eq("083", "float ← int", SHOW(elemConvert("float", I(3))), "3.0");
    eq("083", "float ← bool", SHOW(elemConvert("float", V.bool(true))), "1.0");
    eq("083", "bool ← 0 / 2 / 2.5", [0, 2, 2.5].map((n) => SHOW(elemConvert("bool", n % 1 === 0 ? I(n) : F(n)))).join(","), "false,true,true");
    eq("083", "bool ← String 拒绝", SHOW(elemConvert("bool", S("x"))), "<reject>");
    eq("083", "String ← StringName", SHOW(elemConvert("String", V.stringName("x"))), "x");
    eq("083", "String ← int 拒绝", SHOW(elemConvert("String", I(3))), "<reject>");
    eq("083", "StringName ← String", (elemConvert("StringName", S("x")) as Variant).t, Tag.STRING_NAME);
    eq("083", "Vector2 ← int 拒绝", SHOW(elemConvert("Vector2", I(1))), "<reject>");
    eq("083", "Array ← Dictionary 拒绝", SHOW(elemConvert("Array", V.dict(new GDict()))), "<reject>");

    const defOf = (kind: string) => show(elemDefault(kind as never));
    eq("083", "int 默认 0", defOf("int"), "0");
    eq("083", "float 默认 0.0", defOf("float"), "0.0");
    eq("083", "bool 默认 false", defOf("bool"), "false");
    eq("083", "String 默认空串", "[" + defOf("String") + "]", "[]");
    eq("083", "StringName 默认 &\"\"", defOf("StringName"), "");
    eq("083", "Vector2 默认 (0.0, 0.0)", defOf("Vector2"), "(0.0, 0.0)");
    eq("083", "Array 默认 []", defOf("Array"), "[]");
    eq("083", "Dictionary 默认 {  }", defOf("Dictionary"), "{  }");

    const ai = typed("int", [I(1), F(2.5), V.bool(true)]);
    eq("083", "字面量初值逐格转换", show(ai), "[1, 2, 1]");
    call(ai, "append", [F(4.9)]);
    call(ai, "append", [S("s")]);
    call(ai, "append", [V.nil()]);
    eq("083", "append 被拒的元素不进去", show(ai), "[1, 2, 1, 4]");
    call(ai, "insert", [I(0), F(9.8)]);
    eq("083", "insert 也转换", show(ai), "[9, 1, 2, 1, 4]");
    call(ai, "insert", [I(0), S("x")]);
    eq("083", "insert 被拒时数组不动", show(ai), "[9, 1, 2, 1, 4]");
    call(ai, "fill", [F(5.7)]);
    eq("083", "fill 转换后填满", show(ai), "[5, 5, 5, 5, 5]");
    const q = typed("int", [I(1), I(2)]);
    eq("083", "定型数组 find(1.0) 命中", show(call(q, "find", [F(1)])), "0");
    eq("083", "定型数组 count(1.0) 计数", show(call(q, "count", [F(1)])), "1");
    eq("083", "定型数组 has(1.0) 为真", show(call(q, "has", [F(1)])), "true");
    eq("083", "未定型数组 find(1.0) 仍是 -1", show(call(V.array(GArray.of([I(1)])), "find", [F(1)])), "-1");
    eq("083", "定型数组 find(\"s\") 收不下 → -1", show(call(q, "find", [S("s")])), "-1");
    call(q, "erase", [F(2.5)]);
    eq("083", "erase 也先收成本类型", show(q), "[1]");
    const rz = typed("int", [I(1)]);
    call(rz, "resize", [I(3)]);
    eq("083", "resize 扩张填类型默认值", show(rz), "[1, 0, 0]");
    call(rz, "resize", [I(1)]);
    eq("083", "resize 收缩是截断", show(rz), "[1]");
    const rzu = V.array(GArray.of([I(1)]));
    call(rzu, "resize", [I(3)]);
    eq("083", "未定型数组填 null", show(rzu), "[1, <null>, <null>]");
    const keepTyped = (v: Variant) => {
      call(v, "append", [S("s")]);
      return show(v);
    };
    eq("083", "duplicate 保留定型", keepTyped(call(typed("int", [I(1)]), "duplicate")), "[1]");
    eq("083", "slice 保留定型", keepTyped(call(typed("int", [I(1)]), "slice", [I(0), I(1)])), "[1]");
    eq("083", "filter 保留定型", keepTyped(call(typed("int", [I(1)]), "filter", [callable((a: Variant[]) => V.bool(true), 1)])), "[1]");
    eq("083", "map 不保留定型", keepTyped(call(typed("int", [I(1)]), "map", [callable((a: Variant[]) => a[0] as Variant, 1)])), '[1, "s"]');
    eq("083", "+ 不保留定型", keepTyped(ops.add(typed("int", [I(1)]), V.array(GArray.of([I(2)])))), '[1, 2, "s"]');
    const aa = typed("int", [I(0)]);
    call(aa, "append_array", [V.array(GArray.of([I(1), S("s")]))]);
    eq("083", "append_array 有一格不合格就整个不动", show(aa), "[0]");
    call(aa, "append_array", [V.array(GArray.of([F(1.5), F(2.5)]))]);
    eq("083", "append_array 全合格就逐格转换", show(aa), "[0, 1, 2]");
    const asrc = V.array(GArray.of([I(3)]));
    const ag = typed("int", [I(9)]);
    call(ag, "assign", [asrc]);
    call(asrc, "push_back", [I(7)]);
    eq("083", "assign 换整层但不共享外层", show(ag), "[3]");
    call(ag, "assign", [V.array(GArray.of([I(4), S("s")]))]);
    eq("083", "assign 也全有或全无", show(ag), "[3]");
    shouldThrow("083", "未定型数组不能当定型变量的初值", () => stampArray(V.array(GArray.of([])), "int", false));
    shouldThrow("083", "未定型字典同理", () => stampDict(V.dict(new GDict()), "String", "int", false));
    const dt = stampDict(V.dict(new GDict()), "String", "int", true);
    const dv = dt.v as GDict;
    dv.set(S("a"), F(1.9));
    eq("083", "字典值按 valKind 转换", show(dt), '{ "a": 1 }');
    dv.set(V.stringName("b"), I(2));
    eq("083", "字典键按 keyKind 收成 String", show(dt), '{ "a": 1, "b": 2 }');
    dv.set(I(3), I(3));
    eq("083", "键收不下就整次 set 作废", show(dt), '{ "a": 1, "b": 2 }');
    eq("083", "字典 has 先收键类型", show(dt.t === Tag.DICT ? method(dt, "has", [V.stringName("a")]) : V.nil()), "true");
    eq("083", "字典 get 收不下的键当不存在", show(method(dt, "get", [I(1)])), "<null>");
    eq("083", "find_key 先收值类型", show(method(dt, "find_key", [F(2.0)])), "b");
    const freshT = typed("int", []);
    call(freshT, "insert", [I(0), I(1)]);
    eq("083", "空的定型数组 insert(0) 给一格", show(freshT), "[1]");
  });

  it("100 · 自引用数组打印长 207：101 个左括号 + 标记 + 101 个右括号", async () => {
    const items = (g: unknown): Variant[] => (g as { items: Variant[] }).items;
    const mkA = (): [GArray, Variant] => {
      const g = GArray.of([]);
      const gv = V.array(g);
      items(g).push(gv);
      return [g, gv];
    };
    const mkD = (): [GDict, Variant] => {
      const d = new GDict();
      const dv = V.dict(d);
      d.set(V.str("x"), dv);
      return [d, dv];
    };
    const nest = (n: number): Variant => {
      let c = V.array(GArray.of([]));
      for (let i = 0; i < n; i++) {
        const g = GArray.of([]);
        items(g).push(c);
        c = V.array(g);
      }
      return c;
    };
    const [ga, gv] = mkA();
    const [gd, dv] = mkD();
    const sa = show(gv);
    const sd = show(dv);
    eq("100", "自引用数组打印长 207：101 个左括号 + 标记 + 101 个右括号", String(sa.length), "207");
    eq("100", "数组的收尾标记是 [...]（不带空格）", sa.slice(0, 3) + "|" + sa.slice(101, 106) + "|" + sa.slice(-3), "[[[|[...]|]]]");
    eq("100", "自引用字典打印长 916", String(sd.length), "916");
    eq("100", "字典的收尾标记是带空格的 { ... }（第 707 格起）", sd.slice(0, 7) + "|" + sd.slice(707, 714), `{ \"x\": |{ ... }`);
    eq("100", "101 层的有限深结构全展开（没有标记）", String(show(nest(100)).length), "202");
    eq("100", "102 层起最里一层换成标记：环与有限深走同一道闸门", String(show(nest(101)).length), "207");
    {
      const p = GArray.of([]);
      const pv = V.array(p);
      const q = GArray.of([]);
      const qv = V.array(q);
      items(p).push(qv);
      items(q).push(pv);
      eq("100", "间接环与直接环同层数（不是重复检测）", String(show(pv).length), "207");
    }
    const [gb, bv] = mkA();
    eq("100", "两个不同的自引用数组 == 为真（实测 a == b）", String(valueEq(gv, bv)), "true");
    eq("100", "同引用仍是真", String(valueEq(gv, gv)), "true");
    const [hd, hv] = mkD();
    eq("100", "两个不同的自引用字典 == 为真", String(valueEq(dv, hv)), "true");
    eq("100", "身份版比较同样截断，不栈溢出", String(valueSame(dv, hv)), "true");
    const ca = ga.duplicate(true);
    eq("100", "深拷贝保住环：副本的第 0 格就是副本自己", String((items(ca)[0] as Variant).v === ca), "true");
    eq("100", "深拷贝的打印与原物同形", show(V.array(ca)), sa);
    eq("100", "浅拷贝照旧共享内层", String(items(ga.duplicate())[0] === gv), "true");
    const cd = gd.duplicate(true);
    eq("100", "字典深拷贝保住环", String((cd.getRequired(V.str("x")) as Variant).v === cd), "true");
    eq("100", "字典深拷贝的打印同形", show(V.dict(cd)), sd);
    eq("100", "数组里两个环：外层占掉一层，两个子环各短一格", String(show(V.array(GArray.of([gv, gv]))).length), "414");
    eq("100", "深拷出来的环按层数与原物相等", String(valueEq(V.array(ca), gv)), "true");
  });

  it("101 · 比较闸门 = 52：a == nest(51) 假", async () => {
    const its = (g: unknown): Variant[] => (g as { items: Variant[] }).items;
    const cyc = (): Variant => {
      const g = GArray.of([]);
      const v = V.array(g);
      its(g).push(v);
      return v;
    };
    const nest = (n: number): Variant => {
      let c = V.array(GArray.of([]));
      for (let i = 0; i < n; i++) {
        const g = GArray.of([]);
        its(g).push(c);
        c = V.array(g);
      }
      return c;
    };
    const eqs = (a: Variant, b: Variant) => String(valueEq(a, b));

    eq("101", "比较闸门 = 52：a == nest(51) 假", eqs(cyc(), nest(51)), "false");
    eq("101", "a == nest(52) 真", eqs(cyc(), nest(52)), "true");
    eq("101", "nest(51) == nest(52) 假", eqs(nest(51), nest(52)), "false");
    eq("101", "nest(52) == nest(53) 真（52 层之外明显不同的容器会相等）", eqs(nest(52), nest(53)), "true");
    {
      const d = new GDict();
      d.set(nest(100), V.int(1));
      eq("101", "桶闸门更深：d[nest(100)] 查 nest(101) 落空", `${d.has(nest(101))}/${d.size()}`, "false/1");
    }
    {
      const d = new GDict();
      d.set(nest(101), V.int(1));
      eq("101", "d[nest(101)] 查 nest(102) 命中", String(d.has(nest(102))), "true");
      d.set(nest(102), V.int(2));
      eq("101", "顶掉同一格、size 仍是 1", `${d.size()}/${String(d.getRequired(nest(101)).v)}`, "1/2");
    }
    {
      const a = cyc();
      const b = cyc();
      const d = new GDict();
      d.set(a, V.int(1));
      eq("101", "两个不同的环是同一格", String(d.has(b)), "true");
      d.set(b, V.int(2));
      eq("101", "顶掉之后两个键读到同一个值", `${String(d.getRequired(a).v)}/${String(d.getRequired(b).v)}`, "2/2");
      d.erase(a);
      eq("101", "erase 擦得掉环键", `${d.size()}/${String(d.has(b))}`, "0/false");
    }
    {
      const p = GArray.of([]);
      const q = GArray.of([]);
      const pv = V.array(p);
      const qv = V.array(q);
      its(p).push(qv);
      its(q).push(pv);
      const r = GArray.of([]);
      const s = GArray.of([]);
      const rv = V.array(r);
      its(r).push(V.array(s));
      its(s).push(rv);
      const d = new GDict();
      d.set(pv, V.int(1));
      eq("101", "间接环互等为真", eqs(pv, rv), "true");
      eq("101", "多包一层还是同一格（p / [p] / [[p]]）", `${d.has(rv)}/${d.has(V.array(GArray.of([pv])))}`, "true/true");
    }
    {
      const ca = new GDict();
      const cav = V.dict(ca);
      ca.set(V.str("k"), cav);
      const cb = new GDict();
      const cbv = V.dict(cb);
      cb.set(V.str("k"), cbv);
      const d = new GDict();
      d.set(cav, V.int(1));
      d.set(cbv, V.int(2));
      eq("101", "字典环键并格、size 1", `${d.size()}/${String(d.getRequired(cav).v)}`, "1/2");
      const arr = GArray.of([cav]);
      eq("101", "数组的 has/count 也按截断身份", `${arr.has(cbv)}/${arr.count(cbv)}`, "true/1");
    }
    {
      const e = V.array(GArray.of([]));
      const f = GArray.of([e]);
      const d = new GDict();
      d.set(e, V.int(1));
      d.set(V.array(f), V.int(2));
      eq("101", "[] 与 [[]] 仍是两格（闸门没把浅结构糊掉）", String(d.size()), "2");
    }
    {
      const k = V.array(GArray.of([V.int(1), V.int(2)]));
      const d = new GDict();
      d.set(k, V.int(5));
      its(k.v).push(V.int(3));
      eq(
        "101",
        "改过的有限键仍是 ghost（旧口径没被闸门破坏）",
        `${d.size()}/${d.has(k)}/${d.has(V.array(GArray.of([V.int(1), V.int(2)])))}`,
        "1/false/false",
      );
    }
  });

  it("114 +1 · insert 成功给 0", async () => {
    const arr = (...xs: Variant[]) => V.array(GArray.of(xs));
    const typedArr = (kind: string, ...xs: Variant[]) => stampArray(arr(...xs), kind as never, true);
    const call = (recv: Variant, name: string, args: Variant[]) => show(method(recv, name, args));
    const I = (n: number) => V.int(n);

    const a1 = arr(I(1), I(2));
    eq("114", "insert 成功给 0", call(a1, "insert", [I(0), I(9)]), "0");
    eq("114", "insert 之后数组真的变了", show(a1), "[9, 1, 2]");
    eq("114", "insert 下标越界给 31 且不动数组", `${call(a1, "insert", [I(99), I(8)])}|${call(a1, "insert", [I(-99), I(8)])}`, "31|31");
    eq("114", "insert(size) 是尾接、给 0", call(a1, "insert", [I(3), I(7)]), "0");
    eq("114", "定型数组装不下这个元素也给 31、数组不动", `${call(typedArr("int", I(1), I(2)), "insert", [I(0), V.str("s")])}|${show(typedArr("int", I(1), I(2)))}`, "31|[1, 2]");
    const a2 = arr(I(1), I(2));
    eq("114", "resize 扩张给 0、按元素默认值填（未定型是 null）", `${call(a2, "resize", [I(4)])}|${show(a2)}`, "0|[1, 2, <null>, <null>]");
    eq("114", "resize 同长度是空操作、仍给 0", call(a2, "resize", [I(4)]), "0");
    eq("114", "resize 收缩给 0", `${call(a2, "resize", [I(1)])}|${show(a2)}`, "0|[1]");
    eq("114", "resize 负数给 31 且不动数组", `${call(a2, "resize", [I(-1)])}|${show(a2)}`, "31|[1]");
    const a3 = arr(I(1), I(2), I(3));
    eq("114", "pop_back / pop_front 给被弹出的元素", `${call(a3, "pop_back", [])}|${call(a3, "pop_front", [])}|${show(a3)}`, "3|1|[2]");
    eq("114", "空数组 pop 给 null", call(arr(), "pop_back", []), "<null>");
    eq("114", "pop_at 越界给 null 且不动数组", `${call(a3, "pop_at", [I(9)])}|${show(a3)}`, "<null>|[2]");
    const onePairDict = () => {
      const g = new GDict();
      g.set(I(1), I(2));
      return V.dict(g);
    };
    eq("114", "Dictionary.erase 给 bool（删掉了 true、没有 false）", `${call(onePairDict(), "erase", [I(1)])}|${call(onePairDict(), "erase", [I(9)])}`, "true|false");
    eq("113", "void 方法在运行时的返回值统一是 nil", `${call(arr(I(1)), "append", [I(2)])}|${call(arr(I(1)), "clear", [])}|${call(arr(I(1)), "fill", [I(0)])}|${call(arr(I(1), I(2)), "remove_at", [I(0)])}|${call(arr(I(1)), "push_front", [I(0)])}|${call(arr(I(1)), "push_back", [I(2)])}|${call(arr(I(1), I(1)), "erase", [I(1)])}`, "<null>|<null>|<null>|<null>|<null>|<null>|<null>");
  });
});
