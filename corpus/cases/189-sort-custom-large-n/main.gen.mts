// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  build(n, mod): unknown {
    let a = rt.V.array(rt.GArray.of([]));
    for (let i of rt.rangeSeq([n])) {
      rt.method(a, "append", [rt.vector2iNew([rt.ops.mod(rt.V.int(i), mod), rt.V.int(i)])]);
    }
    return a;
  }
  
  idx(a, rev): unknown {
    if (rt.ops.truthy(rev)) {
      rt.method(a, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.gt(rt.attribute(x, "x"), rt.attribute(y, "x"));
    })]);
    } else {
      rt.method(a, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.attribute(x, "x"), rt.attribute(y, "x"));
    })]);
    }
    let out = rt.V.str("");
    for (let v of rt.iter(a)) {
      out = rt.ops.add(out, rt.ops.add(rt.strBuiltin([rt.attribute(v, "y")]), rt.V.str(" ")));
    }
    return out;
  }
  
  async _initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("r "), this.idx(this.build(rt.V.int(16), rt.V.int(1)), rt.V.bool(false))]));
    print(rt.showArgs([rt.V.str("r2 "), this.idx(this.build(rt.V.int(17), rt.V.int(1)), rt.V.bool(false))]));
    print(rt.showArgs([rt.V.str("r3 "), this.idx(this.build(rt.V.int(19), rt.V.int(1)), rt.V.bool(false))]));
    print(rt.showArgs([rt.V.str("r4 "), this.idx(this.build(rt.V.int(33), rt.V.int(1)), rt.V.bool(false))]));
    print(rt.showArgs([rt.V.str("r5 "), this.idx(this.build(rt.V.int(24), rt.V.int(3)), rt.V.bool(false))]));
    print(rt.showArgs([rt.V.str("r6 "), this.idx(this.build(rt.V.int(30), rt.V.int(7)), rt.V.bool(false))]));
    print(rt.showArgs([rt.V.str("r7 "), this.idx(this.build(rt.V.int(40), rt.V.int(5)), rt.V.bool(true))]));
    print(rt.showArgs([rt.V.str("r8 "), this.idx(this.build(rt.V.int(100), rt.V.int(1)), rt.V.bool(false))]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "build": [2, 2], "idx": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
