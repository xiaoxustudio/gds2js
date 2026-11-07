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
      print(rt.showArgs([rt.V.str("c1|"), rt.basisStatic("IDENTITY"), rt.V.str("|"), rt.basisStatic("FLIP_X"), rt.V.str("|"), rt.basisStatic("FLIP_Y"), rt.V.str("|"), rt.basisStatic("FLIP_Z")]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("c2|"), rt.quaternionStatic("IDENTITY")]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("c3|"), rt.planeStatic("PLANE_XY"), rt.V.str("|"), rt.planeStatic("PLANE_XZ"), rt.V.str("|"), rt.planeStatic("PLANE_YZ")]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("c4|"), rt.transform2dStatic("IDENTITY"), rt.V.str("|"), rt.transform2dStatic("FLIP_X"), rt.V.str("|"), rt.transform2dStatic("FLIP_Y")]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("c5|"), rt.transform3dStatic("IDENTITY"), rt.V.str("|"), rt.transform3dStatic("FLIP_X"), rt.V.str("|"), rt.transform3dStatic("FLIP_Y"), rt.V.str("|"), rt.transform3dStatic("FLIP_Z")]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("c6|"), rt.projectionStatic("IDENTITY"), rt.V.str("|"), rt.projectionStatic("ZERO")]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("c7|"), rt.projectionStatic("PLANE_NEAR"), rt.V.str("|"), rt.projectionStatic("PLANE_FAR"), rt.V.str("|"), rt.projectionStatic("PLANE_LEFT"), rt.V.str("|"), rt.projectionStatic("PLANE_TOP"), rt.V.str("|"), rt.projectionStatic("PLANE_RIGHT"), rt.V.str("|"), rt.projectionStatic("PLANE_BOTTOM")]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("c8|"), rt.vector3Const("MODEL_LEFT"), rt.V.str("|"), rt.vector3Const("MODEL_RIGHT"), rt.V.str("|"), rt.vector3Const("MODEL_TOP"), rt.V.str("|"), rt.vector3Const("MODEL_BOTTOM"), rt.V.str("|"), rt.vector3Const("MODEL_FRONT"), rt.V.str("|"), rt.vector3Const("MODEL_REAR")]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("c9|"), rt.vector4Const("AXIS_W"), rt.V.str("|"), rt.vector4iConst("AXIS_W")]));
      rt.frameLine(13);
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
