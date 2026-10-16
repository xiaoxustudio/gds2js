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
      let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
      rt.frameLine(5);
      print(rt.showArgs([rt.wrapValue(rt.index(a, rt.V.int((-1))))]));
      rt.frameLine(6);
      print(rt.showArgs([rt.wrapValue(rt.index(a, rt.V.int((-3))))]));
      rt.frameLine(7);
      {
        const _nv = rt.writeIdx(a, rt.V.int((-1)), rt.V.int(9));
        if (_nv !== null) a = _nv;
      }
      rt.frameLine(8);
      print(rt.showArgs([a]));
      rt.frameLine(9);
      {
        const _nv = rt.writeIdx(a, rt.V.int((-2)), rt.V.int(8));
        if (_nv !== null) a = _nv;
      }
      rt.frameLine(10);
      print(rt.showArgs([a]));
      rt.frameLine(11);
      {
        const _nv = rt.writeIdx(a, rt.V.int(0), rt.V.int(5));
        if (_nv !== null) a = _nv;
      }
      rt.frameLine(12);
      print(rt.showArgs([a]));
      rt.frameLine(13);
      let b = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(4)]))]));
      rt.frameLine(14);
      print(rt.showArgs([rt.wrapValue(rt.index(rt.wrapValue(rt.index(b, rt.V.int((-1)))), rt.V.int((-1))))]));
      rt.frameLine(15);
      {
      const _w0 = rt.V.int((-1));
        const _nv = rt.writeIdx(rt.index(b, _w0), rt.V.int(0), rt.V.int(7));
        if (_nv !== null) rt.setIndex(b, _w0, _nv);
      }
      rt.frameLine(16);
      print(rt.showArgs([b]));
      rt.frameLine(17);
      {
      const _w0 = rt.V.int(0);
        const _nv = rt.writeIdx(rt.index(b, _w0), rt.V.int(1), rt.V.int(6));
        if (_nv !== null) rt.setIndex(b, _w0, _nv);
      }
      rt.frameLine(18);
      print(rt.showArgs([b]));
      rt.frameLine(19);
      print(rt.showArgs([rt.method(a, "size", [])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.method(b, "size", [])]));
      rt.frameLine(21);
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
