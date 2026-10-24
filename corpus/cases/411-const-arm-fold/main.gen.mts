// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare z: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(32);
      this.z = rt.V.int(1);
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

  hit(s: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "hit");
    try {
      rt.frameLine(4);
      do {
        const __m0 = rt.matchPattern(s, rt.patConst(rt.V.int(rt.fast.iAddC(1, 1))));
        if (__m0 !== null) {
          rt.frameLine(6);
          return rt.V.str("A-sum");
          break;
        }
        const __m1 = rt.matchPattern(s, rt.patConst(rt.V.int(rt.fast.iSubC(3, 2))));
        if (__m1 !== null) {
          rt.frameLine(8);
          return rt.V.str("A-sub");
          break;
        }
        const __m2 = rt.matchPattern(s, rt.patConst(rt.V.int(rt.fast.iDivC(4, 2))));
        if (__m2 !== null) {
          rt.frameLine(10);
          return rt.V.str("A-div");
          break;
        }
        const __m3 = rt.matchPattern(s, rt.patConst(rt.V.int(rt.fast.iModC(7, 3))));
        if (__m3 !== null) {
          rt.frameLine(12);
          return rt.V.str("A-mod");
          break;
        }
        const __m4 = rt.matchPattern(s, rt.patConst(rt.ops.pow(rt.V.int(2), rt.V.int(1))));
        if (__m4 !== null) {
          rt.frameLine(14);
          return rt.V.str("A-pow");
          break;
        }
        const __m5 = rt.matchPattern(s, rt.patConst(rt.ops.add(rt.V.float(1.5), rt.V.int(1))));
        if (__m5 !== null) {
          rt.frameLine(16);
          return rt.V.str("A-float");
          break;
        }
        const __m6 = rt.matchPattern(s, rt.patConst(rt.V.bool(!rt.ops.truthy(rt.V.bool(true)))));
        if (__m6 !== null) {
          rt.frameLine(18);
          return rt.V.str("A-not");
          break;
        }
        const __m7 = rt.matchPattern(s, rt.patConst(rt.and(rt.V.bool(true), () => rt.V.bool(false))));
        if (__m7 !== null) {
          rt.frameLine(20);
          return rt.V.str("A-and");
          break;
        }
        const __m8 = rt.matchPattern(s, rt.patConst(rt.or(rt.V.bool(true), () => rt.V.bool(false))));
        if (__m8 !== null) {
          rt.frameLine(22);
          return rt.V.str("A-or");
          break;
        }
        const __m9 = rt.matchPattern(s, rt.patConst(rt.V.str(("a" + "b"))));
        if (__m9 !== null) {
          rt.frameLine(24);
          return rt.V.str("A-str");
          break;
        }
        const __m10 = rt.matchPattern(s, rt.patConst(rt.V.int((-1))));
        if (__m10 !== null) {
          rt.frameLine(26);
          return rt.V.str("A-neg");
          break;
        }
        const __m11 = rt.matchPattern(s, rt.patConst(rt.V.int(rt.fast.iMulC(rt.fast.iAddC(1, 1), 2))));
        if (__m11 !== null) {
          rt.frameLine(28);
          return rt.V.str("A-paren");
          break;
        }
        const __m12 = rt.matchPattern(s, rt.patWild());
        if (__m12 !== null) {
          rt.frameLine(30);
          return rt.V.str("A-none");
          break;
        }
      } while (false);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("V01|"), this.hit(rt.V.int(2))]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("V02|"), this.hit(rt.V.int(1))]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("V03|"), this.hit(rt.V.float(2.5))]));
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("V04|"), this.hit(rt.V.bool(false))]));
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("V05|"), this.hit(rt.V.bool(true))]));
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("V06|"), this.hit(rt.V.str("ab"))]));
      rt.frameLine(41);
      print(rt.showArgs([rt.V.str("V07|"), this.hit(rt.V.int((-1)))]));
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("V08|"), this.hit(rt.V.int(4))]));
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("V09|"), this.hit(rt.V.int(3))]));
      rt.frameLine(44);
      print(rt.showArgs([rt.V.str("V10|"), this.hit(rt.V.int(0))]));
      rt.frameLine(45);
      print(rt.showArgs([rt.V.str("V11|"), this.hit(rt.V.str("xy"))]));
      rt.frameLine(46);
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
      case "hit": return rt.wrapValue(this.hit(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["z"], (o) => { const s = o as Main; return [s.z]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["z"], {}, (o) => { const s = o as Main; return [s.z]; });
rt.registerMethodArities(__gd_d_Main, { "hit": [1, 1], "_initialize": [0, 0] });
rt.registerMethodParams(__gd_d_Main, { "hit": ["Variant"] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
