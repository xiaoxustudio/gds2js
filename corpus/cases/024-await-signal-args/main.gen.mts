// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  zero = new rt.Signal("zero");
  one = new rt.Signal("one");
  two = new rt.Signal("two");
  frames = rt.V.int(0);

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([(await rt.awaitValue(this.wait_zero()))]));
    print(rt.showArgs([(await rt.awaitValue(this.wait_one()))]));
    print(rt.showArgs([(await rt.awaitValue(this.wait_two()))]));
  }
  
  async wait_zero(): Promise<unknown> {
    rt.method(rt.methodCallable(rt.V.object(this), "fire_zero"), "call_deferred", []);
    return (await rt.awaitValue(rt.wrapValue(this.zero)));
  }
  
  async wait_one(): Promise<unknown> {
    rt.method(rt.methodCallable(rt.V.object(this), "fire_one"), "call_deferred", []);
    return (await rt.awaitValue(rt.wrapValue(this.one)));
  }
  
  async wait_two(): Promise<unknown> {
    rt.method(rt.methodCallable(rt.V.object(this), "fire_two"), "call_deferred", []);
    return (await rt.awaitValue(rt.wrapValue(this.two)));
  }
  
  fire_zero(): void {
    rt.method(rt.wrapValue(this.zero), "emit", []);
  }
  
  fire_one(): void {
    rt.method(rt.wrapValue(this.one), "emit", [rt.V.int(7)]);
  }
  
  fire_two(): void {
    rt.method(rt.wrapValue(this.two), "emit", [rt.V.int(1), rt.V.int(2)]);
  }
  
    override _process(_d: number): Promise<unknown> { return this.__gd__process(rt.V.float(_d)); }
  async __gd__process(_d: rt.Variant): Promise<unknown> {
    this.frames = rt.ops.add(this.frames, rt.V.int(1));
    if (rt.ops.truthy(rt.ops.eq(this.frames, rt.V.int(40)))) {
      this.quit();
    }
    return rt.V.bool(false);
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      case "wait_zero": return rt.wrapValue(this.wait_zero());
      case "wait_one": return rt.wrapValue(this.wait_one());
      case "wait_two": return rt.wrapValue(this.wait_two());
      case "fire_zero": return rt.wrapValue(this.fire_zero());
      case "fire_one": return rt.wrapValue(this.fire_one());
      case "fire_two": return rt.wrapValue(this.fire_two());
      case "_process": return rt.wrapValue(this.__gd__process(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["frames"]);
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0], "wait_zero": [0, 0], "wait_one": [0, 0], "wait_two": [0, 0], "fire_zero": [0, 0], "fire_one": [0, 0], "fire_two": [0, 0], "_process": [1, 1] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
