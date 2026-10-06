// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.vector3iNew([rt.V.int(3), rt.V.int((-4)), rt.V.int(12)]);
    let b = rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
    print(rt.showArgs([rt.V.str("ctor "), rt.vector3iNew([]), rt.V.str(" "), a, rt.V.str(" "), rt.vector3iNew([rt.V.float(1.9), rt.V.float((-2.9)), rt.V.float(3.5)]), rt.V.str(" "), rt.vector3iNew([rt.V.int(2147483648), rt.V.int((-2148)), rt.V.int(0)]), rt.V.str(" "), rt.vector3iNew([b])]));
    print(rt.showArgs([rt.V.str("from "), rt.vector3iNew([rt.vector3New([rt.V.float(1.7), rt.V.float((-2.2)), rt.V.float(3.5)])]), rt.V.str(" "), rt.vector3New([b]), rt.V.str(" "), rt.typeOf(rt.vector3New([b]))]));
    print(rt.showArgs([rt.V.str("arith "), rt.ops.add(a, b), rt.V.str(" "), rt.ops.sub(a, b), rt.V.str(" "), rt.ops.mul(a, b), rt.V.str(" "), rt.ops.div(a, b), rt.V.str(" "), rt.ops.mod(a, b), rt.V.str(" "), rt.ops.neg(a)]));
    print(rt.showArgs([rt.V.str("scalar "), rt.ops.mul(a, rt.V.int(2)), rt.V.str(" "), rt.ops.mul(rt.V.int(2), a), rt.V.str(" "), rt.ops.div(a, rt.V.int((-2))), rt.V.str(" "), rt.ops.mod(a, rt.V.int((-2))), rt.V.str(" "), rt.ops.div(a, rt.V.float(4)), rt.V.str(" "), rt.ops.mul(a, rt.V.float(0.5))]));
    print(rt.showArgs([rt.V.str("wrap "), rt.ops.add(rt.vector3iNew([rt.V.int(2147483647), rt.V.int(0), rt.V.int(0)]), rt.vector3iNew([rt.V.int(1), rt.V.int(0), rt.V.int(0)])), rt.V.str(" "), rt.ops.sub(rt.vector3iNew([rt.V.int((-2147483648)), rt.V.int(0), rt.V.int(0)]), rt.vector3iNew([rt.V.int(1), rt.V.int(0), rt.V.int(0)]))]));
    print(rt.showArgs([rt.V.str("meth "), rt.method(a, "abs", []), rt.V.str(" "), rt.method(a, "sign", []), rt.V.str(" "), rt.method(a, "length", []), rt.V.str(" "), rt.method(a, "length_squared", []), rt.V.str(" "), rt.method(a, "min", [b]), rt.V.str(" "), rt.method(a, "max", [b])]));
    print(rt.showArgs([rt.V.str("more "), rt.method(a, "clamp", [rt.vector3iNew([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3iNew([rt.V.int(5), rt.V.int(5), rt.V.int(5)])]), rt.V.str(" "), rt.method(a, "snapped", [rt.vector3iNew([rt.V.int(5), rt.V.int(5), rt.V.int(5)])]), rt.V.str(" "), rt.method(a, "min_axis_index", []), rt.V.str(" "), rt.method(a, "max_axis_index", [])]));
    print(rt.showArgs([rt.V.str("dist "), rt.method(a, "distance_to", [rt.vector3iNew([])]), rt.V.str(" "), rt.method(a, "distance_squared_to", [rt.vector3iNew([rt.V.int(1), rt.V.int(1), rt.V.int(1)])]), rt.V.str(" "), rt.typeOf(rt.method(a, "distance_to", [rt.vector3iNew([])]))]));
    print(rt.showArgs([rt.V.str("static "), rt.vector3iConst("ZERO"), rt.V.str(" "), rt.vector3iConst("ONE"), rt.V.str(" "), rt.vector3iConst("MIN"), rt.V.str(" "), rt.vector3iConst("MAX"), rt.V.str(" "), rt.vector3iConst("UP"), rt.V.str(" "), rt.vector3iConst("DOWN"), rt.V.str(" "), rt.vector3iConst("LEFT"), rt.V.str(" "), rt.vector3iConst("RIGHT"), rt.V.str(" "), rt.vector3iConst("FORWARD"), rt.V.str(" "), rt.vector3iConst("BACK"), rt.V.str(" "), rt.vector3iConst("AXIS_X"), rt.V.str(" "), rt.vector3iConst("AXIS_Z")]));
    print(rt.showArgs([rt.V.str("cmp "), rt.ops.lt(a, b), rt.V.str(" "), rt.ops.lte(a, a), rt.V.str(" "), rt.ops.gt(a, b), rt.V.str(" "), rt.ops.eq(a, rt.vector3iNew([rt.V.int(3), rt.V.int((-4)), rt.V.int(12)])), rt.V.str(" "), rt.ops.neq(a, b), rt.V.str(" "), rt.typeOf(a), rt.V.str(" "), rt.isType(a, "Vector3i"), rt.V.str(" "), rt.isType(a, "Variant")]));
    let idx = rt.vector3iNew([rt.V.int(7), rt.V.int(8), rt.V.int(9)]);
    print(rt.showArgs([rt.V.str("index "), rt.wrapValue(rt.index(idx, rt.V.int(0))), rt.V.str(" "), rt.wrapValue(rt.index(idx, rt.V.int(1))), rt.V.str(" "), rt.wrapValue(rt.index(idx, rt.V.int(2))), rt.V.str(" "), rt.wrapValue(rt.index(idx, rt.V.str("y")))]));
    {
      const _nv = rt.writeIdx(idx, rt.V.int(1), rt.V.float(7.9));
      if (_nv !== null) idx = _nv;
    }
    {
      const _nv = rt.writeProp(idx, "z", rt.V.float((-0.9)));
      if (_nv !== null) idx = _nv;
    }
    print(rt.showArgs([rt.V.str("write "), idx, rt.V.str(" "), rt.wrapValue(rt.attribute(idx, "y")), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.attribute(idx, "z")))]));
    print(rt.showArgs([rt.V.str("str "), rt.strBuiltin([a]), rt.V.str(" "), rt.ops.add(rt.V.stringName("x"), rt.strBuiltin([a]))]));
    let d = rt.dictOf([[rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str("a")]]);
    {
      const _nv = rt.writeIdx(d, rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(4)]), rt.V.str("b"));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([rt.V.str("dict "), d, rt.V.str(" "), rt.method(d, "has", [rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]), rt.V.str(" "), rt.method(d, "size", [])]));
    let arr = rt.stampArray(rt.V.array(rt.GArray.of([rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])), "Vector3i", true);
    rt.method(arr, "append", [rt.vector3New([rt.V.float(4.7), rt.V.float(5.2), rt.V.float(6.9)])]);
    print(rt.showArgs([rt.V.str("typed "), arr, rt.V.str(" "), rt.wrapValue(rt.index(arr, rt.V.int(1))), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(arr, rt.V.int(0)))), rt.V.str(" "), rt.wrapValue(rt.attribute(rt.wrapValue(rt.index(arr, rt.V.int(0))), "z"))]));
    let p = rt.packCtor("vector3", [rt.V.array(rt.GArray.of([rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector2iNew([rt.V.int(4), rt.V.int(5)])]))]);
    rt.method(p, "append", [rt.vector3iNew([rt.V.int(7), rt.V.int(8), rt.V.int(9)])]);
    print(rt.showArgs([rt.V.str("pack "), p, rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(p, rt.V.int(0)))), rt.V.str(" "), rt.method(p, "count", [rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]), rt.V.str(" "), rt.method(p, "has", [rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]), rt.V.str(" "), rt.method(p, "find", [rt.vector3iNew([rt.V.int(7), rt.V.int(8), rt.V.int(9)])])]));
    let wv = rt.toVec3(rt.vector3iNew([rt.V.int(4), rt.V.int(5), rt.V.int(6)]));
    let wi = rt.toVec3i(rt.vector3New([rt.V.float(1.7), rt.V.float(2.2), rt.V.float(3.9)]));
    let v2i = rt.toVec2i(rt.vector2New([rt.V.float(1.7), rt.V.float((-2.9))]));
    print(rt.showArgs([rt.V.str("slot "), wv, rt.V.str(" "), rt.typeOf(wv), rt.V.str(" "), wi, rt.V.str(" "), rt.typeOf(wi), rt.V.str(" "), v2i, rt.V.str(" "), rt.typeOf(v2i)]));
    print(rt.showArgs([rt.V.str("as "), rt.wrapValue(rt.attribute(rt.asType(a, "Vector3"), "x")), rt.V.str(" "), rt.asType(a, "Variant")]));
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
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
