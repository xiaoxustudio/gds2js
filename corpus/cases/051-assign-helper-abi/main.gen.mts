// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  tri(x): number {
    let y = rt.fast.iMulC(x, 3);
    let z = rt.fast.iAddC(y, x);
    return z;
  }
  
  shout(s): string {
    let t = (s + "!");
    return t;
  }
  
  mix(a, b): unknown {
    let t = rt.ops.add(a, b);
    print(rt.showArgs([t]));
    return t;
  }
  
  choose(x): unknown {
    if (rt.ops.truthy(rt.ops.gt(x, rt.V.int(0)))) {
      return x;
    }
    return rt.V.int(0);
  }
  
  async _initialize(): Promise<void> {
    let s = 0;
    let i = 0;
    while ((i < 3)) {
      s = this.tri(i);
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.showArgs([rt.V.int(s)]));
    print(rt.showArgs([rt.V.int(this.tri(10))]));
    print(rt.showArgs([rt.V.str(this.shout("hi"))]));
    print(rt.showArgs([this.mix(rt.V.int(2), rt.V.int(3))]));
    print(rt.showArgs([this.choose(rt.V.int(5))]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "tri": [1, 1], "shout": [1, 1], "mix": [2, 2], "choose": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
