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
      let b = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(104), rt.V.int(101), rt.V.int(108), rt.V.int(108), rt.V.int(111)]))]);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("Y1|"), rt.wrapValue(rt.attribute(b, "hex_encode")), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(b, "hex_encode")), "call", [])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("Y2|"), rt.wrapValue(rt.attribute(b, "get_string_from_utf8")), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(b, "get_string_from_utf8")), "call", [])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("Y3|"), rt.wrapValue(rt.attribute(b, "compress")), rt.V.str(" "), rt.wrapValue(rt.attribute(b, "decompress")), rt.V.str(" "), rt.wrapValue(rt.attribute(b, "get_string_from_utf16")), rt.V.str(" "), rt.wrapValue(rt.attribute(b, "get_string_from_wchar"))]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("Y4|"), rt.wrapValue(rt.attribute(b, "to_int32_array")), rt.V.str(" "), rt.wrapValue(rt.attribute(b, "to_int64_array")), rt.V.str(" "), rt.wrapValue(rt.attribute(b, "to_float32_array")), rt.V.str(" "), rt.wrapValue(rt.attribute(b, "to_float64_array"))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("Y5|"), rt.wrapValue(rt.attribute(b, "get_string_from_ascii")), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(b, "get_string_from_ascii")), "call", [])]));
      rt.frameLine(10);
      let f = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(0)]))]);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("Y6|"), rt.method(rt.wrapValue(rt.attribute(f, "to_int32_array")), "call", [])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("Y7|"), rt.method(rt.wrapValue(rt.attribute(b, "hex_encode")), "get_argument_count", []), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(b, "compress")), "get_argument_count", []), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(b, "decompress")), "get_argument_count", [])]));
      rt.frameLine(13);
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
