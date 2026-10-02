// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);
const PI = rt.V.float(3.141592653589793);
const TAU = rt.V.float(6.283185307179586);

export class Main extends SceneTree {
  TWO_PI = rt.ops.mul(PI, rt.V.float(2));
  static TWO_PI = rt.ops.mul(PI, rt.V.float(2));

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let d = rt.dictOf([[PI, rt.V.int(1)], [INF, rt.V.int(2)], [NAN, rt.V.int(3)]]);
    print(rt.showArgs([rt.V.str("r1 "), rt.method(d, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(d, PI))]));
    print(rt.showArgs([rt.V.str("r2 "), Main.TWO_PI, rt.V.str(" "), rt.typeOf(Main.TWO_PI)]));
    let arr = rt.stampArray(rt.V.array(rt.GArray.of([PI, TAU])), "float", true);
    print(rt.showArgs([rt.V.str("r3 "), arr, rt.V.str(" "), rt.method(arr, "size", [])]));
    print(rt.showArgs([rt.V.str("r4 "), rt.ops.add(rt.V.str("pi="), rt.strBuiltin([PI])), rt.V.str(" "), rt.ops.lt(PI, rt.V.float(3.2))]));
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
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
