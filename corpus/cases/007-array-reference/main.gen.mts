// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
    let b = a;
    rt.method(b, "append", [rt.V.int(3)]);
    print(rt.show(a));
    print(rt.show(b));
    print(rt.show(rt.ops.eq(a, b)));
    let c = rt.method(a, "duplicate", []);
    rt.method(c, "append", [rt.V.int(9)]);
    print(rt.show(a));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
