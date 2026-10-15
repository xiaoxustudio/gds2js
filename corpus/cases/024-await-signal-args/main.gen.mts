// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare zero: rt.Signal;
  declare one: rt.Signal;
  declare two: rt.Signal;
  declare frames: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.zero = new rt.Signal("zero");
      rt.frameLine(4);
      this.one = new rt.Signal("one");
      rt.frameLine(5);
      this.two = new rt.Signal("two");
      rt.frameLine(2);
      this.frames = rt.V.int(0);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(8);
      print(rt.showArgs([(await rt.awaitValue(this.wait_zero()))]));
      rt.frameLine(9);
      print(rt.showArgs([(await rt.awaitValue(this.wait_one()))]));
      rt.frameLine(10);
      print(rt.showArgs([(await rt.awaitValue(this.wait_two()))]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  async wait_zero(): Promise<unknown> {
    const __gd_frame = rt.frameEnter("res://main.gd", "wait_zero");
    try {
      rt.frameLine(13);
      rt.method(rt.methodCallable(rt.V.object(this), "fire_zero"), "call_deferred", []);
      rt.frameLine(14);
      return (await rt.awaitValue(rt.wrapValue(this.zero)));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  async wait_one(): Promise<unknown> {
    const __gd_frame = rt.frameEnter("res://main.gd", "wait_one");
    try {
      rt.frameLine(17);
      rt.method(rt.methodCallable(rt.V.object(this), "fire_one"), "call_deferred", []);
      rt.frameLine(18);
      return (await rt.awaitValue(rt.wrapValue(this.one)));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  async wait_two(): Promise<unknown> {
    const __gd_frame = rt.frameEnter("res://main.gd", "wait_two");
    try {
      rt.frameLine(21);
      rt.method(rt.methodCallable(rt.V.object(this), "fire_two"), "call_deferred", []);
      rt.frameLine(22);
      return (await rt.awaitValue(rt.wrapValue(this.two)));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  fire_zero(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "fire_zero");
    try {
      rt.frameLine(24);
      rt.method(rt.wrapValue(this.zero), "emit", []);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  fire_one(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "fire_one");
    try {
      rt.frameLine(25);
      rt.method(rt.wrapValue(this.one), "emit", [rt.V.int(7)]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  fire_two(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "fire_two");
    try {
      rt.frameLine(26);
      rt.method(rt.wrapValue(this.two), "emit", [rt.V.int(1), rt.V.int(2)]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _process(_d: number): Promise<unknown> { return this.__gd__process(rt.V.float(_d)); }
  async __gd__process(_d: rt.Variant): Promise<unknown> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_process");
    try {
      rt.frameLine(29);
      this.frames = rt.ops.add(this.frames, rt.V.int(1));
      rt.frameLine(30);
      if (rt.ops.truthy(rt.ops.eq(this.frames, rt.V.int(40)))) {
        rt.frameLine(31);
        this.quit();
      }
      rt.frameLine(32);
      return rt.V.bool(false);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.bool(false);
    } finally {
      rt.frameExit(__gd_frame);
    }
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
rt.registerScriptProps(__gd_d_Main, ["frames"], (o) => { const s = o as Main; return [s.frames]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["frames"], {}, (o) => { const s = o as Main; return [s.frames]; });
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
