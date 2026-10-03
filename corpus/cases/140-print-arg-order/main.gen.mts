// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
    print(rt.showArgs([rt.V.str("o1 "), a, rt.method(a, "pop_back", []), a]));
    let d = rt.dictOf([[rt.V.str("k"), rt.V.int(1)], [rt.V.str("j"), rt.V.int(2)]]);
    print(rt.showArgs([rt.V.str("o2 "), d, rt.method(d, "erase", [rt.V.str("k")]), d, rt.method(d, "size", [])]));
    let r = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(7)]))]);
    print(rt.showArgs([rt.V.str("o3 "), r, rt.method(r, "append", [rt.V.int(9)]), r]));
    let s = "ab";
    print(rt.showArgs([rt.V.str("o4 "), rt.V.str(s), rt.V.str((s + "c")), rt.V.str(s)]));
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
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
