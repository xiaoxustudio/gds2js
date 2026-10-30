// 由 tools/ops-check.ts 机械搬迁：region 2288-2295, 2340-2369, 3095-3228。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { callable, callableOf, nullCallable, methodCallable, registerClass, registerMethodArities, registerStaticMethods, GdScriptObject } from "@gds2js/runtime/runtime/class/object/script-object";
import { Signal } from "@gds2js/runtime/runtime/class/identity/signal";
import { attribute, callableCtor, method } from "@gds2js/runtime/runtime/methods";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, show, valueEq } from "@gds2js/runtime/runtime/values";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { gdDispatchByName } from "./support/gd-dispatch";
import { I } from "./support/variants";

describe("runtime/signal", () => {
  it("step61 · typeof(Callable) → 25（装箱的方法引用）", async () => {
    const sig = new Signal();
    eq("step61", "typeof(Callable) → 25（装箱的方法引用）", `${typeOf(callableOf(() => V.int(1), 0)).v}`, "25");
    eq("step61", "typeof(Callable) → 25（callable 工厂）", `${typeOf(callable(() => V.int(1), 0)).v}`, "25");
    eq("step61", "typeof(信号) → 26（**裸对象**，产物里的实际形状）", `${typeOf(sig).v}`, "26");
    eq("step61", "typeof(信号) → 26（装箱的）", `${typeOf(V.object(sig)).v}`, "26");
    eq("step61", "普通对象仍是 24（没被新分支误伤）", `${typeOf(V.object({})).v}`, "24");
  });

  it("step65 · 实例方法读出来是 Callable（typeof → 25，不再是 24）", async () => {
    class Holder2 extends GdScriptObject {
      im(v: Variant): Variant {
        return v;
      }
      static sm(v: Variant): Variant {
        return v;
      }
      override __gdDispatch(name: string, args: Variant[]): Variant | null {
        return gdDispatchByName(this, name, args);
      }
    }
    const dHolder2 = registerClass("Holder2", Holder2, () => new Holder2(), (o) => o instanceof Holder2);
    registerStaticMethods(dHolder2, ["sm"], { sm: (a: Variant[]): Variant => Holder2.sm(a[0] as Variant) });
    const h2 = new Holder2();
    const bound = attribute(V.object(h2), "im");
    eq("step65", "实例方法读出来是 Callable（typeof → 25，不再是 24）", `${typeOf(bound).v}`, "25");
    eq("step65", "Callable.get_method()", `${method(bound, "get_method", []).v}`, "im");
    eq("step65", "is_null() false / is_valid() true", `${method(bound, "is_null", []).v}/${method(bound, "is_valid", []).v}`, "false/true");
    eq("step65", "Callable.callv 收一个 Array", `${method(bound, "callv", [V.array(GArray.of([I(7)]))]).v}`, "7");
    const stat = attribute(Holder2, "sm");
    eq("step65", "静态方法取值的 get_method 也报得出名字", `${method(stat, "get_method", []).v}`, "sm");
    eq("step65", "静态方法 Callable 的 is_null / is_valid", `${method(stat, "is_null", []).v} ${method(stat, "is_valid", []).v}`, "false true");
    class Sig {
      fired = new Signal("fired");
    }
    const sg = attribute(V.object(new Sig()), "fired");
    eq("step65", "Signal.get_name()", `${method(sg, "get_name", []).v}`, "fired");
    eq("step65", "Signal.is_null() → false", `${method(sg, "is_null", []).v}`, "false");
  });

  it("193 +4 · Callable 与 Signal 的方法面：带引擎 stderr 的格子只钉在…", async () => {
    // Callable 与 Signal 的方法面：带引擎 stderr 的格子只钉在这里，不进语料
    const errText = (fn: () => unknown): string => {
      try {
        const r = fn();
        return `没抛：${String(r)}`;
      } catch (e) {
        return e instanceof Error ? e.message : String(e);
      }
    };
    class Holder extends GdScriptObject {
      add3(a: unknown, b: unknown, c: unknown): Variant {
        return V.str(`${String(a)}-${String(b)}-${String(c)}`);
      }
      hi(x: unknown): Variant {
        return V.str(String(x));
      }
      twice(x: unknown, y = "z"): Variant {
        return V.str(`${String(x)}|${String(y)}`);
      }
      static sm(x: unknown): Variant {
        return V.str(String(x));
      }
      override __gdDispatch(name: string, args: Variant[]): Variant | null {
        return gdDispatchByName(this, name, args);
      }
    }
    // 静态方法也进这张表：get_argument_count() 那一格要用，而调静态方法本来就合法
    const dHolder98 = registerClass("Holder", Holder, () => new Holder(), (o) => o instanceof Holder);
    registerMethodArities(dHolder98, { add3: [3, 3], hi: [1, 1], twice: [1, 2], sm: [1, 1] });
    registerStaticMethods(dHolder98, ["sm"], { sm: (a: Variant[]): Variant => Holder.sm(a[0] as Variant) });
    const inst = new Holder();
    const other = new Holder();
    const c0 = attribute(inst, "add3") as Variant;
    const boundWith = (n: number): Variant => method(c0, "bind", Array.from({ length: n }, (_x, i) => V.int(i + 1)));

    eq("193", "get_argument_count 是「**还要几个实参**」：3 形参绑 0/1/2/3 个给 3/2/1/0（阶梯）", [0, 1, 2, 3].map((n) => method(boundWith(n), "get_argument_count", []).v).join(" "), "3 2 1 0");
    eq("193", "bind() 的空列表等于没绑（那格给的是声明形参数）", method(boundWith(0), "get_argument_count", []).v, 3);
    eq("193", "静态方法 Callable 同一式：1 形参给 1（那一形）", `${method(attribute(Holder, "sm") as Variant, "get_argument_count", []).v}`, "1");
    eq("193", "lambda（没有名字的 Callable）按声明形参数", method(callableOf(() => V.nil(), 3), "get_argument_count", []).v, 3);
    eq("193", "带默认值形参的方法 get_argument_count 取全部声明数（S525 实测 h(a,b=1)→2、k(a,b=1,c=2)→3）", method(attribute(inst, "twice") as Variant, "get_argument_count", []).v, 2);

    eq("194", "空 Callable：is_null 真 / is_valid 假 / get_method 空串 / get_argument_count 0（c1 c2 c4）", `${method(nullCallable(), "is_null", []).v} ${method(nullCallable(), "is_valid", []).v} "${method(nullCallable(), "get_method", []).v}" ${method(nullCallable(), "get_argument_count", []).v}`, 'true false "" 0');
    eq("194", "空 Callable 的 get_bound_arguments 是空 Array、callv 给 null 且不报错（c11 / c8）", `${show(method(nullCallable(), "get_bound_arguments", []))} ${show(method(nullCallable(), "callv", [V.array(GArray.of([V.int(1), V.int(2)]))]))}`, "[] <null>");
    eq("194", "空 Callable 上 call() 是运行期那一句（c3）", errText(() => method(nullCallable(), "call", [V.int(1)])), "Attempt to call function 'null::null (Callable)' on a null instance.");
    eq("194", "绑过实参的空 Callable 不再算 null（c6）", `${method(boundWith(0), "is_null", []).v} ${method(method(nullCallable(), "bind", [V.int(1)]), "is_null", []).v}`, "false false");
    shouldThrow("194", "空 Callable 上 call_deferred 没量过 → 响亮拒（c9 只量到解析期那一格）", () => method(nullCallable(), "call_deferred", [V.int(1)]));
    shouldThrow("194", "is_valid 在「空 + 绑过实参」那一格没量 → 响亮拒，不拿 is_null 的反面推", () => method(method(nullCallable(), "bind", [V.int(1)]), "is_valid", []));
    shouldThrow("194", "Callable(字符串) 一参形：Godot 是解析期 No constructor，运行期先响亮拒（c10）", () => callableCtor([V.str("on_fired")]));
    eq("440", "unbind() 已发货：给得出盒子而不是响亮拒", (() => { try { method(c0, "unbind", [V.int(1)]); return true; } catch { return false; } })(), true);

    eq("192", "方法 Callable 的等式比 (接收者, 方法名)：两次读同一个小盒不同", `${valueEq(c0, attribute(inst, "add3") as Variant)} ${valueEq(c0, attribute(other, "add3") as Variant)}`, "true false");
    eq("192", "绑定的实参**不进**等式：bind(1) 与 bind(2) 相等", valueEq(boundWith(1), boundWith(2)), true);
    eq("192", "静态方法与空 Callable 各自成格", `${valueEq(attribute(Holder, "sm") as Variant, attribute(Holder, "sm") as Variant)} ${valueEq(nullCallable(), nullCallable())}`, "true true");
    eq("192", "lambda 按引用比：两个同体 lambda 不等", valueEq(callableOf(() => V.nil(), 1), callableOf(() => V.nil(), 1)), false);
    eq("192", "Array.has 走同一条等式（实测真）", (V.array(GArray.of([c0, attribute(inst, "hi") as Variant])).v as GArray).has(attribute(inst, "add3") as Variant), true);
    eq("192", "Callable 与 int 比不是 false，而是运行期那一句", errText(() => valueEq(c0, V.int(1))), "Invalid operands 'Callable' and 'int' in operator '=='.");

    // 一个「把每次投递记下来」的回调 Callable：名字与接收者固定，所以两条连接按等式算同一条
    class Sink extends GdScriptObject {
      seen: string[];
      constructor(seen: string[]) {
        super();
        this.seen = seen;
      }
      on_fired(v: Variant): Variant {
        this.seen.push(String(v.v));
        return V.nil();
      }
      override __gdDispatch(name: string, args: Variant[]): Variant | null {
        return gdDispatchByName(this, name, args);
      }
    }
    const mkSink = (seen: string[]): Variant => methodCallable(V.object(new Sink(seen)), "on_fired");
    {
      const seen: string[] = [];
      const sig = V.object(new Signal("fired"));
      const cb = mkSink(seen);
      const code1 = method(sig, "connect", [cb]);
      const code2 = method(sig, "connect", [cb]);
      method(sig, "emit", [V.int(5)]);
      method(sig, "disconnect", [cb]);
      const code3 = method(sig, "connect", [cb]);
      eq(
        "195",
        "connect 给 Error 码 int：第一次 0、重复 31、断开后再连又是 0",
        `${code1.t === Tag.INT ? "int" : "非 int"} ${code1.v} ${code2.v} ${code3.v}`,
        "int 0 31 0",
      );
      eq("195", "重复连接不多一份投递、disconnect 是 void 且真的断开", `${seen.join(",")} ${show(method(sig, "disconnect", [cb]))}`, "5 <null>");
    }
    {
      const seen: string[] = [];
      const sig = V.object(new Signal("fired"));
      eq("195", "CONNECT_ONE_SHOT 实测是 4，连上就投一次", `${method(sig, "connect", [mkSink(seen), V.int(4)]).v}`, "0");
      method(sig, "emit", [V.int(1)]);
      method(sig, "emit", [V.int(2)]);
      eq("195", "one-shot 投完自动断开：第二次 emit 不再投递", seen.join(","), "1");
      const seen2: string[] = [];
      const sig2 = V.object(new Signal("fired"));
      const sink2 = mkSink(seen2);
      method(sig2, "connect", [sink2, V.int(2)]);
      method(sig2, "emit", [V.int(3)]);
      method(sig2, "emit", [V.int(4)]);
      eq("195", "flag=2（CONNECT_PERSIST）走常规连接：两次都投（f99b q08 前半）", seen2.join(","), "3,4");
      eq("195", "flag=2 的重复判定与 0 同形：第二次 31（f99b q08）", method(sig2, "connect", [sink2, V.int(2)]).v, 31);
      {
        const seen3: string[] = [];
        const sig3 = V.object(new Signal("fired"));
        const sink = mkSink(seen3);
        eq(
          "195",
          "flag=8（CONNECT_REFERENCE_COUNTED）允许重复连（两次都 0）但只投一份（f99b q07）",
          `${method(sig3, "connect", [sink, V.int(8)]).v} ${method(sig3, "connect", [sink, V.int(8)]).v}`,
          "0 0",
        );
        method(sig3, "emit", [V.int(9)]);
        eq("195", "重复连的那一份不补投", seen3.join(","), "9");
      }
      // 局部实例的 deferred 会被 Godot 随 RefCounted 回收丢掉；我们持强引用，排干就会多印一行 → 响亮拒
      shouldThrow("195", "CONNECT_DEFERRED 要宿主先有对象生命周期模型 → 响亮拒（排干会让局部实例那一形静默多印）", () =>
        method(V.object(new Signal("fired")), "connect", [mkSink([]), V.int(1)]),
      );
      shouldThrow("195", "flags=-1 这种压着多个位的组合没量过 → 响亮拒（q10 只量到它给 0）", () =>
        method(V.object(new Signal("fired")), "connect", [mkSink([]), V.int(-1)]),
      );
    }
    eq("196", "Signal 上 has_method / get_method_list / is_connected_to 是运行期那三句", [
      errText(() => method(V.object(new Signal("fired")), "has_method", [V.str("connect")])),
      errText(() => method(V.object(new Signal("fired")), "get_method_list", [])),
      errText(() => method(V.object(new Signal("fired")), "is_connected_to", [V.nil()])),
    ].join(" || "), "Invalid call. Nonexistent function 'has_method' in base 'Signal'. || Invalid call. Nonexistent function 'get_method_list' in base 'Signal'. || Invalid call. Nonexistent function 'is_connected_to' in base 'Signal'.");
    eq("196", "信号自身的 get_name / is_null / typeof 不变", `${method(V.object(new Signal("fired")), "get_name", []).v} ${method(V.object(new Signal("fired")), "is_null", []).v}`, "fired false");
  });
});
