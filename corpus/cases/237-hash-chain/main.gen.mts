// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);

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
      print(rt.showArgs([rt.variantHash([rt.V.int(0)])]));
      rt.frameLine(5);
      print(rt.showArgs([rt.variantHash([rt.V.int(1)])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.variantHash([rt.V.int(7)])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.variantHash([rt.V.int((-1))])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.variantHash([rt.V.int((-7))])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.variantHash([rt.V.int(1000000007)])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.variantHash([rt.V.int(4294967295)])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.variantHash([rt.V.int(4294967296)])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.variantHash([rt.V.bool(true)])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.variantHash([rt.V.bool(false)])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.variantHash([rt.V.nil()])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.variantHash([rt.V.str("a")])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.variantHash([rt.V.str("A")])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.variantHash([rt.V.float(0)])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.variantHash([rt.V.float((-0))])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.variantHash([rt.V.float(1)])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.variantHash([rt.V.float(2.5)])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.variantHash([INF])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "hash", [])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1)])), "hash", [])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), "hash", [])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(1)])), "hash", [])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.float(1)])), "hash", [])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.str("a")])), "hash", [])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.bool(true)])), "hash", [])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.nil()])), "hash", [])]));
      rt.frameLine(30);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))])), "hash", [])]));
      rt.frameLine(31);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(3)]))])), "hash", [])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.variantHash([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))])]));
      rt.frameLine(33);
      print(rt.showArgs([rt.method(rt.dictOf([]), "hash", [])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.method(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), "hash", [])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.method(rt.dictOf([[rt.V.str("b"), rt.V.int(1)]]), "hash", [])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.method(rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]), "hash", [])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.method(rt.dictOf([[rt.V.str("a"), rt.V.str("b")]]), "hash", [])]));
      rt.frameLine(38);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([INF])), "hash", [])]));
      rt.frameLine(39);
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
