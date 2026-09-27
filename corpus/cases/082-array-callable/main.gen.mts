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
    print(rt.show(rt.method(a, "filter", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(2));
    })])));
    print(rt.show(a));
    print(rt.show(rt.method(a, "map", [rt.callable((x) => {
      return rt.ops.mul(x, rt.V.int(2));
    })])));
    print(rt.show(rt.method(a, "map", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(1));
    })])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([])), "filter", [rt.callable((x) => {
      return rt.V.bool(true);
    })])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([])), "map", [rt.callable((x) => {
      return x;
    })])));
    print(rt.show(rt.method(a, "any", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(3));
    })])));
    print(rt.show(rt.method(a, "all", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(0));
    })])));
    print(rt.show(rt.method(a, "all", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(1));
    })])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([])), "any", [rt.callable((x) => {
      return rt.V.bool(true);
    })])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([])), "all", [rt.callable((x) => {
      return rt.V.bool(false);
    })])));
    print(rt.show(rt.method(a, "find_custom", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(2));
    })])));
    print(rt.show(rt.method(a, "find_custom", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(100));
    })])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([])), "find_custom", [rt.callable((x) => {
      return rt.V.bool(true);
    })])));
    print(rt.show(rt.method(a, "rfind_custom", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(2));
    })])));
    print(rt.show(rt.method(a, "find_custom", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(1));
    }), rt.V.int(2)])));
    print(rt.show(rt.method(a, "find_custom", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(1));
    }), rt.V.int((-1))])));
    print(rt.show(rt.method(a, "rfind_custom", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(1));
    }), rt.V.int(0)])));
    print(rt.show(rt.method(a, "rfind_custom", [rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(1));
    }), rt.V.int((-9))])));
    print(rt.show(rt.method(a, "reduce", [rt.callable((acc, x) => {
      return rt.ops.add(acc, x);
    }), rt.V.int(0)])));
    print(rt.show(rt.method(a, "reduce", [rt.callable((acc, x) => {
      return rt.ops.add(acc, x);
    })])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), "reduce", [rt.callable((acc, x) => {
      return rt.ops.add(rt.ops.mul(acc, rt.V.int(10)), x);
    })])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([rt.V.int(5)])), "reduce", [rt.callable((acc, x) => {
      return rt.ops.add(acc, x);
    })])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([])), "reduce", [rt.callable((acc, x) => {
      return rt.ops.add(acc, x);
    }), rt.V.int(5)])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([])), "reduce", [rt.callable((acc, x) => {
      return rt.ops.add(acc, x);
    })])));
    print(rt.show(rt.method(a, "map", [rt.callable((x, i) => {
      return rt.V.int(1);
    })])));
    print(rt.show(rt.method(a, "filter", [rt.callable((x, i) => {
      return rt.V.bool(true);
    })])));
    print(rt.show(rt.method(a, "any", [rt.callable((x, i) => {
      return rt.V.bool(true);
    })])));
    print(rt.show(rt.method(a, "all", [rt.callable((x, i) => {
      return rt.V.bool(true);
    })])));
    print(rt.show(rt.method(a, "find_custom", [rt.callable((x, i) => {
      return rt.V.bool(true);
    })])));
    print(rt.show(rt.method(a, "reduce", [rt.callable((acc) => {
      return acc;
    }), rt.V.int(0)])));
    print(rt.show(rt.method(a, "reduce", [rt.callable((acc, x) => {
      return rt.ops.add(acc, x);
    }), rt.V.int(100)])));
    print(rt.show(rt.method(a, "filter", [rt.callableOf(this._pick.bind(this))])));
    print(rt.show(this.seen));
    rt.method(this.seen, "clear", []);
    print(rt.show(rt.method(a, "any", [rt.callableOf(this._pick.bind(this))])));
    print(rt.show(this.seen));
    rt.method(this.seen, "clear", []);
    print(rt.show(rt.method(a, "all", [rt.callableOf(this._pick.bind(this))])));
    print(rt.show(this.seen));
    rt.method(this.seen, "clear", []);
    print(rt.show(rt.method(a, "reduce", [rt.callableOf(this._add.bind(this)), rt.V.int(0)])));
    print(rt.show(rt.method(a, "map", [rt.callableOf(this._add.bind(this))])));
    print(rt.show(rt.method(a, "map", [rt.callableOf(this._pick.bind(this))])));
    print(rt.show(this.seen));
    let nest = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))]));
    let kept = rt.method(nest, "filter", [rt.callable((x) => {
      return rt.V.bool(true);
    })]);
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeIdx(rt.index(kept, _w0), rt.V.int(0), rt.V.int(9));
      if (_nv !== null) rt.setIndex(kept, _w0, _nv);
    }
    print(rt.show(nest));
    let mapped = rt.method(nest, "map", [rt.callable((x) => {
      return x;
    })]);
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeIdx(rt.index(mapped, _w0), rt.V.int(0), rt.V.int(8));
      if (_nv !== null) rt.setIndex(mapped, _w0, _nv);
    }
    print(rt.show(nest));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([rt.V.nil(), rt.V.int(1)])), "filter", [rt.callable((x) => {
      return rt.ops.eq(x, rt.V.nil());
    })])));
    print(rt.show(rt.method(rt.V.array(rt.GArray.of([rt.V.nil()])), "map", [rt.callable((x) => {
      return rt.V.int(5);
    })])));
    let f = rt.callable((x) => {
      return rt.ops.gt(x, rt.V.int(2));
    });
    print(rt.show(rt.method(a, "filter", [f])));
    print(rt.show(rt.method(a, "map", [f])));
    this.quit();
  }
  
}

await new Main().run();
