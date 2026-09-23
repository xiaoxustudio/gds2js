// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  frames = rt.V.int(0);

  async _initialize(): Promise<void> {
    print(rt.show((await this.wait_zero())));
    print(rt.show((await this.wait_one())));
    print(rt.show((await this.wait_two())));
  }
  
  async wait_zero(): Promise<unknown> {
    rt.method(fire_zero, "call_deferred", []);
    return (await zero);
  }
  
  async wait_one(): Promise<unknown> {
    rt.method(fire_one, "call_deferred", []);
    return (await one);
  }
  
  async wait_two(): Promise<unknown> {
    rt.method(fire_two, "call_deferred", []);
    return (await two);
  }
  
  fire_zero(): void {
    rt.method(zero, "emit", []);
  }
  
  fire_one(): void {
    rt.method(one, "emit", [rt.V.int(7)]);
  }
  
  fire_two(): void {
    rt.method(two, "emit", [rt.V.int(1), rt.V.int(2)]);
  }
  
  async _process(_d): Promise<unknown> {
    frames = rt.ops.add(frames, rt.V.int(1));
    if (rt.ops.truthy(rt.ops.eq(frames, rt.V.int(40)))) {
      this.quit();
    }
    return rt.V.bool(false);
  }
  
}

await new Main().run();
