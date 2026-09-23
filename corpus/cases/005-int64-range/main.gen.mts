// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.V.int(9223372036854776000)));
    print(rt.show(rt.ops.neg(rt.V.int(9223372036854776000))));
    print(rt.show(rt.ops.add(rt.V.int(9223372036854776000), rt.V.int(1))));
    this.quit();
  }
  
}

await new Main().run();
