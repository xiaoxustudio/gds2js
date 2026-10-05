// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let p = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3), rt.V.int(5), rt.V.int(7)]))]);
    print(rt.showArgs([rt.V.str("t1 "), rt.method(p, "bsearch", [rt.V.int(5)]), rt.V.str(" "), rt.method(p, "bsearch", [rt.V.int(6)]), rt.V.str(" "), rt.method(p, "bsearch", [rt.V.int(0)]), rt.V.str(" "), rt.method(p, "bsearch", [rt.V.int(9)])]));
    print(rt.showArgs([rt.V.str("t2 "), rt.method(p, "bsearch", [rt.V.int(5), rt.V.bool(false)]), rt.V.str(" "), rt.method(p, "bsearch", [rt.V.int(6), rt.V.bool(false)]), rt.V.str(" "), rt.method(p, "bsearch", [rt.V.int(5), rt.V.bool(true)]), rt.V.str(" "), rt.method(p, "bsearch", [rt.V.int(9), rt.V.bool(false)])]));
    let u = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]))]);
    print(rt.showArgs([rt.V.str("t3 "), rt.method(u, "bsearch", [rt.V.int(1)]), rt.V.str(" "), rt.method(u, "bsearch", [rt.V.int(2)]), rt.V.str(" "), rt.method(u, "bsearch", [rt.V.int(9)]), rt.V.str(" "), rt.method(u, "bsearch", [rt.V.int(0)])]));
    let d = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1), rt.V.int(2), rt.V.int(2), rt.V.int(3)]))]);
    print(rt.showArgs([rt.V.str("t4 "), rt.method(d, "bsearch", [rt.V.int(1)]), rt.V.str(" "), rt.method(d, "bsearch", [rt.V.int(1), rt.V.bool(false)]), rt.V.str(" "), rt.method(d, "bsearch", [rt.V.int(2)]), rt.V.str(" "), rt.method(d, "bsearch", [rt.V.int(2), rt.V.bool(false)])]));
    let e = rt.bytesCtor([]);
    print(rt.showArgs([rt.V.str("t5 "), rt.method(e, "bsearch", [rt.V.int(1)]), rt.V.str(" "), rt.method(e, "bsearch", [rt.V.int(1), rt.V.bool(false)]), rt.V.str(" "), rt.method(e, "size", [])]));
    let i = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int((-5)), rt.V.int(0), rt.V.int(3), rt.V.int(7)]))]);
    print(rt.showArgs([rt.V.str("t6 "), rt.method(i, "bsearch", [rt.V.int((-5))]), rt.V.str(" "), rt.method(i, "bsearch", [rt.V.int((-4))]), rt.V.str(" "), rt.method(i, "bsearch", [rt.V.int(0), rt.V.bool(false)]), rt.V.str(" "), rt.method(i, "bsearch", [rt.V.int(8)])]));
    let s = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("c"), rt.V.str("e")]))]);
    print(rt.showArgs([rt.V.str("t7 "), rt.method(s, "bsearch", [rt.V.str("c")]), rt.V.str(" "), rt.method(s, "bsearch", [rt.V.str("d")]), rt.V.str(" "), rt.method(s, "bsearch", [rt.V.str("z")]), rt.V.str(" "), rt.method(s, "bsearch", [rt.V.str("a"), rt.V.bool(false)])]));
    let col = rt.packCtor("color", [rt.V.array(rt.GArray.of([rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.colorNew([rt.V.int(1), rt.V.int(1), rt.V.int(1), rt.V.int(1)])]))]);
    print(rt.showArgs([rt.V.str("t8 "), rt.method(col, "bsearch", [rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]), rt.V.str(" "), rt.method(col, "bsearch", [rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)])]), rt.V.str(" "), rt.method(col, "bsearch", [rt.colorNew([rt.V.int(1), rt.V.int(1), rt.V.int(1), rt.V.int(1)]), rt.V.bool(false)])]));
    let v3 = rt.packCtor("vector3", [rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]), rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)])]))]);
    print(rt.showArgs([rt.V.str("t9 "), rt.method(v3, "bsearch", [rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)])]), rt.V.str(" "), rt.method(v3, "bsearch", [rt.vector3New([rt.V.int(1), rt.V.int(5), rt.V.int(5)])])]));
    print(rt.showArgs([rt.V.str("t10 "), rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0), rt.V.int(128), rt.V.int(63), rt.V.int(205), rt.V.int(204), rt.V.int(204), rt.V.int(61)]))]), "to_float32_array", [])]));
    print(rt.showArgs([rt.V.str("t11 "), rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(254), rt.V.int(255), rt.V.int(255), rt.V.int(255)]))]), "to_int32_array", [])]));
    print(rt.showArgs([rt.V.str("t12 "), rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(1), rt.V.int(255), rt.V.int(255), rt.V.int(255), rt.V.int(255), rt.V.int(255), rt.V.int(255), rt.V.int(255), rt.V.int(255)]))]), "to_int64_array", [])]));
    print(rt.showArgs([rt.V.str("t13 "), rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(248), rt.V.int(63)]))]), "to_float64_array", [])]));
    print(rt.showArgs([rt.V.str("t14 "), rt.method(rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0), rt.V.int(128), rt.V.int(63)]))]), "to_float32_array", []), "to_byte_array", [])]));
    print(rt.showArgs([rt.V.str("t15 "), rt.method(rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int((-2))]))]), "to_byte_array", [])]));
    print(rt.showArgs([rt.V.str("t16 "), rt.method(rt.packCtor("int64", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int((-2))]))]), "to_byte_array", [])]));
    print(rt.showArgs([rt.V.str("t17 "), rt.method(rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(1.5), rt.V.float((-1)), rt.V.float(0.1)]))]), "to_byte_array", [])]));
    print(rt.showArgs([rt.V.str("t18 "), rt.method(rt.packCtor("float64", [rt.V.array(rt.GArray.of([rt.V.float(1.5)]))]), "to_byte_array", [])]));
    print(rt.showArgs([rt.V.str("t19 "), rt.method(rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("ab"), rt.V.str("c")]))]), "to_byte_array", [])]));
    print(rt.showArgs([rt.V.str("t20 "), rt.method(rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("")]))]), "to_byte_array", []), rt.V.str(" "), rt.method(rt.packCtor("string", [rt.V.array(rt.GArray.of([]))]), "to_byte_array", [])]));
    print(rt.showArgs([rt.V.str("t21 "), rt.method(rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("éA")]))]), "to_byte_array", [])]));
    print(rt.showArgs([rt.V.str("t22 "), rt.method(rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])]))]), "to_byte_array", [])]));
    print(rt.showArgs([rt.V.str("t23 "), rt.method(rt.packCtor("vector3", [rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]))]), "to_byte_array", [])]));
    print(rt.showArgs([rt.V.str("t24 "), rt.method(rt.packCtor("color", [rt.V.array(rt.GArray.of([rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]))]), "to_byte_array", [])]));
    print(rt.showArgs([rt.V.str("t25 "), rt.typeOf(rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0), rt.V.int(128), rt.V.int(63)]))]), "to_float32_array", [])), rt.V.str(" "), rt.typeOf(rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)]))]), "to_int64_array", [])), rt.V.str(" "), rt.typeOf(rt.method(rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("ab")]))]), "to_byte_array", []))]));
    print(rt.showArgs([rt.V.str("t26 "), rt.wrapValue(rt.index(rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)]))]), "to_int64_array", []), rt.V.int(0))), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)]))]), "to_int64_array", []), rt.V.int(0))))]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
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
