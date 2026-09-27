// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  m = rt.vector2iNew([rt.V.int(1), rt.V.int(2)]);

  bump(p): void {
    {
      const _nv = rt.writeProp(p, "x", rt.V.int(7));
      if (_nv !== null) p = _nv;
    }
    print(rt.show(p));
  }
  
  async _initialize(): Promise<void> {
    let w = rt.vector2iNew([rt.V.int(1), rt.V.int(2)]);
    print(rt.show(w), rt.show(rt.V.str(" ")), rt.show(rt.vector2iNew([])), rt.show(rt.V.str(" ")), rt.show(rt.vector2iNew([rt.ops.neg(rt.V.float(1.7)), rt.ops.neg(rt.V.float(2.2))])), rt.show(rt.V.str(" ")), rt.show(rt.vector2iNew([w])), rt.show(rt.V.str(" ")), rt.show(rt.vector2iNew([rt.vector2New([rt.V.float(1.7), rt.V.float(2.2)])])));
    print(rt.show(rt.vector2New([w])), rt.show(rt.V.str(" ")), rt.show(rt.vector2New([rt.vector2New([rt.V.int(3), rt.V.int(4)])])));
    print(rt.show(rt.attribute(w, "x")), rt.show(rt.V.str(" ")), rt.show(rt.attribute(w, "y")), rt.show(rt.V.str(" ")), rt.show(rt.index(w, rt.V.int(0))), rt.show(rt.V.str(" ")), rt.show(rt.index(w, rt.V.str("y"))));
    print(rt.show(rt.ops.eq(w, rt.vector2iNew([rt.V.float(1), rt.V.float(2)]))), rt.show(rt.V.str(" ")), rt.show(rt.ops.neq(w, rt.vector2iNew([rt.V.int(1), rt.V.int(3)]))), rt.show(rt.V.str(" ")), rt.show(rt.ops.eq(w, rt.V.nil())), rt.show(rt.V.str(" ")), rt.show(rt.ops.neq(w, rt.V.nil())));
    print(rt.show(rt.ops.lt(w, rt.vector2iNew([rt.V.int(1), rt.V.int(3)]))), rt.show(rt.V.str(" ")), rt.show(rt.ops.gt(w, rt.vector2iNew([rt.V.int(0), rt.V.int(9)]))), rt.show(rt.V.str(" ")), rt.show(rt.ops.lte(w, rt.vector2iNew([rt.V.int(1), rt.V.int(2)]))));
    print(rt.show(rt.ops.add(w, rt.vector2iNew([rt.V.int(3), rt.ops.neg(rt.V.int(4))]))), rt.show(rt.V.str(" | ")), rt.show(rt.ops.sub(w, rt.vector2iNew([rt.V.int(1), rt.V.int(1)]))), rt.show(rt.V.str(" | ")), rt.show(rt.ops.mul(w, rt.vector2iNew([rt.V.int(4), rt.V.int(5)]))), rt.show(rt.V.str(" | ")), rt.show(rt.ops.mul(w, rt.V.int(2))), rt.show(rt.V.str(" | ")), rt.show(rt.ops.div(w, rt.vector2iNew([rt.V.int(2), rt.V.int(2)]))), rt.show(rt.V.str(" | ")), rt.show(rt.ops.neg(w)));
    print(rt.show(rt.ops.div(rt.vector2iNew([rt.V.int(7), rt.ops.neg(rt.V.int(7))]), rt.vector2iNew([rt.V.int(2), rt.V.int(2)]))), rt.show(rt.V.str(" | ")), rt.show(rt.ops.mod(rt.vector2iNew([rt.ops.neg(rt.V.int(7)), rt.V.int(7)]), rt.vector2iNew([rt.V.int(2), rt.ops.neg(rt.V.int(2))]))), rt.show(rt.V.str(" | ")), rt.show(rt.ops.mul(rt.vector2iNew([rt.V.int(6), rt.V.int(6)]), rt.V.float(0.5))), rt.show(rt.V.str(" | ")), rt.show(rt.ops.div(rt.vector2iNew([rt.V.int(6), rt.V.int(6)]), rt.V.float(4))));
    print(rt.show(rt.ops.add(rt.vector2iNew([rt.V.int(2147483647), rt.V.int(0)]), rt.vector2iNew([rt.V.int(1), rt.V.int(0)]))), rt.show(rt.V.str(" | ")), rt.show(rt.ops.sub(rt.vector2iNew([rt.ops.neg(rt.V.int(2147483648)), rt.V.int(5)]), rt.vector2iNew([rt.V.int(1), rt.V.int(0)]))), rt.show(rt.V.str(" | ")), rt.show(rt.ops.mul(rt.vector2iNew([rt.V.int(2147483647), rt.V.int(0)]), rt.V.int(2))));
    let big = rt.vector2iNew([rt.V.int(2147483647), rt.V.int(1)]);
    print(rt.show(rt.ops.mul(big, rt.vector2iNew([rt.V.int(2), rt.V.int(2)]))), rt.show(rt.V.str(" | ")), rt.show(rt.ops.neg(big)), rt.show(rt.V.str(" | ")), rt.show(rt.method(big, "length_squared", [])));
    let v = rt.vector2iNew([rt.V.int(1), rt.V.int(2)]);
    {
      const _nv = rt.writeProp(v, "x", rt.V.float(2.7));
      if (_nv !== null) v = _nv;
    }
    print(rt.show(v), rt.show(rt.V.str(" ")), rt.show(rt.attribute(v, "x")));
    {
      const _nv = rt.writeIdx(v, rt.V.int(1), rt.ops.neg(rt.V.float(0.9)));
      if (_nv !== null) v = _nv;
    }
    print(rt.show(v));
    {
      const _nv = rt.writeProp(v, "x", rt.V.int(2147483648));
      if (_nv !== null) v = _nv;
    }
    print(rt.show(v));
    {
      const _nv = rt.writeProp(this.m, "y", rt.V.int(9));
      if (_nv !== null) this.m = _nv;
    }
    print(rt.show(this.m));
    let arr = rt.V.array(rt.GArray.of([rt.vector2iNew([rt.V.int(1), rt.V.int(2)])]));
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeProp(rt.index(arr, _w0), "x", rt.V.int(5));
      if (_nv !== null) rt.setIndex(arr, _w0, _nv);
    }
    print(rt.show(arr));
    let ddc = rt.dictOf([[rt.V.str("k"), rt.vector2iNew([rt.V.int(1), rt.V.int(2)])]]);
    {
    const _w0 = rt.V.str("k");
      const _nv = rt.writeProp(rt.index(ddc, _w0), "y", rt.V.int(8));
      if (_nv !== null) rt.setIndex(ddc, _w0, _nv);
    }
    print(rt.show(ddc));
    for (let x of rt.iter(arr)) {
      {
        const _nv = rt.writeProp(x, "y", rt.V.int(100));
        if (_nv !== null) x = _nv;
      }
    }
    print(rt.show(arr));
    let w2 = v;
    {
      const _nv = rt.writeProp(w2, "x", rt.V.int(42));
      if (_nv !== null) w2 = _nv;
    }
    print(rt.show(v), rt.show(rt.V.str(" ")), rt.show(w2));
    let q = rt.vector2iNew([rt.V.int(3), rt.ops.neg(rt.V.int(4))]);
    print(rt.show(rt.method(q, "length", [])), rt.show(rt.V.str(" | ")), rt.show(rt.method(q, "length_squared", [])), rt.show(rt.V.str(" | ")), rt.show(rt.method(q, "aspect", [])), rt.show(rt.V.str(" | ")), rt.show(rt.method(q, "abs", [])), rt.show(rt.V.str(" | ")), rt.show(rt.method(q, "sign", [])));
    print(rt.show(rt.method(q, "min", [rt.vector2iNew([rt.V.int(1), rt.V.int(9)])])), rt.show(rt.V.str(" | ")), rt.show(rt.method(q, "max", [rt.vector2iNew([rt.V.int(1), rt.V.int(9)])])), rt.show(rt.V.str(" | ")), rt.show(rt.method(q, "clamp", [rt.vector2iNew([rt.V.int(1), rt.V.int(1)]), rt.vector2iNew([rt.V.int(4), rt.V.int(4)])])));
    let s7 = rt.vector2iNew([rt.V.int(7), rt.V.int(3)]);
    print(rt.show(rt.method(s7, "snapped", [rt.vector2iNew([rt.V.int(2), rt.V.int(2)])])), rt.show(rt.V.str(" | ")), rt.show(rt.method(s7, "distance_to", [rt.vector2iNew([rt.V.int(0), rt.V.int(0)])])), rt.show(rt.V.str(" | ")), rt.show(rt.method(s7, "distance_squared_to", [rt.vector2iNew([rt.V.int(0), rt.V.int(0)])])), rt.show(rt.V.str(" | ")), rt.show(rt.method(s7, "min_axis_index", [])), rt.show(rt.method(s7, "max_axis_index", [])));
    print(rt.show(rt.method(rt.vector2iNew([rt.ops.neg(rt.V.int(7)), rt.V.int(3)]), "snapped", [rt.vector2iNew([rt.V.int(2), rt.V.int(2)])])), rt.show(rt.V.str(" | ")), rt.show(rt.method(rt.vector2iNew([rt.ops.neg(rt.V.int(7)), rt.V.int(3)]), "snapped", [rt.vector2iNew([rt.V.int(0), rt.V.int(1)])])), rt.show(rt.V.str(" | ")), rt.show(rt.method(rt.vector2iNew([rt.V.int(0), rt.V.int(0)]), "length", [])), rt.show(rt.V.str(" | ")), rt.show(rt.method(rt.vector2iNew([rt.V.int(0), rt.V.int(0)]), "aspect", [])), rt.show(rt.V.str(" | ")), rt.show(rt.method(rt.vector2iNew([rt.V.int(3), rt.V.int(0)]), "aspect", [])));
    print(rt.show(rt.method(rt.vector2iConst("MIN"), "abs", [])), rt.show(rt.V.str(" | ")), rt.show(rt.ops.neg(rt.vector2iConst("MIN"))), rt.show(rt.V.str(" | ")), rt.show(rt.method(rt.vector2iConst("MIN"), "sign", [])));
    print(rt.show(rt.vector2iConst("ONE")), rt.show(rt.V.str(" ")), rt.show(rt.vector2iConst("ZERO")), rt.show(rt.V.str(" ")), rt.show(rt.vector2iConst("UP")), rt.show(rt.V.str(" ")), rt.show(rt.vector2iConst("DOWN")), rt.show(rt.V.str(" ")), rt.show(rt.vector2iConst("LEFT")), rt.show(rt.V.str(" ")), rt.show(rt.vector2iConst("RIGHT")), rt.show(rt.V.str(" ")), rt.show(rt.vector2iConst("MAX")), rt.show(rt.V.str(" ")), rt.show(rt.vector2iConst("MIN")));
    print(rt.show(rt.typeOf(w)), rt.show(rt.V.str(" ")), rt.show(rt.isType(w, "Vector2i")), rt.show(rt.V.str(" ")), rt.show(rt.isType(w, "Vector2")), rt.show(rt.V.str(" ")), rt.show(rt.strOf(w)));
    let d = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d, rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.int(5));
      if (_nv !== null) d = _nv;
    }
    print(rt.show(d), rt.show(rt.V.str(" ")), rt.show(rt.method(d, "get", [rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.str("M")])), rt.show(rt.V.str(" ")), rt.show(rt.method(d, "get", [rt.vector2iNew([rt.V.float(1.7), rt.V.float(2.2)]), rt.V.str("M")])), rt.show(rt.V.str(" ")), rt.show(rt.method(d, "has", [rt.vector2iNew([rt.V.int(1), rt.V.int(3)])])));
    let d2 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d2, rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.int(1));
      if (_nv !== null) d2 = _nv;
    }
    {
      const _nv = rt.writeIdx(d2, rt.vector2iNew([rt.V.float(1.7), rt.V.float(2.2)]), rt.V.int(2));
      if (_nv !== null) d2 = _nv;
    }
    print(rt.show(d2), rt.show(rt.V.str(" size=")), rt.show(rt.method(d2, "size", [])));
    let ta = rt.stampArray(rt.V.array(rt.GArray.of([])), "Vector2i", true);
    rt.method(ta, "resize", [rt.V.int(2)]);
    print(rt.show(ta));
    {
      const _nv = rt.writeIdx(ta, rt.V.int(0), rt.vector2iNew([rt.V.int(3), rt.V.int(4)]));
      if (_nv !== null) ta = _nv;
    }
    print(rt.show(ta), rt.show(rt.V.str(" ")), rt.show(rt.attribute(rt.index(ta, rt.V.int(0)), "y")));
    let tdi = rt.stampDict(rt.dictOf([]), "Vector2i", "int", true);
    {
      const _nv = rt.writeIdx(tdi, rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.int(5));
      if (_nv !== null) tdi = _nv;
    }
    print(rt.show(tdi), rt.show(rt.V.str(" ")), rt.show(rt.method(tdi, "get", [rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.str("M")])), rt.show(rt.V.str(" ")), rt.show(rt.method(tdi, "get", [rt.vector2iNew([rt.V.float(1.7), rt.V.float(2.2)]), rt.V.str("M")])));
    let sv = rt.V.array(rt.GArray.of([rt.vector2iNew([rt.V.int(3), rt.V.int(1)]), rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.vector2iNew([rt.V.int(3), rt.V.int(0)])]));
    rt.method(sv, "sort", []);
    print(rt.show(sv), rt.show(rt.V.str(" ")), rt.show(rt.method(sv, "has", [rt.vector2iNew([rt.V.int(1), rt.V.int(2)])])), rt.show(rt.V.str(" ")), rt.show(rt.method(sv, "count", [rt.vector2iNew([rt.V.float(1), rt.V.float(2)])])));
    this.bump(v);
    print(rt.show(v));
    this.quit();
  }
  
}

await new Main().run();
