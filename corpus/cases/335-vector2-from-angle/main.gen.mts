// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);
const PI = rt.V.float(3.141592653589793);
const TAU = rt.V.float(6.283185307179586);

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("FA|0||"), rt.vector2Const("from_angle", [rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("FA|0.5||"), rt.vector2Const("from_angle", [rt.V.float(0.5)])]));
    print(rt.showArgs([rt.V.str("FA|1||"), rt.vector2Const("from_angle", [rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("FA|2||"), rt.vector2Const("from_angle", [rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("FA|3||"), rt.vector2Const("from_angle", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("FA|-0.5||"), rt.vector2Const("from_angle", [rt.V.float((-0.5))])]));
    print(rt.showArgs([rt.V.str("FA|-1||"), rt.vector2Const("from_angle", [rt.V.int((-1))])]));
    print(rt.showArgs([rt.V.str("FA|-3.14159265358979||"), rt.vector2Const("from_angle", [rt.V.float((-3.14159265358979))])]));
    print(rt.showArgs([rt.V.str("FA|PI||"), rt.vector2Const("from_angle", [PI])]));
    print(rt.showArgs([rt.V.str("FA|TAU||"), rt.vector2Const("from_angle", [TAU])]));
    print(rt.showArgs([rt.V.str("FA|PI / 2||"), rt.vector2Const("from_angle", [rt.ops.div(PI, rt.V.int(2))])]));
    print(rt.showArgs([rt.V.str("FA|-PI / 2||"), rt.vector2Const("from_angle", [rt.ops.div(rt.ops.neg(PI), rt.V.int(2))])]));
    print(rt.showArgs([rt.V.str("FA|PI / 4||"), rt.vector2Const("from_angle", [rt.ops.div(PI, rt.V.int(4))])]));
    print(rt.showArgs([rt.V.str("FA|PI / 3||"), rt.vector2Const("from_angle", [rt.ops.div(PI, rt.V.int(3))])]));
    print(rt.showArgs([rt.V.str("FA|PI / 6||"), rt.vector2Const("from_angle", [rt.ops.div(PI, rt.V.int(6))])]));
    print(rt.showArgs([rt.V.str("FA|0.1||"), rt.vector2Const("from_angle", [rt.V.float(0.1)])]));
    print(rt.showArgs([rt.V.str("FA|0.2||"), rt.vector2Const("from_angle", [rt.V.float(0.2)])]));
    print(rt.showArgs([rt.V.str("FA|0.7||"), rt.vector2Const("from_angle", [rt.V.float(0.7)])]));
    print(rt.showArgs([rt.V.str("FA|1.5||"), rt.vector2Const("from_angle", [rt.V.float(1.5)])]));
    print(rt.showArgs([rt.V.str("FA|2.5||"), rt.vector2Const("from_angle", [rt.V.float(2.5)])]));
    print(rt.showArgs([rt.V.str("FA|10||"), rt.vector2Const("from_angle", [rt.V.int(10)])]));
    print(rt.showArgs([rt.V.str("FA|100||"), rt.vector2Const("from_angle", [rt.V.int(100)])]));
    print(rt.showArgs([rt.V.str("FA|1000||"), rt.vector2Const("from_angle", [rt.V.int(1000)])]));
    print(rt.showArgs([rt.V.str("FA|100000||"), rt.vector2Const("from_angle", [rt.V.int(100000)])]));
    print(rt.showArgs([rt.V.str("FA|1000000||"), rt.vector2Const("from_angle", [rt.V.int(1000000)])]));
    print(rt.showArgs([rt.V.str("FA|100000000||"), rt.vector2Const("from_angle", [rt.V.int(100000000)])]));
    print(rt.showArgs([rt.V.str("FA|1000000000||"), rt.vector2Const("from_angle", [rt.V.int(1000000000)])]));
    print(rt.showArgs([rt.V.str("FA|1000000000000||"), rt.vector2Const("from_angle", [rt.V.int(1000000000000)])]));
    print(rt.showArgs([rt.V.str("FA|-1000||"), rt.vector2Const("from_angle", [rt.V.int((-1000))])]));
    print(rt.showArgs([rt.V.str("FA|-1e9||"), rt.vector2Const("from_angle", [rt.V.float((-1000000000))])]));
    print(rt.showArgs([rt.V.str("FA|NAN||"), rt.vector2Const("from_angle", [NAN])]));
    print(rt.showArgs([rt.V.str("FA|INF||"), rt.vector2Const("from_angle", [INF])]));
    print(rt.showArgs([rt.V.str("FA|-INF||"), rt.vector2Const("from_angle", [rt.ops.neg(INF)])]));
    print(rt.showArgs([rt.V.str("FA|0.000001||"), rt.vector2Const("from_angle", [rt.V.float(0.000001)])]));
    print(rt.showArgs([rt.V.str("FA|1e-9||"), rt.vector2Const("from_angle", [rt.V.float(1e-9)])]));
    print(rt.showArgs([rt.V.str("FA|0.1 + 0.2||"), rt.vector2Const("from_angle", [rt.V.float((0.1 + 0.2))])]));
    print(rt.showArgs([rt.V.str("FB|inst||"), rt.method(rt.vector2New([rt.V.int(7), rt.V.int((-3))]), "from_angle", [rt.V.float(0.5)])]));
    print(rt.showArgs([rt.V.str("FB|typed||"), rt.vector2Const("from_angle", [rt.V.float(3.9269908169872414)])]));
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
