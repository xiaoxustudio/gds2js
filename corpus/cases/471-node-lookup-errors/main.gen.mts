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
      let p = rt.method(rt.nativeClass("Node"), "new", []);
      rt.frameLine(5);
      {
        const _nv = rt.writeProp(p, "name", rt.V.str("P"));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(6);
      let c = rt.method(rt.nativeClass("Node"), "new", []);
      rt.frameLine(7);
      {
        const _nv = rt.writeProp(c, "name", rt.V.str("C"));
        if (_nv !== null) c = _nv;
      }
      rt.frameLine(8);
      rt.method(p, "add_child", [c]);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("x|a1|"), rt.method(p, "get_child_count", [])]));
      rt.frameLine(10);
      let oob = rt.method(p, "get_child", [rt.V.int(5)]);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("x|a2|"), rt.ops.eq(oob, rt.V.nil())]));
      rt.frameLine(12);
      let miss = rt.method(p, "get_node_or_null", [rt.V.str("Nope")]);
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("x|a3|"), rt.ops.eq(miss, rt.V.nil())]));
      rt.frameLine(14);
      let miss2 = rt.method(p, "get_node", [rt.V.str("Nope")]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("x|a4|"), rt.ops.eq(miss2, rt.V.nil())]));
      rt.frameLine(16);
      rt.method(p, "move_child", [c, rt.V.int(3)]);
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("x|a5|"), rt.method(p, "get_child_count", []), rt.V.str("|"), rt.method(c, "get_index", []), rt.V.str("|"), rt.strBuiltin([rt.method(p, "get_children", [])])]));
      rt.frameLine(18);
      rt.method(c, "free", []);
      rt.frameLine(19);
      rt.method(p, "free", []);
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
