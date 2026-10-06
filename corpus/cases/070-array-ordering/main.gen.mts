// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
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
    rt.method(t, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      const y = __a[1] as rt.Variant;
      return rt.ops.lt(x, y);
    }, 2)]);
    print(rt.showArgs([t]));
    let u = rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]));
    rt.method(u, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      const y = __a[1] as rt.Variant;
      return rt.ops.gt(x, y);
    }, 2)]);
    print(rt.showArgs([u]));
    let pairs = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("a")])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.str("b")])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("c")])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.str("d")])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("e")]))]));
    rt.method(pairs, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      const y = __a[1] as rt.Variant;
      return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
    }, 2)]);
    print(rt.showArgs([pairs]));
    let words = rt.V.array(rt.GArray.of([rt.V.str("pear"), rt.V.str("apple"), rt.V.str("fig")]));
    rt.method(words, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      const y = __a[1] as rt.Variant;
      return rt.ops.gt(x, y);
    }, 2)]);
    print(rt.showArgs([words]));
    let vs = rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(0), rt.V.int(3)]), rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.vector2New([rt.V.int((-2)), rt.V.int(5)])]));
    rt.method(vs, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      const y = __a[1] as rt.Variant;
      return rt.ops.lt(rt.wrapValue(rt.attribute(x, "y")), rt.wrapValue(rt.attribute(y, "y")));
    }, 2)]);
    print(rt.showArgs([vs]));
    let one = rt.V.array(rt.GArray.of([rt.V.int(5)]));
    rt.method(one, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      const y = __a[1] as rt.Variant;
      return rt.ops.lt(x, y);
    }, 2)]);
    print(rt.showArgs([one]));
    print(rt.showArgs([rt.method(n, "min", [])]));
    print(rt.showArgs([rt.method(n, "max", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "min", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "max", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3), rt.V.int(5)])), "bsearch", [rt.V.int(3)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3), rt.V.int(5)])), "bsearch", [rt.V.int(4)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "bsearch", [rt.V.int(99)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "bsearch", [rt.V.int(2)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(1)])), "bsearch_custom", [rt.V.int(2), rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      const y = __a[1] as rt.Variant;
      return rt.ops.lt(x, y);
    }, 2)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.str("b"), rt.V.str("a"), rt.V.str("c")])), "bsearch", [rt.V.str("b")])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "find", [rt.V.int(3)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "find", [rt.V.int(9)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(4)]))])), "find", [rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(4)]))])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "count", [rt.V.int(3)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "count", [rt.V.int(1)])]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
