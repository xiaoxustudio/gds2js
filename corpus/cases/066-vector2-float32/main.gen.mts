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
      print(rt.showArgs([rt.vector2New([rt.V.int(4), rt.V.int(6)])]));
      rt.frameLine(5);
      print(rt.showArgs([rt.vector2New([rt.V.float(1.5), rt.V.float(2.25)])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.vector2New([rt.V.float(1.2345678901234567), rt.V.float((0.1 + 0.2))])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.vector2New([rt.V.float((-0)), rt.V.float((-3.7))])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.vector2New([rt.V.float(1.0000000000000002), rt.V.float(1e-8)])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.float(3.5), rt.V.int(4)])]))]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.array(rt.GArray.of([rt.V.float(100000000000000000000), rt.vector2New([rt.V.float(1000000000000000), rt.V.int(2)])]))]));
      rt.frameLine(11);
      print(rt.showArgs([rt.wrapValue(rt.attribute(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(0)]), "x"))]));
      rt.frameLine(12);
      print(rt.showArgs([rt.wrapValue(rt.attribute(rt.vector2New([rt.V.float(0.1), rt.V.int(0)]), "x"))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.wrapValue(rt.attribute(rt.vector2New([rt.V.float(1.2345678901234567), rt.V.int(0)]), "x"))]));
      rt.frameLine(14);
      print(rt.showArgs([rt.ops.eq(rt.wrapValue(rt.attribute(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(0)]), "x")), rt.V.float(1000000000000000))]));
      rt.frameLine(15);
      print(rt.showArgs([rt.ops.eq(rt.vector2New([rt.V.float(0.1), rt.V.int(0)]), rt.vector2New([rt.V.float(0.100000001), rt.V.int(0)]))]));
      rt.frameLine(16);
      print(rt.showArgs([rt.ops.add(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(3), rt.V.int(4)]))]));
      rt.frameLine(17);
      print(rt.showArgs([rt.ops.sub(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(3), rt.V.int(4)]))]));
      rt.frameLine(18);
      print(rt.showArgs([rt.ops.neg(rt.vector2New([rt.V.float(1.5), rt.V.int(2)]))]));
      rt.frameLine(19);
      print(rt.showArgs([rt.ops.mul(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(1)]), rt.V.int(2))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.ops.div(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(4)]), rt.V.int(2))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "length", [])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(0)]), "length", [])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.ops.eq(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.float(1), rt.V.int(2)]))]));
      rt.frameLine(24);
      print(rt.showArgs([rt.ops.neq(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(1), rt.V.int(3)]))]));
      rt.frameLine(25);
      print(rt.showArgs([rt.strBuiltin([rt.vector2New([rt.V.int(2), rt.V.int(3)])])]));
      rt.frameLine(26);
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
