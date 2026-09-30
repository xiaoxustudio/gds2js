// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  nest(n): unknown {
    n = rt.paramSlot(n, "int", 1, "nest", this);
    let c = rt.V.array(rt.GArray.of([]));
    for (let i of rt.rangeSeq([n])) {
      let x = rt.V.array(rt.GArray.of([]));
      rt.method(x, "append", [c]);
      c = x;
    }
    return c;
  }
  
  async _initialize(): Promise<void> {
    let a = rt.V.array(rt.GArray.of([]));
    rt.method(a, "append", [a]);
    print(rt.showArgs([a]));
    print(rt.showArgs([rt.method(rt.strBuiltin([a]), "length", []), rt.V.str(" "), rt.method(a, "size", []), rt.V.str(" "), rt.ops.eq(rt.index(a, rt.V.int(0)), a), rt.V.str(" "), rt.ops.eq(rt.index(rt.index(a, rt.V.int(0)), rt.V.int(0)), a)]));
    let d = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d, rt.V.str("x"), d);
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([rt.method(rt.strBuiltin([d]), "length", [])]));
    print(rt.showArgs([d]));
    let p = rt.V.array(rt.GArray.of([]));
    let q = rt.V.array(rt.GArray.of([p]));
    rt.method(p, "append", [q]);
    print(rt.showArgs([rt.ops.eq(p, q), rt.V.str(" "), rt.method(rt.strBuiltin([p]), "length", [])]));
    let b = rt.V.array(rt.GArray.of([]));
    rt.method(b, "append", [b]);
    print(rt.showArgs([rt.ops.eq(a, b), rt.V.str(" "), rt.ops.eq(a, a)]));
    let f = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(f, rt.V.str("x"), f);
      if (_nv !== null) f = _nv;
    }
    print(rt.showArgs([rt.ops.eq(d, f), rt.V.str(" "), rt.ops.eq(d, d)]));
    let ca = rt.method(a, "duplicate", [rt.V.bool(true)]);
    print(rt.showArgs([rt.ops.eq(rt.index(ca, rt.V.int(0)), ca), rt.V.str(" "), rt.method(ca, "size", []), rt.V.str(" "), rt.method(rt.strBuiltin([ca]), "length", [])]));
    print(rt.showArgs([rt.ops.eq(rt.index(rt.index(ca, rt.V.int(0)), rt.V.int(0)), ca)]));
    let cd = rt.method(d, "duplicate", [rt.V.bool(true)]);
    print(rt.showArgs([rt.ops.eq(rt.index(cd, rt.V.str("x")), cd), rt.V.str(" "), rt.method(rt.strBuiltin([cd]), "length", [])]));
    print(rt.showArgs([rt.ops.eq(rt.index(rt.method(a, "duplicate", []), rt.V.int(0)), a)]));
    print(rt.showArgs([rt.method(rt.strBuiltin([this.nest(rt.V.int(99))]), "length", []), rt.V.str(" "), rt.method(rt.strBuiltin([this.nest(rt.V.int(100))]), "length", []), rt.V.str(" "), rt.method(rt.strBuiltin([this.nest(rt.V.int(101))]), "length", []), rt.V.str(" "), rt.method(rt.strBuiltin([this.nest(rt.V.int(102))]), "length", [])]));
    print(rt.showArgs([rt.ops.eq(this.nest(rt.V.int(101)), this.nest(rt.V.int(102)))]));
    print(rt.showArgs([rt.method(rt.strBuiltin([rt.V.array(rt.GArray.of([a, a]))]), "length", [])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "nest": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
