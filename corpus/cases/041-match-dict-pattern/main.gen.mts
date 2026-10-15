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
      let d = rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.str("two")]]);
      rt.frameLine(5);
      do {
        const __m0 = rt.matchPattern(d, rt.patDict([[rt.V.str("a"), rt.patLit(rt.V.int(1))], [rt.V.str("b"), rt.patLit(rt.V.str("two"))]]));
        if (__m0 !== null) {
          rt.frameLine(7);
          print(rt.showArgs([rt.V.str("exact")]));
          break;
        }
        const __m1 = rt.matchPattern(d, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(9);
          print(rt.showArgs([rt.V.str("other")]));
          break;
        }
      } while (false);
      rt.frameLine(11);
      let e = rt.dictOf([[rt.V.str("x"), rt.V.int(10)], [rt.V.str("y"), rt.V.int(20)]]);
      rt.frameLine(12);
      do {
        const __m0 = rt.matchPattern(e, rt.patDict([[rt.V.str("x"), rt.patLit(rt.V.int(10))], [rt.V.str("y"), rt.patLit(rt.V.int(99))]]));
        if (__m0 !== null) {
          rt.frameLine(14);
          print(rt.showArgs([rt.V.str("wrong-val")]));
          break;
        }
        const __m1 = rt.matchPattern(e, rt.patDict([[rt.V.str("x"), rt.patWild()], [rt.V.str("y"), rt.patLit(rt.V.int(20))]]));
        if (__m1 !== null) {
          rt.frameLine(16);
          print(rt.showArgs([rt.V.str("wild-x")]));
          break;
        }
        const __m2 = rt.matchPattern(e, rt.patWild());
        if (__m2 !== null) {
          rt.frameLine(18);
          print(rt.showArgs([rt.V.str("e-fallback")]));
          break;
        }
      } while (false);
      rt.frameLine(20);
      let n = rt.dictOf([[rt.V.str("p"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]]);
      rt.frameLine(21);
      do {
        const __m0 = rt.matchPattern(n, rt.patDict([[rt.V.str("p"), rt.patArray([rt.patLit(rt.V.int(1)), rt.patLit(rt.V.int(2))])]]));
        if (__m0 !== null) {
          rt.frameLine(23);
          print(rt.showArgs([rt.V.str("nested-arr")]));
          break;
        }
      } while (false);
      rt.frameLine(25);
      let big = rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)], [rt.V.str("c"), rt.V.int(3)]]);
      rt.frameLine(26);
      do {
        const __m0 = rt.matchPattern(big, rt.patDict([[rt.V.str("a"), rt.patLit(rt.V.int(1))], [rt.V.str("b"), rt.patLit(rt.V.int(2))]]));
        if (__m0 !== null) {
          rt.frameLine(28);
          print(rt.showArgs([rt.V.str("subset-should-not-run")]));
          break;
        }
        const __m1 = rt.matchPattern(big, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(30);
          print(rt.showArgs([rt.V.str("exact-only")]));
          break;
        }
      } while (false);
      rt.frameLine(31);
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
