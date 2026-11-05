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
      let a = rt.method(rt.nativeClass("RegEx"), "new", []);
      rt.frameLine(5);
      rt.method(a, "compile", [rt.V.str("^\\d+$")]);
      rt.frameLine(6);
      let ma = rt.method(a, "search", [rt.V.str("12\n")]);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("a|"), rt.ops.neq(ma, rt.V.nil())]));
      rt.frameLine(8);
      if (rt.ops.truthy(rt.ops.neq(ma, rt.V.nil()))) {
        rt.frameLine(9);
        print(rt.showArgs([rt.V.str("a2|"), rt.method(ma, "get_start", []), rt.V.str("|"), rt.method(ma, "get_end", []), rt.V.str("|"), rt.method(ma, "get_string", [])]));
      }
      rt.frameLine(10);
      let mb = rt.method(a, "search", [rt.V.str("12\n34")]);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("b|"), rt.ops.neq(mb, rt.V.nil())]));
      rt.frameLine(12);
      let w = rt.method(rt.nativeClass("RegEx"), "new", []);
      rt.frameLine(13);
      rt.method(w, "compile", [rt.V.str("\\w+")]);
      rt.frameLine(14);
      let mw = rt.method(w, "search", [rt.V.str("héllo")]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("c|"), rt.ops.neq(mw, rt.V.nil()), rt.V.str("|"), rt.method(mw, "get_string", []), rt.V.str("|"), rt.method(mw, "get_start", []), rt.V.str("|"), rt.method(mw, "get_end", [])]));
      rt.frameLine(16);
      let dg = rt.method(rt.nativeClass("RegEx"), "new", []);
      rt.frameLine(17);
      rt.method(dg, "compile", [rt.V.str("\\d+")]);
      rt.frameLine(18);
      let md = rt.method(dg, "search", [rt.V.str("a٣b")]);
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("d|"), rt.ops.neq(md, rt.V.nil())]));
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
