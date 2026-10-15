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
      let s = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("b")]))]);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("u1 "), s, rt.V.str(" "), rt.typeOf(s), rt.V.str(" "), rt.wrapValue(rt.index(s, rt.V.int(0))), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(s, rt.V.int(0))))]));
      rt.frameLine(6);
      let m = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.float(2.5), rt.V.bool(true), rt.V.nil(), rt.V.stringName("nm")]))]);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("u2 "), m]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("u3 "), rt.ops.eq(s, rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("b")]))])), rt.V.str(" "), rt.ops.add(s, rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("c")]))]))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("u4 "), rt.wrapValue(rt.index(s, rt.V.int((-1)))), rt.V.str("|"), rt.V.str(" "), rt.method(s, "get", [rt.V.int(9)]), rt.V.str("|"), rt.V.str(" "), rt.method(s, "has", [rt.V.str("a")]), rt.V.str(" "), rt.method(s, "find", [rt.V.str("b")]), rt.V.str(" "), rt.method(s, "count", [rt.V.str("a")])]));
      rt.frameLine(10);
      let t = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("b"), rt.V.str("a")]))]);
      rt.frameLine(11);
      rt.method(t, "sort", []);
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("u5 "), t, rt.V.str(" "), rt.method(t, "slice", [rt.V.int(1)]), rt.V.str(" "), rt.ops.eq(rt.method(t, "duplicate", []), t)]));
      rt.frameLine(13);
      let u = rt.packCtor("string", []);
      rt.frameLine(14);
      rt.method(u, "resize", [rt.V.int(2)]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("u6 "), u]));
      rt.frameLine(16);
      let added = rt.method(u, "append", [rt.V.str("x")]);
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("u7 "), added, rt.V.str(" "), u]));
      rt.frameLine(18);
      {
        const _nv = rt.writeIdx(u, rt.V.int(0), rt.V.str("z"));
        if (_nv !== null) u = _nv;
      }
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("u8 "), u, rt.V.str(" "), rt.wrapValue(rt.index(u, rt.V.int((-1))))]));
      rt.frameLine(20);
      let d = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("q")]))]);
      rt.frameLine(21);
      let e = d;
      rt.frameLine(22);
      {
        const _nv = rt.writeIdx(e, rt.V.int(0), rt.V.str("w"));
        if (_nv !== null) e = _nv;
      }
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("u9 "), d, rt.V.str(" "), rt.method(d, "insert", [rt.V.int(0), rt.V.str("i")]), rt.V.str(" "), d]));
      rt.frameLine(24);
      let v = rt.packCtor("string", []);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("u10 "), v, rt.V.str(" "), rt.ops.eq(v, rt.packCtor("string", [])), rt.V.str(" "), rt.method(v, "size", [])]));
      rt.frameLine(26);
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
