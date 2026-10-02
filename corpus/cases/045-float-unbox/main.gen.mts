// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let acc = 0;
    let i = 0;
    while ((i < 5)) {
      acc = (acc + (i * 2));
      i = (i + 1);
    }
    print(rt.showArgs([rt.V.float(acc)]));
    let n = 3;
    let f = rt.toFloat(rt.V.int(n));
    print(rt.showArgs([f]));
    print(rt.showArgs([rt.V.int(rt.fast.iAddC(n, 1))]));
    print(rt.showArgs([rt.V.int(rt.fast.iAddC(2, rt.fast.iMulC(3, 4)))]));
    print(rt.showArgs([rt.V.bool((n < 4))]));
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
await __gd_entry.run();
