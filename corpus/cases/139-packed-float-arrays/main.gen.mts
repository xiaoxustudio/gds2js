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
      let f = rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(0.1), rt.V.float(2.7), rt.ops.div(rt.V.float(1), rt.V.int(3)), rt.V.float(0.00001), rt.V.float(123456.789), rt.V.float((-0)), rt.V.float(100000000000000000000)]))]);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("u1 "), f, rt.V.str(" "), rt.typeOf(f)]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("u2 "), rt.wrapValue(rt.index(f, rt.V.int(0))), rt.V.str(" "), rt.ops.eq(rt.wrapValue(rt.index(f, rt.V.int(0))), rt.V.float(0.1)), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(f, rt.V.int(0))))]));
      rt.frameLine(7);
      let d = rt.packCtor("float64", [rt.V.array(rt.GArray.of([rt.V.float(0.1), rt.V.float(2.7), rt.ops.div(rt.V.float(1), rt.V.int(3)), rt.V.float(100000000000000000000), rt.V.float(1e+308)]))]);
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("u3 "), d, rt.V.str(" "), rt.typeOf(d), rt.V.str(" "), rt.ops.eq(rt.wrapValue(rt.index(d, rt.V.int(0))), rt.V.float(0.1))]));
      rt.frameLine(9);
      let m = rt.packCtor("float64", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.bool(true), rt.V.int(3)]))]);
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("u4 "), m]));
      rt.frameLine(11);
      let r = rt.packCtor("float32", []);
      rt.frameLine(12);
      rt.method(r, "resize", [rt.V.int(3)]);
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("u5 "), r]));
      rt.frameLine(14);
      let added = rt.method(r, "append", [rt.V.float(2.5)]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("u5b "), added, rt.V.str(" "), r, rt.V.str(" "), rt.method(r, "size", [])]));
      rt.frameLine(16);
      let g = rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(1.5), rt.V.float(2.5)]))]);
      rt.frameLine(17);
      let h = g;
      rt.frameLine(18);
      {
        const _nv = rt.writeIdx(h, rt.V.int(0), rt.V.float(9.25));
        if (_nv !== null) h = _nv;
      }
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("u6 "), g, rt.V.str(" "), h]));
      rt.frameLine(20);
      let k = rt.method(g, "duplicate", []);
      rt.frameLine(21);
      {
        const _nv = rt.writeIdx(k, rt.V.int(1), rt.V.float(0.5));
        if (_nv !== null) k = _nv;
      }
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("u7 "), g, rt.V.str(" "), k]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("u8 "), rt.ops.eq(g, rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(9.25), rt.V.float(2.5)]))])), rt.V.str(" "), rt.ops.add(g, rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(3.5)]))]))]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("u9 "), rt.method(g, "get", [rt.V.int(5)]), rt.V.str(" "), rt.wrapValue(rt.index(g, rt.V.int((-1)))), rt.V.str(" "), rt.method(g, "has", [rt.V.float(9.25)]), rt.V.str(" "), rt.method(g, "find", [rt.V.float(2.5)])]));
      rt.frameLine(25);
      {
        const _nv = rt.writeIdx(g, rt.V.int((-1)), rt.V.float(8.25));
        if (_nv !== null) g = _nv;
      }
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("u10 "), g]));
      rt.frameLine(27);
      let s = rt.packCtor("float64", [rt.V.array(rt.GArray.of([rt.V.float(2.5), rt.V.float(1.5), rt.V.float(0.25)]))]);
      rt.frameLine(28);
      rt.method(s, "sort", []);
      rt.frameLine(29);
      let sliced = rt.method(s, "slice", [rt.V.int(1)]);
      rt.frameLine(30);
      let code = rt.method(s, "insert", [rt.V.int(0), rt.V.float(9.5)]);
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("u11 "), s, rt.V.str(" "), sliced, rt.V.str(" "), code, rt.V.str(" "), s]));
      rt.frameLine(32);
      let q = rt.packCtor("float64", []);
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("u12 "), q, rt.V.str(" "), rt.ops.eq(q, rt.packCtor("float64", [])), rt.V.str(" "), rt.method(q, "size", [])]));
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
