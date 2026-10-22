// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);
const PI = rt.V.float(3.141592653589793);

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

  row(tag: rt.Variant, x: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "row");
    try {
      tag = rt.paramSlot(tag, "String", 1, "row", this);
      rt.frameLine(4);
      print(rt.showArgs([tag, rt.V.str("|"), x, rt.V.str("|"), rt.typeOf(x)]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(7);
      this.row(rt.V.str("z01"), rt.gDbToLinear(rt.V.int(0)));
      rt.frameLine(8);
      this.row(rt.V.str("z02"), rt.gDbToLinear(rt.V.int(1)));
      rt.frameLine(9);
      this.row(rt.V.str("z03"), rt.gDbToLinear(rt.V.int((-1))));
      rt.frameLine(10);
      this.row(rt.V.str("z04"), rt.gDbToLinear(rt.V.int(6)));
      rt.frameLine(11);
      this.row(rt.V.str("z05"), rt.gDbToLinear(rt.V.float(0.5)));
      rt.frameLine(12);
      this.row(rt.V.str("z06"), rt.gDbToLinear(rt.V.int((-20))));
      rt.frameLine(13);
      this.row(rt.V.str("z07"), rt.gDbToLinear(rt.V.int(20)));
      rt.frameLine(14);
      this.row(rt.V.str("z08"), rt.gDbToLinear(rt.V.float(1000000000000000000)));
      rt.frameLine(15);
      this.row(rt.V.str("z09"), rt.gDbToLinear(INF));
      rt.frameLine(16);
      this.row(rt.V.str("z10"), rt.gDbToLinear(rt.ops.neg(INF)));
      rt.frameLine(17);
      this.row(rt.V.str("z11"), rt.gDbToLinear(NAN));
      rt.frameLine(18);
      this.row(rt.V.str("z12"), rt.gLinearToDb(rt.V.int(0)));
      rt.frameLine(19);
      this.row(rt.V.str("z13"), rt.gLinearToDb(rt.V.int(1)));
      rt.frameLine(20);
      this.row(rt.V.str("z14"), rt.gLinearToDb(rt.V.int((-1))));
      rt.frameLine(21);
      this.row(rt.V.str("z15"), rt.gLinearToDb(rt.V.float(0.5)));
      rt.frameLine(22);
      this.row(rt.V.str("z16"), rt.gLinearToDb(rt.V.int(20)));
      rt.frameLine(23);
      this.row(rt.V.str("z17"), rt.gLinearToDb(rt.V.float(1e-9)));
      rt.frameLine(24);
      this.row(rt.V.str("z18"), rt.gLinearToDb(rt.V.float(1000000000000000000)));
      rt.frameLine(25);
      this.row(rt.V.str("z19"), rt.gLinearToDb(INF));
      rt.frameLine(26);
      this.row(rt.V.str("z20"), rt.gLinearToDb(NAN));
      rt.frameLine(27);
      this.row(rt.V.str("z21"), rt.gNearestPo2(rt.V.int(0)));
      rt.frameLine(28);
      this.row(rt.V.str("z22"), rt.gNearestPo2(rt.V.int(1)));
      rt.frameLine(29);
      this.row(rt.V.str("z23"), rt.gNearestPo2(rt.V.int(3)));
      rt.frameLine(30);
      this.row(rt.V.str("z24"), rt.gNearestPo2(rt.V.int(5)));
      rt.frameLine(31);
      this.row(rt.V.str("z25"), rt.gNearestPo2(rt.V.int(7)));
      rt.frameLine(32);
      this.row(rt.V.str("z26"), rt.gNearestPo2(rt.V.int((-3))));
      rt.frameLine(33);
      this.row(rt.V.str("z27"), rt.gNearestPo2(rt.V.int(1023)));
      rt.frameLine(34);
      this.row(rt.V.str("z28"), rt.gNearestPo2(rt.V.int(1024)));
      rt.frameLine(35);
      this.row(rt.V.str("z29"), rt.gNearestPo2(rt.V.int(1025)));
      rt.frameLine(36);
      this.row(rt.V.str("z30"), rt.gNearestPo2(rt.V.int(4611686018427387903n)));
      rt.frameLine(37);
      this.row(rt.V.str("z31"), rt.gNearestPo2(rt.V.float(3.7)));
      rt.frameLine(38);
      this.row(rt.V.str("z32"), rt.gNearestPo2(rt.V.float((-3.7))));
      rt.frameLine(39);
      this.row(rt.V.str("z33"), rt.gStepDecimals(rt.V.int(0)));
      rt.frameLine(40);
      this.row(rt.V.str("z34"), rt.gStepDecimals(rt.V.int(1)));
      rt.frameLine(41);
      this.row(rt.V.str("z35"), rt.gStepDecimals(rt.V.float(0.5)));
      rt.frameLine(42);
      this.row(rt.V.str("z36"), rt.gStepDecimals(rt.V.float(123.456)));
      rt.frameLine(43);
      this.row(rt.V.str("z37"), rt.gStepDecimals(rt.V.float(0.0001)));
      rt.frameLine(44);
      this.row(rt.V.str("z38"), rt.gStepDecimals(rt.V.float(0.01)));
      rt.frameLine(45);
      this.row(rt.V.str("z39"), rt.gStepDecimals(rt.V.float(0.1)));
      rt.frameLine(46);
      this.row(rt.V.str("z40"), rt.gStepDecimals(rt.V.float(0.9)));
      rt.frameLine(47);
      this.row(rt.V.str("z41"), rt.gStepDecimals(rt.V.float(1.5)));
      rt.frameLine(48);
      this.row(rt.V.str("z42"), rt.gStepDecimals(rt.V.float(12.3456)));
      rt.frameLine(49);
      this.row(rt.V.str("z43"), rt.gStepDecimals(rt.V.float(1e-9)));
      rt.frameLine(50);
      this.row(rt.V.str("z44"), rt.gStepDecimals(rt.V.float((-123.456))));
      rt.frameLine(51);
      this.row(rt.V.str("z45"), rt.gStepDecimals(rt.V.float(1000000000000000000)));
      rt.frameLine(52);
      this.row(rt.V.str("z46"), rt.gStepDecimals(NAN));
      rt.frameLine(53);
      this.row(rt.V.str("z47"), rt.gStepDecimals(INF));
      rt.frameLine(54);
      this.row(rt.V.str("z48"), rt.gPingpong(rt.V.float(0), rt.V.float(5)));
      rt.frameLine(55);
      this.row(rt.V.str("z49"), rt.gPingpong(rt.V.float(5), rt.V.float(5)));
      rt.frameLine(56);
      this.row(rt.V.str("z50"), rt.gPingpong(rt.V.float(7), rt.V.float(5)));
      rt.frameLine(57);
      this.row(rt.V.str("z51"), rt.gPingpong(rt.V.float(12), rt.V.float(5)));
      rt.frameLine(58);
      this.row(rt.V.str("z52"), rt.gPingpong(rt.V.float((-3)), rt.V.float(5)));
      rt.frameLine(59);
      this.row(rt.V.str("z53"), rt.gPingpong(rt.V.float(1.5), rt.V.float(0)));
      rt.frameLine(60);
      this.row(rt.V.str("z54"), rt.gPingpong(rt.V.int(1), rt.V.int(3)));
      rt.frameLine(61);
      this.row(rt.V.str("z55"), rt.gPingpong(rt.V.float(2.5), rt.V.float((-4))));
      rt.frameLine(62);
      this.row(rt.V.str("z56"), rt.gRotateToward(rt.V.float(1), rt.V.float(3), rt.V.float(1)));
      rt.frameLine(63);
      this.row(rt.V.str("z57"), rt.gRotateToward(rt.V.float(3), rt.V.float(1), rt.V.float(1)));
      rt.frameLine(64);
      this.row(rt.V.str("z58"), rt.gRotateToward(rt.V.float(0), rt.V.float(10), rt.V.float(3)));
      rt.frameLine(65);
      this.row(rt.V.str("z59"), rt.gRotateToward(rt.V.float(0), rt.V.float(10), rt.V.float(1)));
      rt.frameLine(66);
      this.row(rt.V.str("z60"), rt.gRotateToward(rt.V.float(0), rt.V.float(10), rt.V.float(0)));
      rt.frameLine(67);
      this.row(rt.V.str("z61"), rt.gRotateToward(rt.V.float((-1)), rt.V.float(1), rt.V.float(0.5)));
      rt.frameLine(68);
      this.row(rt.V.str("z62"), rt.gRotateToward(rt.V.float(3), rt.V.float((-3)), rt.V.float(10)));
      rt.frameLine(69);
      this.row(rt.V.str("z63"), rt.gRotateToward(rt.V.float(0.5), rt.V.float((-0.5)), rt.V.float(0.25)));
      rt.frameLine(70);
      this.row(rt.V.str("z64"), rt.gRotateToward(rt.V.float(1), rt.V.float(1), rt.V.float(5)));
      rt.frameLine(71);
      this.row(rt.V.str("z65"), rt.gRotateToward(PI, rt.V.float(0), rt.V.float(1)));
      rt.frameLine(72);
      this.row(rt.V.str("z66"), rt.gLerpAngle(rt.V.float(0), rt.V.float(3), rt.V.float(0.5)));
      rt.frameLine(73);
      this.row(rt.V.str("z67"), rt.gLerpAngle(rt.V.float((-3)), rt.V.float(3), rt.V.float(0.5)));
      rt.frameLine(74);
      this.row(rt.V.str("z68"), rt.gLerpAngle(rt.V.float(2), rt.V.float((-2)), rt.V.float(0.25)));
      rt.frameLine(75);
      this.row(rt.V.str("z69"), rt.gLerpAngle(PI, rt.V.float(0), rt.V.float(0.5)));
      rt.frameLine(76);
      this.row(rt.V.str("z70"), rt.gLerpAngle(rt.ops.neg(PI), PI, rt.V.float(0.75)));
      rt.frameLine(77);
      this.row(rt.V.str("z71"), rt.gLerpAngle(rt.V.float(0), rt.V.float(0), rt.V.float(0.5)));
      rt.frameLine(78);
      this.row(rt.V.str("z72"), rt.gLerpAngle(PI, rt.ops.neg(PI), rt.V.float(0.5)));
      rt.frameLine(79);
      this.row(rt.V.str("z73"), rt.gLerpAngle(rt.V.float(0), rt.ops.neg(PI), rt.V.float(0.5)));
      rt.frameLine(80);
      this.row(rt.V.str("z74"), rt.gBezierInterpolate(rt.V.float(0), rt.V.float(1), rt.V.float(10), rt.V.float(11), rt.V.float(0.5)));
      rt.frameLine(81);
      this.row(rt.V.str("z75"), rt.gBezierInterpolate(rt.V.float(0.1), rt.V.float(0.9), rt.V.float(0.2), rt.V.float(0.8), rt.V.float(0)));
      rt.frameLine(82);
      this.row(rt.V.str("z76"), rt.gBezierInterpolate(rt.V.float(0.1), rt.V.float(0.9), rt.V.float(0.2), rt.V.float(0.8), rt.V.float(1)));
      rt.frameLine(83);
      this.row(rt.V.str("z77"), rt.gBezierInterpolate(rt.V.float(0), rt.V.float(1), rt.V.float(10), rt.V.float(11), rt.V.float(0.25)));
      rt.frameLine(84);
      this.row(rt.V.str("z78"), rt.gBezierDerivative(rt.V.float(0), rt.V.float(1), rt.V.float(10), rt.V.float(11), rt.V.float(0.5)));
      rt.frameLine(85);
      this.row(rt.V.str("z79"), rt.gBezierDerivative(rt.V.float(0.1), rt.V.float(0.9), rt.V.float(0.2), rt.V.float(0.8), rt.V.float(0)));
      rt.frameLine(86);
      this.row(rt.V.str("z80"), rt.gBezierDerivative(rt.V.float(0.1), rt.V.float(0.9), rt.V.float(0.2), rt.V.float(0.8), rt.V.float(1)));
      rt.frameLine(87);
      this.row(rt.V.str("z81"), rt.gCubicAngle(rt.V.float(0), rt.V.float(1), rt.V.float(10), rt.V.float(11), rt.V.float(0.5)));
      rt.frameLine(88);
      this.row(rt.V.str("z82"), rt.gCubicAngle(rt.V.float((-3)), rt.V.float(3), rt.V.float(9), rt.V.float(15), rt.V.float(0.25)));
      rt.frameLine(89);
      this.row(rt.V.str("z83"), rt.gCubicAngle(rt.V.float(0), rt.V.float(9), rt.V.float((-9)), rt.V.float(3), rt.V.float(0.5)));
      rt.frameLine(90);
      this.row(rt.V.str("z84"), rt.gCubicAngle(rt.V.float(3), rt.V.float((-3)), rt.V.float(3), rt.V.float((-3)), rt.V.float(0.75)));
      rt.frameLine(91);
      this.row(rt.V.str("z85"), rt.gCubicInTime(rt.V.float(0), rt.V.float(1), rt.V.float(10), rt.V.float(11), rt.V.float(0.5), rt.V.float(0), rt.V.float((1 / 3)), rt.V.float((2 / 3))));
      rt.frameLine(92);
      this.row(rt.V.str("z86"), rt.gCubicInTime(rt.V.float(0), rt.V.float(1), rt.V.float(10), rt.V.float(11), rt.V.float(0.25), rt.V.float(0), rt.V.float(0.5), rt.V.float(0.75)));
      rt.frameLine(93);
      this.row(rt.V.str("z87"), rt.gCubicAngleInTime(rt.V.float(0), rt.V.float(1), rt.V.float(10), rt.V.float(11), rt.V.float(0.5), rt.V.float(0), rt.V.float((1 / 3)), rt.V.float((2 / 3))));
      rt.frameLine(94);
      this.row(rt.V.str("z88"), rt.gCubicAngleInTime(rt.V.float(0), rt.V.float(9), rt.V.float((-9)), rt.V.float(3), rt.V.float(0.5), rt.V.float(0), rt.V.float((1 / 3)), rt.V.float((2 / 3))));
      rt.frameLine(95);
      this.row(rt.V.str("z89"), rt.gAngleDifference(PI, rt.V.float(0)));
      rt.frameLine(96);
      this.row(rt.V.str("z90"), rt.gAngleDifference(rt.V.float(0), rt.ops.neg(PI)));
      rt.frameLine(97);
      this.row(rt.V.str("z91"), rt.gAngleDifference(rt.V.float(0), PI));
      rt.frameLine(98);
      this.row(rt.V.str("z92"), rt.gAngleDifference(rt.ops.neg(PI), rt.V.float(0)));
      rt.frameLine(99);
      this.row(rt.V.str("z93"), rt.gAngleDifference(PI, rt.ops.neg(PI)));
      rt.frameLine(100);
      this.row(rt.V.str("z94"), rt.gAngleDifference(rt.V.float(0), rt.ops.sub(PI, rt.V.float(1e-9))));
      rt.frameLine(101);
      this.row(rt.V.str("z95"), rt.gAngleDifference(rt.V.float(0), rt.ops.add(rt.ops.neg(PI), rt.V.float(1e-9))));
      rt.frameLine(102);
      this.row(rt.V.str("z96"), rt.gAngleDifference(rt.V.float(0), rt.V.float(3.14159)));
      rt.frameLine(103);
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
      case "row": return rt.wrapValue(this.row(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "row": [2, 2], "_initialize": [0, 0] });
rt.registerMethodParams(__gd_d_Main, { "row": ["String", "Variant"] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
