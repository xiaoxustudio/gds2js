// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let a = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]);
    print(rt.show(rt.V.str("u1 ")), rt.show(a), rt.show(rt.V.str(" ")), rt.show(rt.typeOf(a)), rt.show(rt.V.str(" ")), rt.show(rt.method(a, "size", [])));
    let big = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(2147483648), rt.V.int((-2147483649)), rt.V.int(4294967296), rt.V.float(2.7), rt.V.float((-2.7)), rt.V.bool(true)]))]);
    print(rt.show(rt.V.str("u2 ")), rt.show(big));
    let f = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.float(0.1), rt.V.float(1), rt.V.float(1e+308)]))]);
    print(rt.show(rt.V.str("u3 ")), rt.show(f), rt.show(rt.V.str(" ")), rt.show(rt.index(f, rt.V.int(0))), rt.show(rt.V.str(" ")), rt.show(rt.ops.eq(rt.index(f, rt.V.int(0)), rt.V.float(0.1))));
    let b = rt.packCtor("int64", [rt.V.array(rt.GArray.of([rt.V.int(2147483648), rt.V.int((-2147483649)), rt.V.int(9007199254740993n), rt.V.float(2.7), rt.V.bool(true)]))]);
    print(rt.show(rt.V.str("u4 ")), rt.show(b), rt.show(rt.V.str(" ")), rt.show(rt.typeOf(b)), rt.show(rt.V.str(" ")), rt.show(rt.index(b, rt.V.int(0))), rt.show(rt.V.str(" ")), rt.show(rt.typeOf(rt.index(b, rt.V.int(0)))));
    let g = rt.packCtor("int32", []);
    rt.method(g, "append", [rt.V.int(300)]);
    rt.method(g, "resize", [rt.V.int(4)]);
    print(rt.show(rt.V.str("u5 ")), rt.show(g), rt.show(rt.V.str(" ")), rt.show(rt.method(g, "size", [])));
    let h = a;
    {
      const _nv = rt.writeIdx(h, rt.V.int(0), rt.V.int(77));
      if (_nv !== null) h = _nv;
    }
    print(rt.show(rt.V.str("u6 ")), rt.show(a), rt.show(rt.V.str(" ")), rt.show(h));
    print(rt.show(rt.V.str("u7 ")), rt.show(rt.ops.eq(a, rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(77), rt.V.int(2)]))]))), rt.show(rt.V.str(" ")), rt.show(rt.ops.add(a, rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(3)]))]))));
    print(rt.show(rt.V.str("u8 ")), rt.show(rt.method(a, "get", [rt.V.int(5)])), rt.show(rt.V.str(" ")), rt.show(rt.method(a, "get", [rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(a, "has", [rt.V.int(77)])), rt.show(rt.V.str(" ")), rt.show(rt.method(a, "count", [rt.V.int(2)])), rt.show(rt.V.str(" ")), rt.show(rt.method(a, "find", [rt.V.int(77)])));
    let s = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]))]);
    rt.method(s, "sort", []);
    print(rt.show(rt.V.str("u12 ")), rt.show(s), rt.show(rt.V.str(" ")), rt.show(rt.method(s, "slice", [rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.ops.eq(rt.method(s, "duplicate", []), s)));
    let t = rt.packCtor("int32", []);
    let u = rt.packCtor("int64", []);
    print(rt.show(rt.V.str("u13 ")), rt.show(t), rt.show(rt.V.str(" ")), rt.show(u), rt.show(rt.V.str(" ")), rt.show(rt.ops.eq(t, rt.packCtor("int32", []))));
    rt.method(t, "resize", [rt.V.int(3)]);
    {
      const _nv = rt.writeIdx(t, rt.V.int((-1)), rt.V.int(8));
      if (_nv !== null) t = _nv;
    }
    print(rt.show(rt.V.str("u14 ")), rt.show(t), rt.show(rt.V.str(" ")), rt.show(rt.index(t, rt.V.int((-1)))));
    print(rt.show(rt.V.str("u15 ")), rt.show(rt.method(a, "append", [rt.V.int(9)])), rt.show(rt.V.str(" ")), rt.show(rt.method(a, "size", [])));
    print(rt.show(rt.V.str("u16 ")), rt.show(rt.index(b, rt.V.int((-1)))), rt.show(rt.V.str(" ")), rt.show(rt.method(b, "get", [rt.V.int(0)])), rt.show(rt.V.str(" ")), rt.show(rt.method(b, "count", [rt.V.int(2147483648)])));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
