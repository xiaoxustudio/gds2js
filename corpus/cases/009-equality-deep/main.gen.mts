// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.showArgs([rt.ops.eq(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])))]));
    print(rt.showArgs([rt.ops.eq(rt.dictOf([[rt.V.str("a"), rt.V.array(rt.GArray.of([rt.V.int(1)]))]]), rt.dictOf([[rt.V.str("a"), rt.V.array(rt.GArray.of([rt.V.int(1)]))]]))]));
    print(rt.showArgs([rt.ops.eq(rt.V.float(1), rt.V.int(1))]));
    print(rt.showArgs([rt.ops.eq(rt.V.int(1), rt.V.float(1))]));
    let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
    let b = a;
    print(rt.showArgs([rt.ops.eq(a, b)]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
