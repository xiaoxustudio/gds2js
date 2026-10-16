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
      let p = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("b")]))]);
      rt.frameLine(5);
      let c = rt.wrapValue(rt.attribute(p, "size"));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("B1|"), c]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("B2|"), rt.method(c, "call", [])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("B3|"), rt.method(c, "get_method", []), rt.V.str(" "), rt.method(c, "get_object", []), rt.V.str(" "), rt.method(c, "get_argument_count", []), rt.V.str(" "), rt.method(c, "is_valid", [])]));
      rt.frameLine(9);
      let q = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]);
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("B4|"), rt.wrapValue(rt.attribute(q, "count")), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(q, "count")), "call", [rt.V.int(2)])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("B5|"), rt.wrapValue(rt.attribute(p, "append")), rt.V.str(" "), rt.ops.eq(rt.wrapValue(rt.attribute(p, "append")), rt.wrapValue(rt.boundMethod(rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a")]))]), "PackedStringArray", "append", 1, 1)))]));
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
