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
      let g: number[][] = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      rt.frameLine(5);
      let s = 0;
      rt.frameLine(6);
      let i = 0;
      rt.frameLine(7);
      while ((i < 3)) {
        rt.frameLine(8);
        let j = 0;
        rt.frameLine(9);
        while ((j < 3)) {
          rt.frameLine(10);
          s = rt.fast.iAddC(s, rt.fast.rawArrGetNum2(g, i, j));
          rt.frameLine(11);
          j = rt.fast.iAddC(j, 1);
        }
        rt.frameLine(12);
        i = rt.fast.iAddC(i, 1);
      }
      rt.frameLine(13);
      print(rt.showArgs([rt.V.int(s)]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.int(g.length)]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum2(g, 2, 1))]));
      rt.frameLine(16);
      let f: number[][] = [[10, 20], [30, 40]];
      rt.frameLine(17);
      let n = 0;
      rt.frameLine(18);
      let r = 0;
      rt.frameLine(19);
      while ((r < f.length)) {
        rt.frameLine(20);
        n = rt.fast.iAddC(n, rt.fast.iAddC(rt.fast.rawArrGetNum2(f, r, 0), rt.fast.rawArrGetNum2(f, r, 1)));
        rt.frameLine(21);
        r = rt.fast.iAddC(r, 1);
      }
      rt.frameLine(22);
      print(rt.showArgs([rt.V.int(n)]));
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
