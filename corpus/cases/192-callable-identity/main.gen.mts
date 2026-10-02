// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let o = rt.V.object(new Thing());
    let p = rt.V.object(new Thing());
    print(rt.showArgs([rt.V.str("r1 "), rt.ops.eq(rt.wrapValue(rt.attribute(o, "add3")), rt.wrapValue(rt.attribute(o, "add3"))), rt.V.str(" "), rt.ops.eq(rt.wrapValue(rt.attribute(o, "add3")), rt.wrapValue(rt.attribute(p, "add3")))]));
    print(rt.showArgs([rt.V.str("r2 "), rt.ops.eq(rt.method(rt.wrapValue(rt.attribute(o, "add3")), "bind", [rt.V.int(1)]), rt.method(rt.wrapValue(rt.attribute(o, "add3")), "bind", [rt.V.int(2)]))]));
    print(rt.showArgs([rt.V.str("r3 "), rt.ops.eq(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Thing), "sm")), rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Thing), "sm")))]));
    let f = rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return x;
    }, 1);
    let g = rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return x;
    }, 1);
    print(rt.showArgs([rt.V.str("r4 "), rt.ops.eq(f, f), rt.V.str(" "), rt.ops.eq(f, g)]));
    let a = rt.V.array(rt.GArray.of([rt.wrapValue(rt.attribute(o, "add3")), rt.wrapValue(rt.attribute(o, "add3"))]));
    print(rt.showArgs([rt.V.str("r5 "), rt.method(a, "has", [rt.wrapValue(rt.attribute(o, "add3"))]), rt.V.str(" "), rt.method(a, "size", [])]));
    print(rt.showArgs([rt.V.str("r6 "), rt.ops.eq(rt.callableCtor([]), rt.callableCtor([])), rt.V.str(" "), rt.ops.neq(rt.callableCtor([]), rt.callableCtor([]))]));
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
class Thing extends rt.GdScriptObject {
  add3(a: rt.Variant, b: rt.Variant, c: rt.Variant): rt.Variant {
    return rt.ops.add(rt.ops.add(a, b), c);
  }
  
  static sm(x: rt.Variant): rt.Variant {
    return x;
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "add3": return rt.wrapValue(this.add3(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Thing = rt.defineClass(Thing, () => new Thing(), (o) => o instanceof Thing);
rt.nameClass(__gd_d_Thing, "Thing");
rt.registerMethodArities(__gd_d_Thing, { "add3": [3, 3], "sm": [1, 1] });
rt.registerStaticMethods(__gd_d_Thing, ["sm"], {"sm": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Thing.sm(a[0] as rt.Variant))});
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
