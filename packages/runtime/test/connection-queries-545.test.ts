/** Signal 的连接查询与 Callable.get_unbound_arguments_count（S545），读数 `tmp/d6/s545*.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { callable } from "@gds2js/runtime/runtime/object";
import { Signal } from "@gds2js/runtime/runtime/signal";
import { method } from "@gds2js/runtime/runtime/methods";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show, valueEq } from "@gds2js/runtime/runtime/values";
import { I } from "./support/variants";

const cbOf = () => callable(() => V.nil(), 1);

describe("Signal.is_connected / has_connections / get_connections（S545）", () => {
  it("连接查询与 get_connections 的三键形状", () => {
    const sg = new Signal("ping");
    const sgv = V.object(sg);
    const cb = cbOf();
    const cb2 = cbOf();
    eq("545", "connect 返回 0", `${String(method(sgv, "connect", [cb, I(0)]).v)}/${String(method(sgv, "connect", [cb2, I(4)]).v)}`, "0/0");
    eq("545", "is_connected：绑定串不算", `${String(method(sgv, "is_connected", [cb]).v)}/${String(method(sgv, "is_connected", [callable(() => V.nil(), 1)]).v)}`, "true/false");
    eq("545", "has_connections", String(method(sgv, "has_connections", []).v), "true");
    const rows = (method(sgv, "get_connections", []).v as GArray).raw();
    eq("545", "两行", String(rows.length), "2");
    const d0 = (rows[0] as ReturnType<typeof V.dict>).v as GDict;
    eq("545", "键序 signal/callable/flags", d0.keys().map((k) => show(k)).join(","), "signal,callable,flags");
    eq("545", "signal 是本体", String(valueEq(d0.get(V.str("signal")) as ReturnType<typeof V.dict>, sgv)), "true");
    eq("545", "callable 是原盒子", String(valueEq(d0.get(V.str("callable")) as ReturnType<typeof V.dict>, cb)), "true");
    const d1 = (rows[1] as ReturnType<typeof V.dict>).v as GDict;
    eq("545", "flags 原样：0 与 4", `${show(d0.get(V.str("flags")) as ReturnType<typeof V.dict>)}/${show(d1.get(V.str("flags")) as ReturnType<typeof V.dict>)}`, "0/4");
  });
  it("flags=8 重复连只留一行；断开后查询归零", () => {
    const sg = new Signal("ping");
    const sgv = V.object(sg);
    const cb = cbOf();
    method(sgv, "connect", [cb, I(8)]);
    method(sgv, "connect", [cb, I(8)]);
    const rows = (method(sgv, "get_connections", []).v as GArray).raw();
    eq("545", "参考计数旗标只留一行", String(rows.length), "1");
    eq("545", "flags=8", show(((rows[0] as ReturnType<typeof V.dict>).v as GDict).get(V.str("flags")) as ReturnType<typeof V.dict>), "8");
    method(sgv, "disconnect", [cb]);
    eq("545", "断开后", `${String(method(sgv, "is_connected", [cb]).v)}/${String(method(sgv, "has_connections", []).v)}/${String((method(sgv, "get_connections", []).v as GArray).raw().length)}`, "false/false/0");
  });
  it("空 Signal 三格", () => {
    const sgv = V.object(new Signal());
    eq("545", "空", `${String(method(sgv, "is_connected", [cbOf()]).v)}/${String(method(sgv, "has_connections", []).v)}/${String((method(sgv, "get_connections", []).v as GArray).raw().length)}`, "false/false/0");
  });
});

describe("Callable.get_unbound_arguments_count（S545）", () => {
  it("七格：unbind 计数、bind 会填掉一格", () => {
    const c = callable(() => V.nil(), 3);
    const un = (v: Variant): string => String(method(v, "get_unbound_arguments_count", []).v);
    eq("545", "c / bind / unbind2 / bind+unbind2 / unbind2+bind / unbind0", [un(c), un(method(c, "bind", [I(1)])), un(method(c, "unbind", [I(2)])), un(method(method(c, "bind", [I(1)]), "unbind", [I(2)])), un(method(method(c, "unbind", [I(2)]), "bind", [I(1)])), un(method(c, "unbind", [I(0)]))].join(","), "0,0,2,2,1,0");
  });
});
