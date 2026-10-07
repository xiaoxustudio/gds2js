// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let s = "a";
    let i = 0;
    while ((i < 3)) {
      s = (s + "b");
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.showArgs([rt.V.str(s)]));
    let empty = "";
    print(rt.showArgs([rt.ops.eq(rt.V.str(empty), rt.V.str(""))]));
    if (s !== "") {
      print(rt.showArgs([rt.V.str("truthy")]));
    }
    if (empty !== "") {
      print(rt.showArgs([rt.V.str("nope")]));
    } else {
      print(rt.showArgs([rt.V.str("empty-false")]));
    }
    print(rt.showArgs([rt.V.str((s + "!"))]));
    print(rt.showArgs([rt.ops.add(rt.strBuiltin([rt.V.int(1)]), rt.V.str("x"))]));
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
