// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.showArgs([rt.strOf(rt.V.int(1))]));
    print(rt.showArgs([rt.strOf(rt.V.float(1))]));
    print(rt.showArgs([rt.strOf(rt.V.float(2.5))]));
    let f = 3.9;
    let i = rt.toInt(rt.V.float(f));
    print(rt.showArgs([i]));
    print(rt.showArgs([rt.ops.div(rt.toFloat(rt.V.int(7)), rt.V.int(2))]));
    print(rt.showArgs([rt.typeOf(rt.V.int(1)), rt.V.str(" "), rt.typeOf(rt.V.float(1))]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
