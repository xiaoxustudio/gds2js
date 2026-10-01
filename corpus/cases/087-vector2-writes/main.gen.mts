// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  m = rt.toVec2(rt.vector2New([rt.V.int(1), rt.V.int(2)]));

  bump(p): void {
    p = rt.paramSlot(p, "Vector2", 1, "bump", this);
    {
      const _nv = rt.writeProp(p, "x", rt.V.int(7));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([p]));
  }
  
  make(): unknown {
    let t = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
    return t;
  }
  
  async _initialize(): Promise<void> {
    let v = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
    {
      const _nv = rt.writeProp(v, "x", rt.V.int(9));
      if (_nv !== null) v = _nv;
    }
    print(rt.showArgs([v]));
    {
      const _nv = rt.writeIdx(v, rt.V.int(0), rt.V.int(1));
      if (_nv !== null) v = _nv;
    }
    print(rt.showArgs([v]));
    {
      const _nv = rt.writeIdx(v, rt.V.str("y"), rt.V.int(5));
      if (_nv !== null) v = _nv;
    }
    print(rt.showArgs([v]));
    {
      const _nv = rt.writeIdx(v, rt.V.int(1), rt.V.int(6));
      if (_nv !== null) v = _nv;
    }
    print(rt.showArgs([v]));
    let w = v;
    {
      const _nv = rt.writeProp(w, "x", rt.V.int(100));
      if (_nv !== null) w = _nv;
    }
    print(rt.showArgs([v, rt.V.str(" "), w]));
    {
      const _nv = rt.writeIdx(w, rt.V.int(0), rt.V.int(50));
      if (_nv !== null) w = _nv;
    }
    print(rt.showArgs([v, rt.V.str(" "), w]));
    let a = rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])]));
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeProp(rt.index(a, _w0), "x", rt.V.int(5));
      if (_nv !== null) rt.setIndex(a, _w0, _nv);
    }
    print(rt.showArgs([a]));
    let ta = rt.stampArray(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])])), "Vector2", true);
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeProp(rt.index(ta, _w0), "y", rt.V.int(9));
      if (_nv !== null) rt.setIndex(ta, _w0, _nv);
    }
    print(rt.showArgs([ta]));
    let d = rt.dictOf([[rt.V.str("k"), rt.vector2New([rt.V.int(1), rt.V.int(2)])]]);
    {
    const _w0 = rt.V.str("k");
      const _nv = rt.writeProp(rt.index(d, _w0), "x", rt.V.int(8));
      if (_nv !== null) rt.setIndex(d, _w0, _nv);
    }
    print(rt.showArgs([d]));
    let dn = rt.dictOf([[rt.V.str("k"), rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])]))]]);
    {
    const _w0 = rt.V.str("k");
    const _w1 = rt.V.int(0);
      const _nv = rt.writeProp(rt.index(rt.index(dn, _w0), _w1), "y", rt.V.int(4));
      if (_nv !== null) rt.setIndex(rt.index(dn, _w0), _w1, _nv);
    }
    print(rt.showArgs([dn]));
    for (let x of rt.iter(a)) {
      {
        const _nv = rt.writeProp(x, "x", rt.V.int(100));
        if (_nv !== null) x = _nv;
      }
    }
    print(rt.showArgs([a]));
    let r = this.make();
    {
      const _nv = rt.writeProp(r, "x", rt.V.int(3));
      if (_nv !== null) r = _nv;
    }
    print(rt.showArgs([r, rt.V.str(" "), this.make()]));
    this.bump(v);
    print(rt.showArgs([v]));
    v = rt.ops.add(v, rt.vector2New([rt.V.int(1), rt.V.int(1)]));
    print(rt.showArgs([v]));
    {
      const _nv = rt.writeProp(v, "y", rt.ops.add(rt.attribute(v, "y"), rt.V.float(2.5)));
      if (_nv !== null) v = _nv;
    }
    print(rt.showArgs([v]));
    {
      const _nv = rt.writeProp(this.m, "x", rt.V.int(3));
      if (_nv !== null) this.m = _nv;
    }
    print(rt.showArgs([this.m]));
    let f = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
    {
      const _nv = rt.writeProp(f, "x", rt.V.float(0.1));
      if (_nv !== null) f = _nv;
    }
    print(rt.showArgs([rt.attribute(f, "x")]));
    print(rt.showArgs([f]));
    let big = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
    {
      const _nv = rt.writeProp(big, "x", rt.V.float(100000000000000000000));
      if (_nv !== null) big = _nv;
    }
    print(rt.showArgs([big]));
    let neg = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
    {
      const _nv = rt.writeProp(neg, "x", rt.V.float((-2.5)));
      if (_nv !== null) neg = _nv;
    }
    print(rt.showArgs([neg]));
    print(rt.showArgs([rt.ops.eq(v, rt.V.nil())]));
    print(rt.showArgs([rt.ops.eq(rt.V.nil(), v)]));
    print(rt.showArgs([rt.ops.eq(v, rt.vector2New([rt.V.int(2), rt.V.int(6)]))]));
    print(rt.showArgs([rt.ops.neq(v, rt.vector2New([rt.V.int(2), rt.V.int(6)]))]));
    let kv = rt.dictOf([[rt.V.str("x"), rt.vector2New([rt.V.int(1), rt.V.int(2)])]]);
    print(rt.showArgs([rt.ops.eq(rt.index(kv, rt.V.str("x")), rt.vector2New([rt.V.int(1), rt.V.int(2)]))]));
    let store = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
    let arr = rt.V.array(rt.GArray.of([store]));
    {
      const _nv = rt.writeProp(store, "x", rt.V.int(3));
      if (_nv !== null) store = _nv;
    }
    print(rt.showArgs([arr, rt.V.str(" "), store]));
    print(rt.showArgs([rt.attribute(rt.index(arr, rt.V.int(0)), "x"), rt.V.str(" "), rt.index(rt.index(arr, rt.V.int(0)), rt.V.int(0))]));
    this.quit();
  }
  
}

rt.registerFieldTypes(Main, {"m": "Vector2"});
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
