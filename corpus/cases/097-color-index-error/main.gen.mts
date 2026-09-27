// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let c = rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]);
    print(rt.show(rt.index(c, rt.V.int(4))));
    print(rt.show(rt.V.str("不会走到这里")));
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
