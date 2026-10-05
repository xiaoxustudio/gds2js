// Callable 的哈希与 `Callable(x)` 那一参（探头 `tmp/probe-hash-callable/`：
// h1.log / h2.log / h2A.log / ctor.log）。数发得出的只有两形：全局内置折出来就是名字那支
// String 哈希（16 支一名一名对上，语料 249 钉的是这批），空 Callable 走引擎非 custom 那条。
// 方法 / 静态 / lambda 那三支折的是引擎侧的函数标识：lambda 两次跑就换数，
// 方法与静态这两轮同值但五支候选式子都对不上（fit.mjs），所以响亮拒。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import {
  GdScriptObject,
  callable,
  methodCallable,
  nullCallable,
  wrapValue,
} from "@gds2js/runtime/runtime/object";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { variantHash } from "@gds2js/runtime/runtime/builtins";
import { callableCtor, globalCallable } from "@gds2js/runtime/runtime/methods";
import { vector2 } from "@gds2js/runtime/runtime/vector2";
import { I, S } from "./support/variants";

const num = (v: Variant): string => {
  try {
    return String((variantHash([v]) as Variant).v);
  } catch (e) {
    return `[${(e as UnsupportedError).code}]`;
  }
};
const codeOf = (f: () => unknown): string => {
  try {
    f();
    return "居然给得出";
  } catch (e) {
    return `[${(e as UnsupportedError).code}]`;
  }
};

describe("runtime/hash · Callable 的数与 Callable(x) 那一参", () => {
  it("249 · 发得出的是名字哈希，发不出的三形响亮拒", async () => {
    eq("249", "全局内置那十六支就是名字那支 String 哈希（k01 / k02 / k06 / k07 的四支）", [num(globalCallable("abs")), num(globalCallable("sign")), num(globalCallable("floor")), num(globalCallable("type_convert"))].join("|"), "193485979|2090724214|259122023|3315329255");
    eq("249", "与直接哈希那支串同值（k04）", String(num(globalCallable("len")) === num(S("len"))), "true");
    eq("249", "空 Callable 走「名字空串 + 对象 0 再 fmix32」（k03）", num(nullCallable()), "2661229415");
    const recv = wrapValue(new GdScriptObject());
    eq("249", "方法 Callable 的数凑不出任何一支候选式子 → 拒", num(methodCallable(recv, "m")), "[hash-callable]");
    eq("249", "静态 Callable 同一条", num(methodCallable(recv, "sstat")), "[hash-callable]");
    eq("249", "lambda 连跑两次就换数，更不能发", num(callable(() => V.nil(), 1)), "[hash-callable]");
    eq("249", "绑过实参不改哈希这一格仍然只能拒", num(methodCallable(recv, "m")), "[hash-callable]");
    eq("249", "对象、向量、pack 这些照旧走 hash-type", [num(recv), num(vector2(1, 2)), num(V.object(new GBytes([1], "byte")))].join("|"), "[hash-type]|[hash-type]|[hash-type]");
  });

  it("249 · `Callable(x)` 那一参实测是原样返回", async () => {
    const abs = globalCallable("abs");
    eq("249", "实参本身就是 Callable：给回去的就是同一支（w01：typeof 25、`== abs` 真、哈希同值）", String(callableCtor([abs]) === abs), "true");
    eq("249", "套两层还是同一支", String(callableCtor([callableCtor([abs]) as Variant]) === abs), "true");
    eq("249", "0 参那条给的是空 Callable（数与 k03 同值）", num(callableCtor([]) as Variant), "2661229415");
    eq("249", "单实参不是 Callable 的那些形，引擎是解析期那句，我们响亮拒", codeOf(() => callableCtor([S("abs")])), "[callable-ctor]");
    eq("249", "int 那一形同一条", codeOf(() => callableCtor([I(5)])), "[callable-ctor]");
});
});
