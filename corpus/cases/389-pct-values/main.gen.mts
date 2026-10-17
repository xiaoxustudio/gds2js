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
      print(rt.showArgs([rt.V.str("A|"), rt.formatOf(rt.V.str("%d %x %X %o"), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(255), rt.V.int(255), rt.V.int(8)])))]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("B|"), rt.formatOf(rt.V.str("a%c"), rt.V.int(65)), rt.V.str("|"), rt.formatOf(rt.V.str("a%c"), rt.V.str("z")), rt.V.str("|"), rt.formatOf(rt.V.str("a%c"), rt.V.float(65.9)), rt.V.str("|"), rt.formatOf(rt.V.str("a%c"), rt.V.int(1114111))]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("C|"), rt.formatOf(rt.V.str("%5d|%-5d|%05d|"), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(7), rt.V.int((-7))])))]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("D|"), rt.formatOf(rt.V.str("%*d|"), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(7)]))), rt.formatOf(rt.V.str("%*.*f|"), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(3), rt.V.float(1.5)]))), rt.formatOf(rt.V.str("%*d|"), rt.V.array(rt.GArray.of([rt.V.int((-1)), rt.V.int(7)])))]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("E|"), rt.formatOf(rt.V.str("%v"), rt.vector2New([rt.V.int(1), rt.V.int(2)])), rt.V.str("|"), rt.formatOf(rt.V.str("%v"), rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), rt.V.str("|"), rt.formatOf(rt.V.str("%.2v"), rt.vector2New([rt.V.int(1), rt.V.int(2)]))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("F|"), rt.formatOf(rt.V.str("%s"), rt.dictOf([[rt.V.str("k"), rt.V.int(1)]])), rt.V.str("|"), rt.formatOf(rt.V.str("%s"), rt.V.array(rt.GArray.of([rt.V.int(1)]))), rt.V.str("|"), rt.formatOf(rt.V.str("%s"), rt.V.stringName("a")), rt.V.str("|"), rt.formatOf(rt.V.str("%s"), rt.nodePathCtor([rt.V.str("a/b")]))]));
      rt.frameLine(10);
      let f = "%d";
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("G|"), rt.ops.mod(rt.V.str(f), rt.V.int(42)), rt.V.str("|"), rt.ops.mod(rt.V.str(f), rt.V.float((-7.9))), rt.V.str("|"), rt.ops.mod(rt.V.str(f), rt.V.float(1e+30))]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("H|"), rt.formatOf(rt.V.str("100%%"), rt.V.array(rt.GArray.of([]))), rt.V.str("|"), rt.formatOf(rt.V.str("%d%%"), rt.V.int(50))]));
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
