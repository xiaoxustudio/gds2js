// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.float(1.5), rt.V.float((-2.5))]), rt.vector2New([rt.V.int((-4)), rt.V.int((-4))]), rt.vector2New([rt.V.int(0), rt.V.float(0.5)]), rt.vector2New([rt.V.int(3), rt.V.int((-3))])])))) {
      print(rt.showArgs([rt.V.str("V2|"), rt.method(v, "min", [rt.vector2New([rt.V.int(1), rt.V.int((-1))])]), rt.V.str("|"), rt.method(v, "max", [rt.vector2New([rt.V.int(1), rt.V.int((-1))])]), rt.V.str("|"), rt.method(v, "minf", [rt.V.float(0.5)]), rt.V.str("|"), rt.method(v, "maxf", [rt.V.float(0.5)]), rt.V.str("|"), rt.method(v, "clamp", [rt.vector2New([rt.V.int((-1)), rt.V.int(2)]), rt.vector2New([rt.V.int(3), rt.V.int(4)])]), rt.V.str("|"), rt.method(v, "clampf", [rt.V.float((-2)), rt.V.float(1)]), rt.V.str("|"), rt.method(v, "snappedf", [rt.V.float(0.5)]), rt.V.str("|"), rt.method(v, "posmod", [rt.V.float(2)]), rt.V.str("|"), rt.method(v, "posmodv", [rt.vector2New([rt.V.int(2), rt.V.int((-3))])])]));
    }
    for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.float(1.5), rt.V.float((-2.5))]), rt.vector2New([rt.V.int((-4)), rt.V.int(4)])])))) {
      print(rt.showArgs([rt.V.str("V2X|"), rt.method(v, "clamp", [rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.int((-1)), rt.V.int((-2))])]), rt.V.str("|"), rt.method(v, "clampf", [rt.V.float(2), rt.V.float((-2))]), rt.V.str("|"), rt.method(v, "posmod", [rt.V.float((-2))]), rt.V.str("|"), rt.method(v, "posmod", [rt.V.float(0)]), rt.V.str("|"), rt.method(v, "snappedf", [rt.V.float(0)]), rt.V.str("|"), rt.method(v, "snappedf", [rt.V.float((-0.5))])]));
    }
    for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector2iNew([rt.V.int(3), rt.V.int((-4))]), rt.vector2iNew([rt.V.int((-1)), rt.V.int(1)]), rt.vector2iNew([rt.V.int(2147483647), rt.V.int((-2147483648))])])))) {
      print(rt.showArgs([rt.V.str("V2I|"), rt.method(v, "mini", [rt.V.int(2)]), rt.V.str("|"), rt.method(v, "maxi", [rt.V.int(2)]), rt.V.str("|"), rt.method(v, "clampi", [rt.V.int((-2)), rt.V.int(2)]), rt.V.str("|"), rt.method(v, "snappedi", [rt.V.int(5)]), rt.V.str("|"), rt.method(v, "clampi", [rt.V.int(2), rt.V.int((-2))]), rt.V.str("|"), rt.method(v, "snappedi", [rt.V.int(0)])]));
    }
    for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector3New([rt.V.float(1.5), rt.V.float((-2.5)), rt.V.float(3)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int((-4)), rt.V.int(8), rt.V.int((-16))])])))) {
      print(rt.showArgs([rt.V.str("V3|"), rt.method(v, "minf", [rt.V.float(1)]), rt.V.str("|"), rt.method(v, "maxf", [rt.V.float(1)]), rt.V.str("|"), rt.method(v, "posmod", [rt.V.float(3)]), rt.V.str("|"), rt.method(v, "posmodv", [rt.vector3New([rt.V.int(3), rt.V.int((-3)), rt.V.int(2)])])]));
    }
    for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector3New([rt.V.float(1.5), rt.V.float((-2.5)), rt.V.float(3)]), rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])])))) {
      print(rt.showArgs([rt.V.str("V3X|"), rt.method(v, "posmod", [rt.V.float((-3))]), rt.V.str("|"), rt.method(v, "posmod", [rt.V.float(0)]), rt.V.str("|"), rt.method(v, "minf", [rt.V.float((-0))]), rt.V.str("|"), rt.method(v, "maxf", [rt.V.float((-0))])]));
    }
    for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector3iNew([rt.V.int(3), rt.V.int((-4)), rt.V.int(5)]), rt.vector3iNew([rt.V.int((-1)), rt.V.int(1), rt.V.int(0)]), rt.vector3iNew([rt.V.int(2147483647), rt.V.int(0), rt.V.int((-214847))])])))) {
      print(rt.showArgs([rt.V.str("V3I|"), rt.method(v, "mini", [rt.V.int(2)]), rt.V.str("|"), rt.method(v, "maxi", [rt.V.int(2)]), rt.V.str("|"), rt.method(v, "clampi", [rt.V.int((-2)), rt.V.int(2)]), rt.V.str("|"), rt.method(v, "snappedi", [rt.V.int(5)]), rt.V.str("|"), rt.method(v, "clampi", [rt.V.int(2), rt.V.int((-2))]), rt.V.str("|"), rt.method(v, "snappedi", [rt.V.int(0)])]));
    }
    for (let c of rt.iter(rt.V.array(rt.GArray.of([rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.int(1)]), rt.colorNew([rt.V.float((-0.2)), rt.V.float(1.5), rt.V.float(0.04045), rt.V.float(0.0031308)]), rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.colorNew([rt.V.int(1), rt.V.int(1), rt.V.int(1), rt.V.int(1)])])))) {
      print(rt.showArgs([rt.V.str("C|"), rt.method(c, "clamp", []), rt.V.str("|"), rt.method(c, "clamp", [rt.colorNew([rt.V.float(0.2), rt.V.float(0.2), rt.V.float(0.2), rt.V.float(0.2)])]), rt.V.str("|"), rt.method(c, "clamp", [rt.colorNew([rt.V.float(0.2), rt.V.float(0.6), rt.V.float(0.1), rt.V.int(0)]), rt.colorNew([rt.V.float(0.4), rt.V.float(0.9), rt.V.float(0.3), rt.V.int(1)])]), rt.V.str("|"), rt.method(c, "linear_to_srgb", []), rt.V.str("|"), rt.method(c, "srgb_to_linear", [])]));
    }
    print(rt.showArgs([rt.V.str("CX|"), rt.method(rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)]), "clamp", [rt.colorNew([rt.V.float(0.9), rt.V.float(0.1), rt.V.float(0.9), rt.V.float(0.1)]), rt.colorNew([rt.V.float(0.1), rt.V.float(0.9), rt.V.float(0.1), rt.V.float(0.9)])])]));
    print(rt.showArgs([rt.V.str("CLX|"), rt.method(rt.vector2iNew([rt.V.int(3), rt.V.int((-4))]), "clamp", [rt.vector2iNew([rt.V.int(2), rt.V.int((-2))]), rt.vector2iNew([rt.V.int((-2)), rt.V.int(2)])]), rt.V.str("|"), rt.method(rt.vector2iNew([rt.V.int((-1)), rt.V.int(5)]), "clamp", [rt.vector2iNew([rt.V.int(2), rt.V.int((-2))]), rt.vector2iNew([rt.V.int((-2)), rt.V.int(2)])])]));
    print(rt.showArgs([rt.V.str("CLY|"), rt.method(rt.vector3iNew([rt.V.int(3), rt.V.int((-4)), rt.V.int(5)]), "clamp", [rt.vector3iNew([rt.V.int(2), rt.V.int((-2)), rt.V.int(2)]), rt.vector3iNew([rt.V.int((-2)), rt.V.int(2), rt.V.int((-2))])]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.int(3), rt.V.int((-4)), rt.V.int(5)]), "clamp", [rt.vector3New([rt.V.int(2), rt.V.int((-2)), rt.V.int(2)]), rt.vector3New([rt.V.int((-2)), rt.V.int(2), rt.V.int((-2))])]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.int(3), rt.V.int((-4)), rt.V.int(5)]), "clampf", [rt.V.float(2), rt.V.float((-2))])]));
    print(rt.showArgs([rt.V.str("CLZ|"), rt.method(rt.colorNew([rt.V.int(3), rt.V.int((-3)), rt.V.float(0.5), rt.V.int(1)]), "clamp", [rt.colorNew([rt.V.int(2), rt.V.int(2), rt.V.int(2), rt.V.int(2)]), rt.colorNew([rt.V.int((-2)), rt.V.int((-2)), rt.V.int((-2)), rt.V.int((-2))])]), rt.V.str("|"), rt.method(rt.colorNew([rt.V.int(3), rt.V.int((-3)), rt.V.float(0.5), rt.V.int(1)]), "clamp", [])]));
    print(rt.showArgs([rt.V.str("SNAP|"), rt.method(rt.vector2iNew([rt.V.int(2147483647), rt.V.int((-2147483648))]), "snapped", [rt.vector2iNew([rt.V.int(5), rt.V.int(5)])]), rt.V.str("|"), rt.method(rt.vector2iNew([rt.V.int((-2147483648)), rt.V.int(7)]), "snappedi", [rt.V.int(5)]), rt.V.str("|"), rt.method(rt.vector3iNew([rt.V.int((-2147483648)), rt.V.int(2147483647), rt.V.int(3)]), "snapped", [rt.vector3iNew([rt.V.int(5), rt.V.int(5), rt.V.int(5)])]), rt.V.str("|"), rt.method(rt.vector3iNew([rt.V.int((-2147483648)), rt.V.int(2), rt.V.int((-1))]), "snappedi", [rt.V.int(5)])]));
    print(rt.showArgs([rt.V.str("SNAP2|"), rt.method(rt.vector2iNew([rt.V.int((-5)), rt.V.int(5)]), "snappedi", [rt.V.int(2)]), rt.V.str("|"), rt.method(rt.vector2iNew([rt.V.int((-5)), rt.V.int(5)]), "snapped", [rt.vector2iNew([rt.V.int(2), rt.V.int(2)])]), rt.V.str("|"), rt.method(rt.vector2iNew([rt.V.int((-15)), rt.V.int(25)]), "snappedi", [rt.V.int(10)]), rt.V.str("|"), rt.method(rt.vector2iNew([rt.V.int(0), rt.V.int((-0))]), "snappedi", [rt.V.int(3)])]));
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
