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
      let a = 9007199254740994;
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("f1 "), rt.toInt(rt.V.float(a)), rt.V.str(" | "), rt.V.float(a)]));
      rt.frameLine(6);
      let b = 9007199254740994;
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("f2 "), rt.toInt(rt.V.float(b))]));
      rt.frameLine(8);
      let c = 0.12345678901234568;
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("f3 "), rt.toInt(rt.V.float((c * 100000000000000000))), rt.V.str(" | "), rt.V.float(c)]));
      rt.frameLine(10);
      let d = 1.2345678901e-7;
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("f4 "), rt.toInt(rt.V.float((d * 1e+25))), rt.V.str(" | "), rt.V.float(d)]));
      rt.frameLine(12);
      let e = 1;
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("f5 "), rt.toInt(rt.V.float((e * 1000000000000000000)))]));
      rt.frameLine(14);
      let f = 100000000000000000;
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("f6 "), rt.toInt(rt.V.float(f))]));
      rt.frameLine(16);
      let g = 1234567890123456800;
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("f7 "), rt.toInt(rt.V.float(g))]));
      rt.frameLine(18);
      let h = 1;
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("f8 "), rt.V.float(h), rt.V.str(" | "), rt.toInt(rt.V.float(h))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("f9 "), rt.toInt(rt.V.float((1.0000000000000001e-23 * 1e+30))), rt.V.str(" | "), rt.V.float((1.0000000000000001e-23 * 1e+30))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("f10 "), rt.V.bool((a === 9007199254740994)), rt.V.str(" | "), rt.V.bool((a > 9007199254740992)), rt.V.str(" | "), rt.V.bool((d < 1.2345678901e-7))]));
      rt.frameLine(22);
      let i = 1000000.25;
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("f11 "), rt.toInt(rt.V.float(i)), rt.V.str(" | "), rt.V.float(i)]));
      rt.frameLine(24);
      let j = rt.V.float((-9007199254740994));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("f12 "), rt.toInt(j)]));
      rt.frameLine(26);
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
