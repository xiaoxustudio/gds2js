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
      let a: number[] = [1, 2, 3, 4, 5];
      rt.frameLine(5);
      let i = 0;
      rt.frameLine(6);
      let n = a.length;
      rt.frameLine(7);
      while ((i < rt.fast.iDivC(n, 2))) {
        rt.frameLine(8);
        let t = rt.fast.rawArrGetNum(a, i);
        rt.frameLine(9);
        rt.fast.rawArrSetNum(a, i, rt.fast.rawArrGetNum(a, rt.fast.iSubC(rt.fast.iSubC(n, 1), i)));
        rt.frameLine(10);
        rt.fast.rawArrSetNum(a, rt.fast.iSubC(rt.fast.iSubC(n, 1), i), t);
        rt.frameLine(11);
        i = rt.fast.iAddC(i, 1);
      }
      rt.frameLine(12);
      print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum(a, 0))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum(a, 4))]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum(a, 2))]));
      rt.frameLine(15);
      let g: number[][] = [[1, 2], [3, 4]];
      rt.frameLine(16);
      let r = 0;
      rt.frameLine(17);
      while ((r < 2)) {
        rt.frameLine(18);
        let c = 0;
        rt.frameLine(19);
        while ((c < 2)) {
          rt.frameLine(20);
          rt.fast.rawArrSetNum2(g, r, c, rt.fast.iAddC(rt.fast.rawArrGetNum2(g, r, c), 100));
          rt.frameLine(21);
          c = rt.fast.iAddC(c, 1);
        }
        rt.frameLine(22);
        r = rt.fast.iAddC(r, 1);
      }
      rt.frameLine(23);
      print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum2(g, 0, 0))]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum2(g, 1, 1))]));
      rt.frameLine(25);
      let s = 0;
      rt.frameLine(26);
      let k = 0;
      rt.frameLine(27);
      while ((k < 2)) {
        rt.frameLine(28);
        s = rt.fast.iAddC(s, rt.fast.iAddC(rt.fast.rawArrGetNum2(g, k, 0), rt.fast.rawArrGetNum2(g, k, 1)));
        rt.frameLine(29);
        k = rt.fast.iAddC(k, 1);
      }
      rt.frameLine(30);
      print(rt.showArgs([rt.V.int(s)]));
      rt.frameLine(31);
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
