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
      print(rt.showArgs([rt.V.str("j1|"), rt.method(rt.nativeClass("JSON"), "from_native", [rt.V.int(7)]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "from_native", [rt.V.float(2.5)]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "from_native", [rt.V.str("a")])]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("j2|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.method(rt.nativeClass("JSON"), "from_native", [rt.vector2New([rt.V.int(1), rt.V.int(2)])])]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.method(rt.nativeClass("JSON"), "from_native", [rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)])])])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("j3|"), rt.method(rt.nativeClass("JSON"), "to_native", [rt.V.str("i:7")]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "to_native", [rt.V.str("f:2.5")]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "to_native", [rt.method(rt.nativeClass("JSON"), "from_native", [rt.vector2New([rt.V.int(1), rt.V.int(2)])])])]));
      rt.frameLine(7);
      let j = rt.method(rt.nativeClass("JSON"), "new", []);
      rt.frameLine(8);
      rt.method(j, "parse", [rt.V.str("{\"a\": 1}")]);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("j4|"), rt.method(j, "get_parsed_text", [])]));
      rt.frameLine(10);
      rt.method(j, "parse", [rt.V.str("{\"a\": 1}"), rt.V.bool(true)]);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("j5|"), rt.method(j, "get_parsed_text", []), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.wrapValue(rt.attribute(j, "data"))])]));
      rt.frameLine(12);
      rt.method(j, "set_data", [rt.V.int(5)]);
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("j6|"), rt.method(j, "get_data", []), rt.V.str("|"), rt.wrapValue(rt.attribute(j, "data"))]));
      rt.frameLine(14);
      let rx = rt.method(rt.nativeClass("RegEx"), "create_from_string", [rt.V.str("(?<user>\\w+)@(?<host>\\w+)")]);
      rt.frameLine(15);
      let m = rt.method(rx, "search", [rt.V.str("mail bob@site")]);
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("r1|"), rt.method(m, "get_string", []), rt.V.str("|"), rt.wrapValue(rt.attribute(m, "subject")), rt.V.str("|"), rt.wrapValue(rt.attribute(m, "strings")), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.wrapValue(rt.attribute(m, "names"))])]));
      rt.frameLine(17);
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
