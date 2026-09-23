// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let d1 = rt.dictOf([[rt.V.str("x"), rt.V.int(1)]]);
    let d2 = d1;
    rt.setIndex(d2, rt.V.str("y"), rt.V.int(2));
    print(rt.show(d1));
    print(rt.show(rt.method(d2, "size", [])));
    this.quit();
  }
  
}

await new Main().run();
