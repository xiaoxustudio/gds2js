// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.ops.shl(rt.V.int(1), rt.V.int(62))]));
    print(rt.showArgs([rt.ops.band(rt.V.int(255), rt.V.int(15))]));
    print(rt.showArgs([rt.ops.bnot(rt.V.int(5))]));
    print(rt.showArgs([rt.ops.shr(rt.V.int(8), rt.V.int(1))]));
    print(rt.showArgs([rt.ops.bor(rt.V.int(6), rt.V.int(9))]));
    print(rt.showArgs([rt.ops.bxor(rt.V.int(6), rt.V.int(9))]));
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
