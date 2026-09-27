// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let a = 7;
    let b = 2;
    print(rt.show(rt.V.int(rt.fast.iDivC(a, b))));
    print(rt.show(rt.V.int(rt.fast.iModC(a, b))));
    let n = 0;
    n = rt.fast.iSubC(n, 7);
    print(rt.show(rt.V.int(rt.fast.iDivC(n, 2))));
    print(rt.show(rt.V.int(rt.fast.iModC(n, 2))));
    print(rt.show(rt.V.int(rt.fast.iModC(7, (-2)))));
    print(rt.show(rt.ops.div(rt.V.int(7), rt.V.float(0.5))));
    this.quit();
  }
  
}

await new Main().run();
