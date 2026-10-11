// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let v = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
    let w = rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
    print(rt.showArgs([rt.V.str("FA|"), rt.method(v, "from_angle", [rt.V.float(0)]), rt.V.str("|"), rt.method(v, "from_angle", [rt.V.float(1.5707963267949)]), rt.V.str("|"), rt.method(v, "from_angle", [rt.V.float((-2.5))]), rt.V.str("|"), rt.method(v, "from_angle", [rt.V.float(3.14159265358979)]), rt.V.str("|"), rt.typeOf(rt.method(v, "from_angle", [rt.V.float(0.5)])), rt.V.str("|"), rt.method(v, "from_angle", [rt.V.float(10000000)])]));
    print(rt.showArgs([rt.V.str("SA|"), rt.method(w, "signed_angle_to", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)])]), rt.V.str("|"), rt.method(w, "signed_angle_to", [rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])]), rt.V.str("|"), rt.method(w, "signed_angle_to", [w, rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)])]), rt.V.str("|"), rt.method(w, "signed_angle_to", [rt.vector3New([rt.V.int((-1)), rt.V.int((-2)), rt.V.int((-3))]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)])]), rt.V.str("|"), rt.method(w, "signed_angle_to", [rt.vector3New([rt.V.float(10000000), rt.V.float(20000000), rt.V.float(30000000)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)])])]));
    print(rt.showArgs([rt.V.str("SA2|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "signed_angle_to", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)])]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "signed_angle_to", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int((-1))])]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "signed_angle_to", [rt.vector3New([rt.V.int(0), rt.V.int((-1)), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)])]), rt.V.str("|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "signed_angle_to", [rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)])])]));
    for (let c of rt.iter(rt.V.array(rt.GArray.of([rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.int(1)]), rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.colorNew([rt.V.int(1), rt.V.int(1), rt.V.int(1), rt.V.int(1)]), rt.colorNew([rt.V.float(0.0000076295), rt.V.float(0.5), rt.V.float(0.99999), rt.V.float(0.5)]), rt.colorNew([rt.V.float((-0.2)), rt.V.float(1.5), NAN, rt.V.float(0.5)]), rt.colorNew([INF, rt.ops.neg(INF), rt.V.float(0.5), rt.V.int(1)])])))) {
      print(rt.showArgs([rt.V.str("C64|"), rt.method(c, "to_rgba64", []), rt.V.str("|"), rt.method(c, "to_argb64", []), rt.V.str("|"), rt.method(c, "to_abgr64", []), rt.V.str("|"), rt.typeOf(rt.method(c, "to_rgba64", []))]));
    }
    for (let c of rt.iter(rt.V.array(rt.GArray.of([rt.colorNew([rt.V.float((-0.2)), rt.V.float(1.5), NAN, rt.V.float(0.5)]), rt.colorNew([INF, rt.ops.neg(INF), rt.V.float(0.5), rt.V.int(1)]), rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.int(1)]), rt.colorNew([rt.V.float(1.0039), rt.V.int(260), rt.V.int((-1)), rt.V.float(0.5)])])))) {
      print(rt.showArgs([rt.V.str("C32|"), rt.method(c, "to_rgba32", []), rt.V.str("|"), rt.method(c, "to_argb32", []), rt.V.str("|"), rt.method(c, "to_abgr32", []), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "r8")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "g8")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "b8")), rt.V.str("|"), rt.wrapValue(rt.attribute(c, "a8")), rt.V.str("|"), rt.typeOf(rt.method(c, "to_rgba32", []))]));
    }
    print(rt.showArgs([rt.V.str("HT|"), rt.method(rt.colorNew([rt.V.float((-0.2)), rt.V.float(1.5), rt.V.float(0.5), rt.V.int(1)]), "to_html", []), rt.V.str("|"), rt.method(rt.colorNew([rt.V.float(1.0039), rt.V.float(0.996), rt.V.int((-1)), rt.V.float(0.5)]), "to_html", []), rt.V.str("|"), rt.method(rt.colorNew([NAN, rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)]), "to_html", [])]));
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
