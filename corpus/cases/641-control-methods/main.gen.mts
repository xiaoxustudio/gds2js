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
      print(rt.showArgs([rt.V.str("d1|"), rt.method(c, "get_stretch_ratio", []), rt.V.str("|"), rt.method(c, "get_pivot_offset_ratio", []), rt.V.str("|"), rt.method(c, "get_h_grow_direction", []), rt.V.str("|"), rt.method(c, "get_v_grow_direction", [])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("d2|"), rt.method(c, "get_layout_direction", []), rt.V.str("|"), rt.method(c, "is_clipping_contents", []), rt.V.str("|"), rt.method(c, "get_tooltip_text", []), rt.V.str("|"), rt.method(c, "get_theme_type_variation", [])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("d3|"), rt.method(c, "get_position", []), rt.V.str("|"), rt.method(c, "get_size", []), rt.V.str("|"), rt.method(c, "get_rotation", []), rt.V.str("|"), rt.method(c, "get_rotation_degrees", []), rt.V.str("|"), rt.method(c, "get_scale", [])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("d4|"), rt.method(c, "get_pivot_offset", []), rt.V.str("|"), rt.method(c, "get_custom_minimum_size", []), rt.V.str("|"), rt.method(c, "get_h_size_flags", []), rt.V.str("|"), rt.method(c, "get_v_size_flags", [])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("d5|"), rt.method(c, "get_global_position", []), rt.V.str("|"), rt.method(c, "get_offset", [rt.V.int(0)]), rt.V.str("|"), rt.method(c, "get_offset", [rt.V.int(1)]), rt.V.str("|"), rt.method(c, "get_offset", [rt.V.int(2)]), rt.V.str("|"), rt.method(c, "get_offset", [rt.V.int(3)])]));
      rt.frameLine(10);
      rt.method(c, "set_position", [rt.vector2New([rt.V.int(3), rt.V.int(4)])]);
      rt.frameLine(11);
      rt.method(c, "set_size", [rt.vector2New([rt.V.int(10), rt.V.int(20)])]);
      rt.frameLine(12);
      rt.method(c, "set_rotation", [rt.V.float(0.5)]);
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("s1|"), rt.method(c, "get_position", []), rt.V.str("|"), rt.method(c, "get_size", []), rt.V.str("|"), rt.method(c, "get_rotation", []), rt.V.str("|"), rt.method(c, "get_rotation_degrees", []), rt.V.str("|"), rt.method(c, "get_global_position", [])]));
      rt.frameLine(14);
      rt.method(c, "set_rotation_degrees", [rt.V.float(30)]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("s2|"), rt.method(c, "get_rotation_degrees", [])]));
      rt.frameLine(16);
      rt.method(c, "set_scale", [rt.vector2New([rt.V.int(2), rt.V.int(3)])]);
      rt.frameLine(17);
      rt.method(c, "set_pivot_offset", [rt.vector2New([rt.V.int(1), rt.V.int(2)])]);
      rt.frameLine(18);
      rt.method(c, "set_custom_minimum_size", [rt.vector2New([rt.V.int(6), rt.V.int(7)])]);
      rt.frameLine(19);
      rt.method(c, "set_h_size_flags", [rt.V.int(3)]);
      rt.frameLine(20);
      rt.method(c, "set_v_size_flags", [rt.V.int(1)]);
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("s3|"), rt.method(c, "get_scale", []), rt.V.str("|"), rt.method(c, "get_pivot_offset", []), rt.V.str("|"), rt.method(c, "get_custom_minimum_size", []), rt.V.str("|"), rt.method(c, "get_h_size_flags", []), rt.V.str("|"), rt.method(c, "get_v_size_flags", [])]));
      rt.frameLine(22);
      rt.method(c, "set_stretch_ratio", [rt.V.float(2.5)]);
      rt.frameLine(23);
      rt.method(c, "set_pivot_offset_ratio", [rt.vector2New([rt.V.float(0.25), rt.V.float(0.75)])]);
      rt.frameLine(24);
      rt.method(c, "set_h_grow_direction", [rt.V.int(2)]);
      rt.frameLine(25);
      rt.method(c, "set_v_grow_direction", [rt.V.int(0)]);
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("s4|"), rt.method(c, "get_stretch_ratio", []), rt.V.str("|"), rt.method(c, "get_pivot_offset_ratio", []), rt.V.str("|"), rt.method(c, "get_h_grow_direction", []), rt.V.str("|"), rt.method(c, "get_v_grow_direction", [])]));
      rt.frameLine(27);
      rt.method(c, "set_layout_direction", [rt.V.int(3)]);
      rt.frameLine(28);
      rt.method(c, "set_clip_contents", [rt.V.bool(true)]);
      rt.frameLine(29);
      rt.method(c, "set_tooltip_text", [rt.V.str("tip")]);
      rt.frameLine(30);
      rt.method(c, "set_theme_type_variation", [rt.V.str("Foo")]);
      rt.frameLine(31);
      rt.method(c, "set_localize_numeral_system", [rt.V.bool(false)]);
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("s5|"), rt.method(c, "get_layout_direction", []), rt.V.str("|"), rt.method(c, "is_clipping_contents", []), rt.V.str("|"), rt.method(c, "get_tooltip_text", []), rt.V.str("|"), rt.method(c, "get_theme_type_variation", [])]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("p1|"), rt.wrapValue(rt.attribute(c, "size_flags_stretch_ratio")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "pivot_offset_ratio")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "grow_horizontal")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "grow_vertical"))]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("p2|"), rt.wrapValue(rt.attribute(c, "layout_direction")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "clip_contents")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "tooltip_text")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "localize_numeral_system"))]));
      rt.frameLine(35);
      rt.method(c, "set_offset", [rt.V.int(0), rt.V.float(1.5)]);
      rt.frameLine(36);
      rt.method(c, "set_offset", [rt.V.int(3), rt.V.float(9.5)]);
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("o1|"), rt.method(c, "get_offset", [rt.V.int(0)]), rt.V.str("|"), rt.method(c, "get_offset", [rt.V.int(3)])]));
      rt.frameLine(38);
      rt.method(c, "reset_size", []);
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("r1|"), rt.method(c, "get_size", [])]));
      rt.frameLine(40);
      rt.method(c, "free", []);
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
