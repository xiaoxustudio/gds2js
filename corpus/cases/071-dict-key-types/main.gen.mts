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
      let d = rt.dictOf([[rt.V.int(1), rt.V.str("a")]]);
      rt.frameLine(5);
      {
        const _nv = rt.writeIdx(d, rt.V.float(1), rt.V.str("b"));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(6);
      print(rt.showArgs([d]));
      rt.frameLine(7);
      print(rt.showArgs([rt.wrapValue(rt.index(d, rt.V.int(1)))]));
      rt.frameLine(8);
      print(rt.showArgs([rt.wrapValue(rt.index(d, rt.V.float(1)))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.method(d, "size", [])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.method(d, "has", [rt.V.float(1.5)])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.method(d, "has", [rt.V.int(1)])]));
      rt.frameLine(12);
      let g = rt.dictOf([[rt.V.int(1), rt.V.str("i")], [rt.V.bool(true), rt.V.str("b")], [rt.V.float(1), rt.V.str("f")]]);
      rt.frameLine(13);
      print(rt.showArgs([g]));
      rt.frameLine(14);
      print(rt.showArgs([rt.method(g, "size", [])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.method(g, "has", [rt.V.int(1)])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.method(g, "has", [rt.V.bool(true)])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.method(g, "has", [rt.V.float(1)])]));
      rt.frameLine(18);
      let f = rt.dictOf([[rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("v")], [rt.vector2New([rt.V.int(2), rt.V.int(1)]), rt.V.str("w")]]);
      rt.frameLine(19);
      print(rt.showArgs([f]));
      rt.frameLine(20);
      print(rt.showArgs([rt.wrapValue(rt.index(f, rt.vector2New([rt.V.int(1), rt.V.int(2)])))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.method(f, "size", [])]));
      rt.frameLine(22);
      let k = rt.dictOf([]);
      rt.frameLine(23);
      {
        const _nv = rt.writeIdx(k, rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("a"));
        if (_nv !== null) k = _nv;
      }
      rt.frameLine(24);
      {
        const _nv = rt.writeIdx(k, rt.vector2New([rt.V.float(1), rt.V.float(2)]), rt.V.str("b"));
        if (_nv !== null) k = _nv;
      }
      rt.frameLine(25);
      print(rt.showArgs([k]));
      rt.frameLine(26);
      print(rt.showArgs([rt.method(k, "size", [])]));
      rt.frameLine(27);
      let h = rt.dictOf([[rt.V.int(9007199254740993n), rt.V.str("big")], [rt.V.float(9007199254740992), rt.V.str("bigf")]]);
      rt.frameLine(28);
      print(rt.showArgs([h]));
      rt.frameLine(29);
      print(rt.showArgs([rt.method(h, "size", [])]));
      rt.frameLine(30);
      let e = rt.dictOf([]);
      rt.frameLine(31);
      {
        const _nv = rt.writeIdx(e, rt.V.float((0 / 0)), rt.V.str("nan1"));
        if (_nv !== null) e = _nv;
      }
      rt.frameLine(32);
      print(rt.showArgs([e]));
      rt.frameLine(33);
      print(rt.showArgs([rt.method(e, "size", [])]));
      rt.frameLine(34);
      let z = rt.dictOf([]);
      rt.frameLine(35);
      {
        const _nv = rt.writeIdx(z, rt.V.float(0), rt.V.str("zero"));
        if (_nv !== null) z = _nv;
      }
      rt.frameLine(36);
      {
        const _nv = rt.writeIdx(z, rt.V.float((-0)), rt.V.str("negzero"));
        if (_nv !== null) z = _nv;
      }
      rt.frameLine(37);
      print(rt.showArgs([z]));
      rt.frameLine(38);
      print(rt.showArgs([rt.method(z, "size", [])]));
      rt.frameLine(39);
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
