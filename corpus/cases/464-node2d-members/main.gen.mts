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
      let n = rt.method(rt.nativeClass("Node2D"), "new", []);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("m|a1|"), rt.wrapValue(rt.attribute(n, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "scale")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "transform"))]));
      rt.frameLine(6);
      {
        const _nv = rt.writeProp(n, "position", rt.vector2New([rt.V.float(1.5), rt.V.float((-2.25))]));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("m|a2|"), rt.wrapValue(rt.attribute(n, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "transform")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "global_position"))]));
      rt.frameLine(8);
      {
        const _nv = rt.writeProp(n, "rotation", rt.V.float(1));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("m|a3|"), rt.wrapValue(rt.attribute(n, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "transform"))]));
      rt.frameLine(10);
      {
        const _nv = rt.writeProp(n, "scale", rt.vector2New([rt.V.int(2), rt.V.float(0.5)]));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("m|a4|"), rt.wrapValue(rt.attribute(n, "scale")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "transform")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "position"))]));
      rt.frameLine(12);
      {
        const _nv = rt.writeProp(n, "transform", rt.transform2dNew([rt.V.int(0), rt.vector2New([rt.V.int(7), rt.V.int(8)])]));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("m|a5|"), rt.wrapValue(rt.attribute(n, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "scale"))]));
      rt.frameLine(14);
      {
        const _nv = rt.writeProp(n, "rotation_degrees", rt.V.float(90));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("m|a6|"), rt.wrapValue(rt.attribute(n, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation_degrees")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "transform"))]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("m|a7|"), rt.wrapValue(rt.attribute(n, "visible")), rt.V.str("|"), rt.method(n, "is_visible_in_tree", [])]));
      rt.frameLine(17);
      rt.method(n, "hide", []);
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("m|a8|"), rt.wrapValue(rt.attribute(n, "visible"))]));
      rt.frameLine(19);
      rt.method(n, "show", []);
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("m|a9|"), rt.wrapValue(rt.attribute(n, "visible"))]));
      rt.frameLine(21);
      {
        const _nv = rt.writeProp(n, "visible", rt.V.bool(false));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("m|a10|"), rt.wrapValue(rt.attribute(n, "visible")), rt.V.str("|"), rt.method(n, "is_visible_in_tree", [])]));
      rt.frameLine(23);
      let p = rt.method(rt.nativeClass("Node2D"), "new", []);
      rt.frameLine(24);
      {
        const _nv = rt.writeProp(p, "position", rt.vector2New([rt.V.int(3), rt.V.int(4)]));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(25);
      {
        const _nv = rt.writeProp(p, "rotation", rt.V.float(1.5707963705062866));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(26);
      let c = rt.method(rt.nativeClass("Node2D"), "new", []);
      rt.frameLine(27);
      rt.method(p, "add_child", [c]);
      rt.frameLine(28);
      {
        const _nv = rt.writeProp(c, "position", rt.vector2New([rt.V.int(1), rt.V.int(1)]));
        if (_nv !== null) c = _nv;
      }
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("m|b1|"), rt.wrapValue(rt.attribute(c, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "global_position")), rt.V.str("|"), rt.method(c, "get_global_transform", [])]));
      rt.frameLine(30);
      {
        const _nv = rt.writeProp(c, "global_position", rt.vector2New([rt.V.int(0), rt.V.int(0)]));
        if (_nv !== null) c = _nv;
      }
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("m|b2|"), rt.wrapValue(rt.attribute(c, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "transform"))]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("m|b3|"), rt.wrapValue(rt.attribute(n, "z_index")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "top_level")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "y_sort_enabled"))]));
      rt.frameLine(33);
      rt.method(n, "free", []);
      rt.frameLine(34);
      rt.method(p, "free", []);
      rt.frameLine(35);
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
