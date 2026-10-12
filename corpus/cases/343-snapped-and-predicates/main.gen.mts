// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.ops.add(rt.V.str("Z|is_zero_approx(0.0)|"), rt.strBuiltin([rt.gIsZeroApprox(rt.V.float(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Z|is_zero_approx(1e-6)|"), rt.strBuiltin([rt.gIsZeroApprox(rt.V.float(0.000001))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Z|is_zero_approx(0.000009999)|"), rt.strBuiltin([rt.gIsZeroApprox(rt.V.float(0.000009999))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Z|is_zero_approx(0.00001)|"), rt.strBuiltin([rt.gIsZeroApprox(rt.V.float(0.00001))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Z|is_zero_approx(0.0000100001)|"), rt.strBuiltin([rt.gIsZeroApprox(rt.V.float(0.0000100001))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Z|is_zero_approx(-1e-6)|"), rt.strBuiltin([rt.gIsZeroApprox(rt.V.float((-0.000001)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Z|is_zero_approx(1e-4)|"), rt.strBuiltin([rt.gIsZeroApprox(rt.V.float(0.0001))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Z|is_zero_approx(NAN)|"), rt.strBuiltin([rt.gIsZeroApprox(NAN)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Z|is_zero_approx(INF)|"), rt.strBuiltin([rt.gIsZeroApprox(INF)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Z|is_zero_approx(0.0000099999)|"), rt.strBuiltin([rt.gIsZeroApprox(rt.V.float(0.0000099999))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Q|is_equal_approx(0.0, 1e-6)|"), rt.strBuiltin([rt.gIsEqualApprox(rt.V.float(0), rt.V.float(0.000001))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Q|is_equal_approx(0.0, 0.00001)|"), rt.strBuiltin([rt.gIsEqualApprox(rt.V.float(0), rt.V.float(0.00001))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Q|is_equal_approx(0.0, 0.000009999)|"), rt.strBuiltin([rt.gIsEqualApprox(rt.V.float(0), rt.V.float(0.000009999))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Q|is_equal_approx(1.0, 1.0000099)|"), rt.strBuiltin([rt.gIsEqualApprox(rt.V.float(1), rt.V.float(1.0000099))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Q|is_equal_approx(1.0, 1.0000101)|"), rt.strBuiltin([rt.gIsEqualApprox(rt.V.float(1), rt.V.float(1.0000101))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Q|is_equal_approx(100000.0, 100000.5)|"), rt.strBuiltin([rt.gIsEqualApprox(rt.V.float(100000), rt.V.float(100000.5))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Q|is_equal_approx(100000.0, 100001.1)|"), rt.strBuiltin([rt.gIsEqualApprox(rt.V.float(100000), rt.V.float(100001.1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Q|is_equal_approx(0.0001, 0.00011)|"), rt.strBuiltin([rt.gIsEqualApprox(rt.V.float(0.0001), rt.V.float(0.00011))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Q|is_equal_approx(1e8, 100000005.0)|"), rt.strBuiltin([rt.gIsEqualApprox(rt.V.float(100000000), rt.V.float(100000005))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Q|is_equal_approx(-1.0, 1.0)|"), rt.strBuiltin([rt.gIsEqualApprox(rt.V.float((-1)), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Q|is_equal_approx(NAN, NAN)|"), rt.strBuiltin([rt.gIsEqualApprox(NAN, NAN)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("Q|is_equal_approx(INF, INF)|"), rt.strBuiltin([rt.gIsEqualApprox(INF, INF)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("F|is_finite(0.0)|"), rt.strBuiltin([rt.gIsFinite(rt.V.float(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("I|is_inf(0.0)|"), rt.strBuiltin([rt.gIsInf(rt.V.float(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("N|is_nan(0.0)|"), rt.strBuiltin([rt.gIsNan(rt.V.float(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("F|is_finite(INF)|"), rt.strBuiltin([rt.gIsFinite(INF)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("I|is_inf(INF)|"), rt.strBuiltin([rt.gIsInf(INF)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("N|is_nan(INF)|"), rt.strBuiltin([rt.gIsNan(INF)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("F|is_finite(-INF)|"), rt.strBuiltin([rt.gIsFinite(rt.ops.neg(INF))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("I|is_inf(-INF)|"), rt.strBuiltin([rt.gIsInf(rt.ops.neg(INF))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("N|is_nan(-INF)|"), rt.strBuiltin([rt.gIsNan(rt.ops.neg(INF))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("F|is_finite(NAN)|"), rt.strBuiltin([rt.gIsFinite(NAN)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("I|is_inf(NAN)|"), rt.strBuiltin([rt.gIsInf(NAN)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("N|is_nan(NAN)|"), rt.strBuiltin([rt.gIsNan(NAN)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("F|is_finite(1e300)|"), rt.strBuiltin([rt.gIsFinite(rt.V.float(1e+300))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("I|is_inf(1e300)|"), rt.strBuiltin([rt.gIsInf(rt.V.float(1e+300))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("N|is_nan(1e300)|"), rt.strBuiltin([rt.gIsNan(rt.V.float(1e+300))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SN|snapped(7.5, 3.0)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(7.5), rt.V.float(3))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNF|snappedf(7.5, 3.0)|"), rt.strBuiltin([rt.gSnappedF(rt.V.float(7.5), rt.V.float(3))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNI|snappedi(7.5, 3.0)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float(7.5), rt.V.float(3))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SN|snapped(0.5, 1.0)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(0.5), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNF|snappedf(0.5, 1.0)|"), rt.strBuiltin([rt.gSnappedF(rt.V.float(0.5), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNI|snappedi(0.5, 1.0)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float(0.5), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SN|snapped(1.5, 1.0)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(1.5), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNF|snappedf(1.5, 1.0)|"), rt.strBuiltin([rt.gSnappedF(rt.V.float(1.5), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNI|snappedi(1.5, 1.0)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float(1.5), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SN|snapped(2.5, 1.0)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(2.5), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNF|snappedf(2.5, 1.0)|"), rt.strBuiltin([rt.gSnappedF(rt.V.float(2.5), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNI|snappedi(2.5, 1.0)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float(2.5), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SN|snapped(-0.5, 1.0)|"), rt.strBuiltin([rt.gSnapped(rt.V.float((-0.5)), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNF|snappedf(-0.5, 1.0)|"), rt.strBuiltin([rt.gSnappedF(rt.V.float((-0.5)), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNI|snappedi(-0.5, 1.0)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float((-0.5)), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SN|snapped(-1.5, 1.0)|"), rt.strBuiltin([rt.gSnapped(rt.V.float((-1.5)), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNF|snappedf(-1.5, 1.0)|"), rt.strBuiltin([rt.gSnappedF(rt.V.float((-1.5)), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNI|snappedi(-1.5, 1.0)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float((-1.5)), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SN|snapped(1.25, 0.5)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(1.25), rt.V.float(0.5))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNF|snappedf(1.25, 0.5)|"), rt.strBuiltin([rt.gSnappedF(rt.V.float(1.25), rt.V.float(0.5))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNI|snappedi(1.25, 0.5)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float(1.25), rt.V.float(0.5))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SN|snapped(2.675, 0.01)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(2.675), rt.V.float(0.01))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNF|snappedf(2.675, 0.01)|"), rt.strBuiltin([rt.gSnappedF(rt.V.float(2.675), rt.V.float(0.01))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNI|snappedi(2.675, 0.01)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float(2.675), rt.V.float(0.01))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SN|snapped(0.0, 0.0)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(0), rt.V.float(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNF|snappedf(0.0, 0.0)|"), rt.strBuiltin([rt.gSnappedF(rt.V.float(0), rt.V.float(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNI|snappedi(0.0, 0.0)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float(0), rt.V.float(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SN|snapped(1e9, 0.1)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(1000000000), rt.V.float(0.1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNF|snappedf(1e9, 0.1)|"), rt.strBuiltin([rt.gSnappedF(rt.V.float(1000000000), rt.V.float(0.1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNI|snappedi(1e9, 0.1)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float(1000000000), rt.V.float(0.1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SN|snapped(-7.5, 3.0)|"), rt.strBuiltin([rt.gSnapped(rt.V.float((-7.5)), rt.V.float(3))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNF|snappedf(-7.5, 3.0)|"), rt.strBuiltin([rt.gSnappedF(rt.V.float((-7.5)), rt.V.float(3))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNI|snappedi(-7.5, 3.0)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float((-7.5)), rt.V.float(3))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("PM|posmod(-3, 2)|"), rt.strBuiltin([rt.gPosmod(rt.V.int((-3)), rt.V.int(2))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("FPM|fposmod(float(-3), float(2))|"), rt.strBuiltin([rt.gFposmod(rt.toFloat(rt.V.int((-3))), rt.toFloat(rt.V.int(2)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("FM|fmod(float(-3), float(2))|"), rt.strBuiltin([rt.gFmod(rt.toFloat(rt.V.int((-3))), rt.toFloat(rt.V.int(2)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("PM|posmod(3, -2)|"), rt.strBuiltin([rt.gPosmod(rt.V.int(3), rt.V.int((-2)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("FPM|fposmod(float(3), float(-2))|"), rt.strBuiltin([rt.gFposmod(rt.toFloat(rt.V.int(3)), rt.toFloat(rt.V.int((-2))))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("FM|fmod(float(3), float(-2))|"), rt.strBuiltin([rt.gFmod(rt.toFloat(rt.V.int(3)), rt.toFloat(rt.V.int((-2))))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("PM|posmod(-3, -2)|"), rt.strBuiltin([rt.gPosmod(rt.V.int((-3)), rt.V.int((-2)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("FPM|fposmod(float(-3), float(-2))|"), rt.strBuiltin([rt.gFposmod(rt.toFloat(rt.V.int((-3))), rt.toFloat(rt.V.int((-2))))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("FM|fmod(float(-3), float(-2))|"), rt.strBuiltin([rt.gFmod(rt.toFloat(rt.V.int((-3))), rt.toFloat(rt.V.int((-2))))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("PM|posmod(0, 5)|"), rt.strBuiltin([rt.gPosmod(rt.V.int(0), rt.V.int(5))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("FPM|fposmod(float(0), float(5))|"), rt.strBuiltin([rt.gFposmod(rt.toFloat(rt.V.int(0)), rt.toFloat(rt.V.int(5)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("FM|fmod(float(0), float(5))|"), rt.strBuiltin([rt.gFmod(rt.toFloat(rt.V.int(0)), rt.toFloat(rt.V.int(5)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("PM|posmod(7, 4)|"), rt.strBuiltin([rt.gPosmod(rt.V.int(7), rt.V.int(4))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("FPM|fposmod(float(7), float(4))|"), rt.strBuiltin([rt.gFposmod(rt.toFloat(rt.V.int(7)), rt.toFloat(rt.V.int(4)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("FM|fmod(float(7), float(4))|"), rt.strBuiltin([rt.gFmod(rt.toFloat(rt.V.int(7)), rt.toFloat(rt.V.int(4)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("PM|posmod(-7, 4)|"), rt.strBuiltin([rt.gPosmod(rt.V.int((-7)), rt.V.int(4))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("FPM|fposmod(float(-7), float(4))|"), rt.strBuiltin([rt.gFposmod(rt.toFloat(rt.V.int((-7))), rt.toFloat(rt.V.int(4)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("FM|fmod(float(-7), float(4))|"), rt.strBuiltin([rt.gFmod(rt.toFloat(rt.V.int((-7))), rt.toFloat(rt.V.int(4)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("PM|posmod(10, 3)|"), rt.strBuiltin([rt.gPosmod(rt.V.int(10), rt.V.int(3))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("FPM|fposmod(float(10), float(3))|"), rt.strBuiltin([rt.gFposmod(rt.toFloat(rt.V.int(10)), rt.toFloat(rt.V.int(3)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("FM|fmod(float(10), float(3))|"), rt.strBuiltin([rt.gFmod(rt.toFloat(rt.V.int(10)), rt.toFloat(rt.V.int(3)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("WI|wrapi(7, 0, 5)|"), rt.strBuiltin([rt.gWrap(rt.V.int(7), rt.V.int(0), rt.V.int(5), true)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("WI|wrapi(-1, 0, 5)|"), rt.strBuiltin([rt.gWrap(rt.V.int((-1)), rt.V.int(0), rt.V.int(5), true)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("WI|wrapi(5, 0, 5)|"), rt.strBuiltin([rt.gWrap(rt.V.int(5), rt.V.int(0), rt.V.int(5), true)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("WI|wrapi(3, 3, 3)|"), rt.strBuiltin([rt.gWrap(rt.V.int(3), rt.V.int(3), rt.V.int(3), true)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("WI|wrapi(1000000007, 0, 10)|"), rt.strBuiltin([rt.gWrap(rt.V.int(1000000007), rt.V.int(0), rt.V.int(10), true)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("P2|nearest_po2(0)|"), rt.strBuiltin([rt.gNearestPo2(rt.V.int(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("P2|nearest_po2(1)|"), rt.strBuiltin([rt.gNearestPo2(rt.V.int(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("P2|nearest_po2(2)|"), rt.strBuiltin([rt.gNearestPo2(rt.V.int(2))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("P2|nearest_po2(3)|"), rt.strBuiltin([rt.gNearestPo2(rt.V.int(3))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("P2|nearest_po2(5)|"), rt.strBuiltin([rt.gNearestPo2(rt.V.int(5))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("P2|nearest_po2(7)|"), rt.strBuiltin([rt.gNearestPo2(rt.V.int(7))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("P2|nearest_po2(8)|"), rt.strBuiltin([rt.gNearestPo2(rt.V.int(8))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("P2|nearest_po2(-3)|"), rt.strBuiltin([rt.gNearestPo2(rt.V.int((-3)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("P2|nearest_po2(-1)|"), rt.strBuiltin([rt.gNearestPo2(rt.V.int((-1)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("P2|nearest_po2(1023)|"), rt.strBuiltin([rt.gNearestPo2(rt.V.int(1023))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("P2|nearest_po2(1025)|"), rt.strBuiltin([rt.gNearestPo2(rt.V.int(1025))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("P2|nearest_po2(1073741824)|"), rt.strBuiltin([rt.gNearestPo2(rt.V.int(1073741824))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("CH|char(65)|"), rt.strBuiltin([rt.stringChr(rt.V.int(65))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("CH|char(12288)|"), rt.strBuiltin([rt.stringChr(rt.V.int(12288))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("MI|min(1, 2.5)|"), rt.strBuiltin([rt.gMin(rt.V.int(1), rt.V.float(2.5))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("MA|max(1, 2.5)|"), rt.strBuiltin([rt.gMax(rt.V.int(1), rt.V.float(2.5))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("MI|min(2.5, 1)|"), rt.strBuiltin([rt.gMin(rt.V.float(2.5), rt.V.int(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("MA|max(2.5, 1)|"), rt.strBuiltin([rt.gMax(rt.V.float(2.5), rt.V.int(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("MI|min(-0.0, 0.0)|"), rt.strBuiltin([rt.gMin(rt.V.float((-0)), rt.V.float(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("MA|max(-0.0, 0.0)|"), rt.strBuiltin([rt.gMax(rt.V.float((-0)), rt.V.float(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("MI|min(0.0, -0.0)|"), rt.strBuiltin([rt.gMin(rt.V.float(0), rt.V.float((-0)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("MA|max(0.0, -0.0)|"), rt.strBuiltin([rt.gMax(rt.V.float(0), rt.V.float((-0)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SG|sign(0.0)|"), rt.strBuiltin([rt.gSign(rt.V.float(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SF|signf(0.0)|"), rt.strBuiltin([rt.gSignF(rt.V.float(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("AB|abs(0.0)|"), rt.strBuiltin([rt.abs(rt.V.float(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SG|sign(-0.0)|"), rt.strBuiltin([rt.gSign(rt.V.float((-0)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SF|signf(-0.0)|"), rt.strBuiltin([rt.gSignF(rt.V.float((-0)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("AB|abs(-0.0)|"), rt.strBuiltin([rt.abs(rt.V.float((-0)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SG|sign(-1)|"), rt.strBuiltin([rt.gSign(rt.V.int((-1)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SF|signf(-1)|"), rt.strBuiltin([rt.gSignF(rt.V.int((-1)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("AB|abs(-1)|"), rt.strBuiltin([rt.abs(rt.V.int((-1)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SG|sign(1)|"), rt.strBuiltin([rt.gSign(rt.V.int(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SF|signf(1)|"), rt.strBuiltin([rt.gSignF(rt.V.int(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("AB|abs(1)|"), rt.strBuiltin([rt.abs(rt.V.int(1))]))]));
    this.quit();
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snapped(-7.5, -3.0)|"), rt.strBuiltin([rt.gSnapped(rt.V.float((-7.5)), rt.V.float((-3)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snapped(7.5, -3.0)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(7.5), rt.V.float((-3)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snappedf(-2.5, -1.0)|"), rt.strBuiltin([rt.gSnappedF(rt.V.float((-2.5)), rt.V.float((-1)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snapped(0.49999999999999994, 0.5)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(0.49999999999999994), rt.V.float(0.5))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snappedi(1.4, 0.3)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float(1.4), rt.V.float(0.3))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snappedi(-1.4, 0.3)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float((-1.4)), rt.V.float(0.3))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snappedi(-7.5, 3.0)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float((-7.5)), rt.V.float(3))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snappedi(8, -3)|"), rt.strBuiltin([rt.gSnappedI(rt.V.int(8), rt.V.int((-3)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snapped(1e9, 0.1)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(1000000000), rt.V.float(0.1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snapped(-1e9, 0.1)|"), rt.strBuiltin([rt.gSnapped(rt.V.float((-1000000000)), rt.V.float(0.1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snapped(0.1, 0.0000001)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(0.1), rt.V.float(1e-7))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snapped(2.675, 0.01)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(2.675), rt.V.float(0.01))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snapped(-2.675, 0.01)|"), rt.strBuiltin([rt.gSnapped(rt.V.float((-2.675)), rt.V.float(0.01))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snapped(5, 0)|"), rt.strBuiltin([rt.gSnapped(rt.V.int(5), rt.V.int(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snappedf(5.0, 0.0)|"), rt.strBuiltin([rt.gSnappedF(rt.V.float(5), rt.V.float(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snappedi(5, 0)|"), rt.strBuiltin([rt.gSnappedI(rt.V.int(5), rt.V.int(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snappedi(5.5, 0)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float(5.5), rt.V.int(0))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snapped(0.0, -1.0)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(0), rt.V.float((-1)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snapped(-0.0, 1.0)|"), rt.strBuiltin([rt.gSnapped(rt.V.float((-0)), rt.V.float(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snapped(7.5, 3)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(7.5), rt.V.int(3))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snappedf(1e-9, 1e-10)|"), rt.strBuiltin([rt.gSnappedF(rt.V.float(1e-9), rt.V.float(1e-10))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snapped(-1.5, -1.0)|"), rt.strBuiltin([rt.gSnapped(rt.V.float((-1.5)), rt.V.float((-1)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snapped(1.5, -1.0)|"), rt.strBuiltin([rt.gSnapped(rt.V.float(1.5), rt.V.float((-1)))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("SNX|snappedi(-0.5, 1.0)|"), rt.strBuiltin([rt.gSnappedI(rt.V.float((-0.5)), rt.V.float(1))]))]));
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
