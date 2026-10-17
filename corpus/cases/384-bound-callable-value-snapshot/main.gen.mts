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
      let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(5);
      let c = rt.wrapValue(rt.attribute(a, "append"));
      rt.frameLine(6);
      rt.method(a, "append", [rt.V.int(3)]);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("B1|"), rt.ops.eq(c, rt.wrapValue(rt.attribute(a, "append"))), rt.V.str(" "), a]));
      rt.frameLine(8);
      let b = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(9);
      let d = rt.wrapValue(rt.attribute(b, "append"));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("B2|"), rt.ops.eq(d, rt.wrapValue(rt.attribute(b, "append")))]));
      rt.frameLine(11);
      rt.method(d, "call", [rt.V.int(7)]);
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("B3|"), rt.ops.eq(d, d), rt.V.str(" "), rt.ops.eq(d, rt.wrapValue(rt.attribute(b, "append"))), rt.V.str(" "), b]));
      rt.frameLine(13);
      let e = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(14);
      let f = rt.wrapValue(rt.attribute(e, "append"));
      rt.frameLine(15);
      rt.method(f, "callv", [rt.V.array(rt.GArray.of([rt.V.int(8)]))]);
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("B4|"), rt.ops.eq(f, rt.wrapValue(rt.attribute(e, "append"))), rt.V.str(" "), e]));
      rt.frameLine(17);
      let g = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(18);
      let h = rt.method(rt.wrapValue(rt.attribute(g, "append")), "bind", [rt.V.int(9)]);
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("B5|"), rt.ops.eq(h, rt.wrapValue(rt.attribute(g, "append"))), rt.V.str(" "), rt.method(h, "call", []), rt.V.str(" "), g]));
      rt.frameLine(20);
      let k = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(21);
      let m = rt.wrapValue(rt.attribute(k, "size"));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("B6|"), rt.ops.eq(m, rt.wrapValue(rt.attribute(k, "size")))]));
      rt.frameLine(23);
      rt.method(m, "call", []);
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("B7|"), rt.ops.eq(m, rt.wrapValue(rt.attribute(k, "size")))]));
      rt.frameLine(25);
      let p = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]);
      rt.frameLine(26);
      let q = rt.wrapValue(rt.attribute(p, "append"));
      rt.frameLine(27);
      rt.method(p, "append", [rt.V.int(3)]);
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("B8|"), rt.ops.eq(q, rt.wrapValue(rt.attribute(p, "append"))), rt.V.str(" "), p]));
      rt.frameLine(29);
      let v = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
      rt.frameLine(30);
      let n = rt.wrapValue(rt.attribute(v, "normalized"));
      rt.frameLine(31);
      v = rt.vector2New([rt.V.int(3), rt.V.int(4)]);
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("B9|"), rt.ops.eq(n, rt.wrapValue(rt.attribute(v, "normalized"))), rt.V.str(" "), v]));
      rt.frameLine(33);
      let r = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(34);
      let s1 = rt.wrapValue(rt.attribute(r, "append"));
      rt.frameLine(35);
      let s2 = rt.wrapValue(rt.attribute(r, "append"));
      rt.frameLine(36);
      rt.method(r, "append", [rt.V.int(5)]);
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("B10|"), rt.ops.eq(s1, s2), rt.V.str(" "), rt.ops.eq(s1, rt.wrapValue(rt.attribute(r, "append")))]));
      rt.frameLine(38);
      let w = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))]));
      rt.frameLine(39);
      let t = rt.wrapValue(rt.attribute(w, "append"));
      rt.frameLine(40);
      rt.method(rt.wrapValue(rt.index(w, rt.V.int(0))), "append", [rt.V.int(2)]);
      rt.frameLine(41);
      print(rt.showArgs([rt.V.str("B11|"), rt.ops.eq(t, rt.wrapValue(rt.attribute(w, "append"))), rt.V.str(" "), w, rt.V.str(" "), rt.wrapValue(rt.index(w, rt.V.int(0)))]));
      rt.frameLine(42);
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
