// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

const PI = rt.V.float(3.141592653589793);

export class Main extends SceneTree {
  f(): unknown {
    return PI;
  }
  
  async _initialize(): Promise<void> {
    let PI = 5;
    print(rt.showArgs([rt.V.str("r1 "), rt.V.int(PI), rt.V.str(" "), rt.typeOf(rt.V.int(PI))]));
    print(rt.showArgs([rt.V.str("r2 "), this.f(), rt.V.str(" "), rt.typeOf(this.f())]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "f": [0, 0], "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
