// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  static osv = rt.toInt(rt.V.int(1));

  static bumpOuter(): rt.Variant {
    Main.osv = rt.toInt(rt.ops.add(Main.osv, rt.V.int(1)));
    return Main.osv;
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let p = rt.V.object(new A());
    let q = rt.V.object(new A());
    print(rt.showArgs([rt.V.str("u1 "), A.x]));
    print(rt.showArgs([rt.V.str("u2 "), A.plain]));
    print(rt.showArgs([rt.V.str("u3 "), A.lit]));
    print(rt.showArgs([rt.V.str("u4 "), A.computed]));
    print(rt.showArgs([rt.V.str("u5 "), rt.method(rt.V.object(__gd_d_A), "setx", [rt.V.int(9)]), rt.V.str(" "), A.x]));
    print(rt.showArgs([rt.V.str("u6 "), rt.method(rt.V.object(__gd_d_A), "setx", [rt.V.float(2.7)]), rt.V.str(" "), A.x]));
    rt.writeProp(rt.V.object(__gd_d_A), "x", rt.V.int(100));
    print(rt.showArgs([rt.V.str("u7 "), A.x]));
    print(rt.showArgs([rt.V.str("u8 "), rt.wrapValue(rt.attribute(p, "x"))]));
    {
      const _nv = rt.writeProp(p, "x", rt.V.int(200));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("u9 "), A.x, rt.V.str(" "), rt.wrapValue(rt.attribute(p, "x")), rt.V.str(" "), rt.wrapValue(rt.attribute(q, "x"))]));
    print(rt.showArgs([rt.V.str("u10 "), rt.method(p, "fromInstance", []), rt.V.str(" "), rt.method(q, "fromInstance", [])]));
    print(rt.showArgs([rt.V.str("u11 "), rt.method(p, "setx", [rt.V.int(5)]), rt.V.str(" "), A.x]));
    print(rt.showArgs([rt.V.str("u12 "), Main.bumpOuter(), rt.V.str(" "), Main.osv]));
    print(rt.showArgs([rt.V.str("u13 "), rt.wrapValue(rt.attribute(rt.V.object(this), "osv"))]));
    print(rt.showArgs([rt.V.str("u14 "), A.x, rt.V.str(" "), rt.wrapValue(rt.attribute(p, "mv"))]));
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
rt.registerStaticVars(__gd_d_Main, {"osv": "int"}, {"osv": { get: (): rt.Variant => Main.osv, set: (__v: rt.Variant): void => { Main.osv = __v; } }});
rt.registerMethodArities(__gd_d_Main, { "bumpOuter": [0, 0], "_initialize": [0, 0] });
rt.registerStaticMethods(__gd_d_Main, ["bumpOuter"], {"bumpOuter": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Main.bumpOuter())});
rt.registerNativeBase(__gd_d_Main, "SceneTree");
class A extends rt.GdScriptObject {
  static x = rt.toInt(rt.V.int(1));
  static plain = rt.V.int(2);
  static lit = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
  static computed = rt.toInt(rt.V.int(rt.fast.iMulC(3, 7)));
  mv = rt.toInt(rt.V.int(9));

  static setx(v: rt.Variant): rt.Variant {
    A.x = rt.toInt(v);
    return A.x;
  }
  
  fromInstance(): rt.Variant {
    return A.x;
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "fromInstance": return rt.wrapValue(this.fromInstance());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_A = rt.defineClass(A, () => new A(), (o) => o instanceof A);
rt.nameClass(__gd_d_A, "A");
rt.registerFieldTypes(__gd_d_A, {"mv": "int"});
rt.registerStaticVars(__gd_d_A, {"x": "int", "plain": "", "lit": "", "computed": "int"}, {"x": { get: (): rt.Variant => A.x, set: (__v: rt.Variant): void => { A.x = __v; } }, "plain": { get: (): rt.Variant => A.plain, set: (__v: rt.Variant): void => { A.plain = __v; } }, "lit": { get: (): rt.Variant => A.lit, set: (__v: rt.Variant): void => { A.lit = __v; } }, "computed": { get: (): rt.Variant => A.computed, set: (__v: rt.Variant): void => { A.computed = __v; } }});
rt.registerMethodArities(__gd_d_A, { "setx": [1, 1], "fromInstance": [0, 0] });
rt.registerStaticMethods(__gd_d_A, ["setx"], {"setx": (a: rt.Variant[]): rt.Variant => rt.wrapValue(A.setx(a[0] as rt.Variant))});
rt.registerNativeBase(__gd_d_A, "RefCounted");

const __gd_entry = new Main();
await __gd_entry.run();
