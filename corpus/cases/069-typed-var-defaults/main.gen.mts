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
      let i = rt.toInt(rt.V.int(0));
      rt.frameLine(5);
      let f = rt.toFloat(rt.V.float(0));
      rt.frameLine(6);
      let s = rt.strOf(rt.V.str(""));
      rt.frameLine(7);
      let b = rt.toBool(rt.V.bool(false));
      rt.frameLine(8);
      let arr = rt.V.array(rt.GArray.of([]));
      rt.frameLine(9);
      let dic = rt.dictOf([]);
      rt.frameLine(10);
      let v2 = rt.toVec2(rt.vector2(0, 0));
      rt.frameLine(11);
      let nod = rt.V.nil();
      rt.frameLine(12);
      print(rt.showArgs([i]));
      rt.frameLine(13);
      print(rt.showArgs([f]));
      rt.frameLine(14);
      print(rt.showArgs([b]));
      rt.frameLine(15);
      print(rt.showArgs([s]));
      rt.frameLine(16);
      print(rt.showArgs([arr]));
      rt.frameLine(17);
      print(rt.showArgs([dic]));
      rt.frameLine(18);
      print(rt.showArgs([v2]));
      rt.frameLine(19);
      print(rt.showArgs([nod]));
      rt.frameLine(20);
      print(rt.showArgs([rt.lengthOf(s)]));
      rt.frameLine(21);
      print(rt.showArgs([rt.ops.eq(arr, rt.V.array(rt.GArray.of([])))]));
      rt.frameLine(22);
      print(rt.showArgs([rt.typeOf(f)]));
      rt.frameLine(23);
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
