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
    print(rt.show(t));
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
    print(rt.show(rt.V.int(s)));
    print(rt.show(rt.V.int(this.tri(10))));
    print(rt.show(rt.V.str(this.shout("hi"))));
    print(rt.show(this.mix(rt.V.int(2), rt.V.int(3))));
    print(rt.show(this.choose(rt.V.int(5))));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
