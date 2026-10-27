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
      let m = rt.method(rt.nativeClass("Node2D"), "new", []);
      rt.frameLine(6);
      let r = rt.method(rt.nativeClass("RefCounted"), "new", []);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("d|v01|iid|"), rt.method(n, "get_instance_id", []), rt.V.str("|"), rt.typeOf(rt.method(n, "get_instance_id", []))]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("d|v02|iid|"), rt.method(r, "get_instance_id", []), rt.V.str("|"), rt.typeOf(rt.method(r, "get_instance_id", []))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("d|v03|"), rt.ops.eq(rt.gInstanceFromId(rt.method(n, "get_instance_id", [])), n), rt.V.str("|"), rt.gIsInstanceIdValid(rt.method(n, "get_instance_id", []))]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("d|v04|"), rt.ops.eq(rt.method(n, "get_instance_id", []), rt.method(n, "get_instance_id", [])), rt.V.str("|"), rt.ops.eq(rt.method(n, "get_instance_id", []), rt.method(m, "get_instance_id", []))]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("d|v05|"), rt.ops.eq(rt.gInstanceFromId(rt.V.int(12345)), rt.V.nil()), rt.V.str("|"), rt.gIsInstanceIdValid(rt.V.int(12345))]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("d|v06|"), rt.ops.eq(rt.gInstanceFromId(rt.method(r, "get_instance_id", [])), r), rt.V.str("|"), rt.typeOf(rt.gInstanceFromId(rt.method(r, "get_instance_id", [])))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("d|v07|"), rt.strBuiltin([rt.gInstanceFromId(rt.method(m, "get_instance_id", []))]), rt.V.str("|"), rt.strBuiltin([rt.gInstanceFromId(rt.method(n, "get_instance_id", []))])]));
      rt.frameLine(14);
      rt.method(m, "free", []);
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
