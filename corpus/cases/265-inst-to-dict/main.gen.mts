// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let i = rt.V.object(new Inner());
    let di = rt.gInstToDict(i);
    print(rt.showArgs([rt.V.str("t01|"), rt.typeOf(di)]));
    print(rt.showArgs([rt.V.str("t02|"), di]));
    print(rt.showArgs([rt.V.str("t03|"), rt.strBuiltin([rt.wrapValue(rt.index(di, rt.V.str("@subpath")))])]));
    print(rt.showArgs([rt.V.str("t04|"), rt.typeOf(rt.wrapValue(rt.index(di, rt.V.str("@subpath"))))]));
    print(rt.showArgs([rt.V.str("t05|"), rt.typeOf(rt.wrapValue(rt.index(di, rt.V.str("@path"))))]));
    print(rt.showArgs([rt.V.str("t06|"), rt.method(di, "has", [rt.V.str("sig")])]));
    print(rt.showArgs([rt.V.str("t07|"), rt.method(di, "has", [rt.V.str("C")])]));
    print(rt.showArgs([rt.V.str("t08|"), rt.method(di, "has", [rt.V.str("sv")])]));
    print(rt.showArgs([rt.V.str("t09|"), rt.method(di, "size", [])]));
    print(rt.showArgs([rt.V.str("t10|"), rt.method(di, "keys", [])]));
    print(rt.showArgs([rt.V.str("t11|"), rt.gInstToDict(rt.V.object(new Empty()))]));
    print(rt.showArgs([rt.V.str("t12|"), rt.gInstToDict(rt.V.object(new Derived()))]));
    print(rt.showArgs([rt.V.str("t13|"), rt.gInstToDict(rt.V.object(new Acc()))]));
    print(rt.showArgs([rt.V.str("t14|"), rt.gInstToDict(rt.V.object(new Box()))]));
    print(rt.showArgs([rt.V.str("t15|"), rt.gInstToDict(rt.V.object(this))]));
    print(rt.showArgs([rt.V.str("t16|"), rt.typeOf(rt.gInstToDict(rt.V.nil()))]));
    print(rt.showArgs([rt.V.str("t17|"), rt.V.str(rt.varToStr(rt.gInstToDict(rt.V.object(new Inner()))))]));
    let b = rt.V.object(new Box());
    {
      const _nv = rt.writeProp(b, "leaf", i);
      if (_nv !== null) b = _nv;
    }
    print(rt.showArgs([rt.V.str("t18|"), rt.gInstToDict(b)]));
    print(rt.showArgs([rt.V.str("t19|"), rt.ops.eq(rt.wrapValue(rt.index(rt.gInstToDict(b), rt.V.str("leaf"))), i)]));
    print(rt.showArgs([rt.V.str("t20|"), rt.ops.eq(rt.strBuiltin([rt.wrapValue(rt.index(di, rt.V.str("@path")))]), rt.strBuiltin([rt.wrapValue(rt.index(rt.gInstToDict(rt.V.object(new Inner())), rt.V.str("@path")))]))]));
    print(rt.showArgs([rt.V.str("t21|"), rt.wrapValue(rt.index(di, rt.V.stringName("k")))]));
    print(rt.showArgs([rt.V.str("t22|"), rt.wrapValue(rt.index(rt.gInstToDict(rt.V.object(new WithInit())), rt.V.stringName("touched")))]));
    print(rt.showArgs([rt.V.str("t23|"), rt.ops.eq(rt.gInstToDict(i), rt.gInstToDict(i))]));
    print(rt.showArgs([rt.V.str("t24|"), rt.ops.eq(rt.wrapValue(rt.index(di, rt.V.str("@subpath"))), rt.nodePathCtor([rt.V.str("Inner")]))]));
    print(rt.showArgs([rt.V.str("t25|"), rt.ops.eq(rt.wrapValue(rt.index(di, rt.V.str("@path"))), rt.strBuiltin([rt.wrapValue(rt.index(di, rt.V.str("@path")))]))]));
    print(rt.showArgs([rt.V.str("t26|"), rt.ops.eq(rt.method(rt.wrapValue(rt.index(rt.gInstToDict(b), rt.V.str("leaf"))), "get_instance_id", []), rt.method(i, "get_instance_id", []))]));
    print(rt.showArgs([rt.V.str("t27|"), rt.strBuiltin([rt.wrapValue(rt.index(rt.gInstToDict(rt.V.object(new Acc())), rt.V.str("au")))])]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Inner extends rt.GdScriptObject {
  sig = new rt.Signal("sig");
  C = rt.V.int(7);
  static C = rt.V.int(7);
  static sv = rt.V.int(5);
  k = rt.V.int(1);
  s = rt.V.str("x");

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerScriptProps(__gd_d_Inner, ["C","k","s"], (o) => { const s = o as Inner; return [s.C, s.k, s.s]; });
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", ["k","s"], {}, (o) => { const s = o as Inner; return [s.k, s.s]; });
rt.registerStaticVars(__gd_d_Inner, {"sv": ""}, {"sv": { get: (): rt.Variant => Inner.sv, set: (__v: rt.Variant): void => { Inner.sv = __v; } }});
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

class Empty extends rt.GdScriptObject {
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Empty = rt.defineClass(Empty, () => new Empty(), (o) => o instanceof Empty);
rt.nameClass(__gd_d_Empty, "Empty");
rt.registerDictIdentity(__gd_d_Empty, "res://main.gd", "Empty", [], {}, (o) => { const s = o as Empty; return []; });
rt.registerNativeBase(__gd_d_Empty, "RefCounted");

class Base extends rt.GdScriptObject {
  constructor(...__gd_new_args: rt.Variant[]) {
    super();
    this.__gd_fields__();
    if (!rt.bareConstruction()) this.__gdDispatch("_init", __gd_new_args);
  }

  declare a: rt.Variant;

  __gd_fields__() {
    this.a = rt.V.int(1);
  }

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Base = rt.defineClass(Base, (a) => new Base(...a), (o) => o instanceof Base);
rt.nameClass(__gd_d_Base, "Base");
rt.registerScriptProps(__gd_d_Base, ["a"], (o) => { const s = o as Base; return [s.a]; });
rt.registerDictIdentity(__gd_d_Base, "res://main.gd", "Base", ["a"], {}, (o) => { const s = o as Base; return [s.a]; });
rt.registerNativeBase(__gd_d_Base, "RefCounted");

class Derived extends Base {
  declare b: rt.Variant;

  override __gd_fields__() {
    super.__gd_fields__();
    this.b = rt.V.int(2);
  }

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Derived = rt.defineClass(Derived, (a) => new Derived(...a), (o) => o instanceof Derived);
rt.nameClass(__gd_d_Derived, "Derived");
rt.setClassBase(__gd_d_Derived, rt.lookupClass("Base") ?? null);
rt.registerScriptProps(__gd_d_Derived, ["b"], (o) => { const s = o as Derived; return [s.b]; });
rt.registerDictIdentity(__gd_d_Derived, "res://main.gd", "Derived", ["b"], {}, (o) => { const s = o as Derived; return [s.b]; });

class Acc extends rt.GdScriptObject {
  _v = rt.V.int(1);
  get ai() {
    return rt.V.int(42);
  }
  set ai(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get af() {
    return rt.V.float(1.5);
  }
  set af(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get ab() {
    return rt.V.bool(true);
  }
  set ab(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get ast() {
    return rt.V.str("hi");
  }
  set ast(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get asn() {
    return rt.V.stringName("hi");
  }
  set asn(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get av() {
    return rt.vector2New([rt.V.int(1), rt.V.int(2)]);
  }
  set av(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get avi() {
    return rt.vector2iNew([rt.V.int(1), rt.V.int(2)]);
  }
  set avi(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get av3() {
    return rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
  }
  set av3(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get av3i() {
    return rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
  }
  set av3i(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get ac() {
    return rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)]);
  }
  set ac(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get anp() {
    return rt.nodePathCtor([rt.V.str("a/b")]);
  }
  set anp(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get ad() {
    return rt.V.array(rt.GArray.of([rt.V.int(1)]));
  }
  set ad(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get adi() {
    return rt.dictOf([]);
  }
  set adi(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get au() {
    return rt.V.int(7);
  }
  set au(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get apb() {
    return rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1)]))]);
  }
  set apb(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get aps() {
    return rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("x")]))]);
  }
  set aps(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Acc = rt.defineClass(Acc, () => new Acc(), (o) => o instanceof Acc);
rt.nameClass(__gd_d_Acc, "Acc");
rt.registerFieldTypes(__gd_d_Acc, {"ai": "int", "af": "float", "ab": "bool", "ast": "String", "asn": "accessor", "av": "Vector2", "avi": "accessor", "av3": "accessor", "av3i": "accessor", "ac": "accessor", "anp": "accessor", "ad": "accessor", "adi": "accessor", "au": "accessor", "apb": "accessor", "aps": "accessor"});
rt.registerScriptProps(__gd_d_Acc, ["_v","ai","af","ab","ast","asn","av","avi","av3","av3i","ac","anp","ad","adi","au","apb","aps"], (o) => { const s = o as Acc; return [s._v, s.ai, s.af, s.ab, s.ast, s.asn, s.av, s.avi, s.av3, s.av3i, s.ac, s.anp, s.ad, s.adi, s.au, s.apb, s.aps]; });
rt.registerDictIdentity(__gd_d_Acc, "res://main.gd", "Acc", ["_v","ai","af","ab","ast","asn","av","avi","av3","av3i","ac","anp","ad","adi","au","apb","aps"], {"ai": "int", "af": "float", "ab": "bool", "ast": "String", "asn": "StringName", "av": "Vector2", "avi": "Vector2i", "av3": "Vector3", "av3i": "Vector3i", "ac": "Color", "anp": "NodePath", "ad": "Array", "adi": "Dictionary", "au": null, "apb": "PackedByteArray", "aps": "PackedStringArray"}, (o) => { const s = o as Acc; return [s._v, rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil()]; });
rt.registerNativeBase(__gd_d_Acc, "RefCounted");

class Box extends rt.GdScriptObject {
  plain = rt.V.nil();
  typedint = rt.toInt(rt.V.int(0));
  typedstr = rt.strOf(rt.V.str(""));
  nilf = rt.V.nil();
  arr = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
  d = rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]);
  sn = rt.V.stringName("s");
  np = rt.nodePathCtor([rt.V.str("a/b")]);
  rid = rt.gRidFromInt64(rt.V.int(5));
  leaf = rt.V.nil();

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Box = rt.defineClass(Box, () => new Box(), (o) => o instanceof Box);
rt.nameClass(__gd_d_Box, "Box");
rt.registerFieldTypes(__gd_d_Box, {"typedint": "int", "typedstr": "String"});
rt.registerScriptProps(__gd_d_Box, ["plain","typedint","typedstr","nilf","arr","d","sn","np","rid","leaf"], (o) => { const s = o as Box; return [s.plain, s.typedint, s.typedstr, s.nilf, s.arr, s.d, s.sn, s.np, s.rid, s.leaf]; });
rt.registerDictIdentity(__gd_d_Box, "res://main.gd", "Box", ["plain","typedint","typedstr","nilf","arr","d","sn","np","rid","leaf"], {}, (o) => { const s = o as Box; return [s.plain, s.typedint, s.typedstr, s.nilf, s.arr, s.d, s.sn, s.np, s.rid, s.leaf]; });
rt.registerNativeBase(__gd_d_Box, "RefCounted");

class WithInit extends rt.GdScriptObject {
  touched = rt.V.int(0);

  constructor() {
    super();
    if (!rt.bareConstruction()) {
      this.touched = rt.V.int(99);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_WithInit = rt.defineClass(WithInit, () => new WithInit(), (o) => o instanceof WithInit);
rt.nameClass(__gd_d_WithInit, "WithInit");
rt.registerScriptProps(__gd_d_WithInit, ["touched"], (o) => { const s = o as WithInit; return [s.touched]; });
rt.registerDictIdentity(__gd_d_WithInit, "res://main.gd", "WithInit", ["touched"], {}, (o) => { const s = o as WithInit; return [s.touched]; });
rt.registerNativeBase(__gd_d_WithInit, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
