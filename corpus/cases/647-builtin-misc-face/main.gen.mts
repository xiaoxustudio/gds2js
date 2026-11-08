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

  target(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "target");
    try {
      rt.frameLine(4);
      /* pass */
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(7);
      let a = rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("p1|"), rt.ops.inOp(rt.method(a, "pick_random", []), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])))]));
      rt.frameLine(9);
      rt.method(a, "shuffle", []);
      rt.frameLine(10);
      rt.method(a, "sort", []);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("p2|"), a]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("c1|"), rt.method(rt.method(rt.callableCtor([rt.V.object(this), rt.V.str("target")]), "bindv", [rt.V.array(rt.GArray.of([]))]), "is_valid", [])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("c2|"), rt.method(rt.callableStatic("create", [rt.V.object(this), rt.V.str("target")]), "is_valid", [])]));
      rt.frameLine(14);
      let d = rt.dictOf([[rt.V.int(1), rt.V.int(2)]]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("d1|"), rt.ops.eq(rt.method(d, "get_typed_key_script", []), rt.V.nil())]));
      rt.frameLine(16);
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
      case "target": return rt.wrapValue(this.target());
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "target": [0, 0], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
