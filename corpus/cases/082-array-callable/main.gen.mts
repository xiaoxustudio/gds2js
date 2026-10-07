// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  seen = rt.V.array(rt.GArray.of([]));

  _pick(x: rt.Variant): rt.Variant {
    rt.method(this.seen, "append", [x]);
    return rt.ops.gt(x, rt.V.int(2));
  }
  
  _add(acc: rt.Variant, x: rt.Variant): rt.Variant {
    return rt.ops.add(acc, x);
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]));
    print(rt.showArgs([rt.method(a, "filter", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.gt(x, rt.V.int(2));
    }, 1)])]));
    print(rt.showArgs([a]));
    print(rt.showArgs([rt.method(a, "map", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.mul(x, rt.V.int(2));
    }, 1)])]));
    print(rt.showArgs([rt.method(a, "map", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.gt(x, rt.V.int(1));
    }, 1)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "filter", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.V.bool(true);
    }, 1)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "map", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return x;
    }, 1)])]));
    print(rt.showArgs([rt.method(a, "any", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.gt(x, rt.V.int(3));
    }, 1)])]));
    print(rt.showArgs([rt.method(a, "all", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.gt(x, rt.V.int(0));
    }, 1)])]));
    print(rt.showArgs([rt.method(a, "all", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.gt(x, rt.V.int(1));
    }, 1)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "any", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.V.bool(true);
    }, 1)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "all", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.V.bool(false);
    }, 1)])]));
    print(rt.showArgs([rt.method(a, "find_custom", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.gt(x, rt.V.int(2));
    }, 1)])]));
    print(rt.showArgs([rt.method(a, "find_custom", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.gt(x, rt.V.int(100));
    }, 1)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "find_custom", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.V.bool(true);
    }, 1)])]));
    print(rt.showArgs([rt.method(a, "rfind_custom", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.gt(x, rt.V.int(2));
    }, 1)])]));
    print(rt.showArgs([rt.method(a, "find_custom", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.gt(x, rt.V.int(1));
    }, 1), rt.V.int(2)])]));
    print(rt.showArgs([rt.method(a, "find_custom", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.gt(x, rt.V.int(1));
    }, 1), rt.V.int((-1))])]));
    print(rt.showArgs([rt.method(a, "rfind_custom", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.gt(x, rt.V.int(1));
    }, 1), rt.V.int(0)])]));
    print(rt.showArgs([rt.method(a, "rfind_custom", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.gt(x, rt.V.int(1));
    }, 1), rt.V.int((-9))])]));
    print(rt.showArgs([rt.method(a, "reduce", [rt.callable((__a: rt.Variant[]) => {
      const acc = __a[0] as rt.Variant;
      const x = __a[1] as rt.Variant;
      return rt.ops.add(acc, x);
    }, 2), rt.V.int(0)])]));
    print(rt.showArgs([rt.method(a, "reduce", [rt.callable((__a: rt.Variant[]) => {
      const acc = __a[0] as rt.Variant;
      const x = __a[1] as rt.Variant;
      return rt.ops.add(acc, x);
    }, 2)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), "reduce", [rt.callable((__a: rt.Variant[]) => {
      const acc = __a[0] as rt.Variant;
      const x = __a[1] as rt.Variant;
      return rt.ops.add(rt.ops.mul(acc, rt.V.int(10)), x);
    }, 2)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(5)])), "reduce", [rt.callable((__a: rt.Variant[]) => {
      const acc = __a[0] as rt.Variant;
      const x = __a[1] as rt.Variant;
      return rt.ops.add(acc, x);
    }, 2)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "reduce", [rt.callable((__a: rt.Variant[]) => {
      const acc = __a[0] as rt.Variant;
      const x = __a[1] as rt.Variant;
      return rt.ops.add(acc, x);
    }, 2), rt.V.int(5)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "reduce", [rt.callable((__a: rt.Variant[]) => {
      const acc = __a[0] as rt.Variant;
      const x = __a[1] as rt.Variant;
      return rt.ops.add(acc, x);
    }, 2)])]));
    print(rt.showArgs([rt.method(a, "map", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      const i = __a[1] as rt.Variant;
      return rt.V.int(1);
    }, 2)])]));
    print(rt.showArgs([rt.method(a, "filter", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      const i = __a[1] as rt.Variant;
      return rt.V.bool(true);
    }, 2)])]));
    print(rt.showArgs([rt.method(a, "any", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      const i = __a[1] as rt.Variant;
      return rt.V.bool(true);
    }, 2)])]));
    print(rt.showArgs([rt.method(a, "all", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      const i = __a[1] as rt.Variant;
      return rt.V.bool(true);
    }, 2)])]));
    print(rt.showArgs([rt.method(a, "find_custom", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      const i = __a[1] as rt.Variant;
      return rt.V.bool(true);
    }, 2)])]));
    print(rt.showArgs([rt.method(a, "reduce", [rt.callable((__a: rt.Variant[]) => {
      const acc = __a[0] as rt.Variant;
      return acc;
    }, 1), rt.V.int(0)])]));
    print(rt.showArgs([rt.method(a, "reduce", [rt.callable((__a: rt.Variant[]) => {
      const acc = __a[0] as rt.Variant;
      const x = __a[1] as rt.Variant;
      return rt.ops.add(acc, x);
    }, 2), rt.V.int(100)])]));
    print(rt.showArgs([rt.method(a, "filter", [rt.methodCallable(rt.V.object(this), "_pick")])]));
    print(rt.showArgs([this.seen]));
    rt.method(this.seen, "clear", []);
    print(rt.showArgs([rt.method(a, "any", [rt.methodCallable(rt.V.object(this), "_pick")])]));
    print(rt.showArgs([this.seen]));
    rt.method(this.seen, "clear", []);
    print(rt.showArgs([rt.method(a, "all", [rt.methodCallable(rt.V.object(this), "_pick")])]));
    print(rt.showArgs([this.seen]));
    rt.method(this.seen, "clear", []);
    print(rt.showArgs([rt.method(a, "reduce", [rt.methodCallable(rt.V.object(this), "_add"), rt.V.int(0)])]));
    print(rt.showArgs([rt.method(a, "map", [rt.methodCallable(rt.V.object(this), "_add")])]));
    print(rt.showArgs([rt.method(a, "map", [rt.methodCallable(rt.V.object(this), "_pick")])]));
    print(rt.showArgs([this.seen]));
    let nest = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))]));
    let kept = rt.method(nest, "filter", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.V.bool(true);
    }, 1)]);
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeIdx(rt.index(kept, _w0), rt.V.int(0), rt.V.int(9));
      if (_nv !== null) rt.setIndex(kept, _w0, _nv);
    }
    print(rt.showArgs([nest]));
    let mapped = rt.method(nest, "map", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return x;
    }, 1)]);
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeIdx(rt.index(mapped, _w0), rt.V.int(0), rt.V.int(8));
      if (_nv !== null) rt.setIndex(mapped, _w0, _nv);
    }
    print(rt.showArgs([nest]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.nil(), rt.V.int(1)])), "filter", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.eq(x, rt.V.nil());
    }, 1)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.nil()])), "map", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.V.int(5);
    }, 1)])]));
    let f = rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.ops.gt(x, rt.V.int(2));
    }, 1);
    print(rt.showArgs([rt.method(a, "filter", [f])]));
    print(rt.showArgs([rt.method(a, "map", [f])]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_pick": return rt.wrapValue(this._pick(args[0] as rt.Variant));
      case "_add": return rt.wrapValue(this._add(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["seen"]);
rt.registerMethodArities(__gd_d_Main, { "_pick": [1, 1], "_add": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
