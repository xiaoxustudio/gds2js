import { nodePathHash } from "./builtin-hash";
import { registerVarToStrValueHook } from "./values";
import { Signal } from "./signal";
import { registerNodePathHashHook } from "./node-path";
import { GVector2 } from "./vector2";
import { GVector2i } from "./vector2i";
import { GVector3 } from "./vector3";
import { GVector3i } from "./vector3i";
import { GVector4 } from "./vector4";
import { GVector4i } from "./vector4i";
import { GColor } from "./color";
import { rtosFix } from "./grisu2";

registerVarToStrValueHook((o) => {
  if (o instanceof GVector2) return `Vector2(${rtosFix(o.x, true)}, ${rtosFix(o.y, true)})`;
  if (o instanceof GVector2i) return `Vector2i(${o.x}, ${o.y})`;
  if (o instanceof GVector3) return `Vector3(${rtosFix(o.x, true)}, ${rtosFix(o.y, true)}, ${rtosFix(o.z, true)})`;
  if (o instanceof GVector3i) return `Vector3i(${o.x}, ${o.y}, ${o.z})`;
  if (o instanceof GVector4) return `Vector4(${rtosFix(o.x, true)}, ${rtosFix(o.y, true)}, ${rtosFix(o.z, true)}, ${rtosFix(o.w, true)})`;
  if (o instanceof GVector4i) return `Vector4i(${o.x}, ${o.y}, ${o.z}, ${o.w})`;
  if (o instanceof GColor) return `Color(${rtosFix(o.r, true)}, ${rtosFix(o.g, true)}, ${rtosFix(o.b, true)}, ${rtosFix(o.a, true)})`;
  if (o instanceof Signal) return "Signal()";
  return null;
});

registerNodePathHashHook(nodePathHash);

export { arrayFromArgs, arrayFromVariant, gInstToDict, range, rangeInt, rangeSeq } from "./builtin-array";
export { abs, and, num, numOrVectorArg, or, sqrt, tern } from "./builtin-args";
export { HEX_PREFIX_RE, HEX_RE, INT_RE, strHexToInt, strOf, toBool, toFloat, toInt } from "./builtin-cast";
export { gAbsF, gAbsI, gCeil, gClamp, gFloor, gFmod, gFposmod, gIsEqualApprox, gIsFinite, gIsInf, gIsNan, gIsZeroApprox, gMax, gMaxF, gMaxI, gMin, gMinF, gMinI, gNearestPo2, gPosmod, gRound, gSign, gSignF, gSignI, gSnapped, gSnappedF, gSnappedI, gStepDecimals, gWrap, gWrapAny } from "./builtin-math";
export { gAcos, gAcosh, gAngleDifference, gAsin, gAsinh, gAtan, gAtan2, gAtanh, gBezierDerivative, gBezierInterpolate, gCos, gCosh, gCubic, gCubicAngle, gCubicAngleInTime, gCubicInTime, gDbToLinear, gDegToRad, gEase, gExp, gInverseLerp, gLerp, gLerpAngle, gLinearToDb, gLog, gMoveToward, gPingpong, gPow, gRadToDeg, gRemap, gRotateToward, gSin, gSinh, gSmoothstep, gSqrt, gTan, gTanh } from "./builtin-geom";
export { hashDjb2, variantHash, variantHashNumber } from "./builtin-hash";
export { gInstanceFromId, gIsInstanceIdValid, gIsInstanceValid, gIsSame, gRidAllocateId, gRidFromInt64, gWeakref, lengthOf, unsupportedValueDefault } from "./builtin-ops";
export { gErrorString, gTypeExists, gTypeString } from "./builtin-names";
export { gRandFromSeed, gRandf, gRandfRange, gRandfn, gRandi, gRandiRange, gRandomize, gSeed, randNextUint32 } from "./builtin-rand";
