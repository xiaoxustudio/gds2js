// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let neg = rt.V.float((-0));
    print(rt.show(neg));
    print(rt.show(rt.ops.div(rt.V.float(1), neg)));
    print(rt.show(rt.ops.div(rt.V.float((-1)), neg)));
    let pos = 5;
    pos = (pos - pos);
    print(rt.show(rt.V.float(pos)));
    print(rt.show(rt.V.float((1 / pos))));
    print(rt.show(rt.V.float(((-1) / pos))));
    print(rt.show(rt.ops.eq(neg, rt.V.float(pos))));
    print(rt.show(rt.ops.lt(neg, rt.V.float(pos))));
    this.quit();
  }
  
}

await new Main().run();
