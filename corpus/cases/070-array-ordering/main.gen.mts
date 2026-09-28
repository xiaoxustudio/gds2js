// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let a = rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]));
    rt.method(a, "sort", []);
    print(rt.show(a));
    let f = rt.V.array(rt.GArray.of([rt.V.float(2.5), rt.V.int(1), rt.V.float(3), rt.V.int(2)]));
    rt.method(f, "sort", []);
    print(rt.show(f));
    let s = rt.V.array(rt.GArray.of([rt.V.str("b"), rt.V.str("a"), rt.V.str("C")]));
    rt.method(s, "sort", []);
    print(rt.show(s));
    let n = rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int((-2)), rt.V.int(0), rt.V.int((-1)), rt.V.int(1)]));
    rt.method(n, "sort", []);
    print(rt.show(n));
    let e = rt.V.array(rt.GArray.of([]));
    rt.method(e, "sort", []);
    print(rt.show(e));
    let b = rt.V.array(rt.GArray.of([rt.V.bool(true), rt.V.bool(false), rt.V.bool(true)]));
    rt.method(b, "sort", []);
    print(rt.show(b));
    let big = rt.V.array(rt.GArray.of([rt.V.int(9007199254740993n), rt.V.int(9007199254740992n), rt.V.int(1)]));
    rt.method(big, "sort", []);
    print(rt.show(big));
    let v = rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(0), rt.V.int(3)])]));
    rt.method(v, "sort", []);
    print(rt.show(v));
    let t = rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]));
    rt.method(t, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(x, y);
    })]);
    print(rt.show(t));
    let u = rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]));
    rt.method(u, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.gt(x, y);
    })]);
    print(rt.show(u));
    let pairs = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("a")])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.str("b")])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("c")])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.str("d")])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("e")]))]));
    rt.method(pairs, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    print(rt.show(pairs));
    let words = rt.V.array(rt.GArray.of([rt.V.str("pear"), rt.V.str("apple"), rt.V.str("fig")]));
    rt.method(words, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.gt(x, y);
    })]);
    print(rt.show(words));
    let vs = rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(0), rt.V.int(3)]), rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.vector2New([rt.V.int((-2)), rt.V.int(5)])]));
    rt.method(vs, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.attribute(x, "y"), rt.attribute(y, "y"));
    })]);
    print(rt.show(vs));
    let one = rt.V.array(rt.GArray.of([rt.V.int(5)]));
    rt.method(one, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(x, y);
    })]);
    print(rt.show(one));
    print(rt.show(rt.method(n, "min", [])));
    print(rt.show(rt.method(n, "max", [])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([])), "min", [])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([])), "max", [])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3), rt.V.int(5)])), "bsearch", [rt.V.int(3)])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3), rt.V.int(5)])), "bsearch", [rt.V.int(4)])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "bsearch", [rt.V.int(99)])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "bsearch", [rt.V.int(2)])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(1)])), "bsearch_custom", [rt.V.int(2), rt.callable((x, y) => {
      return rt.ops.lt(x, y);
    })])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([rt.V.str("b"), rt.V.str("a"), rt.V.str("c")])), "bsearch", [rt.V.str("b")])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "find", [rt.V.int(3)])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "find", [rt.V.int(9)])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(4)]))])), "find", [rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(4)]))])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "count", [rt.V.int(3)])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([])), "count", [rt.V.int(1)])));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
