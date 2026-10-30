/** Callable 的 bindv / is_custom / is_standard / get_object_id / hash（S571），读数 `tmp/d6/s571.gd` / `s571b.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { GdScriptObject, callableOf, methodCallable, nullCallable, wrapValue } from "@gds2js/runtime/runtime/class/object/script-object";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { attribute, globalCallable, method } from "@gds2js/runtime/runtime/methods";
import { GArray } from "@gds2js/runtime/runtime/values";
import { I, S } from "./support/variants";

const err = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { message?: string }).message ?? "?";
  }
};
const call = (c: Variant, name: string, args: Variant[] = []): Variant => method(c, name, args) as Variant;

describe("Callable.is_custom / is_standard（S571）", () => {
  it("四种基本形状与绑定后的翻转", () => {
    const g = globalCallable("abs");
    eq("571", "全局", `${call(g, "is_custom").v}/${call(g, "is_standard").v}`, "true/false");
    const n = nullCallable();
    eq("571", "空", `${call(n, "is_custom").v}/${call(n, "is_standard").v}`, "false/false");
    const lam = callableOf((a: Variant[]) => a[0] as Variant, 1);
    eq("571", "lambda", `${call(lam, "is_custom").v}/${call(lam, "is_standard").v}`, "true/false");
    const o = wrapValue(new GdScriptObject());
    const m = methodCallable(o, "ping");
    eq("571", "方法", `${call(m, "is_custom").v}/${call(m, "is_standard").v}`, "false/true");
    const bm = call(m, "bind", [I(1)]);
    eq("571", "绑过的方法转 custom", `${call(bm, "is_custom").v}/${call(bm, "is_standard").v}`, "true/false");
    const bg = call(g, "bindv", [V.array(GArray.of([I(1)]))]);
    eq("571", "bindv 的全局仍 custom", `${call(bg, "is_custom").v}/${call(bg, "is_standard").v}`, "true/false");
    const bi = attribute(S("abc"), "length") as Variant;
    eq("571", "内建面绑定", `${call(bi, "is_custom").v}/${call(bi, "is_standard").v}/${call(bi, "get_object_id").v}`, "true/false/0");
  });
});

describe("Callable.get_object_id / hash（S571）", () => {
  it("空 / 全局给 0，方法给接收者身份号，lambda 响亮拒", () => {
    eq("571", "空", call(nullCallable(), "get_object_id").v, 0);
    eq("571", "全局", call(globalCallable("abs"), "get_object_id").v, 0);
    const o = wrapValue(new GdScriptObject());
    const m = methodCallable(o, "ping");
    eq("571", "方法 == 实例号", call(m, "get_object_id").v === method(o, "get_instance_id", []).v, true);
    eq("571", "绑过仍相同", call(call(m, "bind", [I(1)]), "get_object_id").v === method(o, "get_instance_id", []).v, true);
    eq("571", "lambda 拒", err(() => call(callableOf((a: Variant[]) => a[0] as Variant, 1), "get_object_id")).includes("宿主不可复现"), true);
  });
  it("hash：空与全局对上引擎数，绑过的全局同值；方法与 lambda 拒", () => {
    eq("571", "全局 abs", call(globalCallable("abs"), "hash").v, 193485979);
    eq("571", "空", call(nullCallable(), "hash").v, 2661229415);
    eq("571", "绑过的全局同值", call(call(globalCallable("abs"), "bind", [I(1)]), "hash").v, 193485979);
    const o = wrapValue(new GdScriptObject());
    eq("571", "方法拒", err(() => call(methodCallable(o, "ping"), "hash")).includes("Callable"), true);
    eq("571", "lambda 拒", err(() => call(callableOf((a: Variant[]) => a[0] as Variant, 1), "hash")).includes("Callable"), true);
  });
});

describe("Callable.bindv（S571）", () => {
  it("新绑定排在旧绑定前，调用按调用实参在前", () => {
    const b = call(globalCallable("max"), "bind", [I(1)]);
    const v = call(b, "bindv", [V.array(GArray.of([I(2)]))]);
    eq("571", "get_bound_arguments", JSON.stringify(call(v, "get_bound_arguments").v instanceof GArray ? (call(v, "get_bound_arguments").v as GArray).raw().map((x) => (x as Variant).v) : null), "[2,1]");
    eq("571", "call", call(v, "call").v, 2);
    const a = call(globalCallable("abs"), "bindv", [V.array(GArray.of([I(-2)]))]);
    eq("571", "abs(-2)", call(a, "call").v, 2);
    eq("571", "原 Callable 不动", call(globalCallable("abs"), "bindv", [V.array(GArray.of([I(1)]))]).v !== globalCallable("abs").v, true);
  });
  it("空数组回同一只；坏型给引擎那句", () => {
    const g = globalCallable("abs");
    const same = call(g, "bindv", [V.array(GArray.of([]))]);
    eq("571", "空数组同一只", same.v === g.v, true);
    eq("571", "坏型", err(() => call(g, "bindv", [S("x")])), "Invalid type in function 'bindv' in base 'Callable'. Cannot convert argument 1 from String to Array.");
  });
});
