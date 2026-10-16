// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const CONNECT_ONE_SHOT = rt.V.int(4);
const CONNECT_REFERENCE_COUNTED = rt.V.int(8);

export class Main extends SceneTree {
  declare fired: rt.Signal;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.fired = new rt.Signal("fired");
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

  on_fired(v: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "on_fired");
    try {
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("got "), v]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  on_other(v: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "on_other");
    try {
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("other "), v]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(12);
      let s = rt.wrapValue(this.fired);
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("r1 "), rt.method(s, "connect", [rt.methodCallable(rt.V.object(this), "on_fired")])]));
      rt.frameLine(14);
      rt.method(s, "emit", [rt.V.int(1)]);
      rt.frameLine(15);
      rt.method(s, "disconnect", [rt.methodCallable(rt.V.object(this), "on_fired")]);
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("r2 "), rt.method(s, "connect", [rt.methodCallable(rt.V.object(this), "on_fired")])]));
      rt.frameLine(17);
      rt.method(s, "disconnect", [rt.methodCallable(rt.V.object(this), "on_fired")]);
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("r3 "), rt.typeOf(rt.method(s, "connect", [rt.methodCallable(rt.V.object(this), "on_fired"), CONNECT_ONE_SHOT]))]));
      rt.frameLine(19);
      rt.method(s, "emit", [rt.V.int(2)]);
      rt.frameLine(20);
      rt.method(s, "emit", [rt.V.int(3)]);
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("r4 "), rt.method(s, "connect", [rt.methodCallable(rt.V.object(this), "on_other"), CONNECT_REFERENCE_COUNTED])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("r5 "), rt.method(s, "connect", [rt.methodCallable(rt.V.object(this), "on_other"), CONNECT_REFERENCE_COUNTED])]));
      rt.frameLine(23);
      rt.method(s, "emit", [rt.V.int(4)]);
      rt.frameLine(24);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "on_fired": return rt.wrapValue(this.on_fired(args[0] as rt.Variant));
      case "on_other": return rt.wrapValue(this.on_other(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "on_fired": [1, 1], "on_other": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
