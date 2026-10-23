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
      rt.frameLine(4);
      let pz = 0;
      rt.frameLine(5);
      let nz = (pz * (-1));
      rt.frameLine(6);
      let one = 1;
      rt.frameLine(7);
      print(rt.showArgs([rt.typeOf(rt.V.float(nz)), rt.V.str("|"), rt.V.float(nz), rt.V.str("|"), rt.V.float((1 / (nz * one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.V.float((nz * one)), true)]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("floor|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gFloor(rt.V.float(nz), "auto"), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gFloor(rt.V.float(nz), "auto"), rt.V.float(one)), true)]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("ceil|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gCeil(rt.V.float(nz), "auto"), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gCeil(rt.V.float(nz), "auto"), rt.V.float(one)), true)]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("round|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gRound(rt.V.float(nz), "auto"), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gRound(rt.V.float(nz), "auto"), rt.V.float(one)), true)]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("floorf|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gFloor(rt.V.float(nz), "float"), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gFloor(rt.V.float(nz), "float"), rt.V.float(one)), true)]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("ceilf|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gCeil(rt.V.float(nz), "float"), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gCeil(rt.V.float(nz), "float"), rt.V.float(one)), true)]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("roundf|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gRound(rt.V.float(nz), "float"), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gRound(rt.V.float(nz), "float"), rt.V.float(one)), true)]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("floori|"), rt.typeOf(rt.gFloor(rt.V.float(nz), "int")), rt.V.str("|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gFloor(rt.V.float(nz), "int"), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gFloor(rt.V.float(nz), "int"), rt.V.float(one)), true)]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("ceili|"), rt.typeOf(rt.gCeil(rt.V.float(nz), "int")), rt.V.str("|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gCeil(rt.V.float(nz), "int"), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gCeil(rt.V.float(nz), "int"), rt.V.float(one)), true)]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("roundi|"), rt.typeOf(rt.gRound(rt.V.float(nz), "int")), rt.V.str("|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gRound(rt.V.float(nz), "int"), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gRound(rt.V.float(nz), "int"), rt.V.float(one)), true)]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("clampf|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gClamp(rt.V.float(nz), rt.V.float(pz), rt.V.float(one), "float"), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gClamp(rt.V.float(nz), rt.V.float(pz), rt.V.float(one), "float"), rt.V.float(one)), true)]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("clampf2|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gClamp(rt.V.float(nz), rt.V.float(nz), rt.V.float(one), "float"), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gClamp(rt.V.float(nz), rt.V.float(nz), rt.V.float(one), "float"), rt.V.float(one)), true)]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("clamp|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gClamp(rt.V.float(nz), rt.V.float(pz), rt.V.float(one), "auto"), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gClamp(rt.V.float(nz), rt.V.float(pz), rt.V.float(one), "auto"), rt.V.float(one)), true)]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("deg_to_rad|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gDegToRad(rt.V.float(nz)), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gDegToRad(rt.V.float(nz)), rt.V.float(one)), true)]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("rad_to_deg|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gRadToDeg(rt.V.float(nz)), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gRadToDeg(rt.V.float(nz)), rt.V.float(one)), true)]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("fmod|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gFmod(rt.V.float(nz), rt.V.float(one)), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gFmod(rt.V.float(nz), rt.V.float(one)), rt.V.float(one)), true)]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("sqrt|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.sqrt(rt.V.float(nz)), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.sqrt(rt.V.float(nz)), rt.V.float(one)), true)]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("abs|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.abs(rt.V.float(nz)), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.abs(rt.V.float(nz)), rt.V.float(one)), true)]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("sign|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gSign(rt.V.float(nz)), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gSign(rt.V.float(nz)), rt.V.float(one)), true)]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("snapped|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gSnapped(rt.V.float(nz), rt.V.float(one)), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gSnapped(rt.V.float(nz), rt.V.float(one)), rt.V.float(one)), true)]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("fposmod|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gFposmod(rt.V.float(nz), rt.V.float(one)), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gFposmod(rt.V.float(nz), rt.V.float(one)), rt.V.float(one)), true)]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("lerp|"), rt.ops.div(rt.V.float(1), rt.ops.mul(rt.gLerp(rt.V.float(nz), rt.V.float(one), rt.V.float(pz)), rt.V.float(one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.ops.mul(rt.gLerp(rt.V.float(nz), rt.V.float(one), rt.V.float(pz)), rt.V.float(one)), true)]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("neg|"), rt.V.float((1 / ((-nz) * one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.V.float(((-nz) * one)), true)]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("negneg|"), rt.V.float((1 / ((-(-nz)) * one))), rt.V.str("|"), rt.formatOf(rt.V.str("%.1f"), rt.V.float(((-(-nz)) * one)), true)]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("key|"), rt.wrapValue(rt.index(rt.dictOf([[rt.V.float(0), rt.V.str("zero")]]), rt.V.float(nz))), rt.V.str("|"), rt.variantHash([rt.V.float(nz)]), rt.V.str("|"), rt.variantHash([rt.V.float(pz)])]));
      rt.frameLine(32);
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
