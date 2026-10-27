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
      let p0 = rt.planeNew([]);
      rt.frameLine(5);
      let p1 = rt.planeNew([rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(1.5)]);
      rt.frameLine(6);
      let p2 = rt.planeNew([rt.V.int(0), rt.V.int(1), rt.V.int(0), rt.V.float(1.5)]);
      rt.frameLine(7);
      let p3 = rt.planeNew([rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)])]);
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("t01|"), rt.strBuiltin([p0]), rt.V.str("|"), rt.strBuiltin([p1]), rt.V.str("|"), rt.strBuiltin([p2]), rt.V.str("|"), rt.typeOf(p1)]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("t02|"), rt.wrapValue(rt.attribute(p1, "normal")), rt.V.str("|"), rt.wrapValue(rt.attribute(p1, "d")), rt.V.str("|"), rt.strBuiltin([p3])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("t03|"), rt.method(p1, "distance_to", [rt.vector3New([rt.V.int(0), rt.V.int(2), rt.V.int(0)])]), rt.V.str("|"), rt.method(p1, "distance_to", [rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)])]), rt.V.str("|"), rt.method(p1, "has_point", [rt.vector3New([rt.V.int(0), rt.V.float(1.5), rt.V.int(0)])]), rt.V.str("|"), rt.method(p1, "has_point", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("t04|"), rt.strBuiltin([rt.method(p1, "intersects_ray", [rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(2), rt.V.int(0)])])]), rt.V.str("|"), rt.strBuiltin([rt.method(p1, "normalized", [])])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("t05|"), rt.ops.eq(p1, p2), rt.V.str("|"), rt.ops.eq(p1, p0), rt.V.str("|"), rt.method(p1, "is_equal_approx", [p2]), rt.V.str("|"), rt.ops.eq(rt.variantHash([p1]), rt.variantHash([p2]))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("t06|"), rt.V.str(rt.varToStr(p1)), rt.V.str("|"), rt.ops.eq(rt.strToVar(rt.V.str(rt.varToStr(p1))), p1), rt.V.str("|"), rt.method(rt.gVarToBytes(p1), "size", []), rt.V.str("|"), rt.ops.eq(rt.gBytesToVar(rt.gVarToBytes(p1)), p1)]));
      rt.frameLine(14);
      let arr = rt.V.array(rt.GArray.of([p0, p1]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("t07|"), rt.method(arr, "size", []), rt.V.str("|"), rt.ops.eq(rt.wrapValue(rt.index(arr, rt.V.int(1), "Array[Plane]")), p1), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.index(arr, rt.V.int(0), "Array[Plane]"))])]));
      rt.frameLine(16);
      let d = rt.dictOf([[p1, rt.V.int(1)]]);
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("t08|"), rt.method(d, "size", []), rt.V.str("|"), rt.method(d, "has", [rt.planeNew([rt.V.int(0), rt.V.int(1), rt.V.int(0), rt.V.float(1.5)])]), rt.V.str("|"), rt.wrapValue(rt.index(d, p1))]));
      rt.frameLine(18);
      let z = rt.plane(0, 0, 0, 0);
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("t09|"), rt.strBuiltin([z]), rt.V.str("|"), rt.isType(z, "Plane"), rt.V.str("|"), rt.ops.neq(p1, p0)]));
      rt.frameLine(20);
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
