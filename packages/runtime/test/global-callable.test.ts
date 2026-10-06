// 4.6.3 实测的「全局函数当值用」那 126 支：取值形状、`.call` 派发、arity 那几句、没实现的响亮拒，
// 以及「实测表与式子表一一对上」这条防漂移判据。读数来自 tmp/probe-unknown-value/{gc1,gc4,gc6,gc7,gc8,gc9}.log。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show, varToStr } from "@gds2js/runtime/runtime/values";
import { callable, methodCallable, nullCallable } from "@gds2js/runtime/runtime/object";
import { GLOBAL_CALLABLES, GLOBAL_VALUE_NAMES } from "@gds2js/runtime/runtime/global-names";
import { GLOBAL_CALLABLE_IMPLEMENTED, globalCallable, method } from "@gds2js/runtime/runtime/methods";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { F, I, S } from "./support/variants";

const tn = (v: Variant): string => String((typeOf(v) as { v: number }).v);
/** 「typeof|打印」两栏，与语料同一个口径；抛错的话比的是那句原文。 */
const run = (f: () => Variant): string => {
  try {
    const v = f();
    return `${tn(v)}|${show(v)}`;
  } catch (e) {
    return (e as Error).message;
  }
};
/** 只关心响亮拒的 code：跑一遍，通了算「通过」。 */
const code = (f: () => Variant): string => {
  try {
    f();
    return "通过";
  } catch (e) {
    return `[${(e as UnsupportedError).code}]`;
  }
};
const call = (name: string, how = "call", ...args: Variant[]): string => run(() => method(globalCallable(name), how, args));
const arrOf = (...xs: Variant[]): Variant => V.array(GArray.of(xs));

