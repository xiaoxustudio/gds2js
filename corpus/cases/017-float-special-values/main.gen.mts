// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.strOf(rt.V.float((0 / 0)))));
    print(rt.show(rt.V.float((1 / 0))));
    print(rt.show(rt.V.float(((-1) / 0))));
    print(rt.show(rt.strOf(rt.sqrt(rt.V.float((-1))))));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
