// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);

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
      for (let w of rt.iter(rt.V.array(rt.GArray.of([rt.V.float(0), rt.V.float(0.3), rt.V.float(0.37), rt.V.float(0.5), rt.V.float(1), rt.V.float(1.25)])))) {
        rt.frameLine(5);
        print(rt.showArgs([rt.V.str("U|"), w, rt.V.str("|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "cubic_interpolate_in_time", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(6)]), rt.vector2New([rt.V.int(7), rt.V.int(8)]), w, rt.V.float(1), rt.V.float((-1)), rt.V.float(2)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "cubic_interpolate", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(6)]), rt.vector2New([rt.V.int(7), rt.V.int(8)]), w])]));
      }
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("K|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "cubic_interpolate_in_time", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(6)]), rt.vector2New([rt.V.int(7), rt.V.int(8)]), rt.V.float(0.3), rt.V.float(2), rt.V.float((-1)), rt.V.float(3)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "cubic_interpolate_in_time", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(6)]), rt.vector2New([rt.V.int(7), rt.V.int(8)]), rt.V.float(0.3), rt.V.float(1), rt.V.float((-1)), rt.V.float(3)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "cubic_interpolate_in_time", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(6)]), rt.vector2New([rt.V.int(7), rt.V.int(8)]), rt.V.float(0.3), rt.V.float(0.5), rt.V.float((-0.25)), rt.V.float(1.5)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "cubic_interpolate_in_time", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(6)]), rt.vector2New([rt.V.int(7), rt.V.int(8)]), rt.V.float(0.3), rt.V.float(1.3), rt.V.float((-0.9)), rt.V.float(2.1)])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("N|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "cubic_interpolate_in_time", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(6)]), rt.vector2New([rt.V.int(7), rt.V.int(8)]), rt.V.float(0.3), rt.V.float((-1)), rt.V.float((-2)), rt.V.float(0.5)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "cubic_interpolate_in_time", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(6)]), rt.vector2New([rt.V.int(7), rt.V.int(8)]), rt.V.float(0.3), rt.V.float((-2)), rt.V.float((-5)), rt.V.float((-3))]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "cubic_interpolate_in_time", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.float(5.5), rt.V.int(6)]), rt.vector2New([rt.V.int(7), rt.V.int(8)]), rt.V.float((-0.4)), rt.V.float(1), rt.V.float((-3)), rt.V.float(2)])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("G|"), rt.method(rt.vector2New([rt.V.float(2.5), rt.V.float(40021.5)]), "cubic_interpolate_in_time", [rt.vector2New([rt.V.float((-0.7)), rt.V.float(4.5)]), rt.vector2New([rt.V.float(0.3), rt.V.float((-0.7))]), rt.vector2New([rt.V.float(2.5), rt.V.float(2.5)]), rt.V.float(0.3), rt.V.float(1.3), rt.V.float((-0.9)), rt.V.float(2.1)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.float(1.5), rt.V.float(9876.5)]), "cubic_interpolate_in_time", [rt.vector2New([rt.V.float((-2.5)), rt.V.float(0.125)]), rt.vector2New([rt.V.float(0.25), rt.V.float((-0.5))]), rt.vector2New([rt.V.float((-1.5)), rt.V.float(2.25)]), rt.V.float(0.37), rt.V.float(2), rt.V.float((-1)), rt.V.float(3)])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("H|"), rt.method(rt.vector2New([rt.V.float(0.1), rt.V.float(0.2)]), "cubic_interpolate_in_time", [rt.vector2New([rt.V.float(0.3), rt.V.float((-0.4))]), rt.vector2New([rt.V.float(0.5), rt.V.float((-0.6))]), rt.vector2New([rt.V.float(0.7), rt.V.float((-0.8))]), rt.V.float(0.7), rt.V.float(1.3), rt.V.float((-0.9)), rt.V.float(2.1)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.float(12345.75), rt.V.float((-9876.5))]), "cubic_interpolate_in_time", [rt.vector2New([rt.V.float(3000.25), rt.V.float(700.5)]), rt.vector2New([rt.V.float((-4000.75)), rt.V.float(1000.125)]), rt.vector2New([rt.V.float(9000.5), rt.V.float((-2000.25))]), rt.V.float(0.13), rt.V.float(0.5), rt.V.float((-0.25)), rt.V.float(1.5)])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("V|"), rt.method(rt.vector3New([rt.V.float(0.5), rt.V.float(12345.5), rt.V.float((-1.25))]), "cubic_interpolate_in_time", [rt.vector3New([rt.V.float(1.5), rt.V.float((-0.5)), rt.V.float(2.5)]), rt.vector3New([rt.V.float((-2.5)), rt.V.float(0.25), rt.V.float(1.5)]), rt.vector3New([rt.V.float(0.125), rt.V.float(3.5), rt.V.float((-0.75))]), rt.V.float(0.3), rt.V.float(1.25), rt.V.float((-1.5)), rt.V.float(2.5)]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "cubic_interpolate_in_time", [rt.vector3New([rt.V.int(4), rt.V.int(5), rt.V.int(6)]), rt.vector3New([rt.V.int(7), rt.V.int(8), rt.V.int(9)]), rt.vector3New([rt.V.int(10), rt.V.int(11), rt.V.int(12)]), rt.V.float(0.37), rt.V.float(2), rt.V.float((-1)), rt.V.float(3)])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("W|"), rt.method(rt.vector3New([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3)]), "cubic_interpolate_in_time", [rt.vector3New([rt.V.float(0.4), rt.V.float((-0.5)), rt.V.float(0.6)]), rt.vector3New([rt.V.float((-0.7)), rt.V.float(0.8), rt.V.float((-0.9))]), rt.vector3New([rt.V.float(1), rt.V.float((-1.1)), rt.V.float(1.2)]), rt.V.float(1.25), rt.V.float(1.3), rt.V.float((-0.9)), rt.V.float(2.1)]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.float(2.5), rt.V.float((-40021.5)), rt.V.float(0.5)]), "cubic_interpolate_in_time", [rt.vector3New([rt.V.float((-0.7)), rt.V.float(4.5), rt.V.float(1.5)]), rt.vector3New([rt.V.float(0.3), rt.V.float((-0.7)), rt.V.float((-2.5))]), rt.vector3New([rt.V.float(2.5), rt.V.float(2.5), rt.V.float(3.5)]), rt.V.float(0.5), rt.V.float((-1)), rt.V.float((-2)), rt.V.float(0.5)])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("X|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "cubic_interpolate_in_time", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(6)]), rt.vector2New([rt.V.int(7), rt.V.int(8)]), rt.V.float(0.3), INF, rt.V.float((-1)), rt.V.float(2)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "cubic_interpolate_in_time", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(6)]), rt.vector2New([rt.V.int(7), rt.V.int(8)]), rt.V.float(0.3), rt.V.float(1), NAN, rt.V.float(2)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "cubic_interpolate_in_time", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(6)]), rt.vector2New([rt.V.int(7), rt.V.int(8)]), NAN, rt.V.float(1), rt.V.float((-1)), rt.V.float(2)])]));
      rt.frameLine(13);
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
