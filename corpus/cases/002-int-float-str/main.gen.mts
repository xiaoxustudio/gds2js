// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.strOf(rt.V.int(1))));
    print(rt.show(rt.strOf(rt.V.float(1))));
    print(rt.show(rt.strOf(rt.V.float(2.5))));
    let f = rt.V.float(3.9);
    let i = rt.toInt(f);
    print(rt.show(i));
    print(rt.show(rt.ops.div(rt.toFloat(rt.V.int(7)), rt.V.int(2))));
    print(rt.show(rt.typeOf(rt.V.int(1))), rt.show(rt.V.str(" ")), rt.show(rt.typeOf(rt.V.float(1))));
    this.quit();
  }
  
}

await new Main().run();
