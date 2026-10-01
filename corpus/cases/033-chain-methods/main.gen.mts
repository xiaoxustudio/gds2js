// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.showArgs([rt.method(rt.method(rt.V.array(rt.range([rt.V.int(10)])), "duplicate", []), "size", [])]));
    let arr = rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]));
    print(rt.showArgs([rt.method(rt.method(arr, "duplicate", []), "size", [])]));
    print(rt.showArgs([rt.method(arr, "size", [])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
