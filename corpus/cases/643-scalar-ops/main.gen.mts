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
      let q = rt.quaternionNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]);
      rt.frameLine(5);
      let r = rt.quaternionNew([rt.V.float(0.5), rt.V.int((-1)), rt.V.int(2), rt.V.float(0.25)]);
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("q1|"), rt.ops.add(q, r), rt.V.str("|"), rt.ops.sub(q, r), rt.V.str("|"), rt.ops.neg(q)]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("q2|"), rt.ops.mul(q, rt.V.int(2)), rt.V.str("|"), rt.ops.mul(rt.V.int(2), q), rt.V.str("|"), rt.ops.mul(q, rt.V.float(0.5)), rt.V.str("|"), rt.ops.div(q, rt.V.int(2)), rt.V.str("|"), rt.ops.div(q, rt.V.float(0.5))]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("b1|"), rt.ops.div(rt.basisNew([rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.V.float(0.5)]), rt.V.int(2)), rt.V.str("|"), rt.ops.div(rt.basisNew([rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(0.25)]), rt.V.float(2.5))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("t1|"), rt.ops.mul(rt.transform2dNew([rt.V.float(0.5), rt.vector2New([rt.V.int(1), rt.V.int(2)])]), rt.V.int(2)), rt.V.str("|"), rt.ops.div(rt.transform2dNew([rt.V.float(0.5), rt.vector2New([rt.V.int(1), rt.V.int(2)])]), rt.V.int(2))]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("t2|"), rt.ops.mul(rt.transform3dNew([rt.basisNew([rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.V.float(0.5)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]), rt.V.int(2))]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("t3|"), rt.ops.div(rt.transform3dNew([rt.basisNew([rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.V.float(0.5)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]), rt.V.int(2))]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("u1|"), rt.ops.pos(rt.vector2New([rt.V.int(1), rt.V.int(2)])), rt.V.str("|"), rt.ops.pos(rt.vector2iNew([rt.V.int(1), rt.V.int(2)])), rt.V.str("|"), rt.ops.pos(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), rt.V.str("|"), rt.ops.pos(rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("u2|"), rt.ops.pos(rt.vector4New([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)])), rt.V.str("|"), rt.ops.pos(rt.vector4iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)])), rt.V.str("|"), rt.ops.pos(rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]))]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("u3|"), rt.ops.pos(rt.planeNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)])), rt.V.str("|"), rt.ops.pos(rt.quaternionNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]))]));
      rt.frameLine(15);
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
