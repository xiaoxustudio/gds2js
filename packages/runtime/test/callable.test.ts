// 由 tools/ops-check.ts 机械搬迁：region 782-809, 3035-3065, 3231-3300。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { callableEq, callableSame, callableOf, CallableBox, methodCallable, nullCallable, registerClass, registerMethodArities, registerNativeBase, registerScriptLabel, registerStaticMethods, GdScriptObject, wrapValue } from "@gds2js/runtime/runtime/object";
import { attribute, method } from "@gds2js/runtime/runtime/methods";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, keyOf, show, strBuiltin, varToStr } from "@gds2js/runtime/runtime/values";
import { vector2 } from "@gds2js/runtime/runtime/vector2";
import { gdDispatchByName } from "./support/gd-dispatch";
import { I } from "./support/variants";

describe("runtime/object · Callable", () => {
  it("235 · 同一个对象同一个键位", async () => {
    const o1 = new GdScriptObject();
    const o2 = new GdScriptObject();
    const v1 = wrapValue(o1);
    const v1b = wrapValue(o1);
    const v2 = wrapValue(o2);
    eq("235", "同一个对象同一个键位", keyOf(v1) === keyOf(v1b), true);
    eq("235", "不同对象不同键位", keyOf(v1) === keyOf(v2), false);
    eq("235", "对象键号是 int", typeof ((o1 as unknown as { gdObjectId: number }).gdObjectId), "number");
    const d = new GDict();
    d.set(v1, I(1));
    d.set(v1b, I(2));
    d.set(v2, I(3));
    eq("235", "对象当键：同实例顶掉、异实例另开一格", `${d.size()}|${d.get(v1).v}|${d.has(v2)}`, "2|2|true");
    eq("235", "erase 用身份命中", `${d.erase(v1b)}|${d.size()}|${d.has(v1)}`, "true|1|false");
    const recv = v1;
    const mPlain = new CallableBox(null, "m", recv, [], null);
    const mBound = new CallableBox(null, "m", recv, [I(1)], null, true);
    const mBound2 = new CallableBox(null, "m", recv, [I(2)], null, true);
    eq("235", "方法 Callable：读两次相等", callableEq(mPlain, new CallableBox(null, "m", recv, [], null)), true);
    eq("235", "绑没绑过进等式", callableEq(mPlain, mBound), false);
    eq("235", "绑定实参不进等式", callableEq(mBound, mBound2), true);
    eq("235", "connect 的口径不动（绑定串不算）", callableSame(mPlain, mBound), true);
    const cd = new GDict();
    cd.set(V.object(mBound), I(1));
    cd.set(V.object(mBound2), I(2));
    eq("235", "bind(1) 与 bind(2) 是同一个键", `${cd.size()}|${show(cd.get(V.object(mPlain)))}`, "1|<null>");
  });

  it("187 +1 · str(...) 多实参与 Callable.bind(...)", async () => {
    // str(...) 多实参与 Callable.bind(...)
    const cat = (...args: unknown[]): Variant => V.str(args.map((x) => show(x as Variant)).join("|"));
    const base = V.object(new CallableBox((a: Variant[]) => cat(...a), "cat", V.object({}), [], cat.length));
    const one = method(base, "bind", [V.str("x")]);
    const two = method(base, "bind", [V.str("x"), V.str("y")]);
    const chain = method(one, "bind", [V.str("n")]);
    const full = method(base, "bind", [V.str("x"), V.str("y"), V.str("z")]);
    eq(
      "187",
      "bind 的实参排在调用实参**之后**、链式 bind 挤到已绑定那串前面",
      `${show(method(one, "call", [V.str("y"), V.str("z")]))} ${show(method(two, "call", [V.str("z")]))} ${show(method(chain, "call", [V.str("p")]))} ${show(method(full, "call", []))}`,
      "y|z|x z|x|y p|n|x x|y|z",
    );
    eq(
      "187",
      "get_bound_arguments / get_method / is_valid",
      `${show(method(one, "get_bound_arguments", []))} ${method(base, "get_method", []).v} ${method(one, "is_valid", []).v}`,
      `["x"] cat true`,
    );
    eq("187", "callv 同样把绑定实参接在后面", show(method(one, "callv", [V.array(GArray.of([V.str("y"), V.str("z")]))])), "y|z|x");
    // 合成的 Callable 没有形参表：get_argument_count 既不能报 0、也不能凭方法名猜，响亮拒
    shouldThrow("187", "拿不到声明形参数的 Callable 问 get_argument_count → 响亮拒（规则见用例 193）", () => method(base, "get_argument_count", []));
    eq(
      "188",
      "str(a, b, …) 是每个实参按 print 的渲染**无分隔拼接**",
      `${strBuiltin([V.str("a"), V.str("-"), V.str("b")]).v} ${strBuiltin([V.int(1), V.int(2), V.int(3)]).v} ${strBuiltin([V.str("x"), V.nil(), V.float(2.5)]).v}`,
      "a-b 123 x<null>2.5",
    );
    eq("188", "str 单实参与 String() 同形、容器与值类型走同一套渲染", `${strBuiltin([V.int(1)]).v} ${strBuiltin([vector2(1.5, 2)]).v} ${strBuiltin([V.array(GArray.of([V.int(1), V.int(2)]))]).v}`, "1 (1.5, 2.0) [1, 2]");
  });

  it("208 +5 · Callable.call() 的实参数量：这里钉错误文本逐字与那一格发不出去的…", async () => {
    // Callable.call() 的实参数量：这里钉错误文本逐字与那一格发不出去的形状
    const errText = (fn: () => unknown): string => {
      try {
        const r = fn();
        return `没抛：${String(r)}`;
      } catch (e) {
        return e instanceof Error ? e.message : String(e);
      }
    };
    class Base extends GdScriptObject {
      three(a: Variant, b: Variant, c: Variant): Variant {
        return V.str(`${String(a.v)}${String(b.v)}${String(c.v)}`);
      }
      twice(x: Variant, y: Variant = V.str("z")): Variant {
        return V.str(`${String(x.v)}${String(y.v)}`);
      }
      static stwo(a: Variant, b: Variant): Variant {
        return V.str(`${String(a.v)}${String(b.v)}`);
      }
      override __gdDispatch(name: string, args: Variant[]): Variant | null {
        return gdDispatchByName(this, name, args);
      }
    }
    const dBase = registerClass("Base", Base, () => new Base(), (o) => o instanceof Base);
    registerMethodArities(dBase, { three: [3, 3], twice: [1, 2], stwo: [2, 2] });
    registerStaticMethods(dBase, ["stwo"], { stwo: (a: Variant[]): Variant => Base.stwo(a[0] as Variant, a[1] as Variant) });
    registerNativeBase(dBase, "RefCounted");
    const inst = new Base();
    const three = attribute(inst, "three") as Variant;
    eq(
      "208",
      "少给与多给同一句、N 都是 3（无默认值时必填数与全部数相同）",
      `${errText(() => method(three, "call", [V.int(1), V.int(2)]))} || ${errText(() => method(three, "call", [V.int(1), V.int(2), V.int(3), V.int(4)]))}`,
      "Invalid call to function 'RefCounted::three (Callable)'. Expected 3 argument(s). || Invalid call to function 'RefCounted::three (Callable)'. Expected 3 argument(s).",
    );
    eq(
      "211",
      "带默认值形参：少给报**必填数**、多给报**全部数**（同一个 twice）",
      `${errText(() => method(attribute(inst, "twice") as Variant, "call", []))} || ${errText(() => method(attribute(inst, "twice") as Variant, "call", [V.int(1), V.int(2), V.int(3)]))}`,
      "Invalid call to function 'RefCounted::twice (Callable)'. Expected 1 argument(s). || Invalid call to function 'RefCounted::twice (Callable)'. Expected 2 argument(s).",
    );
    eq(
      "214",
      "静态方法的标签是 **GDScript::**，不是接收者的原生基类",
      errText(() => method(attribute(Base, "stwo") as Variant, "call", [V.int(1)])),
      "Invalid call to function 'GDScript::stwo (Callable)'. Expected 2 argument(s).",
    );
    eq(
      "213",
      "lambda 的标签是字面量 `<anonymous lambda>(lambda)`",
      errText(() => method(callableOf(() => V.nil(), 2), "call", [V.int(1)])),
      "Invalid call to function '<anonymous lambda>(lambda) (Callable)'. Expected 2 argument(s).",
    );
    eq("207", "绑定的实参**抵扣**数量：bind(1,2) 之后 call(3) 合法，且结果仍是「调用实参在前」", show(method(method(three, "bind", [V.int(1), V.int(2)]), "call", [V.int(3)])), "312");  eq("207", "callv 数量不合式：不报错、不调用，给 null（c1 / c2）", `${show(method(three, "callv", [V.array(GArray.of([V.int(1), V.int(2)]))]))} ${show(method(three, "callv", [V.array(GArray.of([V.int(1), V.int(2), V.int(3), V.int(4)]))]))}`, "<null> <null>");
    {
      class Outer {
        topfn(a: Variant, b: Variant): Variant {
          return V.str(`${String(a.v)}${String(b.v)}`);
        }
      }
      const dOuter = registerClass("Outer", Outer, () => new Outer(), (o) => o instanceof Outer);
      registerMethodArities(dOuter, { topfn: [2, 2] });
      registerNativeBase(dOuter, "SceneTree");
      registerScriptLabel(dOuter, "main.gd");
      const c = attribute(new Outer(), "topfn") as Variant;
      // 实测标签 `<原生基类>(<class_name 或文件名>)::<方法>`：q10 的 SceneTree(main.gd)::top 与 m10 同一串
      eq(
        "241",
        "外层脚本自己的方法那一形现在发得出（标签带文件名那一截）",
        errText(() => method(c, "call", [V.int(1)])),
        "Invalid call to function 'SceneTree(main.gd)::topfn (Callable)'. Expected 2 argument(s).",
      );
      eq("241", "同一支的打印走的是那句标签", show(c), "SceneTree(main.gd)::topfn");
      eq("241", "绑过实参不改打印", show(method(c, "bind", [V.int(3)])), "SceneTree(main.gd)::topfn");
      eq("241", "var_to_str 里方法 Callable 也是 Callable()（实测 w09 / s08）", `${varToStr(c)}|${varToStr(method(c, "bind", [V.int(3)]))}`, "Callable()|Callable()");
    }
    {
      class Util {}
      const dUtil = registerClass("Util", Util, () => new Util(), (o) => o instanceof Util);
      registerNativeBase(dUtil, "RefCounted");
      registerScriptLabel(dUtil, "Util");
      registerStaticMethods(dUtil, ["stat"], { stat: () => V.int(6) });
      class Nodey {}
      const dNodey = registerClass("Nodey", Nodey, () => new Nodey(), (o) => o instanceof Nodey);
      registerNativeBase(dNodey, "Node");
      registerScriptLabel(dNodey, "nodey.gd");
      class Kid {}
      const dKid = registerClass("Kid", Kid, () => new Kid(), (o) => o instanceof Kid);
      registerNativeBase(dKid, "RefCounted");
      eq("241", "class_name 就是括号那一截（实测 RefCounted(Util)::hi）", show(methodCallable(wrapValue(new Util()), "hi")), "RefCounted(Util)::hi");
      eq("241", "带文件名的类的静态方法仍是 GDScript::<名>（实测 s01）", show(methodCallable(V.object(dUtil), "stat")), "GDScript::stat");
      eq("241", "宿主基类不是 RefCounted 时前面跟着走（实测 Node(nodey.gd)::hi）", show(methodCallable(wrapValue(new Nodey()), "hi")), "Node(nodey.gd)::hi");
      eq("241", "内部类没有括号那一截（实测 q01 的 RefCounted::three）", show(methodCallable(wrapValue(new Kid()), "three")), "RefCounted::three");
      eq("241", "空 Callable 与 lambda 的打印（q07 / q05）", `${show(nullCallable())}|${show(callableOf(() => V.nil(), 1))}`, "null::null|<anonymous lambda>(lambda)");
    }
  });
});
