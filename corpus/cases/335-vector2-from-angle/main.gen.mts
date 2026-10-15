// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);
const PI = rt.V.float(3.141592653589793);
const TAU = rt.V.float(6.283185307179586);

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
      print(rt.showArgs([rt.V.str("FA|0||"), rt.vector2Const("from_angle", [rt.V.int(0)])]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("FA|0.5||"), rt.vector2Const("from_angle", [rt.V.float(0.5)])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("FA|1||"), rt.vector2Const("from_angle", [rt.V.int(1)])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("FA|2||"), rt.vector2Const("from_angle", [rt.V.int(2)])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("FA|3||"), rt.vector2Const("from_angle", [rt.V.int(3)])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("FA|-0.5||"), rt.vector2Const("from_angle", [rt.V.float((-0.5))])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("FA|-1||"), rt.vector2Const("from_angle", [rt.V.int((-1))])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("FA|-3.14159265358979||"), rt.vector2Const("from_angle", [rt.V.float((-3.14159265358979))])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("FA|PI||"), rt.vector2Const("from_angle", [PI])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("FA|TAU||"), rt.vector2Const("from_angle", [TAU])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("FA|PI / 2||"), rt.vector2Const("from_angle", [rt.ops.div(PI, rt.V.int(2))])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("FA|-PI / 2||"), rt.vector2Const("from_angle", [rt.ops.div(rt.ops.neg(PI), rt.V.int(2))])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("FA|PI / 4||"), rt.vector2Const("from_angle", [rt.ops.div(PI, rt.V.int(4))])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("FA|PI / 3||"), rt.vector2Const("from_angle", [rt.ops.div(PI, rt.V.int(3))])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("FA|PI / 6||"), rt.vector2Const("from_angle", [rt.ops.div(PI, rt.V.int(6))])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("FA|0.1||"), rt.vector2Const("from_angle", [rt.V.float(0.1)])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("FA|0.2||"), rt.vector2Const("from_angle", [rt.V.float(0.2)])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("FA|0.7||"), rt.vector2Const("from_angle", [rt.V.float(0.7)])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("FA|1.5||"), rt.vector2Const("from_angle", [rt.V.float(1.5)])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("FA|2.5||"), rt.vector2Const("from_angle", [rt.V.float(2.5)])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("FA|10||"), rt.vector2Const("from_angle", [rt.V.int(10)])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("FA|100||"), rt.vector2Const("from_angle", [rt.V.int(100)])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("FA|1000||"), rt.vector2Const("from_angle", [rt.V.int(1000)])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("FA|100000||"), rt.vector2Const("from_angle", [rt.V.int(100000)])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("FA|1000000||"), rt.vector2Const("from_angle", [rt.V.int(1000000)])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("FA|100000000||"), rt.vector2Const("from_angle", [rt.V.int(100000000)])]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("FA|1000000000||"), rt.vector2Const("from_angle", [rt.V.int(1000000000)])]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("FA|1000000000000||"), rt.vector2Const("from_angle", [rt.V.int(1000000000000)])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("FA|-1000||"), rt.vector2Const("from_angle", [rt.V.int((-1000))])]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("FA|-1e9||"), rt.vector2Const("from_angle", [rt.V.float((-1000000000))])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("FA|NAN||"), rt.vector2Const("from_angle", [NAN])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("FA|INF||"), rt.vector2Const("from_angle", [INF])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("FA|-INF||"), rt.vector2Const("from_angle", [rt.ops.neg(INF)])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("FA|0.000001||"), rt.vector2Const("from_angle", [rt.V.float(0.000001)])]));
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("FA|1e-9||"), rt.vector2Const("from_angle", [rt.V.float(1e-9)])]));
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("FA|0.1 + 0.2||"), rt.vector2Const("from_angle", [rt.V.float((0.1 + 0.2))])]));
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("FB|inst||"), rt.method(rt.vector2New([rt.V.int(7), rt.V.int((-3))]), "from_angle", [rt.V.float(0.5)])]));
      rt.frameLine(41);
      print(rt.showArgs([rt.V.str("FB|typed||"), rt.vector2Const("from_angle", [rt.V.float(3.9269908169872414)])]));
      rt.frameLine(42);
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
