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
      let b = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]))]);
      rt.frameLine(5);
      let c = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(7)]))]);
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("u1 "), b, rt.V.str(" "), rt.typeOf(b), rt.V.str(" "), rt.method(b, "size", [])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("u2 "), rt.ops.add(b, c)]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("u3 "), rt.ops.eq(b, c), rt.V.str(" "), rt.ops.eq(b, rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]))]))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("u4 "), rt.method(b, "has", [rt.V.int(1)]), rt.V.str(" "), rt.method(b, "count", [rt.V.int(1)]), rt.V.str(" "), rt.method(b, "find", [rt.V.int(2)]), rt.V.str(" "), rt.method(b, "find", [rt.V.int(9)])]));
      rt.frameLine(10);
      rt.method(b, "sort", []);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("u5 "), b]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("u6 "), rt.wrapValue(rt.index(b, rt.V.int(0))), rt.V.str(" "), rt.wrapValue(rt.index(b, rt.V.int((-1)))), rt.V.str(" "), rt.method(b, "get", [rt.V.int(1)])]));
      rt.frameLine(13);
      let d = rt.method(rt.V.str("héllo"), "to_utf8_buffer", []);
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("u7 "), d, rt.V.str(" "), rt.method(d, "size", [])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("u8 "), rt.method(d, "get_string_from_utf8", [])]));
      rt.frameLine(16);
      {
        const _nv = rt.writeIdx(d, rt.V.int(0), rt.V.int(72));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("u9 "), rt.method(d, "get_string_from_utf8", []), rt.V.str(" "), rt.wrapValue(rt.index(d, rt.V.int(1)))]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("u10 "), rt.method(d, "hex_encode", []), rt.V.str(" "), rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(255)]))]), "hex_encode", [])]));
      rt.frameLine(19);
      let e = rt.bytesCtor([]);
      rt.frameLine(20);
      rt.method(e, "append", [rt.V.int(300)]);
      rt.frameLine(21);
      rt.method(e, "append", [rt.V.int((-1))]);
      rt.frameLine(22);
      rt.method(e, "append", [rt.V.float(2.7)]);
      rt.frameLine(23);
      rt.method(e, "append", [rt.V.bool(true)]);
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("u11 "), e]));
      rt.frameLine(25);
      rt.method(e, "resize", [rt.V.int(6)]);
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("u12 "), e, rt.V.str(" "), rt.method(e, "is_empty", []), rt.V.str(" "), rt.method(e, "size", [])]));
      rt.frameLine(27);
      let f = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))]);
      rt.frameLine(28);
      let g = f;
      rt.frameLine(29);
      {
        const _nv = rt.writeIdx(g, rt.V.int(0), rt.V.int(9));
        if (_nv !== null) g = _nv;
      }
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("u13 "), f, rt.V.str(" "), g]));
      rt.frameLine(31);
      let h = rt.method(f, "duplicate", []);
      rt.frameLine(32);
      {
        const _nv = rt.writeIdx(h, rt.V.int(0), rt.V.int(8));
        if (_nv !== null) h = _nv;
      }
      rt.frameLine(33);
      let s2 = rt.bytesCtor([f]);
      rt.frameLine(34);
      {
        const _nv = rt.writeIdx(s2, rt.V.int(1), rt.V.int(5));
        if (_nv !== null) s2 = _nv;
      }
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("u14 "), f, rt.V.str(" "), h, rt.V.str(" "), s2]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("u15 "), rt.method(f, "slice", [rt.V.int(1), rt.V.int(3)])]));
      rt.frameLine(37);
      rt.method(f, "reverse", []);
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("u15b "), f]));
      rt.frameLine(39);
      rt.method(f, "insert", [rt.V.int(0), rt.V.int(0)]);
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("u16 "), f]));
      rt.frameLine(41);
      rt.method(f, "remove_at", [rt.V.int(0)]);
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("u17 "), f]));
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("u18 "), rt.method(rt.V.str("abc"), "to_ascii_buffer", []), rt.V.str(" "), rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(104), rt.V.int(105)]))]), "get_string_from_ascii", [])]));
      rt.frameLine(44);
      print(rt.showArgs([rt.V.str("u19 "), rt.arrayFromArgs([f]), rt.V.str(" "), rt.wrapValue(rt.index(rt.arrayFromArgs([f]), rt.V.int(0))), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(rt.arrayFromArgs([f]), rt.V.int(0))))]));
      rt.frameLine(45);
      let k = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1)]))]);
      rt.frameLine(46);
      rt.method(k, "append_array", [rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(3)]))])]);
      rt.frameLine(47);
      rt.method(k, "fill", [rt.V.int(4)]);
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("u21 "), k, rt.V.str(" "), rt.method(rt.bytesCtor([]), "size", [])]));
      rt.frameLine(49);
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
