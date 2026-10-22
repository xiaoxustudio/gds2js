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

  take_color(c: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "take_color");
    try {
      c = rt.paramSlot(c, "Color", 1, "take_color", this);
      rt.frameLine(4);
      print(rt.showArgs([rt.V.str("s "), c]));
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
      let n = 123456789;
      rt.frameLine(8);
      this.take_color(rt.V.int(n));
      rt.frameLine(9);
      this.take_color(rt.V.int((-1)));
      rt.frameLine(10);
      this.take_color(rt.V.int(4294967296));
      rt.frameLine(11);
      this.take_color(rt.V.int(256));
      rt.frameLine(12);
      this.take_color(rt.V.int(16711680));
      rt.frameLine(13);
      this.take_color(rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75)]));
      rt.frameLine(14);
      let s = "abc";
      rt.frameLine(15);
      this.take_color(rt.V.str(s));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("d "), rt.colorNew([rt.V.int(1)]), rt.V.str(" "), rt.colorNew([rt.V.int(255)]), rt.V.str(" "), rt.colorNew([rt.V.int(65280)]), rt.V.str(" "), rt.colorNew([rt.V.int(0)]), rt.V.str(" "), rt.colorNew([rt.V.int(4294967295)])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("e "), rt.colorNew([rt.V.str("red")]), rt.V.str(" "), rt.colorNew([rt.V.str("00ff00")]), rt.V.str(" "), rt.colorNew([rt.V.str("f00")])]));
      rt.frameLine(18);
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
      case "take_color": return rt.wrapValue(this.take_color(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "take_color": [1, 1], "_initialize": [0, 0] });
rt.registerMethodParams(__gd_d_Main, { "take_color": ["Color"] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
