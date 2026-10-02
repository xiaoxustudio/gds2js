// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  counter = rt.V.int(0);

  bump(n: rt.Variant): rt.Variant {
    this.counter = rt.ops.add(this.counter, n);
    return this.counter;
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let i = 0;
    while ((i < 3)) {
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.showArgs([this.bump(rt.V.int(2))]));
    print(rt.showArgs([this.counter]));
    if ((i > 2)) {
      print(rt.showArgs([rt.V.int(111)]));
    } else {
      print(rt.showArgs([rt.V.int(222)]));
    }
    for (let k of rt.rangeSeq([rt.V.int(2)])) {
      print(rt.showArgs([rt.V.int(k)]));
    }
    do {
      const __m0 = rt.matchPattern(this.counter, rt.patLit(rt.V.int(4)));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.int(444)]));
        break;
      }
      const __m1 = rt.matchPattern(this.counter, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.int(999)]));
        break;
      }
    } while (false);
    print(rt.showArgs([rt.V.str("保留 # 井号")]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "bump": return rt.wrapValue(this.bump(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "bump": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
const __gd_entry = new Main();
await __gd_entry.run();
