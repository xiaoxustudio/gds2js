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

  _show(tag: rt.Variant, n: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "_show");
    try {
      tag = rt.paramSlot(tag, "String", 1, "_show", this);
      rt.frameLine(4);
      print(rt.showArgs([tag, rt.V.str("|"), rt.wrapValue(rt.attribute(n, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "rotation_degrees")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "scale")), rt.V.str("|"), rt.wrapValue(rt.attribute(n, "skew"))]));
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
      let a = rt.method(rt.nativeClass("Node2D"), "new", []);
      rt.frameLine(8);
      let b = rt.method(rt.nativeClass("Node2D"), "new", []);
      rt.frameLine(9);
      rt.method(a, "add_child", [b]);
      rt.frameLine(10);
      {
        const _nv = rt.writeProp(a, "position", rt.vector2New([rt.V.int(10), rt.V.int(20)]));
        if (_nv !== null) a = _nv;
      }
      rt.frameLine(11);
      {
        const _nv = rt.writeProp(a, "rotation", rt.V.float(0.5));
        if (_nv !== null) a = _nv;
      }
      rt.frameLine(12);
      {
        const _nv = rt.writeProp(a, "scale", rt.vector2New([rt.V.int(2), rt.V.int(3)]));
        if (_nv !== null) a = _nv;
      }
      rt.frameLine(13);
      {
        const _nv = rt.writeProp(a, "skew", rt.V.float(0.25));
        if (_nv !== null) a = _nv;
      }
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("a1|"), rt.method(a, "get_position", []), rt.V.str("|"), rt.method(a, "get_rotation", []), rt.V.str("|"), rt.method(a, "get_rotation_degrees", []), rt.V.str("|"), rt.method(a, "get_scale", []), rt.V.str("|"), rt.method(a, "get_skew", [])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("a2|"), rt.wrapValue(rt.attribute(a, "global_position")), rt.V.str("|"), rt.wrapValue(rt.attribute(a, "global_rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(a, "global_rotation_degrees")), rt.V.str("|"), rt.wrapValue(rt.attribute(a, "global_scale")), rt.V.str("|"), rt.wrapValue(rt.attribute(a, "global_skew"))]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("b1|"), rt.wrapValue(rt.attribute(b, "global_position")), rt.V.str("|"), rt.wrapValue(rt.attribute(b, "global_rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(b, "global_rotation_degrees")), rt.V.str("|"), rt.wrapValue(rt.attribute(b, "global_scale")), rt.V.str("|"), rt.wrapValue(rt.attribute(b, "global_skew"))]));
      rt.frameLine(17);
      rt.method(b, "set_position", [rt.vector2New([rt.V.int(1), rt.V.int(2)])]);
      rt.frameLine(18);
      rt.method(b, "set_rotation", [rt.V.float(0.2)]);
      rt.frameLine(19);
      rt.method(b, "set_rotation_degrees", [rt.V.float(15)]);
      rt.frameLine(20);
      rt.method(b, "set_scale", [rt.vector2New([rt.V.float(0.5), rt.V.float(0.75)])]);
      rt.frameLine(21);
      rt.method(b, "set_skew", [rt.V.float(0.1)]);
      rt.frameLine(22);
      this._show(rt.V.str("b2"), b);
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("b3|"), rt.method(b, "get_angle_to", [rt.vector2New([rt.V.int(3), rt.V.int(4)])])]));
      rt.frameLine(24);
      rt.method(b, "set_global_position", [rt.vector2New([rt.V.int(5), rt.V.int(6)])]);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("b4|"), rt.wrapValue(rt.attribute(b, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(b, "global_position"))]));
      rt.frameLine(26);
      rt.method(b, "set_global_rotation", [rt.V.float(1)]);
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("b5|"), rt.wrapValue(rt.attribute(b, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(b, "global_rotation"))]));
      rt.frameLine(28);
      rt.method(b, "set_global_rotation_degrees", [rt.V.float(30)]);
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("b6|"), rt.wrapValue(rt.attribute(b, "rotation_degrees")), rt.V.str("|"), rt.wrapValue(rt.attribute(b, "global_rotation_degrees"))]));
      rt.frameLine(30);
      rt.method(b, "set_global_scale", [rt.vector2New([rt.V.float(1.5), rt.V.float(2.5)])]);
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("b7|"), rt.wrapValue(rt.attribute(b, "scale")), rt.V.str("|"), rt.wrapValue(rt.attribute(b, "global_scale"))]));
      rt.frameLine(32);
      rt.method(b, "set_transform", [rt.transform2dNew([rt.V.float(0.3), rt.vector2New([rt.V.int(7), rt.V.int(8)])])]);
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("b9|"), rt.wrapValue(rt.attribute(b, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(b, "rotation")), rt.V.str("|"), rt.wrapValue(rt.attribute(b, "scale"))]));
      rt.frameLine(34);
      rt.method(b, "set_global_transform", [rt.transform2dNew([rt.V.float(0.1), rt.vector2New([rt.V.int(1), rt.V.int(1)])])]);
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("b10|"), rt.wrapValue(rt.attribute(b, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(b, "global_position"))]));
      rt.frameLine(36);
      rt.method(b, "global_translate", [rt.vector2New([rt.V.int(2), rt.V.int((-1))])]);
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("b11|"), rt.wrapValue(rt.attribute(b, "global_position"))]));
      rt.frameLine(38);
      rt.method(a, "look_at", [rt.vector2New([rt.V.int(100), rt.V.int(50)])]);
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("a3|"), rt.wrapValue(rt.attribute(a, "rotation"))]));
      rt.frameLine(40);
      rt.method(a, "free", []);
      rt.frameLine(41);
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
      case "_show": return rt.wrapValue(this._show(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_show": [2, 2], "_initialize": [0, 0] });
rt.registerMethodParams(__gd_d_Main, { "_show": ["String", "Node2D"] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
