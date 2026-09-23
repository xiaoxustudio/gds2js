// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.strOf(rt.ops.div(rt.V.float(0), rt.V.float(0)))));
    print(rt.show(rt.ops.div(rt.V.float(1), rt.V.float(0))));
    print(rt.show(rt.ops.div(rt.ops.neg(rt.V.float(1)), rt.V.float(0))));
    print(rt.show(rt.strOf(rt.sqrt(rt.ops.neg(rt.V.float(1))))));
    this.quit();
  }
  
}

await new Main().run();
