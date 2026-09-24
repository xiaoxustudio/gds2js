// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let b = rt.method(Base, "new", []);
    print(rt.show(rt.method(b, "tag", [])));
    print(rt.show(rt.isType(b, "Base")));
    print(rt.show(rt.attribute(b, "hp")));
    this.quit();
  }
  
}

await new Main().run();
