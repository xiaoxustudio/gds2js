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
      rt.frameLine(3);
      do {
        const __m0 = rt.matchPattern(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.patArray([rt.patLit(rt.V.int(1)), rt.patBind()]));
        if (__m0 !== null) {
          const v = __m0[0] as rt.Variant;
          rt.frameLine(5);
          print(rt.showArgs([v]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(7);
          print(rt.showArgs([rt.V.str("none")]));
          break;
        }
      } while (false);
      rt.frameLine(8);
      do {
        const __m0 = rt.matchPattern(rt.V.int(3), rt.patLit(rt.V.int(1)));
        if (__m0 !== null) {
          rt.frameLine(10);
          print(rt.showArgs([rt.V.str("one-or-two")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(3), rt.patLit(rt.V.int(2)));
        if (__m1 !== null) {
          rt.frameLine(10);
          print(rt.showArgs([rt.V.str("one-or-two")]));
          break;
        }
        const __m2 = rt.matchPattern(rt.V.int(3), rt.patLit(rt.V.int(3)));
        if (__m2 !== null) {
          rt.frameLine(12);
          print(rt.showArgs([rt.V.str("three")]));
          break;
        }
      } while (false);
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
