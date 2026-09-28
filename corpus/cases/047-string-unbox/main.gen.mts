// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
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
    print(rt.showArgs([rt.ops.add(rt.strOf(rt.V.int(1)), rt.V.str("x"))]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
