// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);
const PI = rt.V.float(3.141592653589793);

export class Main extends SceneTree {
  row(tag: rt.Variant, x: rt.Variant): void {
    tag = rt.paramSlot(tag, "String", 1, "row", this);
    print(rt.showArgs([tag, rt.V.str("|"), x, rt.V.str("|"), rt.typeOf(x)]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    this.row(rt.V.str("z01"), rt.gDbToLinear(rt.V.int(0)));
    this.row(rt.V.str("z02"), rt.gDbToLinear(rt.V.int(1)));
    this.row(rt.V.str("z03"), rt.gDbToLinear(rt.V.int((-1))));
    this.row(rt.V.str("z04"), rt.gDbToLinear(rt.V.int(6)));
    this.row(rt.V.str("z05"), rt.gDbToLinear(rt.V.float(0.5)));
    this.row(rt.V.str("z06"), rt.gDbToLinear(rt.V.int((-20))));
    this.row(rt.V.str("z07"), rt.gDbToLinear(rt.V.int(20)));
    this.row(rt.V.str("z08"), rt.gDbToLinear(rt.V.float(1000000000000000000)));
    this.row(rt.V.str("z09"), rt.gDbToLinear(INF));
    this.row(rt.V.str("z10"), rt.gDbToLinear(rt.ops.neg(INF)));
    this.row(rt.V.str("z11"), rt.gDbToLinear(NAN));
    this.row(rt.V.str("z12"), rt.gLinearToDb(rt.V.int(0)));
    this.row(rt.V.str("z13"), rt.gLinearToDb(rt.V.int(1)));
    this.row(rt.V.str("z14"), rt.gLinearToDb(rt.V.int((-1))));
    this.row(rt.V.str("z15"), rt.gLinearToDb(rt.V.float(0.5)));
    this.row(rt.V.str("z16"), rt.gLinearToDb(rt.V.int(20)));
    this.row(rt.V.str("z17"), rt.gLinearToDb(rt.V.float(1e-9)));
    this.row(rt.V.str("z18"), rt.gLinearToDb(rt.V.float(1000000000000000000)));
    this.row(rt.V.str("z19"), rt.gLinearToDb(INF));
    this.row(rt.V.str("z20"), rt.gLinearToDb(NAN));
    this.row(rt.V.str("z21"), rt.gNearestPo2(rt.V.int(0)));
    this.row(rt.V.str("z22"), rt.gNearestPo2(rt.V.int(1)));
    this.row(rt.V.str("z23"), rt.gNearestPo2(rt.V.int(3)));
    this.row(rt.V.str("z24"), rt.gNearestPo2(rt.V.int(5)));
    this.row(rt.V.str("z25"), rt.gNearestPo2(rt.V.int(7)));
    this.row(rt.V.str("z26"), rt.gNearestPo2(rt.V.int((-3))));
    this.row(rt.V.str("z27"), rt.gNearestPo2(rt.V.int(1023)));
    this.row(rt.V.str("z28"), rt.gNearestPo2(rt.V.int(1024)));
    this.row(rt.V.str("z29"), rt.gNearestPo2(rt.V.int(1025)));
    this.row(rt.V.str("z30"), rt.gNearestPo2(rt.V.int(4611686018427387903n)));
    this.row(rt.V.str("z31"), rt.gNearestPo2(rt.V.float(3.7)));
    this.row(rt.V.str("z32"), rt.gNearestPo2(rt.V.float((-3.7))));
    this.row(rt.V.str("z33"), rt.gStepDecimals(rt.V.int(0)));
    this.row(rt.V.str("z34"), rt.gStepDecimals(rt.V.int(1)));
    this.row(rt.V.str("z35"), rt.gStepDecimals(rt.V.float(0.5)));
    this.row(rt.V.str("z36"), rt.gStepDecimals(rt.V.float(123.456)));
    this.row(rt.V.str("z37"), rt.gStepDecimals(rt.V.float(0.0001)));
    this.row(rt.V.str("z38"), rt.gStepDecimals(rt.V.float(0.01)));
    this.row(rt.V.str("z39"), rt.gStepDecimals(rt.V.float(0.1)));
    this.row(rt.V.str("z40"), rt.gStepDecimals(rt.V.float(0.9)));
    this.row(rt.V.str("z41"), rt.gStepDecimals(rt.V.float(1.5)));
    this.row(rt.V.str("z42"), rt.gStepDecimals(rt.V.float(12.3456)));
    this.row(rt.V.str("z43"), rt.gStepDecimals(rt.V.float(1e-9)));
    this.row(rt.V.str("z44"), rt.gStepDecimals(rt.V.float((-123.456))));
    this.row(rt.V.str("z45"), rt.gStepDecimals(rt.V.float(1000000000000000000)));
    this.row(rt.V.str("z46"), rt.gStepDecimals(NAN));
    this.row(rt.V.str("z47"), rt.gStepDecimals(INF));
    this.row(rt.V.str("z48"), rt.gPingpong(rt.V.float(0), rt.V.float(5)));
    this.row(rt.V.str("z49"), rt.gPingpong(rt.V.float(5), rt.V.float(5)));
    this.row(rt.V.str("z50"), rt.gPingpong(rt.V.float(7), rt.V.float(5)));
    this.row(rt.V.str("z51"), rt.gPingpong(rt.V.float(12), rt.V.float(5)));
    this.row(rt.V.str("z52"), rt.gPingpong(rt.V.float((-3)), rt.V.float(5)));
    this.row(rt.V.str("z53"), rt.gPingpong(rt.V.float(1.5), rt.V.float(0)));
    this.row(rt.V.str("z54"), rt.gPingpong(rt.V.int(1), rt.V.int(3)));
    this.row(rt.V.str("z55"), rt.gPingpong(rt.V.float(2.5), rt.V.float((-4))));
    this.row(rt.V.str("z56"), rt.gRotateToward(rt.V.float(1), rt.V.float(3), rt.V.float(1)));
    this.row(rt.V.str("z57"), rt.gRotateToward(rt.V.float(3), rt.V.float(1), rt.V.float(1)));
    this.row(rt.V.str("z58"), rt.gRotateToward(rt.V.float(0), rt.V.float(10), rt.V.float(3)));
    this.row(rt.V.str("z59"), rt.gRotateToward(rt.V.float(0), rt.V.float(10), rt.V.float(1)));
    this.row(rt.V.str("z60"), rt.gRotateToward(rt.V.float(0), rt.V.float(10), rt.V.float(0)));
    this.row(rt.V.str("z61"), rt.gRotateToward(rt.V.float((-1)), rt.V.float(1), rt.V.float(0.5)));
    this.row(rt.V.str("z62"), rt.gRotateToward(rt.V.float(3), rt.V.float((-3)), rt.V.float(10)));
    this.row(rt.V.str("z63"), rt.gRotateToward(rt.V.float(0.5), rt.V.float((-0.5)), rt.V.float(0.25)));
    this.row(rt.V.str("z64"), rt.gRotateToward(rt.V.float(1), rt.V.float(1), rt.V.float(5)));
    this.row(rt.V.str("z65"), rt.gRotateToward(PI, rt.V.float(0), rt.V.float(1)));
    this.row(rt.V.str("z66"), rt.gLerpAngle(rt.V.float(0), rt.V.float(3), rt.V.float(0.5)));
    this.row(rt.V.str("z67"), rt.gLerpAngle(rt.V.float((-3)), rt.V.float(3), rt.V.float(0.5)));
    this.row(rt.V.str("z68"), rt.gLerpAngle(rt.V.float(2), rt.V.float((-2)), rt.V.float(0.25)));
    this.row(rt.V.str("z69"), rt.gLerpAngle(PI, rt.V.float(0), rt.V.float(0.5)));
    this.row(rt.V.str("z70"), rt.gLerpAngle(rt.ops.neg(PI), PI, rt.V.float(0.75)));
    this.row(rt.V.str("z71"), rt.gLerpAngle(rt.V.float(0), rt.V.float(0), rt.V.float(0.5)));
    this.row(rt.V.str("z72"), rt.gLerpAngle(PI, rt.ops.neg(PI), rt.V.float(0.5)));
    this.row(rt.V.str("z73"), rt.gLerpAngle(rt.V.float(0), rt.ops.neg(PI), rt.V.float(0.5)));
    this.row(rt.V.str("z74"), rt.gBezierInterpolate(rt.V.float(0), rt.V.float(1), rt.V.float(10), rt.V.float(11), rt.V.float(0.5)));
    this.row(rt.V.str("z75"), rt.gBezierInterpolate(rt.V.float(0.1), rt.V.float(0.9), rt.V.float(0.2), rt.V.float(0.8), rt.V.float(0)));
    this.row(rt.V.str("z76"), rt.gBezierInterpolate(rt.V.float(0.1), rt.V.float(0.9), rt.V.float(0.2), rt.V.float(0.8), rt.V.float(1)));
    this.row(rt.V.str("z77"), rt.gBezierInterpolate(rt.V.float(0), rt.V.float(1), rt.V.float(10), rt.V.float(11), rt.V.float(0.25)));
    this.row(rt.V.str("z78"), rt.gBezierDerivative(rt.V.float(0), rt.V.float(1), rt.V.float(10), rt.V.float(11), rt.V.float(0.5)));
    this.row(rt.V.str("z79"), rt.gBezierDerivative(rt.V.float(0.1), rt.V.float(0.9), rt.V.float(0.2), rt.V.float(0.8), rt.V.float(0)));
    this.row(rt.V.str("z80"), rt.gBezierDerivative(rt.V.float(0.1), rt.V.float(0.9), rt.V.float(0.2), rt.V.float(0.8), rt.V.float(1)));
    this.row(rt.V.str("z81"), rt.gCubicAngle(rt.V.float(0), rt.V.float(1), rt.V.float(10), rt.V.float(11), rt.V.float(0.5)));
    this.row(rt.V.str("z82"), rt.gCubicAngle(rt.V.float((-3)), rt.V.float(3), rt.V.float(9), rt.V.float(15), rt.V.float(0.25)));
    this.row(rt.V.str("z83"), rt.gCubicAngle(rt.V.float(0), rt.V.float(9), rt.V.float((-9)), rt.V.float(3), rt.V.float(0.5)));
    this.row(rt.V.str("z84"), rt.gCubicAngle(rt.V.float(3), rt.V.float((-3)), rt.V.float(3), rt.V.float((-3)), rt.V.float(0.75)));
    this.row(rt.V.str("z85"), rt.gCubicInTime(rt.V.float(0), rt.V.float(1), rt.V.float(10), rt.V.float(11), rt.V.float(0.5), rt.V.float(0), rt.V.float((1 / 3)), rt.V.float((2 / 3))));
    this.row(rt.V.str("z86"), rt.gCubicInTime(rt.V.float(0), rt.V.float(1), rt.V.float(10), rt.V.float(11), rt.V.float(0.25), rt.V.float(0), rt.V.float(0.5), rt.V.float(0.75)));
    this.row(rt.V.str("z87"), rt.gCubicAngleInTime(rt.V.float(0), rt.V.float(1), rt.V.float(10), rt.V.float(11), rt.V.float(0.5), rt.V.float(0), rt.V.float((1 / 3)), rt.V.float((2 / 3))));
    this.row(rt.V.str("z88"), rt.gCubicAngleInTime(rt.V.float(0), rt.V.float(9), rt.V.float((-9)), rt.V.float(3), rt.V.float(0.5), rt.V.float(0), rt.V.float((1 / 3)), rt.V.float((2 / 3))));
    this.row(rt.V.str("z89"), rt.gAngleDifference(PI, rt.V.float(0)));
    this.row(rt.V.str("z90"), rt.gAngleDifference(rt.V.float(0), rt.ops.neg(PI)));
    this.row(rt.V.str("z91"), rt.gAngleDifference(rt.V.float(0), PI));
    this.row(rt.V.str("z92"), rt.gAngleDifference(rt.ops.neg(PI), rt.V.float(0)));
    this.row(rt.V.str("z93"), rt.gAngleDifference(PI, rt.ops.neg(PI)));
    this.row(rt.V.str("z94"), rt.gAngleDifference(rt.V.float(0), rt.ops.sub(PI, rt.V.float(1e-9))));
    this.row(rt.V.str("z95"), rt.gAngleDifference(rt.V.float(0), rt.ops.add(rt.ops.neg(PI), rt.V.float(1e-9))));
    this.row(rt.V.str("z96"), rt.gAngleDifference(rt.V.float(0), rt.V.float(3.14159)));
    this.quit();
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
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
