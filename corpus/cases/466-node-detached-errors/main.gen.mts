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
      let n = rt.method(rt.nativeClass("Node"), "new", []);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("e|q1|"), rt.stringCtor([rt.method(n, "get_path", [])]), rt.V.str("|"), rt.method(rt.method(n, "get_path", []), "is_empty", []), rt.V.str("|"), rt.method(n, "get_tree", [])]));
      rt.frameLine(6);
      let p = rt.method(rt.nativeClass("Node"), "new", []);
      rt.frameLine(7);
      {
        const _nv = rt.writeProp(p, "name", rt.V.str("par"));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("e|q2|"), rt.ops.eq(rt.method(p, "get_path", []), rt.nodePathCtor([rt.V.str("")])), rt.V.str("|"), rt.stringCtor([rt.method(p, "get_path", [])]), rt.V.str("|"), rt.method(p, "has_node", [rt.V.str("x")])]));
      rt.frameLine(9);
      rt.method(n, "free", []);
      rt.frameLine(10);
      rt.method(p, "free", []);
      rt.frameLine(11);
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
