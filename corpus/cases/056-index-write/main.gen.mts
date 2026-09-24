// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
    print(rt.show(rt.index(a, rt.ops.neg(rt.V.int(1)))));
    print(rt.show(rt.index(a, rt.ops.neg(rt.V.int(3)))));
    rt.setIndex(a, rt.ops.neg(rt.V.int(1)), rt.V.int(9));
    print(rt.show(a));
    rt.setIndex(a, rt.ops.neg(rt.V.int(2)), rt.V.int(8));
    print(rt.show(a));
    rt.setIndex(a, rt.V.int(0), rt.V.int(5));
    print(rt.show(a));
    let b = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(4)]))]));
    print(rt.show(rt.index(rt.index(b, rt.ops.neg(rt.V.int(1))), rt.ops.neg(rt.V.int(1)))));
    rt.setIndex(rt.index(b, rt.ops.neg(rt.V.int(1))), rt.V.int(0), rt.V.int(7));
    print(rt.show(b));
    rt.setIndex(rt.index(b, rt.V.int(0)), rt.V.int(1), rt.V.int(6));
    print(rt.show(b));
    print(rt.show(rt.method(a, "size", [])));
    print(rt.show(rt.method(b, "size", [])));
    this.quit();
  }
  
}

await new Main().run();
