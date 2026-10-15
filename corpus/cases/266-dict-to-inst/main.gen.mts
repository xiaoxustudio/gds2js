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
      rt.frameLine(38);
      let i = rt.V.object(new Inner());
      rt.frameLine(39);
      let di = rt.gInstToDict(i);
      rt.frameLine(40);
      let b = rt.gDictToInst(di);
      rt.frameLine(41);
      print(rt.showArgs([rt.V.str("t01|"), rt.typeOf(b)]));
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("t02|"), rt.isType(b, "Inner")]));
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("t03|"), rt.wrapValue(rt.attribute(b, "k")), rt.V.str("|"), rt.wrapValue(rt.attribute(b, "s"))]));
      rt.frameLine(44);
      print(rt.showArgs([rt.V.str("t04|"), rt.gInstToDict(b)]));
      rt.frameLine(45);
      print(rt.showArgs([rt.V.str("t05|"), rt.V.str(rt.varToStr(rt.gInstToDict(b)))]));
      rt.frameLine(46);
      print(rt.showArgs([rt.V.str("t06|"), rt.ops.eq(b, i)]));
      rt.frameLine(47);
      print(rt.showArgs([rt.V.str("t07|"), rt.ops.eq(rt.method(b, "get_instance_id", []), rt.method(i, "get_instance_id", []))]));
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("t08|"), rt.isType(b, "RefCounted")]));
      rt.frameLine(49);
      print(rt.showArgs([rt.V.str("t09|"), rt.method(rt.gInstToDict(b), "keys", [])]));
      rt.frameLine(50);
      let w = rt.V.object(new WithInit());
      rt.frameLine(51);
      let dw = rt.gInstToDict(w);
      rt.frameLine(52);
      let w2 = rt.gDictToInst(dw);
      rt.frameLine(53);
      print(rt.showArgs([rt.V.str("t10|"), rt.wrapValue(rt.attribute(w2, "touched"))]));
      rt.frameLine(54);
      print(rt.showArgs([rt.V.str("t11|"), rt.isType(w2, "WithInit")]));
      rt.frameLine(55);
      print(rt.showArgs([rt.V.str("t12|"), rt.gInstToDict(w2)]));
      rt.frameLine(56);
      print(rt.showArgs([rt.V.str("t13|"), rt.wrapValue(rt.attribute(rt.gDictToInst(dw), "touched"))]));
      rt.frameLine(57);
      let dv = rt.gInstToDict(rt.V.object(new Derived()));
      rt.frameLine(58);
      rt.method(dv, "erase", [rt.V.stringName("b")]);
      rt.frameLine(59);
      let back = rt.gDictToInst(dv);
      rt.frameLine(60);
      print(rt.showArgs([rt.V.str("t14|"), rt.wrapValue(rt.attribute(back, "a")), rt.V.str("|"), rt.wrapValue(rt.attribute(back, "b"))]));
      rt.frameLine(61);
      print(rt.showArgs([rt.V.str("t15|"), rt.gInstToDict(back)]));
      rt.frameLine(62);
      let full = rt.V.object(new Box());
      rt.frameLine(63);
      let dfull = rt.gInstToDict(full);
      rt.frameLine(64);
      {
        const _nv = rt.writeIdx(dfull, rt.V.stringName("extra"), rt.V.int(7));
        if (_nv !== null) dfull = _nv;
      }
      rt.frameLine(65);
      let rb = rt.gDictToInst(dfull);
      rt.frameLine(66);
      print(rt.showArgs([rt.V.str("t16|"), rt.gInstToDict(rb)]));
      rt.frameLine(67);
      print(rt.showArgs([rt.V.str("t17|"), rt.ops.eq(rt.wrapValue(rt.attribute(rb, "arr")), rt.wrapValue(rt.attribute(full, "arr")))]));
      rt.frameLine(68);
      print(rt.showArgs([rt.V.str("t18|"), rt.ops.eq(rt.wrapValue(rt.attribute(rb, "dic")), rt.wrapValue(rt.attribute(full, "dic")))]));
      rt.frameLine(69);
      print(rt.showArgs([rt.V.str("t19|"), rt.wrapValue(rt.attribute(rb, "plain")), rt.V.str("|"), rt.wrapValue(rt.attribute(rb, "leaf")), rt.V.str("|"), rt.wrapValue(rt.attribute(rb, "arr")), rt.V.str("|"), rt.wrapValue(rt.attribute(rb, "dic"))]));
      rt.frameLine(70);
      let a = rt.V.object(new Acc());
      rt.frameLine(71);
      let da = rt.gInstToDict(a);
      rt.frameLine(72);
      print(rt.showArgs([rt.V.str("t20|"), da]));
      rt.frameLine(73);
      {
        const _nv = rt.writeIdx(da, rt.V.stringName("v"), rt.V.int(2));
        if (_nv !== null) da = _nv;
      }
      rt.frameLine(74);
      let ab = rt.gDictToInst(da);
      rt.frameLine(75);
      print(rt.showArgs([rt.V.str("t21|"), rt.wrapValue(rt.attribute(ab, "_v")), rt.V.str("|"), rt.wrapValue(rt.attribute(ab, "v"))]));
      rt.frameLine(76);
      print(rt.showArgs([rt.V.str("t22|"), rt.gInstToDict(ab)]));
      rt.frameLine(77);
      let da2 = rt.gInstToDict(a);
      rt.frameLine(78);
      {
        const _nv = rt.writeIdx(da2, rt.V.stringName("_v"), rt.V.int(3));
        if (_nv !== null) da2 = _nv;
      }
      rt.frameLine(79);
      let ab2 = rt.gDictToInst(da2);
      rt.frameLine(80);
      print(rt.showArgs([rt.V.str("t23|"), rt.wrapValue(rt.attribute(ab2, "_v")), rt.V.str("|"), rt.wrapValue(rt.attribute(ab2, "v"))]));
      rt.frameLine(81);
      let ds = rt.dictOf([[rt.V.str("@path"), rt.strBuiltin([rt.wrapValue(rt.index(di, rt.V.str("@path")))])], [rt.V.str("@subpath"), rt.V.str("Inner")], [rt.V.stringName("k"), rt.V.int(5)]]);
      rt.frameLine(82);
      let bs = rt.gDictToInst(ds);
      rt.frameLine(83);
      print(rt.showArgs([rt.V.str("t24|"), rt.isType(bs, "Inner")]));
      rt.frameLine(84);
      print(rt.showArgs([rt.V.str("t25|"), rt.wrapValue(rt.attribute(bs, "k")), rt.V.str("|"), rt.wrapValue(rt.attribute(bs, "s"))]));
      rt.frameLine(85);
      print(rt.showArgs([rt.V.str("t26|"), rt.gInstToDict(bs)]));
      rt.frameLine(86);
      print(rt.showArgs([rt.V.str("t27|"), rt.isType(rt.gDictToInst(rt.gInstToDict(rt.V.object(new Empty()))), "Empty")]));
      rt.frameLine(87);
      print(rt.showArgs([rt.V.str("t28|"), rt.wrapValue(rt.attribute(rt.gDictToInst(di), "s"))]));
      rt.frameLine(88);
      {
        const _nv = rt.writeIdx(di, rt.V.stringName("k"), rt.V.int(8));
        if (_nv !== null) di = _nv;
      }
      rt.frameLine(89);
      print(rt.showArgs([rt.V.str("t29|"), rt.wrapValue(rt.attribute(b, "k")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.gDictToInst(di), "k"))]));
      rt.frameLine(90);
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
  declare k: rt.Variant;
  declare s: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(4);
      this.k = rt.V.int(1);
      rt.frameLine(5);
      this.s = rt.V.str("x");
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
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerScriptProps(__gd_d_Inner, ["k","s"], (o) => { const s = o as Inner; return [s.k, s.s]; });
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", ["k","s"], {}, (o) => { const s = o as Inner; return [s.k, s.s]; });
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
      rt.frameLine(11);
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
      rt.frameLine(14);
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

