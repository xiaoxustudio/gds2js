// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("P1|"), rt.gPosmod(rt.V.int(5), rt.V.int(0))]));
    print(rt.showArgs([rt.V.str("P2|"), rt.gPosmod(rt.V.int((-5)), rt.V.int(0))]));
    print(rt.showArgs([rt.V.str("P3|"), rt.gPosmod(rt.V.int(0), rt.V.int(0))]));
    print(rt.showArgs([rt.V.str("P4|"), rt.gPosmod(rt.V.int(2147483648), rt.V.int(0))]));
    print(rt.showArgs([rt.V.str("P5|"), rt.gPosmod(rt.V.int(9223372036854775807n), rt.V.int(0))]));
    print(rt.showArgs([rt.V.str("P6|"), rt.gPosmod(rt.V.int(7), rt.V.int(1))]));
    print(rt.showArgs([rt.V.str("P7|"), rt.gPosmod(rt.V.int(7), rt.V.int((-1)))]));
    print(rt.showArgs([rt.V.str("P8|"), rt.gPosmod(rt.V.int((-7)), rt.V.int((-1)))]));
    print(rt.showArgs([rt.V.str("P9|"), rt.gPosmod(rt.V.int(10), rt.V.int(5))]));
    print(rt.showArgs([rt.V.str("PA|"), rt.gPosmod(rt.V.int((-10)), rt.V.int(5))]));
    print(rt.showArgs([rt.V.str("PB|"), rt.gPosmod(rt.V.int(10), rt.V.int((-5)))]));
    print(rt.showArgs([rt.V.str("F1|"), rt.gFposmod(rt.V.float(5), rt.V.float(0))]));
    print(rt.showArgs([rt.V.str("F2|"), rt.gFmod(rt.V.float(5), rt.V.float(0))]));
    print(rt.showArgs([rt.V.str("F3|"), rt.gFposmod(rt.V.float((-5)), rt.V.float(0))]));
    print(rt.showArgs([rt.V.str("W1|"), rt.gWrap(rt.V.int(5), rt.V.int(0), rt.V.int(0), true)]));
    print(rt.showArgs([rt.V.str("W2|"), rt.gWrap(rt.V.int((-3)), rt.V.int(2), rt.V.int(2), true)]));
    print(rt.showArgs([rt.V.str("S1|"), rt.gSnapped(rt.V.int(5), rt.V.int(0))]));
    print(rt.showArgs([rt.V.str("S2|"), rt.gSnapped(rt.V.int((-5)), rt.V.int(0))]));
    print(rt.showArgs([rt.V.str("S3|"), rt.gSnappedI(rt.V.int(5), rt.V.int(0))]));
    print(rt.showArgs([rt.V.str("S4|"), rt.gSnappedF(rt.V.float(5), rt.V.float(0))]));
    print(rt.showArgs([rt.V.str("S5|"), rt.gSnapped(rt.V.float(2.5), rt.V.int(0))]));
    print(rt.showArgs([rt.V.str("S6|"), rt.gSnappedI(rt.V.float(2.5), rt.V.int(0))]));
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
