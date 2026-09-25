// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.V.float(100000000000000)));
    print(rt.show(rt.V.float(1000000000000000)));
    print(rt.show(rt.V.float(10000000000000000)));
    print(rt.show(rt.V.float(100000000000000000000)));
    print(rt.show(rt.V.float(1e+21)));
    print(rt.show(rt.V.float(1e+300)));
    print(rt.show(rt.V.float(0.000001)));
    print(rt.show(rt.V.float(1e-7)));
    print(rt.show(rt.V.float(1e-20)));
    print(rt.show(rt.V.float((0.1 + 0.2))));
    print(rt.show(rt.V.float(123456789012345.6)));
    print(rt.show(rt.V.float(1)));
    print(rt.show(rt.V.float(2.5)));
    print(rt.show(rt.ops.neg(rt.V.float(0))));
    print(rt.show(rt.ops.neg(rt.V.float(3.14159))));
    print(rt.show(rt.V.float((1e+308 * 10))));
    print(rt.show(rt.strOf(rt.V.float(100000000000000000000))));
    print(rt.show(rt.V.array(rt.GArray.of([rt.V.float(100000000000000000000), rt.V.float(0.5)]))));
    print(rt.show(rt.V.float(1234567890123.45)));
    print(rt.show(rt.V.float(0.5)));
    this.quit();
  }
  
}

await new Main().run();
