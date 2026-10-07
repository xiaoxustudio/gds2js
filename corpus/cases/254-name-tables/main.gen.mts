// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const TYPE_INT = rt.V.int(2);
const TYPE_NIL = rt.V.int(0);

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    for (let t of rt.rangeSeq([rt.V.int(0), rt.V.int(41)])) {
      print(rt.showArgs([rt.V.str("t|"), rt.V.int(t), rt.V.str("|"), rt.gTypeString(rt.V.int(t)), rt.V.str("|"), rt.typeOf(rt.gTypeString(rt.V.int(t)))]));
    }
    for (let e of rt.rangeSeq([rt.V.int(0), rt.V.int(51)])) {
      print(rt.showArgs([rt.V.str("e|"), rt.V.int(e), rt.V.str("|"), rt.gErrorString(rt.V.int(e)), rt.V.str("|"), rt.typeOf(rt.gErrorString(rt.V.int(e)))]));
    }
    print(rt.showArgs([rt.V.str("e|neg|"), rt.gErrorString(rt.V.int((-1))), rt.V.str("|"), rt.gErrorString(rt.ops.neg(rt.V.int(9223372036854775808n)))]));
    print(rt.showArgs([rt.V.str("e|big|"), rt.gErrorString(rt.V.int(9223372036854775807n)), rt.V.str("|"), rt.gTypeString(rt.V.int(9223372036854775807n))]));
    print(rt.showArgs([rt.V.str("k01|"), rt.gTypeString(TYPE_INT), rt.V.str("|"), rt.gTypeString(TYPE_NIL), rt.V.str("|"), rt.gErrorString(rt.V.int(0)), rt.V.str("|"), rt.gErrorString(rt.V.int(16))]));
    let f = rt.globalCallable("type_string");
    let g = rt.globalCallable("error_string");
    print(rt.showArgs([rt.V.str("k02|"), rt.typeOf(f), rt.V.str("|"), f, rt.V.str("|"), rt.method(f, "get_method", []), rt.V.str("|"), rt.method(f, "get_argument_count", [])]));
    print(rt.showArgs([rt.V.str("k03|"), rt.typeOf(g), rt.V.str("|"), g, rt.V.str("|"), rt.method(g, "get_method", []), rt.V.str("|"), rt.method(g, "get_argument_count", [])]));
    print(rt.showArgs([rt.V.str("k04|"), rt.variantHash([rt.globalCallable("type_string")]), rt.V.str("|"), rt.variantHash([rt.V.str("type_string")]), rt.V.str("|"), rt.ops.eq(rt.globalCallable("type_string"), rt.globalCallable("type_string")), rt.V.str("|"), rt.ops.eq(rt.globalCallable("type_string"), rt.globalCallable("error_string"))]));
    print(rt.showArgs([rt.V.str("k05|"), rt.method(f, "call", [rt.V.int(28)]), rt.V.str("|"), rt.method(g, "call", [rt.V.int(48)])]));
    this.quit();
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
