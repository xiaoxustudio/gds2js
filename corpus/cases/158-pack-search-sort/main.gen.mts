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
      let c = rt.packCtor("color", [rt.V.array(rt.GArray.of([rt.colorNew([rt.V.float(0.9), rt.V.float(0.1), rt.V.float(0.1), rt.V.int(1)]), rt.colorNew([rt.V.float(0.1), rt.V.float(0.9), rt.V.float(0.1), rt.V.float(0.5)]), rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5), rt.V.int(1)]), rt.colorNew([rt.V.float(0.1), rt.V.float(0.1), rt.V.float(0.9), rt.V.int(1)]), rt.colorNew([rt.V.float(0.5), rt.V.float(0.1), rt.V.float(0.9), rt.V.float(0.25)])]))]);
      rt.frameLine(11);
      rt.method(c, "sort", []);
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("t1 "), c]));
      rt.frameLine(13);
      rt.method(c, "reverse", []);
      rt.frameLine(14);
      rt.method(c, "sort", []);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("t2 "), rt.method(c, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(c, rt.V.int(0))), rt.V.str(" "), rt.wrapValue(rt.index(c, rt.V.int(4)))]));
      rt.frameLine(16);
      let v = rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(3), rt.V.int(4)])]))]);
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("t3 "), rt.method(v, "has", [rt.vector2New([rt.V.int(1), rt.V.int(2)])]), rt.V.str(" "), rt.method(v, "has", [rt.vector2New([rt.V.int(1), rt.V.int(3)])]), rt.V.str(" "), rt.method(v, "count", [rt.vector2New([rt.V.int(3), rt.V.int(4)])]), rt.V.str(" "), rt.method(v, "find", [rt.vector2New([rt.V.int(3), rt.V.int(4)])]), rt.V.str(" "), rt.method(v, "find", [rt.vector2New([rt.V.int(9), rt.V.int(9)])])]));
      rt.frameLine(18);
      let f = rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.float(1.0000001), rt.V.int(2)]), rt.vector2New([rt.V.int(1), rt.V.int(2)])]))]);
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("t4 "), rt.method(f, "has", [rt.vector2New([rt.V.int(1), rt.V.int(2)])]), rt.V.str(" "), rt.method(f, "count", [rt.vector2New([rt.V.int(1), rt.V.int(2)])])]));
      rt.frameLine(20);
      let col = rt.packCtor("color", [rt.V.array(rt.GArray.of([rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.int(1)]), rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.5)])]))]);
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("t5 "), rt.method(col, "has", [rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.int(1)])]), rt.V.str(" "), rt.method(col, "count", [rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.5)])]), rt.V.str(" "), rt.method(col, "find", [rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.5)])])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("t6 "), rt.method(col, "has", [rt.colorNew([rt.V.float(0.10000001), rt.V.float(0.2), rt.V.float(0.3), rt.V.int(1)])])]));
      rt.frameLine(23);
      let w = rt.packCtor("vector3", [rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]))]);
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("t7 "), rt.method(w, "has", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]), rt.V.str(" "), rt.method(w, "find", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]), rt.V.str(" "), rt.method(w, "count", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])]));
      rt.frameLine(25);
      let b = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(8), rt.V.int(9)]))]);
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("t8 "), rt.method(b, "get", [rt.V.int(1)]), rt.V.str(" "), rt.wrapValue(rt.index(b, rt.V.int((-1)))), rt.V.str(" "), rt.method(b, "size", [])]));
      rt.frameLine(27);
      let s = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("b"), rt.V.str("c")]))]);
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("t9 "), rt.method(s, "get", [rt.V.int(2)]), rt.V.str("|"), rt.wrapValue(rt.index(s, rt.V.int((-1)))), rt.V.str("|"), rt.wrapValue(rt.index(s, rt.V.int(0)))]));
      rt.frameLine(29);
      let q = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))]);
      rt.frameLine(30);
      rt.method(q, "set", [rt.V.int(0), rt.V.int(300)]);
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("t10 "), q]));
      rt.frameLine(32);
      let f32 = rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(1.5), rt.V.float(2.5)]))]);
      rt.frameLine(33);
      rt.method(f32, "set", [rt.V.int(0), rt.V.int(3)]);
      rt.frameLine(34);
      rt.method(f32, "set", [rt.V.int(1), rt.V.float(0.1)]);
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("t11 "), f32]));
      rt.frameLine(36);
      let i64 = rt.packCtor("int64", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]);
      rt.frameLine(37);
      rt.method(i64, "set", [rt.V.int(1), rt.V.int((-3))]);
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("t12 "), i64]));
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("t13 "), rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.str("12abc")]))]), rt.V.str(" "), rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.str("-7xyz")]))]), rt.V.str(" "), rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.str("abc")]))]), rt.V.str(" "), rt.packCtor("float64", [rt.V.array(rt.GArray.of([rt.V.str("1.5abc")]))])]));
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("t14 "), rt.packCtor("int64", [rt.V.array(rt.GArray.of([rt.V.float(1e+30), rt.V.float(2.7), rt.V.float((-2.7))]))]), rt.V.str(" "), rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.float(1e+30), rt.V.float(2147483648)]))])]));
      rt.frameLine(41);
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
