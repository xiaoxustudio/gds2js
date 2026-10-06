// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let v = rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(3), rt.V.int(3)]), rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.vector2New([rt.V.int(2), rt.V.int(2)])]))]);
    print(rt.showArgs([rt.V.str("u1 "), v, rt.V.str(" "), rt.typeOf(v), rt.V.str(" "), rt.wrapValue(rt.index(v, rt.V.int(0))), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(v, rt.V.int(0))))]));
    rt.method(v, "sort", []);
    print(rt.showArgs([rt.V.str("u2 "), v, rt.V.str(" "), rt.wrapValue(rt.index(v, rt.V.int((-1))))]));
    let w = rt.packCtor("vector3", [rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]))]);
    print(rt.showArgs([rt.V.str("u3 "), w, rt.V.str(" "), rt.typeOf(w), rt.V.str(" "), rt.method(w, "get", [rt.V.int(4)])]));
    let c = rt.packCtor("color", [rt.V.array(rt.GArray.of([rt.colorNew([rt.V.float(0.5), rt.V.float(0.25), rt.V.float(0.125), rt.V.float(0.75)])]))]);
    print(rt.showArgs([rt.V.str("u4 "), c, rt.V.str(" "), rt.typeOf(c), rt.V.str(" "), rt.ops.eq(rt.wrapValue(rt.index(c, rt.V.int(0))), rt.colorNew([rt.V.float(0.5), rt.V.float(0.25), rt.V.float(0.125), rt.V.float(0.75)])), rt.V.str(" "), rt.method(c, "get", [rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("u5 "), rt.ops.eq(v, rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.vector2New([rt.V.int(2), rt.V.int(2)]), rt.vector2New([rt.V.int(3), rt.V.int(3)])]))])), rt.V.str(" "), rt.ops.add(v, rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(9), rt.V.int(9)])]))]))]));
    let r = rt.packCtor("vector2", []);
    rt.method(r, "resize", [rt.V.int(3)]);
    print(rt.showArgs([rt.V.str("u6 "), r]));
    print(rt.showArgs([rt.V.str("u7 "), rt.method(r, "append", [rt.vector2New([rt.V.int(1), rt.V.int(2)])]), rt.V.str(" "), r]));
    print(rt.showArgs([rt.V.str("u8 "), rt.method(r, "insert", [rt.V.int(0), rt.vector2New([rt.V.int(0), rt.V.int(5)])]), rt.V.str(" "), rt.method(r, "size", [])]));
    let up = rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2iNew([rt.V.int(1), rt.V.int(2)])]))]);
    print(rt.showArgs([rt.V.str("u9 "), up, rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(up, rt.V.int(0))))]));
    let bad = rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("x"), rt.V.bool(true)]))]);
    print(rt.showArgs([rt.V.str("u11 "), bad]));
    let badc = rt.packCtor("color", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])]))]);
    print(rt.showArgs([rt.V.str("u12 "), badc]));
    let e = rt.packCtor("vector3", []);
    print(rt.showArgs([rt.V.str("u13 "), e, rt.V.str(" "), rt.ops.eq(e, rt.packCtor("vector3", [])), rt.V.str(" "), rt.method(e, "size", [])]));
    print(rt.showArgs([rt.V.str("u14 "), rt.method(rt.asType(c, "PackedColorArray"), "size", []), rt.V.str(" "), rt.isType(c, "PackedColorArray"), rt.V.str(" "), rt.isType(c, "PackedVector3Array")]));
    let dup = rt.method(v, "duplicate", []);
    {
      const _nv = rt.writeIdx(dup, rt.V.int(0), rt.vector2New([rt.V.int(7), rt.V.int(7)]));
      if (_nv !== null) dup = _nv;
    }
    print(rt.showArgs([rt.V.str("u15 "), v, rt.V.str(" "), dup]));
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
