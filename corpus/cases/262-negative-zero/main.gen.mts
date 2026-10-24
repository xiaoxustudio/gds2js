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
      let pz = 0;
      rt.frameLine(5);
      let nz = (pz * (-1));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("a01|"), rt.V.float(nz)]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("a02|"), rt.strBuiltin([rt.V.float(nz)])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("a03|"), rt.formatOf(rt.V.str("%.1f"), rt.V.float(nz), false)]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("a04|"), rt.formatOf(rt.V.str("%f"), rt.V.float(nz), false)]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("a05|"), rt.formatOf(rt.V.str("%05.1f"), rt.V.float(nz), false)]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("a06|"), rt.V.float((1 / nz))]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("a07|"), rt.V.float((-nz))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("a08|"), rt.V.bool((nz === pz))]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("a09|"), rt.gSin(rt.V.float(nz))]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("a10|"), rt.gCos(rt.V.float(nz))]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("a11|"), rt.gAtan2(rt.V.float(nz), rt.V.float(pz))]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("a12|"), rt.gAtan2(rt.V.float(pz), rt.V.float(nz))]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("a13|"), rt.gAtan2(rt.V.float(nz), rt.V.float(nz))]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("a14|"), rt.gAtan2(rt.V.float(pz), rt.V.float(pz))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("a15|"), rt.gAtan2(rt.V.float(nz), rt.V.float(1))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("a16|"), rt.gAtan2(rt.V.float(1), rt.V.float(nz))]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("a17|"), rt.V.array(rt.GArray.of([rt.V.float(nz), rt.V.float(pz)]))]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("a18|"), rt.dictOf([[rt.V.float(nz), rt.V.int(1)]])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("a19|"), rt.abs(rt.V.float(nz))]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("a20|"), rt.gFloor(rt.V.float(nz), "auto")]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("a21|"), rt.gRound(rt.V.float(nz), "auto")]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("a22|"), rt.formatOf(rt.V.str("%.1f"), INF, true)]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("a23|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.neg(INF), true)]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("a24|"), rt.formatOf(rt.V.str("%.1f"), NAN, true)]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("a25|"), rt.formatOf(rt.V.str("%5.1f"), rt.ops.neg(INF), true)]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("a26|"), rt.formatOf(rt.V.str("%d"), INF, true)]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("a27|"), rt.formatOf(rt.V.str("%d"), NAN, true)]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("a28|"), rt.formatOf(rt.V.str("%d"), rt.V.float(1.5), true)]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("a29|"), rt.formatOf(rt.V.str("%d"), rt.V.float((-1.5)), true)]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("a30|"), rt.formatOf(rt.V.str("%+f"), INF, true)]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("a31|"), rt.formatOf(rt.V.str("%s"), rt.V.float(nz), false)]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("a32|"), rt.gTan(rt.V.float(nz))]));
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("a33|"), rt.gSnapped(rt.V.float(nz), rt.V.float(1))]));
      rt.frameLine(39);
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
