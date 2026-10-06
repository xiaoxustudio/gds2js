// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.ops.eq(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])))]));
    print(rt.showArgs([rt.ops.eq(rt.dictOf([[rt.V.str("a"), rt.V.array(rt.GArray.of([rt.V.int(1)]))]]), rt.dictOf([[rt.V.str("a"), rt.V.array(rt.GArray.of([rt.V.int(1)]))]]))]));
    print(rt.showArgs([rt.ops.eq(rt.V.float(1), rt.V.int(1))]));
    print(rt.showArgs([rt.ops.eq(rt.V.int(1), rt.V.float(1))]));
    let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
    let b = a;
    print(rt.showArgs([rt.ops.eq(a, b)]));
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
