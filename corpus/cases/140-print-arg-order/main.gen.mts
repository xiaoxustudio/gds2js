// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
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
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
