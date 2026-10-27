import "./value-ctors";
import { nodePathHash } from "./builtin/hash";
import { registerNodePathHashHook } from "./node-path";

registerNodePathHashHook(nodePathHash);

export { arrayFromArgs, arrayFromVariant, gInstToDict, range, rangeInt, rangeSeq } from "./builtin/array";
export { abs, and, num, numOrVectorArg, or, sqrt, tern } from "./builtin/args";
export { HEX_PREFIX_RE, HEX_RE, INT_RE, strHexToInt, strOf, toBool, toFloat, toInt } from "./builtin/cast";
export { gAbsF, gAbsI, gCeil, gClamp, gFloor, gFmod, gFposmod, gIsEqualApprox, gIsFinite, gIsInf, gIsNan, gIsZeroApprox, gMax, gMaxF, gMaxI, gMin, gMinF, gMinI, gNearestPo2, gPosmod, gRound, gSign, gSignF, gSignI, gSnapped, gSnappedF, gSnappedI, gStepDecimals, gWrap, gWrapAny } from "./builtin/math";
export { gAcos, gAcosh, gAngleDifference, gAsin, gAsinh, gAtan, gAtan2, gAtanh, gBezierDerivative, gBezierInterpolate, gCos, gCosh, gCubic, gCubicAngle, gCubicAngleInTime, gCubicInTime, gDbToLinear, gDegToRad, gEase, gExp, gInverseLerp, gLerp, gLerpAngle, gLinearToDb, gLog, gMoveToward, gPingpong, gPow, gRadToDeg, gRemap, gRotateToward, gSin, gSinh, gSmoothstep, gSqrt, gTan, gTanh } from "./builtin/geom";
export { hashDjb2, variantHash, variantHashNumber } from "./builtin/hash";
export { gInstanceFromId, gIsInstanceIdValid, gIsInstanceValid, gIsSame, gRidAllocateId, gRidFromInt64, gWeakref, lengthOf, unsupportedValueDefault } from "./builtin/ops";
export { gErrorString, gTypeExists, gTypeString } from "./builtin/names";
export { gRandFromSeed, gRandf, gRandfRange, gRandfn, gRandi, gRandiRange, gRandomize, gSeed, randNextUint32 } from "./builtin/rand";
