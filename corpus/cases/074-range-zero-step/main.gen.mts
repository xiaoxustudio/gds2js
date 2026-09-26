// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.V.array(rt.range([rt.V.int(0), rt.V.int(1), rt.V.float(0)]))));
    this.quit();
  }
  
}

await new Main().run();
