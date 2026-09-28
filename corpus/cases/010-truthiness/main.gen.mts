// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.V.bool(!rt.ops.truthy(rt.V.bool(!rt.ops.truthy(rt.V.array(rt.GArray.of([]))))))));
    print(rt.show(rt.V.bool(!rt.ops.truthy(rt.V.bool(!rt.ops.truthy(rt.dictOf([])))))));
    print(rt.show(rt.V.bool(!rt.ops.truthy(rt.V.bool(!rt.ops.truthy(rt.V.int(0)))))));
    print(rt.show(rt.V.bool(!rt.ops.truthy(rt.V.bool(!rt.ops.truthy(rt.V.float(0)))))));
    print(rt.show(rt.V.bool(!rt.ops.truthy(rt.V.bool(!rt.ops.truthy(rt.V.str("")))))));
    print(rt.show(rt.V.bool(!rt.ops.truthy(rt.V.bool(!rt.ops.truthy(rt.V.array(rt.GArray.of([rt.V.int(0)]))))))));
    print(rt.show(rt.V.bool(!rt.ops.truthy(rt.V.bool(!rt.ops.truthy(rt.V.str("0")))))));
    if (rt.ops.truthy(rt.V.array(rt.GArray.of([])))) {
      print(rt.show(rt.V.str("empty-array-true")));
    } else {
      print(rt.show(rt.V.str("empty-array-false")));
    }
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
