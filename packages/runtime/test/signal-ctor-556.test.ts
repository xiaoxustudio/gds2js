/** `Signal()` / `Signal(Object, name)` 与 `var_to_str(Signal)`（S556），读数 `tmp/d6/s556.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { Signal } from "@gds2js/runtime/runtime/signal";
import { method, signalCtor } from "@gds2js/runtime/runtime/methods";
import { V } from "@gds2js/runtime/runtime/tags";
import { varToStr } from "@gds2js/runtime/runtime/values";
import { S } from "./support/variants";

class Holder {
  ping = new Signal("ping");
  other = new Signal("other");
}

describe("Signal 构造式与 var_to_str（S556）", () => {
  it("两参取同一个实例；名字不在则造一个带名信号", () => {
    const h = new Holder();
    const hv = V.object(h);
    const got = signalCtor([hv, S("ping")]);
    eq("556", "同名同实例", String(got.v === h.ping), "true");
    eq("556", "StringName 名来源", String(signalCtor([hv, V.stringName("other")]).v === h.other), "true");
    const miss = signalCtor([hv, S("nope")]);
    eq("556", "缺失名字：is_null 假、get_name 给名", `${String(method(miss, "is_null", []).v)}/${String(method(miss, "get_name", []).v)}`, "false/nope");
    eq("556", "零参是空 Signal", String(method(signalCtor([]), "is_null", []).v), "true");
  });
  it("var_to_str 一律 Signal()", () => {
    const h = new Holder();
    eq("556", "带名 / 空 / 缺失名", [varToStr(V.object(h.ping)), varToStr(signalCtor([])), varToStr(signalCtor([V.object(h), S("nope")]))].join("|"), "Signal()|Signal()|Signal()");
  });
  it("非对象 / 非字符串名响亮拒", () => {
    const codes: string[] = [];
    for (const args of [[V.int(1), S("x")], [V.object(new Holder()), V.int(2)]]) {
      try {
        signalCtor(args);
        codes.push("没抛");
      } catch (e) {
        codes.push((e as { code?: string }).code ?? "?");
      }
    }
    eq("556", "两形", codes.join("/"), "signal-ctor/signal-ctor");
  });
});
