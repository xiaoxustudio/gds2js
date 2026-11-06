// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "gds2js/runtime";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "gds2js/host";

export class Main extends SceneTree {
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("Main.gd", "@implicit_new");
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
    const __gd_frame = rt.frameEnter("Main.gd", "_initialize");
    try {
      rt.frameLine(3);
      let t = rt.transform2dNew([rt.vector2New([rt.V.float(0.5), rt.V.float(0.2)]), rt.vector2New([rt.V.float((-0.3)), rt.V.float(1.2)]), rt.vector2New([rt.V.int(4), rt.V.int(5)])]);
      rt.frameLine(4);
      print(rt.showArgs([rt.V.str("bx|"), rt.method(t, "basis_xform", [rt.vector2New([rt.V.int(1), rt.V.int(2)])]), rt.V.str("|"), rt.method(t, "basis_xform_inv", [rt.vector2New([rt.V.int(1), rt.V.int(2)])])]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("org|"), rt.method(t, "get_origin", []), rt.V.str("|"), rt.method(t, "get_skew", [])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("inv|"), rt.method(t, "inverse", [])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("orth|"), rt.method(t, "orthonormalized", [])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("eq|"), rt.method(t, "is_equal_approx", [rt.transform2dNew([rt.vector2New([rt.V.float(0.5), rt.V.float(0.2)]), rt.vector2New([rt.V.float((-0.3)), rt.V.float(1.2)]), rt.vector2New([rt.V.int(4), rt.V.int(5)])])]), rt.V.str("|"), rt.method(t, "is_finite", [])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("rl|"), rt.method(t, "rotated_local", [rt.V.float(0.5)])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("sl|"), rt.method(t, "scaled_local", [rt.vector2New([rt.V.int(2), rt.V.int(3)])])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("tl|"), rt.method(t, "translated_local", [rt.vector2New([rt.V.int(1), rt.V.int(2)])])]));
      rt.frameLine(12);
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
rt.registerDictIdentity(__gd_d_Main, null, "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "Main.gd");
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
