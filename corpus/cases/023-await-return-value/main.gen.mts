// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  frames = rt.V.int(0);

  async _initialize(): Promise<void> {
    print(rt.showArgs([(await rt.awaitValue(this.f()))]));
  }
  
  async f(): Promise<unknown> {
    (await rt.awaitValue(rt.attribute(this.create_timer(rt.V.float(0.02)), "timeout")));
    return rt.V.int(42);
  }
  
  async _process(_d): Promise<unknown> {
    this.frames = rt.ops.add(this.frames, rt.V.int(1));
    if (rt.ops.truthy(rt.ops.eq(this.frames, rt.V.int(30)))) {
      this.quit();
    }
    return rt.V.bool(false);
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0], "f": [0, 0], "_process": [1, 1] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
