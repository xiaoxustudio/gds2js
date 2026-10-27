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
      let n = rt.nativeClassNew("Node", 0);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("f01|"), rt.typeOf(n), rt.V.str("|"), rt.typeOf(rt.nativeClassNew("RefCounted", 0)), rt.V.str("|"), rt.typeOf(rt.nativeClassNew("Object", 0)), rt.V.str("|"), rt.typeOf(rt.nativeClassNew("Resource", 0)), rt.V.str("|"), rt.typeOf(rt.nativeClassNew("FileAccess", 0)), rt.V.str("|"), rt.typeOf(rt.nativeClassNew("GDScript", 0))]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("f02|"), rt.ops.eq(n, rt.nativeClassNew("Node", 0)), rt.V.str("|"), rt.ops.eq(n, rt.nativeClassNew("RefCounted", 0)), rt.V.str("|"), rt.ops.eq(rt.nativeClassNew("Node", 0), rt.nativeClassNew("Node", 0))]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("f03|"), rt.method(n, "get_method", []), rt.V.str("|"), rt.method(rt.nativeClassNew("RefCounted", 0), "get_method", []), rt.V.str("|"), rt.method(rt.nativeClassNew("FileAccess", 0), "get_method", [])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("f04|"), rt.method(n, "is_valid", []), rt.V.str("|"), rt.method(rt.nativeClassNew("RefCounted", 0), "is_valid", []), rt.V.str("|"), rt.method(rt.nativeClassNew("Object", 0), "is_valid", [])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("f05|"), rt.method(n, "get_argument_count", []), rt.V.str("|"), rt.method(rt.nativeClassNew("Resource", 0), "get_argument_count", []), rt.V.str("|"), rt.method(rt.nativeClassNew("GDScript", 0), "get_argument_count", [])]));
      rt.frameLine(10);
      let b = rt.method(n, "bind", [rt.V.int(1)]);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("f06|"), rt.method(b, "get_argument_count", []), rt.V.str("|"), rt.method(b, "get_method", []), rt.V.str("|"), rt.method(b, "is_valid", [])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("f07|"), rt.method(n, "is_null", []), rt.V.str("|"), rt.method(rt.nativeClassNew("RefCounted", 0), "is_null", [])]));
      rt.frameLine(13);
      let d = rt.dictOf([[rt.nativeClassNew("Node", 0), rt.V.int(1)]]);
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("f08|"), rt.method(d, "size", []), rt.V.str("|"), rt.method(d, "has", [rt.nativeClassNew("Node", 0)]), rt.V.str("|"), rt.wrapValue(rt.index(d, rt.nativeClassNew("Node", 0)))]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("f09|"), rt.strBuiltin([rt.nativeClassNew("Node", 0)]), rt.V.str("|"), rt.strBuiltin([rt.nativeClassNew("Resource", 0)]), rt.V.str("|"), rt.strBuiltin([rt.nativeClassNew("FileAccess", 0)])]));
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
