// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let a = rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]));
    rt.method(a, "sort", []);
    print(rt.showArgs([a]));
    let f = rt.V.array(rt.GArray.of([rt.V.float(2.5), rt.V.int(1), rt.V.float(3), rt.V.int(2)]));
    rt.method(f, "sort", []);
    print(rt.showArgs([f]));
    let s = rt.V.array(rt.GArray.of([rt.V.str("b"), rt.V.str("a"), rt.V.str("C")]));
    rt.method(s, "sort", []);
    print(rt.showArgs([s]));
    let n = rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int((-2)), rt.V.int(0), rt.V.int((-1)), rt.V.int(1)]));
    rt.method(n, "sort", []);
    print(rt.showArgs([n]));
    let e = rt.V.array(rt.GArray.of([]));
    rt.method(e, "sort", []);
    print(rt.showArgs([e]));
    let b = rt.V.array(rt.GArray.of([rt.V.bool(true), rt.V.bool(false), rt.V.bool(true)]));
    rt.method(b, "sort", []);
    print(rt.showArgs([b]));
    let big = rt.V.array(rt.GArray.of([rt.V.int(9007199254740993n), rt.V.int(9007199254740992n), rt.V.int(1)]));
    rt.method(big, "sort", []);
    print(rt.showArgs([big]));
    let v = rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(0), rt.V.int(3)])]));
    rt.method(v, "sort", []);
    print(rt.showArgs([v]));
    let t = rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]));
    rt.method(t, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(x, y);
    })]);
    print(rt.showArgs([t]));
    let u = rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]));
    rt.method(u, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.gt(x, y);
    })]);
    print(rt.showArgs([u]));
    let pairs = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("a")])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.str("b")])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("c")])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.str("d")])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("e")]))]));
    rt.method(pairs, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    print(rt.showArgs([pairs]));
    let words = rt.V.array(rt.GArray.of([rt.V.str("pear"), rt.V.str("apple"), rt.V.str("fig")]));
    rt.method(words, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.gt(x, y);
    })]);
    print(rt.showArgs([words]));
    let vs = rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(0), rt.V.int(3)]), rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.vector2New([rt.V.int((-2)), rt.V.int(5)])]));
    rt.method(vs, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.attribute(x, "y"), rt.attribute(y, "y"));
    })]);
    print(rt.showArgs([vs]));
    let one = rt.V.array(rt.GArray.of([rt.V.int(5)]));
    rt.method(one, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(x, y);
    })]);
    print(rt.showArgs([one]));
    print(rt.showArgs([rt.method(n, "min", [])]));
    print(rt.showArgs([rt.method(n, "max", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "min", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "max", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3), rt.V.int(5)])), "bsearch", [rt.V.int(3)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3), rt.V.int(5)])), "bsearch", [rt.V.int(4)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "bsearch", [rt.V.int(99)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "bsearch", [rt.V.int(2)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(1)])), "bsearch_custom", [rt.V.int(2), rt.callable((x, y) => {
      return rt.ops.lt(x, y);
    })])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.str("b"), rt.V.str("a"), rt.V.str("c")])), "bsearch", [rt.V.str("b")])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "find", [rt.V.int(3)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "find", [rt.V.int(9)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(4)]))])), "find", [rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(4)]))])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "count", [rt.V.int(3)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "count", [rt.V.int(1)])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
