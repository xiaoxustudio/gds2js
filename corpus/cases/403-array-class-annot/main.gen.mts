// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const TYPE_OBJECT = rt.V.int(24);

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
      let a = rt.stampClassArray(rt.V.array(rt.GArray.of([])), "RefCounted", true);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("u1 "), a, rt.V.str(" "), rt.method(a, "is_typed", []), rt.V.str(" "), rt.method(a, "get_typed_builtin", []), rt.V.str(" "), rt.method(a, "get_typed_class_name", []), rt.V.str(" "), rt.typeOf(a)]));
      rt.frameLine(6);
      let b = rt.stampClassArray(rt.V.array(rt.GArray.of([])), "Object", true);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("u2 "), rt.method(b, "is_typed", []), rt.V.str(" "), rt.method(b, "get_typed_builtin", []), rt.V.str(" "), rt.method(b, "get_typed_class_name", [])]));
      rt.frameLine(8);
      let c = rt.stampClassArray(rt.V.array(rt.GArray.of([])), "Node", true);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("u3 "), rt.method(c, "is_typed", []), rt.V.str(" "), rt.method(c, "get_typed_builtin", []), rt.V.str(" "), rt.method(c, "get_typed_class_name", []), rt.V.str(" "), rt.method(c, "size", [])]));
      rt.frameLine(10);
      let d = rt.stampClassArray(rt.V.array(rt.GArray.of([])), "RefCounted", true);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("u4 "), d, rt.V.str(" "), rt.method(d, "is_typed", []), rt.V.str(" "), rt.method(d, "size", []), rt.V.str(" "), rt.method(d, "get_typed_builtin", [])]));
      rt.frameLine(12);
      let e = rt.stampClassArray(rt.V.array(rt.GArray.of([rt.V.nil()])), "RefCounted", true);
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("u5 "), e, rt.V.str(" "), rt.method(e, "is_typed", []), rt.V.str(" "), rt.method(e, "size", [])]));
      rt.frameLine(14);
      let f = rt.stampClassArray(rt.V.array(rt.GArray.of([])), "RefCounted", true);
      rt.frameLine(15);
      rt.method(f, "append", [rt.V.nil()]);
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("u6 "), rt.method(f, "size", []), rt.V.str(" "), rt.strBuiltin([f]), rt.V.str(" "), rt.method(f, "is_typed", [])]));
      rt.frameLine(17);
      let m = rt.stampClassArray(rt.arrayFromArgs([rt.V.array(rt.GArray.of([])), TYPE_OBJECT, rt.V.stringName("RefCounted"), rt.V.nil()]), "RefCounted", false);
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("u7 "), rt.method(m, "is_typed", []), rt.V.str(" "), rt.method(m, "get_typed_class_name", []), rt.V.str(" "), rt.method(m, "size", [])]));
      rt.frameLine(19);
      let n = rt.stampClassArray(rt.V.array(rt.GArray.of([])), "RefCounted", true);
      rt.frameLine(20);
      rt.method(n, "append", [rt.V.int(1)]);
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("u8 "), rt.method(n, "size", []), rt.V.str(" "), rt.method(rt.gVarToBytes(n), "hex_encode", [])]));
      rt.frameLine(22);
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
