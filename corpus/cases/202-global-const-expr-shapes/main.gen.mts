// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);
const PI = rt.V.float(3.141592653589793);
const TAU = rt.V.float(6.283185307179586);

export class Main extends SceneTree {
  declare TWO_PI: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.TWO_PI = rt.ops.mul(PI, rt.V.float(2));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static TWO_PI = rt.ops.mul(PI, rt.V.float(2));

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(6);
      let d = rt.dictOf([[PI, rt.V.int(1)], [INF, rt.V.int(2)], [NAN, rt.V.int(3)]]);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("r1 "), rt.method(d, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(d, PI))]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("r2 "), Main.TWO_PI, rt.V.str(" "), rt.typeOf(Main.TWO_PI)]));
      rt.frameLine(9);
      let arr = rt.stampArray(rt.V.array(rt.GArray.of([PI, TAU])), "float", true);
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("r3 "), arr, rt.V.str(" "), rt.method(arr, "size", [])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("r4 "), rt.ops.add(rt.V.str("pi="), rt.strBuiltin([PI])), rt.V.str(" "), rt.ops.lt(PI, rt.V.float(3.2))]));
      rt.frameLine(12);
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
rt.registerScriptProps(__gd_d_Main, ["TWO_PI"], (o) => { const s = o as Main; return [s.TWO_PI]; });
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
