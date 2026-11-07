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

  _on_sig(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "_on_sig");
    try {
      rt.frameLine(4);
      /* pass */
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(7);
      let n = rt.method(rt.nativeClass("Node"), "new", []);
      rt.frameLine(8);
      rt.method(rt.wrapValue(rt.attribute(n, "ready")), "connect", [rt.methodCallable(rt.V.object(this), "_on_sig")]);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("s|ready|"), rt.method(rt.wrapValue(rt.attribute(n, "ready")), "is_connected", [rt.methodCallable(rt.V.object(this), "_on_sig")])]));
      rt.frameLine(10);
      rt.method(rt.wrapValue(rt.attribute(n, "renamed")), "connect", [rt.methodCallable(rt.V.object(this), "_on_sig")]);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("s|renamed|"), rt.method(rt.wrapValue(rt.attribute(n, "renamed")), "is_connected", [rt.methodCallable(rt.V.object(this), "_on_sig")])]));
      rt.frameLine(12);
      rt.method(rt.wrapValue(rt.attribute(n, "tree_entered")), "connect", [rt.methodCallable(rt.V.object(this), "_on_sig")]);
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("s|tree_entered|"), rt.method(rt.wrapValue(rt.attribute(n, "tree_entered")), "is_connected", [rt.methodCallable(rt.V.object(this), "_on_sig")])]));
      rt.frameLine(14);
      rt.method(rt.wrapValue(rt.attribute(n, "tree_exiting")), "connect", [rt.methodCallable(rt.V.object(this), "_on_sig")]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("s|tree_exiting|"), rt.method(rt.wrapValue(rt.attribute(n, "tree_exiting")), "is_connected", [rt.methodCallable(rt.V.object(this), "_on_sig")])]));
      rt.frameLine(16);
      rt.method(rt.wrapValue(rt.attribute(n, "tree_exited")), "connect", [rt.methodCallable(rt.V.object(this), "_on_sig")]);
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("s|tree_exited|"), rt.method(rt.wrapValue(rt.attribute(n, "tree_exited")), "is_connected", [rt.methodCallable(rt.V.object(this), "_on_sig")])]));
      rt.frameLine(18);
      rt.method(rt.wrapValue(rt.attribute(n, "child_entered_tree")), "connect", [rt.methodCallable(rt.V.object(this), "_on_sig")]);
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("s|child_entered_tree|"), rt.method(rt.wrapValue(rt.attribute(n, "child_entered_tree")), "is_connected", [rt.methodCallable(rt.V.object(this), "_on_sig")])]));
      rt.frameLine(20);
      rt.method(rt.wrapValue(rt.attribute(n, "child_exiting_tree")), "connect", [rt.methodCallable(rt.V.object(this), "_on_sig")]);
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("s|child_exiting_tree|"), rt.method(rt.wrapValue(rt.attribute(n, "child_exiting_tree")), "is_connected", [rt.methodCallable(rt.V.object(this), "_on_sig")])]));
      rt.frameLine(22);
      rt.method(rt.wrapValue(rt.attribute(n, "child_order_changed")), "connect", [rt.methodCallable(rt.V.object(this), "_on_sig")]);
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("s|child_order_changed|"), rt.method(rt.wrapValue(rt.attribute(n, "child_order_changed")), "is_connected", [rt.methodCallable(rt.V.object(this), "_on_sig")])]));
      rt.frameLine(24);
      rt.method(rt.wrapValue(rt.attribute(n, "replacing_by")), "connect", [rt.methodCallable(rt.V.object(this), "_on_sig")]);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("s|replacing_by|"), rt.method(rt.wrapValue(rt.attribute(n, "replacing_by")), "is_connected", [rt.methodCallable(rt.V.object(this), "_on_sig")])]));
      rt.frameLine(26);
      rt.method(rt.wrapValue(rt.attribute(n, "property_list_changed")), "connect", [rt.methodCallable(rt.V.object(this), "_on_sig")]);
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("s|property_list_changed|"), rt.method(rt.wrapValue(rt.attribute(n, "property_list_changed")), "is_connected", [rt.methodCallable(rt.V.object(this), "_on_sig")])]));
      rt.frameLine(28);
      rt.method(rt.wrapValue(rt.attribute(n, "script_changed")), "connect", [rt.methodCallable(rt.V.object(this), "_on_sig")]);
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("s|script_changed|"), rt.method(rt.wrapValue(rt.attribute(n, "script_changed")), "is_connected", [rt.methodCallable(rt.V.object(this), "_on_sig")])]));
      rt.frameLine(30);
      let v = rt.method(rt.nativeClass("Node3D"), "new", []);
      rt.frameLine(31);
      rt.method(rt.wrapValue(rt.attribute(v, "visibility_changed")), "connect", [rt.methodCallable(rt.V.object(this), "_on_sig")]);
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("s|visibility_changed|"), rt.method(rt.wrapValue(rt.attribute(v, "visibility_changed")), "is_connected", [rt.methodCallable(rt.V.object(this), "_on_sig")])]));
      rt.frameLine(33);
      let c = rt.method(rt.nativeClass("Control"), "new", []);
      rt.frameLine(34);
      rt.method(rt.wrapValue(rt.attribute(c, "resized")), "connect", [rt.methodCallable(rt.V.object(this), "_on_sig")]);
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("s|resized|"), rt.method(rt.wrapValue(rt.attribute(c, "resized")), "is_connected", [rt.methodCallable(rt.V.object(this), "_on_sig")])]));
      rt.frameLine(36);
      rt.method(rt.wrapValue(rt.attribute(c, "size_flags_changed")), "connect", [rt.methodCallable(rt.V.object(this), "_on_sig")]);
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("s|size_flags_changed|"), rt.method(rt.wrapValue(rt.attribute(c, "size_flags_changed")), "is_connected", [rt.methodCallable(rt.V.object(this), "_on_sig")])]));
      rt.frameLine(38);
      rt.method(rt.wrapValue(rt.attribute(c, "minimum_size_changed")), "connect", [rt.methodCallable(rt.V.object(this), "_on_sig")]);
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("s|minimum_size_changed|"), rt.method(rt.wrapValue(rt.attribute(c, "minimum_size_changed")), "is_connected", [rt.methodCallable(rt.V.object(this), "_on_sig")])]));
      rt.frameLine(40);
      rt.method(n, "free", []);
      rt.frameLine(41);
      rt.method(v, "free", []);
      rt.frameLine(42);
      rt.method(c, "free", []);
      rt.frameLine(43);
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
      case "_on_sig": return rt.wrapValue(this._on_sig());
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_on_sig": [0, 0], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
