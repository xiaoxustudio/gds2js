// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let cb = rt.callableCtor([]);
    print(rt.showArgs([rt.V.str("r1 "), rt.typeOf(cb), rt.V.str(" "), rt.method(cb, "is_null", []), rt.V.str(" "), rt.method(cb, "is_valid", [])]));
    print(rt.showArgs([rt.V.str("r2 "), rt.ops.eq(rt.method(cb, "get_method", []), rt.V.str("")), rt.V.str(" "), rt.method(cb, "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(cb, "get_bound_arguments", []), "size", [])]));
    print(rt.showArgs([rt.V.str("r3 "), rt.typeOf(rt.method(cb, "callv", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))])), rt.V.str(" "), rt.ops.eq(rt.method(cb, "callv", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]), rt.V.nil())]));
    let b = rt.method(cb, "bind", [rt.V.int(1)]);
    print(rt.showArgs([rt.V.str("r4 "), rt.typeOf(b), rt.V.str(" "), rt.method(b, "is_null", [])]));
    let f = rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return x;
    }, 1);
    print(rt.showArgs([rt.V.str("r5 "), rt.method(f, "is_null", []), rt.V.str(" "), rt.method(f, "is_valid", []), rt.V.str(" "), rt.method(f, "get_method", [])]));
    let o = rt.V.object(new Thing());
    let im = rt.wrapValue(rt.attribute(o, "hi"));
    print(rt.showArgs([rt.V.str("r6 "), rt.method(im, "is_null", []), rt.V.str(" "), rt.method(im, "is_valid", []), rt.V.str(" "), rt.method(im, "get_method", []), rt.V.str(" "), rt.method(im, "call", [rt.V.int(7)])]));
    print(rt.showArgs([rt.V.str("r7 "), rt.typeOf(rt.callableCtor([o, rt.V.str("hi")])), rt.V.str(" "), rt.method(rt.callableCtor([o, rt.V.str("hi")]), "get_method", []), rt.V.str(" "), rt.method(rt.callableCtor([o, rt.V.str("hi")]), "call", [rt.V.int(8)])]));
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
class Thing extends rt.GdScriptObject {
  hi(a: rt.Variant): rt.Variant {
    return a;
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "hi": return rt.wrapValue(this.hi(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Thing = rt.defineClass(Thing, () => new Thing(), (o) => o instanceof Thing);
rt.nameClass(__gd_d_Thing, "Thing");
rt.registerMethodArities(__gd_d_Thing, { "hi": [1, 1] });
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
