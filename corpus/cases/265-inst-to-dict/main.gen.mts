// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(73);
      let i = rt.V.object(new Inner());
      rt.frameLine(74);
      let di = rt.gInstToDict(i);
      rt.frameLine(75);
      print(rt.showArgs([rt.V.str("t01|"), rt.typeOf(di)]));
      rt.frameLine(76);
      print(rt.showArgs([rt.V.str("t02|"), di]));
      rt.frameLine(77);
      print(rt.showArgs([rt.V.str("t03|"), rt.strBuiltin([rt.wrapValue(rt.index(di, rt.V.str("@subpath")))])]));
      rt.frameLine(78);
      print(rt.showArgs([rt.V.str("t04|"), rt.typeOf(rt.wrapValue(rt.index(di, rt.V.str("@subpath"))))]));
      rt.frameLine(79);
      print(rt.showArgs([rt.V.str("t05|"), rt.typeOf(rt.wrapValue(rt.index(di, rt.V.str("@path"))))]));
      rt.frameLine(80);
      print(rt.showArgs([rt.V.str("t06|"), rt.method(di, "has", [rt.V.str("sig")])]));
      rt.frameLine(81);
      print(rt.showArgs([rt.V.str("t07|"), rt.method(di, "has", [rt.V.str("C")])]));
      rt.frameLine(82);
      print(rt.showArgs([rt.V.str("t08|"), rt.method(di, "has", [rt.V.str("sv")])]));
      rt.frameLine(83);
      print(rt.showArgs([rt.V.str("t09|"), rt.method(di, "size", [])]));
      rt.frameLine(84);
      print(rt.showArgs([rt.V.str("t10|"), rt.method(di, "keys", [])]));
      rt.frameLine(85);
      print(rt.showArgs([rt.V.str("t11|"), rt.gInstToDict(rt.V.object(new Empty()))]));
      rt.frameLine(86);
      print(rt.showArgs([rt.V.str("t12|"), rt.gInstToDict(rt.V.object(new Derived()))]));
      rt.frameLine(87);
      print(rt.showArgs([rt.V.str("t13|"), rt.gInstToDict(rt.V.object(new Acc()))]));
      rt.frameLine(88);
      print(rt.showArgs([rt.V.str("t14|"), rt.gInstToDict(rt.V.object(new Box()))]));
      rt.frameLine(89);
      print(rt.showArgs([rt.V.str("t15|"), rt.gInstToDict(rt.V.object(this))]));
      rt.frameLine(90);
      print(rt.showArgs([rt.V.str("t16|"), rt.typeOf(rt.gInstToDict(rt.V.nil()))]));
      rt.frameLine(91);
      print(rt.showArgs([rt.V.str("t17|"), rt.V.str(rt.varToStr(rt.gInstToDict(rt.V.object(new Inner()))))]));
      rt.frameLine(92);
      let b = rt.V.object(new Box());
      rt.frameLine(93);
      {
        const _nv = rt.writeProp(b, "leaf", i);
        if (_nv !== null) b = _nv;
      }
      rt.frameLine(94);
      print(rt.showArgs([rt.V.str("t18|"), rt.gInstToDict(b)]));
      rt.frameLine(95);
      print(rt.showArgs([rt.V.str("t19|"), rt.ops.eq(rt.wrapValue(rt.index(rt.gInstToDict(b), rt.V.str("leaf"))), i)]));
      rt.frameLine(96);
      print(rt.showArgs([rt.V.str("t20|"), rt.ops.eq(rt.strBuiltin([rt.wrapValue(rt.index(di, rt.V.str("@path")))]), rt.strBuiltin([rt.wrapValue(rt.index(rt.gInstToDict(rt.V.object(new Inner())), rt.V.str("@path")))]))]));
      rt.frameLine(97);
      print(rt.showArgs([rt.V.str("t21|"), rt.wrapValue(rt.index(di, rt.V.stringName("k")))]));
      rt.frameLine(98);
      print(rt.showArgs([rt.V.str("t22|"), rt.wrapValue(rt.index(rt.gInstToDict(rt.V.object(new WithInit())), rt.V.stringName("touched")))]));
      rt.frameLine(99);
      print(rt.showArgs([rt.V.str("t23|"), rt.ops.eq(rt.gInstToDict(i), rt.gInstToDict(i))]));
      rt.frameLine(100);
      print(rt.showArgs([rt.V.str("t24|"), rt.ops.eq(rt.wrapValue(rt.index(di, rt.V.str("@subpath"))), rt.nodePathCtor([rt.V.str("Inner")]))]));
      rt.frameLine(101);
      print(rt.showArgs([rt.V.str("t25|"), rt.ops.eq(rt.wrapValue(rt.index(di, rt.V.str("@path"))), rt.strBuiltin([rt.wrapValue(rt.index(di, rt.V.str("@path")))]))]));
      rt.frameLine(102);
      print(rt.showArgs([rt.V.str("t26|"), rt.ops.eq(rt.method(rt.wrapValue(rt.index(rt.gInstToDict(b), rt.V.str("leaf"))), "get_instance_id", []), rt.method(i, "get_instance_id", []))]));
      rt.frameLine(103);
      print(rt.showArgs([rt.V.str("t27|"), rt.strBuiltin([rt.wrapValue(rt.index(rt.gInstToDict(rt.V.object(new Acc())), rt.V.str("au")))])]));
      rt.frameLine(104);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
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
  declare sig: rt.Signal;
  declare C: rt.Variant;
  declare k: rt.Variant;
  declare s: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(6);
      this.sig = new rt.Signal("sig");
      rt.frameLine(4);
      this.C = rt.V.int(7);
      rt.frameLine(7);
      this.k = rt.V.int(1);
      rt.frameLine(8);
      this.s = rt.V.str("x");
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static C = rt.V.int(7);
  static sv = rt.V.int(5);

  constructor() {
    super();
    this.__gd_fields__();
  }

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
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

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
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(14);
      this.a = rt.V.int(1);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
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
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      super.__gd_fields__();
      rt.frameLine(17);
      this.b = rt.V.int(2);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
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
  declare _v: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(20);
      this._v = rt.V.int(1);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  get ai() {
    rt.frameLine(22);
    return rt.V.int(42);
  }
  set ai(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get af() {
    rt.frameLine(24);
    return rt.V.float(1.5);
  }
  set af(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get ab() {
    rt.frameLine(26);
    return rt.V.bool(true);
  }
  set ab(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get ast() {
    rt.frameLine(28);
    return rt.V.str("hi");
  }
  set ast(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get asn() {
    rt.frameLine(30);
    return rt.V.stringName("hi");
  }
  set asn(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get av() {
    rt.frameLine(32);
    return rt.vector2New([rt.V.int(1), rt.V.int(2)]);
  }
  set av(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get avi() {
    rt.frameLine(34);
    return rt.vector2iNew([rt.V.int(1), rt.V.int(2)]);
  }
  set avi(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get av3() {
    rt.frameLine(36);
    return rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
  }
  set av3(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get av3i() {
    rt.frameLine(38);
    return rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
  }
  set av3i(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get ac() {
    rt.frameLine(40);
    return rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)]);
  }
  set ac(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get anp() {
    rt.frameLine(42);
    return rt.nodePathCtor([rt.V.str("a/b")]);
  }
  set anp(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get ad() {
    rt.frameLine(44);
    return rt.V.array(rt.GArray.of([rt.V.int(1)]));
  }
  set ad(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get adi() {
    rt.frameLine(46);
    return rt.dictOf([]);
  }
  set adi(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get au() {
    rt.frameLine(48);
    return rt.V.int(7);
  }
  set au(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get apb() {
    rt.frameLine(50);
    return rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1)]))]);
  }
  set apb(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get aps() {
    rt.frameLine(52);
    return rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("x")]))]);
  }
  set aps(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }

  constructor() {
    super();
    this.__gd_fields__();
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
  declare plain: rt.Variant;
  declare typedint: rt.Variant;
  declare typedstr: rt.Variant;
  declare nilf: rt.Variant;
  declare arr: rt.Variant;
  declare d: rt.Variant;
  declare sn: rt.Variant;
  declare np: rt.Variant;
  declare rid: rt.Variant;
  declare leaf: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(55);
      this.plain = rt.V.nil();
      rt.frameLine(56);
      this.typedint = rt.toInt(rt.V.int(0));
      rt.frameLine(57);
      this.typedstr = rt.strOf(rt.V.str(""));
      rt.frameLine(58);
      this.nilf = rt.V.nil();
      rt.frameLine(59);
      this.arr = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(60);
      this.d = rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]);
      rt.frameLine(61);
      this.sn = rt.V.stringName("s");
      rt.frameLine(62);
      this.np = rt.nodePathCtor([rt.V.str("a/b")]);
      rt.frameLine(63);
      this.rid = rt.gRidFromInt64(rt.V.int(5));
      rt.frameLine(64);
      this.leaf = rt.V.nil();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

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
  declare touched: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(67);
      this.touched = rt.V.int(0);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
    if (!rt.bareConstruction()) {
        const __gd_frame = rt.frameEnter("res://main.gd", "_init");
        try {
        rt.frameLine(70);
        this.touched = rt.V.int(99);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return;
        } finally {
          rt.frameExit(__gd_frame);
        }
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
