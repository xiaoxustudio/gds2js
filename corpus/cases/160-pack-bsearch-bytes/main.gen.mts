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
      let p = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3), rt.V.int(5), rt.V.int(7)]))]);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("t1 "), rt.method(p, "bsearch", [rt.V.int(5)]), rt.V.str(" "), rt.method(p, "bsearch", [rt.V.int(6)]), rt.V.str(" "), rt.method(p, "bsearch", [rt.V.int(0)]), rt.V.str(" "), rt.method(p, "bsearch", [rt.V.int(9)])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("t2 "), rt.method(p, "bsearch", [rt.V.int(5), rt.V.bool(false)]), rt.V.str(" "), rt.method(p, "bsearch", [rt.V.int(6), rt.V.bool(false)]), rt.V.str(" "), rt.method(p, "bsearch", [rt.V.int(5), rt.V.bool(true)]), rt.V.str(" "), rt.method(p, "bsearch", [rt.V.int(9), rt.V.bool(false)])]));
      rt.frameLine(7);
      let u = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]))]);
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("t3 "), rt.method(u, "bsearch", [rt.V.int(1)]), rt.V.str(" "), rt.method(u, "bsearch", [rt.V.int(2)]), rt.V.str(" "), rt.method(u, "bsearch", [rt.V.int(9)]), rt.V.str(" "), rt.method(u, "bsearch", [rt.V.int(0)])]));
      rt.frameLine(9);
      let d = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1), rt.V.int(2), rt.V.int(2), rt.V.int(3)]))]);
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("t4 "), rt.method(d, "bsearch", [rt.V.int(1)]), rt.V.str(" "), rt.method(d, "bsearch", [rt.V.int(1), rt.V.bool(false)]), rt.V.str(" "), rt.method(d, "bsearch", [rt.V.int(2)]), rt.V.str(" "), rt.method(d, "bsearch", [rt.V.int(2), rt.V.bool(false)])]));
      rt.frameLine(11);
      let e = rt.bytesCtor([]);
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("t5 "), rt.method(e, "bsearch", [rt.V.int(1)]), rt.V.str(" "), rt.method(e, "bsearch", [rt.V.int(1), rt.V.bool(false)]), rt.V.str(" "), rt.method(e, "size", [])]));
      rt.frameLine(13);
      let i = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int((-5)), rt.V.int(0), rt.V.int(3), rt.V.int(7)]))]);
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("t6 "), rt.method(i, "bsearch", [rt.V.int((-5))]), rt.V.str(" "), rt.method(i, "bsearch", [rt.V.int((-4))]), rt.V.str(" "), rt.method(i, "bsearch", [rt.V.int(0), rt.V.bool(false)]), rt.V.str(" "), rt.method(i, "bsearch", [rt.V.int(8)])]));
      rt.frameLine(15);
      let s = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("c"), rt.V.str("e")]))]);
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("t7 "), rt.method(s, "bsearch", [rt.V.str("c")]), rt.V.str(" "), rt.method(s, "bsearch", [rt.V.str("d")]), rt.V.str(" "), rt.method(s, "bsearch", [rt.V.str("z")]), rt.V.str(" "), rt.method(s, "bsearch", [rt.V.str("a"), rt.V.bool(false)])]));
      rt.frameLine(17);
      let col = rt.packCtor("color", [rt.V.array(rt.GArray.of([rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.colorNew([rt.V.int(1), rt.V.int(1), rt.V.int(1), rt.V.int(1)])]))]);
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("t8 "), rt.method(col, "bsearch", [rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]), rt.V.str(" "), rt.method(col, "bsearch", [rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)])]), rt.V.str(" "), rt.method(col, "bsearch", [rt.colorNew([rt.V.int(1), rt.V.int(1), rt.V.int(1), rt.V.int(1)]), rt.V.bool(false)])]));
      rt.frameLine(19);
      let v3 = rt.packCtor("vector3", [rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]), rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)])]))]);
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("t9 "), rt.method(v3, "bsearch", [rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)])]), rt.V.str(" "), rt.method(v3, "bsearch", [rt.vector3New([rt.V.int(1), rt.V.int(5), rt.V.int(5)])])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("t10 "), rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0), rt.V.int(128), rt.V.int(63), rt.V.int(205), rt.V.int(204), rt.V.int(204), rt.V.int(61)]))]), "to_float32_array", [])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("t11 "), rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(254), rt.V.int(255), rt.V.int(255), rt.V.int(255)]))]), "to_int32_array", [])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("t12 "), rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(1), rt.V.int(255), rt.V.int(255), rt.V.int(255), rt.V.int(255), rt.V.int(255), rt.V.int(255), rt.V.int(255), rt.V.int(255)]))]), "to_int64_array", [])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("t13 "), rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(248), rt.V.int(63)]))]), "to_float64_array", [])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("t14 "), rt.method(rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0), rt.V.int(128), rt.V.int(63)]))]), "to_float32_array", []), "to_byte_array", [])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("t15 "), rt.method(rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int((-2))]))]), "to_byte_array", [])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("t16 "), rt.method(rt.packCtor("int64", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int((-2))]))]), "to_byte_array", [])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("t17 "), rt.method(rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(1.5), rt.V.float((-1)), rt.V.float(0.1)]))]), "to_byte_array", [])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("t18 "), rt.method(rt.packCtor("float64", [rt.V.array(rt.GArray.of([rt.V.float(1.5)]))]), "to_byte_array", [])]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("t19 "), rt.method(rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("ab"), rt.V.str("c")]))]), "to_byte_array", [])]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("t20 "), rt.method(rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("")]))]), "to_byte_array", []), rt.V.str(" "), rt.method(rt.packCtor("string", [rt.V.array(rt.GArray.of([]))]), "to_byte_array", [])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("t21 "), rt.method(rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("éA")]))]), "to_byte_array", [])]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("t22 "), rt.method(rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])]))]), "to_byte_array", [])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("t23 "), rt.method(rt.packCtor("vector3", [rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]))]), "to_byte_array", [])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("t24 "), rt.method(rt.packCtor("color", [rt.V.array(rt.GArray.of([rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]))]), "to_byte_array", [])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("t25 "), rt.typeOf(rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0), rt.V.int(128), rt.V.int(63)]))]), "to_float32_array", [])), rt.V.str(" "), rt.typeOf(rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)]))]), "to_int64_array", [])), rt.V.str(" "), rt.typeOf(rt.method(rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("ab")]))]), "to_byte_array", []))]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("t26 "), rt.wrapValue(rt.index(rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)]))]), "to_int64_array", []), rt.V.int(0))), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)]))]), "to_int64_array", []), rt.V.int(0))))]));
      rt.frameLine(38);
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
