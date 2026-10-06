// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a: number[] = [1, 2, 3, 4, 5];
    let i = 0;
    let n = a.length;
    while ((i < rt.fast.iDivC(n, 2))) {
      let t = rt.fast.rawArrGetNum(a, i);
      rt.fast.rawArrSetNum(a, i, rt.fast.rawArrGetNum(a, rt.fast.iSubC(rt.fast.iSubC(n, 1), i)));
      rt.fast.rawArrSetNum(a, rt.fast.iSubC(rt.fast.iSubC(n, 1), i), t);
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum(a, 0))]));
    print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum(a, 4))]));
    print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum(a, 2))]));
    let g: number[][] = [[1, 2], [3, 4]];
    let r = 0;
    while ((r < 2)) {
      let c = 0;
      while ((c < 2)) {
        rt.fast.rawArrSetNum2(g, r, c, rt.fast.iAddC(rt.fast.rawArrGetNum2(g, r, c), 100));
        c = rt.fast.iAddC(c, 1);
      }
      r = rt.fast.iAddC(r, 1);
    }
    print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum2(g, 0, 0))]));
    print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum2(g, 1, 1))]));
    let s = 0;
    let k = 0;
    while ((k < 2)) {
      s = rt.fast.iAddC(s, rt.fast.iAddC(rt.fast.rawArrGetNum2(g, k, 0), rt.fast.rawArrGetNum2(g, k, 1)));
      k = rt.fast.iAddC(k, 1);
    }
    print(rt.showArgs([rt.V.int(s)]));
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
