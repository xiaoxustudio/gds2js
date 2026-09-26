// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let v = rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
    print(rt.show(rt.attribute(v, "x")));
    print(rt.show(rt.index(v, rt.V.int(2))));
    print(rt.show(rt.index(v, rt.V.int(3))));
    this.quit();
  }
  
}

await new Main().run();
