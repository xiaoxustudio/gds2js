// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let fns = rt.V.array(rt.GArray.of([]));
    for (let i of rt.rangeSeq([rt.V.int(3)])) {
      rt.method(fns, "append", [rt.callable(() => {
      return rt.V.int(i);
    })]);
    }
    let out = rt.V.array(rt.GArray.of([]));
    for (let f of rt.iter(fns)) {
      rt.method(out, "append", [rt.method(f, "call", [])]);
    }
    print(rt.show(out));
    this.quit();
  }
  
}

await new Main().run();
