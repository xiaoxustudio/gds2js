// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.V.int(rt.fast.iDivC(5, 2))));
    print(rt.show(rt.V.int(rt.fast.iDivC((-5), 2))));
    print(rt.show(rt.ops.div(rt.V.int(5), rt.V.float(2))));
    print(rt.show(rt.ops.div(rt.V.float(7), rt.V.int(2))));
    print(rt.show(rt.V.int(rt.fast.iDivC((-7), 2))));
    this.quit();
  }
  
}

await new Main().run();
