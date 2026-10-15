// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const State = rt.dictOf([[rt.V.str("IDLE"), rt.V.int(0)], [rt.V.str("RUN"), rt.V.int(4)], [rt.V.str("JUMP"), rt.V.int(5)]]);

export class Main extends SceneTree {
  declare LIMIT: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.LIMIT = rt.V.int(3);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static LIMIT = rt.V.int(3);

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(7);
      do {
        const __m0 = rt.matchPattern(rt.V.int(3), rt.patConst(Main.LIMIT));
        if (__m0 !== null) {
          rt.frameLine(9);
          print(rt.showArgs([rt.V.str("limit")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(3), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(11);
          print(rt.showArgs([rt.V.str("other")]));
          break;
        }
      } while (false);
      rt.frameLine(13);
      do {
        const __m0 = rt.matchPattern(rt.V.int(4), rt.patConst(rt.wrapValue(rt.index(State, rt.V.str("RUN")))));
        if (__m0 !== null) {
          rt.frameLine(15);
          print(rt.showArgs([rt.V.str("run")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(4), rt.patConst(rt.wrapValue(rt.index(State, rt.V.str("IDLE")))));
        if (__m1 !== null) {
          rt.frameLine(17);
          print(rt.showArgs([rt.V.str("idle")]));
          break;
        }
        const __m2 = rt.matchPattern(rt.V.int(4), rt.patWild());
        if (__m2 !== null) {
          rt.frameLine(19);
          print(rt.showArgs([rt.V.str("s-other")]));
          break;
        }
      } while (false);
      rt.frameLine(21);
      do {
        const __m0 = rt.matchPattern(rt.wrapValue(rt.index(State, rt.V.str("JUMP"))), rt.patConst(rt.wrapValue(rt.index(State, rt.V.str("IDLE")))));
        if (__m0 !== null) {
          rt.frameLine(23);
          print(rt.showArgs([rt.V.str("wrong")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.wrapValue(rt.index(State, rt.V.str("JUMP"))), rt.patConst(rt.wrapValue(rt.index(State, rt.V.str("JUMP")))));
        if (__m1 !== null) {
          rt.frameLine(25);
          print(rt.showArgs([rt.V.str("jump")]));
          break;
        }
      } while (false);
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
rt.registerScriptProps(__gd_d_Main, ["LIMIT"], (o) => { const s = o as Main; return [s.LIMIT]; });
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
