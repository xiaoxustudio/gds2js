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
      let h = rt.method(rt.nativeClass("HashingContext"), "new", []);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("h1|"), rt.method(h, "start", [rt.wrapValue(rt.attribute(rt.nativeClass("HashingContext"), "HASH_MD5"))]), rt.V.str("|"), rt.method(h, "update", [rt.method(rt.V.str("abc"), "to_utf8_buffer", [])])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("h2|"), rt.method(h, "finish", [])]));
      rt.frameLine(7);
      let s1 = rt.method(rt.nativeClass("HashingContext"), "new", []);
      rt.frameLine(8);
      rt.method(s1, "start", [rt.wrapValue(rt.attribute(rt.nativeClass("HashingContext"), "HASH_SHA1"))]);
      rt.frameLine(9);
      rt.method(s1, "update", [rt.method(rt.V.str("abc"), "to_utf8_buffer", [])]);
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("h3|"), rt.method(s1, "finish", [])]));
      rt.frameLine(11);
      let s2 = rt.method(rt.nativeClass("HashingContext"), "new", []);
      rt.frameLine(12);
      rt.method(s2, "start", [rt.wrapValue(rt.attribute(rt.nativeClass("HashingContext"), "HASH_SHA256"))]);
      rt.frameLine(13);
      rt.method(s2, "update", [rt.method(rt.V.str("ab"), "to_utf8_buffer", [])]);
      rt.frameLine(14);
      rt.method(s2, "update", [rt.method(rt.V.str("c"), "to_utf8_buffer", [])]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("h4|"), rt.method(s2, "finish", [])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("h5|"), rt.wrapValue(rt.attribute(rt.nativeClass("HashingContext"), "HASH_MD5")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("HashingContext"), "HASH_SHA1")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("HashingContext"), "HASH_SHA256"))]));
      rt.frameLine(17);
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
