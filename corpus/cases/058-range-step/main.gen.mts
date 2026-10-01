// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    for (let i of rt.rangeSeq([rt.V.int(0), rt.V.int(10), rt.V.int(2)])) {
      print(rt.showArgs([rt.V.int(i)]));
    }
    for (let j of rt.rangeSeq([rt.V.int(10), rt.V.int(0), rt.V.int((-2))])) {
      print(rt.showArgs([rt.V.int(j)]));
    }
    print(rt.showArgs([rt.method(rt.V.array(rt.range([rt.V.int(0), rt.V.int(20), rt.V.int(5)])), "size", [])]));
    for (let x of rt.rangeSeq([rt.V.float(0), rt.V.float(3)])) {
      print(rt.showArgs([rt.V.int(x)]));
    }
    print(rt.showArgs([rt.index(rt.V.array(rt.range([rt.V.int(2), rt.V.int(8), rt.V.int(3)])), rt.V.int(1))]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
