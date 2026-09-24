// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.ops.add(rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2)])))));
    print(rt.show(rt.ops.add(rt.V.str("a"), rt.V.str("b"))));
    print(rt.show(rt.ops.add(rt.vector2(rt.num(rt.V.int(1)), rt.num(rt.V.int(2))), rt.vector2(rt.num(rt.V.int(3)), rt.num(rt.V.int(4))))));
    print(rt.show(rt.ops.add(rt.V.int(1), rt.V.float(2.5))));
    this.quit();
  }
  
}

await new Main().run();
