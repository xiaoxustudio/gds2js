// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare frames: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
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
      rt.frameLine(5);
      print(rt.showArgs([(await rt.awaitValue(this.f()))]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  async f(): Promise<unknown> {
    const __gd_frame = rt.frameEnter("res://main.gd", "f");
    try {
      rt.frameLine(8);
      (await rt.awaitValue(rt.wrapValue(rt.attribute(this.create_timer(rt.V.float(0.02)), "timeout"))));
      rt.frameLine(9);
      return rt.V.int(42);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _process(_d: number): Promise<unknown> { return this.__gd__process(rt.V.float(_d)); }
  async __gd__process(_d: rt.Variant): Promise<unknown> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_process");
    try {
      rt.frameLine(12);
      this.frames = rt.ops.add(this.frames, rt.V.int(1));
      rt.frameLine(13);
      if (rt.ops.truthy(rt.ops.eq(this.frames, rt.V.int(30)))) {
        rt.frameLine(14);
        this.quit();
      }
      rt.frameLine(15);
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
      case "f": return rt.wrapValue(this.f());
      case "_process": return rt.wrapValue(this.__gd__process(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["frames"], (o) => { const s = o as Main; return [s.frames]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["frames"], {}, (o) => { const s = o as Main; return [s.frames]; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0], "f": [0, 0], "_process": [1, 1] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
