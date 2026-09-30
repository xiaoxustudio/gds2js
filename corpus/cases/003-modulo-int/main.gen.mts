// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.showArgs([rt.V.int(rt.fast.iModC((-7), 3))]));
    print(rt.showArgs([rt.V.int(rt.fast.iModC(7, (-3)))]));
    print(rt.showArgs([rt.V.int(rt.fast.iModC(7, 3))]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
