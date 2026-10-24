// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare fs: rt.Variant;
  declare snq: rt.Variant;
  declare vt: rt.Variant;
  declare vs: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.fs = rt.strOf(rt.V.str("%d"));
      rt.frameLine(4);
      this.snq = rt.toStringNameSlot(rt.V.stringName("%q"));
      rt.frameLine(5);
      this.vt = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(6);
      this.vs = rt.strOf(rt.V.str("ab"));
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
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("A "), rt.ops.mod(this.fs, this.vs, true)]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("B "), rt.formatOf(rt.V.str("%d"), this.vt, true)]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("C "), rt.ops.mod(this.snq, rt.V.int(7), true)]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("D "), rt.formatOf(rt.V.str("%q"), this.vs, true)]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("E "), rt.ops.mod(this.fs, rt.V.int(7), true)]));
      rt.frameLine(14);
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
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerFieldTypes(__gd_d_Main, {"fs": "String", "vs": "String"});
rt.registerScriptProps(__gd_d_Main, ["fs","snq","vt","vs"], (o) => { const s = o as Main; return [s.fs, s.snq, s.vt, s.vs]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["fs","snq","vt","vs"], {}, (o) => { const s = o as Main; return [s.fs, s.snq, s.vt, s.vs]; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
