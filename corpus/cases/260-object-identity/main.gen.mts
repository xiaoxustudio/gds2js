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
      rt.frameLine(14);
      let a = rt.V.object(new Inner());
      rt.frameLine(15);
      let b = rt.V.object(new Inner());
      rt.frameLine(16);
      let p = rt.V.object(new Plain());
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("s01|"), a]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("s02|"), p]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("s03|"), rt.V.array(rt.GArray.of([a, b]))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("s04|"), rt.dictOf([[rt.V.str("k"), a]])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("s05|"), rt.ops.eq(a, a)]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("s06|"), rt.ops.eq(a, b)]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("s07|"), rt.ops.eq(rt.method(a, "get_instance_id", []), rt.method(a, "get_instance_id", []))]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("s08|"), rt.ops.eq(rt.method(a, "get_instance_id", []), rt.method(b, "get_instance_id", []))]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("s09|"), rt.typeOf(rt.method(a, "get_instance_id", []))]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("s10|"), rt.ops.eq(rt.gInstanceFromId(rt.method(a, "get_instance_id", [])), a)]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("s11|"), rt.gInstanceFromId(rt.method(a, "get_instance_id", []))]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("s12|"), rt.ops.eq(rt.gInstanceFromId(rt.V.int(12345)), rt.V.nil())]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("s13|"), rt.typeOf(rt.gInstanceFromId(rt.V.int(12345)))]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("s14|"), rt.gInstanceFromId(rt.V.int(12345))]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("s15|"), rt.gIsInstanceValid(a)]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("s16|"), rt.gIsInstanceValid(rt.V.object(this))]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("s17|"), rt.gIsInstanceValid(rt.V.object(__gd_d_Inner))]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("s18|"), rt.gIsInstanceValid(rt.V.nil())]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("s19|"), rt.gIsInstanceValid(rt.V.int(5))]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("s20|"), rt.gIsInstanceValid(rt.V.str("s"))]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("s21|"), rt.gIsInstanceValid(rt.vector2New([rt.V.int(1), rt.V.int(2)]))]));
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("s22|"), rt.gIsInstanceValid(rt.V.array(rt.GArray.of([rt.V.int(1)])))]));
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("s23|"), rt.gIsInstanceValid(rt.dictOf([]))]));
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("s24|"), rt.gIsInstanceValid(rt.wrapValue(rt.attribute(a, "meth")))]));
      rt.frameLine(41);
      print(rt.showArgs([rt.V.str("s25|"), rt.gIsInstanceValid(rt.wrapValue(rt.attribute(a, "fired")))]));
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("s26|"), rt.gIsInstanceValid(rt.gInstanceFromId(rt.V.int(12345)))]));
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("s27|"), rt.gIsInstanceIdValid(rt.method(a, "get_instance_id", []))]));
      rt.frameLine(44);
      print(rt.showArgs([rt.V.str("s28|"), rt.gIsInstanceIdValid(rt.V.int(12345))]));
      rt.frameLine(45);
      print(rt.showArgs([rt.V.str("s29|"), rt.gIsInstanceIdValid(rt.V.int(0))]));
      rt.frameLine(46);
      print(rt.showArgs([rt.V.str("s30|"), rt.typeOf(rt.gWeakref(a))]));
      rt.frameLine(47);
      print(rt.showArgs([rt.V.str("s31|"), rt.ops.eq(rt.method(rt.gWeakref(a), "get_ref", []), a)]));
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("s32|"), rt.method(rt.gWeakref(rt.V.nil()), "get_ref", [])]));
      rt.frameLine(49);
      print(rt.showArgs([rt.V.str("s33|"), rt.gIsInstanceValid(rt.gWeakref(a))]));
      rt.frameLine(50);
      print(rt.showArgs([rt.V.str("s34|"), rt.typeOf(rt.gWeakref(rt.V.nil()))]));
      rt.frameLine(51);
      print(rt.showArgs([rt.V.str("s35|"), rt.ops.eq(rt.gWeakref(a), rt.gWeakref(a))]));
      rt.frameLine(52);
      print(rt.showArgs([rt.V.str("s36|"), rt.nativeClass("Node")]));
      rt.frameLine(53);
      print(rt.showArgs([rt.V.str("s37|"), rt.typeOf(rt.nativeClass("Node"))]));
      rt.frameLine(54);
      print(rt.showArgs([rt.V.str("s39|"), rt.wrapValue(rt.attribute(rt.method(rt.gWeakref(a), "get_ref", []), "k"))]));
      rt.frameLine(55);
      print(rt.showArgs([rt.V.str("s40|"), rt.ops.lt(rt.method(a, "get_instance_id", []), rt.method(b, "get_instance_id", []))]));
      rt.frameLine(56);
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
class Plain extends rt.GdScriptObject {
  declare k: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(4);
      this.k = rt.V.int(1);
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
const __gd_d_Plain = rt.defineClass(Plain, () => new Plain(), (o) => o instanceof Plain);
rt.nameClass(__gd_d_Plain, "Plain");
rt.registerScriptProps(__gd_d_Plain, ["k"], (o) => { const s = o as Plain; return [s.k]; });
rt.registerDictIdentity(__gd_d_Plain, "res://main.gd", "Plain", ["k"], {}, (o) => { const s = o as Plain; return [s.k]; });
rt.registerNativeBase(__gd_d_Plain, "RefCounted");

class Inner extends rt.GdScriptObject {
  declare fired: rt.Signal;
  declare k: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(8);
      this.fired = new rt.Signal("fired");
      rt.frameLine(7);
      this.k = rt.V.int(1);
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

  meth(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "meth");
    try {
      rt.frameLine(11);
      return this.k;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "meth": return rt.wrapValue(this.meth());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerScriptProps(__gd_d_Inner, ["k"], (o) => { const s = o as Inner; return [s.k]; });
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", ["k"], {}, (o) => { const s = o as Inner; return [s.k]; });
rt.registerMethodArities(__gd_d_Inner, { "meth": [0, 0] });
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
