// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  seen = rt.V.array(rt.GArray.of([]));

  _pick(x): unknown {
    rt.method(this.seen, "append", [x]);
    return rt.ops.gt(x, rt.V.int(2));
  }
  
  _add(acc, x): unknown {
    return rt.ops.add(acc, x);
  }
  
  async _initialize(): Promise<void> {
    let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]));
    print(rt.showArgs([rt.method(a, "filter", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(2));
    })])]));
    print(rt.showArgs([a]));
    print(rt.showArgs([rt.method(a, "map", [rt.callable((x) => {
      return rt.ops.mul(x, rt.V.int(2));
    })])]));
    print(rt.showArgs([rt.method(a, "map", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(1));
    })])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "filter", [rt.callable((x) => {
      return rt.V.bool(true);
    })])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "map", [rt.callable((x) => {
      return x;
    })])]));
    print(rt.showArgs([rt.method(a, "any", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(3));
    })])]));
    print(rt.showArgs([rt.method(a, "all", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(0));
    })])]));
    print(rt.showArgs([rt.method(a, "all", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(1));
    })])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "any", [rt.callable((x) => {
      return rt.V.bool(true);
    })])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "all", [rt.callable((x) => {
      return rt.V.bool(false);
    })])]));
    print(rt.showArgs([rt.method(a, "find_custom", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(2));
    })])]));
    print(rt.showArgs([rt.method(a, "find_custom", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(100));
    })])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "find_custom", [rt.callable((x) => {
      return rt.V.bool(true);
    })])]));
    print(rt.showArgs([rt.method(a, "rfind_custom", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(2));
    })])]));
    print(rt.showArgs([rt.method(a, "find_custom", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(1));
    }), rt.V.int(2)])]));
    print(rt.showArgs([rt.method(a, "find_custom", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(1));
    }), rt.V.int((-1))])]));
    print(rt.showArgs([rt.method(a, "rfind_custom", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(1));
    }), rt.V.int(0)])]));
    print(rt.showArgs([rt.method(a, "rfind_custom", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(1));
    }), rt.V.int((-9))])]));
    print(rt.showArgs([rt.method(a, "reduce", [rt.callable((acc, x) => {
      return rt.ops.add(acc, x);
    }), rt.V.int(0)])]));
    print(rt.showArgs([rt.method(a, "reduce", [rt.callable((acc, x) => {
      return rt.ops.add(acc, x);
    })])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), "reduce", [rt.callable((acc, x) => {
      return rt.ops.add(rt.ops.mul(acc, rt.V.int(10)), x);
    })])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(5)])), "reduce", [rt.callable((acc, x) => {
      return rt.ops.add(acc, x);
    })])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "reduce", [rt.callable((acc, x) => {
      return rt.ops.add(acc, x);
    }), rt.V.int(5)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "reduce", [rt.callable((acc, x) => {
      return rt.ops.add(acc, x);
    })])]));
    print(rt.showArgs([rt.method(a, "map", [rt.callable((x, i) => {
      return rt.V.int(1);
    })])]));
    print(rt.showArgs([rt.method(a, "filter", [rt.callable((x, i) => {
      return rt.V.bool(true);
    })])]));
    print(rt.showArgs([rt.method(a, "any", [rt.callable((x, i) => {
      return rt.V.bool(true);
    })])]));
    print(rt.showArgs([rt.method(a, "all", [rt.callable((x, i) => {
      return rt.V.bool(true);
    })])]));
    print(rt.showArgs([rt.method(a, "find_custom", [rt.callable((x, i) => {
      return rt.V.bool(true);
    })])]));
    print(rt.showArgs([rt.method(a, "reduce", [rt.callable((acc) => {
      return acc;
    }), rt.V.int(0)])]));
    print(rt.showArgs([rt.method(a, "reduce", [rt.callable((acc, x) => {
      return rt.ops.add(acc, x);
    }), rt.V.int(100)])]));
    print(rt.showArgs([rt.method(a, "filter", [rt.callableOf(this._pick.bind(this), "_pick", rt.V.object(this))])]));
    print(rt.showArgs([this.seen]));
    rt.method(this.seen, "clear", []);
    print(rt.showArgs([rt.method(a, "any", [rt.callableOf(this._pick.bind(this), "_pick", rt.V.object(this))])]));
    print(rt.showArgs([this.seen]));
    rt.method(this.seen, "clear", []);
    print(rt.showArgs([rt.method(a, "all", [rt.callableOf(this._pick.bind(this), "_pick", rt.V.object(this))])]));
    print(rt.showArgs([this.seen]));
    rt.method(this.seen, "clear", []);
    print(rt.showArgs([rt.method(a, "reduce", [rt.callableOf(this._add.bind(this), "_add", rt.V.object(this)), rt.V.int(0)])]));
    print(rt.showArgs([rt.method(a, "map", [rt.callableOf(this._add.bind(this), "_add", rt.V.object(this))])]));
    print(rt.showArgs([rt.method(a, "map", [rt.callableOf(this._pick.bind(this), "_pick", rt.V.object(this))])]));
    print(rt.showArgs([this.seen]));
    let nest = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))]));
    let kept = rt.method(nest, "filter", [rt.callable((x) => {
      return rt.V.bool(true);
    })]);
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeIdx(rt.index(kept, _w0), rt.V.int(0), rt.V.int(9));
      if (_nv !== null) rt.setIndex(kept, _w0, _nv);
    }
    print(rt.showArgs([nest]));
    let mapped = rt.method(nest, "map", [rt.callable((x) => {
      return x;
    })]);
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeIdx(rt.index(mapped, _w0), rt.V.int(0), rt.V.int(8));
      if (_nv !== null) rt.setIndex(mapped, _w0, _nv);
    }
    print(rt.showArgs([nest]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.nil(), rt.V.int(1)])), "filter", [rt.callable((x) => {
      return rt.ops.eq(x, rt.V.nil());
    })])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.nil()])), "map", [rt.callable((x) => {
      return rt.V.int(5);
    })])]));
    let f = rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(2));
    });
    print(rt.showArgs([rt.method(a, "filter", [f])]));
    print(rt.showArgs([rt.method(a, "map", [f])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_pick": [1, 1], "_add": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
