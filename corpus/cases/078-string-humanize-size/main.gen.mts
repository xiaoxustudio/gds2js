// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(0)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(3)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(30)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(300)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1023)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1024)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1025)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1026)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1075)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1076)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1126)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1280)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1536)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1792)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(2047)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(2048)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(2049)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(2560)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(3000)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(5120)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(10240)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(102400)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(30000)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(300000)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1048575)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1048576)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1048577)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1049601)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1052672)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1234567)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(3000000)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(4000000)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1073741823)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1073741824)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1073741825)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1074790400)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(30000000)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(400000000)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1099511627776)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1125899906842624)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1152921504606846976n)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(9223372036854775807n)])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int((-1024))])]));
    print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.float(1.9)])]));
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
