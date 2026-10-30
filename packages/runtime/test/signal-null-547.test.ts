/** 零名 Signal 的谓词 / 对象面 / 哈希（S547），读数 `tmp/d6/s547.gd`。 */
import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { Signal } from "@gds2js/runtime/runtime/class/identity/signal";
import { method } from "@gds2js/runtime/runtime/methods";
import { variantHash } from "@gds2js/runtime/runtime/builtins";
import { V } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";

describe("Signal() 零名那一形（S547）", () => {
  it("is_null / get_object / get_object_id", () => {
    const e = V.object(new Signal());
    const named = V.object(new Signal("ping"));
    eq("547", "is_null 空真 / 带名假", `${String(method(e, "is_null", []).v)}/${String(method(named, "is_null", []).v)}`, "true/false");
    eq("547", "get_object 是 <Object#null>", show(method(e, "get_object", [])), "<Object#null>");
    eq("547", "get_object_id 是 0", String(method(e, "get_object_id", []).v), "0");
    eq("547", "get_name 空串", `[${String(method(e, "get_name", []).v)}]`, "[]");
  });
  it("hash：空 Signal 是 one_64(0, hash(\"\"))；带名那支不猜", () => {
    eq("547", "hash(Signal())", show(variantHash([V.object(new Signal())])), "2641593226");
    shouldThrow("547", "带名 Signal 的哈希折宿主实例号", () => variantHash([V.object(new Signal("ping"))]));
    shouldThrow("547", "带名 get_object 同一条", () => method(V.object(new Signal("ping")), "get_object", []));
  });
});
