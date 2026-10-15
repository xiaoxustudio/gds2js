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

  show(tag: rt.Variant, v: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "show");
    try {
      rt.frameLine(4);
      print(rt.showArgs([tag, rt.V.str("|"), rt.typeOf(v), rt.V.str("|"), rt.V.str(rt.varToStr(v))]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(7);
      this.show(rt.V.str("r01|"), rt.toFloat(rt.V.str("1e-30")));
      rt.frameLine(8);
      this.show(rt.V.str("r02|"), rt.toFloat(rt.V.str("1.0e-30")));
      rt.frameLine(9);
      this.show(rt.V.str("r03|"), rt.toFloat(rt.V.str("3e-30")));
      rt.frameLine(10);
      this.show(rt.V.str("r04|"), rt.toFloat(rt.V.str("3.0e-30")));
      rt.frameLine(11);
      this.show(rt.V.str("r05|"), rt.toFloat(rt.V.str("12abc")));
      rt.frameLine(12);
      this.show(rt.V.str("r06|"), rt.toFloat(rt.V.str("xyz")));
      rt.frameLine(13);
      this.show(rt.V.str("r07|"), rt.toFloat(rt.V.str("1.5e+")));
      rt.frameLine(14);
      this.show(rt.V.str("r08|"), rt.toFloat(rt.V.str("1e-309")));
      rt.frameLine(15);
      this.show(rt.V.str("r09|"), rt.toFloat(rt.V.str("9007199254740993.0")));
      rt.frameLine(16);
      this.show(rt.V.str("r10|"), rt.toFloat(rt.V.str("12345678901234567890.5")));
      rt.frameLine(17);
      this.show(rt.V.str("r11|"), rt.toFloat(rt.V.str("1e23")));
      rt.frameLine(18);
      this.show(rt.V.str("r12|"), rt.toFloat(rt.V.str("2.5e-11")));
      rt.frameLine(19);
      this.show(rt.V.str("r13|"), rt.strToVar(rt.V.str("1e-30")));
      rt.frameLine(20);
      this.show(rt.V.str("r14|"), rt.strToVar(rt.V.str("0.0000001234567890123456789")));
      rt.frameLine(21);
      this.show(rt.V.str("r15|"), rt.strToVar(rt.V.str("99.99999999999999999999")));
      rt.frameLine(22);
      this.show(rt.V.str("r16|"), rt.V.float(9.999999999999999e-31));
      rt.frameLine(23);
      this.show(rt.V.str("r17|"), rt.V.float(2.5e-11));
      rt.frameLine(24);
      this.show(rt.V.str("r18|"), rt.V.float(1.024e+26));
      rt.frameLine(25);
      this.show(rt.V.str("r19|"), rt.V.float(1.7976931348623157e+308));
      rt.frameLine(26);
      this.show(rt.V.str("r20|"), rt.V.float(1.2345678901e-7));
      rt.frameLine(27);
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
      case "show": return rt.wrapValue(this.show(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "show": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
