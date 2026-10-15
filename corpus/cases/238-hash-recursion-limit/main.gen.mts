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
      let a = rt.V.array(rt.GArray.of([]));
      rt.frameLine(5);
      for (let i of rt.iter(rt.V.int(10))) {
        rt.frameLine(6);
        a = rt.V.array(rt.GArray.of([a]));
      }
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("d10|"), rt.method(a, "hash", [])]));
      rt.frameLine(8);
      let b = rt.V.array(rt.GArray.of([]));
      rt.frameLine(9);
      for (let i of rt.iter(rt.V.int(100))) {
        rt.frameLine(10);
        b = rt.V.array(rt.GArray.of([b]));
      }
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("d100|"), rt.method(b, "hash", [])]));
      rt.frameLine(12);
      let c = rt.V.array(rt.GArray.of([]));
      rt.frameLine(13);
      for (let i of rt.iter(rt.V.int(101))) {
        rt.frameLine(14);
        c = rt.V.array(rt.GArray.of([c]));
      }
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("d101|"), rt.method(c, "hash", [])]));
      rt.frameLine(16);
      let dd = rt.dictOf([]);
      rt.frameLine(17);
      for (let i of rt.iter(rt.V.int(101))) {
        rt.frameLine(18);
        dd = rt.dictOf([[rt.V.str("k"), dd]]);
      }
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("dict101|"), rt.method(dd, "hash", [])]));
      rt.frameLine(20);
      let e = rt.V.array(rt.GArray.of([]));
      rt.frameLine(21);
      for (let i of rt.iter(rt.V.int(120))) {
        rt.frameLine(22);
        e = rt.V.array(rt.GArray.of([e]));
      }
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("d120|"), rt.method(e, "hash", [])]));
      rt.frameLine(24);
      let f = rt.V.array(rt.GArray.of([]));
      rt.frameLine(25);
      for (let i of rt.iter(rt.V.int(300))) {
        rt.frameLine(26);
        f = rt.V.array(rt.GArray.of([rt.dictOf([[rt.V.str("k"), rt.V.array(rt.GArray.of([f]))]])]));
      }
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("d300mix|"), rt.method(f, "hash", [])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("flat|"), rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), "hash", [])]));
      rt.frameLine(29);
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
