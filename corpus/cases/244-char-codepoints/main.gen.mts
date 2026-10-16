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
      print(rt.showArgs([rt.V.str("c01|"), rt.stringChr(rt.V.int(65)), rt.V.str("|"), rt.stringChr(rt.V.int(97)), rt.V.str("|"), rt.stringChr(rt.V.int(233)), rt.V.str("|"), rt.stringChr(rt.V.int(20013))]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("c02|"), rt.method(rt.stringChr(rt.V.int(65)), "length", []), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(233)), "length", []), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(1114111)), "length", [])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("c03|"), rt.method(rt.stringChr(rt.V.int(1)), "unicode_at", [rt.V.int(0)]), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(65)), "unicode_at", [rt.V.int(0)]), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(1114111)), "unicode_at", [rt.V.int(0)])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("c04|"), rt.method(rt.stringChr(rt.V.int(127)), "unicode_at", [rt.V.int(0)]), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(128)), "unicode_at", [rt.V.int(0)]), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(32)), "unicode_at", [rt.V.int(0)])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("c05|"), rt.method(rt.stringChr(rt.V.float(1.5)), "unicode_at", [rt.V.int(0)]), rt.V.str("|"), rt.method(rt.stringChr(rt.V.float(2.9)), "unicode_at", [rt.V.int(0)]), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(1114111)), "unicode_at", [rt.V.int(0)])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("c06|"), rt.ops.eq(rt.stringChr(rt.V.int(65)), rt.V.str("A")), rt.V.str("|"), rt.ops.eq(rt.stringChr(rt.V.int(97)), rt.V.str("a")), rt.V.str("|"), rt.ops.eq(rt.stringChr(rt.V.int(233)), rt.V.str("é"))]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("c07|"), rt.typeOf(rt.stringChr(rt.V.int(65))), rt.V.str("|"), rt.ops.eq(rt.stringStatic("chr", [rt.V.int(65)]), rt.stringChr(rt.V.int(65))), rt.V.str("|"), rt.ops.eq(rt.stringChr(rt.V.int(65)), rt.stringChr(rt.V.int(97)))]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("c08|"), rt.ops.add(rt.ops.add(rt.stringChr(rt.V.int(65)), rt.V.str("/")), rt.stringChr(rt.V.int(97))), rt.V.str("|"), rt.method(rt.ops.add(rt.V.str("x"), rt.stringChr(rt.V.int(1114111))), "length", [])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("c09|"), rt.method(rt.stringChr(rt.V.int(65)), "to_utf8_buffer", []), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(233)), "to_utf8_buffer", []), rt.V.str("|"), rt.method(rt.method(rt.stringChr(rt.V.int(1114111)), "to_utf8_buffer", []), "size", [])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("c10|"), rt.method(rt.stringChr(rt.V.int(10)), "c_escape", []), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(65)), "c_escape", []), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(92)), "c_escape", [])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("c11|"), rt.V.array(rt.GArray.of([rt.stringChr(rt.V.int(65)), rt.stringChr(rt.V.int(97))])), rt.V.str("|"), rt.method(rt.dictOf([[rt.stringChr(rt.V.int(65)), rt.V.int(1)]]), "has", [rt.V.str("A")]), rt.V.str("|"), rt.V.str(rt.varToStr(rt.stringChr(rt.V.int(97))))]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("c12|"), rt.method(rt.stringChr(rt.V.int(65)), "to_upper", []), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(97)), "repeat", [rt.V.int(2)]), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(50)), "to_int", [])]));
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
