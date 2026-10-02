// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  m = rt.toVec2i(rt.vector2iNew([rt.V.int(1), rt.V.int(2)]));

  bump(p: rt.Variant): void {
    p = rt.paramSlot(p, "Vector2i", 1, "bump", this);
    {
      const _nv = rt.writeProp(p, "x", rt.V.int(7));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([p]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let w = rt.vector2iNew([rt.V.int(1), rt.V.int(2)]);
    print(rt.showArgs([w, rt.V.str(" "), rt.vector2iNew([]), rt.V.str(" "), rt.vector2iNew([rt.V.float((-1.7)), rt.V.float((-2.2))]), rt.V.str(" "), rt.vector2iNew([w]), rt.V.str(" "), rt.vector2iNew([rt.vector2New([rt.V.float(1.7), rt.V.float(2.2)])])]));
    print(rt.showArgs([rt.vector2New([w]), rt.V.str(" "), rt.vector2New([rt.vector2New([rt.V.int(3), rt.V.int(4)])])]));
    print(rt.showArgs([rt.wrapValue(rt.attribute(w, "x")), rt.V.str(" "), rt.wrapValue(rt.attribute(w, "y")), rt.V.str(" "), rt.wrapValue(rt.index(w, rt.V.int(0))), rt.V.str(" "), rt.wrapValue(rt.index(w, rt.V.str("y")))]));
    print(rt.showArgs([rt.ops.eq(w, rt.vector2iNew([rt.V.float(1), rt.V.float(2)])), rt.V.str(" "), rt.ops.neq(w, rt.vector2iNew([rt.V.int(1), rt.V.int(3)])), rt.V.str(" "), rt.ops.eq(w, rt.V.nil()), rt.V.str(" "), rt.ops.neq(w, rt.V.nil())]));
    print(rt.showArgs([rt.ops.lt(w, rt.vector2iNew([rt.V.int(1), rt.V.int(3)])), rt.V.str(" "), rt.ops.gt(w, rt.vector2iNew([rt.V.int(0), rt.V.int(9)])), rt.V.str(" "), rt.ops.lte(w, rt.vector2iNew([rt.V.int(1), rt.V.int(2)]))]));
    print(rt.showArgs([rt.ops.add(w, rt.vector2iNew([rt.V.int(3), rt.V.int((-4))])), rt.V.str(" | "), rt.ops.sub(w, rt.vector2iNew([rt.V.int(1), rt.V.int(1)])), rt.V.str(" | "), rt.ops.mul(w, rt.vector2iNew([rt.V.int(4), rt.V.int(5)])), rt.V.str(" | "), rt.ops.mul(w, rt.V.int(2)), rt.V.str(" | "), rt.ops.div(w, rt.vector2iNew([rt.V.int(2), rt.V.int(2)])), rt.V.str(" | "), rt.ops.neg(w)]));
    print(rt.showArgs([rt.ops.div(rt.vector2iNew([rt.V.int(7), rt.V.int((-7))]), rt.vector2iNew([rt.V.int(2), rt.V.int(2)])), rt.V.str(" | "), rt.ops.mod(rt.vector2iNew([rt.V.int((-7)), rt.V.int(7)]), rt.vector2iNew([rt.V.int(2), rt.V.int((-2))])), rt.V.str(" | "), rt.ops.mul(rt.vector2iNew([rt.V.int(6), rt.V.int(6)]), rt.V.float(0.5)), rt.V.str(" | "), rt.ops.div(rt.vector2iNew([rt.V.int(6), rt.V.int(6)]), rt.V.float(4))]));
    print(rt.showArgs([rt.ops.add(rt.vector2iNew([rt.V.int(2147483647), rt.V.int(0)]), rt.vector2iNew([rt.V.int(1), rt.V.int(0)])), rt.V.str(" | "), rt.ops.sub(rt.vector2iNew([rt.V.int((-2147483648)), rt.V.int(5)]), rt.vector2iNew([rt.V.int(1), rt.V.int(0)])), rt.V.str(" | "), rt.ops.mul(rt.vector2iNew([rt.V.int(2147483647), rt.V.int(0)]), rt.V.int(2))]));
    let big = rt.vector2iNew([rt.V.int(2147483647), rt.V.int(1)]);
    print(rt.showArgs([rt.ops.mul(big, rt.vector2iNew([rt.V.int(2), rt.V.int(2)])), rt.V.str(" | "), rt.ops.neg(big), rt.V.str(" | "), rt.method(big, "length_squared", [])]));
    let v = rt.vector2iNew([rt.V.int(1), rt.V.int(2)]);
    {
      const _nv = rt.writeProp(v, "x", rt.V.float(2.7));
      if (_nv !== null) v = _nv;
    }
    print(rt.showArgs([v, rt.V.str(" "), rt.wrapValue(rt.attribute(v, "x"))]));
    {
      const _nv = rt.writeIdx(v, rt.V.int(1), rt.V.float((-0.9)));
      if (_nv !== null) v = _nv;
    }
    print(rt.showArgs([v]));
    {
      const _nv = rt.writeProp(v, "x", rt.V.int(2147483648));
      if (_nv !== null) v = _nv;
    }
    print(rt.showArgs([v]));
    {
      const _nv = rt.writeProp(this.m, "y", rt.V.int(9));
      if (_nv !== null) this.m = _nv;
    }
    print(rt.showArgs([this.m]));
    let arr = rt.V.array(rt.GArray.of([rt.vector2iNew([rt.V.int(1), rt.V.int(2)])]));
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeProp(rt.index(arr, _w0), "x", rt.V.int(5));
      if (_nv !== null) rt.setIndex(arr, _w0, _nv);
    }
    print(rt.showArgs([arr]));
    let ddc = rt.dictOf([[rt.V.str("k"), rt.vector2iNew([rt.V.int(1), rt.V.int(2)])]]);
    {
    const _w0 = rt.V.str("k");
      const _nv = rt.writeProp(rt.index(ddc, _w0), "y", rt.V.int(8));
      if (_nv !== null) rt.setIndex(ddc, _w0, _nv);
    }
    print(rt.showArgs([ddc]));
    for (let x of rt.iter(arr)) {
      {
        const _nv = rt.writeProp(x, "y", rt.V.int(100));
        if (_nv !== null) x = _nv;
      }
    }
    print(rt.showArgs([arr]));
    let w2 = v;
    {
      const _nv = rt.writeProp(w2, "x", rt.V.int(42));
      if (_nv !== null) w2 = _nv;
    }
    print(rt.showArgs([v, rt.V.str(" "), w2]));
    let q = rt.vector2iNew([rt.V.int(3), rt.V.int((-4))]);
    print(rt.showArgs([rt.method(q, "length", []), rt.V.str(" | "), rt.method(q, "length_squared", []), rt.V.str(" | "), rt.method(q, "aspect", []), rt.V.str(" | "), rt.method(q, "abs", []), rt.V.str(" | "), rt.method(q, "sign", [])]));
    print(rt.showArgs([rt.method(q, "min", [rt.vector2iNew([rt.V.int(1), rt.V.int(9)])]), rt.V.str(" | "), rt.method(q, "max", [rt.vector2iNew([rt.V.int(1), rt.V.int(9)])]), rt.V.str(" | "), rt.method(q, "clamp", [rt.vector2iNew([rt.V.int(1), rt.V.int(1)]), rt.vector2iNew([rt.V.int(4), rt.V.int(4)])])]));
    let s7 = rt.vector2iNew([rt.V.int(7), rt.V.int(3)]);
    print(rt.showArgs([rt.method(s7, "snapped", [rt.vector2iNew([rt.V.int(2), rt.V.int(2)])]), rt.V.str(" | "), rt.method(s7, "distance_to", [rt.vector2iNew([rt.V.int(0), rt.V.int(0)])]), rt.V.str(" | "), rt.method(s7, "distance_squared_to", [rt.vector2iNew([rt.V.int(0), rt.V.int(0)])]), rt.V.str(" | "), rt.method(s7, "min_axis_index", []), rt.method(s7, "max_axis_index", [])]));
    print(rt.showArgs([rt.method(rt.vector2iNew([rt.V.int((-7)), rt.V.int(3)]), "snapped", [rt.vector2iNew([rt.V.int(2), rt.V.int(2)])]), rt.V.str(" | "), rt.method(rt.vector2iNew([rt.V.int((-7)), rt.V.int(3)]), "snapped", [rt.vector2iNew([rt.V.int(0), rt.V.int(1)])]), rt.V.str(" | "), rt.method(rt.vector2iNew([rt.V.int(0), rt.V.int(0)]), "length", []), rt.V.str(" | "), rt.method(rt.vector2iNew([rt.V.int(0), rt.V.int(0)]), "aspect", []), rt.V.str(" | "), rt.method(rt.vector2iNew([rt.V.int(3), rt.V.int(0)]), "aspect", [])]));
    print(rt.showArgs([rt.method(rt.vector2iConst("MIN"), "abs", []), rt.V.str(" | "), rt.ops.neg(rt.vector2iConst("MIN")), rt.V.str(" | "), rt.method(rt.vector2iConst("MIN"), "sign", [])]));
    print(rt.showArgs([rt.vector2iConst("ONE"), rt.V.str(" "), rt.vector2iConst("ZERO"), rt.V.str(" "), rt.vector2iConst("UP"), rt.V.str(" "), rt.vector2iConst("DOWN"), rt.V.str(" "), rt.vector2iConst("LEFT"), rt.V.str(" "), rt.vector2iConst("RIGHT"), rt.V.str(" "), rt.vector2iConst("MAX"), rt.V.str(" "), rt.vector2iConst("MIN")]));
    print(rt.showArgs([rt.typeOf(w), rt.V.str(" "), rt.isType(w, "Vector2i"), rt.V.str(" "), rt.isType(w, "Vector2"), rt.V.str(" "), rt.strBuiltin([w])]));
    let d = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d, rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.int(5));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([d, rt.V.str(" "), rt.method(d, "get", [rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.str("M")]), rt.V.str(" "), rt.method(d, "get", [rt.vector2iNew([rt.V.float(1.7), rt.V.float(2.2)]), rt.V.str("M")]), rt.V.str(" "), rt.method(d, "has", [rt.vector2iNew([rt.V.int(1), rt.V.int(3)])])]));
    let d2 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d2, rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.int(1));
      if (_nv !== null) d2 = _nv;
    }
    {
      const _nv = rt.writeIdx(d2, rt.vector2iNew([rt.V.float(1.7), rt.V.float(2.2)]), rt.V.int(2));
      if (_nv !== null) d2 = _nv;
    }
    print(rt.showArgs([d2, rt.V.str(" size="), rt.method(d2, "size", [])]));
    let ta = rt.stampArray(rt.V.array(rt.GArray.of([])), "Vector2i", true);
    rt.method(ta, "resize", [rt.V.int(2)]);
    print(rt.showArgs([ta]));
    {
      const _nv = rt.writeIdx(ta, rt.V.int(0), rt.vector2iNew([rt.V.int(3), rt.V.int(4)]));
      if (_nv !== null) ta = _nv;
    }
    print(rt.showArgs([ta, rt.V.str(" "), rt.wrapValue(rt.attribute(rt.wrapValue(rt.index(ta, rt.V.int(0))), "y"))]));
    let tdi = rt.stampDict(rt.dictOf([]), "Vector2i", "int", true);
    {
      const _nv = rt.writeIdx(tdi, rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.int(5));
      if (_nv !== null) tdi = _nv;
    }
    print(rt.showArgs([tdi, rt.V.str(" "), rt.method(tdi, "get", [rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.str("M")]), rt.V.str(" "), rt.method(tdi, "get", [rt.vector2iNew([rt.V.float(1.7), rt.V.float(2.2)]), rt.V.str("M")])]));
    let sv = rt.V.array(rt.GArray.of([rt.vector2iNew([rt.V.int(3), rt.V.int(1)]), rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.vector2iNew([rt.V.int(3), rt.V.int(0)])]));
    rt.method(sv, "sort", []);
    print(rt.showArgs([sv, rt.V.str(" "), rt.method(sv, "has", [rt.vector2iNew([rt.V.int(1), rt.V.int(2)])]), rt.V.str(" "), rt.method(sv, "count", [rt.vector2iNew([rt.V.float(1), rt.V.float(2)])])]));
    this.bump(v);
    print(rt.showArgs([v]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "bump": return rt.wrapValue(this.bump(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "bump": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
const __gd_entry = new Main();
await __gd_entry.run();
