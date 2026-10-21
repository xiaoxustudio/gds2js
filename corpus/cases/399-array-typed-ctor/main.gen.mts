// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const TYPE_BOOL = rt.V.int(1);
const TYPE_FLOAT = rt.V.int(3);
const TYPE_INT = rt.V.int(2);
const TYPE_NIL = rt.V.int(0);
const TYPE_STRING = rt.V.int(4);
const TYPE_VECTOR2I = rt.V.int(6);

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
      let a = rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), TYPE_INT, rt.V.stringName(""), rt.V.nil()]);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("u1 "), a, rt.V.str(" "), rt.method(a, "is_typed", []), rt.V.str(" "), rt.method(a, "get_typed_builtin", []), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(a, rt.V.int(0)))), rt.V.str(" "), rt.typeOf(a)]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("u2 "), rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.float(1.7)])), TYPE_INT, rt.V.stringName(""), rt.V.nil()])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("u3 "), rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.int(1)])), TYPE_FLOAT, rt.V.stringName(""), rt.V.nil()])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("u4 "), rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.int(1)])), TYPE_BOOL, rt.V.stringName(""), rt.V.nil()])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("u5 "), rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.vector2New([rt.V.float(1.7), rt.V.int(2)])])), TYPE_VECTOR2I, rt.V.stringName(""), rt.V.nil()])]));
      rt.frameLine(10);
      let f = rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.nil()])), TYPE_INT, rt.V.stringName(""), rt.V.nil()]);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("u6 "), f, rt.V.str(" "), rt.method(f, "is_typed", []), rt.V.str(" "), rt.method(f, "size", []), rt.V.str(" "), rt.method(f, "get_typed_builtin", [])]));
      rt.frameLine(12);
      let g = rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.int(1)])), TYPE_NIL, rt.V.stringName(""), rt.V.nil()]);
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("u7 "), g, rt.V.str(" "), rt.method(g, "is_typed", [])]));
      rt.frameLine(14);
      let src = rt.V.array(rt.GArray.of([rt.V.int(1)]));
      rt.frameLine(15);
      let h = rt.arrayFromArgs([src, TYPE_INT, rt.V.stringName(""), rt.V.nil()]);
      rt.frameLine(16);
      {
        const _nv = rt.writeIdx(h, rt.V.int(0), rt.V.int(5));
        if (_nv !== null) h = _nv;
      }
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("u8 "), src, rt.V.str(" "), h]));
      rt.frameLine(18);
      let i = rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.int(1)])), TYPE_INT, rt.V.stringName(""), rt.V.nil()]);
      rt.frameLine(19);
      rt.method(i, "append", [rt.V.float(2.7)]);
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("u9 "), i]));
      rt.frameLine(21);
      let j = rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.str("1")])), TYPE_INT, rt.V.stringName(""), rt.V.nil()]);
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("u10 "), j, rt.V.str(" "), rt.method(j, "is_typed", []), rt.V.str(" "), rt.method(j, "size", [])]));
      rt.frameLine(23);
      let k = rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), TYPE_INT, rt.V.stringName(""), rt.V.nil()]);
      rt.frameLine(24);
      let l = rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.int(3)])), TYPE_INT, rt.V.stringName(""), rt.V.nil()]);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("u11 "), rt.method(k, "is_same_typed", [l]), rt.V.str(" "), rt.ops.eq(k, l)]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("u12 "), rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.int(1)])), TYPE_INT, rt.V.stringName("Foo"), rt.V.nil()])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("u13 "), rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.int(1)])), TYPE_STRING, rt.V.stringName(""), rt.V.nil()])]));
      rt.frameLine(28);
      let b = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]);
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("u14 "), rt.arrayFromArgs([b]), rt.V.str(" "), rt.arrayFromArgs([])]));
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
