/**
 * Dictionary 的三支纯方法（S377）：`merged` / `get_or_add` / `recursive_equal` —— 引擎有、我们表里此前没登（`sweep.log` 末段那 5 名里的 3 名）。
 * 尺 `tmp/probe-dict/{round1,round2}.mts`（一格一份脚本一次 spawn），读数 `tmp/probe-dict/{compare20,compare21}.txt`；
 * 端到端钉在语料 `corpus/cases/373-dict-pure-methods/`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show } from "@gds2js/runtime/runtime/values";

const I = (n: number): Variant => V.int(n);
const S = (s: string): Variant => V.str(s);
const dict = (rows: Array<[Variant, Variant]>): Variant => {
  const d = new GDict();
  for (const [k, v] of rows) d.set(k, v);
  return V.dict(d);
};
const arr = (items: Variant[]): Variant => V.array(GArray.of(items));

describe("Dictionary.merged", () => {
  it("并新键、不改接收者", () => {
    const a = dict([[S("a"), I(1)]]);
    eq("377", "并新键", show(method(a, "merged", [dict([[S("b"), I(2)]])])), '{ "a": 1, "b": 2 }');
    eq("377", "接收者没动", show(a), '{ "a": 1 }');
  });

  it("同键默认不覆盖、第二参 true 才覆盖", () => {
    const a = dict([[S("a"), I(1)]]);
    eq("377", "默认不覆盖", show(method(a, "merged", [dict([[S("a"), I(2)]])])), '{ "a": 1 }');
    eq("377", "true 覆盖", show(method(a, "merged", [dict([[S("a"), I(2)]]), V.bool(true)])), '{ "a": 2 }');
  });

  it("键序是接收者在前、对面的新键按对面的次序", () => {
    eq("377", "键序", show(method(dict([[S("b"), I(1)]]), "merged", [dict([[S("a"), I(2)], [S("c"), I(3)]])])), '{ "b": 1, "a": 2, "c": 3 }');
  });

  it("给的是新字典，而值是浅拷（嵌套那一份两边共享）", () => {
    const base = dict([[S("x"), I(1)]]);
    const copy = method(base, "merged", [dict([])]);
    method(copy, "set", [S("y"), I(2)]);
    eq("377", "改结果不动接收者", `${show(base)} | ${show(copy)}`, '{ "x": 1 } | { "x": 1, "y": 2 }');
    const inner = dict([[S("n"), I(1)]]);
    const shallow = method(dict([[S("k"), inner]]), "merged", [dict([])]);
    method(method(shallow, "get", [S("k")]) as Variant, "set", [S("n"), I(9)]);
    eq("377", "嵌套是同一份", show(inner), '{ "n": 9 }');
  });

  it("不深挖：嵌套字典整个被对面顶掉", () => {
    const got = method(dict([[S("k"), dict([[S("x"), I(1)]])]]), "merged", [dict([[S("k"), dict([[S("y"), I(2)]])]]), V.bool(true)]);
    eq("377", "不深挖", show(got), '{ "k": { "y": 2 } }');
  });
});

describe("Dictionary.get_or_add", () => {
  it("键已在就给现值、默认值一个字也不写", () => {
    const a = dict([[S("k"), I(1)]]);
    eq("377", "键已在", show(method(a, "get_or_add", [S("k"), I(9)])), "1");
    eq("377", "字典没动", show(a), '{ "k": 1 }');
  });

  it("键不在才落默认值，落在末尾", () => {
    const a = dict([[S("k"), I(1)], [S("m"), I(2)]]);
    eq("377", "键不在", show(method(a, "get_or_add", [S("j"), I(9)])), "9");
    eq("377", "落进字典", show(a), '{ "k": 1, "m": 2, "j": 9 }');
    eq("377", "键序在末尾", show(method(a, "keys", [])), '["k", "m", "j"]');
  });

  it("单实参时落的是 null", () => {
    const a = dict([[S("k"), I(1)]]);
    eq("377", "单实参", show(method(a, "get_or_add", [S("j")])), "<null>");
    eq("377", "落进字典的是 null", show(a), '{ "k": 1, "j": <null> }');
  });

  it("默认值是字典时装进去的是同一份，不拷", () => {
    const shared = dict([]);
    const inner = dict([[S("x"), I(1)]]);
    const got = method(shared, "get_or_add", [S("k"), inner]);
    method(got, "set", [S("y"), I(2)]);
    eq("377", "装的是同一份", `${show(shared)} | ${show(inner)}`, '{ "k": { "x": 1, "y": 2 } } | { "x": 1, "y": 2 }');
  });
});

describe("Dictionary.recursive_equal", () => {
  it("两支实参都必填：第一支是字典、第二支是递归计数", () => {
    const a = dict([[S("a"), I(1)]]);
    eq("377", "相等", show(method(a, "recursive_equal", [dict([[S("a"), I(1)]]), I(0)])), "true");
    eq("377", "不等", show(method(a, "recursive_equal", [dict([[S("a"), I(2)]]), I(0)])), "false");
  });

  it("计数在无环时不影响结果", () => {
    const a = dict([[S("a"), I(1)]]);
    const b = dict([[S("a"), I(1)]]);
    eq("377", "0 / 99 / -1 同值", [0, 99, -1].map((n) => show(method(a, "recursive_equal", [b, I(n)]))).join("|"), "true|true|true");
  });

  it("嵌套与数组都递归比，键序不算", () => {
    const x = dict([[S("a"), dict([[S("b"), arr([I(1), I(2)])]])]]);
    const y = dict([[S("a"), dict([[S("b"), arr([I(1), I(2)])]])]]);
    const z = dict([[S("a"), dict([[S("b"), arr([I(1), I(3)])]])]]);
    eq("377", "嵌套相等", show(method(x, "recursive_equal", [y, I(0)])), "true");
    eq("377", "深层不等", show(method(x, "recursive_equal", [z, I(0)])), "false");
    eq("377", "键序不算", show(method(dict([[S("a"), I(1)], [S("b"), I(2)]]), "recursive_equal", [dict([[S("b"), I(2)], [S("a"), I(1)]]), I(0)])), "true");
  });
});
