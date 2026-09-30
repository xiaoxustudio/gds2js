// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let c = rt.packCtor("color", [rt.V.array(rt.GArray.of([rt.colorNew([rt.V.float(0.9), rt.V.float(0.1), rt.V.float(0.1), rt.V.int(1)]), rt.colorNew([rt.V.float(0.1), rt.V.float(0.9), rt.V.float(0.1), rt.V.float(0.5)]), rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5), rt.V.int(1)]), rt.colorNew([rt.V.float(0.1), rt.V.float(0.1), rt.V.float(0.9), rt.V.int(1)]), rt.colorNew([rt.V.float(0.5), rt.V.float(0.1), rt.V.float(0.9), rt.V.float(0.25)])]))]);
    rt.method(c, "sort", []);
    print(rt.showArgs([rt.V.str("t1 "), c]));
    rt.method(c, "reverse", []);
    rt.method(c, "sort", []);
    print(rt.showArgs([rt.V.str("t2 "), rt.method(c, "size", []), rt.V.str(" "), rt.index(c, rt.V.int(0)), rt.V.str(" "), rt.index(c, rt.V.int(4))]));
    let v = rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(3), rt.V.int(4)])]))]);
    print(rt.showArgs([rt.V.str("t3 "), rt.method(v, "has", [rt.vector2New([rt.V.int(1), rt.V.int(2)])]), rt.V.str(" "), rt.method(v, "has", [rt.vector2New([rt.V.int(1), rt.V.int(3)])]), rt.V.str(" "), rt.method(v, "count", [rt.vector2New([rt.V.int(3), rt.V.int(4)])]), rt.V.str(" "), rt.method(v, "find", [rt.vector2New([rt.V.int(3), rt.V.int(4)])]), rt.V.str(" "), rt.method(v, "find", [rt.vector2New([rt.V.int(9), rt.V.int(9)])])]));
    let f = rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.float(1.0000001), rt.V.int(2)]), rt.vector2New([rt.V.int(1), rt.V.int(2)])]))]);
    print(rt.showArgs([rt.V.str("t4 "), rt.method(f, "has", [rt.vector2New([rt.V.int(1), rt.V.int(2)])]), rt.V.str(" "), rt.method(f, "count", [rt.vector2New([rt.V.int(1), rt.V.int(2)])])]));
    let col = rt.packCtor("color", [rt.V.array(rt.GArray.of([rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.int(1)]), rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.5)])]))]);
    print(rt.showArgs([rt.V.str("t5 "), rt.method(col, "has", [rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.int(1)])]), rt.V.str(" "), rt.method(col, "count", [rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.5)])]), rt.V.str(" "), rt.method(col, "find", [rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.5)])])]));
    print(rt.showArgs([rt.V.str("t6 "), rt.method(col, "has", [rt.colorNew([rt.V.float(0.10000001), rt.V.float(0.2), rt.V.float(0.3), rt.V.int(1)])])]));
    let w = rt.packCtor("vector3", [rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]))]);
    print(rt.showArgs([rt.V.str("t7 "), rt.method(w, "has", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]), rt.V.str(" "), rt.method(w, "find", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]), rt.V.str(" "), rt.method(w, "count", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])]));
    let b = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(8), rt.V.int(9)]))]);
    print(rt.showArgs([rt.V.str("t8 "), rt.method(b, "get", [rt.V.int(1)]), rt.V.str(" "), rt.index(b, rt.V.int((-1))), rt.V.str(" "), rt.method(b, "size", [])]));
    let s = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("b"), rt.V.str("c")]))]);
    print(rt.showArgs([rt.V.str("t9 "), rt.method(s, "get", [rt.V.int(2)]), rt.V.str("|"), rt.index(s, rt.V.int((-1))), rt.V.str("|"), rt.index(s, rt.V.int(0))]));
    let q = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))]);
    rt.method(q, "set", [rt.V.int(0), rt.V.int(300)]);
    print(rt.showArgs([rt.V.str("t10 "), q]));
    let f32 = rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(1.5), rt.V.float(2.5)]))]);
    rt.method(f32, "set", [rt.V.int(0), rt.V.int(3)]);
    rt.method(f32, "set", [rt.V.int(1), rt.V.float(0.1)]);
    print(rt.showArgs([rt.V.str("t11 "), f32]));
    let i64 = rt.packCtor("int64", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]);
    rt.method(i64, "set", [rt.V.int(1), rt.V.int((-3))]);
    print(rt.showArgs([rt.V.str("t12 "), i64]));
    print(rt.showArgs([rt.V.str("t13 "), rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.str("12abc")]))]), rt.V.str(" "), rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.str("-7xyz")]))]), rt.V.str(" "), rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.str("abc")]))]), rt.V.str(" "), rt.packCtor("float64", [rt.V.array(rt.GArray.of([rt.V.str("1.5abc")]))])]));
    print(rt.showArgs([rt.V.str("t14 "), rt.packCtor("int64", [rt.V.array(rt.GArray.of([rt.V.float(1e+30), rt.V.float(2.7), rt.V.float((-2.7))]))]), rt.V.str(" "), rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.float(1e+30), rt.V.float(2147483648)]))])]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
