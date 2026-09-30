// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.showArgs([rt.ops.shl(rt.V.int(1), rt.V.int(62))]));
    print(rt.showArgs([rt.ops.band(rt.V.int(255), rt.V.int(15))]));
    print(rt.showArgs([rt.ops.bnot(rt.V.int(5))]));
    print(rt.showArgs([rt.ops.shr(rt.V.int(8), rt.V.int(1))]));
    print(rt.showArgs([rt.ops.bor(rt.V.int(6), rt.V.int(9))]));
    print(rt.showArgs([rt.ops.bxor(rt.V.int(6), rt.V.int(9))]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
