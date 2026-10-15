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
      print(rt.showArgs([rt.V.str("k01|"), rt.variantHash([rt.globalCallable("abs")]), rt.V.str("|"), rt.variantHash([rt.globalCallable("sign")]), rt.V.str("|"), rt.variantHash([rt.globalCallable("len")]), rt.V.str("|"), rt.variantHash([rt.globalCallable("str")])]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("k02|"), rt.variantHash([rt.globalCallable("range")]), rt.V.str("|"), rt.variantHash([rt.globalCallable("load")]), rt.V.str("|"), rt.variantHash([rt.globalCallable("print")]), rt.V.str("|"), rt.variantHash([rt.globalCallable("str_to_var")])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("k03|"), rt.variantHash([rt.callableCtor([])]), rt.V.str("|"), rt.ops.eq(rt.variantHash([rt.globalCallable("abs")]), rt.variantHash([rt.callableCtor([rt.globalCallable("abs")])]))]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("k04|"), rt.ops.eq(rt.variantHash([rt.globalCallable("abs")]), rt.variantHash([rt.V.str("abs")])), rt.V.str("|"), rt.ops.eq(rt.variantHash([rt.globalCallable("len")]), rt.variantHash([rt.V.stringName("len")]))]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("k05|"), rt.typeOf(rt.variantHash([rt.globalCallable("abs")])), rt.V.str("|"), rt.ops.gt(rt.variantHash([rt.globalCallable("abs")]), rt.V.int(0)), rt.V.str("|"), rt.ops.eq(rt.variantHash([rt.globalCallable("var_to_str")]), rt.variantHash([rt.V.str("var_to_str")]))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("k06|"), rt.variantHash([rt.globalCallable("type_convert")]), rt.V.str("|"), rt.variantHash([rt.globalCallable("convert")]), rt.V.str("|"), rt.variantHash([rt.globalCallable("floor")]), rt.V.str("|"), rt.variantHash([rt.globalCallable("ceil")])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("k07|"), rt.variantHash([rt.globalCallable("max")]), rt.V.str("|"), rt.variantHash([rt.globalCallable("min")]), rt.V.str("|"), rt.variantHash([rt.globalCallable("sqrt")]), rt.V.str("|"), rt.variantHash([rt.globalCallable("hash")])]));
      rt.frameLine(11);
      let d = rt.dictOf([]);
      rt.frameLine(12);
      {
        const _nv = rt.writeIdx(d, rt.globalCallable("abs"), rt.V.int(1));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(13);
      {
        const _nv = rt.writeIdx(d, rt.globalCallable("str"), rt.V.int(2));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("k08|"), rt.method(d, "size", []), rt.V.str("|"), rt.method(d, "has", [rt.globalCallable("abs")]), rt.V.str("|"), rt.wrapValue(rt.index(d, rt.globalCallable("str")))]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("k09|"), rt.ops.eq(rt.variantHash([rt.globalCallable("abs")]), rt.variantHash([rt.globalCallable("sign")])), rt.V.str("|"), rt.ops.eq(rt.variantHash([rt.globalCallable("str")]), rt.variantHash([rt.globalCallable("str_to_var")]))]));
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
