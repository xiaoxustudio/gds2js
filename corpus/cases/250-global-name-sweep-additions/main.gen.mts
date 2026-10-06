// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let f = rt.globalCallable("sin");
    print(rt.showArgs([rt.V.str("g01|"), rt.typeOf(f), rt.V.str("|"), rt.method(f, "get_method", []), rt.V.str("|"), rt.method(f, "get_argument_count", []), rt.V.str("|"), rt.strBuiltin([f])]));
    let g = rt.globalCallable("type_exists");
    print(rt.showArgs([rt.V.str("g02|"), rt.typeOf(g), rt.V.str("|"), rt.strBuiltin([g]), rt.V.str("|"), rt.method(g, "get_argument_count", [])]));
    let h = rt.globalCallable("inst_to_dict");
    print(rt.showArgs([rt.V.str("g03|"), rt.strBuiltin([h]), rt.V.str("|"), rt.method(h, "get_argument_count", [])]));
    let w = rt.globalCallable("wrap");
    print(rt.showArgs([rt.V.str("g04|"), rt.strBuiltin([w]), rt.V.str("|"), rt.method(w, "get_argument_count", [])]));
    let r = rt.globalCallable("rid_allocate_id");
    print(rt.showArgs([rt.V.str("g05|"), rt.strBuiltin([r]), rt.V.str("|"), rt.method(r, "get_argument_count", [])]));
    let d = rt.dictOf([[rt.globalCallable("sin"), rt.V.int(1)], [rt.globalCallable("cos"), rt.V.int(2)], [rt.globalCallable("is_instance_valid"), rt.V.int(3)]]);
    print(rt.showArgs([rt.V.str("g06|"), rt.method(d, "size", []), rt.V.str("|"), rt.method(d, "has", [rt.globalCallable("sin")]), rt.V.str("|"), rt.wrapValue(rt.index(d, rt.globalCallable("cos"))), rt.V.str("|"), rt.method(d, "has", [rt.globalCallable("wrap")])]));
    print(rt.showArgs([rt.V.str("g07|"), rt.ops.eq(rt.variantHash([rt.globalCallable("sin")]), rt.variantHash([rt.V.str("sin")])), rt.V.str("|"), rt.ops.eq(rt.variantHash([rt.globalCallable("type_exists")]), rt.variantHash([rt.V.str("type_exists")]))]));
    let arr = rt.V.array(rt.GArray.of([rt.globalCallable("nearest_po2"), rt.globalCallable("error_string"), rt.globalCallable("printerr"), rt.globalCallable("var_to_bytes")]));
    print(rt.showArgs([rt.V.str("g08|"), rt.method(arr, "size", []), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.index(arr, rt.V.int(0)))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.index(arr, rt.V.int(3)))])]));
    print(rt.showArgs([rt.V.str("g09|"), rt.ops.eq(rt.globalCallable("sin"), rt.globalCallable("cos")), rt.V.str("|"), rt.ops.eq(rt.globalCallable("sin"), rt.globalCallable("sin")), rt.V.str("|"), rt.ops.eq(rt.strBuiltin([rt.globalCallable("sin")]), rt.V.str("@GlobalScope::sin"))]));
    print(rt.showArgs([rt.V.str("g10|"), rt.typeOf(rt.globalCallable("atan2")), rt.V.str("|"), rt.strBuiltin([rt.globalCallable("atan2")]), rt.V.str("|"), rt.method(rt.globalCallable("atan2"), "get_argument_count", [])]));
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
