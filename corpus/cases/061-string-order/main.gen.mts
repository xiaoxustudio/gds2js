// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = "😀";
    let b = "￿";
    print(rt.showArgs([rt.method(rt.V.str(a), "length", [])]));
    print(rt.showArgs([rt.method(rt.V.str(b), "length", [])]));
    print(rt.showArgs([rt.ops.lt(rt.V.str(a), rt.V.str(b))]));
    print(rt.showArgs([rt.ops.lt(rt.V.str(b), rt.V.str(a))]));
    print(rt.showArgs([rt.ops.gt(rt.V.str(a), rt.V.str(b))]));
    print(rt.showArgs([rt.ops.lt(rt.V.str("z"), rt.V.str(a))]));
    print(rt.showArgs([rt.ops.lt(rt.V.str("z"), rt.V.str(b))]));
    let arr = rt.V.array(rt.GArray.of([rt.V.str(a), rt.V.str(b), rt.V.str("z"), rt.V.str("apple")]));
    rt.method(arr, "sort", []);
    print(rt.showArgs([rt.wrapValue(rt.index(arr, rt.V.int(0)))]));
    print(rt.showArgs([rt.wrapValue(rt.index(arr, rt.V.int(1)))]));
    print(rt.showArgs([rt.wrapValue(rt.index(arr, rt.V.int(2)))]));
    print(rt.showArgs([rt.wrapValue(rt.index(arr, rt.V.int(3)))]));
    print(rt.showArgs([rt.ops.eq(rt.V.str(a), rt.V.str(b))]));
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
