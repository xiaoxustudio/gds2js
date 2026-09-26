// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.V.array(rt.range([rt.V.float(0.5), rt.V.float(2.5)]))));
    print(rt.show(rt.V.array(rt.range([rt.V.float(2.5)]))));
    print(rt.show(rt.V.array(rt.range([rt.V.int(0), rt.V.float(3.9)]))));
    print(rt.show(rt.V.array(rt.range([rt.V.int(0), rt.V.int(3), rt.V.float(2.5)]))));
    print(rt.show(rt.V.array(rt.range([rt.V.int(0), rt.V.int(3), rt.V.bool(true)]))));
    print(rt.show(rt.V.array(rt.range([rt.ops.neg(rt.V.int(2))]))));
    print(rt.show(rt.V.array(rt.range([rt.V.int(0), rt.V.int(0)]))));
    print(rt.show(rt.V.array(rt.range([rt.V.int(3)]))));
    print(rt.show(rt.V.array(rt.range([rt.V.int(1), rt.V.int(4)]))));
    print(rt.show(rt.V.array(rt.range([rt.V.int(4), rt.V.int(0), rt.ops.neg(rt.V.int(2))]))));
    print(rt.show(rt.V.array(rt.range([rt.V.int(0), rt.V.int(5), rt.V.int(2)]))));
    print(rt.show(rt.V.array(rt.range([rt.V.float(0.9), rt.V.float(0.1)]))));
    print(rt.show(rt.V.array(rt.range([rt.ops.neg(rt.V.float(1.5)), rt.V.float(1.5)]))));
    print(rt.show(rt.V.array(rt.range([rt.V.int(0), rt.V.int(3), rt.V.float(1.001)]))));
    let st = 1.7;
    print(rt.show(rt.V.array(rt.range([rt.V.int(0), rt.V.int(6), rt.V.float(st)]))));
    for (let i of rt.rangeSeq([rt.V.float(2.5)])) {
      print(rt.show(rt.V.int(i)));
    }
    for (let i of rt.rangeSeq([rt.V.int(0), rt.V.int(3), rt.V.float(1.5)])) {
      print(rt.show(rt.V.int(i)));
    }
    let total = 0;
    for (let i of rt.rangeSeq([rt.V.float(0.5), rt.V.float(4.5)])) {
      total = rt.fast.iAddC(total, i);
    }
    print(rt.show(rt.V.int(total)));
    this.quit();
  }
  
}

await new Main().run();
