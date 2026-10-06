// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "is_equal_approx", [rt.vector2New([rt.V.float(1.0000095), rt.V.int(2)])]), rt.V.str(" "), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "is_equal_approx", [rt.vector2New([rt.V.float(1.00001), rt.V.int(2)])])]));
    print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "is_equal_approx", [rt.vector2New([rt.V.float(3.000029), rt.V.int(4)])]), rt.V.str(" "), rt.method(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "is_equal_approx", [rt.vector2New([rt.V.float(3.000031), rt.V.int(4)])])]));
    print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(0.001), rt.V.int(0)]), "is_equal_approx", [rt.vector2New([rt.V.float(0.0010002), rt.V.int(0)])]), rt.V.str(" "), rt.method(rt.vector2New([rt.V.float(1e+300), rt.V.int(1)]), "is_equal_approx", [rt.vector2New([rt.V.float(1e+300), rt.V.int(1)])])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "is_equal_approx", [rt.vector3New([rt.V.float(1.0000095), rt.V.int(2), rt.V.int(3)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "is_equal_approx", [rt.vector3New([rt.V.float(1.00001), rt.V.int(2), rt.V.int(3)])])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(3), rt.V.int(4), rt.V.int(5)]), "is_equal_approx", [rt.vector3New([rt.V.float(3.000029), rt.V.int(4), rt.V.int(5)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(0.001), rt.V.int(0), rt.V.int(0)]), "is_equal_approx", [rt.vector3New([rt.V.float(0.0010002), rt.V.int(0), rt.V.int(0)])])]));
    print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(0), rt.V.int(0)]), "is_zero_approx", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.float(0.000009), rt.V.int(0)]), "is_zero_approx", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.float(0.00001), rt.V.int(0)]), "is_zero_approx", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.int(0), rt.V.float((-0.000009))]), "is_zero_approx", [])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), "is_zero_approx", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(0.000009), rt.V.int(0), rt.V.int(0)]), "is_zero_approx", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(0.00001), rt.V.int(0), rt.V.int(0)]), "is_zero_approx", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.float((-0.00002))]), "is_zero_approx", [])]));
    print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(0.9995), rt.V.int(0)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.float(0.9992), rt.V.int(0)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.float(1.0008), rt.V.int(0)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.int(1), rt.V.float(0.045)]), "is_normalized", [])]));
    print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(0.7071), rt.V.float(0.7071)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.float(0.9999), rt.V.float(0.9999)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector2New([rt.V.int(0), rt.V.int(0)]), "is_normalized", [])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.float(0.9995), rt.V.int(0), rt.V.int(0)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(0.9992), rt.V.int(0), rt.V.int(0)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(0.5774), rt.V.float(0.5774), rt.V.float(0.5774)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.float(0.045)]), "is_normalized", [])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "clampf", [rt.V.float(1.5), rt.V.float(2.5)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "clamp", [rt.vector3New([rt.V.float(1.5), rt.V.float(1.5), rt.V.float(1.5)]), rt.vector3New([rt.V.float(2.5), rt.V.float(2.5), rt.V.float(2.5)])])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(3), rt.V.int(2), rt.V.int(1)]), "clampf", [rt.V.float(1.5), rt.V.float(2.5)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int((-1)), rt.V.int(2), rt.V.int(5)]), "clampf", [rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(1), rt.V.int(0)]), "slerp", [rt.vector2New([rt.V.int(0), rt.V.int(1)]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(2), rt.V.int(0)]), "slerp", [rt.vector2New([rt.V.int(0), rt.V.int(3)]), rt.V.float(0.25)])]));
    print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "slerp", [rt.vector2New([rt.V.int(0), rt.V.int((-1))]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(0)]), "slerp", [rt.vector2New([rt.V.int((-1)), rt.V.int(0)]), rt.V.float(0.5)])]));
    print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "slerp", [rt.vector2New([rt.V.int((-1)), rt.V.int((-2))]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(5), rt.V.int(1)]), "slerp", [rt.vector2New([rt.V.int((-2)), rt.V.int(3)]), rt.V.float(0.7)])]));
    print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(0), rt.V.int(0)]), "slerp", [rt.vector2New([rt.V.int(1), rt.V.int(0)]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(0)]), "slerp", [rt.vector2New([rt.V.int(0), rt.V.int(0)]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(0), rt.V.int(0)]), "slerp", [rt.vector2New([rt.V.int(0), rt.V.int(0)]), rt.V.float(0.5)])]));
    print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "slerp", [rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "slerp", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.V.float(0.3)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.float(0.5), rt.V.float(0.5)]), "slerp", [rt.vector2New([rt.V.int(0), rt.V.int(1)]), rt.V.float(0.25)])]));
    print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "slerp", [rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "slerp", [rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.float(0)]), rt.V.str(" | "), rt.method(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "slerp", [rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.float(1)])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(3), rt.V.int(0)]), rt.V.float(0.25)])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(0.25)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(0.75)])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "slerp", [rt.vector3New([rt.V.int(4), rt.V.int(5), rt.V.int(6)]), rt.V.float(0.3)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(0)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(1)]), rt.V.float(0.5)])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "slerp", [rt.vector3New([rt.V.int((-1)), rt.V.int((-2)), rt.V.int((-3))]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), "slerp", [rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), rt.V.float(0.5)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.V.float(0.5)])]));
    print(rt.showArgs([rt.method(rt.vector3New([rt.V.float(0.5), rt.V.float(0.5), rt.V.int(0)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(0.25)]), rt.V.str(" | "), rt.method(rt.vector3New([rt.V.int(3), rt.V.int(4), rt.V.int(0)]), "slerp", [rt.vector3New([rt.V.int(0), rt.V.int(5), rt.V.int(0)]), rt.V.float(0.5)])]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
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
