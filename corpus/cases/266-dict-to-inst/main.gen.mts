// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let i = rt.V.object(new Inner());
    let di = rt.gInstToDict(i);
    let b = rt.gDictToInst(di);
    print(rt.showArgs([rt.V.str("t01|"), rt.typeOf(b)]));
    print(rt.showArgs([rt.V.str("t02|"), rt.isType(b, "Inner")]));
    print(rt.showArgs([rt.V.str("t03|"), rt.wrapValue(rt.attribute(b, "k")), rt.V.str("|"), rt.wrapValue(rt.attribute(b, "s"))]));
    print(rt.showArgs([rt.V.str("t04|"), rt.gInstToDict(b)]));
    print(rt.showArgs([rt.V.str("t05|"), rt.V.str(rt.varToStr(rt.gInstToDict(b)))]));
    print(rt.showArgs([rt.V.str("t06|"), rt.ops.eq(b, i)]));
    print(rt.showArgs([rt.V.str("t07|"), rt.ops.eq(rt.method(b, "get_instance_id", []), rt.method(i, "get_instance_id", []))]));
    print(rt.showArgs([rt.V.str("t08|"), rt.isType(b, "RefCounted")]));
    print(rt.showArgs([rt.V.str("t09|"), rt.method(rt.gInstToDict(b), "keys", [])]));
    let w = rt.V.object(new WithInit());
    let dw = rt.gInstToDict(w);
    let w2 = rt.gDictToInst(dw);
    print(rt.showArgs([rt.V.str("t10|"), rt.wrapValue(rt.attribute(w2, "touched"))]));
    print(rt.showArgs([rt.V.str("t11|"), rt.isType(w2, "WithInit")]));
    print(rt.showArgs([rt.V.str("t12|"), rt.gInstToDict(w2)]));
    print(rt.showArgs([rt.V.str("t13|"), rt.wrapValue(rt.attribute(rt.gDictToInst(dw), "touched"))]));
    let dv = rt.gInstToDict(rt.V.object(new Derived()));
    rt.method(dv, "erase", [rt.V.stringName("b")]);
    let back = rt.gDictToInst(dv);
    print(rt.showArgs([rt.V.str("t14|"), rt.wrapValue(rt.attribute(back, "a")), rt.V.str("|"), rt.wrapValue(rt.attribute(back, "b"))]));
    print(rt.showArgs([rt.V.str("t15|"), rt.gInstToDict(back)]));
    let full = rt.V.object(new Box());
    let dfull = rt.gInstToDict(full);
    {
      const _nv = rt.writeIdx(dfull, rt.V.stringName("extra"), rt.V.int(7));
      if (_nv !== null) dfull = _nv;
    }
    let rb = rt.gDictToInst(dfull);
    print(rt.showArgs([rt.V.str("t16|"), rt.gInstToDict(rb)]));
    print(rt.showArgs([rt.V.str("t17|"), rt.ops.eq(rt.wrapValue(rt.attribute(rb, "arr")), rt.wrapValue(rt.attribute(full, "arr")))]));
    print(rt.showArgs([rt.V.str("t18|"), rt.ops.eq(rt.wrapValue(rt.attribute(rb, "dic")), rt.wrapValue(rt.attribute(full, "dic")))]));
    print(rt.showArgs([rt.V.str("t19|"), rt.wrapValue(rt.attribute(rb, "plain")), rt.V.str("|"), rt.wrapValue(rt.attribute(rb, "leaf")), rt.V.str("|"), rt.wrapValue(rt.attribute(rb, "arr")), rt.V.str("|"), rt.wrapValue(rt.attribute(rb, "dic"))]));
    let a = rt.V.object(new Acc());
    let da = rt.gInstToDict(a);
    print(rt.showArgs([rt.V.str("t20|"), da]));
    {
      const _nv = rt.writeIdx(da, rt.V.stringName("v"), rt.V.int(2));
      if (_nv !== null) da = _nv;
    }
    let ab = rt.gDictToInst(da);
    print(rt.showArgs([rt.V.str("t21|"), rt.wrapValue(rt.attribute(ab, "_v")), rt.V.str("|"), rt.wrapValue(rt.attribute(ab, "v"))]));
    print(rt.showArgs([rt.V.str("t22|"), rt.gInstToDict(ab)]));
    let da2 = rt.gInstToDict(a);
    {
      const _nv = rt.writeIdx(da2, rt.V.stringName("_v"), rt.V.int(3));
      if (_nv !== null) da2 = _nv;
    }
    let ab2 = rt.gDictToInst(da2);
    print(rt.showArgs([rt.V.str("t23|"), rt.wrapValue(rt.attribute(ab2, "_v")), rt.V.str("|"), rt.wrapValue(rt.attribute(ab2, "v"))]));
    let ds = rt.dictOf([[rt.V.str("@path"), rt.strBuiltin([rt.wrapValue(rt.index(di, rt.V.str("@path")))])], [rt.V.str("@subpath"), rt.V.str("Inner")], [rt.V.stringName("k"), rt.V.int(5)]]);
    let bs = rt.gDictToInst(ds);
    print(rt.showArgs([rt.V.str("t24|"), rt.isType(bs, "Inner")]));
    print(rt.showArgs([rt.V.str("t25|"), rt.wrapValue(rt.attribute(bs, "k")), rt.V.str("|"), rt.wrapValue(rt.attribute(bs, "s"))]));
    print(rt.showArgs([rt.V.str("t26|"), rt.gInstToDict(bs)]));
    print(rt.showArgs([rt.V.str("t27|"), rt.isType(rt.gDictToInst(rt.gInstToDict(rt.V.object(new Empty()))), "Empty")]));
    print(rt.showArgs([rt.V.str("t28|"), rt.wrapValue(rt.attribute(rt.gDictToInst(di), "s"))]));
    {
      const _nv = rt.writeIdx(di, rt.V.stringName("k"), rt.V.int(8));
      if (_nv !== null) di = _nv;
    }
    print(rt.showArgs([rt.V.str("t29|"), rt.wrapValue(rt.attribute(b, "k")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.gDictToInst(di), "k"))]));
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
rt.registerScriptProps(__gd_d_Inner, ["k","s"], (o) => { const s = o as Inner; return [s.k, s.s]; });
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", ["k","s"], {}, (o) => { const s = o as Inner; return [s.k, s.s]; });
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

