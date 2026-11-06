// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "gds2js/runtime";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "gds2js/host";

const PI = rt.V.float(3.141592653589793);

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
      print(rt.showArgs([rt.V.str("fs|"), rt.basisStatic("from_scale", [rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)])])]));
      rt.frameLine(4);
      let e = rt.basisStatic("from_euler", [rt.vector3New([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3)])]);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("fe|"), e]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("ge|"), rt.method(e, "get_euler", [])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("q|"), rt.method(e, "get_rotation_quaternion", [])]));
      rt.frameLine(8);
      let y90 = rt.basisNew([rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.ops.div(PI, rt.V.int(2))]);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("sl|"), rt.method(rt.basisNew([]), "slerp", [y90, rt.V.float(0.5)])]));
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
