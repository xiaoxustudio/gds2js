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
      let s = rt.strOf(rt.V.str("abc"));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("A|"), rt.method(s, "substr", [rt.V.float(1.9), rt.V.int(1)]), rt.V.str("|"), rt.method(s, "left", [rt.V.bool(true)]), rt.V.str("|"), rt.method(s, "repeat", [rt.V.float((-0.5))]), rt.V.str("|"), rt.method(s, "repeat", [rt.V.float(1.5)]), rt.V.str("|"), rt.method(s, "right", [rt.V.float(2.5)])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("B|"), rt.method(s, "contains", [rt.V.stringName("abc")]), rt.V.str("|"), rt.method(s, "contains", [rt.nodePathCtor([rt.V.str("abc")])]), rt.V.str("|"), rt.method(s, "replace", [rt.nodePathCtor([rt.V.str("a")]), rt.V.str("Z")]), rt.V.str("|"), rt.method(s, "begins_with", [rt.V.stringName("a")]), rt.V.str("|"), rt.method(s, "ends_with", [rt.nodePathCtor([rt.V.str("c")])])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("C|"), rt.method(s, "get_slice", [rt.V.stringName("b"), rt.V.int(1)]), rt.V.str("|"), rt.method(s, "split", [rt.V.str("x"), rt.V.bool(true), rt.V.float(1.5)]), rt.V.str("|"), rt.method(s, "count", [rt.V.stringName("a"), rt.V.int(0), rt.V.int(3)]), rt.V.str("|"), rt.method(s, "find", [rt.nodePathCtor([rt.V.str("b")])]), rt.V.str("|"), rt.method(s, "insert", [rt.V.float(1.5), rt.V.str("z")])]));
      rt.frameLine(8);
      let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("D|"), rt.method(a, "slice", [rt.V.float(1), rt.V.float(3)]), rt.V.str("|"), rt.method(a, "find", [rt.V.int(2), rt.V.bool(true)]), rt.V.str("|"), rt.method(a, "pop_at", [rt.V.float(1.5)]), rt.V.str("|"), rt.method(a, "size", [])]));
      rt.frameLine(10);
      rt.method(a, "insert", [rt.V.float(1.5), rt.V.int(9)]);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("E|"), a, rt.V.str("|"), rt.method(a, "size", [])]));
      rt.frameLine(12);
      rt.method(a, "resize", [rt.V.float(2.9)]);
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("F|"), a]));
      rt.frameLine(14);
      let d = rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("G|"), rt.method(d, "set", [rt.V.str("a"), rt.V.int(2)]), rt.V.str("|"), rt.method(d, "set", [rt.V.int(1), rt.V.int(5)]), rt.V.str("|"), d]));
      rt.frameLine(16);
      let v2 = rt.toVec2(rt.vector2New([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("H|"), rt.method(v2, "angle_to", [rt.vector2iNew([rt.V.int(3), rt.V.int(4)])]), rt.V.str("|"), rt.method(v2, "distance_to", [rt.vector2iNew([rt.V.int(1), rt.V.int(1)])]), rt.V.str("|"), rt.method(v2, "lerp", [rt.vector2iNew([rt.V.int(3), rt.V.int(4)]), rt.V.bool(true)])]));
      rt.frameLine(18);
      let v2i = rt.toVec2i(rt.vector2iNew([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("I|"), rt.method(v2i, "max", [rt.vector2New([rt.V.int(1), rt.V.int(2)])]), rt.V.str("|"), rt.method(v2i, "snapped", [rt.vector2New([rt.V.float(1.5), rt.V.float(2.5)])]), rt.V.str("|"), rt.method(v2i, "clampi", [rt.V.bool(true), rt.V.int(1)]), rt.V.str("|"), rt.method(v2i, "distance_to", [rt.vector2New([rt.V.int(1), rt.V.int(2)])])]));
      rt.frameLine(20);
      let v3 = rt.toVec3(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("J|"), rt.method(v3, "signed_angle_to", [rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])]), rt.V.str("|"), rt.method(v3, "clampf", [rt.V.int(1), rt.V.float(2.5)]), rt.V.str("|"), rt.method(v3, "bezier_derivative", [rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(2), rt.V.int(2), rt.V.int(2)]), rt.V.bool(true)])]));
      rt.frameLine(22);
      let v3i = rt.toVec3i(rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("K|"), rt.method(v3i, "snapped", [rt.vector3New([rt.V.float(1.5), rt.V.float(2.5), rt.V.float(3.5)])]), rt.V.str("|"), rt.method(v3i, "min", [rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)])])]));
      rt.frameLine(24);
      let c = rt.toColor(rt.colorNew([rt.V.float(0.5), rt.V.float(0.25), rt.V.float(0.75), rt.V.int(1)]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("L|"), rt.method(c, "blend", [rt.V.int(1)]), rt.V.str("|"), rt.method(c, "clamp", [rt.V.int(1), rt.colorNew([rt.V.float(0.2), rt.V.float(0.2), rt.V.float(0.2), rt.V.int(1)])]), rt.V.str("|"), rt.method(c, "from_hsv", [rt.V.bool(true), rt.V.int(1), rt.V.int(1)])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("M|"), rt.method(c, "to_html", [rt.V.int(128)]), rt.V.str("|"), rt.method(c, "to_html", [rt.V.bool(false)]), rt.V.str("|"), rt.method(c, "html", [rt.nodePathCtor([rt.V.str("808080")])])]));
      rt.frameLine(27);
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
