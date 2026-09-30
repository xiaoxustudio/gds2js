// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  pick(x, y): unknown {
    if (rt.ops.truthy(rt.ops.gt(x, y))) {
      return x;
    }
    return y;
  }
  
  async _initialize(): Promise<void> {
    let a = 0;
    let b = 1;
    let i = 0;
    while ((i < 12)) {
      let t = rt.fast.iModC(rt.fast.iAddC(a, b), 100);
      a = b;
      b = t;
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.showArgs([rt.V.int(a)]));
    print(rt.showArgs([rt.V.int(b)]));
    let p = rt.V.int(0);
    let q = rt.V.int(0);
    let j = 0;
    while ((j < 6)) {
      p = q;
      q = this.pick(q, rt.V.int(j));
      j = rt.fast.iAddC(j, 1);
    }
    print(rt.showArgs([p]));
    print(rt.showArgs([q]));
    let x = 1.5;
    let y = 2.5;
    let r = 0;
    while ((r < 5)) {
      let z = ((x * 0.5) + y);
      x = y;
      y = z;
      r = rt.fast.iAddC(r, 1);
    }
    print(rt.showArgs([rt.V.float(x)]));
    print(rt.showArgs([rt.V.float(y)]));
    let g = 0;
    let h = rt.V.float(1);
    let w = 0;
    while ((w < 4)) {
      g = w;
      h = rt.ops.mul(rt.V.int(g), rt.V.float(1.5));
      w = rt.fast.iAddC(w, 1);
    }
    print(rt.showArgs([rt.V.int(g)]));
    print(rt.showArgs([h]));
    let c = 0;
    if ((g > 1)) {
      let u = c;
      c = rt.fast.iAddC(u, 3);
    } else {
      let u2 = "no";
      c = rt.fast.iAddC(c, 1);
    }
    print(rt.showArgs([rt.V.int(c)]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "pick": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
