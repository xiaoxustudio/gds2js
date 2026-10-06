// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.V.object(new A());
    rt.method(a, "set_meta", [rt.V.str("k"), rt.V.int(5)]);
    rt.method(a, "set_meta", [rt.V.stringName("sn"), rt.V.int(6)]);
    print(rt.showArgs([rt.V.str("t1 "), rt.method(a, "has_meta", [rt.V.str("sn")]), rt.V.str(" "), rt.method(a, "get_meta", [rt.V.str("sn")])]));
    rt.method(a, "remove_meta", [rt.V.str("k")]);
    print(rt.showArgs([rt.V.str("t2 "), rt.method(a, "has_meta", [rt.V.str("k")]), rt.V.str(" "), rt.method(a, "get_meta", [rt.V.str("k"), rt.V.int(99)])]));
    print(rt.showArgs([rt.V.str("t3 "), rt.method(rt.V.object(this), "get_class", []), rt.V.str(" | "), rt.method(a, "get_class", [])]));
    print(rt.showArgs([rt.V.str("t4 "), rt.method(a, "has_method", [rt.V.str("sm")]), rt.V.str(" "), rt.method(a, "has_method", [rt.V.str("get_class")])]));
    print(rt.showArgs([rt.V.str("t5 "), rt.method(rt.V.object(this), "has_method", [rt.V.str("_initialize")]), rt.V.str(" "), rt.method(rt.V.object(this), "has_method", [rt.V.str("print")])]));
    print(rt.showArgs([rt.V.str("t6 "), rt.method(a, "has_method", [rt.V.str("")])]));
    rt.method(a, "set_meta", [rt.V.str("k"), rt.V.int(8)]);
    print(rt.showArgs([rt.V.str("t7 "), rt.method(a, "get_meta", [rt.V.str("k")]), rt.V.str(" "), rt.method(a, "get_meta", [rt.V.str("nope"), rt.V.str("dflt")])]));
    print(rt.showArgs([rt.V.str("t8 "), rt.typeOf(rt.method(a, "get_meta", [rt.V.str("nope"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]))]));
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
class A extends rt.GdScriptObject {
  im(): rt.Variant {
    return rt.V.int(1);
  }
  
  static sm(): rt.Variant {
    return rt.V.int(2);
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "im": return rt.wrapValue(this.im());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_A = rt.defineClass(A, () => new A(), (o) => o instanceof A);
rt.nameClass(__gd_d_A, "A");
rt.registerMethodArities(__gd_d_A, { "im": [0, 0], "sm": [0, 0] });
rt.registerStaticMethods(__gd_d_A, ["sm"], {"sm": (a: rt.Variant[]): rt.Variant => rt.wrapValue(A.sm())});
rt.registerNativeBase(__gd_d_A, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
