// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let p = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(9), rt.V.int(8), rt.V.int(7)]))]);
    print(rt.showArgs([rt.V.str("r1 "), rt.index(p, rt.V.float(1.5))]));
    {
      const _nv = rt.writeIdx(p, rt.V.float(1.5), rt.V.int(5));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("r2 "), p]));
    rt.method(p, "set", [rt.V.float(1.5), rt.V.int(6)]);
    print(rt.showArgs([rt.V.str("r3 "), p]));
    rt.method(p, "insert", [rt.V.float(0.9), rt.V.int(4)]);
    print(rt.showArgs([rt.V.str("r4 "), p]));
    rt.method(p, "remove_at", [rt.V.float(2.7)]);
    print(rt.showArgs([rt.V.str("r5 "), p]));
    print(rt.showArgs([rt.V.str("r6 "), rt.method(p, "find", [rt.V.int(6)]), rt.V.str(" "), rt.method(p, "rfind", [rt.V.int(6)])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
