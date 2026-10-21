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
      let e = rt.V.array(rt.GArray.of([]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("u1 "), e, rt.V.str(" "), rt.method(e, "is_typed", []), rt.V.str(" "), rt.method(e, "size", [])]));
      rt.frameLine(6);
      rt.method(e, "append", [rt.V.int(1)]);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("u2 "), e, rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(e, rt.V.int(0))))]));
      rt.frameLine(8);
      let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(9);
      let r = rt.arrayFromVariant(a);
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("u3 "), r, rt.V.str(" "), rt.method(r, "is_typed", []), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(r, rt.V.int(0)))), rt.V.str(" "), rt.method(r, "size", [])]));
      rt.frameLine(11);
      {
        const _nv = rt.writeIdx(r, rt.V.int(0), rt.V.int(7));
        if (_nv !== null) r = _nv;
      }
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("u4 "), a, rt.V.str(" "), r]));
      rt.frameLine(13);
      let b = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2)]))]));
      rt.frameLine(14);
      let c = rt.arrayFromVariant(b);
      rt.frameLine(15);
      {
      const _w0 = rt.V.int(0);
        const _nv = rt.writeIdx(rt.index(c, _w0), rt.V.int(0), rt.V.int(9));
        if (_nv !== null) rt.setIndex(c, _w0, _nv);
      }
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("u5 "), b, rt.V.str(" "), c]));
      rt.frameLine(17);
      let p = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1)]))]);
      rt.frameLine(18);
      let q = rt.arrayFromVariant(p);
      rt.frameLine(19);
      rt.method(q, "append", [rt.V.int(9)]);
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("u6 "), p, rt.V.str(" "), q]));
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
