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
      let n = rt.method(rt.nativeClass("Node"), "new", []);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("n1|"), rt.method(n, "get_scene_file_path", []), rt.V.str("|"), rt.method(n, "get_process_priority", []), rt.V.str("|"), rt.method(n, "get_physics_process_priority", [])]));
      rt.frameLine(6);
      rt.method(n, "set_scene_file_path", [rt.V.str("res://x.gd")]);
      rt.frameLine(7);
      rt.method(n, "set_process_priority", [rt.V.int(3)]);
      rt.frameLine(8);
      rt.method(n, "set_physics_process_priority", [rt.V.int(4)]);
      rt.frameLine(9);
      {
        const _nv = rt.writeProp(n, "scene_file_path", rt.V.str("res://y.gd"));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(10);
      {
        const _nv = rt.writeProp(n, "process_priority", rt.V.int(5));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(11);
      {
        const _nv = rt.writeProp(n, "process_physics_priority", rt.V.int(6));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("n2|"), rt.method(n, "get_scene_file_path", []), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "scene_file_path")), rt.V.str("|"), rt.method(n, "get_process_priority", []), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "process_priority"))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("n3|"), rt.method(n, "get_physics_process_priority", []), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "process_physics_priority")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "process_mode"))]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("n4|"), rt.method(n, "is_processing_internal", []), rt.V.str("|"), rt.method(n, "is_physics_processing_internal", []), rt.V.str("|"), rt.method(n, "is_physics_interpolated", []), rt.V.str("|"), rt.method(n, "is_physics_interpolated_and_enabled", []), rt.V.str("|"), rt.method(n, "is_displayed_folded", [])]));
      rt.frameLine(15);
      rt.method(n, "free", []);
      rt.frameLine(16);
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
