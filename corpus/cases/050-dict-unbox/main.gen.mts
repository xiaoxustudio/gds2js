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
      let d = new Map<unknown, number>([]);
      rt.frameLine(5);
      let i = 0;
      rt.frameLine(6);
      let s = 0;
      rt.frameLine(7);
      while ((i < 3)) {
        rt.frameLine(8);
        d.set(i, rt.fast.iMulC(i, 10));
        rt.frameLine(9);
        i = rt.fast.iAddC(i, 1);
      }
      rt.frameLine(10);
      let j = 0;
      rt.frameLine(11);
      while ((j < d.size)) {
        rt.frameLine(12);
        s = rt.fast.iAddC(s, rt.fast.rawDictGet(d, j));
        rt.frameLine(13);
        j = rt.fast.iAddC(j, 1);
      }
      rt.frameLine(14);
      print(rt.showArgs([rt.V.int(s)]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.int(d.size)]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.int(rt.fast.rawDictGet(d, 2))]));
      rt.frameLine(17);
      let e = new Map<unknown, number>([]);
      rt.frameLine(18);
      e.set("a", 1);
      rt.frameLine(19);
      e.set("b", 2);
      rt.frameLine(20);
      print(rt.showArgs([rt.V.int(rt.fast.iAddC(rt.fast.rawDictGet(e, "a"), rt.fast.rawDictGet(e, "b")))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.int(e.size)]));
      rt.frameLine(22);
      let g = rt.dictOf([]);
      rt.frameLine(23);
      {
        const _nv = rt.writeIdx(g, rt.V.float(1), rt.V.int(5));
        if (_nv !== null) g = _nv;
      }
      rt.frameLine(24);
      print(rt.showArgs([rt.wrapValue(rt.index(g, rt.V.float(1)))]));
      rt.frameLine(25);
      let m = rt.dictOf([]);
      rt.frameLine(26);
      {
        const _nv = rt.writeIdx(m, rt.V.int(0), rt.V.int(1));
        if (_nv !== null) m = _nv;
      }
      rt.frameLine(27);
      {
        const _nv = rt.writeIdx(m, rt.V.int(1), rt.V.float(2.5));
        if (_nv !== null) m = _nv;
      }
      rt.frameLine(28);
      print(rt.showArgs([rt.ops.add(rt.wrapValue(rt.index(m, rt.V.int(0))), rt.wrapValue(rt.index(m, rt.V.int(1))))]));
      rt.frameLine(29);
      let h = rt.dictOf([]);
      rt.frameLine(30);
      {
        const _nv = rt.writeIdx(h, rt.V.int(0), rt.V.int(1));
        if (_nv !== null) h = _nv;
      }
      rt.frameLine(31);
      let k = h;
      rt.frameLine(32);
      {
        const _nv = rt.writeIdx(k, rt.V.int(1), rt.V.int(2));
        if (_nv !== null) k = _nv;
      }
      rt.frameLine(33);
      print(rt.showArgs([rt.method(h, "size", [])]));
      rt.frameLine(34);
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
