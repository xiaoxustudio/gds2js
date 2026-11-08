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
      let p = rt.method(rt.nativeClass("Control"), "new", []);
      rt.frameLine(5);
      {
        const _nv = rt.writeProp(p, "size", rt.vector2New([rt.V.int(200), rt.V.int(100)]));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(6);
      let c = rt.method(rt.nativeClass("Control"), "new", []);
      rt.frameLine(7);
      {
        const _nv = rt.writeProp(c, "size", rt.vector2New([rt.V.int(20), rt.V.int(10)]));
        if (_nv !== null) c = _nv;
      }
      rt.frameLine(8);
      rt.method(p, "add_child", [c]);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("d1|"), rt.method(c, "get_begin", []), rt.V.str("|"), rt.method(c, "get_end", []), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "layout_mode")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "anchors_preset"))]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("d2|"), rt.method(c, "get_combined_pivot_offset", []), rt.V.str("|"), rt.method(c, "get_global_rect", [])]));
      rt.frameLine(11);
      rt.method(c, "set_anchors_preset", [rt.wrapValue(rt.attribute(rt.nativeClass("Control"), "PRESET_CENTER"))]);
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("p1|"), rt.wrapValue(rt.attribute(c, "anchor_left")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "anchor_top")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "anchor_right")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "anchor_bottom"))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("p2|"), rt.wrapValue(rt.attribute(c, "offset_left")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "offset_top")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "offset_right")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "offset_bottom"))]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("p3|"), rt.wrapValue(rt.attribute(c, "anchors_preset")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "layout_mode")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "size"))]));
      rt.frameLine(15);
      rt.method(c, "set_anchors_preset", [rt.wrapValue(rt.attribute(rt.nativeClass("Control"), "PRESET_TOP_LEFT"))]);
      rt.frameLine(16);
      rt.method(c, "set_offsets_preset", [rt.wrapValue(rt.attribute(rt.nativeClass("Control"), "PRESET_TOP_LEFT"))]);
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("p4|"), rt.method(c, "get_begin", []), rt.V.str("|"), rt.method(c, "get_end", []), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "size"))]));
      rt.frameLine(18);
      rt.method(c, "set_anchors_and_offsets_preset", [rt.wrapValue(rt.attribute(rt.nativeClass("Control"), "PRESET_BOTTOM_RIGHT"))]);
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("p5|"), rt.wrapValue(rt.attribute(c, "anchor_left")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "anchor_top")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "anchor_right")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "anchor_bottom"))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("p6|"), rt.wrapValue(rt.attribute(c, "offset_left")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "offset_top")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "offset_right")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "offset_bottom"))]));
      rt.frameLine(21);
      rt.method(c, "set_anchor", [rt.V.int(0), rt.V.float(0.25), rt.V.bool(false), rt.V.bool(true)]);
      rt.frameLine(22);
      rt.method(c, "set_anchor_and_offset", [rt.V.int(1), rt.V.float(0.5), rt.V.float(3), rt.V.bool(true)]);
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("a1|"), rt.wrapValue(rt.attribute(c, "anchor_left")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "anchor_top")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "offset_left")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "offset_top"))]));
      rt.frameLine(24);
      rt.method(c, "set_global_position", [rt.vector2New([rt.V.int(10), rt.V.int(20)])]);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("g1|"), rt.wrapValue(rt.attribute(c, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "global_position")), rt.V.str("|"), rt.method(c, "get_global_rect", [])]));
      rt.frameLine(26);
      rt.method(c, "set_begin", [rt.vector2New([rt.V.int(2), rt.V.int(3)])]);
      rt.frameLine(27);
      rt.method(c, "set_end", [rt.vector2New([rt.V.int(12), rt.V.int(13)])]);
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("b1|"), rt.method(c, "get_begin", []), rt.V.str("|"), rt.method(c, "get_end", []), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "size"))]));
      rt.frameLine(29);
      rt.method(c, "update_minimum_size", []);
      rt.frameLine(30);
      rt.method(p, "free", []);
      rt.frameLine(31);
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
