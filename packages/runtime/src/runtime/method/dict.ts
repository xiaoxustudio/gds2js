import { GodotRuntimeError, UnsupportedError } from "../errors";
import { HEX_PREFIX_RE, HEX_RE, INT_RE, hashDjb2, strHexToInt, toBool, toFloat, toInt, variantHashNumber,
  abs, lengthOf, range as gRange, sqrt, variantHash, gAngleDifference, gCubic, gClamp, gCeil, gDegToRad, gRadToDeg, gEase, gExp,
  gFloor, gFmod, gFposmod, gInverseLerp, gIsEqualApprox, gIsFinite, gIsInf, gIsNan, gIsZeroApprox, gLerp, gLog,
  gMax, gMaxF, gMaxI, gMin, gMinF, gMinI, gMoveToward, gPosmod, gPow, gRemap, gRound, gSign, gSignF, gSignI,
  gSmoothstep, gSnapped, gSnappedF, gSnappedI, gWrap, gAbsF, gAbsI, gWrapAny, gIsSame,
  gTypeString, gErrorString, gTypeExists,
  gWeakref, gInstanceFromId, gIsInstanceValid, gIsInstanceIdValid, gRidFromInt64, gRidAllocateId, gInstToDict,
  gRandi, gRandf, gRandomize, gSeed, gRandFromSeed, gRandiRange, gRandfRange, gRandfn,
  gSin, gCos, gTan, gAsin, gAcos, gAtan, gAtan2, gSinh, gCosh, gTanh, gAsinh, gAcosh, gAtanh, randNextUint32,
  gDbToLinear, gLinearToDb, gPingpong, gStepDecimals, gNearestPo2, gRotateToward, gLerpAngle,
  gBezierInterpolate, gBezierDerivative, gCubicAngle, gCubicInTime, gCubicAngleInTime } from "../builtins";
import { faceMemberKnown, nativeAritySay } from "../face-arity";
import { NULL_OBJECT } from "../class/identity/null-object";
import { Tag, V, type Variant } from "../tags";
import { GArray, GDict, valueEq } from "../values";
import { sortLess } from "../ops";
import { DICT_RO_WRITE, argAt, asDict, boolArgOr, elemCode, readOnlyWrite } from "./core";
import { one } from "./core";
import { asArray } from "./core";

export function dictMethod(obj: Variant, name: string, args: Variant[]): Variant {
    const d = obj.v as GDict;
    const dictSay = nativeAritySay("Dictionary", name, args.length);
    if (dictSay !== null) throw new GodotRuntimeError("dict-arity", dictSay);
    const roAt = DICT_RO_WRITE[name];
    if (roAt !== undefined && d.isReadOnly()) return readOnlyWrite(roAt, "Dictionary", name);
    switch (name) {
      case "make_read_only":
        d.markReadOnly();
        return V.nil();
      case "is_read_only":
        return V.bool(d.isReadOnly());
      case "size":
        return V.int(d.size());
      case "has":
        return V.bool(d.has(one(args, "has")));
      case "keys":
        return V.array(GArray.of(d.keys()));
      case "values":
        return V.array(GArray.of(d.values()));
      case "get":
        return d.has(one(args, "get")) ? d.get(args[0] as Variant) : (args[1] ?? V.nil());
      case "set":
        d.set(args[0] as Variant, args[1] as Variant);
        return V.bool(true);
      case "is_empty":
        return V.bool(d.isEmpty());
      case "erase":
        return V.bool(d.erase(one(args, "erase")));
      case "clear":
        d.clearAll();
        return V.nil();
      case "merge":
        d.mergeWith(asDict(one(args, "merge"), "merge"), boolArgOr(args, 1, false));
        return V.nil();
      case "merged": {
        const copy = d.duplicate(false);
        copy.mergeWith(asDict(one(args, "merged"), "merged"), boolArgOr(args, 1, false));
        return V.dict(copy);
      }
      case "get_or_add": {
        const key = one(args, "get_or_add");
        if (d.has(key)) return d.get(key);
        const added = args[1] ?? V.nil();
        if (d.isReadOnly()) return added;
        d.set(key, added);
        return added;
      }
      case "recursive_equal": {
        const other = one(args, "recursive_equal");
        argAt(args, 1, "recursive_equal");
        return V.bool(valueEq(V.dict(d), other, 0, "=="));
      }
      case "has_all":
        return V.bool(d.hasAll(asArray(one(args, "has_all"), "has_all")));
      case "find_key":
        return d.findKey(one(args, "find_key"));
      case "assign":
        d.assignFrom(asDict(one(args, "assign"), "assign"));
        return V.nil();
      case "duplicate":
        return V.dict(d.duplicate(boolArgOr(args, 0, false)));
      case "duplicate_deep": {
        if (args.length > 0 && (args[0] as Variant).t !== Tag.INT) {
          throw new UnsupportedError("duplicate-deep-arg", "Dictionary.duplicate_deep() 的模式参数只量过 int 来源");
        }
        return V.dict(d.duplicate(true));
      }
      case "is_typed":
        return V.bool(d.keyKind !== null || d.valKind !== null);
      case "is_typed_key":
        return V.bool(d.keyKind !== null);
      case "is_typed_value":
        return V.bool(d.valKind !== null);
      case "is_same_typed": {
        const other = one(args, "is_same_typed");
        if (!(other.t === Tag.DICT)) throw new UnsupportedError("typed-query-arg", "Dictionary.is_same_typed() 只量过 Dictionary 实参");
        const o = other.v as GDict;
        return V.bool(d.keyKind === o.keyKind && d.valKind === o.valKind);
      }
      case "is_same_typed_key": {
        const other = one(args, "is_same_typed_key");
        if (!(other.t === Tag.DICT)) throw new UnsupportedError("typed-query-arg", "Dictionary.is_same_typed_key() 只量过 Dictionary 实参");
        return V.bool(d.keyKind === (other.v as GDict).keyKind);
      }
      case "is_same_typed_value": {
        const other = one(args, "is_same_typed_value");
        if (!(other.t === Tag.DICT)) throw new UnsupportedError("typed-query-arg", "Dictionary.is_same_typed_value() 只量过 Dictionary 实参");
        return V.bool(d.valKind === (other.v as GDict).valKind);
      }
      case "get_typed_key_builtin":
        return V.int(elemCode(d.keyKind));
      case "get_typed_value_builtin":
        return V.int(elemCode(d.valKind));
      case "get_typed_key_class_name":
      case "get_typed_value_class_name":
        return V.stringName("");
      case "get_typed_key_script":
      case "get_typed_value_script":
        return V.object(NULL_OBJECT);
      case "hash":
        return V.int(variantHashNumber(obj));
      case "sort":
        if (d.isReadOnly()) {
          throw new UnsupportedError("dict-ro-sort", "只读 Dictionary 上的 sort() 没量过（引擎那句块文案没读数）");
        }
        d.sortKeys(sortLess);
        return V.nil();
      default:
        if (!faceMemberKnown("Dictionary", name)) throw new GodotRuntimeError("dict-no-method", `Invalid call. Nonexistent function '${name}' in base 'Dictionary'.`);
        throw new UnsupportedError("dict-method", `Dictionary.${name}() 未实现`);
    }
}
