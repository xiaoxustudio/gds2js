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
      let f = rt.globalCallable("sin");
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("g01|"), rt.typeOf(f), rt.V.str("|"), rt.method(f, "get_method", []), rt.V.str("|"), rt.method(f, "get_argument_count", []), rt.V.str("|"), rt.strBuiltin([f])]));
      rt.frameLine(6);
      let g = rt.globalCallable("type_exists");
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("g02|"), rt.typeOf(g), rt.V.str("|"), rt.strBuiltin([g]), rt.V.str("|"), rt.method(g, "get_argument_count", [])]));
      rt.frameLine(8);
      let h = rt.globalCallable("inst_to_dict");
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("g03|"), rt.strBuiltin([h]), rt.V.str("|"), rt.method(h, "get_argument_count", [])]));
      rt.frameLine(10);
      let w = rt.globalCallable("wrap");
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("g04|"), rt.strBuiltin([w]), rt.V.str("|"), rt.method(w, "get_argument_count", [])]));
      rt.frameLine(12);
      let r = rt.globalCallable("rid_allocate_id");
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("g05|"), rt.strBuiltin([r]), rt.V.str("|"), rt.method(r, "get_argument_count", [])]));
      rt.frameLine(14);
      let d = rt.dictOf([[rt.globalCallable("sin"), rt.V.int(1)], [rt.globalCallable("cos"), rt.V.int(2)], [rt.globalCallable("is_instance_valid"), rt.V.int(3)]]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("g06|"), rt.method(d, "size", []), rt.V.str("|"), rt.method(d, "has", [rt.globalCallable("sin")]), rt.V.str("|"), rt.wrapValue(rt.index(d, rt.globalCallable("cos"))), rt.V.str("|"), rt.method(d, "has", [rt.globalCallable("wrap")])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("g07|"), rt.ops.eq(rt.variantHash([rt.globalCallable("sin")]), rt.variantHash([rt.V.str("sin")])), rt.V.str("|"), rt.ops.eq(rt.variantHash([rt.globalCallable("type_exists")]), rt.variantHash([rt.V.str("type_exists")]))]));
      rt.frameLine(17);
      let arr = rt.V.array(rt.GArray.of([rt.globalCallable("nearest_po2"), rt.globalCallable("error_string"), rt.globalCallable("printerr"), rt.globalCallable("var_to_bytes")]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("g08|"), rt.method(arr, "size", []), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.index(arr, rt.V.int(0)))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.index(arr, rt.V.int(3)))])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("g09|"), rt.ops.eq(rt.globalCallable("sin"), rt.globalCallable("cos")), rt.V.str("|"), rt.ops.eq(rt.globalCallable("sin"), rt.globalCallable("sin")), rt.V.str("|"), rt.ops.eq(rt.strBuiltin([rt.globalCallable("sin")]), rt.V.str("@GlobalScope::sin"))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("g10|"), rt.typeOf(rt.globalCallable("atan2")), rt.V.str("|"), rt.strBuiltin([rt.globalCallable("atan2")]), rt.V.str("|"), rt.method(rt.globalCallable("atan2"), "get_argument_count", [])]));
      rt.frameLine(21);
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
