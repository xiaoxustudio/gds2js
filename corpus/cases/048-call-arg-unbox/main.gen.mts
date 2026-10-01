// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  add2(a, b): number {
    return rt.fast.iAddC(a, b);
  }
  
  scale(x): number {
    return (x * 2);
  }
  
  shout(s): string {
    return (s + "!");
  }
  
  idn(x): unknown {
    return x;
  }
  
  async _initialize(): Promise<void> {
    let total = 0;
    let i = 0;
    while ((i < 3)) {
      total = this.add2(total, i);
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.showArgs([rt.V.int(total)]));
    print(rt.showArgs([rt.V.int(rt.fast.iAddC(this.add2(100, 200), 5))]));
    let arr = rt.V.array(rt.GArray.of([rt.V.int(this.add2(1, 2)), rt.V.int(this.add2(3, 4))]));
    print(rt.showArgs([arr]));
    print(rt.showArgs([rt.V.float(this.scale(3))]));
    print(rt.showArgs([rt.V.str(this.shout("hi"))]));
    print(rt.showArgs([this.idn(rt.V.int(7))]));
    print(rt.showArgs([this.idn(rt.V.str("s"))]));
    print(rt.showArgs([rt.V.int(this.add2(7, 2))]));
    print(rt.showArgs([this.idn(rt.V.int(2))]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "add2": [2, 2], "scale": [1, 1], "shout": [1, 1], "idn": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
