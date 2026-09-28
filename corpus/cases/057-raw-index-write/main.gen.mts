// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let a = [1, 2, 3, 4, 5];
    let i = 0;
    let n = a.length;
    while ((i < rt.fast.iDivC(n, 2))) {
      let t = rt.fast.rawArrGet(a, i);
      rt.fast.rawArrSet(a, i, rt.fast.rawArrGet(a, rt.fast.iSubC(rt.fast.iSubC(n, 1), i)));
      rt.fast.rawArrSet(a, rt.fast.iSubC(rt.fast.iSubC(n, 1), i), t);
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.show(rt.V.int(rt.fast.rawArrGet(a, 0))));
    print(rt.show(rt.V.int(rt.fast.rawArrGet(a, 4))));
    print(rt.show(rt.V.int(rt.fast.rawArrGet(a, 2))));
    let g = [[1, 2], [3, 4]];
    let r = 0;
    while ((r < 2)) {
      let c = 0;
      while ((c < 2)) {
        rt.fast.rawArrSet2(g, r, c, rt.fast.iAddC(rt.fast.rawArrGet2(g, r, c), 100));
        c = rt.fast.iAddC(c, 1);
      }
      r = rt.fast.iAddC(r, 1);
    }
    print(rt.show(rt.V.int(rt.fast.rawArrGet2(g, 0, 0))));
    print(rt.show(rt.V.int(rt.fast.rawArrGet2(g, 1, 1))));
    let s = 0;
    let k = 0;
    while ((k < 2)) {
      s = rt.fast.iAddC(s, rt.fast.iAddC(rt.fast.rawArrGet2(g, k, 0), rt.fast.rawArrGet2(g, k, 1)));
      k = rt.fast.iAddC(k, 1);
    }
    print(rt.show(rt.V.int(s)));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
