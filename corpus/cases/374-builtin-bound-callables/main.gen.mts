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
      let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(5);
      let c = rt.wrapValue(rt.boundMethod(a, "Array", "append", 1, 1));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("T1|"), c]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("T2|"), rt.ops.eq(c, rt.wrapValue(rt.boundMethod(a, "Array", "append", 1, 1)))]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("T3|"), rt.method(c, "is_valid", []), rt.V.str(" "), rt.method(c, "get_method", []), rt.V.str(" "), rt.method(c, "get_object", [])]));
      rt.frameLine(9);
      rt.method(c, "call", [rt.V.int(9)]);
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("T4|"), a]));
      rt.frameLine(11);
      let s = rt.strOf(rt.V.str("abcd"));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("T5|"), rt.wrapValue(rt.boundMethod(s, "String", "to_upper", 0, 0)), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(s, "String", "to_upper", 0, 0)), "call", [])]));
      rt.frameLine(13);
      let p = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]);
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("T6|"), rt.wrapValue(rt.boundMethod(p, "PackedByteArray", "size", 0, 0)), rt.V.str(" "), rt.method(rt.wrapValue(rt.boundMethod(p, "PackedByteArray", "size", 0, 0)), "call", [])]));
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
