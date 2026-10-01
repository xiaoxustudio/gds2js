// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let a = "😀";
    let b = "￿";
    print(rt.showArgs([rt.method(rt.V.str(a), "length", [])]));
    print(rt.showArgs([rt.method(rt.V.str(b), "length", [])]));
    print(rt.showArgs([rt.ops.lt(rt.V.str(a), rt.V.str(b))]));
    print(rt.showArgs([rt.ops.lt(rt.V.str(b), rt.V.str(a))]));
    print(rt.showArgs([rt.ops.gt(rt.V.str(a), rt.V.str(b))]));
    print(rt.showArgs([rt.ops.lt(rt.V.str("z"), rt.V.str(a))]));
    print(rt.showArgs([rt.ops.lt(rt.V.str("z"), rt.V.str(b))]));
    let arr = rt.V.array(rt.GArray.of([rt.V.str(a), rt.V.str(b), rt.V.str("z"), rt.V.str("apple")]));
    rt.method(arr, "sort", []);
    print(rt.showArgs([rt.index(arr, rt.V.int(0))]));
    print(rt.showArgs([rt.index(arr, rt.V.int(1))]));
    print(rt.showArgs([rt.index(arr, rt.V.int(2))]));
    print(rt.showArgs([rt.index(arr, rt.V.int(3))]));
    print(rt.showArgs([rt.ops.eq(rt.V.str(a), rt.V.str(b))]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
