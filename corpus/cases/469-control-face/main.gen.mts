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
      let c = rt.method(rt.nativeClass("Control"), "new", []);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("c|a1|"), rt.wrapValue(rt.attribute(c, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "size")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "scale")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "pivot_offset")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "visible"))]));
      rt.frameLine(6);
      {
        const _nv = rt.writeProp(c, "position", rt.vector2New([rt.V.int(3), rt.V.int(4)]));
        if (_nv !== null) c = _nv;
      }
      rt.frameLine(7);
      {
        const _nv = rt.writeProp(c, "size", rt.vector2New([rt.V.int(10), rt.V.int(20)]));
        if (_nv !== null) c = _nv;
      }
      rt.frameLine(8);
      {
        const _nv = rt.writeProp(c, "rotation", rt.V.float(0.5));
        if (_nv !== null) c = _nv;
      }
      rt.frameLine(9);
      {
        const _nv = rt.writeProp(c, "scale", rt.vector2New([rt.V.int(2), rt.V.int(2)]));
        if (_nv !== null) c = _nv;
      }
      rt.frameLine(10);
      {
        const _nv = rt.writeProp(c, "pivot_offset", rt.vector2New([rt.V.int(1), rt.V.int(1)]));
        if (_nv !== null) c = _nv;
      }
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("c|a2|"), rt.wrapValue(rt.attribute(c, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "size")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "scale")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "pivot_offset")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "global_position"))]));
      rt.frameLine(12);
      let p = rt.method(rt.nativeClass("Control"), "new", []);
      rt.frameLine(13);
      rt.method(c, "add_child", [p]);
      rt.frameLine(14);
      {
        const _nv = rt.writeProp(p, "position", rt.vector2New([rt.V.int(1), rt.V.int(1)]));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(15);
      {
        const _nv = rt.writeProp(p, "size", rt.vector2New([rt.V.int(5), rt.V.int(5)]));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("c|a3|"), rt.wrapValue(rt.attribute(p, "global_position")), rt.V.str("|"), rt.wrapValue(rt.attribute(p, "size")), rt.V.str("|"), rt.method(p, "get_global_transform", [])]));
      rt.frameLine(17);
      {
        const _nv = rt.writeProp(c, "visible", rt.V.bool(false));
        if (_nv !== null) c = _nv;
      }
      rt.frameLine(18);
      rt.method(c, "hide", []);
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("c|a4|"), rt.wrapValue(rt.attribute(c, "visible"))]));
      rt.frameLine(20);
      rt.method(c, "show", []);
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("c|a5|"), rt.wrapValue(rt.attribute(c, "visible")), rt.V.str("|"), rt.method(c, "get_class", []), rt.V.str("|"), rt.strBuiltin([c])]));
      rt.frameLine(22);
      rt.method(p, "free", []);
      rt.frameLine(23);
      rt.method(c, "free", []);
      rt.frameLine(24);
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
