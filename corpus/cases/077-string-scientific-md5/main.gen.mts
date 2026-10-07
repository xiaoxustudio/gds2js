// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.float(1e-7)])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.float(0.00001)])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.float(0.0001)])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.float(0.1)])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.float(1.5)])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.int(0)])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.int(1)])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.float(1000)])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.float(1000000000000000)])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.float(100000000000000000000)])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.float(123456789012345.6)])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.float((1 / 0))])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.float((0 / 0))])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.int(42)])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.float((-1.5))])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.float(9.9999999e-7)])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.float(1e-20)])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.float(100000000000000)])]));
    print(rt.showArgs([rt.stringStatic("num_scientific", [rt.V.bool(true)])]));
    print(rt.showArgs([rt.method(rt.V.str(""), "md5_text", [])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "md5_text", [])]));
    print(rt.showArgs([rt.method(rt.V.str("The quick brown fox"), "md5_text", [])]));
    print(rt.showArgs([rt.method(rt.V.str("中文"), "md5_text", [])]));
    print(rt.showArgs([rt.method(rt.V.str("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"), "md5_text", [])]));
    this.quit();
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