describe("runtime/global-callable · 全局函数的 Callable 值", () => {
  it("239 · 取值形状、打印与 var_to_str", async () => {
    eq("239", "abs 当值用：typeof 25、打印 @GlobalScope::abs", run(() => globalCallable("abs")), "25|@GlobalScope::abs");
    eq("239", "len / load / range / convert 在 @GDScript 那一侧", `${show(globalCallable("len"))}|${show(globalCallable("load"))}|${show(globalCallable("range"))}|${show(globalCallable("convert"))}`, "@GDScript::len|@GDScript::load|@GDScript::range|@GDScript::convert");
    eq("239", "没实现的那几支照样打得出实测那串", `${show(globalCallable("prints"))}|${show(globalCallable("randi"))}|${show(globalCallable("get_stack"))}`, "@GlobalScope::prints|@GlobalScope::randi|@GDScript::get_stack");
    eq("239", "绑过实参照旧印同一串（实测 abs.bind() 那格）", show(method(globalCallable("abs"), "bind", [I(1)])), "@GlobalScope::abs");
    eq("239", "数组里印的是同一串，元素不加引号", run(() => arrOf(globalCallable("abs"), globalCallable("len"))), "28|[@GlobalScope::abs, @GDScript::len]");
    eq("239", "is_valid 真、is_null 假（实测 p17 那格）", `${run(() => method(globalCallable("abs"), "is_valid", []))}|${run(() => method(globalCallable("abs"), "is_null", []))}`, "1|true|1|false");
    eq("239", "var_to_str 里 Callable 实测都是 Callable()（全局 / 空 / lambda / 方法四支同一条，见 S239）", `${varToStr(globalCallable("abs"))}|${varToStr(nullCallable())}|${varToStr(callable(() => V.nil(), 0))}|${varToStr(methodCallable(V.object({}), "m"))}`, "Callable()|Callable()|Callable()|Callable()");
    eq("239", "get_method 是 StringName（typeof 21），不是 String", `${run(() => method(globalCallable("abs"), "get_method", []))}|${run(() => method(globalCallable("len"), "get_method", []))}`, "21|abs|21|len");
    eq("239", "get_argument_count 走实测读数：abs 1、max 2、lerp 3、range 0、prints 1", [
      run(() => method(globalCallable("abs"), "get_argument_count", [])),
      run(() => method(globalCallable("max"), "get_argument_count", [])),
      run(() => method(globalCallable("lerp"), "get_argument_count", [])),
      run(() => method(globalCallable("range"), "get_argument_count", [])),
      run(() => method(globalCallable("prints"), "get_argument_count", [])),
    ].join("|"), "2|1|2|2|2|3|2|0|2|1");
    eq("239", "get_bound_arguments_count 与 get_bound_arguments（实测 c20 c21）", `${run(() => method(globalCallable("abs"), "get_bound_arguments_count", []))}|${run(() => method(globalCallable("abs"), "get_bound_arguments", []))}|${run(() => method(method(globalCallable("abs"), "bind", [I(1), I(2)]), "get_bound_arguments_count", []))}`, "2|0|28|[]|2|2");
    eq("239", "零实参的 bind() 也算绑过：{abs: 1} 认得 abs、不认 abs.bind()（实测 b11）", (() => {
      const g = new GDict();
      g.set(globalCallable("abs"), I(1));
      return `${String(g.has(method(globalCallable("abs"), "bind", [])))}|${String(g.has(globalCallable("abs")))}`;
    })(), "false|true");
  });

  it("239 · .call 派发对上各支实测读数", async () => {
    eq("239", "abs / len / max / str 四支", `${call("abs", "call", I(-3))}|${call("len", "call", S("abcd"))}|${call("max", "call", I(2), I(7))}|${call("str", "call", I(1), I(2), I(3))}`, "2|3|2|4|2|7|4|123");
    eq("239", "range 三档读数（0..2、1..5、1..2..3）", `${call("range", "call", I(3))}|${call("range", "call", I(1), I(5))}|${call("range", "call", I(1), I(2), I(3))}`, "28|[0, 1, 2]|28|[1, 2, 3, 4]|28|[1]");
    eq("239", "convert 与 type_convert 走同一张表", `${call("convert", "call", S("7"), I(2))}|${call("type_convert", "call", S("7"), I(2))}`, "2|7|2|7");
    eq("239", "var_to_str 与 str_to_var 互逆", `${call("var_to_str", "call", arrOf(I(1), I(2)))}|${call("str_to_var", "call", S("[1,2]"))}`, "4|[1, 2]|28|[1, 2]");
    eq("239", "hash 的实测数与 typeof 那两支", `${call("hash", "call", I(7))}|${call("typeof", "call", I(1))}|${call("typeof", "call", S("a"))}`, "2|2503556531|2|2|2|4");
    eq("239", "取整族四种模式各自对", `${call("floor", "call", F(3.7))}|${call("floori", "call", F(3.7))}|${call("ceil", "call", F(3.2))}|${call("roundi", "call", F(2.5))}`, "3|3.0|2|3|3|4.0|2|3");
    eq("239", "clamp 族与 wrap 族", `${call("clamp", "call", I(5), I(1), I(3))}|${call("clampf", "call", I(5), I(1), I(3))}|${call("wrapi", "call", I(5), I(0), I(3))}|${call("wrapf", "call", F(5), F(0), F(3))}`, "2|3|3|3.0|2|2|3|2.0");
    eq("239", "取模族三支", `${call("posmod", "call", I(-7), I(3))}|${call("fmod", "call", F(7), F(2.5))}|${call("fposmod", "call", F(-7), F(3))}`, "2|2|3|2.0|3|2.0");
    eq("239", "lerp / inverse_lerp / move_toward / smoothstep / ease", `${call("lerp", "call", F(1), F(2), F(0.5))}|${call("inverse_lerp", "call", F(0), F(10), F(2.5))}|${call("move_toward", "call", F(1), F(5), F(2))}|${call("smoothstep", "call", F(0), F(1), F(0.5))}|${call("ease", "call", F(0.5), F(2))}`, "3|1.5|3|0.25|3|3.0|3|0.5|3|0.25");
    eq("239", "snapped 族与角度族", `${call("snapped", "call", F(1.2), F(0.5))}|${call("snappedi", "call", I(7), I(5))}|${call("deg_to_rad", "call", F(180))}|${call("rad_to_deg", "call", F(Math.PI))}`, "3|1.0|2|5|3|3.14159265358979|3|180.0");
    eq("239", "判定族五支", `${call("is_equal_approx", "call", F(1), F(1))}|${call("is_zero_approx", "call", F(0))}|${call("is_nan", "call", F(Number.NaN))}|${call("is_inf", "call", F(Number.POSITIVE_INFINITY))}|${call("is_finite", "call", F(1))}`, "1|true|1|true|1|true|1|true|1|true");
    eq("239", "sign 族与 pow / exp / log", `${call("sign", "call", I(-9))}|${call("signf", "call", I(-9))}|${call("signi", "call", F(-9.5))}|${call("pow", "call", I(2), I(10))}|${call("exp", "call", F(0))}|${call("log", "call", F(1))}`, "2|-1|3|-1.0|2|-1|3|1024.0|3|1.0|3|0.0");
    eq("239", "remap 与 cubic_interpolate 五支", `${call("remap", "call", F(5), F(0), F(10), F(0), F(2))}|${call("cubic_interpolate", "call", F(1), F(2), F(1), F(2), F(0.5))}`, "3|1.0|3|1.5");
    eq("239", "load 走 loadScript：解析不到脚本时响亮拒", code(() => method(globalCallable("load"), "call", [S("res://nope.gd")])), "[load-unknown-script]");
  });

  it("239 · arity 那几句与 callv 的安静 null", async () => {
    eq("239", "少给按必填数报，标签是 @GlobalScope::abs", call("abs"), "Invalid call to function '@GlobalScope::abs (Callable)'. Expected 1 argument(s).");
    eq("239", "多给同样按那句报（abs 那支实测 Expected 1）", call("abs", "call", I(1), I(2)), "Invalid call to function '@GlobalScope::abs (Callable)'. Expected 1 argument(s).");
    eq("239", "max 少给报 2", call("max", "call", I(1)), "Invalid call to function '@GlobalScope::max (Callable)'. Expected 2 argument(s).");
    eq("239", "lerp 多给报 3", call("lerp", "call", I(1), I(2), I(3), I(4)), "Invalid call to function '@GlobalScope::lerp (Callable)'. Expected 3 argument(s).");
    eq("239", "len 的标签在 @GDScript 那一侧", call("len"), "Invalid call to function '@GDScript::len (Callable)'. Expected 1 argument(s).");
    eq("239", "str 是变元：少给报 1，五支实参照旧打得出来", `${call("str")}|${call("str", "call", I(1), I(2), I(3), I(4), I(5))}`, "Invalid call to function '@GlobalScope::str (Callable)'. Expected 1 argument(s).|4|12345");
    eq("239", "range 的区间是 1..3：两头各一句（少报 1、多报 3）", `${call("range")}|${call("range", "call", I(1), I(2), I(3), I(4))}`, "Invalid call to function '@GDScript::range (Callable)'. Expected 1 argument(s).|Invalid call to function '@GDScript::range (Callable)'. Expected 3 argument(s).");
    eq("239", "绑过的实参进数量判定（abs.bind(1).call(2) 那格）", run(() => method(method(globalCallable("abs"), "bind", [I(1)]), "call", [I(2)])), "Invalid call to function '@GlobalScope::abs (Callable)'. Expected 1 argument(s).");
    eq("239", "callv 数量不合式既不报错也不调，安静给 null", `${call("abs", "callv", arrOf())}|${call("abs", "callv", arrOf(I(1), I(2)))}`, "0|<null>|0|<null>");
    eq("239", "callv 数量对得上就照调（含零实参 bind 的那支）", `${call("abs", "callv", arrOf(I(-4)))}|${call("max", "callv", arrOf(I(1), I(7)))}|${run(() => method(method(globalCallable("abs"), "bind", [I(-9)]), "callv", [arrOf()]))}`, "2|4|2|7|2|9");
  });

  it("239 · 没实现的式子只拒调用，不拒取值", async () => {
    const refused = ["prints", "printt", "print_rich", "print_verbose", "push_error", "push_warning", "seed", "randomize", "randi", "randf", "randi_range", "randf_range", "randfn", "weakref", "instance_from_id", "get_stack", "print_stack", "print"];
    eq("239", "十八支没实现的族：.call 都是 [global-callable-call]", refused.map((n) => code(() => method(globalCallable(n), "call", [I(1)]))).join("|"), refused.map(() => "[global-callable-call]").join("|"));
    eq("239", "同一批的 callv 也拒（区间闸门是 null，跳过去直接撞式子）", refused.map((n) => code(() => method(globalCallable(n), "callv", [arrOf()]))).join("|"), refused.map(() => "[global-callable-call]").join("|"));
    eq("239", "同一批的等式与面照常发：abs.bind() == abs 假、bind(1) == bind(2) 真", `${run(() => method(nullCallable(), "is_null", []))}|${code(() => method(globalCallable("prints"), "is_valid", []))}`, "1|true|通过");
    eq("239", "名字不在实测表里（发射器不该发出来）响亮拒", code(() => globalCallable("NoSuchGlobal")), "[global-callable-name]");
  });

  it("239 · 实测表与式子表一一对上", async () => {
    const names = Object.keys(GLOBAL_CALLABLES);
    eq("239", "实测「能当值用的名字」是 126 支", String(names.length), "126");
    eq("239", "值名集合就是这张表的键", String(GLOBAL_VALUE_NAMES.size), "126");
    const needCall = names.filter((n) => GLOBAL_CALLABLES[n]!.bounds !== null);
    const missing = needCall.filter((n) => !GLOBAL_CALLABLE_IMPLEMENTED.has(n));
    eq("239", "有区间的每一支都发得出式子（漏一支就在这里现形）", `${String(needCall.length)}|${missing.join(",")}`, "90|");
    const extra = [...GLOBAL_CALLABLE_IMPLEMENTED].filter((n) => GLOBAL_CALLABLES[n]?.bounds === null);
    eq("239", "式子表里没有「该拒的那支」（拒与发不能同时挂在一个名字上）", extra.join(","), "");
    eq("239", "该拒的 36 支：区间是 null", String(names.filter((n) => GLOBAL_CALLABLES[n]!.bounds === null).length), "36");
    eq("239", "类型名一支都不在表里（实测值位置全被解析期拒）", ["int", "float", "bool", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color", "Array", "Callable", "PackedByteArray", "PackedStringArray"].filter((n) => GLOBAL_VALUE_NAMES.has(n)).join(","), "");
    eq("239", "标签前缀只有两种：@GDScript 那批是实测的十二支", names.filter((n) => GLOBAL_CALLABLES[n]!.scope === "GDScript").sort().join(","), "char,convert,dict_to_inst,get_stack,inst_to_dict,is_instance_of,len,load,print_debug,print_stack,range,type_exists");
  });
});
