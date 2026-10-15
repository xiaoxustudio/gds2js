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
      let a: number[] = [];
      rt.frameLine(5);
      let i = 0;
      rt.frameLine(6);
      let s = 0;
      rt.frameLine(7);
      while ((i < 3)) {
        rt.frameLine(8);
        a.push(i);
        rt.frameLine(9);
        s = rt.fast.iAddC(s, rt.fast.rawArrGetNum(a, i));
        rt.frameLine(10);
        i = rt.fast.iAddC(i, 1);
      }
      rt.frameLine(11);
      print(rt.showArgs([rt.V.int(s)]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum(a, 1))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.int(a.length)]));
      rt.frameLine(14);
      let b: number[] = [1.5];
      rt.frameLine(15);
      let j = 0;
      rt.frameLine(16);
      let s2 = 0;
      rt.frameLine(17);
      b.push(2);
      rt.frameLine(18);
      b.push(2.5);
      rt.frameLine(19);
      while ((j < b.length)) {
        rt.frameLine(20);
        s2 = (s2 + rt.fast.rawArrGetNum(b, j));
        rt.frameLine(21);
        j = rt.fast.iAddC(j, 1);
      }
      rt.frameLine(22);
      print(rt.showArgs([rt.V.float(s2)]));
      rt.frameLine(23);
      let e = rt.V.array(rt.GArray.of([]));
      rt.frameLine(24);
      rt.method(e, "append", [rt.V.int(7)]);
      rt.frameLine(25);
      let f = e;
      rt.frameLine(26);
      rt.method(f, "append", [rt.V.int(8)]);
      rt.frameLine(27);
      print(rt.showArgs([e]));
      rt.frameLine(28);
      print(rt.showArgs([rt.method(e, "size", [])]));
      rt.frameLine(29);
      let w: number[] = [1, 2];
      rt.frameLine(30);
      rt.fast.rawArrSetNum(w, 0, 5);
      rt.frameLine(31);
      print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum(w, 0))]));
      rt.frameLine(32);
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
