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
      let v = rt.method(rt.nativeClass("Engine"), "get_version_info", []);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("e1|"), rt.wrapValue(rt.index(v, rt.V.str("major"))), rt.V.str("|"), rt.wrapValue(rt.index(v, rt.V.str("minor"))), rt.V.str("|"), rt.wrapValue(rt.index(v, rt.V.str("patch"))), rt.V.str("|"), rt.wrapValue(rt.index(v, rt.V.str("status"))), rt.V.str("|"), rt.wrapValue(rt.index(v, rt.V.str("build")))]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("e2|"), rt.method(rt.nativeClass("Engine"), "get_architecture_name", []), rt.V.str("|"), rt.method(rt.method(rt.nativeClass("Engine"), "get_author_info", []), "has", [rt.V.str("developers")]), rt.V.str("|"), rt.method(rt.method(rt.nativeClass("Engine"), "get_donor_info", []), "has", [rt.V.str("patrons")]), rt.V.str("|"), rt.ops.gt(rt.method(rt.method(rt.nativeClass("Engine"), "get_license_info", []), "size", []), rt.V.int(0)), rt.V.str("|"), rt.ops.gt(rt.method(rt.method(rt.nativeClass("Engine"), "get_copyright_info", []), "size", []), rt.V.int(0)), rt.V.str("|"), rt.ops.gt(rt.method(rt.method(rt.nativeClass("Engine"), "get_license_text", []), "length", []), rt.V.int(0))]));
      rt.frameLine(7);
      rt.method(rt.nativeClass("Engine"), "set_max_fps", [rt.V.int(30)]);
      rt.frameLine(8);
      rt.method(rt.nativeClass("Engine"), "set_time_scale", [rt.V.float(2)]);
      rt.frameLine(9);
      rt.method(rt.nativeClass("Engine"), "set_physics_ticks_per_second", [rt.V.int(120)]);
      rt.frameLine(10);
      rt.method(rt.nativeClass("Engine"), "set_physics_jitter_fix", [rt.V.float(0.1)]);
      rt.frameLine(11);
      rt.method(rt.nativeClass("Engine"), "set_max_physics_steps_per_frame", [rt.V.int(4)]);
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("e3|"), rt.wrapValue(rt.attribute(rt.nativeClass("Engine"), "max_fps")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("Engine"), "time_scale")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("Engine"), "physics_ticks_per_second")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("Engine"), "physics_jitter_fix")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("Engine"), "max_physics_steps_per_frame"))]));
      rt.frameLine(13);
      rt.method(rt.nativeClass("Engine"), "set_max_fps", [rt.V.int(0)]);
      rt.frameLine(14);
      rt.method(rt.nativeClass("Engine"), "set_time_scale", [rt.V.float(1)]);
      rt.frameLine(15);
      rt.method(rt.nativeClass("Engine"), "set_physics_ticks_per_second", [rt.V.int(60)]);
      rt.frameLine(16);
      rt.method(rt.nativeClass("Engine"), "set_physics_jitter_fix", [rt.V.float(0.5)]);
      rt.frameLine(17);
      rt.method(rt.nativeClass("Engine"), "set_max_physics_steps_per_frame", [rt.V.int(8)]);
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("e4|"), rt.method(rt.nativeClass("Engine"), "has_singleton", [rt.V.str("Engine")]), rt.V.str("|"), rt.ops.gt(rt.method(rt.method(rt.nativeClass("Engine"), "get_singleton_list", []), "size", []), rt.V.int(0)), rt.V.str("|"), rt.ops.gte(rt.method(rt.nativeClass("Engine"), "get_script_language_count", []), rt.V.int(1))]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("e5|"), rt.method(rt.nativeClass("Engine"), "get_write_movie_path", []), rt.V.str("|"), rt.method(rt.nativeClass("Engine"), "is_embedded_in_editor", [])]));
      rt.frameLine(20);
      rt.method(rt.nativeClass("Engine"), "register_singleton", [rt.V.str("MySingleton"), rt.V.object(this)]);
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("e6|"), rt.method(rt.nativeClass("Engine"), "has_singleton", [rt.V.str("MySingleton")])]));
      rt.frameLine(22);
      rt.method(rt.nativeClass("Engine"), "unregister_singleton", [rt.V.str("MySingleton")]);
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("e7|"), rt.method(rt.nativeClass("Engine"), "has_singleton", [rt.V.str("MySingleton")])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("e8|"), rt.ops.gte(rt.method(rt.nativeClass("Engine"), "get_frames_drawn", []), rt.V.int(0)), rt.V.str("|"), rt.ops.gte(rt.method(rt.nativeClass("Engine"), "get_physics_frames", []), rt.V.int(0)), rt.V.str("|"), rt.ops.gte(rt.method(rt.nativeClass("Engine"), "get_process_frames", []), rt.V.int(0))]));
      rt.frameLine(25);
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
