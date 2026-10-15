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
      printJoined(" ", [rt.V.str("x"), rt.V.bool(true), rt.V.nil(), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.stringName("sn"), rt.vector2New([rt.V.int(1), rt.V.int(2)])]);
      rt.frameLine(5);
      printJoined(" ", [rt.V.str("a"), rt.V.int(1)]);
      rt.frameLine(6);
      printJoined("\t", [rt.V.str("aa"), rt.V.str("b"), rt.V.int(3)]);
      rt.frameLine(7);
      printJoined("\t", [rt.V.str("solo")]);
      rt.frameLine(8);
      printRaw([rt.V.str("r1")]);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("r2")]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("m1")]));
      rt.frameLine(11);
      printRaw([rt.V.str("m2")]);
      rt.frameLine(12);
      printRaw([rt.V.str("m3")]);
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("m4")]));
      rt.frameLine(14);
      printRaw([rt.V.str("p1")]);
      rt.frameLine(15);
      printJoined(" ", [rt.V.str("p2"), rt.V.str("p3")]);
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("p4")]));
      rt.frameLine(17);
      printRaw([rt.V.str("t1")]);
      rt.frameLine(18);
      printJoined("\t", [rt.V.str("t2"), rt.V.str("t3")]);
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("t4")]));
      rt.frameLine(20);
      printRaw([rt.V.str("z1")]);
      rt.frameLine(21);
      printJoined(" ", []);
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("z2")]));
      rt.frameLine(23);
      printRaw([rt.V.str("z3")]);
      rt.frameLine(24);
      printJoined("\t", []);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("z4")]));
      rt.frameLine(26);
      printRaw([rt.V.str("z5")]);
      rt.frameLine(27);
      printRaw([]);
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("z6")]));
      rt.frameLine(29);
      printRaw([rt.V.str("z7")]);
      rt.frameLine(30);
      printVerbose([]);
      rt.frameLine(31);
      printVerbose([rt.V.str("z8")]);
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("z9")]));
      rt.frameLine(33);
      printRaw([rt.V.str("w1")]);
      rt.frameLine(34);
      print(rt.showArgs([]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("w2")]));
      rt.frameLine(36);
      printRaw([rt.V.str("y1")]);
      rt.frameLine(37);
      printErr([]);
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("y2")]));
      rt.frameLine(39);
      printErr([rt.V.str("e1"), rt.V.int(2), rt.V.bool(true)]);
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("post")]));
      rt.frameLine(41);
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
