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
      do {
        const __m0 = rt.matchPattern(rt.V.int(3), rt.patConst(rt.abs(rt.V.int((-3)))));
        if (__m0 !== null) {
          rt.frameLine(6);
          print(rt.showArgs([rt.V.str("abs|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(3), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(8);
          print(rt.showArgs([rt.V.str("abs|default")]));
          break;
        }
      } while (false);
      rt.frameLine(9);
      do {
        const __m0 = rt.matchPattern(rt.V.int(1), rt.patConst(rt.gMinI(rt.V.int(1), rt.V.int(2))));
        if (__m0 !== null) {
          rt.frameLine(11);
          print(rt.showArgs([rt.V.str("mini|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(13);
          print(rt.showArgs([rt.V.str("mini|default")]));
          break;
        }
      } while (false);
      rt.frameLine(14);
      do {
        const __m0 = rt.matchPattern(rt.V.int(2), rt.patConst(rt.gMax(rt.V.int(1), rt.V.int(2))));
        if (__m0 !== null) {
          rt.frameLine(16);
          print(rt.showArgs([rt.V.str("max|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(2), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(18);
          print(rt.showArgs([rt.V.str("max|default")]));
          break;
        }
      } while (false);
      rt.frameLine(19);
      do {
        const __m0 = rt.matchPattern(rt.V.int(0), rt.patConst(rt.gSign(rt.V.int(0))));
        if (__m0 !== null) {
          rt.frameLine(21);
          print(rt.showArgs([rt.V.str("sign|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(23);
          print(rt.showArgs([rt.V.str("sign|default")]));
          break;
        }
      } while (false);
      rt.frameLine(24);
      do {
        const __m0 = rt.matchPattern(rt.V.float(2), rt.patConst(rt.sqrt(rt.V.int(4))));
        if (__m0 !== null) {
          rt.frameLine(26);
          print(rt.showArgs([rt.V.str("sqrt|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(2), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(28);
          print(rt.showArgs([rt.V.str("sqrt|default")]));
          break;
        }
      } while (false);
      rt.frameLine(29);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gDegToRad(rt.V.int(0))));
        if (__m0 !== null) {
          rt.frameLine(31);
          print(rt.showArgs([rt.V.str("deg|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(33);
          print(rt.showArgs([rt.V.str("deg|default")]));
          break;
        }
      } while (false);
      rt.frameLine(34);
      do {
        const __m0 = rt.matchPattern(rt.V.int(3), rt.patConst(rt.gSnapped(rt.V.float(2.5), rt.V.int(1))));
        if (__m0 !== null) {
          rt.frameLine(36);
          print(rt.showArgs([rt.V.str("snapped|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(3), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(38);
          print(rt.showArgs([rt.V.str("snapped|default")]));
          break;
        }
      } while (false);
      rt.frameLine(39);
      do {
        const __m0 = rt.matchPattern(rt.V.int(1), rt.patConst(rt.toInt(rt.V.str("1"))));
        if (__m0 !== null) {
          rt.frameLine(41);
          print(rt.showArgs([rt.V.str("int|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(43);
          print(rt.showArgs([rt.V.str("int|default")]));
          break;
        }
      } while (false);
      rt.frameLine(44);
      do {
        const __m0 = rt.matchPattern(rt.V.int(1), rt.patConst(rt.lengthOf(rt.V.str("ab"))));
        if (__m0 !== null) {
          rt.frameLine(46);
          print(rt.showArgs([rt.V.str("len|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(48);
          print(rt.showArgs([rt.V.str("len|default")]));
          break;
        }
      } while (false);
      rt.frameLine(49);
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
