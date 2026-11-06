// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "gds2js/runtime";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "gds2js/host";

export class Main extends SceneTree {
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("Main.gd", "@implicit_new");
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
    const __gd_frame = rt.frameEnter("Main.gd", "_initialize");
    try {
      rt.frameLine(3);
      let a = rt.aabbNew([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(4), rt.V.int(5), rt.V.int(6)])]);
      rt.frameLine(4);
      print(rt.showArgs([rt.V.str("axis|"), rt.method(a, "get_longest_axis_index", []), rt.V.str("|"), rt.method(a, "get_longest_axis_size", []), rt.V.str("|"), rt.method(a, "get_longest_axis", []), rt.V.str("|"), rt.method(a, "get_shortest_axis_index", []), rt.V.str("|"), rt.method(a, "get_shortest_axis_size", []), rt.V.str("|"), rt.method(a, "get_shortest_axis", [])]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("support|"), rt.method(a, "get_support", [rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)])]), rt.V.str("|"), rt.method(a, "get_support", [rt.vector3New([rt.V.int((-1)), rt.V.int(1), rt.V.int((-1))])])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("surface|"), rt.method(a, "has_surface", []), rt.V.str("|"), rt.method(rt.aabbNew([rt.vector3New([]), rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(1)])]), "has_surface", [])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("abs|"), rt.method(rt.aabbNew([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int((-1)), rt.V.int((-2)), rt.V.int((-3))])]), "abs", [])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("grow|"), rt.method(a, "grow", [rt.V.int(2)])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("encl|"), rt.method(a, "encloses", [rt.aabbNew([rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)])])]), rt.V.str("|"), rt.method(a, "encloses", [rt.aabbNew([rt.vector3New([rt.V.int(0), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)])])])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("inter|"), rt.method(a, "intersection", [rt.aabbNew([rt.vector3New([rt.V.int(3), rt.V.int(4), rt.V.int(5)]), rt.vector3New([rt.V.int(3), rt.V.int(4), rt.V.int(5)])])])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("endpoint|"), rt.method(a, "get_endpoint", [rt.V.int(0)]), rt.V.str("|"), rt.method(a, "get_endpoint", [rt.V.int(3)]), rt.V.str("|"), rt.method(a, "get_endpoint", [rt.V.int(7)])]));
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
rt.registerDictIdentity(__gd_d_Main, null, "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "Main.gd");
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
