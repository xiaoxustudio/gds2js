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
      let p = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(9), rt.V.int(8), rt.V.int(7)]))]);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("r1 "), rt.wrapValue(rt.index(p, rt.V.float(1.5)))]));
      rt.frameLine(6);
      {
        const _nv = rt.writeIdx(p, rt.V.float(1.5), rt.V.int(5));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("r2 "), p]));
      rt.frameLine(8);
      rt.method(p, "set", [rt.V.float(1.5), rt.V.int(6)]);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("r3 "), p]));
      rt.frameLine(10);
      rt.method(p, "insert", [rt.V.float(0.9), rt.V.int(4)]);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("r4 "), p]));
      rt.frameLine(12);
      rt.method(p, "remove_at", [rt.V.float(2.7)]);
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("r5 "), p]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("r6 "), rt.method(p, "find", [rt.V.int(6)]), rt.V.str(" "), rt.method(p, "rfind", [rt.V.int(6)])]));
      rt.frameLine(15);
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