class WithInit extends rt.GdScriptObject {
  touched = rt.V.int(0);

  constructor() {
    super();
    if (!rt.bareConstruction()) {
      this.touched = rt.V.int(99);
      print(rt.showArgs([rt.V.str("SIDE")]));
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

class Acc extends rt.GdScriptObject {
  _v = rt.V.int(1);
  get v() {
    return this._v;
  }
  set v(x) {
    this._v = rt.ops.mul(x, rt.V.int(10));
  }

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Acc = rt.defineClass(Acc, () => new Acc(), (o) => o instanceof Acc);
rt.nameClass(__gd_d_Acc, "Acc");
rt.registerFieldTypes(__gd_d_Acc, {"v": "accessor"});
rt.registerScriptProps(__gd_d_Acc, ["_v","v"], (o) => { const s = o as Acc; return [s._v, s.v]; });
rt.registerDictIdentity(__gd_d_Acc, "res://main.gd", "Acc", ["_v","v"], {"v": null}, (o) => { const s = o as Acc; return [s._v, rt.V.nil()]; });
rt.registerNativeBase(__gd_d_Acc, "RefCounted");

class Box extends rt.GdScriptObject {
  plain = rt.V.nil();
  arr = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
  dic = rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]);
  leaf = rt.V.nil();

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Box = rt.defineClass(Box, () => new Box(), (o) => o instanceof Box);
rt.nameClass(__gd_d_Box, "Box");
rt.registerScriptProps(__gd_d_Box, ["plain","arr","dic","leaf"], (o) => { const s = o as Box; return [s.plain, s.arr, s.dic, s.leaf]; });
rt.registerDictIdentity(__gd_d_Box, "res://main.gd", "Box", ["plain","arr","dic","leaf"], {}, (o) => { const s = o as Box; return [s.plain, s.arr, s.dic, s.leaf]; });
rt.registerNativeBase(__gd_d_Box, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
