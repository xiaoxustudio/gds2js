// 由 tools/ops-check.ts 机械搬迁：region 2255-2286, 2297-2316, 2318-2338, 2371-2402。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { registerClass, registerFieldTypes, registerNativeBase, registerStaticMethods, registerStaticVars, setMeta, GdScriptObject } from "@gds2js/runtime/runtime/class/object/script-object";
import { attribute, method, writeProp } from "@gds2js/runtime/runtime/methods";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GDict, show } from "@gds2js/runtime/runtime/values";
import { vector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { vector2i } from "@gds2js/runtime/runtime/class/vector/vector2i";
import { gdDispatchByName } from "./support/gd-dispatch";
import { F, I, S } from "./support/variants";

describe("runtime/object · 类、字段与元信息", () => {
  it("step58b · int 字段收 float 截断", async () => {
    class Inner extends GdScriptObject {
      m: Variant = I(1);
      t: Variant = I(2);
      s: Variant = S("a");
      v: Variant = vector2(0, 0);
      getm(): Variant {
        return this.m;
      }
      override __gdDispatch(name: string, args: Variant[]): Variant | null {
        return gdDispatchByName(this, name, args);
      }
    }
    const dInner = registerClass("Inner", Inner, () => new Inner(), (o) => o instanceof Inner);
    registerFieldTypes(dInner, { t: "int", s: "String", v: "Vector2" });
    const obj = V.object(new Inner());
    const field = (k: string): string => show((obj.v as Record<string, Variant>)[k] as Variant);

    writeProp(obj, "t", F(5.5));
    eq("step58b", "int 字段收 float 截断", field("t"), "5");
    writeProp(obj, "t", S("12abc"));
    eq("step58b", "int 字段收数字串走 int(字符串)", field("t"), "12");
    writeProp(obj, "s", V.stringName("nm"));
    eq("step58b", "String 字段收 StringName", field("s"), "nm");
    writeProp(obj, "v", vector2i(3, 4));
    eq("step58b", "Vector2 字段收 Vector2i 升级", field("v"), "(3.0, 4.0)");
    writeProp(obj, "m", S("x"));
    eq("step58b", "未定型字段原样存", field("m"), "x");
    shouldThrow("step58b", "String 字段拒 int（不是转成 \"5\"）", () => writeProp(obj, "s", I(5)));
    shouldThrow("step58b", "未知键拒（形体）", () => writeProp(obj, "zz", I(1)));
    shouldThrow("step58b", "写方法名也拒（与未知键同文本）", () => writeProp(obj, "getm", I(5)));
  });

  it("step62 · A.f() 从类对象调得到", async () => {
    class Holder {
      mv = V.int(1);
      static make(): Variant {
        return V.str("made");
      }
      static twice(x: Variant): Variant {
        return V.int(42);
      }
    }
    const dHolder = registerClass("Holder", Holder, () => new Holder(), (o) => o instanceof Holder);
    registerStaticMethods(dHolder, ["make", "twice"], { make: (): Variant => Holder.make(), twice: (a: Variant[]): Variant => Holder.twice(a[0] as Variant) });
    const h = new Holder();
    eq("step62", "A.f() 从类对象调得到", `${method(Holder, "make", []).v}`, "made");
    eq("step62", "p.f() 从实例也调得到，同一个结果", `${method(V.object(h), "make", []).v}`, "made");
    eq("step62", "A.f 取值是 Callable（typeof → 25）", `${typeOf(attribute(Holder, "make")).v}`, "25");
    eq("step62", "p.f 取值同样是 Callable", `${typeOf(attribute(V.object(h), "make")).v}`, "25");
    eq("step62", "取到的 Callable 照样能 call，实参照传", `${method(attribute(Holder, "twice"), "call", [V.int(21)]).v}`, "42");
    shouldThrow("step62", "没登记的 name/length 不当成方法（显式表的意义）", () => method(V.object(h), "name", []));
  });

  it("step63 · 类对象读得到那一格", async () => {
    class Box {
      static x = V.int(1);
      static plain = V.int(2);
    }
    const dBox = registerClass("Box", Box, () => new Box(), (o) => o instanceof Box);
    registerStaticVars(dBox, { x: "int", plain: "" }, {
      x: { get: (): Variant => Box.x, set: (v: Variant): void => { Box.x = v; } },
      plain: { get: (): Variant => Box.plain, set: (v: Variant): void => { Box.plain = v; } },
    });
    const b = new Box();
    eq("step63", "类对象读得到那一格", `${(attribute(Box, "x") as Variant).v}`, "1");
    eq("step63", "实例读的是**同一格**", `${(attribute(V.object(b), "x") as Variant).v}`, "1");
    writeProp(Box, "x", F(5.5));
    eq("step63", "类名写：int 槽收 float 截断", `${(Box.x as Variant).v}`, "5");
    writeProp(V.object(b), "x", S("12abc"));
    eq("step63", "实例写、类名读到（真是共享的）", `${(attribute(Box, "x") as Variant).v}`, "12");
    writeProp(Box, "plain", S("s"));
    eq("step63", "没实测类型的槽原样存（不编造规则）", `${(attribute(Box, "plain") as Variant).t}`, `${Tag.STRING}`);
    shouldThrow("step63", "静态表里没有的键照旧响拒", () => writeProp(V.object(new Box()), "zz", I(1)));
  });

  it("step66 · get_class 给的是**原生基类**而不是脚本名", async () => {
    class Obj extends GdScriptObject {
      im(): Variant {
        return V.int(1);
      }
      static sm(): Variant {
        return V.nil();
      }
    }
    const dObj = registerClass("Obj", Obj, () => new Obj(), (o) => o instanceof Obj);
    registerStaticMethods(dObj, ["sm"], { sm: (): Variant => Obj.sm() });
    registerNativeBase(dObj, "RefCounted");
    const o = new Obj();
    eq("step66", "get_class 给的是**原生基类**而不是脚本名", `${method(V.object(o), "get_class", []).v}`, "RefCounted");
    eq("step66", "has_method：自己的 / 静态的 / Object 自带的都真，全局函数与空串假", [
      method(V.object(o), "has_method", [V.str("im")]).v,
      method(V.object(o), "has_method", [V.str("sm")]).v,
      method(V.object(o), "has_method", [V.str("get_class")]).v,
      method(V.object(o), "has_method", [V.str("print")]).v,
      method(V.object(o), "has_method", [V.str("")]).v,
    ].join(","), "true,true,true,false,false");
    setMeta(o, V.stringName("sn"), I(6));
    eq("step66", "StringName 写进去、String 键读得到", [
      method(V.object(o), "has_meta", [V.str("sn")]).v,
      method(V.object(o), "get_meta", [V.str("sn")]).v,
    ].join(" "), "true 6");
    eq("step66", "get_meta 两参形给默认值", `${method(V.object(o), "get_meta", [V.str("nope"), I(99)]).v}`, "99");
    eq("step66", "get_meta 一参形缺键给 null 且**继续跑**", `${method(V.object(o), "get_meta", [V.str("nope")]).t}`, `${Tag.NIL}`);
    method(V.object(o), "remove_meta", [V.str("sn")]);
    eq("step66", "remove_meta 之后 has_meta 假", `${method(V.object(o), "has_meta", [V.str("sn")]).v}`, "false");
    shouldThrow("step66", "meta 的键要 String / StringName，其余响亮拒", () => setMeta(o, I(1), I(2)));
  });
});

describe("runtime/methods · 字典的属性两面就是 StringName 键那一格（S421）", () => {
  const errText = (f: () => unknown): string => {
    try {
      f();
      return "没抛";
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  };
  const dictBox = (pairs: Array<[Variant, Variant]>): Variant => {
    const g = new GDict();
    for (const [k, v] of pairs) g.set(k, v);
    return V.dict(g);
  };

  it("写式把名字折成 StringName 键塞进字典，读式与打印都对上引擎", () => {
    const d = dictBox([]);
    writeProp(d, "foo", V.int(5));
    eq("421", "属性读回 5", String((attribute(d, "foo") as Variant).v), "5");
    eq("421", "打印是 { &\"foo\": 5 }", show(d), '{ &"foo": 5 }');
    eq("421", "String 键的下标读也认这一格", show(method(d, "get", [V.str("foo")]), 1), "5");
    eq("421", "has 两形都真", `${String((attribute(d, "foo") as Variant).t)}/${show(method(d, "has", [V.stringName("foo")]))}`, `${Tag.INT}/true`);
  });

  it("String 键先写，属性读也认这一格", () => {
    const d = dictBox([[V.str("bar"), V.int(7)]]);
    eq("421", "属性读 String 键", String((attribute(d, "bar") as Variant).v), "7");
  });

  it("没这一格时给 Invalid access 那句，成员名也一样", () => {
    const d = dictBox([[V.int(1), V.int(2)]]);
    const say = (n: string): string => "Invalid access to property or key '" + n + "' on a base object of type 'Dictionary'.";
    for (const n of ["nosuch", "keys", "size", "has"]) {
      eq("421", `读 ${n}`, errText(() => attribute(d, n)), say(n));
    }
    eq("421", "keys() 照旧是方法", show(method(d, "keys", []), 1), "[1]");
  });

  it("往成员名上写不报错，读完还是那一格", () => {
    const d = dictBox([[V.int(1), V.int(2)]]);
    writeProp(d, "keys", V.int(7));
    eq("421", "属性读回 7", String((attribute(d, "keys") as Variant).v), "7");
    eq("421", "keys() 给两把键", show(method(d, "keys", []), 1), '[1, &"keys"]');
    eq("421", "整张字典的打印", show(d), '{ 1: 2, &"keys": 7 }');
  });
});

describe("runtime/methods · Array 与 String 的属性写给同一句（S423）", () => {
  const errText = (f: () => unknown): string => {
    try {
      f();
      return "没抛";
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  };
  const say = (base: string, key: string, ty: string): string =>
    `Invalid assignment of property or key '${key}' with value of type '${ty}' on a base object of type '${base}'.`;

  it("表外名与成员名同形，值的型名按实值", () => {
    const a = V.array([V.int(1)]);
    eq("423", "Array 写表外名", errText(() => writeProp(a, "nosuch", V.int(1))), say("Array", "nosuch", "int"));
    eq("423", "Array 写成员名", errText(() => writeProp(a, "append", V.int(1))), say("Array", "append", "int"));
    eq("423", "Array 写 float 值", errText(() => writeProp(a, "append", V.float(1.5))), say("Array", "append", "float"));
  });

  it("String 那一支照同一句，型名是 String", () => {
    const s = V.str("abcd");
    eq("423", "String 写表外名", errText(() => writeProp(s, "nosuch", V.int(1))), say("String", "nosuch", "int"));
    eq("423", "String 写成员名", errText(() => writeProp(s, "to_upper", V.bool(true))), say("String", "to_upper", "bool"));
  });
});

describe("runtime/methods · String 与 Array 的属性读按表外名单给那句（S424）", () => {
  const errText = (f: () => unknown): string => {
    try {
      f();
      return "没抛";
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  };
  const say = (face: string, n: string): string => "Invalid access to property or key '" + n + "' on a base object of type '" + face + "'.";

  it("名单里的名字逐名给引擎那句", () => {
    const str = V.str("abcd");
    for (const n of ["nosuch", "keys", "size", "append", "bsearch"]) {
      eq("424", `String 读 ${n}`, errText(() => attribute(str, n)), say("String", n));
    }
    const arr = V.array([V.int(1)]);
    for (const n of ["nosuch", "keys", "length", "to_upper", "join"]) {
      eq("424", `Array 读 ${n}`, errText(() => attribute(arr, n)), say("Array", n));
    }
  });

  it("成员名不许冒充那句：Callable 那一族还没接就响亮拒", () => {
    eq("424", "String 读 to_upper", /Invalid access/.test(errText(() => attribute(V.str("abcd"), "to_upper"))), false);
    eq("424", "String 读 length", /Invalid access/.test(errText(() => attribute(V.str("abcd"), "length"))), false);
    eq("424", "Array 读 append", /Invalid access/.test(errText(() => attribute(V.array([V.int(1)]), "append"))), false);
    eq("424", "Array 读 size", /Invalid access/.test(errText(() => attribute(V.array([V.int(1)]), "size"))), false);
  });
});

describe("runtime/methods · 值类型与名字面的装箱属性读三分岔（S432）", () => {
  const errText = (f: () => unknown): string => {
    try {
      f();
      return "没抛";
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  };
  const say = (face: string, n: string): string => "Invalid access to property or key '" + n + "' on a base object of type '" + face + "'.";

  it("宇宙内表外名给那句，成员名给 Callable，真属性照旧", () => {
    const v = vector2(1, 2);
    eq("432", "Vector2 表外名", errText(() => attribute(v, "keys")), say("Vector2", "keys"));
    eq("432", "Vector2 成员名给 Callable", show(attribute(v, "length") as Variant), "Vector2::length");
    eq("432", "Vector2 真属性照旧", show(attribute(v, "x") as Variant), "1.0");
    const sn = V.stringName("ab");
    eq("432", "StringName 表外名", errText(() => attribute(sn, "size")), say("StringName", "size"));
    eq("432", "StringName 成员名给 Callable", show(attribute(sn, "hash") as Variant), "StringName::hash");
  });

  it("宇宙之外的那一名：vector 六面与 String 两面发引擎那句（S630 / S632）", () => {
    eq("632", "Vector2 宇宙外发引擎那句（w2）", errText(() => attribute(vector2(1, 2), "nosuchzz")),
      "Invalid access to property or key 'nosuchzz' on a base object of type 'Vector2'.");
    // S630 量过：String 与 StringName 两面的宇宙外名引擎发的就是那一句（`tmp/probe628/t2 / t4 / t11`）
    eq("630", "StringName 宇宙外", errText(() => attribute(V.stringName("ab"), "nosuchzz")), "Invalid access to property or key 'nosuchzz' on a base object of type 'StringName'.");
    eq("630", "String 宇宙外", errText(() => attribute(V.str("ab"), "nosuchzz")), "Invalid access to property or key 'nosuchzz' on a base object of type 'String'.");
  });
});
