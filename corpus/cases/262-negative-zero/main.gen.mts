// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let pz = 0;
    let nz = (pz * (-1));
    print(rt.showArgs([rt.V.str("a01|"), rt.V.float(nz)]));
    print(rt.showArgs([rt.V.str("a02|"), rt.strBuiltin([rt.V.float(nz)])]));
    print(rt.showArgs([rt.V.str("a03|"), rt.formatOf(rt.V.str("%.1f"), rt.V.float(nz))]));
    print(rt.showArgs([rt.V.str("a04|"), rt.formatOf(rt.V.str("%f"), rt.V.float(nz))]));
    print(rt.showArgs([rt.V.str("a05|"), rt.formatOf(rt.V.str("%05.1f"), rt.V.float(nz))]));
    print(rt.showArgs([rt.V.str("a06|"), rt.V.float((1 / nz))]));
    print(rt.showArgs([rt.V.str("a07|"), rt.V.float((-nz))]));
    print(rt.showArgs([rt.V.str("a08|"), rt.V.bool((nz === pz))]));
    print(rt.showArgs([rt.V.str("a09|"), rt.gSin(rt.V.float(nz))]));
    print(rt.showArgs([rt.V.str("a10|"), rt.gCos(rt.V.float(nz))]));
    print(rt.showArgs([rt.V.str("a11|"), rt.gAtan2(rt.V.float(nz), rt.V.float(pz))]));
    print(rt.showArgs([rt.V.str("a12|"), rt.gAtan2(rt.V.float(pz), rt.V.float(nz))]));
    print(rt.showArgs([rt.V.str("a13|"), rt.gAtan2(rt.V.float(nz), rt.V.float(nz))]));
    print(rt.showArgs([rt.V.str("a14|"), rt.gAtan2(rt.V.float(pz), rt.V.float(pz))]));
    print(rt.showArgs([rt.V.str("a15|"), rt.gAtan2(rt.V.float(nz), rt.V.float(1))]));
    print(rt.showArgs([rt.V.str("a16|"), rt.gAtan2(rt.V.float(1), rt.V.float(nz))]));
    print(rt.showArgs([rt.V.str("a17|"), rt.V.array(rt.GArray.of([rt.V.float(nz), rt.V.float(pz)]))]));
    print(rt.showArgs([rt.V.str("a18|"), rt.dictOf([[rt.V.float(nz), rt.V.int(1)]])]));
    print(rt.showArgs([rt.V.str("a19|"), rt.abs(rt.V.float(nz))]));
    print(rt.showArgs([rt.V.str("a20|"), rt.gFloor(rt.V.float(nz), "auto")]));
    print(rt.showArgs([rt.V.str("a21|"), rt.gRound(rt.V.float(nz), "auto")]));
    print(rt.showArgs([rt.V.str("a22|"), rt.formatOf(rt.V.str("%.1f"), INF)]));
    print(rt.showArgs([rt.V.str("a23|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.neg(INF))]));
    print(rt.showArgs([rt.V.str("a24|"), rt.formatOf(rt.V.str("%.1f"), NAN)]));
    print(rt.showArgs([rt.V.str("a25|"), rt.formatOf(rt.V.str("%5.1f"), rt.ops.neg(INF))]));
    print(rt.showArgs([rt.V.str("a26|"), rt.formatOf(rt.V.str("%d"), INF)]));
    print(rt.showArgs([rt.V.str("a27|"), rt.formatOf(rt.V.str("%d"), NAN)]));
    print(rt.showArgs([rt.V.str("a28|"), rt.formatOf(rt.V.str("%d"), rt.V.float(1.5))]));
    print(rt.showArgs([rt.V.str("a29|"), rt.formatOf(rt.V.str("%d"), rt.V.float((-1.5)))]));
    print(rt.showArgs([rt.V.str("a30|"), rt.formatOf(rt.V.str("%+f"), INF)]));
    print(rt.showArgs([rt.V.str("a31|"), rt.formatOf(rt.V.str("%s"), rt.V.float(nz))]));
    print(rt.showArgs([rt.V.str("a32|"), rt.gTan(rt.V.float(nz))]));
    print(rt.showArgs([rt.V.str("a33|"), rt.gSnapped(rt.V.float(nz), rt.V.float(1))]));
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
