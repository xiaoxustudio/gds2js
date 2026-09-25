// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let acc = 0;
    let i = 0;
    while ((i < 5)) {
      acc = (acc + (i * 2));
      i = (i + 1);
    }
    print(rt.show(rt.V.float(acc)));
    let n = 3;
    let f = rt.toFloat(rt.V.int(n));
    print(rt.show(f));
    print(rt.show(rt.V.int(rt.fast.iAddC(n, 1))));
    print(rt.show(rt.V.int(rt.fast.iAddC(2, rt.fast.iMulC(3, 4)))));
    print(rt.show(rt.V.bool((n < 4))));
    this.quit();
  }
  
}

await new Main().run();
