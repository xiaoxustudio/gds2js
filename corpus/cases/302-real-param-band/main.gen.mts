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
      for (let w of rt.iter(rt.V.array(rt.GArray.of([rt.V.float(0.3), rt.V.float(0.13), rt.V.float(0.7), rt.V.float(0.37)])))) {
        rt.frameLine(5);
        print(rt.showArgs([rt.V.str("Q|"), w, rt.V.str("|"), rt.method(rt.vector2New([rt.V.float(2.5), rt.V.float(40021.5)]), "cubic_interpolate", [rt.vector2New([rt.V.float((-0.7)), rt.V.float(4.5)]), rt.vector2New([rt.V.float(0.3), rt.V.float((-0.7))]), rt.vector2New([rt.V.float(2.5), rt.V.float(2.5)]), w])]));
        rt.frameLine(6);
        print(rt.showArgs([rt.V.str("R|"), w, rt.V.str("|"), rt.method(rt.vector2New([rt.V.float(1.5), rt.V.float(98765.4375)]), "cubic_interpolate", [rt.vector2New([rt.V.float((-2.5)), rt.V.float(0.125)]), rt.vector2New([rt.V.float(0.25), rt.V.float((-0.5))]), rt.vector2New([rt.V.float((-1.5)), rt.V.float(2.25)]), w])]));
        rt.frameLine(7);
        print(rt.showArgs([rt.V.str("S|"), w, rt.V.str("|"), rt.method(rt.vector3New([rt.V.float(0.5), rt.V.float(12345.75), rt.V.float((-1.25))]), "cubic_interpolate", [rt.vector3New([rt.V.float(1.5), rt.V.float((-0.5)), rt.V.float(2.5)]), rt.vector3New([rt.V.float((-2.5)), rt.V.float(0.25), rt.V.float(1.5)]), rt.vector3New([rt.V.float(0.125), rt.V.float(3.5), rt.V.float((-0.75))]), w])]));
        rt.frameLine(8);
        print(rt.showArgs([rt.V.str("B|"), w, rt.V.str("|"), rt.method(rt.vector2New([rt.V.float(2.5), rt.V.float(40021.5)]), "bezier_interpolate", [rt.vector2New([rt.V.float((-0.7)), rt.V.float(4.5)]), rt.vector2New([rt.V.float(0.3), rt.V.float((-0.7))]), rt.vector2New([rt.V.float(2.5), rt.V.float(2.5)]), w]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.float(0.5), rt.V.float(12345.75), rt.V.float((-1.25))]), "bezier_interpolate", [rt.vector3New([rt.V.float(1.5), rt.V.float((-0.5)), rt.V.float(2.5)]), rt.vector3New([rt.V.float((-2.5)), rt.V.float(0.25), rt.V.float(1.5)]), rt.vector3New([rt.V.float(0.125), rt.V.float(3.5), rt.V.float((-0.75))]), w])]));
      }
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("T|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "cubic_interpolate", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(6)]), rt.vector2New([rt.V.int(7), rt.V.int(8)]), rt.V.float(0.5)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.float(0.1), rt.V.float((-0.2))]), "cubic_interpolate", [rt.vector2New([rt.V.float(0.3), rt.V.float((-0.4))]), rt.vector2New([rt.V.float(0.5), rt.V.float((-0.6))]), rt.vector2New([rt.V.float(0.7), rt.V.float((-0.8))]), rt.V.float(0.7)])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("W|"), rt.method(rt.vector2New([rt.V.int(0), rt.V.float(100000)]), "cubic_interpolate", [rt.vector2New([rt.V.int(1), rt.V.int((-1))]), rt.vector2New([rt.V.int((-1)), rt.V.int(1)]), rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.V.float(0.25)]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.int(0), rt.V.float(100000), rt.V.float((-100000))]), "cubic_interpolate", [rt.vector3New([rt.V.int(1), rt.V.int((-1)), rt.V.int(2)]), rt.vector3New([rt.V.int((-1)), rt.V.int(1), rt.V.int((-2))]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]), rt.V.float(0.25)])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("L|"), rt.method(rt.vector2New([rt.V.float(2.5), rt.V.float(40021.5)]), "lerp", [rt.vector2New([rt.V.float((-0.7)), rt.V.float(4.5)]), rt.V.float(0.3)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.float(2.5), rt.V.float(40021.5)]), "snappedf", [rt.V.float(0.25)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.float(2.5), rt.V.float(40021.5)]), "clampf", [rt.V.float(10000.5), rt.V.float(30000.25)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.float(2.5), rt.V.float(40021.5)]), "move_toward", [rt.vector2New([rt.V.float((-0.7)), rt.V.float(4.5)]), rt.V.float(10000.5)])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("C|"), rt.method(rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]), "lightened", [rt.V.float(0.37)]), rt.V.str("|"), rt.method(rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]), "darkened", [rt.V.float(0.13)]), rt.V.str("|"), rt.method(rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]), "lerp", [rt.colorNew([rt.V.float(0.9), rt.V.float(0.8), rt.V.float(0.7), rt.V.float(0.6)]), rt.V.float(0.37)]), rt.V.str("|"), rt.colorStatic("from_hsv", [rt.V.float(0.13), rt.V.float(0.37), rt.V.float(0.7), rt.V.float(0.25)])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("MT|"), rt.method(rt.vector3New([rt.V.int((-4)), rt.V.int(8), rt.V.int((-16))]), "move_toward", [rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]), rt.V.float(2)]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.int((-4)), rt.V.int(8), rt.V.int((-16))]), "move_toward", [rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]), rt.V.float(0.7)]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.float(1.5), rt.V.float((-2.5)), rt.V.int(3)]), "move_toward", [rt.vector3New([rt.V.int((-9)), rt.V.int(4), rt.V.float(0.5)]), rt.V.float(11)]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), "move_toward", [rt.vector3New([rt.V.int((-9)), rt.V.int(4), rt.V.float(0.5)]), rt.V.float(100)])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("MTX|"), rt.method(rt.vector3New([rt.V.int(2), rt.V.int((-2)), rt.V.int(2)]), "move_toward", [rt.vector3New([rt.V.int(2), rt.V.int((-2)), rt.V.int(2)]), rt.V.float(0)]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.int(2), rt.V.int((-2)), rt.V.int(2)]), "move_toward", [rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.V.float(0)]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "move_toward", [rt.vector3New([rt.V.int(4), rt.V.int(5), rt.V.int(6)]), rt.V.float((-2))]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.float(10000000), rt.V.float((-20000000)), rt.V.float(3000000)]), "move_toward", [rt.vector3New([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]), rt.V.float(5)])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("MTZ|"), rt.method(rt.vector3New([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3)]), "move_toward", [rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]), rt.V.float(0.13)]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.float((-3.5)), rt.V.float(7.25), rt.V.float((-0.125))]), "move_toward", [rt.vector3New([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)]), rt.V.float(10000000)]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.float(10000000), rt.V.float(20000000), rt.V.float((-30000000))]), "move_toward", [rt.vector3New([NAN, NAN, NAN]), rt.V.float(0.5)]), rt.V.str("|"), rt.method(rt.vector3New([NAN, rt.V.int(1), rt.V.int(2)]), "move_toward", [rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]), rt.V.float(2)]), rt.V.str("|"), rt.method(rt.vector3New([INF, rt.V.int(1), rt.V.int(2)]), "move_toward", [rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]), rt.V.float(2)]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "move_toward", [rt.vector3New([rt.V.int(4), rt.V.int(5), rt.V.int(6)]), NAN])]));
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
