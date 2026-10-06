// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.float(100000000000000)]));
    print(rt.showArgs([rt.V.float(1000000000000000)]));
    print(rt.showArgs([rt.V.float(10000000000000000)]));
    print(rt.showArgs([rt.V.float(100000000000000000000)]));
    print(rt.showArgs([rt.V.float(1e+21)]));
    print(rt.showArgs([rt.V.float(1e+300)]));
    print(rt.showArgs([rt.V.float(0.000001)]));
    print(rt.showArgs([rt.V.float(1e-7)]));
    print(rt.showArgs([rt.V.float(1e-20)]));
    print(rt.showArgs([rt.V.float((0.1 + 0.2))]));
    print(rt.showArgs([rt.V.float(123456789012345.6)]));
    print(rt.showArgs([rt.V.float(1)]));
    print(rt.showArgs([rt.V.float(2.5)]));
    print(rt.showArgs([rt.V.float((-0))]));
    print(rt.showArgs([rt.V.float((-3.14159))]));
    print(rt.showArgs([rt.V.float((1e+308 * 10))]));
    print(rt.showArgs([rt.strBuiltin([rt.V.float(100000000000000000000)])]));
    print(rt.showArgs([rt.V.array(rt.GArray.of([rt.V.float(100000000000000000000), rt.V.float(0.5)]))]));
    print(rt.showArgs([rt.V.float(1234567890123.45)]));
    print(rt.showArgs([rt.V.float(0.5)]));
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
