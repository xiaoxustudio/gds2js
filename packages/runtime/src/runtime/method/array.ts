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
import { NULL_OBJECT } from "../identity";
import { arrayIndexOob, arrayEmptyBlock } from "../frames";
import { Tag, V, type Variant } from "../tags";
import { GArray } from "../values";
import { isLess, sortLess } from "../ops";
import { ARRAY_RO_WRITE, argAt, arrayIndexArg, boolArgOr, elemCode, intArg, intArgOr, readOnlyWrite } from "./core";
import { one } from "./core";
import { callerOf, comparatorOf, lessOrFalse, predOf } from "./callable";
import { asArray } from "./core";

export function arrayMethod(obj: Variant, name: string, args: Variant[]): Variant {
    const a = obj.v as GArray;
    const arrSay = nativeAritySay("Array", name, args.length);
    if (arrSay !== null) throw new GodotRuntimeError("array-arity", arrSay);
    const roAt = ARRAY_RO_WRITE[name];
    if (roAt !== undefined && a.isReadOnly()) return readOnlyWrite(roAt, "Array", name);
    switch (name) {
      case "make_read_only":
        a.markReadOnly();
        return V.nil();
      case "is_read_only":
        return V.bool(a.isReadOnly());
      case "append":
        a.append(one(args, "append"));
        return V.nil();
      case "duplicate": {
        const copy = a.duplicate(boolArgOr(args, 0, false));
        copy.className = a.classNamed();
        return V.array(copy);
      }
      case "duplicate_deep": {
        if (args.length > 0 && (args[0] as Variant).t !== Tag.INT) {
          throw new UnsupportedError("duplicate-deep-arg", "Array.duplicate_deep() 的模式参数只量过 int 来源");
        }
        return V.array(a.duplicate(true));
      }
      case "is_typed":
        return V.bool(a.typedAny());
      case "is_same_typed": {
        const other = one(args, "is_same_typed");
        if (!(other.t === Tag.ARRAY)) throw new UnsupportedError("typed-query-arg", "Array.is_same_typed() 只量过 Array 实参");
        const oa = other.v as GArray;
        return V.bool(a.elemKind() === oa.elemKind() && a.classNamed() === oa.classNamed());
      }
      case "get_typed_builtin":
        return V.int(a.classNamed() !== "" ? 24 : elemCode(a.elemKind()));
      case "get_typed_class_name":
        return V.stringName(a.classNamed());
      case "get_typed_script":
        return V.object(NULL_OBJECT);
      case "size":
        return V.int(a.size());
      case "is_empty":
        return V.bool(a.size() === 0);
      case "has":
        return V.bool(a.has(one(args, "has")));
      case "get": {
        const i = arrayIndexArg(args[0], "get");
        if (i < 0 || i >= a.size()) {
          arrayIndexOob("get", i, a.size());
          return V.nil();
        }
        return a.get(i);
      }
      case "set": {
        const i = arrayIndexArg(args[0], "set");
        const val = args[1] as Variant;
        if (i < 0 || i >= a.size()) {
          arrayIndexOob("set", i, a.size());
          return V.nil();
        }
        if (a.isReadOnly()) {
          throw new UnsupportedError("array-ro-set", "只读 Array 上的 set() 没量过（引擎那句块文案没读数）");
        }
        a.set(i, val);
        return V.nil();
      }
      case "front":
        if (a.size() === 0) {
          arrayEmptyBlock("front", 355);
          return V.nil();
        }
        return a.get(0);
      case "back":
        if (a.size() === 0) {
          arrayEmptyBlock("back", 360);
          return V.nil();
        }
        return a.get(a.size() - 1);
      case "pick_random":
        if (a.size() === 0) {
          arrayEmptyBlock("pick_random", 365);
          return V.nil();
        }
        return a.get(randNextUint32() % a.size());
      case "shuffle": {
        const items = a.raw();
        const n = items.length;
        for (let i = n - 1; i >= 1; i--) {
          const j = randNextUint32() % (i + 1);
          const t = items[i] as Variant;
          items[i] = items[j] as Variant;
          items[j] = t;
        }
        return V.nil();
      }
      case "insert":
        return V.int(a.insertAt(intArg(args, 0, "insert"), argAt(args, 1, "insert")) ? 0 : 31);
      case "erase":
        a.erase(one(args, "erase"));
        return V.nil();
      case "push_front":
        a.pushFront(one(args, "push_front"));
        return V.nil();
      case "push_back":
        a.append(one(args, "push_back"));
        return V.nil();
      case "pop_front":
        return a.popFront();
      case "pop_back":
        return a.popBack();
      case "pop_at":
        return a.popAt(intArg(args, 0, "pop_at"));
      case "remove_at":
        a.removeAt(intArg(args, 0, "remove_at"));
        return V.nil();
      case "clear":
        a.clearAll();
        return V.nil();
      case "reverse":
        a.reverseItems();
        return V.nil();
      case "fill":
        a.fillWith(one(args, "fill"));
        return V.nil();
      case "append_array":
        a.appendAll(asArray(one(args, "append_array"), "append_array"));
        return V.nil();
      case "assign":
        a.assignFrom(asArray(one(args, "assign"), "assign"));
        return V.nil();
      case "slice":
        return V.array(
          a.sliceItems(
            intArgOr(args, 0, 0),
            args[1] === undefined ? null : intArg(args, 1, "slice"),
            intArgOr(args, 2, 1),
            boolArgOr(args, 3, false),
          ),
        );
      case "resize": {
        const n = intArg(args, 0, "resize");
        a.resize(n);
        return V.int(n < 0 ? 31 : 0);
      }
      case "sort":
        a.sort(sortLess);
        return V.nil();
      case "sort_custom": {
        const before = comparatorOf(args[0], "sort_custom");
        a.sortCustom(before);
        return V.nil();
      }
      case "bsearch":
        return V.int(a.bsearch(one(args, "bsearch"), boolArgOr(args, 1, true), lessOrFalse));
      case "bsearch_custom":
        return V.int(a.bsearch(one(args, "bsearch_custom"), boolArgOr(args, 2, true), comparatorOf(args[1], "bsearch_custom")));
      case "find":
        return V.int(a.findSame(one(args, "find"), intArgOr(args, 1, 0)));
      case "rfind":
        return V.int(a.rfindSame(one(args, "rfind"), intArgOr(args, 1, -1)));
      case "count":
        return V.int(a.count(one(args, "count")));
      case "filter":
        return V.array(a.filterBy(predOf(args[0], "filter")));
      case "map":
        return V.array(a.mapBy(predOf(args[0], "map")));
      case "any":
        return V.bool(a.anyBy(predOf(args[0], "any")));
      case "all":
        return V.bool(a.allBy(predOf(args[0], "all")));
      case "find_custom":
        return V.int(a.findCustom(predOf(args[0], "find_custom"), intArgOr(args, 1, 0)));
      case "rfind_custom":
        return V.int(a.rfindCustom(predOf(args[0], "rfind_custom"), intArgOr(args, 1, -1)));
      case "reduce": {
        const call = callerOf(args[0], 2, "reduce");
        const items = a.raw();
        let acc: Variant;
        let start = 0;
        if (args.length > 1) {
          acc = args[1] as Variant;
        } else {
          if (items.length === 0) return V.nil();
          acc = items[0] as Variant;
          start = 1;
        }
        for (let i = start; i < items.length; i++) {
          const r = call([acc, items[i] as Variant]);
          if (r === null) return V.nil();
          acc = r;
        }
        return acc;
      }
      case "min":
        return a.extreme(true, isLess) ?? V.nil();
      case "max":
        return a.extreme(false, isLess) ?? V.nil();
      case "hash":
        return V.int(variantHashNumber(obj));
      default:
        if (!faceMemberKnown("Array", name)) {
          throw new GodotRuntimeError("array-no-method", `Invalid call. Nonexistent function '${name}' in base 'Array'.`);
        }
        throw new UnsupportedError("array-method", `Array.${name}() 未实现`);
    }
}
