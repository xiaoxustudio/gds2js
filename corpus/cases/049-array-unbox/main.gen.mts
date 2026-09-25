// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let a = [];
    let i = 0;
    let s = 0;
    while ((i < 3)) {
      a.push(i);
      s = rt.fast.iAddC(s, rt.fast.rawArrGet(a, i));
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.show(rt.V.int(s)));
    print(rt.show(rt.V.int(rt.fast.rawArrGet(a, 1))));
    print(rt.show(rt.V.int(a.length)));
    let b = [1.5];
    let j = 0;
    let s2 = 0;
    b.push(2);
    b.push(2.5);
    while ((j < b.length)) {
      s2 = (s2 + rt.fast.rawArrGet(b, j));
      j = rt.fast.iAddC(j, 1);
    }
    print(rt.show(rt.V.float(s2)));
    let e = rt.V.array(rt.GArray.of([]));
    rt.method(e, "append", [rt.V.int(7)]);
    let f = e;
    rt.method(f, "append", [rt.V.int(8)]);
    print(rt.show(e));
    print(rt.show(rt.method(e, "size", [])));
    let w = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
    rt.setIndex(w, rt.V.int(0), rt.V.int(5));
    print(rt.show(rt.index(w, rt.V.int(0))));
    this.quit();
  }
  
}

await new Main().run();
