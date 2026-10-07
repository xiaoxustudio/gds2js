// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.V.object(new Inner());
    let b = rt.V.object(new Inner());
    let p = rt.V.object(new Plain());
    print(rt.showArgs([rt.V.str("s01|"), a]));
    print(rt.showArgs([rt.V.str("s02|"), p]));
    print(rt.showArgs([rt.V.str("s03|"), rt.V.array(rt.GArray.of([a, b]))]));
    print(rt.showArgs([rt.V.str("s04|"), rt.dictOf([[rt.V.str("k"), a]])]));
    print(rt.showArgs([rt.V.str("s05|"), rt.ops.eq(a, a)]));
    print(rt.showArgs([rt.V.str("s06|"), rt.ops.eq(a, b)]));
    print(rt.showArgs([rt.V.str("s07|"), rt.ops.eq(rt.method(a, "get_instance_id", []), rt.method(a, "get_instance_id", []))]));
    print(rt.showArgs([rt.V.str("s08|"), rt.ops.eq(rt.method(a, "get_instance_id", []), rt.method(b, "get_instance_id", []))]));
    print(rt.showArgs([rt.V.str("s09|"), rt.typeOf(rt.method(a, "get_instance_id", []))]));
    print(rt.showArgs([rt.V.str("s10|"), rt.ops.eq(rt.gInstanceFromId(rt.method(a, "get_instance_id", [])), a)]));
    print(rt.showArgs([rt.V.str("s11|"), rt.gInstanceFromId(rt.method(a, "get_instance_id", []))]));
    print(rt.showArgs([rt.V.str("s12|"), rt.ops.eq(rt.gInstanceFromId(rt.V.int(12345)), rt.V.nil())]));
    print(rt.showArgs([rt.V.str("s13|"), rt.typeOf(rt.gInstanceFromId(rt.V.int(12345)))]));
    print(rt.showArgs([rt.V.str("s14|"), rt.gInstanceFromId(rt.V.int(12345))]));
    print(rt.showArgs([rt.V.str("s15|"), rt.gIsInstanceValid(a)]));
    print(rt.showArgs([rt.V.str("s16|"), rt.gIsInstanceValid(rt.V.object(this))]));
    print(rt.showArgs([rt.V.str("s17|"), rt.gIsInstanceValid(rt.V.object(__gd_d_Inner))]));
    print(rt.showArgs([rt.V.str("s18|"), rt.gIsInstanceValid(rt.V.nil())]));
    print(rt.showArgs([rt.V.str("s19|"), rt.gIsInstanceValid(rt.V.int(5))]));
    print(rt.showArgs([rt.V.str("s20|"), rt.gIsInstanceValid(rt.V.str("s"))]));
    print(rt.showArgs([rt.V.str("s21|"), rt.gIsInstanceValid(rt.vector2New([rt.V.int(1), rt.V.int(2)]))]));
    print(rt.showArgs([rt.V.str("s22|"), rt.gIsInstanceValid(rt.V.array(rt.GArray.of([rt.V.int(1)])))]));
    print(rt.showArgs([rt.V.str("s23|"), rt.gIsInstanceValid(rt.dictOf([]))]));
    print(rt.showArgs([rt.V.str("s24|"), rt.gIsInstanceValid(rt.wrapValue(rt.attribute(a, "meth")))]));
    print(rt.showArgs([rt.V.str("s25|"), rt.gIsInstanceValid(rt.wrapValue(rt.attribute(a, "fired")))]));
    print(rt.showArgs([rt.V.str("s26|"), rt.gIsInstanceValid(rt.gInstanceFromId(rt.V.int(12345)))]));
    print(rt.showArgs([rt.V.str("s27|"), rt.gIsInstanceIdValid(rt.method(a, "get_instance_id", []))]));
    print(rt.showArgs([rt.V.str("s28|"), rt.gIsInstanceIdValid(rt.V.int(12345))]));
    print(rt.showArgs([rt.V.str("s29|"), rt.gIsInstanceIdValid(rt.V.int(0))]));
    print(rt.showArgs([rt.V.str("s30|"), rt.typeOf(rt.gWeakref(a))]));
    print(rt.showArgs([rt.V.str("s31|"), rt.ops.eq(rt.method(rt.gWeakref(a), "get_ref", []), a)]));
    print(rt.showArgs([rt.V.str("s32|"), rt.method(rt.gWeakref(rt.V.nil()), "get_ref", [])]));
    print(rt.showArgs([rt.V.str("s33|"), rt.gIsInstanceValid(rt.gWeakref(a))]));
    print(rt.showArgs([rt.V.str("s34|"), rt.typeOf(rt.gWeakref(rt.V.nil()))]));
    print(rt.showArgs([rt.V.str("s35|"), rt.ops.eq(rt.gWeakref(a), rt.gWeakref(a))]));
    print(rt.showArgs([rt.V.str("s36|"), rt.nativeClass("Node")]));
    print(rt.showArgs([rt.V.str("s37|"), rt.typeOf(rt.nativeClass("Node"))]));
    print(rt.showArgs([rt.V.str("s39|"), rt.wrapValue(rt.attribute(rt.method(rt.gWeakref(a), "get_ref", []), "k"))]));
    print(rt.showArgs([rt.V.str("s40|"), rt.ops.lt(rt.method(a, "get_instance_id", []), rt.method(b, "get_instance_id", []))]));
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
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Plain extends rt.GdScriptObject {
  k = rt.V.int(1);

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Plain = rt.defineClass(Plain, () => new Plain(), (o) => o instanceof Plain);
rt.nameClass(__gd_d_Plain, "Plain");
rt.registerScriptProps(__gd_d_Plain, ["k"]);
rt.registerNativeBase(__gd_d_Plain, "RefCounted");

class Inner extends rt.GdScriptObject {
  fired = new rt.Signal("fired");
  k = rt.V.int(1);

  meth(): rt.Variant {
    return this.k;
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
rt.registerScriptProps(__gd_d_Inner, ["k"]);
rt.registerMethodArities(__gd_d_Inner, { "meth": [0, 0] });
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
