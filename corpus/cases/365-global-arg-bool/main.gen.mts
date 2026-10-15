// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

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
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("A|"), rt.gAbsF(rt.V.bool(false)), rt.V.str("|"), rt.gAbsI(rt.V.bool(false)), rt.V.str("|"), rt.sqrt(rt.V.bool(false)), rt.V.str("|"), rt.gAcos(rt.V.bool(false))]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("B|"), rt.gAngleDifference(rt.V.bool(false), rt.V.float(1.5)), rt.V.str("|"), rt.gAtan2(rt.V.bool(false), rt.V.float(1.5)), rt.V.str("|"), rt.gPosmod(rt.V.bool(false), rt.V.int(3)), rt.V.str("|"), rt.gPosmod(rt.V.int(5), rt.V.bool(false))]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("C|"), rt.gRemap(rt.V.bool(false), rt.V.int(0), rt.V.int(1), rt.V.int(0), rt.V.int(1)), rt.V.str("|"), rt.gMoveToward(rt.V.bool(false), rt.V.int(1), rt.V.float(0.5)), rt.V.str("|"), rt.gIsEqualApprox(rt.V.bool(false), rt.V.int(0))]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("D|"), rt.gLerp(rt.V.int(1), rt.V.int(2), rt.V.bool(false)), rt.V.str("|"), rt.gClamp(rt.V.bool(true), rt.V.bool(false), rt.V.bool(true), "auto"), rt.V.str("|"), rt.gMax(rt.V.int(1), rt.V.int(2))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("E|"), rt.gClamp(rt.V.bool(false), rt.V.bool(false), rt.V.bool(true), "auto"), rt.V.str("|"), rt.gClamp(rt.V.bool(true), rt.V.bool(true), rt.V.bool(false), "auto"), rt.V.str("|"), rt.gClamp(rt.V.bool(false), rt.V.bool(true), rt.V.bool(true), "auto"), rt.V.str("|"), rt.gClamp(rt.V.bool(true), rt.V.bool(false), rt.V.bool(false), "auto"), rt.V.str("|"), rt.gClamp(rt.V.bool(false), rt.V.bool(true), rt.V.bool(false), "auto")]));
      rt.frameLine(10);
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
