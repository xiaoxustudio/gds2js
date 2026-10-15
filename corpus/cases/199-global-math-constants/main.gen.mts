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
      print(rt.showArgs([rt.V.str("r1 "), rt.typeOf(PI), rt.V.str(" "), PI, rt.V.str(" "), TAU]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("r2 "), rt.typeOf(INF), rt.V.str(" "), INF, rt.V.str(" "), NAN]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("r3 "), rt.ops.eq(PI, rt.V.float(3.141592653589793)), rt.V.str(" "), rt.ops.eq(PI, rt.V.float(3.14159265358979))]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("r4 "), rt.ops.eq(TAU, rt.ops.mul(PI, rt.V.float(2))), rt.V.str(" "), rt.ops.gt(INF, rt.V.float(1e+308)), rt.V.str(" "), rt.ops.eq(NAN, NAN)]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("r5 "), rt.V.array(rt.GArray.of([PI, TAU, INF, NAN]))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("r6 "), rt.ops.neg(PI), rt.V.str(" "), rt.ops.neg(INF), rt.V.str(" "), rt.ops.sub(INF, INF), rt.V.str(" "), rt.ops.div(rt.V.float(1), INF)]));
      rt.frameLine(10);
      let a = rt.toInt(PI);
      rt.frameLine(11);
      let b = rt.toInt(TAU);
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("r7 "), a, rt.V.str(" "), b]));
      rt.frameLine(13);
      let p = PI;
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("r8 "), rt.typeOf(p), rt.V.str(" "), rt.ops.div(p, rt.V.float(2))]));
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
