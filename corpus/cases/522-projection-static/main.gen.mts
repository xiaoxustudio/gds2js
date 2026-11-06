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
      let p = rt.projectionStatic("create_perspective", [rt.V.float(60), rt.V.float((16 / 9)), rt.V.float(0.1), rt.V.float(100)]);
      rt.frameLine(4);
      print(rt.showArgs([rt.V.str("p|"), p]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("z|"), rt.method(p, "get_z_near", []), rt.V.str("|"), rt.method(p, "get_z_far", [])]));
      rt.frameLine(6);
      let o = rt.projectionStatic("create_orthogonal", [rt.V.int((-2)), rt.V.int(2), rt.V.int((-1)), rt.V.int(1), rt.V.float(0.1), rt.V.int(100)]);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("o|"), o]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("oz|"), rt.method(o, "get_z_near", []), rt.V.str("|"), rt.method(o, "get_z_far", []), rt.V.str("|"), rt.method(o, "is_orthogonal", [])]));
      rt.frameLine(9);
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
