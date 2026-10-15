// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
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
      rt.frameLine(4);
      let s = "a";
      rt.frameLine(5);
      let i = 0;
      rt.frameLine(6);
      while ((i < 3)) {
        rt.frameLine(7);
        s = (s + "b");
        rt.frameLine(8);
        i = rt.fast.iAddC(i, 1);
      }
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str(s)]));
      rt.frameLine(10);
      let empty = "";
      rt.frameLine(11);
      print(rt.showArgs([rt.ops.eq(rt.V.str(empty), rt.V.str(""))]));
      rt.frameLine(12);
      if (s !== "") {
        rt.frameLine(13);
        print(rt.showArgs([rt.V.str("truthy")]));
      }
      rt.frameLine(14);
      if (empty !== "") {
        rt.frameLine(15);
        print(rt.showArgs([rt.V.str("nope")]));
      } else {
        rt.frameLine(17);
        print(rt.showArgs([rt.V.str("empty-false")]));
      }
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str((s + "!"))]));
      rt.frameLine(19);
      print(rt.showArgs([rt.ops.add(rt.strBuiltin([rt.V.int(1)]), rt.V.str("x"))]));
      rt.frameLine(20);
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
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
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
