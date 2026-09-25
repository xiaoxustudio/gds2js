// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.ops.mod(rt.ops.neg(rt.V.int(7)), rt.V.int(3))));
    print(rt.show(rt.ops.mod(rt.V.int(7), rt.ops.neg(rt.V.int(3)))));
    print(rt.show(rt.V.int(rt.fast.iModC(7, 3))));
    this.quit();
  }
  
}

await new Main().run();
