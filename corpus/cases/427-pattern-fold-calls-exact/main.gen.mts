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
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gLinearToDb(rt.V.float(1))));
        if (__m0 !== null) {
          rt.frameLine(6);
          print(rt.showArgs([rt.V.str("l2db|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(8);
          print(rt.showArgs([rt.V.str("l2db|default")]));
          break;
        }
      } while (false);
      rt.frameLine(9);
      do {
        const __m0 = rt.matchPattern(rt.V.float(1), rt.patConst(rt.gEase(rt.V.float(1), rt.V.float(0.5))));
        if (__m0 !== null) {
          rt.frameLine(11);
          print(rt.showArgs([rt.V.str("ease|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(13);
          print(rt.showArgs([rt.V.str("ease|default")]));
          break;
        }
      } while (false);
      rt.frameLine(14);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gBezierInterpolate(rt.V.float(0), rt.V.float(1), rt.V.float(2), rt.V.float(3), rt.V.float(0))));
        if (__m0 !== null) {
          rt.frameLine(16);
          print(rt.showArgs([rt.V.str("bezier|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(18);
          print(rt.showArgs([rt.V.str("bezier|default")]));
          break;
        }
      } while (false);
      rt.frameLine(19);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gCubic(rt.V.float(0), rt.V.float(1), rt.V.float(2), rt.V.float(3), rt.V.float(0))));
        if (__m0 !== null) {
          rt.frameLine(21);
          print(rt.showArgs([rt.V.str("cubic|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(23);
          print(rt.showArgs([rt.V.str("cubic|default")]));
          break;
        }
      } while (false);
      rt.frameLine(24);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gCubicAngle(rt.V.float(0), rt.V.float(90), rt.V.float(180), rt.V.float(270), rt.V.float(0))));
        if (__m0 !== null) {
          rt.frameLine(26);
          print(rt.showArgs([rt.V.str("cubica|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(28);
          print(rt.showArgs([rt.V.str("cubica|default")]));
          break;
        }
      } while (false);
      rt.frameLine(29);
      do {
        const __m0 = rt.matchPattern(rt.V.float(1), rt.patConst(rt.toFloat(rt.V.str("1"))));
        if (__m0 !== null) {
          rt.frameLine(31);
          print(rt.showArgs([rt.V.str("float|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(33);
          print(rt.showArgs([rt.V.str("float|default")]));
          break;
        }
      } while (false);
      rt.frameLine(34);
      do {
        const __m0 = rt.matchPattern(rt.V.float(2.5), rt.patConst(rt.gFmod(rt.V.float(5.5), rt.V.float(3))));
        if (__m0 !== null) {
          rt.frameLine(36);
          print(rt.showArgs([rt.V.str("fmod|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(2.5), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(38);
          print(rt.showArgs([rt.V.str("fmod|default")]));
          break;
        }
      } while (false);
      rt.frameLine(39);
      do {
        const __m0 = rt.matchPattern(rt.V.float(2), rt.patConst(rt.gCeil(rt.V.float(1.2), "float")));
        if (__m0 !== null) {
          rt.frameLine(41);
          print(rt.showArgs([rt.V.str("ceilf|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(2), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(43);
          print(rt.showArgs([rt.V.str("ceilf|default")]));
          break;
        }
      } while (false);
      rt.frameLine(44);
      do {
        const __m0 = rt.matchPattern(rt.V.int(1), rt.patConst(rt.gFloor(rt.V.float(1.7), "int")));
        if (__m0 !== null) {
          rt.frameLine(46);
          print(rt.showArgs([rt.V.str("floori|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(48);
          print(rt.showArgs([rt.V.str("floori|default")]));
          break;
        }
      } while (false);
      rt.frameLine(49);
      do {
        const __m0 = rt.matchPattern(rt.V.int(2), rt.patConst(rt.gCeil(rt.V.float(1.2), "int")));
        if (__m0 !== null) {
          rt.frameLine(51);
          print(rt.showArgs([rt.V.str("ceili|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(2), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(53);
          print(rt.showArgs([rt.V.str("ceili|default")]));
          break;
        }
      } while (false);
      rt.frameLine(54);
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
