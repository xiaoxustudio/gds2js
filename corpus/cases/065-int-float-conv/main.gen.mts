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
      print(rt.showArgs([rt.toInt(rt.V.float(3.7))]));
      rt.frameLine(5);
      print(rt.showArgs([rt.toInt(rt.V.float((-3.7)))]));
      rt.frameLine(6);
      print(rt.showArgs([rt.toInt(rt.V.float((-0.5)))]));
      rt.frameLine(7);
      print(rt.showArgs([rt.toInt(rt.V.bool(true))]));
      rt.frameLine(8);
      print(rt.showArgs([rt.toInt(rt.V.bool(false))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.toInt(rt.V.float(9007199254740992))]));
      rt.frameLine(10);
      print(rt.showArgs([rt.toInt(rt.V.float(100000000000000000000))]));
      rt.frameLine(11);
      print(rt.showArgs([rt.toInt(rt.V.float(1e+300))]));
      rt.frameLine(12);
      let z = 0;
      rt.frameLine(13);
      print(rt.showArgs([rt.toInt(rt.V.float((z / z)))]));
      rt.frameLine(14);
      print(rt.showArgs([rt.toInt(rt.V.float((1 / z)))]));
      rt.frameLine(15);
      print(rt.showArgs([rt.toInt(rt.V.float(((-1) / z)))]));
      rt.frameLine(16);
      print(rt.showArgs([rt.toInt(rt.V.str("42"))]));
      rt.frameLine(17);
      print(rt.showArgs([rt.toInt(rt.V.str("-42"))]));
      rt.frameLine(18);
      print(rt.showArgs([rt.toInt(rt.V.str("12x"))]));
      rt.frameLine(19);
      print(rt.showArgs([rt.toInt(rt.V.str("abc"))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.toInt(rt.V.str(""))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.toInt(rt.V.str("0x10"))]));
      rt.frameLine(22);
      print(rt.showArgs([rt.toInt(rt.V.str("1e3"))]));
      rt.frameLine(23);
      print(rt.showArgs([rt.toInt(rt.V.str("3.9"))]));
      rt.frameLine(24);
      print(rt.showArgs([rt.toInt(rt.V.str(" 42 "))]));
      rt.frameLine(25);
      print(rt.showArgs([rt.toInt(rt.V.str("+7"))]));
      rt.frameLine(26);
      print(rt.showArgs([rt.toFloat(rt.V.int(3))]));
      rt.frameLine(27);
      print(rt.showArgs([rt.toFloat(rt.V.bool(true))]));
      rt.frameLine(28);
      print(rt.showArgs([rt.toFloat(rt.V.str("1.5"))]));
      rt.frameLine(29);
      print(rt.showArgs([rt.toFloat(rt.V.str(".5"))]));
      rt.frameLine(30);
      print(rt.showArgs([rt.toFloat(rt.V.str("1e3"))]));
      rt.frameLine(31);
      print(rt.showArgs([rt.toFloat(rt.V.str(" 1.5 "))]));
      rt.frameLine(32);
      print(rt.showArgs([rt.toFloat(rt.V.str("-2.5e2"))]));
      rt.frameLine(33);
      print(rt.showArgs([rt.toFloat(rt.V.str("abc"))]));
      rt.frameLine(34);
      print(rt.showArgs([rt.toFloat(rt.V.str("0x10"))]));
      rt.frameLine(35);
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
