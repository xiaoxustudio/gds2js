// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare A: rt.Variant;
  declare B: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      this.A = rt.V.nil();
      this.B = rt.V.nil();
      rt.frameLine(7);
      this.A = rt.ops.add(this.probe(rt.V.str("A")), this.B);
      rt.frameLine(8);
      this.B = this.probe(rt.V.str("B"));
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

  probe(s: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "probe");
    try {
      rt.frameLine(4);
      print(rt.showArgs([s]));
      rt.frameLine(5);
      return rt.V.int(1);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(11);
      print(rt.showArgs([this.A, this.B]));
      rt.frameLine(12);
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
      case "probe": return rt.wrapValue(this.probe(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["A","B"], (o) => { const s = o as Main; return [s.A, s.B]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["A","B"], {}, (o) => { const s = o as Main; return [s.A, s.B]; });
rt.registerMethodArities(__gd_d_Main, { "probe": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
