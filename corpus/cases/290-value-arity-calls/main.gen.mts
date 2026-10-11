// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let v = rt.toVec2(rt.vector2New([rt.V.int(3), rt.V.int(4)]));
    let c = rt.toColor(rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.int(1)]));
    let a = rt.vector2iNew([rt.V.int(3), rt.V.int(4)]);
    print(rt.showArgs([rt.V.str("AA|"), rt.method(v, "limit_length", []), rt.V.str("|"), rt.method(v, "limit_length", [rt.V.float(2)]), rt.V.str("|"), rt.method(c, "to_html", []), rt.V.str("|"), rt.method(c, "to_html", [rt.V.bool(false)]), rt.V.str("|"), rt.colorStatic("from_hsv", [rt.V.float(0.5), rt.V.float(1), rt.V.float(1)]), rt.V.str("|"), rt.colorStatic("from_hsv", [rt.V.float(0.5), rt.V.float(1), rt.V.float(1), rt.V.float(0.5)]), rt.V.str("|"), rt.method(a, "snapped", [rt.vector2iNew([rt.V.int(1), rt.V.int(1)])]), rt.V.str("|"), rt.method(v, "rotated", [rt.V.float(1)])]));
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
