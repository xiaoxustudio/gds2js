// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  zero = new rt.Signal("zero");
  one = new rt.Signal("one");
  two = new rt.Signal("two");
  frames = rt.V.int(0);

  async _initialize(): Promise<void> {
    print(rt.showArgs([(await rt.awaitValue(this.wait_zero()))]));
    print(rt.showArgs([(await rt.awaitValue(this.wait_one()))]));
    print(rt.showArgs([(await rt.awaitValue(this.wait_two()))]));
  }
  
  async wait_zero(): Promise<unknown> {
    rt.method(rt.callableOf(this.fire_zero.bind(this), "fire_zero", rt.V.object(this)), "call_deferred", []);
    return (await rt.awaitValue(this.zero));
  }
  
  async wait_one(): Promise<unknown> {
    rt.method(rt.callableOf(this.fire_one.bind(this), "fire_one", rt.V.object(this)), "call_deferred", []);
    return (await rt.awaitValue(this.one));
  }
  
  async wait_two(): Promise<unknown> {
    rt.method(rt.callableOf(this.fire_two.bind(this), "fire_two", rt.V.object(this)), "call_deferred", []);
    return (await rt.awaitValue(this.two));
  }
  
  fire_zero(): void {
    rt.method(this.zero, "emit", []);
  }
  
  fire_one(): void {
    rt.method(this.one, "emit", [rt.V.int(7)]);
  }
  
  fire_two(): void {
    rt.method(this.two, "emit", [rt.V.int(1), rt.V.int(2)]);
  }
  
  async _process(_d): Promise<unknown> {
    this.frames = rt.ops.add(this.frames, rt.V.int(1));
    if (rt.ops.truthy(rt.ops.eq(this.frames, rt.V.int(40)))) {
      this.quit();
    }
    return rt.V.bool(false);
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
