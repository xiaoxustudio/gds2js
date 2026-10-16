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
      let cs = rt.V.array(rt.GArray.of([rt.V.int(34), rt.V.int(92), rt.V.int(39), rt.V.int(10), rt.V.int(9), rt.V.int(13), rt.V.int(7), rt.V.int(11), rt.V.int(12), rt.V.int(27), rt.V.int(96), rt.V.int(32), rt.V.int(47), rt.V.int(233), rt.V.int(128512)]));
      rt.frameLine(5);
      for (let c of rt.iter(cs)) {
        rt.frameLine(6);
        let s = rt.ops.add(rt.ops.add(rt.V.str("a"), rt.stringChr(c)), rt.V.str("b"));
        rt.frameLine(7);
        print(rt.showArgs([c, rt.V.str("|"), rt.V.array(rt.GArray.of([s])), rt.V.str("|"), rt.dictOf([[s, rt.V.int(1)]]), rt.V.str("|"), rt.V.str(rt.varToStr(s)), rt.V.str("|"), rt.strBuiltin([s]), rt.V.str("|"), rt.V.array(rt.GArray.of([rt.stringNameCtor([s])])), rt.V.str("|"), rt.V.array(rt.GArray.of([rt.nodePathCtor([s])])), rt.V.str("|"), rt.V.str(rt.varToStr(rt.V.array(rt.GArray.of([s])))), rt.V.str("|"), rt.strBuiltin([rt.V.array(rt.GArray.of([s]))]), rt.V.str("|"), rt.V.array(rt.GArray.of([s, rt.stringNameCtor([s])]))]));
      }
      rt.frameLine(8);
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
