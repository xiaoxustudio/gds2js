// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let f = rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(0.1), rt.V.float(2.7), rt.ops.div(rt.V.float(1), rt.V.int(3)), rt.V.float(0.00001), rt.V.float(123456.789), rt.V.float((-0)), rt.V.float(100000000000000000000)]))]);
    print(rt.show(rt.V.str("u1 ")), rt.show(f), rt.show(rt.V.str(" ")), rt.show(rt.typeOf(f)));
    print(rt.show(rt.V.str("u2 ")), rt.show(rt.index(f, rt.V.int(0))), rt.show(rt.V.str(" ")), rt.show(rt.ops.eq(rt.index(f, rt.V.int(0)), rt.V.float(0.1))), rt.show(rt.V.str(" ")), rt.show(rt.typeOf(rt.index(f, rt.V.int(0)))));
    let d = rt.packCtor("float64", [rt.V.array(rt.GArray.of([rt.V.float(0.1), rt.V.float(2.7), rt.ops.div(rt.V.float(1), rt.V.int(3)), rt.V.float(100000000000000000000), rt.V.float(1e+308)]))]);
    print(rt.show(rt.V.str("u3 ")), rt.show(d), rt.show(rt.V.str(" ")), rt.show(rt.typeOf(d)), rt.show(rt.V.str(" ")), rt.show(rt.ops.eq(rt.index(d, rt.V.int(0)), rt.V.float(0.1))));
    let m = rt.packCtor("float64", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.bool(true), rt.V.int(3)]))]);
    print(rt.show(rt.V.str("u4 ")), rt.show(m));
    let r = rt.packCtor("float32", []);
    rt.method(r, "resize", [rt.V.int(3)]);
    print(rt.show(rt.V.str("u5 ")), rt.show(r));
    let added = rt.method(r, "append", [rt.V.float(2.5)]);
    print(rt.show(rt.V.str("u5b ")), rt.show(added), rt.show(rt.V.str(" ")), rt.show(r), rt.show(rt.V.str(" ")), rt.show(rt.method(r, "size", [])));
    let g = rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(1.5), rt.V.float(2.5)]))]);
    let h = g;
    {
      const _nv = rt.writeIdx(h, rt.V.int(0), rt.V.float(9.25));
      if (_nv !== null) h = _nv;
    }
    print(rt.show(rt.V.str("u6 ")), rt.show(g), rt.show(rt.V.str(" ")), rt.show(h));
    let k = rt.method(g, "duplicate", []);
    {
      const _nv = rt.writeIdx(k, rt.V.int(1), rt.V.float(0.5));
      if (_nv !== null) k = _nv;
    }
    print(rt.show(rt.V.str("u7 ")), rt.show(g), rt.show(rt.V.str(" ")), rt.show(k));
    print(rt.show(rt.V.str("u8 ")), rt.show(rt.ops.eq(g, rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(9.25), rt.V.float(2.5)]))]))), rt.show(rt.V.str(" ")), rt.show(rt.ops.add(g, rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(3.5)]))]))));
    print(rt.show(rt.V.str("u9 ")), rt.show(rt.method(g, "get", [rt.V.int(5)])), rt.show(rt.V.str(" ")), rt.show(rt.index(g, rt.V.int((-1)))), rt.show(rt.V.str(" ")), rt.show(rt.method(g, "has", [rt.V.float(9.25)])), rt.show(rt.V.str(" ")), rt.show(rt.method(g, "find", [rt.V.float(2.5)])));
    {
      const _nv = rt.writeIdx(g, rt.V.int((-1)), rt.V.float(8.25));
      if (_nv !== null) g = _nv;
    }
    print(rt.show(rt.V.str("u10 ")), rt.show(g));
    let s = rt.packCtor("float64", [rt.V.array(rt.GArray.of([rt.V.float(2.5), rt.V.float(1.5), rt.V.float(0.25)]))]);
    rt.method(s, "sort", []);
    let sliced = rt.method(s, "slice", [rt.V.int(1)]);
    let code = rt.method(s, "insert", [rt.V.int(0), rt.V.float(9.5)]);
    print(rt.show(rt.V.str("u11 ")), rt.show(s), rt.show(rt.V.str(" ")), rt.show(sliced), rt.show(rt.V.str(" ")), rt.show(code), rt.show(rt.V.str(" ")), rt.show(s));
    let q = rt.packCtor("float64", []);
    print(rt.show(rt.V.str("u12 ")), rt.show(q), rt.show(rt.V.str(" ")), rt.show(rt.ops.eq(q, rt.packCtor("float64", []))), rt.show(rt.V.str(" ")), rt.show(rt.method(q, "size", [])));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
