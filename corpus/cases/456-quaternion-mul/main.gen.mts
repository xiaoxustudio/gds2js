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
      let i = rt.quaternionNew([]);
      rt.frameLine(5);
      let a = rt.quaternionNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.9)]);
      rt.frameLine(6);
      let b = rt.quaternionNew([rt.V.int(0), rt.V.float(0.7071068), rt.V.int(0), rt.V.float(0.7071068)]);
      rt.frameLine(7);
      let u = rt.quaternionNew([rt.V.int(0), rt.V.int(1), rt.V.int(0), rt.V.int(0)]);
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("w01|"), rt.strBuiltin([rt.ops.mul(a, b)]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(b, a)])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("w02|"), rt.strBuiltin([rt.ops.mul(i, a)]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(a, i)]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(b, b)])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("w03|"), rt.strBuiltin([rt.ops.mul(u, u)]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(a, u)]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(u, a)])]));
      rt.frameLine(11);
      let va = a;
      rt.frameLine(12);
      let vb = b;
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("w04|"), rt.strBuiltin([rt.ops.mul(va, vb)]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(vb, va)]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(rt.ops.mul(a, b), rt.ops.mul(b, a))])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("w05|"), rt.strBuiltin([rt.ops.mul(rt.ops.mul(a, b), i)]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(b, rt.quaternionNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.9)]))])]));
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
