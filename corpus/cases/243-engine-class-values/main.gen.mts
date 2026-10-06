// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("n01|"), rt.typeOf(rt.nativeClass("Node")), rt.V.str("|"), rt.typeOf(rt.nativeClass("Label")), rt.V.str("|"), rt.typeOf(rt.nativeClass("Object"))]));
    print(rt.showArgs([rt.V.str("n02|"), rt.ops.eq(rt.nativeClass("Node"), rt.nativeClass("Node")), rt.V.str("|"), rt.ops.eq(rt.nativeClass("Node"), rt.nativeClass("Label")), rt.V.str("|"), rt.ops.eq(rt.typeOf(rt.nativeClass("Node")), rt.V.int(24))]));
    let k = rt.nativeClass("Node");
    print(rt.showArgs([rt.V.str("n03|"), rt.ops.eq(k, rt.nativeClass("Node")), rt.V.str("|"), rt.ops.eq(k, rt.nativeClass("Label")), rt.V.str("|"), rt.typeOf(k)]));
    let d = rt.dictOf([[rt.nativeClass("Node"), rt.V.int(1)], [rt.nativeClass("Label"), rt.V.int(2)]]);
    print(rt.showArgs([rt.V.str("n04|"), rt.method(d, "size", []), rt.V.str("|"), rt.method(d, "has", [rt.nativeClass("Node")]), rt.V.str("|"), rt.wrapValue(rt.index(d, rt.nativeClass("Node"))), rt.V.str("|"), rt.wrapValue(rt.index(d, rt.nativeClass("Label")))]));
    print(rt.showArgs([rt.V.str("n05|"), rt.method(d, "has", [k])]));
    let arr = rt.V.array(rt.GArray.of([rt.nativeClass("Node"), rt.nativeClass("Label"), rt.nativeClass("Node")]));
    print(rt.showArgs([rt.V.str("n06|"), rt.method(arr, "size", []), rt.V.str("|"), rt.method(arr, "has", [rt.nativeClass("Label")]), rt.V.str("|"), rt.method(arr, "count", [rt.nativeClass("Node")])]));
    print(rt.showArgs([rt.V.str("n07|"), rt.ops.eq(rt.nativeClass("GDScript"), rt.nativeClass("Node")), rt.V.str("|"), rt.typeOf(rt.nativeClass("GDScript"))]));
    print(rt.showArgs([rt.V.str("n08|"), rt.ops.eq(rt.method(rt.V.object(new Inner()), "v", []), rt.nativeClass("Node"))]));
    let res = rt.nativeClass("Resource");
    print(rt.showArgs([rt.V.str("n09|"), rt.ops.eq(res, rt.nativeClass("Resource")), rt.V.str("|"), rt.typeOf(res)]));
    print(rt.showArgs([rt.V.str("n10|"), rt.ops.neq(rt.nativeClass("Node"), rt.nativeClass("Label")), rt.V.str("|"), rt.method(rt.V.array(rt.GArray.of([rt.nativeClass("Node")])), "size", [])]));
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
class Inner extends rt.GdScriptObject {
  v(): rt.Variant {
    return rt.nativeClass("Node");
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "v": return rt.wrapValue(this.v());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerMethodArities(__gd_d_Inner, { "v": [0, 0] });
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
