// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]);
    print(rt.showArgs([rt.V.str("u1 "), a, rt.V.str(" "), rt.typeOf(a), rt.V.str(" "), rt.method(a, "size", [])]));
    let big = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(2147483648), rt.V.int((-2147483649)), rt.V.int(4294967296), rt.V.float(2.7), rt.V.float((-2.7)), rt.V.bool(true)]))]);
    print(rt.showArgs([rt.V.str("u2 "), big]));
    let f = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.float(0.1), rt.V.float(1), rt.V.float(1e+308)]))]);
    print(rt.showArgs([rt.V.str("u3 "), f, rt.V.str(" "), rt.wrapValue(rt.index(f, rt.V.int(0))), rt.V.str(" "), rt.ops.eq(rt.wrapValue(rt.index(f, rt.V.int(0))), rt.V.float(0.1))]));
    let b = rt.packCtor("int64", [rt.V.array(rt.GArray.of([rt.V.int(2147483648), rt.V.int((-2147483649)), rt.V.int(9007199254740993n), rt.V.float(2.7), rt.V.bool(true)]))]);
    print(rt.showArgs([rt.V.str("u4 "), b, rt.V.str(" "), rt.typeOf(b), rt.V.str(" "), rt.wrapValue(rt.index(b, rt.V.int(0))), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(b, rt.V.int(0))))]));
    let g = rt.packCtor("int32", []);
    rt.method(g, "append", [rt.V.int(300)]);
    rt.method(g, "resize", [rt.V.int(4)]);
    print(rt.showArgs([rt.V.str("u5 "), g, rt.V.str(" "), rt.method(g, "size", [])]));
    let h = a;
    {
      const _nv = rt.writeIdx(h, rt.V.int(0), rt.V.int(77));
      if (_nv !== null) h = _nv;
    }
    print(rt.showArgs([rt.V.str("u6 "), a, rt.V.str(" "), h]));
    print(rt.showArgs([rt.V.str("u7 "), rt.ops.eq(a, rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(77), rt.V.int(2)]))])), rt.V.str(" "), rt.ops.add(a, rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(3)]))]))]));
    print(rt.showArgs([rt.V.str("u8 "), rt.method(a, "get", [rt.V.int(5)]), rt.V.str(" "), rt.method(a, "get", [rt.V.int(1)]), rt.V.str(" "), rt.method(a, "has", [rt.V.int(77)]), rt.V.str(" "), rt.method(a, "count", [rt.V.int(2)]), rt.V.str(" "), rt.method(a, "find", [rt.V.int(77)])]));
    let s = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]))]);
    rt.method(s, "sort", []);
    print(rt.showArgs([rt.V.str("u12 "), s, rt.V.str(" "), rt.method(s, "slice", [rt.V.int(1)]), rt.V.str(" "), rt.ops.eq(rt.method(s, "duplicate", []), s)]));
    let t = rt.packCtor("int32", []);
    let u = rt.packCtor("int64", []);
    print(rt.showArgs([rt.V.str("u13 "), t, rt.V.str(" "), u, rt.V.str(" "), rt.ops.eq(t, rt.packCtor("int32", []))]));
    rt.method(t, "resize", [rt.V.int(3)]);
    {
      const _nv = rt.writeIdx(t, rt.V.int((-1)), rt.V.int(8));
      if (_nv !== null) t = _nv;
    }
    print(rt.showArgs([rt.V.str("u14 "), t, rt.V.str(" "), rt.wrapValue(rt.index(t, rt.V.int((-1))))]));
    print(rt.showArgs([rt.V.str("u15 "), rt.method(a, "append", [rt.V.int(9)]), rt.V.str(" "), rt.method(a, "size", [])]));
    print(rt.showArgs([rt.V.str("u16 "), rt.wrapValue(rt.index(b, rt.V.int((-1)))), rt.V.str(" "), rt.method(b, "get", [rt.V.int(0)]), rt.V.str(" "), rt.method(b, "count", [rt.V.int(2147483648)])]));
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
const __gd_entry = new Main();
await __gd_entry.run();
