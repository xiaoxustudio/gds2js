// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let g = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    let s = 0;
    let i = 0;
    while ((i < 3)) {
      let j = 0;
      while ((j < 3)) {
        s = rt.fast.iAddC(s, rt.fast.rawArrGet2(g, i, j));
        j = rt.fast.iAddC(j, 1);
      }
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.show(rt.V.int(s)));
    print(rt.show(rt.V.int(g.length)));
    print(rt.show(rt.V.int(rt.fast.rawArrGet2(g, 2, 1))));
    let f = [[10, 20], [30, 40]];
    let n = 0;
    let r = 0;
    while ((r < f.length)) {
      n = rt.fast.iAddC(n, rt.fast.iAddC(rt.fast.rawArrGet2(f, r, 0), rt.fast.rawArrGet2(f, r, 1)));
      r = rt.fast.iAddC(r, 1);
    }
    print(rt.show(rt.V.int(n)));
    this.quit();
  }
  
}

await new Main().run();
