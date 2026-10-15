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
      let arr = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.str("p"), rt.V.str("q")])), "String", true);
      rt.frameLine(5);
      let sn = rt.toStringNameSlot(rt.V.stringName("sep"));
      rt.frameLine(6);
      let zn = rt.toStringNameSlot(rt.V.stringName("z"));
      rt.frameLine(7);
      let inner = rt.V.array(rt.GArray.of([rt.V.int(1)]));
      rt.frameLine(8);
      let d = rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]);
      rt.frameLine(9);
      let v2 = rt.toVec2(rt.vector2New([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(10);
      let c = rt.toColor(rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)]));
      rt.frameLine(11);
      let v3 = rt.toVec3(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
      rt.frameLine(12);
      let v2i = rt.toVec2i(rt.vector2iNew([rt.V.int(3), rt.V.int(4)]));
      rt.frameLine(13);
      let fs = rt.V.array(rt.GArray.of([rt.V.float((1 / 3)), rt.V.float(100000000000000000000), rt.V.float((0.1 + 0.2)), rt.V.float((1 / 0)), rt.V.float(((-1) / 0))]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("n1 ["), rt.method(rt.V.str(", "), "join", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("b"), rt.V.str("c")]))]), rt.V.str("]")]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("n2 ["), rt.method(rt.V.str("-"), "join", [rt.V.array(rt.GArray.of([]))]), rt.V.str("] ["), rt.method(rt.V.str("-"), "join", [rt.V.array(rt.GArray.of([rt.V.str("x")]))]), rt.V.str("] ["), rt.method(rt.V.str(""), "join", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("b")]))]), rt.V.str("]")]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("n3 ["), rt.method(rt.V.str(", "), "join", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str(""), rt.V.str("b")]))]), rt.V.str("] ["), rt.method(rt.V.str(", "), "join", [rt.V.array(rt.GArray.of([rt.V.str(""), rt.V.str("")]))]), rt.V.str("]")]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("n4 ["), rt.method(rt.V.str(", "), "join", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))]), rt.V.str("] ["), rt.method(rt.V.str(", "), "join", [rt.V.array(rt.GArray.of([rt.V.bool(true), rt.V.bool(false)]))]), rt.V.str("]")]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("n5 ["), rt.method(rt.V.str(", "), "join", [rt.V.array(rt.GArray.of([rt.V.nil()]))]), rt.V.str("] ["), rt.method(rt.V.str(", "), "join", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.nil()]))]), rt.V.str("]")]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("n6 ["), rt.method(rt.V.str(", "), "join", [rt.V.array(rt.GArray.of([v2, v2i]))]), rt.V.str("]")]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("n7 ["), rt.method(rt.V.str("| "), "join", [rt.V.array(rt.GArray.of([d, v2, c, v3]))]), rt.V.str("]")]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("n8 ["), rt.method(rt.V.str("|"), "join", [arr]), rt.V.str("] ["), rt.method(sn, "join", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("b")]))]), rt.V.str("] ["), rt.method(rt.V.str(", "), "join", [rt.V.array(rt.GArray.of([zn, rt.V.str("y")]))]), rt.V.str("]")]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("n9 ["), rt.method(rt.V.str(", "), "join", [rt.V.array(rt.GArray.of([inner, rt.V.str("a")]))]), rt.V.str("]")]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("n10 ["), rt.method(rt.V.str(", "), "join", [fs]), rt.V.str("]")]));
      rt.frameLine(24);
      let big = rt.V.array(rt.GArray.of([]));
      rt.frameLine(25);
      for (let i of rt.rangeSeq([rt.V.int(200)])) {
        rt.frameLine(26);
        rt.method(big, "append", [rt.V.int(i)]);
      }
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("n11 "), rt.method(rt.method(rt.V.str(","), "join", [big]), "length", [])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("n12 ["), rt.method(rt.V.str(", "), "join", [rt.V.array(rt.GArray.of([]))]), rt.V.str("] ["), rt.method(rt.V.str(", "), "join", [rt.V.array(rt.GArray.of([rt.V.str("only")]))]), rt.V.str("]")]));
      rt.frameLine(29);
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
