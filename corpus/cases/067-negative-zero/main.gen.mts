// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let neg = rt.V.float((-0));
    print(rt.showArgs([neg]));
    print(rt.showArgs([rt.ops.div(rt.V.float(1), neg)]));
    print(rt.showArgs([rt.ops.div(rt.V.float((-1)), neg)]));
    let pos = 5;
    pos = (pos - pos);
    print(rt.showArgs([rt.V.float(pos)]));
    print(rt.showArgs([rt.V.float((1 / pos))]));
    print(rt.showArgs([rt.V.float(((-1) / pos))]));
    print(rt.showArgs([rt.ops.eq(neg, rt.V.float(pos))]));
    print(rt.showArgs([rt.ops.lt(neg, rt.V.float(pos))]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
