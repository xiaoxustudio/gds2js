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
      print(rt.showArgs([rt.V.str("n|a1|"), rt.wrapValue(rt.attribute(n, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation_degrees")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "scale")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "visible")), rt.V.str("|"), rt.method(n, "get_class", [])]));
      rt.frameLine(6);
      {
        const _nv = rt.writeProp(n, "position", rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(7);
      {
        const _nv = rt.writeProp(n, "rotation", rt.vector3New([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3)]));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(8);
      {
        const _nv = rt.writeProp(n, "scale", rt.vector3New([rt.V.int(2), rt.V.int(2), rt.V.int(2)]));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("n|a2|"), rt.wrapValue(rt.attribute(n, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation_degrees")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "scale"))]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("n|a3|"), rt.wrapValue(rt.attribute(n, "basis"))]));
      rt.frameLine(11);
      let c = rt.method(rt.nativeClass("Node3D"), "new", []);
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("n|a4|"), rt.wrapValue(rt.attribute(c, "basis")), rt.V.str("|"), rt.strBuiltin([n])]));
      rt.frameLine(13);
      {
        const _nv = rt.writeProp(n, "visible", rt.V.bool(false));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("n|a5|"), rt.wrapValue(rt.attribute(n, "visible"))]));
      rt.frameLine(15);
      rt.method(n, "free", []);
      rt.frameLine(16);
      rt.method(c, "free", []);
      rt.frameLine(17);
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
