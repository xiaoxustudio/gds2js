// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let g: number[][] = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    let s = 0;
    let i = 0;
    while ((i < 3)) {
      let j = 0;
      while ((j < 3)) {
        s = rt.fast.iAddC(s, rt.fast.rawArrGetNum2(g, i, j));
        j = rt.fast.iAddC(j, 1);
      }
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.showArgs([rt.V.int(s)]));
    print(rt.showArgs([rt.V.int(g.length)]));
    print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum2(g, 2, 1))]));
    let f: number[][] = [[10, 20], [30, 40]];
    let n = 0;
    let r = 0;
    while ((r < f.length)) {
      n = rt.fast.iAddC(n, rt.fast.iAddC(rt.fast.rawArrGetNum2(f, r, 0), rt.fast.rawArrGetNum2(f, r, 1)));
      r = rt.fast.iAddC(r, 1);
    }
    print(rt.showArgs([rt.V.int(n)]));
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
