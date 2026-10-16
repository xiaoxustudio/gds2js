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
      let a = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("u1 "), a, rt.V.str(" "), rt.typeOf(a), rt.V.str(" "), rt.method(a, "size", [])]));
      rt.frameLine(6);
      let big = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(2147483648), rt.V.int((-2147483649)), rt.V.int(4294967296), rt.V.float(2.7), rt.V.float((-2.7)), rt.V.bool(true)]))]);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("u2 "), big]));
      rt.frameLine(8);
      let f = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.float(0.1), rt.V.float(1), rt.V.float(1e+308)]))]);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("u3 "), f, rt.V.str(" "), rt.wrapValue(rt.index(f, rt.V.int(0))), rt.V.str(" "), rt.ops.eq(rt.wrapValue(rt.index(f, rt.V.int(0))), rt.V.float(0.1))]));
      rt.frameLine(10);
      let b = rt.packCtor("int64", [rt.V.array(rt.GArray.of([rt.V.int(2147483648), rt.V.int((-2147483649)), rt.V.int(9007199254740993n), rt.V.float(2.7), rt.V.bool(true)]))]);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("u4 "), b, rt.V.str(" "), rt.typeOf(b), rt.V.str(" "), rt.wrapValue(rt.index(b, rt.V.int(0))), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(b, rt.V.int(0))))]));
      rt.frameLine(12);
      let g = rt.packCtor("int32", []);
      rt.frameLine(13);
      rt.method(g, "append", [rt.V.int(300)]);
      rt.frameLine(14);
      rt.method(g, "resize", [rt.V.int(4)]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("u5 "), g, rt.V.str(" "), rt.method(g, "size", [])]));
      rt.frameLine(16);
      let h = a;
      rt.frameLine(17);
      {
        const _nv = rt.writeIdx(h, rt.V.int(0), rt.V.int(77));
        if (_nv !== null) h = _nv;
      }
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("u6 "), a, rt.V.str(" "), h]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("u7 "), rt.ops.eq(a, rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(77), rt.V.int(2)]))])), rt.V.str(" "), rt.ops.add(a, rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(3)]))]))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("u8 "), rt.method(a, "get", [rt.V.int(5)]), rt.V.str(" "), rt.method(a, "get", [rt.V.int(1)]), rt.V.str(" "), rt.method(a, "has", [rt.V.int(77)]), rt.V.str(" "), rt.method(a, "count", [rt.V.int(2)]), rt.V.str(" "), rt.method(a, "find", [rt.V.int(77)])]));
      rt.frameLine(21);
      let s = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]))]);
      rt.frameLine(22);
      rt.method(s, "sort", []);
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("u12 "), s, rt.V.str(" "), rt.method(s, "slice", [rt.V.int(1)]), rt.V.str(" "), rt.ops.eq(rt.method(s, "duplicate", []), s)]));
      rt.frameLine(24);
      let t = rt.packCtor("int32", []);
      rt.frameLine(25);
      let u = rt.packCtor("int64", []);
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("u13 "), t, rt.V.str(" "), u, rt.V.str(" "), rt.ops.eq(t, rt.packCtor("int32", []))]));
      rt.frameLine(27);
      rt.method(t, "resize", [rt.V.int(3)]);
      rt.frameLine(28);
      {
        const _nv = rt.writeIdx(t, rt.V.int((-1)), rt.V.int(8));
        if (_nv !== null) t = _nv;
      }
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("u14 "), t, rt.V.str(" "), rt.wrapValue(rt.index(t, rt.V.int((-1)), "PackedInt32Array"))]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("u15 "), rt.method(a, "append", [rt.V.int(9)]), rt.V.str(" "), rt.method(a, "size", [])]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("u16 "), rt.wrapValue(rt.index(b, rt.V.int((-1)))), rt.V.str(" "), rt.method(b, "get", [rt.V.int(0)]), rt.V.str(" "), rt.method(b, "count", [rt.V.int(2147483648)])]));
      rt.frameLine(32);
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
