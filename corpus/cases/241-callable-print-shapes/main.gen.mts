// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  top(a: rt.Variant): rt.Variant {
    return a;
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let o = rt.V.object(new Inner());
    let lam = rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return x;
    }, 1);
    let t = rt.methodCallable(rt.V.object(this), "top");
    print(rt.showArgs([rt.V.str("q01|"), rt.wrapValue(rt.attribute(o, "three"))]));
    print(rt.showArgs([rt.V.str("q02|"), rt.typeOf(rt.wrapValue(rt.attribute(o, "three"))), rt.V.str("|"), rt.strBuiltin([rt.V.array(rt.GArray.of([rt.wrapValue(rt.attribute(o, "three"))]))])]));
    print(rt.showArgs([rt.V.str("q03|"), rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm"))]));
    print(rt.showArgs([rt.V.str("q04|"), rt.strBuiltin([rt.V.array(rt.GArray.of([rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm"))]))])]));
    print(rt.showArgs([rt.V.str("q05|"), lam]));
    print(rt.showArgs([rt.V.str("q06|"), rt.strBuiltin([rt.V.array(rt.GArray.of([lam]))])]));
    print(rt.showArgs([rt.V.str("q07|"), rt.callableCtor([])]));
    print(rt.showArgs([rt.V.str("q08|"), rt.strBuiltin([rt.V.array(rt.GArray.of([rt.callableCtor([])]))])]));
    print(rt.showArgs([rt.V.str("q09|"), rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", [rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("q10|"), t]));
    print(rt.showArgs([rt.V.str("q11|"), rt.strBuiltin([rt.V.array(rt.GArray.of([t, lam, rt.callableCtor([])]))])]));
    print(rt.showArgs([rt.V.str("q12|"), rt.formatOf(rt.V.str("%s"), rt.wrapValue(rt.attribute(o, "three")))]));
    print(rt.showArgs([rt.V.str("q14|"), rt.globalCallable("abs")]));
    print(rt.showArgs([rt.V.str("q15|"), rt.V.str(rt.varToStr(rt.V.array(rt.GArray.of([rt.wrapValue(rt.attribute(o, "three")), lam, rt.callableCtor([]), rt.globalCallable("abs"), rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")), t]))))]));
    print(rt.showArgs([rt.V.str("q16|"), rt.method(rt.wrapValue(rt.attribute(o, "three")), "call", [rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str("|"), rt.method(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")), "call", [rt.V.int(4)])]));
    print(rt.showArgs([rt.V.str("q17|"), rt.strBuiltin([rt.wrapValue(rt.attribute(o, "three"))]), rt.V.str("|"), rt.typeOf(rt.wrapValue(rt.attribute(o, "three")))]));
    print(rt.showArgs([rt.V.str("q18|"), rt.ops.eq(rt.wrapValue(rt.attribute(o, "three")), rt.wrapValue(rt.attribute(o, "three"))), rt.V.str("|"), rt.ops.eq(rt.wrapValue(rt.attribute(o, "three")), rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm"))), rt.V.str("|"), rt.ops.eq(t, rt.methodCallable(rt.V.object(this), "top"))]));
    print(rt.showArgs([rt.V.str("q19|"), rt.method(rt.wrapValue(rt.attribute(o, "three")), "get_method", []), rt.V.str("|"), rt.typeOf(rt.method(rt.wrapValue(rt.attribute(o, "three")), "get_method", [])), rt.V.str("|"), rt.method(t, "get_method", [])]));
    print(rt.showArgs([rt.V.str("q20|"), rt.wrapValue(rt.attribute(rt.V.object(new Inner()), "three")), rt.V.str("|"), rt.ops.eq(rt.wrapValue(rt.attribute(o, "three")), rt.wrapValue(rt.attribute(rt.V.object(new Inner()), "three")))]));
    let d = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d, rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")), rt.V.int(1));
      if (_nv !== null) d = _nv;
    }
    {
      const _nv = rt.writeIdx(d, rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm")), rt.V.int(2));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([rt.V.str("r01|"), rt.method(d, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(d, rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")))), rt.V.str("|"), rt.wrapValue(rt.index(d, rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm"))))]));
    print(rt.showArgs([rt.V.str("r02|"), rt.strBuiltin([d])]));
    print(rt.showArgs([rt.V.str("r03|"), rt.method(d, "has", [rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm"))]), rt.V.str("|"), rt.method(d, "erase", [rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm"))]), rt.V.str("|"), rt.method(d, "size", [])]));
    print(rt.showArgs([rt.V.str("r04|"), rt.strBuiltin([rt.V.array(rt.GArray.of([rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")), rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm"))]))]), rt.V.str("|"), rt.ops.eq(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")), rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm")))]));
    print(rt.showArgs([rt.V.str("r05|"), rt.method(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")), "call", [rt.V.int(3)]), rt.V.str("|"), rt.method(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm")), "call", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("r06|"), rt.strBuiltin([rt.dictOf([[rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")), rt.V.int(1)], [rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm")), rt.V.int(2)]])])]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "top": return rt.wrapValue(this.top(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "top": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Inner extends rt.GdScriptObject {
  three(a: rt.Variant, b: rt.Variant, c: rt.Variant): rt.Variant {
    return rt.strBuiltin([a, b, c]);
  }
  
  static sm(a: rt.Variant): rt.Variant {
    return a;
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "three": return rt.wrapValue(this.three(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerMethodArities(__gd_d_Inner, { "three": [3, 3], "sm": [1, 1] });
rt.registerStaticMethods(__gd_d_Inner, ["sm"], {"sm": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.sm(a[0] as rt.Variant))});
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

class Cub extends rt.GdScriptObject {
  static sm(a: rt.Variant): rt.Variant {
    return rt.ops.mul(a, rt.V.int(2));
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Cub = rt.defineClass(Cub, () => new Cub(), (o) => o instanceof Cub);
rt.nameClass(__gd_d_Cub, "Cub");
rt.registerMethodArities(__gd_d_Cub, { "sm": [1, 1] });
rt.registerStaticMethods(__gd_d_Cub, ["sm"], {"sm": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Cub.sm(a[0] as rt.Variant))});
rt.registerNativeBase(__gd_d_Cub, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
