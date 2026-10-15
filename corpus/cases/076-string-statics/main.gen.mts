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
      print(rt.showArgs([rt.stringStatic("chr", [rt.V.int(65)])]));
      rt.frameLine(5);
      print(rt.showArgs([rt.method(rt.stringStatic("chr", [rt.V.int(97)]), "length", [])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.stringStatic("chr", [rt.V.int(128512)])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.method(rt.stringStatic("chr", [rt.V.int(1114111)]), "length", [])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.ops.eq(rt.stringStatic("chr", [rt.V.float(2.7)]), rt.stringStatic("chr", [rt.V.int(2)]))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.ops.eq(rt.stringStatic("chr", [rt.V.bool(true)]), rt.stringStatic("chr", [rt.V.int(1)]))]));
      rt.frameLine(10);
      print(rt.showArgs([rt.stringStatic("num", [rt.V.int(42)])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.stringStatic("num", [rt.V.float(1.5)])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.stringStatic("num", [rt.V.float(100000000000000000000)])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.stringStatic("num", [rt.V.float((0.1 + 0.2))])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.stringStatic("num", [rt.V.float(1e-7)])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.stringStatic("num", [rt.V.float(123456789012345.6)])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.stringStatic("num", [rt.V.float((1 / 0))])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.stringStatic("num", [rt.V.float((0 / 0))])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.stringStatic("num", [rt.V.float((-1.5))])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.stringStatic("num_int64", [rt.V.int(9007199254740993n)])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.stringStatic("num_int64", [rt.V.float(1.7)])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.stringStatic("num_int64", [rt.V.int((-5))])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.stringCtor([rt.V.str("x")])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.method(rt.stringCtor([rt.V.str(("x" + "y"))]), "length", [])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.strBuiltin([rt.V.int(42)]), rt.V.str("|")), rt.stringStatic("num", [rt.V.int(42)]))]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.float((-0))]));
      rt.frameLine(26);
      print(rt.showArgs([rt.stringStatic("num", [rt.V.float((-0))])]));
      rt.frameLine(27);
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
