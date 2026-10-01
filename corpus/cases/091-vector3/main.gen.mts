// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  m = rt.toVec3(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));

  bump(p): void {
    p = rt.paramSlot(p, "Vector3", 1, "bump", this);
    {
      const _nv = rt.writeProp(p, "x", rt.V.int(7));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([p]));
  }
  
  make(): unknown {
    let t = rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
    return t;
  }
  
  async _initialize(): Promise<void> {
    let v = rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
    print(rt.showArgs([v, rt.V.str(" "), rt.vector3New([]), rt.V.str(" "), rt.vector3New([v])]));
    print(rt.showArgs([rt.attribute(v, "x"), rt.V.str(" "), rt.attribute(v, "y"), rt.V.str(" "), rt.attribute(v, "z"), rt.V.str(" "), rt.index(v, rt.V.int(0)), rt.V.str(" "), rt.index(v, rt.V.int(2)), rt.V.str(" "), rt.index(v, rt.V.str("y"))]));
    print(rt.showArgs([rt.attribute(rt.vector3New([rt.V.float(0.1), rt.V.int(0), rt.V.int(0)]), "x")]));
    print(rt.showArgs([rt.ops.add(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.float(0.5), rt.V.int(0), rt.V.int(0)])), rt.V.str(" | "), rt.ops.sub(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]))]));
    print(rt.showArgs([rt.ops.mul(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.float(2.5)), rt.V.str(" | "), rt.ops.mul(rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.vector3New([rt.V.float(0.5), rt.V.int(1), rt.V.int(2)])), rt.V.str(" | "), rt.ops.div(rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.V.int(2)), rt.V.str(" | "), rt.ops.div(rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]))]));
    print(rt.showArgs([rt.ops.neg(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))]));
    let w = v;
    {
      const _nv = rt.writeProp(w, "z", rt.V.int(9));
      if (_nv !== null) w = _nv;
    }
    print(rt.showArgs([v, rt.V.str(" "), w]));
    let a = rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]));
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeProp(rt.index(a, _w0), "x", rt.V.int(5));
      if (_nv !== null) rt.setIndex(a, _w0, _nv);
    }
    print(rt.showArgs([a]));
    let d = rt.dictOf([[rt.V.str("k"), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]]);
    {
    const _w0 = rt.V.str("k");
      const _nv = rt.writeProp(rt.index(d, _w0), "y", rt.V.int(8));
      if (_nv !== null) rt.setIndex(d, _w0, _nv);
    }
    print(rt.showArgs([d]));
    {
      const _nv = rt.writeProp(this.m, "x", rt.V.int(4));
      if (_nv !== null) this.m = _nv;
    }
    print(rt.showArgs([this.m]));
    {
      const _nv = rt.writeIdx(v, rt.V.int(1), rt.V.float(2.5));
      if (_nv !== null) v = _nv;
    }
    {
      const _nv = rt.writeIdx(v, rt.V.str("z"), rt.V.int(1));
      if (_nv !== null) v = _nv;
    }
    print(rt.showArgs([v, rt.V.str(" "), rt.attribute(v, "y")]));
    print(rt.showArgs([rt.ops.lt(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(4)])), rt.V.str(" "), rt.ops.lt(rt.vector3New([rt.V.int(1), rt.V.int(3), rt.V.int(0)]), rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)])), rt.V.str(" "), rt.ops.lt(rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(9)]), rt.vector3New([rt.V.int(0), rt.V.int(2), rt.V.int(0)])), rt.V.str(" "), rt.ops.lte(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), rt.V.str(" "), rt.ops.gte(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(4)]))]));
    print(rt.showArgs([rt.ops.eq(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.float(3.0000001)])), rt.V.str(" "), rt.ops.eq(rt.vector3New([rt.V.float((0.1 + 0.2)), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.float(0.3), rt.V.int(0), rt.V.int(0)])), rt.V.str(" "), rt.ops.neq(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.nil()), rt.V.str(" "), rt.ops.eq(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.nil())]));
    print(rt.showArgs([rt.vector3Const("UP"), rt.V.str(" "), rt.vector3Const("DOWN"), rt.V.str(" "), rt.vector3Const("LEFT"), rt.V.str(" "), rt.vector3Const("RIGHT"), rt.V.str(" "), rt.vector3Const("FORWARD"), rt.V.str(" "), rt.vector3Const("BACK"), rt.V.str(" "), rt.vector3Const("ONE"), rt.V.str(" "), rt.vector3Const("ZERO"), rt.V.str(" "), rt.vector3Const("INF")]));
    print(rt.showArgs([rt.method(v, "length", []), rt.V.str(" "), rt.method(v, "length_squared", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(3), rt.V.int(4), rt.V.int(0)]), "length", [])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "dot", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "cross", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "cross", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(3), rt.V.int(4), rt.V.int(0)]), "normalized", []), rt.V.str(" "), rt.method(rt.vector3Const("ZERO"), "normalized", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "limit_length", [rt.V.float(1)]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3)]), "limit_length", [rt.V.float(10)])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "lerp", [rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.V.float(0.5)]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "distance_to", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(4)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "distance_squared_to", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(4)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "direction_to", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(4)])])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), "abs", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float((-1.5)), rt.V.int(0), rt.V.int(3)]), "sign", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(1.7), rt.V.float((-1.2)), rt.V.float(0.5)]), "floor", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(1.7), rt.V.float((-1.2)), rt.V.float(0.5)]), "ceil", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(1.5), rt.V.float(2.5), rt.V.float((-0.5))]), "round", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float((-1.5)), rt.V.float((-2.5)), rt.V.float(3.5)]), "round", [])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.float(1.2), rt.V.float(2.6), rt.V.float(3.1)]), "snapped", [rt.vector3New([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(1.4), rt.V.float(2.6), rt.V.float(3.1)]), "snappedf", [rt.V.float(1)])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "clamp", [rt.vector3New([rt.V.float(1.5), rt.V.float(1.5), rt.V.float(1.5)]), rt.vector3New([rt.V.float(2.5), rt.V.float(2.5), rt.V.float(2.5)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "min", [rt.vector3New([rt.V.int(2), rt.V.int(1), rt.V.int(5)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "max", [rt.vector3New([rt.V.int(2), rt.V.int(1), rt.V.int(5)])])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), "angle_to", [rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)])])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "cubic_interpolate", [rt.vector3New([rt.V.int(2), rt.V.int(2), rt.V.int(2)]), rt.vector3New([rt.V.int(3), rt.V.int(3), rt.V.int(3)]), rt.vector3New([rt.V.int(4), rt.V.int(4), rt.V.int(4)]), rt.V.float(0.5)])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "min_axis_index", []), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "max_axis_index", [])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "is_equal_approx", [rt.vector3New([rt.V.float(1.0000095), rt.V.int(2), rt.V.int(3)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "is_equal_approx", [rt.vector3New([rt.V.float(1.00001), rt.V.int(2), rt.V.int(3)])])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(3), rt.V.int(4), rt.V.int(5)]), "is_equal_approx", [rt.vector3New([rt.V.float(3.000029), rt.V.int(4), rt.V.int(5)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(3), rt.V.int(4), rt.V.int(5)]), "is_equal_approx", [rt.vector3New([rt.V.float(3.000031), rt.V.int(4), rt.V.int(5)])])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.float(0.001), rt.V.int(0), rt.V.int(0)]), "is_equal_approx", [rt.vector3New([rt.V.float(0.0010002), rt.V.int(0), rt.V.int(0)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "is_equal_approx", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(0.7071067811865475), rt.V.float(0.7071067811865475), rt.V.int(0)]), "is_normalized", [])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.float(1e+300), rt.V.int(0), rt.V.int(0)]), "is_finite", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "is_finite", [])]));
    print(rt.showArgs([rt.typeOf(v), rt.V.str(" "), rt.isType(v, "Vector3"), rt.V.str(" "), rt.isType(v, "Vector2"), rt.V.str(" "), rt.strOf(v)]));
    let dd = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(dd, rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.int(5));
      if (_nv !== null) dd = _nv;
    }
    print(rt.showArgs([dd, rt.V.str(" "), rt.method(dd, "get", [rt.vector3New([rt.V.float(1), rt.V.float(2), rt.V.float(3)]), rt.V.str("M")]), rt.V.str(" "), rt.method(dd, "has", [rt.vector3New([rt.V.int(9), rt.V.int(2), rt.V.int(3)])])]));
    let ta = rt.stampArray(rt.V.array(rt.GArray.of([])), "Vector3", true);
    rt.method(ta, "resize", [rt.V.int(2)]);
    print(rt.showArgs([ta]));
    {
      const _nv = rt.writeIdx(ta, rt.V.int(0), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
      if (_nv !== null) ta = _nv;
    }
    print(rt.showArgs([ta, rt.V.str(" "), rt.attribute(rt.index(ta, rt.V.int(0)), "z")]));
    let sv = rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(3), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)])]));
    rt.method(sv, "sort", []);
    print(rt.showArgs([sv]));
    print(rt.showArgs([rt.method(sv, "has", [rt.vector3New([rt.V.int(3), rt.V.int(1), rt.V.int(0)])]), rt.V.str(" "), rt.method(sv, "count", [rt.vector3New([rt.V.float(1), rt.V.float(2), rt.V.float(3)])])]));
    this.bump(v);
    print(rt.showArgs([v]));
    let r = this.make();
    {
      const _nv = rt.writeProp(r, "x", rt.V.int(3));
      if (_nv !== null) r = _nv;
    }
    print(rt.showArgs([r, rt.V.str(" "), this.make()]));
    let arr2 = rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]));
    for (let x of rt.iter(arr2)) {
      {
        const _nv = rt.writeProp(x, "z", rt.V.int(100));
        if (_nv !== null) x = _nv;
      }
    }
    print(rt.showArgs([arr2]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "bump": [1, 1], "make": [0, 0], "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
