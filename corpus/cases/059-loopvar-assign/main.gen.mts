// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    for (let i of rt.rangeSeq([rt.V.int(3)])) {
      i = rt.fast.iAddC(i, 1);
      print(rt.showArgs([rt.V.int(i)]));
    }
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
