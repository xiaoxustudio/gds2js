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
      let s = rt.toStringNameSlot(rt.stringNameCtor([rt.V.str("ab")]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("W1|"), rt.wrapValue(rt.boundMethod(s, "StringName", "hash", 0, 0)), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(s, "StringName", "hash", 0, 0)), "call", [])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("W2|"), rt.method(rt.wrapValue(rt.boundMethod(s, "StringName", "to_upper", 0, 0)), "call", []), rt.V.str(" "), rt.method(s, "is_empty", [])]));
      rt.frameLine(7);
      let n = rt.nodePathCtor([rt.V.str("a/b")]);
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("W3|"), rt.wrapValue(rt.boundMethod(n, "NodePath", "hash", 0, 0)), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(n, "NodePath", "hash", 0, 0)), "is_valid", [])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("W4|"), rt.wrapValue(rt.boundMethod(n, "NodePath", "get_name_count", 0, 0)), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(n, "NodePath", "get_name_count", 0, 0)), "call", []), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(n, "NodePath", "is_empty", 0, 0)), "call", [])]));
      rt.frameLine(10);
      let v = rt.toVec3i(rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(2)]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("W5|"), rt.wrapValue(rt.boundMethod(v, "Vector3i", "length", 0, 0)), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(v, "Vector3i", "length", 0, 0)), "call", []), rt.V.str(" "), rt.wrapValue(rt.attribute(v, "z"))]));
      rt.frameLine(12);
      let c = rt.toColor(rt.colorNew([rt.V.int(1), rt.V.float(0.5), rt.V.float(0.25), rt.V.int(1)]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("W6|"), rt.method(rt.wrapValue(rt.boundMethod(c, "Color", "to_html", 0, 1)), "call", []), rt.V.str(" "), rt.wrapValue(rt.attribute(c, "r")), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(c, "Color", "darkened", 1, 1)), "call", [rt.V.float(0.5)])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("W7|"), rt.method(rt.wrapValue(rt.boundMethod(rt.stringNameCtor([rt.V.str("zz")]), "StringName", "to_upper", 0, 0)), "call", [])]));
      rt.frameLine(15);
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
