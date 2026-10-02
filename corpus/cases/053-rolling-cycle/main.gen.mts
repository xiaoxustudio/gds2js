// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  pick(x: rt.Variant, y: rt.Variant): rt.Variant {
    if (rt.ops.truthy(rt.ops.gt(x, y))) {
      return x;
    }
    return y;
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
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
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "pick": return rt.wrapValue(this.pick(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "pick": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
const __gd_entry = new Main();
await __gd_entry.run();
