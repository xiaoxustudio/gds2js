// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let s = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("b")]))]);
    print(rt.showArgs([rt.V.str("u1 "), s, rt.V.str(" "), rt.typeOf(s), rt.V.str(" "), rt.index(s, rt.V.int(0)), rt.V.str(" "), rt.typeOf(rt.index(s, rt.V.int(0)))]));
    let m = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.float(2.5), rt.V.bool(true), rt.V.nil(), rt.V.stringName("nm")]))]);
    print(rt.showArgs([rt.V.str("u2 "), m]));
    print(rt.showArgs([rt.V.str("u3 "), rt.ops.eq(s, rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("b")]))])), rt.V.str(" "), rt.ops.add(s, rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("c")]))]))]));
    print(rt.showArgs([rt.V.str("u4 "), rt.index(s, rt.V.int((-1))), rt.V.str("|"), rt.V.str(" "), rt.method(s, "get", [rt.V.int(9)]), rt.V.str("|"), rt.V.str(" "), rt.method(s, "has", [rt.V.str("a")]), rt.V.str(" "), rt.method(s, "find", [rt.V.str("b")]), rt.V.str(" "), rt.method(s, "count", [rt.V.str("a")])]));
    let t = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("b"), rt.V.str("a")]))]);
    rt.method(t, "sort", []);
    print(rt.showArgs([rt.V.str("u5 "), t, rt.V.str(" "), rt.method(t, "slice", [rt.V.int(1)]), rt.V.str(" "), rt.ops.eq(rt.method(t, "duplicate", []), t)]));
    let u = rt.packCtor("string", []);
    rt.method(u, "resize", [rt.V.int(2)]);
    print(rt.showArgs([rt.V.str("u6 "), u]));
    let added = rt.method(u, "append", [rt.V.str("x")]);
    print(rt.showArgs([rt.V.str("u7 "), added, rt.V.str(" "), u]));
    {
      const _nv = rt.writeIdx(u, rt.V.int(0), rt.V.str("z"));
      if (_nv !== null) u = _nv;
    }
    print(rt.showArgs([rt.V.str("u8 "), u, rt.V.str(" "), rt.index(u, rt.V.int((-1)))]));
    let d = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("q")]))]);
    let e = d;
    {
      const _nv = rt.writeIdx(e, rt.V.int(0), rt.V.str("w"));
      if (_nv !== null) e = _nv;
    }
    print(rt.showArgs([rt.V.str("u9 "), d, rt.V.str(" "), rt.method(d, "insert", [rt.V.int(0), rt.V.str("i")]), rt.V.str(" "), d]));
    let v = rt.packCtor("string", []);
    print(rt.showArgs([rt.V.str("u10 "), v, rt.V.str(" "), rt.ops.eq(v, rt.packCtor("string", [])), rt.V.str(" "), rt.method(v, "size", [])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
