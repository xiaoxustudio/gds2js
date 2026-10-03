// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

const TAU = rt.V.float(6.283185307179586);

export class Main extends SceneTree {
  PI = rt.V.int(1);
  static PI = rt.V.int(1);

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("r1 "), Main.PI, rt.V.str(" "), rt.typeOf(Main.PI)]));
    print(rt.showArgs([rt.V.str("r2 "), Thing.PIISH, rt.V.str(" "), rt.method(rt.V.object(__gd_d_Thing), "sm", [])]));
    print(rt.showArgs([rt.V.str("r3 "), TAU, rt.V.str(" "), rt.typeOf(TAU)]));
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
  PIISH = Main.PI;
  static PIISH = Main.PI;

  static sm(): rt.Variant {
    return TAU;
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Thing = rt.defineClass(Thing, () => new Thing(), (o) => o instanceof Thing);
rt.nameClass(__gd_d_Thing, "Thing");
rt.registerMethodArities(__gd_d_Thing, { "sm": [0, 0] });
rt.registerStaticMethods(__gd_d_Thing, ["sm"], {"sm": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Thing.sm())});
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
