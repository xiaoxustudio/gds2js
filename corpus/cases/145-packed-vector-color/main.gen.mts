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
      let v = rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(3), rt.V.int(3)]), rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.vector2New([rt.V.int(2), rt.V.int(2)])]))]);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("u1 "), v, rt.V.str(" "), rt.typeOf(v), rt.V.str(" "), rt.wrapValue(rt.index(v, rt.V.int(0))), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(v, rt.V.int(0))))]));
      rt.frameLine(6);
      rt.method(v, "sort", []);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("u2 "), v, rt.V.str(" "), rt.wrapValue(rt.index(v, rt.V.int((-1))))]));
      rt.frameLine(8);
      let w = rt.packCtor("vector3", [rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]))]);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("u3 "), w, rt.V.str(" "), rt.typeOf(w), rt.V.str(" "), rt.method(w, "get", [rt.V.int(4)])]));
      rt.frameLine(10);
      let c = rt.packCtor("color", [rt.V.array(rt.GArray.of([rt.colorNew([rt.V.float(0.5), rt.V.float(0.25), rt.V.float(0.125), rt.V.float(0.75)])]))]);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("u4 "), c, rt.V.str(" "), rt.typeOf(c), rt.V.str(" "), rt.ops.eq(rt.wrapValue(rt.index(c, rt.V.int(0))), rt.colorNew([rt.V.float(0.5), rt.V.float(0.25), rt.V.float(0.125), rt.V.float(0.75)])), rt.V.str(" "), rt.method(c, "get", [rt.V.int(1)])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("u5 "), rt.ops.eq(v, rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.vector2New([rt.V.int(2), rt.V.int(2)]), rt.vector2New([rt.V.int(3), rt.V.int(3)])]))])), rt.V.str(" "), rt.ops.add(v, rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(9), rt.V.int(9)])]))]))]));
      rt.frameLine(13);
      let r = rt.packCtor("vector2", []);
      rt.frameLine(14);
      rt.method(r, "resize", [rt.V.int(3)]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("u6 "), r]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("u7 "), rt.method(r, "append", [rt.vector2New([rt.V.int(1), rt.V.int(2)])]), rt.V.str(" "), r]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("u8 "), rt.method(r, "insert", [rt.V.int(0), rt.vector2New([rt.V.int(0), rt.V.int(5)])]), rt.V.str(" "), rt.method(r, "size", [])]));
      rt.frameLine(18);
      let up = rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2iNew([rt.V.int(1), rt.V.int(2)])]))]);
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("u9 "), up, rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(up, rt.V.int(0))))]));
      rt.frameLine(20);
      let bad = rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("x"), rt.V.bool(true)]))]);
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("u11 "), bad]));
      rt.frameLine(22);
      let badc = rt.packCtor("color", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])]))]);
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("u12 "), badc]));
      rt.frameLine(24);
      let e = rt.packCtor("vector3", []);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("u13 "), e, rt.V.str(" "), rt.ops.eq(e, rt.packCtor("vector3", [])), rt.V.str(" "), rt.method(e, "size", [])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("u14 "), rt.method(rt.asType(c, "PackedColorArray"), "size", []), rt.V.str(" "), rt.isType(c, "PackedColorArray"), rt.V.str(" "), rt.isType(c, "PackedVector3Array")]));
      rt.frameLine(27);
      let dup = rt.method(v, "duplicate", []);
      rt.frameLine(28);
      {
        const _nv = rt.writeIdx(dup, rt.V.int(0), rt.vector2New([rt.V.int(7), rt.V.int(7)]));
        if (_nv !== null) dup = _nv;
      }
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("u15 "), v, rt.V.str(" "), dup]));
      rt.frameLine(30);
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
