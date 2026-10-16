// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const NAN = rt.V.float(Number.NaN);

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

  p(expr: rt.Variant, v: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "p");
    try {
      rt.frameLine(5);
      print(rt.showArgs([expr, rt.V.str(" → "), v, rt.V.str(" (typeof "), rt.typeOf(v), rt.V.str(")")]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(8);
      this.p(rt.V.str("max(1, 2, 3)"), rt.gMax(rt.V.int(1), rt.V.int(2), rt.V.int(3)));
      rt.frameLine(9);
      this.p(rt.V.str("min(1, 2, 3)"), rt.gMin(rt.V.int(1), rt.V.int(2), rt.V.int(3)));
      rt.frameLine(10);
      this.p(rt.V.str("max(1, 5, 3, 9, 2)"), rt.gMax(rt.V.int(1), rt.V.int(5), rt.V.int(3), rt.V.int(9), rt.V.int(2)));
      rt.frameLine(11);
      this.p(rt.V.str("max(1, 2.5, 3)"), rt.gMax(rt.V.int(1), rt.V.float(2.5), rt.V.int(3)));
      rt.frameLine(12);
      this.p(rt.V.str("min(2.5, 2, 3)"), rt.gMin(rt.V.float(2.5), rt.V.int(2), rt.V.int(3)));
      rt.frameLine(13);
      this.p(rt.V.str("max(2, 2, 1)"), rt.gMax(rt.V.int(2), rt.V.int(2), rt.V.int(1)));
      rt.frameLine(14);
      this.p(rt.V.str("max(-1, -2, -3)"), rt.gMax(rt.V.int((-1)), rt.V.int((-2)), rt.V.int((-3))));
      rt.frameLine(15);
      this.p(rt.V.str("min(-1, -2, -3)"), rt.gMin(rt.V.int((-1)), rt.V.int((-2)), rt.V.int((-3))));
      rt.frameLine(16);
      this.p(rt.V.str("max(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)"), rt.gMax(rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4), rt.V.int(5), rt.V.int(6), rt.V.int(7), rt.V.int(8), rt.V.int(9), rt.V.int(10)));
      rt.frameLine(17);
      this.p(rt.V.str("min(10, 9, 8, 7, 6, 5, 4, 3, 2, 1)"), rt.gMin(rt.V.int(10), rt.V.int(9), rt.V.int(8), rt.V.int(7), rt.V.int(6), rt.V.int(5), rt.V.int(4), rt.V.int(3), rt.V.int(2), rt.V.int(1)));
      rt.frameLine(18);
      this.p(rt.V.str("max(max(1, 2), 3)"), rt.gMax(rt.gMax(rt.V.int(1), rt.V.int(2)), rt.V.int(3)));
      rt.frameLine(19);
      this.p(rt.V.str("min(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13)"), rt.gMin(rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4), rt.V.int(5), rt.V.int(6), rt.V.int(7), rt.V.int(8), rt.V.int(9), rt.V.int(10), rt.V.int(11), rt.V.int(12), rt.V.int(13)));
      rt.frameLine(20);
      this.p(rt.V.str("max(1, NAN, 2)"), rt.gMax(rt.V.int(1), NAN, rt.V.int(2)));
      rt.frameLine(21);
      this.p(rt.V.str("max(NAN, 1, 2)"), rt.gMax(NAN, rt.V.int(1), rt.V.int(2)));
      rt.frameLine(22);
      this.p(rt.V.str("max(1, 2, NAN)"), rt.gMax(rt.V.int(1), rt.V.int(2), NAN));
      rt.frameLine(23);
      this.p(rt.V.str("min(1, NAN, 2)"), rt.gMin(rt.V.int(1), NAN, rt.V.int(2)));
      rt.frameLine(24);
      this.p(rt.V.str("min(NAN, 1, 2)"), rt.gMin(NAN, rt.V.int(1), rt.V.int(2)));
      rt.frameLine(25);
      this.p(rt.V.str("min(2, NAN, 1)"), rt.gMin(rt.V.int(2), NAN, rt.V.int(1)));
      rt.frameLine(26);
      this.p(rt.V.str("max(2, 2.0, 2)"), rt.gMax(rt.V.int(2), rt.V.float(2), rt.V.int(2)));
      rt.frameLine(27);
      this.p(rt.V.str("max(2.0, 2, 2.0)"), rt.gMax(rt.V.float(2), rt.V.int(2), rt.V.float(2)));
      rt.frameLine(28);
      this.p(rt.V.str("min(2, 2.0, 2)"), rt.gMin(rt.V.int(2), rt.V.float(2), rt.V.int(2)));
      rt.frameLine(29);
      this.p(rt.V.str("max(0.0, -0.0, 0)"), rt.gMax(rt.V.float(0), rt.V.float((-0)), rt.V.int(0)));
      rt.frameLine(30);
      this.p(rt.V.str("min(-0.0, 0.0, 0)"), rt.gMin(rt.V.float((-0)), rt.V.float(0), rt.V.int(0)));
      rt.frameLine(31);
      this.p(rt.V.str("max(1.5, 2, 3, 4.5)"), rt.gMax(rt.V.float(1.5), rt.V.int(2), rt.V.int(3), rt.V.float(4.5)));
      rt.frameLine(32);
      this.p(rt.V.str("max(1.0, 2.0, 3.0)"), rt.gMax(rt.V.float(1), rt.V.float(2), rt.V.float(3)));
      rt.frameLine(33);
      this.p(rt.V.str("max(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20)"), rt.gMax(rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4), rt.V.int(5), rt.V.int(6), rt.V.int(7), rt.V.int(8), rt.V.int(9), rt.V.int(10), rt.V.int(11), rt.V.int(12), rt.V.int(13), rt.V.int(14), rt.V.int(15), rt.V.int(16), rt.V.int(17), rt.V.int(18), rt.V.int(19), rt.V.int(20)));
      rt.frameLine(34);
      this.p(rt.V.str("min(20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1)"), rt.gMin(rt.V.int(20), rt.V.int(19), rt.V.int(18), rt.V.int(17), rt.V.int(16), rt.V.int(15), rt.V.int(14), rt.V.int(13), rt.V.int(12), rt.V.int(11), rt.V.int(10), rt.V.int(9), rt.V.int(8), rt.V.int(7), rt.V.int(6), rt.V.int(5), rt.V.int(4), rt.V.int(3), rt.V.int(2), rt.V.int(1)));
      rt.frameLine(35);
      this.p(rt.V.str("max(1, 2)"), rt.gMax(rt.V.int(1), rt.V.int(2)));
      rt.frameLine(36);
      this.p(rt.V.str("min(1, 2)"), rt.gMin(rt.V.int(1), rt.V.int(2)));
      rt.frameLine(37);
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
      case "p": return rt.wrapValue(this.p(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "p": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
