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
      let n = rt.method(rt.nativeClass("Node"), "new", []);
      rt.frameLine(4);
      rt.method(n, "add_user_signal", [rt.V.str("x")]);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("h|"), rt.method(n, "has_signal", [rt.V.str("x")]), rt.V.str("|"), rt.method(n, "has_user_signal", [rt.V.str("x")])]));
      rt.frameLine(6);
      rt.method(n, "connect", [rt.V.str("x"), rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("Main.gd", "<anonymous lambda>");
        try {
          const a = __a[0] as rt.Variant;
          rt.frameLine(6);
          print(rt.showArgs([rt.V.str("x|"), a]));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)]);
      rt.frameLine(7);
      rt.method(n, "emit_signal", [rt.V.str("x"), rt.V.int(7)]);
      rt.frameLine(8);
      rt.method(n, "remove_user_signal", [rt.V.str("x")]);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("r|"), rt.method(n, "has_signal", [rt.V.str("x")])]));
      rt.frameLine(10);
      rt.method(n, "free", []);
      rt.frameLine(11);
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
