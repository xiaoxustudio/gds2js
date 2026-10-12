// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    for (let s of rt.iter(rt.V.array(rt.GArray.of([rt.V.float(0.9999), rt.V.float(0.99990001), rt.V.float(0.99989), rt.V.float((-0.9999)), rt.V.float(1.9999), rt.V.float(0.09999), rt.V.float(0.099990001), rt.V.float(0.0999999), rt.V.float(0.009999), rt.V.float(0.0099999), rt.V.float(0.0009999), rt.V.float(0.00099999), rt.V.float(0.00009999), rt.V.float(0.000009999), rt.V.float(9.999e-7), rt.V.float(9.999e-8), rt.V.float(9.999e-9), rt.V.float(9.999e-10), rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.5), rt.V.float(1), rt.V.float(2), rt.V.float(0), rt.V.float(1e-11), rt.V.float(12.9999), rt.V.float(3.09999), rt.V.float(7.009999), rt.V.float(1000000000), rt.V.float(16777216), rt.V.float(33554432), rt.V.float(0.01), rt.V.float(0.001), rt.V.float(0.100000001490116), rt.V.float(0.09999999), rt.V.float((1 / 7)), rt.V.float(0.3333333), rt.V.float(2.5), rt.V.float(0.03125), rt.V.float(0.0009999), rt.V.float(0.9999), rt.V.float(0.9999999), rt.V.float(0.000001), rt.V.float(12.5), rt.V.float(0.0032), rt.V.float((-0.1)), rt.V.float((-0.001)), rt.V.float(1e-9)])))) {
      print(rt.showArgs([rt.V.str("SD|"), s, rt.V.str("|"), rt.gStepDecimals(s)]));
    }
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
