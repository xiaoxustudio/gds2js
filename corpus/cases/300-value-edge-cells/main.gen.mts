// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let pz = rt.toFloat(rt.V.float(0));
    let nz = rt.toFloat(rt.ops.mul(pz, rt.V.float((-1))));
    for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector2New([pz, nz]), rt.vector2New([rt.V.float((-1.5)), rt.V.float(2.5)]), rt.vector2New([NAN, rt.V.int(1)]), rt.vector2New([INF, rt.ops.neg(INF)]), rt.vector2New([rt.V.float(0.49999997), rt.V.float(1.5)])])))) {
      print(rt.showArgs([rt.V.str("V2A|"), rt.method(v, "sign", []), rt.V.str("|"), rt.method(v, "abs", []), rt.V.str("|"), rt.method(v, "floor", []), rt.V.str("|"), rt.method(v, "ceil", []), rt.V.str("|"), rt.method(v, "round", []), rt.V.str("|"), rt.method(v, "aspect", []), rt.V.str("|"), rt.method(v, "length", []), rt.V.str("|"), rt.method(v, "length_squared", []), rt.V.str("|"), rt.method(v, "is_normalized", []), rt.V.str("|"), rt.method(v, "is_finite", []), rt.V.str("|"), rt.method(v, "is_zero_approx", [])]));
      print(rt.showArgs([rt.V.str("V2B|"), rt.method(v, "lerp", [rt.vector2New([rt.V.int(1), rt.V.int((-1))]), rt.V.float(0.3)]), rt.V.str("|"), rt.method(v, "slerp", [rt.vector2New([rt.V.int(1), rt.V.int((-1))]), rt.V.float(0.3)]), rt.V.str("|"), rt.method(v, "snapped", [rt.vector2New([rt.V.float(0.5), rt.V.float(0.5)])]), rt.V.str("|"), rt.method(v, "limit_length", [rt.V.float(1.7)]), rt.V.str("|"), rt.method(v, "normalized", []), rt.V.str("|"), rt.method(v, "rotated", [rt.V.float(0.3)]), rt.V.str("|"), rt.method(v, "move_toward", [rt.vector2New([rt.V.float(0.3), rt.V.float((-0.7))]), rt.V.float(1.3)])]));
      print(rt.showArgs([rt.V.str("V2C|"), rt.method(v, "dot", [rt.vector2New([rt.V.float(2.5), rt.V.float(3.5)])]), rt.V.str("|"), rt.method(v, "cross", [rt.vector2New([rt.V.float(2.5), rt.V.float(3.5)])]), rt.V.str("|"), rt.method(v, "distance_to", [rt.vector2New([rt.V.float(0.3), rt.V.float((-0.7))])]), rt.V.str("|"), rt.method(v, "angle_to", [rt.vector2New([rt.V.float(2.5), rt.V.float(3.5)])]), rt.V.str("|"), rt.method(v, "direction_to", [rt.vector2New([rt.V.float(0.3), rt.V.float((-0.7))])]), rt.V.str("|"), rt.method(v, "cubic_interpolate", [rt.vector2New([rt.V.float(0.3), rt.V.float((-0.7))]), rt.vector2New([rt.V.float(2.5), rt.V.float(2.5)]), rt.vector2New([rt.V.float((-1.5)), rt.V.float(4.5)]), rt.V.float(0.3)]), rt.V.str("|"), rt.method(v, "bezier_interpolate", [rt.vector2New([rt.V.float(0.3), rt.V.float((-0.7))]), rt.vector2New([rt.V.float(2.5), rt.V.float(2.5)]), rt.vector2New([rt.V.float((-1.5)), rt.V.float(4.5)]), rt.V.float(0.3)])]));
    }
    for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector2iNew([rt.V.int(3), rt.V.int((-4))]), rt.vector2iNew([rt.V.int((-1)), rt.V.int(1)]), rt.vector2iNew([rt.V.int(2147483647), rt.V.int((-2147483648))]), rt.vector2iNew([rt.V.int(0), rt.V.int(0)])])))) {
      print(rt.showArgs([rt.V.str("V2I|"), rt.method(v, "sign", []), rt.V.str("|"), rt.method(v, "abs", []), rt.V.str("|"), rt.method(v, "min", [rt.vector2iNew([rt.V.int(2), rt.V.int((-2))])]), rt.V.str("|"), rt.method(v, "max", [rt.vector2iNew([rt.V.int(2), rt.V.int((-2))])]), rt.V.str("|"), rt.method(v, "snapped", [rt.vector2iNew([rt.V.int(0), rt.V.int(5)])]), rt.V.str("|"), rt.method(v, "length_squared", []), rt.V.str("|"), rt.method(v, "aspect", []), rt.V.str("|"), rt.method(v, "distance_to", [rt.vector2iNew([rt.V.int(7), rt.V.int(9)])]), rt.V.str("|"), rt.method(v, "clampi", [rt.V.int((-2)), rt.V.int(2)]), rt.V.str("|"), rt.method(v, "snappedi", [rt.V.int(5)])]));
    }
    for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector3New([pz, nz, rt.V.float(1.5)]), rt.vector3New([rt.V.float((-1.5)), rt.V.float(2.5), rt.V.float((-0.3))]), rt.vector3New([NAN, rt.V.int(1), rt.V.int(2)]), rt.vector3New([INF, rt.ops.neg(INF), rt.V.int(0)]), rt.vector3New([rt.V.float(0.49999997), rt.V.float(1.5), rt.V.float(2.5)])])))) {
      print(rt.showArgs([rt.V.str("V3A|"), rt.method(v, "sign", []), rt.V.str("|"), rt.method(v, "abs", []), rt.V.str("|"), rt.method(v, "floor", []), rt.V.str("|"), rt.method(v, "ceil", []), rt.V.str("|"), rt.method(v, "round", []), rt.V.str("|"), rt.method(v, "length", []), rt.V.str("|"), rt.method(v, "length_squared", []), rt.V.str("|"), rt.method(v, "inverse", []), rt.V.str("|"), rt.method(v, "is_normalized", []), rt.V.str("|"), rt.method(v, "min_axis_index", []), rt.V.str("|"), rt.method(v, "max_axis_index", [])]));
      print(rt.showArgs([rt.V.str("V3B|"), rt.method(v, "lerp", [rt.vector3New([rt.V.int(1), rt.V.int((-1)), rt.V.int(2)]), rt.V.float(0.3)]), rt.V.str("|"), rt.method(v, "snappedf", [rt.V.float(0.5)]), rt.V.str("|"), rt.method(v, "clampf", [rt.V.float((-1.5)), rt.V.float(0.7)]), rt.V.str("|"), rt.method(v, "limit_length", [rt.V.float(1.7)]), rt.V.str("|"), rt.method(v, "normalized", []), rt.V.str("|"), rt.method(v, "dot", [rt.vector3New([rt.V.float(2.5), rt.V.float(3.5), rt.V.float((-0.5))])]), rt.V.str("|"), rt.method(v, "cross", [rt.vector3New([rt.V.float(2.5), rt.V.float(3.5), rt.V.float((-0.5))])]), rt.V.str("|"), rt.method(v, "angle_to", [rt.vector3New([rt.V.float(2.5), rt.V.float(3.5), rt.V.float((-0.5))])]), rt.V.str("|"), rt.method(v, "slerp", [rt.vector3New([rt.V.int(1), rt.V.int((-1)), rt.V.int(2)]), rt.V.float(0.3)])]));
      print(rt.showArgs([rt.V.str("V3C|"), rt.method(v, "cubic_interpolate", [rt.vector3New([rt.V.float(0.3), rt.V.float((-0.7)), rt.V.float(2.5)]), rt.vector3New([rt.V.float(2.5), rt.V.float(2.5), rt.V.float((-1.5))]), rt.vector3New([rt.V.float((-1.5)), rt.V.float(4.5), rt.V.float(0.125)]), rt.V.float(0.3)]), rt.V.str("|"), rt.method(v, "bezier_interpolate", [rt.vector3New([rt.V.float(0.3), rt.V.float((-0.7)), rt.V.float(2.5)]), rt.vector3New([rt.V.float(2.5), rt.V.float(2.5), rt.V.float((-1.5))]), rt.vector3New([rt.V.float((-1.5)), rt.V.float(4.5), rt.V.float(0.125)]), rt.V.float(0.3)]), rt.V.str("|"), rt.method(v, "slide", [rt.vector3New([rt.V.float(0.6), rt.V.float(0.8), rt.V.int(0)])]), rt.V.str("|"), rt.method(v, "project", [rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.float(0.5)])]), rt.V.str("|"), rt.method(v, "bounce", [rt.vector3New([rt.V.float(0.6), rt.V.float(0.8), rt.V.int(0)])]), rt.V.str("|"), rt.method(v, "signed_angle_to", [rt.vector3New([rt.V.float(2.5), rt.V.float(3.5), rt.V.float((-0.5))]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)])])]));
    }
    for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector3iNew([rt.V.int(3), rt.V.int((-4)), rt.V.int(5)]), rt.vector3iNew([rt.V.int((-1)), rt.V.int(1), rt.V.int(0)]), rt.vector3iNew([rt.V.int(2147483647), rt.V.int((-2147483648)), rt.V.int(1)]), rt.vector3iNew([rt.V.int(0), rt.V.int(0), rt.V.int(0)])])))) {
      print(rt.showArgs([rt.V.str("V3I|"), rt.method(v, "sign", []), rt.V.str("|"), rt.method(v, "abs", []), rt.V.str("|"), rt.method(v, "min", [rt.vector3iNew([rt.V.int(2), rt.V.int((-2)), rt.V.int(2)])]), rt.V.str("|"), rt.method(v, "snapped", [rt.vector3iNew([rt.V.int(0), rt.V.int(5), rt.V.int(5)])]), rt.V.str("|"), rt.method(v, "length_squared", []), rt.V.str("|"), rt.method(v, "distance_to", [rt.vector3iNew([rt.V.int(7), rt.V.int(9), rt.V.int(11)])]), rt.V.str("|"), rt.method(v, "clampi", [rt.V.int((-2)), rt.V.int(2)]), rt.V.str("|"), rt.method(v, "snappedi", [rt.V.int(5)]), rt.V.str("|"), rt.method(v, "min_axis_index", []), rt.V.str("|"), rt.method(v, "max_axis_index", [])]));
    }
    for (let c of rt.iter(rt.V.array(rt.GArray.of([rt.colorNew([pz, nz, rt.V.float(0.5), rt.V.int(1)]), rt.colorNew([rt.V.float((-0.2)), rt.V.float(1.5), rt.V.float(0.0031308), rt.V.float(0.5)]), rt.colorNew([NAN, rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)]), rt.colorNew([INF, rt.ops.neg(INF), rt.V.float(0.25), rt.V.int(1)]), rt.colorNew([rt.V.float(1.0039), rt.V.float(0.49999), rt.V.float(0.5000001), rt.V.float(0.99999)])])))) {
      print(rt.showArgs([rt.V.str("C|"), rt.method(c, "lightened", [rt.V.float(0.3)]), rt.V.str("|"), rt.method(c, "darkened", [rt.V.float(0.3)]), rt.V.str("|"), rt.method(c, "inverted", []), rt.V.str("|"), rt.method(c, "get_luminance", []), rt.V.str("|"), rt.method(c, "lerp", [rt.colorNew([rt.V.float(0.2), rt.V.float(0.4), rt.V.float(0.6), rt.V.float(0.8)]), rt.V.float(0.3)]), rt.V.str("|"), rt.method(c, "blend", [rt.colorNew([rt.V.float(0.2), rt.V.float(0.4), rt.V.float(0.6), rt.V.float(0.3)])]), rt.V.str("|"), rt.method(c, "to_html", []), rt.V.str("|"), rt.method(c, "to_html", [rt.V.bool(false)]), rt.V.str("|"), rt.method(c, "to_rgba32", []), rt.V.str("|"), rt.method(c, "is_equal_approx", [rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)])])]));
    }
    print(rt.showArgs([rt.V.str("SNAPX|"), rt.method(rt.vector3iNew([rt.V.int(2147483647), rt.V.int(2147483647), rt.V.int((-2147483648))]), "length_squared", []), rt.V.str("|"), rt.method(rt.vector3iNew([rt.V.int(2147483647), rt.V.int((-2147483648)), rt.V.int(1)]), "distance_squared_to", [rt.vector3iNew([rt.V.int((-7)), rt.V.int((-9)), rt.V.int((-11))])]), rt.V.str("|"), rt.method(rt.vector2iNew([rt.V.int(2147483647), rt.V.int((-2147483648))]), "distance_squared_to", [rt.vector2iNew([rt.V.int((-7)), rt.V.int((-9))])])]));
    let b2 = rt.vector2New([rt.V.float(10000000), rt.V.float(20000001.5)]);
    print(rt.showArgs([rt.V.str("EB2|"), rt.method(b2, "bezier_interpolate", [rt.vector2New([rt.V.float(0.3), rt.V.float((-0.7))]), rt.vector2New([rt.V.float(2.5), rt.V.float(2.5)]), rt.vector2New([rt.V.float((-1.5)), rt.V.float(4.5)]), rt.V.float(0.3)]), rt.V.str("|"), rt.method(b2, "cubic_interpolate", [rt.vector2New([rt.V.float(0.3), rt.V.float((-0.7))]), rt.vector2New([rt.V.float(2.5), rt.V.float(2.5)]), rt.vector2New([rt.V.float((-1.5)), rt.V.float(4.5)]), rt.V.float(0.3)])]));
    print(rt.showArgs([rt.V.str("EO2|"), rt.method(b2, "limit_length", [rt.V.float(1.7)]), rt.V.str("|"), rt.method(b2, "normalized", []), rt.V.str("|"), rt.method(b2, "angle_to", [rt.vector2New([rt.V.float(1), rt.V.float((-1))])]), rt.V.str("|"), rt.method(b2, "distance_to", [rt.vector2New([rt.V.float((-3)), rt.V.float(5.5)])]), rt.V.str("|"), rt.method(b2, "length", []), rt.V.str("|"), rt.method(b2, "length_squared", [])]));
    let b3 = rt.vector3New([rt.V.float(10000000), rt.V.float(20000001.5), rt.V.float((-3000000.25))]);
    print(rt.showArgs([rt.V.str("EB3|"), rt.method(b3, "bezier_interpolate", [rt.vector3New([rt.V.float(0.3), rt.V.float((-0.7)), rt.V.float(2.5)]), rt.vector3New([rt.V.float(2.5), rt.V.float(2.5), rt.V.float((-1.5))]), rt.vector3New([rt.V.float((-1.5)), rt.V.float(4.5), rt.V.float(0.125)]), rt.V.float(0.3)]), rt.V.str("|"), rt.method(b3, "cubic_interpolate", [rt.vector3New([rt.V.float(0.3), rt.V.float((-0.7)), rt.V.float(2.5)]), rt.vector3New([rt.V.float(2.5), rt.V.float(2.5), rt.V.float((-1.5))]), rt.vector3New([rt.V.float((-1.5)), rt.V.float(4.5), rt.V.float(0.125)]), rt.V.float(0.3)])]));
    print(rt.showArgs([rt.V.str("EO3|"), rt.method(b3, "project", [rt.vector3New([rt.V.float(2), rt.V.float(3), rt.V.float(0.5)])]), rt.V.str("|"), rt.method(b3, "slide", [rt.vector3New([rt.V.float(0.6), rt.V.float(0.8), rt.V.float(0)])]), rt.V.str("|"), rt.method(b3, "bounce", [rt.vector3New([rt.V.float(0.6), rt.V.float(0.8), rt.V.float(0)])]), rt.V.str("|"), rt.method(b3, "length", []), rt.V.str("|"), rt.method(b3, "length_squared", []), rt.V.str("|"), rt.method(b3, "distance_to", [rt.vector3New([rt.V.float((-3)), rt.V.float(5.5), rt.V.float(7)])])]));
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
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
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
