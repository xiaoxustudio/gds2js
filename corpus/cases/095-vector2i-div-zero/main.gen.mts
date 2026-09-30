// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let w = rt.vector2iNew([rt.V.int(7), rt.V.int(7)]);
    print(rt.showArgs([rt.index(w, rt.V.int(1))]));
    print(rt.showArgs([rt.ops.div(w, rt.V.int(0))]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
