// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  counter = rt.V.int(0);

  bump(n): unknown {
    this.counter = rt.ops.add(this.counter, n);
    return this.counter;
  }
  
  async _initialize(): Promise<void> {
    let i = 0;
    while ((i < 3)) {
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.show(this.bump(rt.V.int(2))));
    print(rt.show(this.counter));
    if ((i > 2)) {
      print(rt.show(rt.V.int(111)));
    } else {
      print(rt.show(rt.V.int(222)));
    }
    for (let k of rt.rangeSeq([rt.V.int(2)])) {
      print(rt.show(rt.V.int(k)));
    }
    do {
      const __m0 = rt.matchPattern(this.counter, rt.patLit(rt.V.int(4)));
      if (__m0 !== null) {
        print(rt.show(rt.V.int(444)));
        break;
      }
      const __m1 = rt.matchPattern(this.counter, rt.patWild());
      if (__m1 !== null) {
        print(rt.show(rt.V.int(999)));
        break;
      }
    } while (false);
    print(rt.show(rt.V.str("保留 # 井号")));
    this.quit();
  }
  
}

await new Main().run();
