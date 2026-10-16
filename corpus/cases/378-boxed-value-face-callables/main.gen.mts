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
      let v = rt.vector2New([rt.V.int(3), rt.V.int(4)]);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("N1|"), rt.wrapValue(rt.attribute(v, "length")), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(v, "length")), "call", [])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("N2|"), rt.wrapValue(rt.attribute(v, "x")), rt.V.str(" "), rt.wrapValue(rt.attribute(v, "normalized")), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(v, "normalized")), "call", [])]));
      rt.frameLine(7);
      let w = rt.vector2iNew([rt.V.int(3), rt.V.int(4)]);
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("N3|"), rt.wrapValue(rt.attribute(w, "distance_to")), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(w, "distance_to")), "call", [rt.vector2iNew([rt.V.int(1), rt.V.int(1)])]), rt.V.str(" "), rt.wrapValue(rt.attribute(w, "x"))]));
      rt.frameLine(9);
      let c = rt.colorNew([rt.V.int(1), rt.V.float(0.5), rt.V.float(0.25), rt.V.int(1)]);
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("N4|"), rt.wrapValue(rt.attribute(c, "to_html")), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(c, "to_html")), "call", []), rt.V.str(" "), rt.wrapValue(rt.attribute(c, "r"))]));
      rt.frameLine(11);
      let q = rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(2)]);
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("N5|"), rt.wrapValue(rt.attribute(q, "length")), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(q, "length")), "call", []), rt.V.str(" "), rt.wrapValue(rt.attribute(q, "z"))]));
      rt.frameLine(13);
      let r = rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(2)]);
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("N6|"), rt.wrapValue(rt.attribute(r, "length")), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(r, "length")), "call", []), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(w, "distance_to")), "get_argument_count", [])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("N7|"), rt.ops.eq(rt.wrapValue(rt.attribute(v, "length")), rt.wrapValue(rt.boundMethod(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "Vector2", "length", 0, 0))), rt.V.str(" "), rt.ops.eq(rt.wrapValue(rt.attribute(v, "length")), rt.wrapValue(rt.attribute(w, "length")))]));
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
