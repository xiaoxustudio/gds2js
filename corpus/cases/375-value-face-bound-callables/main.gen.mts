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
      let v = rt.toVec2(rt.vector2New([rt.V.int(3), rt.V.int(4)]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("V1|"), rt.wrapValue(rt.boundMethod(v, "Vector2", "length", 0, 0)), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(v, "Vector2", "length", 0, 0)), "call", [])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("V2|"), rt.wrapValue(rt.attribute(v, "x")), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(v, "Vector2", "normalized", 0, 0)), "call", [])]));
      rt.frameLine(7);
      let w = rt.toVec2i(rt.vector2iNew([rt.V.int(3), rt.V.int(4)]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("V3|"), rt.wrapValue(rt.boundMethod(w, "Vector2i", "distance_to", 1, 1)), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(w, "Vector2i", "distance_to", 1, 1)), "call", [rt.vector2iNew([rt.V.int(1), rt.V.int(1)])])]));
      rt.frameLine(9);
      let c = rt.toColor(rt.colorNew([rt.V.int(1), rt.V.float(0.5), rt.V.float(0.25), rt.V.int(1)]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("V4|"), rt.wrapValue(rt.boundMethod(c, "Color", "to_html", 0, 1)), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(c, "Color", "to_html", 0, 1)), "call", [])]));
      rt.frameLine(11);
      let q = rt.toVec3(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(2)]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("V5|"), rt.wrapValue(rt.boundMethod(q, "Vector3", "length", 0, 0)), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(q, "Vector3", "length", 0, 0)), "call", [])]));
      rt.frameLine(13);
      let r = rt.toVec3i(rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(2)]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("V6|"), rt.wrapValue(rt.boundMethod(r, "Vector3i", "length", 0, 0)), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(r, "Vector3i", "length", 0, 0)), "call", [])]));
      rt.frameLine(15);
      let s = rt.toStringNameSlot(rt.stringNameCtor([rt.V.str("ab")]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("V7|"), rt.wrapValue(rt.boundMethod(s, "StringName", "hash", 0, 0)), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(s, "StringName", "hash", 0, 0)), "call", [])]));
      rt.frameLine(17);
      let n = rt.nodePathCtor([rt.V.str("a/b")]);
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("V8|"), rt.wrapValue(rt.boundMethod(n, "NodePath", "get_name_count", 0, 0)), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(n, "NodePath", "get_name_count", 0, 0)), "call", [])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("V9|"), rt.wrapValue(rt.boundMethod(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "Vector2", "normalized", 0, 0))]));
      rt.frameLine(20);
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
