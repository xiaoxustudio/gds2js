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
      rt.frameLine(5);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "is_equal_approx", [rt.vector2New([rt.V.float(1.0000095), rt.V.int(2)])]), rt.V.str(" "), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "is_equal_approx", [rt.vector2New([rt.V.float(1.00001), rt.V.int(2)])])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "is_equal_approx", [rt.vector2New([rt.V.float(3.000029), rt.V.int(4)])]), rt.V.str(" "), rt.method(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "is_equal_approx", [rt.vector2New([rt.V.float(3.000031), rt.V.int(4)])])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(0.001), rt.V.int(0)]), "is_equal_approx", [rt.vector2New([rt.V.float(0.0010002), rt.V.int(0)])]), rt.V.str(" "), rt.method(rt.vector2New([rt.V.float(1e+300), rt.V.int(1)]), "is_equal_approx", [rt.vector2New([rt.V.float(1e+300), rt.V.int(1)])])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "is_equal_approx", [rt.vector3New([rt.V.float(1.0000095), rt.V.int(2), rt.V.int(3)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "is_equal_approx", [rt.vector3New([rt.V.float(1.00001), rt.V.int(2), rt.V.int(3)])])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(3), rt.V.int(4), rt.V.int(5)]), "is_equal_approx", [rt.vector3New([rt.V.float(3.000029), rt.V.int(4), rt.V.int(5)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(0.001), rt.V.int(0), rt.V.int(0)]), "is_equal_approx", [rt.vector3New([rt.V.float(0.0010002), rt.V.int(0), rt.V.int(0)])])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(0), rt.V.int(0)]), "is_zero_approx", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.float(0.000009), rt.V.int(0)]), "is_zero_approx", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.float(0.00001), rt.V.int(0)]), "is_zero_approx", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.int(0), rt.V.float((-0.000009))]), "is_zero_approx", [])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), "is_zero_approx", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(0.000009), rt.V.int(0), rt.V.int(0)]), "is_zero_approx", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(0.00001), rt.V.int(0), rt.V.int(0)]), "is_zero_approx", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.float((-0.00002))]), "is_zero_approx", [])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(0.9995), rt.V.int(0)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.float(0.9992), rt.V.int(0)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.float(1.0008), rt.V.int(0)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.int(1), rt.V.float(0.045)]), "is_normalized", [])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(0.7071), rt.V.float(0.7071)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.float(0.9999), rt.V.float(0.9999)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.int(0), rt.V.int(0)]), "is_normalized", [])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.float(0.9995), rt.V.int(0), rt.V.int(0)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(0.9992), rt.V.int(0), rt.V.int(0)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(0.5774), rt.V.float(0.5774), rt.V.float(0.5774)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.float(0.045)]), "is_normalized", [])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "clampf", [rt.V.float(1.5), rt.V.float(2.5)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "clamp", [rt.vector3New([rt.V.float(1.5), rt.V.float(1.5), rt.V.float(1.5)]), rt.vector3New([rt.V.float(2.5), rt.V.float(2.5), rt.V.float(2.5)])])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(3), rt.V.int(2), rt.V.int(1)]), "clampf", [rt.V.float(1.5), rt.V.float(2.5)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int((-1)), rt.V.int(2), rt.V.int(5)]), "clampf", [rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(1), rt.V.int(0)]), "slerp", [rt.vector2New([rt.V.int(0), rt.V.int(1)]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(2), rt.V.int(0)]), "slerp", [rt.vector2New([rt.V.int(0), rt.V.int(3)]), rt.V.float(0.25)])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "slerp", [rt.vector2New([rt.V.int(0), rt.V.int((-1))]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(0)]), "slerp", [rt.vector2New([rt.V.int((-1)), rt.V.int(0)]), rt.V.float(0.5)])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "slerp", [rt.vector2New([rt.V.int((-1)), rt.V.int((-2))]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(5), rt.V.int(1)]), "slerp", [rt.vector2New([rt.V.int((-2)), rt.V.int(3)]), rt.V.float(0.7)])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(0), rt.V.int(0)]), "slerp", [rt.vector2New([rt.V.int(1), rt.V.int(0)]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(0)]), "slerp", [rt.vector2New([rt.V.int(0), rt.V.int(0)]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(0), rt.V.int(0)]), "slerp", [rt.vector2New([rt.V.int(0), rt.V.int(0)]), rt.V.float(0.5)])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "slerp", [rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "slerp", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.V.float(0.3)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.float(0.5), rt.V.float(0.5)]), "slerp", [rt.vector2New([rt.V.int(0), rt.V.int(1)]), rt.V.float(0.25)])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "slerp", [rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "slerp", [rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.float(0)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "slerp", [rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.float(1)])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(3), rt.V.int(0)]), rt.V.float(0.25)])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(0.25)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(0.75)])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "slerp", [rt.vector3New([rt.V.int(4), rt.V.int(5), rt.V.int(6)]), rt.V.float(0.3)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(0)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(1)]), rt.V.float(0.5)])]));
      rt.frameLine(30);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "slerp", [rt.vector3New([rt.V.int((-1)), rt.V.int((-2)), rt.V.int((-3))]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), "slerp", [rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.V.float(0.5)])]));
      rt.frameLine(31);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.float(0.5), rt.V.float(0.5), rt.V.int(0)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(0.25)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int(3), rt.V.int(4), rt.V.int(0)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(5), rt.V.int(0)]), rt.V.float(0.5)])]));
      rt.frameLine(32);
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
