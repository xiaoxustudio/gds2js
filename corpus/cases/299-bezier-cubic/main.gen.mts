// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int((-3)), rt.V.float(0.5)]), rt.vector2New([rt.V.int(0), rt.V.int(0)])])))) {
      print(rt.showArgs([rt.V.str("BZ2|"), v, rt.V.str("|"), rt.method(v, "bezier_interpolate", [rt.vector2New([rt.V.int(1), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(5)]), rt.vector2New([rt.V.int(6), rt.V.int((-2))]), rt.V.float(0)]), rt.V.str("|"), rt.method(v, "bezier_interpolate", [rt.vector2New([rt.V.int(1), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(5)]), rt.vector2New([rt.V.int(6), rt.V.int((-2))]), rt.V.float(0.25)]), rt.V.str("|"), rt.method(v, "bezier_interpolate", [rt.vector2New([rt.V.int(1), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(5)]), rt.vector2New([rt.V.int(6), rt.V.int((-2))]), rt.V.float(0.5)]), rt.V.str("|"), rt.method(v, "bezier_interpolate", [rt.vector2New([rt.V.int(1), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(5)]), rt.vector2New([rt.V.int(6), rt.V.int((-2))]), rt.V.float(1)])]));
      print(rt.showArgs([rt.V.str("CI2|"), rt.method(v, "cubic_interpolate", [rt.vector2New([rt.V.int(2), rt.V.int(3)]), rt.vector2New([rt.V.int((-4)), rt.V.int(1)]), rt.vector2New([rt.V.int(9), rt.V.int((-2))]), rt.V.float(0)]), rt.V.str("|"), rt.method(v, "cubic_interpolate", [rt.vector2New([rt.V.int(2), rt.V.int(3)]), rt.vector2New([rt.V.int((-4)), rt.V.int(1)]), rt.vector2New([rt.V.int(9), rt.V.int((-2))]), rt.V.float(0.3)]), rt.V.str("|"), rt.method(v, "cubic_interpolate", [rt.vector2New([rt.V.int(2), rt.V.int(3)]), rt.vector2New([rt.V.int((-4)), rt.V.int(1)]), rt.vector2New([rt.V.int(9), rt.V.int((-2))]), rt.V.float(1)])]));
    }
    for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int((-3)), rt.V.float(0.5)])])))) {
      print(rt.showArgs([rt.V.str("BZ2T|"), rt.method(v, "bezier_interpolate", [rt.vector2New([rt.V.int(1), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(5)]), rt.vector2New([rt.V.int(6), rt.V.int((-2))]), rt.V.float(0.3)]), rt.V.str("|"), rt.method(v, "bezier_interpolate", [rt.vector2New([rt.V.int(1), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(5)]), rt.vector2New([rt.V.int(6), rt.V.int((-2))]), rt.V.float(0.7)]), rt.V.str("|"), rt.method(v, "bezier_interpolate", [rt.vector2New([rt.V.int(1), rt.V.int(4)]), rt.vector2New([rt.V.int(5), rt.V.int(5)]), rt.vector2New([rt.V.int(6), rt.V.int((-2))]), rt.V.float(0.13)])]));
      print(rt.showArgs([rt.V.str("CI2T|"), rt.method(v, "cubic_interpolate", [rt.vector2New([rt.V.int(2), rt.V.int(3)]), rt.vector2New([rt.V.int((-4)), rt.V.int(1)]), rt.vector2New([rt.V.int(9), rt.V.int((-2))]), rt.V.float(0.7)]), rt.V.str("|"), rt.method(v, "cubic_interpolate", [rt.vector2New([rt.V.int(2), rt.V.int(3)]), rt.vector2New([rt.V.int((-4)), rt.V.int(1)]), rt.vector2New([rt.V.int(9), rt.V.int((-2))]), rt.V.float(0.13)]), rt.V.str("|"), rt.method(v, "cubic_interpolate", [rt.vector2New([rt.V.int(2), rt.V.int(3)]), rt.vector2New([rt.V.int((-4)), rt.V.int(1)]), rt.vector2New([rt.V.int(9), rt.V.int((-2))]), rt.V.float(0.37)])]));
    }
    for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int((-3)), rt.V.float(0.5), rt.V.int(7)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)])])))) {
      print(rt.showArgs([rt.V.str("BZ3|"), v, rt.V.str("|"), rt.method(v, "bezier_interpolate", [rt.vector3New([rt.V.int(1), rt.V.int(4), rt.V.float(0.5)]), rt.vector3New([rt.V.int(5), rt.V.int(5), rt.V.int((-2))]), rt.vector3New([rt.V.int(6), rt.V.int((-2)), rt.V.int(9)]), rt.V.float(0.25)]), rt.V.str("|"), rt.method(v, "bezier_interpolate", [rt.vector3New([rt.V.int(1), rt.V.int(4), rt.V.float(0.5)]), rt.vector3New([rt.V.int(5), rt.V.int(5), rt.V.int((-2))]), rt.vector3New([rt.V.int(6), rt.V.int((-2)), rt.V.int(9)]), rt.V.float(0.5)]), rt.V.str("|"), rt.method(v, "bezier_interpolate", [rt.vector3New([rt.V.int(1), rt.V.int(4), rt.V.float(0.5)]), rt.vector3New([rt.V.int(5), rt.V.int(5), rt.V.int((-2))]), rt.vector3New([rt.V.int(6), rt.V.int((-2)), rt.V.int(9)]), rt.V.float(1)])]));
    }
    for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int((-3)), rt.V.float(0.5), rt.V.int(7)])])))) {
      print(rt.showArgs([rt.V.str("BZ3T|"), rt.method(v, "bezier_interpolate", [rt.vector3New([rt.V.int(1), rt.V.int(4), rt.V.float(0.5)]), rt.vector3New([rt.V.int(5), rt.V.int(5), rt.V.int((-2))]), rt.vector3New([rt.V.int(6), rt.V.int((-2)), rt.V.int(9)]), rt.V.float(0.3)]), rt.V.str("|"), rt.method(v, "bezier_interpolate", [rt.vector3New([rt.V.int(1), rt.V.int(4), rt.V.float(0.5)]), rt.vector3New([rt.V.int(5), rt.V.int(5), rt.V.int((-2))]), rt.vector3New([rt.V.int(6), rt.V.int((-2)), rt.V.int(9)]), rt.V.float(0.7)]), rt.V.str("|"), rt.method(v, "bezier_interpolate", [rt.vector3New([rt.V.int(1), rt.V.int(4), rt.V.float(0.5)]), rt.vector3New([rt.V.int(5), rt.V.int(5), rt.V.int((-2))]), rt.vector3New([rt.V.int(6), rt.V.int((-2)), rt.V.int(9)]), rt.V.float(0.13)])]));
    }
    print(rt.showArgs([rt.V.str("CI3|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "cubic_interpolate", [rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.vector3New([rt.V.int((-4)), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(9), rt.V.int((-2)), rt.V.int(5)]), rt.V.float(0.3)]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "cubic_interpolate", [rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.vector3New([rt.V.int((-4)), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(9), rt.V.int((-2)), rt.V.int(5)]), rt.V.float(0.5)])]));
    print(rt.showArgs([rt.V.str("CI3T|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "cubic_interpolate", [rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.vector3New([rt.V.int((-4)), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(9), rt.V.int((-2)), rt.V.int(5)]), rt.V.float(0.7)]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "cubic_interpolate", [rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.vector3New([rt.V.int((-4)), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(9), rt.V.int((-2)), rt.V.int(5)]), rt.V.float(0.13)]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "cubic_interpolate", [rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.vector3New([rt.V.int((-4)), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(9), rt.V.int((-2)), rt.V.int(5)]), rt.V.float(0.37)])]));
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
