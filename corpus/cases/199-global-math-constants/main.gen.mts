// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);
const PI = rt.V.float(3.141592653589793);
const TAU = rt.V.float(6.283185307179586);

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("r1 "), rt.typeOf(PI), rt.V.str(" "), PI, rt.V.str(" "), TAU]));
    print(rt.showArgs([rt.V.str("r2 "), rt.typeOf(INF), rt.V.str(" "), INF, rt.V.str(" "), NAN]));
    print(rt.showArgs([rt.V.str("r3 "), rt.ops.eq(PI, rt.V.float(3.141592653589793)), rt.V.str(" "), rt.ops.eq(PI, rt.V.float(3.14159265358979))]));
    print(rt.showArgs([rt.V.str("r4 "), rt.ops.eq(TAU, rt.ops.mul(PI, rt.V.float(2))), rt.V.str(" "), rt.ops.gt(INF, rt.V.float(1e+308)), rt.V.str(" "), rt.ops.eq(NAN, NAN)]));
    print(rt.showArgs([rt.V.str("r5 "), rt.V.array(rt.GArray.of([PI, TAU, INF, NAN]))]));
    print(rt.showArgs([rt.V.str("r6 "), rt.ops.neg(PI), rt.V.str(" "), rt.ops.neg(INF), rt.V.str(" "), rt.ops.sub(INF, INF), rt.V.str(" "), rt.ops.div(rt.V.float(1), INF)]));
    let a = rt.toInt(PI);
    let b = rt.toInt(TAU);
    print(rt.showArgs([rt.V.str("r7 "), a, rt.V.str(" "), b]));
    let p = PI;
    print(rt.showArgs([rt.V.str("r8 "), rt.typeOf(p), rt.V.str(" "), rt.ops.div(p, rt.V.float(2))]));
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
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
