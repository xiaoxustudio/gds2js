// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let acc = rt.V.array(rt.GArray.of([]));
    for (let i of rt.rangeSeq(rt.num(rt.V.int(3)))) {
      rt.method(acc, "append", [rt.V.int(i)]);
    }
    print(rt.show(acc));
    let ks = rt.V.array(rt.GArray.of([]));
    for (let k of rt.iter(rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]))) {
      rt.method(ks, "append", [k]);
    }
    print(rt.show(ks));
    let vs = rt.V.array(rt.GArray.of([]));
    for (let x of rt.iter(rt.V.array(rt.GArray.of([rt.V.int(10), rt.V.int(20)])))) {
      rt.method(vs, "append", [x]);
    }
    print(rt.show(vs));
    this.quit();
  }
  
}

await new Main().run();
