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
      let n = rt.method(rt.nativeClass("Node3D"), "new", []);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("n1|"), rt.wrapValue(rt.attribute(n, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation_degrees")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "scale")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "basis")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "transform"))]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("n2|"), rt.wrapValue(rt.attribute(n, "quaternion")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "top_level"))]));
      rt.frameLine(7);
      rt.method(n, "set_position", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]);
      rt.frameLine(8);
      rt.method(n, "set_rotation", [rt.vector3New([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3)])]);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("n3|"), rt.wrapValue(rt.attribute(n, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation_degrees"))]));
      rt.frameLine(10);
      rt.method(n, "set_rotation_degrees", [rt.vector3New([rt.V.int(15), rt.V.int(30), rt.V.int(45)])]);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("n4|"), rt.wrapValue(rt.attribute(n, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation_degrees"))]));
      rt.frameLine(12);
      rt.method(n, "set_scale", [rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)])]);
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("n5|"), rt.wrapValue(rt.attribute(n, "scale")), rt.V.str("|"), rt.method(n, "get_scale", [])]));
      rt.frameLine(14);
      rt.method(n, "set_transform", [rt.transform3dNew([rt.basisNew([rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.V.float(0.5)]), rt.vector3New([rt.V.int(7), rt.V.int(8), rt.V.int(9)])])]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("n6|"), rt.wrapValue(rt.attribute(n, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "scale")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "basis"))]));
      rt.frameLine(16);
      rt.method(n, "set_quaternion", [rt.quaternionNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]);
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("n7|"), rt.wrapValue(rt.attribute(n, "quaternion")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "basis"))]));
      rt.frameLine(18);
      rt.method(n, "set_as_top_level", [rt.V.bool(true)]);
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("n8|"), rt.wrapValue(rt.attribute(n, "top_level")), rt.V.str("|"), rt.method(n, "is_set_as_top_level", [])]));
      rt.frameLine(20);
      rt.method(n, "set_identity", []);
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("n9|"), rt.wrapValue(rt.attribute(n, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "scale")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "basis"))]));
      rt.frameLine(22);
      rt.method(n, "free", []);
      rt.frameLine(23);
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
