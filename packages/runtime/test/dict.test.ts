// 由 tools/ops-check.ts 机械搬迁：region 535-545, 860-872, 1474-1572。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, keyOf, show, stampDict, valueEq } from "@gds2js/runtime/runtime/values";
import { vector2 } from "@gds2js/runtime/runtime/vector2";
import { F, I, S } from "./support/variants";

describe("runtime/values · GDict 与 keyOf", () => {
  it("012 · 1 和 1.0 是两个键", async () => {
    const d = new GDict();
    d.set(I(1), S("int"));
    d.set(F(1), S("float"));
    eq("012", "1 和 1.0 是两个键", d.size(), 2);
    eq("012", "d[1]", show(d.get(I(1))), "int");
    eq("012", "d[1.0]", show(d.get(F(1))), "float");
    d.set(S("1"), S("str"));
    eq("012", "\"1\" 又是第三个键", d.size(), 3);
    eq("012", "字典打印", show(V.dict(d)), '{ 1: "int", 1.0: "float", "1": "str" }');
  });

  it("071 +1 · int 1 与 float 1.0 是两个键", async () => {
    eq("071", "int 1 与 float 1.0 是两个键", keyOf(I(1)) !== keyOf(F(1)), true);
    eq("071", "bool true 又是第三个键", keyOf(V.bool(true)) !== keyOf(I(1)), true);
    eq("071", "Vector2 按键值而非引用", keyOf(vector2(1, 2)) === keyOf(vector2(1.0, 2.0)), true);
    eq("071", "不同 Vector2 是不同键", keyOf(vector2(1, 2)) === keyOf(vector2(2, 1)), false);
    eq("071", "0.0 与 -0.0 是同一个键", keyOf(F(0)) === keyOf(F(-0)), true);
    const d = new GDict();
    d.set(I(1), S("a"));
    d.set(F(1), S("b"));
    eq("071", "1 与 1.0 各自存得住", `${show(d.get(I(1)))}/${show(d.get(F(1)))}/${d.size()}`, "a/b/2");
    eq("090", "数组键走 c: 内容桶", keyOf(V.array(GArray.of([I(1)]))), "c:[i:1]");
    eq("090", "空数组与空字典不是同一个桶", keyOf(V.array(GArray.of([]))) === keyOf(V.dict(new GDict())), false);
  });

  it("090 · 等值数组落进同一个桶", async () => {
    const arr = (xs: Variant[]) => V.array(GArray.of(xs));
    const newDict = () => new GDict();
    const dict = (pairs: [Variant, Variant][]) => {
      const g = newDict();
      for (const [k, v] of pairs) g.set(k, v);
      return V.dict(g);
    };

    eq("090", "等值数组落进同一个桶", keyOf(arr([I(1), I(2)])) === keyOf(arr([I(1), I(2)])), "true");
    eq("090", "[1] 与 [1.0] 是两个桶（身份口径）", keyOf(arr([I(1)])) === keyOf(arr([F(1)])), "false");

    const g1 = newDict();
    const a1 = arr([I(1), I(2)]);
    g1.set(a1, I(5));
    eq("090", "等值新数组命中同一格", show(g1.get(arr([I(1), I(2)]))), "5");
    eq("090", "has 走同一格", `${String(g1.has(a1))}/${String(g1.has(arr([I(1), I(2)])))}`, "true/true");
    eq("090", "掺 float 的查询落空", show(g1.get(arr([F(1), F(2)]))), "<null>");
    g1.set(arr([I(1), I(2)]), I(6));
    eq("090", "等值键再写是顶掉同一格", `${String(g1.size())} ${show(V.dict(g1))}`, "1 { [1, 2]: 6 }");

    const od = newDict();
    od.set(dict([[S("a"), I(1)], [S("b"), I(2)]]), I(9));
    eq("090", "换了键序就查不着", show(od.get(dict([[S("b"), I(2)], [S("a"), I(1)]]))), "<null>");
    eq("090", "原序才命中", show(od.get(dict([[S("a"), I(1)], [S("b"), I(2)]]))), "9");

    const gd = newDict();
    const m1 = arr([I(1)]);
    gd.set(m1, I(8));
    (m1.v as GArray).append(I(2));
    eq("090", "改过的键现值旧值都查不着", `${String(gd.has(arr([I(1)])))}/${String(gd.has(arr([I(1), I(2)])))}`, "false/false");
    eq("090", "改过的键也擦不掉", `${String(gd.erase(arr([I(1)])))}/${String(gd.size())}`, "false/1");
    eq("090", "打印取存着的值而不是重新查", show(V.dict(gd)), "{ [1, 2]: 8 }");

    const c1 = arr([I(7), I(8)]);
    const s2 = newDict();
    s2.set(c1, I(1));
    (c1.v as GArray).append(I(9));
    s2.set(arr([I(7), I(8)]), I(2));
    eq("090", "同桶两格并存", `${String(s2.size())} ${show(V.dict(s2))}`, "2 { [7, 8, 9]: 1, [7, 8]: 2 }");
    eq("090", "新格查得着、ghost 格查不着", `${show(s2.get(arr([I(7), I(8)])))}/${show(s2.get(c1))}`, "2/<null>");
    eq("090", "erase 只擦得掉查得着的那格", `${String(s2.erase(arr([I(7), I(8)])))}/${String(s2.erase(c1))}/${String(s2.size())}`, "true/false/1");

    const sh = newDict();
    const kk = arr([I(1), I(2)]);
    sh.set(kk, I(1));
    const cp = sh.duplicate();
    (kk.v as GArray).append(I(3));
    eq(
      "090",
      "浅拷贝不重算桶",
      `${show(cp.get(arr([I(1), I(2)])))}/${show(cp.get(arr([I(1), I(2), I(3)])))}/${show(V.dict(cp))}`,
      "<null>/<null>/{ [1, 2, 3]: 1 }",
    );
    const dp = sh.duplicate(true);
    eq("090", "深拷贝按现内容重算", `${show(dp.get(arr([I(1), I(2), I(3)])))}/${show(dp.get(arr([I(1), I(2)])))}`, "1/<null>");

    const src = newDict();
    const sk = arr([I(1), I(2)]);
    src.set(sk, I(1));
    (sk.v as GArray).append(I(3));
    const mg = newDict();
    mg.mergeWith(src, false);
    eq("090", "ghost 格也 merge 得过去", `${show(V.dict(mg))}/${show(mg.get(arr([I(1), I(2), I(3)])))}`, "{ [1, 2, 3]: 1 }/1");

    const vd = newDict();
    vd.set(vector2(1, 2), I(1));
    vd.set(vector2(1, 2), I(2));
    eq("090", "等值 Vector2 顶掉同一格", `${String(vd.size())} ${show(V.dict(vd))}`, "1 { (1.0, 2.0): 2 }");
    eq("090", "换成分量就不是那个键了", `${String(vd.has(vector2(9, 2)))}/${show(vd.get(vector2(1.0, 2.0)))}`, "false/2");

    const ed = newDict();
    ed.set(arr([]), I(1));
    ed.set(dict([]), I(2));
    eq("090", "空数组与空字典是两格", `${show(ed.get(arr([])))}/${show(ed.get(dict([])))}/${show(V.dict(ed))}`, "1/2/{ []: 1, {  }: 2 }");

    const tg = (stampDict(dict([]), "Array", "int", true).v as GDict);
    tg.set(arr([I(1), I(2)]), I(5));
    eq("090", "定型 Array 键按身份查", `${show(tg.get(arr([I(1), I(2)])))}/${show(tg.get(arr([F(1), F(2)])))}`, "5/<null>");

    const inner = arr([I(1)]);
    const nd = newDict();
    nd.set(arr([inner]), I(8));
    (inner.v as GArray).append(I(2));
    eq("090", "改内层让整格查不着", `${show(nd.get(arr([arr([I(1)])])))}/${show(V.dict(nd))}`, "<null>/{ [[1, 2]]: 8 }");

    const cyc = GArray.of([]);
    cyc.append(V.array(cyc));
    eq("090", "自引用数组的桶塌在 101 层（3×101 + 记号 + 101）", String(keyOf(V.array(cyc)).length), "405");
    {
      const other = GArray.of([]);
      other.append(V.array(other));
      eq("090", "两个不同的环算出同一个桶", String(keyOf(V.array(other)) === keyOf(V.array(cyc))), "true");
      const dd = newDict();
      dd.set(V.array(cyc), I(1));
      eq("090", "环键存得下也查得着", `${dd.size()}/${dd.has(V.array(other))}`, "1/true");
    }
    eq("090", "自引用数组跟自己比是 true", valueEq(V.array(cyc), V.array(cyc)), "true");
  });
});
