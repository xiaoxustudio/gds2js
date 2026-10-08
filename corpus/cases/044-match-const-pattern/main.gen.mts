// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const State = rt.dictOf([[rt.V.str("IDLE"), rt.V.int(0)], [rt.V.str("RUN"), rt.V.int(4)], [rt.V.str("JUMP"), rt.V.int(5)]]);

export class Main extends SceneTree {
  LIMIT = rt.V.int(3);
  static LIMIT = rt.V.int(3);

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    do {
      const __m0 = rt.matchPattern(rt.V.int(3), rt.patConst(Main.LIMIT));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("limit")]));
        break;
      }
      const __m1 = rt.matchPattern(rt.V.int(3), rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("other")]));
        break;
      }
    } while (false);
    do {
      const __m0 = rt.matchPattern(rt.V.int(4), rt.patConst(rt.wrapValue(rt.index(State, rt.V.str("RUN")))));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("run")]));
        break;
      }
      const __m1 = rt.matchPattern(rt.V.int(4), rt.patConst(rt.wrapValue(rt.index(State, rt.V.str("IDLE")))));
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("idle")]));
        break;
      }
      const __m2 = rt.matchPattern(rt.V.int(4), rt.patWild());
      if (__m2 !== null) {
        print(rt.showArgs([rt.V.str("s-other")]));
        break;
      }
    } while (false);
    do {
      const __m0 = rt.matchPattern(rt.wrapValue(rt.index(State, rt.V.str("JUMP"))), rt.patConst(rt.wrapValue(rt.index(State, rt.V.str("IDLE")))));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("wrong")]));
        break;
      }
      const __m1 = rt.matchPattern(rt.wrapValue(rt.index(State, rt.V.str("JUMP"))), rt.patConst(rt.wrapValue(rt.index(State, rt.V.str("JUMP")))));
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("jump")]));
        break;
      }
    } while (false);
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
