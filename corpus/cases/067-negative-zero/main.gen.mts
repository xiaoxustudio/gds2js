// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let neg = rt.V.float((-0));
    print(rt.showArgs([neg]));
    print(rt.showArgs([rt.ops.div(rt.V.float(1), neg)]));
    print(rt.showArgs([rt.ops.div(rt.V.float((-1)), neg)]));
    let pos = 5;
    pos = (pos - pos);
    print(rt.showArgs([rt.V.float(pos)]));
    print(rt.showArgs([rt.V.float((1 / pos))]));
    print(rt.showArgs([rt.V.float(((-1) / pos))]));
    print(rt.showArgs([rt.ops.eq(neg, rt.V.float(pos))]));
    print(rt.showArgs([rt.ops.lt(neg, rt.V.float(pos))]));
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
