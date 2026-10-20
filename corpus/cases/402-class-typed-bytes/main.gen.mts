// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const TYPE_INT = rt.V.int(2);
const TYPE_OBJECT = rt.V.int(24);
const TYPE_STRING = rt.V.int(4);

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
      let a = rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.nil(), rt.V.nil()])), TYPE_OBJECT, rt.V.stringName("RefCounted"), rt.V.nil()]);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("u1 "), rt.method(rt.gVarToBytes(a), "hex_encode", [])]));
      rt.frameLine(6);
      let b = rt.gBytesToVar(rt.gVarToBytes(a));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("u2 "), b, rt.V.str(" "), rt.method(b, "is_typed", []), rt.V.str(" "), rt.method(b, "get_typed_builtin", []), rt.V.str(" "), rt.method(b, "get_typed_class_name", []), rt.V.str(" "), rt.typeOf(b)]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("u3 "), rt.method(rt.gVarToBytes(rt.arrayFromArgs([rt.V.array(rt.GArray.of([])), TYPE_OBJECT, rt.V.stringName("Node"), rt.V.nil()])), "hex_encode", [])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("u4 "), rt.method(rt.gVarToBytes(rt.arrayFromArgs([rt.V.array(rt.GArray.of([])), TYPE_OBJECT, rt.V.stringName(""), rt.V.nil()])), "hex_encode", [])]));
      rt.frameLine(10);
      let d = rt.dictOf([[rt.V.str("k"), rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.nil()])), TYPE_OBJECT, rt.V.stringName("Resource"), rt.V.nil()])]]);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("u5 "), rt.method(rt.gVarToBytes(d), "hex_encode", [])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("u6 "), rt.method(rt.gVarToBytes(rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.nil()])), TYPE_STRING, rt.V.stringName(""), rt.V.nil()])), "hex_encode", [])]));
      rt.frameLine(13);
      let c = rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.int(1)])), TYPE_OBJECT, rt.V.stringName("RefCounted"), rt.V.nil()]);
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("u7 "), c, rt.V.str(" "), rt.method(c, "is_typed", []), rt.V.str(" "), rt.method(c, "get_typed_class_name", []), rt.V.str(" "), rt.method(rt.gVarToBytes(c), "hex_encode", [])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("u8 "), rt.method(rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), TYPE_INT, rt.V.stringName("Foo"), rt.V.nil()]), "is_typed", []), rt.V.str(" "), rt.arrayFromArgs([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), TYPE_INT, rt.V.stringName("Foo"), rt.V.nil()])]));
      rt.frameLine(16);
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
