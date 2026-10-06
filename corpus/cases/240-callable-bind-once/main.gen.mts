// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let o = rt.V.object(new Base());
    let lam = rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.add(x, rt.V.int(1));
    }, 1);
    print(rt.showArgs([rt.V.str("b01|"), rt.ops.eq(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", []), rt.wrapValue(rt.attribute(o, "three"))), rt.V.str("|"), rt.ops.eq(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", []), rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", []))]));
    print(rt.showArgs([rt.V.str("b02|"), rt.ops.eq(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", [rt.V.int(1)]), rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", [rt.V.int(2)])), rt.V.str("|"), rt.ops.eq(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", [rt.V.int(1)]), rt.wrapValue(rt.attribute(o, "three")))]));
    print(rt.showArgs([rt.V.str("b03|"), rt.ops.eq(rt.method(rt.globalCallable("abs"), "bind", []), rt.globalCallable("abs")), rt.V.str("|"), rt.ops.eq(rt.method(rt.globalCallable("abs"), "bind", []), rt.method(rt.globalCallable("abs"), "bind", []))]));
    print(rt.showArgs([rt.V.str("b04|"), rt.ops.eq(rt.method(rt.globalCallable("abs"), "bind", []), rt.callableCtor([])), rt.V.str("|"), rt.ops.eq(rt.globalCallable("abs"), rt.callableCtor([]))]));
    print(rt.showArgs([rt.V.str("b05|"), rt.ops.eq(rt.method(lam, "bind", []), lam), rt.V.str("|"), rt.ops.eq(lam, lam)]));
    print(rt.showArgs([rt.V.str("b06|"), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", []), "get_bound_arguments", []), rt.V.str("|"), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", []), "get_bound_arguments_count", [])]));
    print(rt.showArgs([rt.V.str("b07|"), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", []), "is_null", []), rt.V.str("|"), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", []), "is_valid", [])]));
    print(rt.showArgs([rt.V.str("b08|"), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", []), "call", [rt.V.int(1), rt.V.int(2), rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("b09|"), rt.ops.eq(rt.method(rt.wrapValue(rt.attribute(o, "stwo")), "bind", []), rt.wrapValue(rt.attribute(o, "stwo"))), rt.V.str("|"), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "stwo")), "bind", []), "call", [rt.V.int(1), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("b10|"), rt.method(rt.dictOf([[rt.wrapValue(rt.attribute(o, "three")), rt.V.int(1)]]), "has", [rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", [])]), rt.V.str("|"), rt.method(rt.dictOf([[rt.wrapValue(rt.attribute(o, "three")), rt.V.int(1)]]), "has", [rt.wrapValue(rt.attribute(o, "three"))])]));
    print(rt.showArgs([rt.V.str("b11|"), rt.method(rt.dictOf([[rt.globalCallable("abs"), rt.V.int(1)]]), "has", [rt.method(rt.globalCallable("abs"), "bind", [])]), rt.V.str("|"), rt.method(rt.dictOf([[rt.globalCallable("abs"), rt.V.int(1)]]), "has", [rt.method(rt.globalCallable("abs"), "bind", [rt.V.int(1)])])]));
    print(rt.showArgs([rt.V.str("b12|"), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", []), "callv", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))]), rt.V.str("|"), rt.method(rt.method(rt.globalCallable("abs"), "bind", []), "call", [rt.V.int((-7))])]));
    print(rt.showArgs([rt.V.str("b13|"), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", []), "get_method", []), rt.V.str("|"), rt.typeOf(rt.method(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", []), "get_method", []))]));
    print(rt.showArgs([rt.V.str("b14|"), rt.method(rt.globalCallable("abs"), "get_method", []), rt.V.str("|"), rt.typeOf(rt.method(rt.globalCallable("abs"), "get_method", [])), rt.V.str("|"), rt.ops.eq(rt.method(rt.globalCallable("abs"), "get_method", []), rt.V.stringName("abs"))]));
    print(rt.showArgs([rt.V.str("b15|"), rt.method(lam, "get_method", []), rt.V.str("|"), rt.typeOf(rt.method(lam, "get_method", []))]));
    print(rt.showArgs([rt.V.str("b16|"), rt.method(rt.callableCtor([]), "get_method", []), rt.V.str("|"), rt.typeOf(rt.method(rt.callableCtor([]), "get_method", [])), rt.V.str("|"), rt.ops.eq(rt.method(rt.callableCtor([]), "get_method", []), rt.V.str(""))]));
    print(rt.showArgs([rt.V.str("b17|"), rt.method(rt.wrapValue(rt.attribute(o, "three")), "get_method", []), rt.V.str("|"), rt.typeOf(rt.method(rt.wrapValue(rt.attribute(o, "three")), "get_method", []))]));
    print(rt.showArgs([rt.V.str("b18|"), rt.method(rt.globalCallable("len"), "get_method", []), rt.V.str("|"), rt.typeOf(rt.method(rt.globalCallable("len"), "get_method", []))]));
    print(rt.showArgs([rt.V.str("b19|"), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", []), "get_argument_count", []), rt.V.str("|"), rt.method(rt.globalCallable("abs"), "get_argument_count", []), rt.V.str("|"), rt.method(lam, "get_argument_count", [])]));
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
class Base extends rt.GdScriptObject {
  three(a: rt.Variant, b: rt.Variant, c: rt.Variant): rt.Variant {
    return rt.strBuiltin([a, b, c]);
  }
  
  static stwo(a: rt.Variant, b: rt.Variant): rt.Variant {
    return rt.strBuiltin([a, b]);
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "three": return rt.wrapValue(this.three(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Base = rt.defineClass(Base, () => new Base(), (o) => o instanceof Base);
rt.nameClass(__gd_d_Base, "Base");
rt.registerMethodArities(__gd_d_Base, { "three": [3, 3], "stwo": [2, 2] });
rt.registerStaticMethods(__gd_d_Base, ["stwo"], {"stwo": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Base.stwo(a[0] as rt.Variant, a[1] as rt.Variant))});
rt.registerNativeBase(__gd_d_Base, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
