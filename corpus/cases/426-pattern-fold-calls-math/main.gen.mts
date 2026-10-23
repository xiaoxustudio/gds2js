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
        const __m0 = rt.matchPattern(rt.V.float(8), rt.patConst(rt.gPow(rt.V.int(2), rt.V.int(3))));
        if (__m0 !== null) {
          rt.frameLine(6);
          print(rt.showArgs([rt.V.str("pow|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(8), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(8);
          print(rt.showArgs([rt.V.str("pow|default")]));
          break;
        }
      } while (false);
      rt.frameLine(9);
      do {
        const __m0 = rt.matchPattern(rt.V.float(1), rt.patConst(rt.gExp(rt.V.int(0))));
        if (__m0 !== null) {
          rt.frameLine(11);
          print(rt.showArgs([rt.V.str("exp|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(13);
          print(rt.showArgs([rt.V.str("exp|default")]));
          break;
        }
      } while (false);
      rt.frameLine(14);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gLog(rt.V.int(1))));
        if (__m0 !== null) {
          rt.frameLine(16);
          print(rt.showArgs([rt.V.str("log|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(18);
          print(rt.showArgs([rt.V.str("log|default")]));
          break;
        }
      } while (false);
      rt.frameLine(19);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gSin(rt.V.int(0))));
        if (__m0 !== null) {
          rt.frameLine(21);
          print(rt.showArgs([rt.V.str("sin|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(23);
          print(rt.showArgs([rt.V.str("sin|default")]));
          break;
        }
      } while (false);
      rt.frameLine(24);
      do {
        const __m0 = rt.matchPattern(rt.V.float(1), rt.patConst(rt.gCos(rt.V.int(0))));
        if (__m0 !== null) {
          rt.frameLine(26);
          print(rt.showArgs([rt.V.str("cos|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(28);
          print(rt.showArgs([rt.V.str("cos|default")]));
          break;
        }
      } while (false);
      rt.frameLine(29);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gTan(rt.V.int(0))));
        if (__m0 !== null) {
          rt.frameLine(31);
          print(rt.showArgs([rt.V.str("tan|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(33);
          print(rt.showArgs([rt.V.str("tan|default")]));
          break;
        }
      } while (false);
      rt.frameLine(34);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gSinh(rt.V.int(0))));
        if (__m0 !== null) {
          rt.frameLine(36);
          print(rt.showArgs([rt.V.str("sinh|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(38);
          print(rt.showArgs([rt.V.str("sinh|default")]));
          break;
        }
      } while (false);
      rt.frameLine(39);
      do {
        const __m0 = rt.matchPattern(rt.V.float(1), rt.patConst(rt.gCosh(rt.V.int(0))));
        if (__m0 !== null) {
          rt.frameLine(41);
          print(rt.showArgs([rt.V.str("cosh|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(43);
          print(rt.showArgs([rt.V.str("cosh|default")]));
          break;
        }
      } while (false);
      rt.frameLine(44);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gTanh(rt.V.int(0))));
        if (__m0 !== null) {
          rt.frameLine(46);
          print(rt.showArgs([rt.V.str("tanh|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(48);
          print(rt.showArgs([rt.V.str("tanh|default")]));
          break;
        }
      } while (false);
      rt.frameLine(49);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gAsin(rt.V.int(0))));
        if (__m0 !== null) {
          rt.frameLine(51);
          print(rt.showArgs([rt.V.str("asin|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(53);
          print(rt.showArgs([rt.V.str("asin|default")]));
          break;
        }
      } while (false);
      rt.frameLine(54);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gAcos(rt.V.int(1))));
        if (__m0 !== null) {
          rt.frameLine(56);
          print(rt.showArgs([rt.V.str("acos|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(58);
          print(rt.showArgs([rt.V.str("acos|default")]));
          break;
        }
      } while (false);
      rt.frameLine(59);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gAtan(rt.V.int(0))));
        if (__m0 !== null) {
          rt.frameLine(61);
          print(rt.showArgs([rt.V.str("atan|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(63);
          print(rt.showArgs([rt.V.str("atan|default")]));
          break;
        }
      } while (false);
      rt.frameLine(64);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gAtan2(rt.V.int(0), rt.V.int(1))));
        if (__m0 !== null) {
          rt.frameLine(66);
          print(rt.showArgs([rt.V.str("atan2|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(68);
          print(rt.showArgs([rt.V.str("atan2|default")]));
          break;
        }
      } while (false);
      rt.frameLine(69);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0), rt.patConst(rt.gRadToDeg(rt.V.int(0))));
        if (__m0 !== null) {
          rt.frameLine(71);
          print(rt.showArgs([rt.V.str("rtd|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(73);
          print(rt.showArgs([rt.V.str("rtd|default")]));
          break;
        }
      } while (false);
      rt.frameLine(74);
      do {
        const __m0 = rt.matchPattern(rt.V.float(1), rt.patConst(rt.gFloor(rt.V.float(1.7), "auto")));
        if (__m0 !== null) {
          rt.frameLine(76);
          print(rt.showArgs([rt.V.str("floor|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(78);
          print(rt.showArgs([rt.V.str("floor|default")]));
          break;
        }
      } while (false);
      rt.frameLine(79);
      do {
        const __m0 = rt.matchPattern(rt.V.float(2), rt.patConst(rt.gCeil(rt.V.float(1.2), "auto")));
        if (__m0 !== null) {
          rt.frameLine(81);
          print(rt.showArgs([rt.V.str("ceil|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(2), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(83);
          print(rt.showArgs([rt.V.str("ceil|default")]));
          break;
        }
      } while (false);
      rt.frameLine(84);
      do {
        const __m0 = rt.matchPattern(rt.V.float(2), rt.patConst(rt.gRound(rt.V.float(1.5), "auto")));
        if (__m0 !== null) {
          rt.frameLine(86);
          print(rt.showArgs([rt.V.str("round|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(2), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(88);
          print(rt.showArgs([rt.V.str("round|default")]));
          break;
        }
      } while (false);
      rt.frameLine(89);
      do {
        const __m0 = rt.matchPattern(rt.V.float(2), rt.patConst(rt.gRound(rt.V.float(1.5), "float")));
        if (__m0 !== null) {
          rt.frameLine(91);
          print(rt.showArgs([rt.V.str("roundf|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(2), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(93);
          print(rt.showArgs([rt.V.str("roundf|default")]));
          break;
        }
      } while (false);
      rt.frameLine(94);
      do {
        const __m0 = rt.matchPattern(rt.V.float(2.5), rt.patConst(rt.gFposmod(rt.V.float(5.5), rt.V.float(3))));
        if (__m0 !== null) {
          rt.frameLine(96);
          print(rt.showArgs([rt.V.str("fposmod|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(2.5), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(98);
          print(rt.showArgs([rt.V.str("fposmod|default")]));
          break;
        }
      } while (false);
      rt.frameLine(99);
      do {
        const __m0 = rt.matchPattern(rt.V.float(1), rt.patConst(rt.gLerp(rt.V.int(0), rt.V.int(2), rt.V.float(0.5))));
        if (__m0 !== null) {
          rt.frameLine(101);
          print(rt.showArgs([rt.V.str("lerp|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(103);
          print(rt.showArgs([rt.V.str("lerp|default")]));
          break;
        }
      } while (false);
      rt.frameLine(104);
      do {
        const __m0 = rt.matchPattern(rt.V.int(1), rt.patConst(rt.gMin(rt.V.int(1), rt.V.int(2))));
        if (__m0 !== null) {
          rt.frameLine(106);
          print(rt.showArgs([rt.V.str("min|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(108);
          print(rt.showArgs([rt.V.str("min|default")]));
          break;
        }
      } while (false);
      rt.frameLine(109);
      do {
        const __m0 = rt.matchPattern(rt.V.int(2), rt.patConst(rt.gMaxI(rt.V.int(1), rt.V.int(2))));
        if (__m0 !== null) {
          rt.frameLine(111);
          print(rt.showArgs([rt.V.str("maxi|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(2), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(113);
          print(rt.showArgs([rt.V.str("maxi|default")]));
          break;
        }
      } while (false);
      rt.frameLine(114);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0.5), rt.patConst(rt.gLerpAngle(rt.V.float(0), rt.V.float(1), rt.V.float(0.5))));
        if (__m0 !== null) {
          rt.frameLine(116);
          print(rt.showArgs([rt.V.str("lerpa|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0.5), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(118);
          print(rt.showArgs([rt.V.str("lerpa|default")]));
          break;
        }
      } while (false);
      rt.frameLine(119);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0.5), rt.patConst(rt.gSmoothstep(rt.V.float(0), rt.V.float(1), rt.V.float(0.5))));
        if (__m0 !== null) {
          rt.frameLine(121);
          print(rt.showArgs([rt.V.str("smooth|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0.5), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(123);
          print(rt.showArgs([rt.V.str("smooth|default")]));
          break;
        }
      } while (false);
      rt.frameLine(124);
      do {
        const __m0 = rt.matchPattern(rt.V.float(3), rt.patConst(rt.gSnappedF(rt.V.float(2.5), rt.V.float(1))));
        if (__m0 !== null) {
          rt.frameLine(126);
          print(rt.showArgs([rt.V.str("snappedf|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(3), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(128);
          print(rt.showArgs([rt.V.str("snappedf|default")]));
          break;
        }
      } while (false);
      rt.frameLine(129);
      do {
        const __m0 = rt.matchPattern(rt.V.int(3), rt.patConst(rt.gSnappedI(rt.V.float(2.5), rt.V.int(1))));
        if (__m0 !== null) {
          rt.frameLine(131);
          print(rt.showArgs([rt.V.str("snappedi|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(3), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(133);
          print(rt.showArgs([rt.V.str("snappedi|default")]));
          break;
        }
      } while (false);
      rt.frameLine(134);
      do {
        const __m0 = rt.matchPattern(rt.V.int(1), rt.patConst(rt.gWrapAny(rt.V.int(5), rt.V.int(1), rt.V.int(3))));
        if (__m0 !== null) {
          rt.frameLine(136);
          print(rt.showArgs([rt.V.str("wrap|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(138);
          print(rt.showArgs([rt.V.str("wrap|default")]));
          break;
        }
      } while (false);
      rt.frameLine(139);
      do {
        const __m0 = rt.matchPattern(rt.V.int(1), rt.patConst(rt.gWrap(rt.V.int(5), rt.V.int(1), rt.V.int(3), true)));
        if (__m0 !== null) {
          rt.frameLine(141);
          print(rt.showArgs([rt.V.str("wrapi|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.int(1), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(143);
          print(rt.showArgs([rt.V.str("wrapi|default")]));
          break;
        }
      } while (false);
      rt.frameLine(144);
      do {
        const __m0 = rt.matchPattern(rt.V.float(1.5), rt.patConst(rt.gWrap(rt.V.float(5.5), rt.V.float(1), rt.V.float(3), false)));
        if (__m0 !== null) {
          rt.frameLine(146);
          print(rt.showArgs([rt.V.str("wrapf|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(1.5), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(148);
          print(rt.showArgs([rt.V.str("wrapf|default")]));
          break;
        }
      } while (false);
      rt.frameLine(149);
      do {
        const __m0 = rt.matchPattern(rt.V.bool(true), rt.patConst(rt.gIsEqualApprox(rt.V.float(1), rt.V.float(1))));
        if (__m0 !== null) {
          rt.frameLine(151);
          print(rt.showArgs([rt.V.str("iea|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.bool(true), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(153);
          print(rt.showArgs([rt.V.str("iea|default")]));
          break;
        }
      } while (false);
      rt.frameLine(154);
      do {
        const __m0 = rt.matchPattern(rt.V.bool(true), rt.patConst(rt.gIsFinite(rt.V.float(1))));
        if (__m0 !== null) {
          rt.frameLine(156);
          print(rt.showArgs([rt.V.str("ifin|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.bool(true), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(158);
          print(rt.showArgs([rt.V.str("ifin|default")]));
          break;
        }
      } while (false);
      rt.frameLine(159);
      do {
        const __m0 = rt.matchPattern(rt.V.bool(false), rt.patConst(rt.gIsNan(rt.V.float(1))));
        if (__m0 !== null) {
          rt.frameLine(161);
          print(rt.showArgs([rt.V.str("inan|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.bool(false), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(163);
          print(rt.showArgs([rt.V.str("inan|default")]));
          break;
        }
      } while (false);
      rt.frameLine(164);
      do {
        const __m0 = rt.matchPattern(rt.V.float(0.5), rt.patConst(rt.gInverseLerp(rt.V.float(0), rt.V.float(2), rt.V.float(1))));
        if (__m0 !== null) {
          rt.frameLine(166);
          print(rt.showArgs([rt.V.str("invlerp|arm")]));
          break;
        }
        const __m1 = rt.matchPattern(rt.V.float(0.5), rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(168);
          print(rt.showArgs([rt.V.str("invlerp|default")]));
          break;
        }
      } while (false);
      rt.frameLine(169);
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
