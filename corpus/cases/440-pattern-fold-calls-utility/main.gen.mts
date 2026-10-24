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
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gAcosh(rt.V.int(1))));
        if (__m0 !== null) {
          rt.frameLine(6);
          print(rt.showArgs([rt.V.str("acosh|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(8);
          print(rt.showArgs([rt.V.str("acosh|def "), rt.gAcosh(rt.V.int(1))]));
          break;
        }
      } while (false);
      rt.frameLine(9);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gAsinh(rt.V.int(0))));
        if (__m0 !== null) {
          rt.frameLine(11);
          print(rt.showArgs([rt.V.str("asinh|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(13);
          print(rt.showArgs([rt.V.str("asinh|def "), rt.gAsinh(rt.V.int(0))]));
          break;
        }
      } while (false);
      rt.frameLine(14);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gAtanh(rt.V.int(0))));
        if (__m0 !== null) {
          rt.frameLine(16);
          print(rt.showArgs([rt.V.str("atanh|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(18);
          print(rt.showArgs([rt.V.str("atanh|def "), rt.gAtanh(rt.V.int(0))]));
          break;
        }
      } while (false);
      rt.frameLine(19);
      do {
        const __m0 = rt.matchPattern(rt.V.float(15), rt.patConst(rt.gRemap(rt.V.float(1), rt.V.float(0), rt.V.float(2), rt.V.float(10), rt.V.float(20))));
        if (__m0 !== null) {
          rt.frameLine(21);
          print(rt.showArgs([rt.V.str("remap|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(15), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(23);
          print(rt.showArgs([rt.V.str("remap|def "), rt.gRemap(rt.V.float(1), rt.V.float(0), rt.V.float(2), rt.V.float(10), rt.V.float(20))]));
          break;
        }
      } while (false);
      rt.frameLine(24);
      do {
        const __m0 = rt.matchPattern(rt.V.float(1), rt.patConst(rt.gFloor(rt.V.float(1.7), "float")));
        if (__m0 !== null) {
          rt.frameLine(26);
          print(rt.showArgs([rt.V.str("floorf|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(28);
          print(rt.showArgs([rt.V.str("floorf|def "), rt.gFloor(rt.V.float(1.7), "float")]));
          break;
        }
      } while (false);
      rt.frameLine(29);
      do {
        const __m0 = rt.matchPattern(rt.V.int(1), rt.patConst(rt.gRound(rt.V.float(1), "int")));
        if (__m0 !== null) {
          rt.frameLine(31);
          print(rt.showArgs([rt.V.str("roundi|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(33);
          print(rt.showArgs([rt.V.str("roundi|def "), rt.gRound(rt.V.float(1), "int")]));
          break;
        }
      } while (false);
      rt.frameLine(34);
      do {
        const __m0 = rt.matchPattern(rt.V.int(3), rt.patConst(rt.gAbsI(rt.V.int((-3)))));
        if (__m0 !== null) {
          rt.frameLine(36);
          print(rt.showArgs([rt.V.str("absi|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(3), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(38);
          print(rt.showArgs([rt.V.str("absi|def "), rt.gAbsI(rt.V.int((-3)))]));
          break;
        }
      } while (false);
      rt.frameLine(39);
      do {
        const __m0 = rt.matchPattern(rt.V.float((-1)), rt.patConst(rt.gSignF(rt.V.float((-2.5)))));
        if (__m0 !== null) {
          rt.frameLine(41);
          print(rt.showArgs([rt.V.str("signf|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float((-1)), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(43);
          print(rt.showArgs([rt.V.str("signf|def "), rt.gSignF(rt.V.float((-2.5)))]));
          break;
        }
      } while (false);
      rt.frameLine(44);
      do {
        const __m0 = rt.matchPattern(rt.V.bool(false), rt.patConst(rt.gIsInf(rt.V.float(1))));
        if (__m0 !== null) {
          rt.frameLine(46);
          print(rt.showArgs([rt.V.str("is_inf|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.bool(false), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(48);
          print(rt.showArgs([rt.V.str("is_inf|def "), rt.gIsInf(rt.V.float(1))]));
          break;
        }
      } while (false);
      rt.frameLine(49);
      do {
        const __m0 = rt.matchPattern(rt.V.bool(false), rt.patConst(rt.gIsZeroApprox(rt.V.float(1))));
        if (__m0 !== null) {
          rt.frameLine(51);
          print(rt.showArgs([rt.V.str("is_zero_approx|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.bool(false), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(53);
          print(rt.showArgs([rt.V.str("is_zero_approx|def "), rt.gIsZeroApprox(rt.V.float(1))]));
          break;
        }
      } while (false);
      rt.frameLine(54);
      do {
        const __m0 = rt.matchPattern(rt.V.int(0), rt.patConst(rt.gStepDecimals(rt.V.float(1))));
        if (__m0 !== null) {
          rt.frameLine(56);
          print(rt.showArgs([rt.V.str("step_decimals|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(58);
          print(rt.showArgs([rt.V.str("step_decimals|def "), rt.gStepDecimals(rt.V.float(1))]));
          break;
        }
      } while (false);
      rt.frameLine(59);
      do {
        const __m0 = rt.matchPattern(rt.V.float(1), rt.patConst(rt.gCubicInTime(rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1))));
        if (__m0 !== null) {
          rt.frameLine(61);
          print(rt.showArgs([rt.V.str("ccit|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(63);
          print(rt.showArgs([rt.V.str("ccit|def "), rt.gCubicInTime(rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1))]));
          break;
        }
      } while (false);
      rt.frameLine(64);
      do {
        const __m0 = rt.matchPattern(rt.V.float(1), rt.patConst(rt.gCubicAngleInTime(rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1))));
        if (__m0 !== null) {
          rt.frameLine(66);
          print(rt.showArgs([rt.V.str("ccait|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(68);
          print(rt.showArgs([rt.V.str("ccait|def "), rt.gCubicAngleInTime(rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1))]));
          break;
        }
      } while (false);
      rt.frameLine(69);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gBezierDerivative(rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1))));
        if (__m0 !== null) {
          rt.frameLine(71);
          print(rt.showArgs([rt.V.str("bezder|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(73);
          print(rt.showArgs([rt.V.str("bezder|def "), rt.gBezierDerivative(rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1), rt.V.float(1))]));
          break;
        }
      } while (false);
      rt.frameLine(74);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gAngleDifference(rt.V.float(1), rt.V.float(1))));
        if (__m0 !== null) {
          rt.frameLine(76);
          print(rt.showArgs([rt.V.str("angdiff|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(78);
          print(rt.showArgs([rt.V.str("angdiff|def "), rt.gAngleDifference(rt.V.float(1), rt.V.float(1))]));
          break;
        }
      } while (false);
      rt.frameLine(79);
      do {
        const __m0 = rt.matchPattern(rt.V.float(1), rt.patConst(rt.gRotateToward(rt.V.float(1), rt.V.float(1), rt.V.float(1))));
        if (__m0 !== null) {
          rt.frameLine(81);
          print(rt.showArgs([rt.V.str("rotw|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(83);
          print(rt.showArgs([rt.V.str("rotw|def "), rt.gRotateToward(rt.V.float(1), rt.V.float(1), rt.V.float(1))]));
          break;
        }
      } while (false);
      rt.frameLine(84);
      do {
        const __m0 = rt.matchPattern(rt.V.int(2), rt.patConst(rt.gClamp(rt.V.int(5), rt.V.int(0), rt.V.int(2), "auto")));
        if (__m0 !== null) {
          rt.frameLine(86);
          print(rt.showArgs([rt.V.str("clamp|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(2), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(88);
          print(rt.showArgs([rt.V.str("clamp|def "), rt.gClamp(rt.V.int(5), rt.V.int(0), rt.V.int(2), "auto")]));
          break;
        }
      } while (false);
      rt.frameLine(89);
      do {
        const __m0 = rt.matchPattern(rt.V.float(2), rt.patConst(rt.gClamp(rt.V.float(5), rt.V.float(0), rt.V.float(2), "float")));
        if (__m0 !== null) {
          rt.frameLine(91);
          print(rt.showArgs([rt.V.str("clampf|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(2), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(93);
          print(rt.showArgs([rt.V.str("clampf|def "), rt.gClamp(rt.V.float(5), rt.V.float(0), rt.V.float(2), "float")]));
          break;
        }
      } while (false);
      rt.frameLine(94);
      do {
        const __m0 = rt.matchPattern(rt.V.int(4), rt.patConst(rt.gNearestPo2(rt.V.int(4))));
        if (__m0 !== null) {
          rt.frameLine(96);
          print(rt.showArgs([rt.V.str("po2|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(4), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(98);
          print(rt.showArgs([rt.V.str("po2|def "), rt.gNearestPo2(rt.V.int(4))]));
          break;
        }
      } while (false);
      rt.frameLine(99);
      do {
        const __m0 = rt.matchPattern(rt.V.float(1), rt.patConst(rt.gPingpong(rt.V.float(1), rt.V.float(2))));
        if (__m0 !== null) {
          rt.frameLine(101);
          print(rt.showArgs([rt.V.str("pp|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(103);
          print(rt.showArgs([rt.V.str("pp|def "), rt.gPingpong(rt.V.float(1), rt.V.float(2))]));
          break;
        }
      } while (false);
      rt.frameLine(104);
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
