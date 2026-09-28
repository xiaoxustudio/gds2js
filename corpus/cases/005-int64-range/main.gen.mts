// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.showArgs([rt.V.int(9223372036854775807n)]));
    print(rt.showArgs([rt.ops.neg(rt.V.int(9223372036854775808n))]));
    print(rt.showArgs([rt.ops.add(rt.V.int(9223372036854775806n), rt.V.int(1))]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
