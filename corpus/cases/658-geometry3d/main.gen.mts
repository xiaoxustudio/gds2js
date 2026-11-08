// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(4);
      print(rt.showArgs([rt.V.str("g1|"), rt.method(rt.nativeClass("Geometry3D"), "build_box_planes", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])]));
      rt.frameLine(5);
      let cyl = rt.method(rt.nativeClass("Geometry3D"), "build_cylinder_planes", [rt.V.int(1), rt.V.int(2), rt.V.int(8), rt.vector3Const("AXIS_Y")]);
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("g2|"), rt.method(cyl, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(cyl, rt.V.int(0))), rt.V.str("|"), rt.wrapValue(rt.index(cyl, rt.V.int(8))), rt.V.str("|"), rt.wrapValue(rt.index(cyl, rt.V.int(9)))]));
      rt.frameLine(7);
      let cap = rt.method(rt.nativeClass("Geometry3D"), "build_capsule_planes", [rt.V.int(1), rt.V.int(2), rt.V.int(8), rt.V.int(4), rt.vector3Const("AXIS_Y")]);
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("g3|"), rt.method(cap, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(cap, rt.V.int(0))), rt.V.str("|"), rt.wrapValue(rt.index(cap, rt.V.int(1))), rt.V.str("|"), rt.wrapValue(rt.index(cap, rt.V.int(7))), rt.V.str("|"), rt.wrapValue(rt.index(cap, rt.V.int(8))), rt.V.str("|"), rt.wrapValue(rt.index(cap, rt.V.int(9)))]));
      rt.frameLine(9);
      let tri = rt.packCtor("vector3", [rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(2), rt.V.int(0)])]))]);
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("g4|"), rt.method(rt.nativeClass("Geometry3D"), "clip_polygon", [tri, rt.planeNew([rt.vector3Const("UP"), rt.V.float(0.5)])])]));
      rt.frameLine(11);
      let quad = rt.packCtor("vector3", [rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int((-1)), rt.V.int(0), rt.V.int((-1))]), rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int((-1))]), rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(1)]), rt.vector3New([rt.V.int((-1)), rt.V.int(0), rt.V.int(1)])]))]);
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("g5|"), rt.method(rt.nativeClass("Geometry3D"), "clip_polygon", [quad, rt.planeNew([rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(1)]), rt.V.float(0.5)])])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("g6|"), rt.method(rt.nativeClass("Geometry3D"), "compute_convex_mesh_points", [rt.method(rt.nativeClass("Geometry3D"), "build_box_planes", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("g7|"), rt.method(rt.nativeClass("Geometry3D"), "get_closest_point_to_segment", [rt.vector3New([rt.V.int(5), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int((-1)), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)])])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("g8|"), rt.method(rt.nativeClass("Geometry3D"), "get_closest_point_to_segment_uncapped", [rt.vector3New([rt.V.int(5), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int((-1)), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)])])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("g9|"), rt.method(rt.nativeClass("Geometry3D"), "get_closest_points_between_segments", [rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(0)])])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("g10|"), rt.method(rt.nativeClass("Geometry3D"), "get_triangle_barycentric_coords", [rt.vector3New([rt.V.float(0.2), rt.V.float(0.3), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("g11|"), rt.method(rt.nativeClass("Geometry3D"), "ray_intersects_triangle", [rt.vector3New([rt.V.float(0.2), rt.V.float(0.2), rt.V.int((-1))]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(2)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("g12|"), rt.method(rt.nativeClass("Geometry3D"), "ray_intersects_triangle", [rt.vector3New([rt.V.int(2), rt.V.int(2), rt.V.int((-1))]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("g13|"), rt.method(rt.nativeClass("Geometry3D"), "segment_intersects_triangle", [rt.vector3New([rt.V.float(0.2), rt.V.float(0.2), rt.V.int((-1))]), rt.vector3New([rt.V.float(0.2), rt.V.float(0.2), rt.V.int(1)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("g14|"), rt.method(rt.nativeClass("Geometry3D"), "segment_intersects_triangle", [rt.vector3New([rt.V.float(0.2), rt.V.float(0.2), rt.V.int((-1))]), rt.vector3New([rt.V.float(0.2), rt.V.float(0.2), rt.V.float((-0.5))]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("g15|"), rt.method(rt.nativeClass("Geometry3D"), "segment_intersects_sphere", [rt.vector3New([rt.V.int((-2)), rt.V.float(0.5), rt.V.int(0)]), rt.vector3New([rt.V.int(2), rt.V.float(0.5), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.V.int(1)])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("g16|"), rt.method(rt.nativeClass("Geometry3D"), "segment_intersects_sphere", [rt.vector3New([rt.V.float(0.5), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.V.int(1)])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("g17|"), rt.method(rt.nativeClass("Geometry3D"), "segment_intersects_cylinder", [rt.vector3New([rt.V.int(0), rt.V.int((-2)), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(2), rt.V.int(0)]), rt.V.int(2), rt.V.int(1)])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("g18|"), rt.method(rt.nativeClass("Geometry3D"), "segment_intersects_cylinder", [rt.vector3New([rt.V.int((-2)), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)]), rt.V.int(2), rt.V.int(1)])]));
      rt.frameLine(26);
      let box = rt.method(rt.nativeClass("Geometry3D"), "build_box_planes", [rt.vector3New([rt.V.int(2), rt.V.int(2), rt.V.int(2)])]);
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("g19|"), rt.method(rt.nativeClass("Geometry3D"), "segment_intersects_convex", [rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int((-5))]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(5)]), box])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("g20|"), rt.method(rt.nativeClass("Geometry3D"), "segment_intersects_convex", [rt.vector3New([rt.V.int((-5)), rt.V.int(0), rt.V.int((-5))]), rt.vector3New([rt.V.int(5), rt.V.int(0), rt.V.int(5)]), box])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("g21|"), rt.method(rt.nativeClass("Geometry3D"), "segment_intersects_convex", [rt.vector3New([rt.V.int(0), rt.V.int((-1)), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(5), rt.V.int(0)]), box])]));
      rt.frameLine(30);
      let big = rt.method(rt.nativeClass("Geometry3D"), "build_box_planes", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]);
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("g22|"), rt.method(rt.nativeClass("Geometry3D"), "segment_intersects_convex", [rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int((-5))]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(5)]), big])]));
      rt.frameLine(32);
      let pts = rt.packCtor("vector3", [rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.vector3New([rt.V.float(0.2), rt.V.float(0.2), rt.V.float(0.2)])]))]);
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("g23|"), rt.method(rt.nativeClass("Geometry3D"), "tetrahedralize_delaunay", [pts])]));
      rt.frameLine(34);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
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
