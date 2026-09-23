// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.ops.inOp(rt.V.int(2), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])))));
    print(rt.show(rt.ops.inOp(rt.V.str("e"), rt.V.str("hello"))));
    print(rt.show(rt.ops.inOp(rt.V.str("k"), rt.dictOf([[rt.V.str("k"), rt.V.int(1)]]))));
    print(rt.show(rt.ops.inOp(rt.V.int(9), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])))));
    this.quit();
  }
  
}

await new Main().run();
