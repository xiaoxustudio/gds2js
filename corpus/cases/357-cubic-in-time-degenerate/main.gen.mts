// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let v = rt.toVec2(rt.vector2New([rt.V.int(1), rt.V.int(2)]));
    let b = rt.toVec2(rt.vector2New([rt.V.int(4), rt.V.int(8)]));
    let pre = rt.toVec2(rt.vector2New([rt.V.int((-2)), rt.V.int(1)]));
    let post = rt.toVec2(rt.vector2New([rt.V.int(9), rt.V.int(3)]));
    print(rt.showArgs([rt.V.str("A|"), rt.method(v, "cubic_interpolate_in_time", [b, pre, post, rt.V.float(0.5), rt.V.int(1), rt.V.int(0), rt.V.int(3)]), rt.V.str("|"), rt.method(v, "cubic_interpolate_in_time", [b, pre, post, rt.V.float(0), rt.V.int(1), rt.V.int(0), rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("B|"), rt.method(v, "cubic_interpolate_in_time", [b, pre, post, rt.V.float(0.5), rt.V.int(0), rt.V.int((-1)), rt.V.int(2)]), rt.V.str("|"), rt.method(v, "cubic_interpolate_in_time", [b, pre, post, rt.V.int(1), rt.V.int(0), rt.V.int((-1)), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("C|"), rt.method(v, "cubic_interpolate_in_time", [b, pre, post, rt.V.float(0.5), rt.V.int(1), rt.V.int((-1)), rt.V.int(1)]), rt.V.str("|"), rt.method(v, "cubic_interpolate_in_time", [b, pre, post, rt.V.int(1), rt.V.int(1), rt.V.int((-1)), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("D|"), rt.method(v, "cubic_interpolate_in_time", [b, pre, post, rt.V.float(0.25), rt.V.int(1), rt.V.int(1), rt.V.int(3)]), rt.V.str("|"), rt.method(v, "cubic_interpolate_in_time", [b, pre, post, rt.V.float(0.75), rt.V.int(1), rt.V.int(1), rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("E|"), rt.method(v, "cubic_interpolate_in_time", [b, pre, post, rt.V.float(0.25), rt.V.int(1), rt.V.int((-1)), rt.V.int(0)]), rt.V.str("|"), rt.method(v, "cubic_interpolate_in_time", [b, pre, post, rt.V.float(0.75), rt.V.int(1), rt.V.int((-1)), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("F|"), rt.method(v, "cubic_interpolate_in_time", [b, pre, post, rt.V.float(0.5), rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.V.str("|"), rt.method(v, "cubic_interpolate_in_time", [b, pre, post, rt.V.float(0.5), rt.V.int(1), rt.V.int(1), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("G|"), rt.method(v, "cubic_interpolate_in_time", [b, pre, post, rt.V.float(0.5), rt.V.int(1), rt.V.int(1), rt.V.int(1)]), rt.V.str("|"), rt.method(v, "cubic_interpolate_in_time", [b, pre, post, rt.V.float(0.5), rt.V.int(1), rt.V.int((-1)), rt.V.int((-2))])]));
    let w = rt.toVec3(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
    let b3 = rt.toVec3(rt.vector3New([rt.V.int(4), rt.V.int(8), rt.V.int(5)]));
    let pre3 = rt.toVec3(rt.vector3New([rt.V.int((-2)), rt.V.int(1), rt.V.int(0)]));
    let post3 = rt.toVec3(rt.vector3New([rt.V.int(9), rt.V.int(3), rt.V.int(6)]));
    print(rt.showArgs([rt.V.str("H|"), rt.method(w, "cubic_interpolate_in_time", [b3, pre3, post3, rt.V.float(0.5), rt.V.int(1), rt.V.int(0), rt.V.int(3)]), rt.V.str("|"), rt.method(w, "cubic_interpolate_in_time", [b3, pre3, post3, rt.V.float(0.5), rt.V.int(0), rt.V.int((-1)), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("I|"), rt.method(w, "cubic_interpolate_in_time", [b3, pre3, post3, rt.V.float(0.5), rt.V.int(1), rt.V.int((-1)), rt.V.int(1)]), rt.V.str("|"), rt.method(w, "cubic_interpolate_in_time", [b3, pre3, post3, rt.V.float(0.5), rt.V.int(1), rt.V.int(1), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("J|"), rt.method(w, "cubic_interpolate_in_time", [b3, pre3, post3, rt.V.float(0.25), rt.V.int(1), rt.V.int((-1)), rt.V.int(0)]), rt.V.str("|"), rt.method(w, "cubic_interpolate_in_time", [b3, pre3, post3, rt.V.float(0.75), rt.V.int(0), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("K|"), rt.method(w, "cubic_interpolate_in_time", [b3, pre3, post3, rt.V.float(0.5), rt.V.int(1), rt.V.int((-1)), rt.V.int(3)])]));
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