class WithInit extends rt.GdScriptObject {
  declare touched: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(17);
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
        rt.frameLine(20);
        this.touched = rt.V.int(99);
        rt.frameLine(21);
        print(rt.showArgs([rt.V.str("SIDE")]));
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

class Acc extends rt.GdScriptObject {
  declare _v: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(24);
      this._v = rt.V.int(1);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  get v() {
    rt.frameLine(27);
    return this._v;
  }
  set v(x) {
    rt.frameLine(29);
    this._v = rt.ops.mul(x, rt.V.int(10));
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
rt.registerFieldTypes(__gd_d_Acc, {"v": "accessor"});
rt.registerScriptProps(__gd_d_Acc, ["_v","v"], (o) => { const s = o as Acc; return [s._v, s.v]; });
rt.registerDictIdentity(__gd_d_Acc, "res://main.gd", "Acc", ["_v","v"], {"v": null}, (o) => { const s = o as Acc; return [s._v, rt.V.nil()]; });
rt.registerNativeBase(__gd_d_Acc, "RefCounted");

class Box extends rt.GdScriptObject {
  declare plain: rt.Variant;
  declare arr: rt.Variant;
  declare dic: rt.Variant;
  declare leaf: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(32);
      this.plain = rt.V.nil();
      rt.frameLine(33);
      this.arr = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(34);
      this.dic = rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]);
      rt.frameLine(35);
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
rt.registerScriptProps(__gd_d_Box, ["plain","arr","dic","leaf"], (o) => { const s = o as Box; return [s.plain, s.arr, s.dic, s.leaf]; });
rt.registerDictIdentity(__gd_d_Box, "res://main.gd", "Box", ["plain","arr","dic","leaf"], {}, (o) => { const s = o as Box; return [s.plain, s.arr, s.dic, s.leaf]; });
rt.registerNativeBase(__gd_d_Box, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
