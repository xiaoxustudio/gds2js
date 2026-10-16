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
      let a = rt.V.array(rt.GArray.of([rt.V.int(rt.fast.iAddC(1, 2)), rt.V.int(3)]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("A|"), a]));
      rt.frameLine(8);
      let d = rt.dictOf([[rt.V.str("x"), rt.V.int(1)], [rt.V.str("y"), rt.V.int(3)]]);
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("D|"), d]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("C|"), rt.strBuiltin([rt.V.int(1), rt.V.int(2)])]));
      rt.frameLine(18);
      let p = rt.fast.iMulC(rt.fast.iAddC(1, 2), rt.fast.iAddC(3, 4));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("P|"), rt.V.int(p)]));
      rt.frameLine(22);
      let s: number[] = [7, 8, 9];
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("S|"), rt.V.int(rt.fast.rawArrGetNum(s, rt.fast.iSubC(2, 1)))]));
      rt.frameLine(27);
      let b = rt.V.bool(true);
      rt.frameLine(28);
      if (rt.ops.truthy(rt.and(b, () => rt.V.bool(true)))) {
        rt.frameLine(32);
        print(rt.showArgs([rt.V.str("I|"), rt.V.int(1)]));
      }
      rt.frameLine(33);
      let n = 0;
      rt.frameLine(34);
      while ((n < 2)) {
        rt.frameLine(38);
        n = rt.fast.iAddC(n, 1);
      }
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("W|"), rt.V.int(n)]));
      rt.frameLine(40);
      for (let i of rt.iter(rt.V.array(rt.GArray.of([rt.V.int(10), rt.V.int(20)])))) {
        rt.frameLine(44);
        print(rt.showArgs([rt.V.str("F|"), i]));
      }
      rt.frameLine(45);
      let m = 8;
      rt.frameLine(46);
      m = rt.fast.iAddC(m, 2);
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("MA|"), rt.V.int(m)]));
      rt.frameLine(49);
      do {
        const __m0 = rt.matchPattern(rt.V.int(1), rt.patLit(rt.V.int(1)));
        if (__m0 !== null) {
          rt.frameLine(52);
          print(rt.showArgs([rt.V.str("M1|"), rt.V.int(1)]));
          break;
        }
      } while (false);
      rt.frameLine(53);
      do {
        const __m0 = rt.matchPattern(rt.V.int(1), rt.patLit(rt.V.int(1)));
        if (__m0 !== null && rt.ops.truthy(rt.V.bool(true))) {
          rt.frameLine(57);
          print(rt.showArgs([rt.V.str("M2|"), rt.V.int(2)]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(59);
          print(rt.showArgs([rt.V.str("M3|"), rt.V.int(3)]));
          break;
        }
      } while (false);
      rt.frameLine(60);
      for (let i of rt.iter(rt.V.int(5))) {
        rt.frameLine(63);
        print(rt.showArgs([rt.V.str("FI|"), i]));
      }
      rt.frameLine(64);
      do {
        const __m0 = rt.matchPattern(rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.patArray([rt.patLit(rt.V.int(1))]));
        if (__m0 !== null) {
          rt.frameLine(67);
          print(rt.showArgs([rt.V.str("AA|"), rt.V.int(1)]));
          break;
        }
      } while (false);
      rt.frameLine(68);
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
