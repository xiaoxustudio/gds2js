import { GodotRuntimeError, UnsupportedError } from "./errors";
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
  gBezierInterpolate, gBezierDerivative, gCubicAngle, gCubicInTime, gCubicAngleInTime } from "./builtins";
import { classNameOf, getMeta, hasMeta, methodAritiesOf, nativeBaseOf, removeMeta, setMeta, hasStaticName, wrapValue, GdScriptObject, scriptLabelOf, ClassDesc } from "./object";
import { CallableBox, callableLabel, isCallableBox, isNullCallable } from "./object";
import { callDeferred } from "./callable";
import { nativeAritySay } from "./face-arity";
import { isEncodedObjectIdBox, isWeakRefBox, NULL_OBJECT } from "./identity";
import { asRid } from "./rid";
import { signalDuplicateConnect, signalNullCallable } from "./frames";
import { asNodePath, NODE_PATH_SLICE_END_DEFAULT, nodePathMethod, nodePathSlice } from "./node-path";
import type { GdIdentified } from "./identity";
import { GdNativeClass } from "./native-class";
import { Signal } from "./signal";
import { Tag, V, type Variant } from "./tags";
import { GArray, GDict } from "./values";
import { GVector2, vector2Method } from "./vector2";
import { GVector3, vector3Method } from "./vector3";
import { GVector4, vector4Method } from "./vector4";
import { GVector4i, vector4iMethod } from "./vector4i";
import { GVector2i, vector2iMethod } from "./vector2i";
import { GVector3i, vector3iMethod } from "./vector3i";
import { colorMethod, GColor } from "./color";
import { bytesMethod, GBytes, packTypeName } from "./packed";
import { CONVERT_INFO, DECODE_INFO, ENCODE_INFO, FLOAT_DECODE_INFO, FLOAT_ENCODE_INFO, VAR_CODEC_GUARD, bytesBswap, bytesDecompressDynamic, bytesMultibyte, bytesUtf32, packConvert, packDecode, packDecodeFloat, packEncode, packEncodeFloat, packVarCodec } from "./method-bytes";
import { callableMethod } from "./method-callable";
import { attribute, callSlot, callStatic, callvArgs, descFor, objectBaseLabel, scriptMethodSay, scriptParamArgs, writeProp } from "./method-access";
import { deferredArityBlock, isAritySay } from "./method-core";
import { callCallableBox } from "./method-callable";
import { nodePathSliceArg } from "./method-core";

export function objectMethod(obj: Variant, name: string, args: Variant[]): Variant {
  const inner = obj.v;

  if (inner instanceof GdNativeClass) {
    throw new UnsupportedError("native-class-member", `引擎类 ${inner.className} 的 .${name}() 还没建模（实测 Node.new() 造得出实例、我们不发）`);
  }
  const vecFace =
    inner instanceof GVector2 ? "Vector2" :
    inner instanceof GVector3 ? "Vector3" :
    inner instanceof GVector4 ? "Vector4" :
    inner instanceof GVector4i ? "Vector4i" :
    inner instanceof GVector2i ? "Vector2i" :
    inner instanceof GVector3i ? "Vector3i" : "";
  if (vecFace !== "") {
    const vecSay = nativeAritySay(vecFace, name, args.length);
    if (vecSay !== null) throw new GodotRuntimeError("vector-arity", vecSay);
  }
  if (inner instanceof GVector2) return vector2Method(inner, name, args);
  if (inner instanceof GVector3) return vector3Method(inner, name, args);
  if (inner instanceof GVector4) return vector4Method(inner, name, args);
  if (inner instanceof GVector4i) return vector4iMethod(inner, name, args);
  if (inner instanceof GVector2i) return vector2iMethod(inner, name, args);
  if (inner instanceof GVector3i) return vector3iMethod(inner, name, args);
  if (inner instanceof GColor) {
    const colSay = nativeAritySay("Color", name, args.length);
    if (colSay !== null) throw new GodotRuntimeError("color-arity", colSay);
    return colorMethod(inner, name, args);
  }
  if (inner instanceof GBytes) {
    const packSay = nativeAritySay(packTypeName(inner.kind), name, args.length);
    if (packSay !== null) throw new GodotRuntimeError("packed-arity", packSay);
    if (name === "bswap16") return bytesBswap(inner, 16, args);
    if (name === "bswap32") return bytesBswap(inner, 32, args);
    if (name === "bswap64") return bytesBswap(inner, 64, args);
    if (DECODE_INFO[name] !== undefined || ENCODE_INFO[name] !== undefined || FLOAT_DECODE_INFO[name] !== undefined || FLOAT_ENCODE_INFO[name] !== undefined || VAR_CODEC_GUARD[name] !== undefined || CONVERT_INFO[name] !== undefined || name === "get_string_from_utf32" || name === "to_vector4_array" || name === "get_string_from_multibyte_char" || name === "decompress_dynamic") {
      if (inner.kind !== "byte") {
        throw new GodotRuntimeError("packed-no-method", `Invalid call. Nonexistent function '${name}' in base '${packTypeName(inner.kind)}'.`);
      }
      if (name === "get_string_from_multibyte_char") return bytesMultibyte(inner, args);
      if (name === "decompress_dynamic") return bytesDecompressDynamic(inner, args);
      if (name === "get_string_from_utf32") return bytesUtf32(inner);
      if (CONVERT_INFO[name] !== undefined) return packConvert(inner, name);
      if (VAR_CODEC_GUARD[name] !== undefined) return packVarCodec(inner, name, args);
      if (DECODE_INFO[name] !== undefined) return packDecode(inner, name, args);
      if (ENCODE_INFO[name] !== undefined) return packEncode(inner, name, args);
      return FLOAT_DECODE_INFO[name] !== undefined ? packDecodeFloat(inner, name, args) : packEncodeFloat(inner, name, args);
    }
    return bytesMethod(inner, name, args);
  }

  if (inner instanceof Signal) {
    const sgSay = nativeAritySay("Signal", name, args.length);
    if (sgSay !== null) throw new GodotRuntimeError("signal-arity", sgSay);
    if (name === "emit") {
      inner.emitList(args);
      return V.nil();
    }
    if (name === "connect") {
      const cb = args[0];
      if (cb === undefined || !isCallableBox(cb.v)) {
        throw new UnsupportedError("signal-connect", "connect() 的 Callable 实参这一格没量过（非 Callable 来源）");
      }
      const flags = args.length > 1 ? (args[1] as Variant) : V.int(0);
      if (flags.t !== Tag.INT) {
        throw new UnsupportedError("signal-flag", "connect() 的 flags 只量过 int 来源");
      }
      const n = Number(flags.v);
      if (n === 1) {
        throw new UnsupportedError("signal-flag-deferred", "connect() 的 CONNECT_DEFERRED 要宿主先有对象生命周期模型，否则局部实例那一形会从静默丢行变成静默多印");
      }
      if (n !== 0 && n !== 2 && n !== 4 && n !== 8) {
        throw new UnsupportedError("signal-flag", `connect() 的 flags=${n} 没量过（只量过 0 / 1 / 2 / 4 / 8）`);
      }
      const box = cb.v as CallableBox;
      if (isNullCallable(box)) {
        signalNullCallable(inner.sigName);
        return V.int(31);
      }
      const rc = inner.connectTo(box, (a: Variant[]) => {
        callCallableBox(box, a);
      }, n);
      if (rc === 31) {
        const label = callableLabel(box);
        if (label !== null) signalDuplicateConnect(inner.sigName, label);
      }
      return V.int(rc);
    }
    if (name === "disconnect") {
      const cb = args[0];
      if (cb === undefined || !isCallableBox(cb.v)) {
        throw new UnsupportedError("signal-disconnect", "disconnect() 的 Callable 实参这一格没量过（非 Callable 来源）");
      }
      inner.disconnectFrom(cb.v as CallableBox);
      return V.nil();
    }
    if (name === "get_name") return V.str(inner.sigName);
    if (name === "is_null") return V.bool(inner.sigName === "");
    if (name === "get_object") {
      if (inner.sigName !== "") throw new UnsupportedError("signal-object", "带名 Signal 的 get_object() 要宿主对象，没量过");
      return V.object(NULL_OBJECT);
    }
    if (name === "get_object_id") {
      if (inner.sigName !== "") throw new UnsupportedError("signal-object", "带名 Signal 的 get_object_id() 折的是宿主实例号，没量过");
      return V.int(0);
    }
    if (name === "is_connected") {
      const cb = args[0];
      if (cb === undefined || !isCallableBox(cb.v)) {
        throw new UnsupportedError("signal-is-connected", "is_connected() 的 Callable 实参这一格没量过（非 Callable 来源）");
      }
      return V.bool(inner.isConnected(cb.v as CallableBox));
    }
    if (name === "has_connections") return V.bool(inner.hasConnections());
    if (name === "get_connections") {
      const rows = inner.connections();
      const out: Variant[] = [];
      for (const row of rows) {
        const d = new GDict();
        d.set(V.str("signal"), V.object(inner));
        d.set(V.str("callable"), V.object(row.box));
        d.set(V.str("flags"), V.int(row.flags));
        out.push(V.dict(d));
      }
      return V.array(GArray.of(out));
    }
    if (name === "has_method" || name === "get_method_list" || name === "is_connected_to") {
      throw new GodotRuntimeError("signal-method", `Invalid call. Nonexistent function '${name}' in base 'Signal'.`);
    }
    throw new UnsupportedError("signal-method", `Signal.${name}() 未实现`);
  }

  const ridv = asRid(obj);
  if (ridv !== null) {
    if (name === "get_id") {
      if (args.length !== 0) {
        throw new GodotRuntimeError("arity", `Too many arguments for "get_id()" call. Expected at most 0 but received ${String(args.length)}.`);
      }
      return V.int(ridv.id);
    }
    throw new GodotRuntimeError("rid-method", `Invalid call. Nonexistent function '${name}' in base 'RID'.`);
  }

  const npv = asNodePath(obj);
  if (npv !== null) {
    const npSay = nativeAritySay("NodePath", name, args.length);
    if (npSay !== null) throw new GodotRuntimeError("node-path-arity", npSay);
    if (name === "slice") {
      const begin = nodePathSliceArg(args, 0);
      const end = args.length > 1 ? nodePathSliceArg(args, 1) : NODE_PATH_SLICE_END_DEFAULT;
      return V.object(nodePathSlice(npv, begin, end));
    }
    return nodePathMethod(npv, name, args);
  }

  if (isWeakRefBox(inner)) {
    if (name !== "get_ref") {
      throw new UnsupportedError("weakref-method", `WeakRef.${name}() 没量过（只发得出实测的 get_ref()）`);
    }
    if (args.length !== 0) {
      throw new GodotRuntimeError("arity", `get_ref() 不接受参数（收到 ${args.length} 个）`);
    }
    return inner.target === null ? V.nil() : inner.target;
  }

  if (isEncodedObjectIdBox(inner)) {
    if (name !== "get_object_id") {
      throw new UnsupportedError("encoded-object-id-method", `EncodedObjectAsID.${name}() 没量过（只发得出实测的 get_object_id()）`);
    }
    if (args.length !== 0) {
      throw new GodotRuntimeError("arity", `get_object_id() 不接受参数（收到 ${args.length} 个）`);
    }
    return V.int(inner.storedId);
  }

  if (isCallableBox(inner)) {
    return callableMethod(inner, name, args);
  }

  if (inner instanceof ClassDesc) {
    if (name === "new") return V.object(inner.make(args));
    if (hasStaticName(inner, name)) return callStatic(inner, name, args);
    throw new UnsupportedError("script-method", `脚本上的 ${name}() 未实现`);
  }

  if (name === "has_method") {
    const m = args[0];
    if (m === undefined || (m.t !== Tag.STRING && m.t !== Tag.STRING_NAME)) {
      throw new GodotRuntimeError("has-method", "has_method() 需要一个 String 实参");
    }
    const key = m.v as string;
    return V.bool(
      key === "has_method" || key === "get_class" || key === "set_meta" || key === "get_meta" ||
      key === "has_meta" || key === "remove_meta" ||
      typeof (inner as Record<string, unknown>)[key] === "function" ||
      hasStaticName(inner, key),
    );
  }
  if (name === "get_class") {
    const base = nativeBaseOf(inner);
    if (base === null) throw new UnsupportedError("get-class", `get_class() 还不知道这个类的原生基类`);
    return V.str(base);
  }
  if (name === "get_instance_id") {
    if (args.length !== 0) {
      throw new GodotRuntimeError("arity", `get_instance_id() 不接受参数（收到 ${args.length} 个）`);
    }
    const id = (obj.v as GdIdentified).gdObjectId;
    if (!(id > 0)) throw new UnsupportedError("instance-id", "这一类对象还没发身份号");
    return V.int(id);
  }
  if (name === "is_class") {
    const a0 = args[0] as Variant | undefined;
    if (a0 === undefined || (a0.t !== Tag.STRING && a0.t !== Tag.STRING_NAME)) {
      throw new GodotRuntimeError("is-class", "is_class() 需要一个 String 实参");
    }
    const base = nativeBaseOf(inner);
    if (base === null) throw new UnsupportedError("is-class", "is_class() 还不知道这个类的原生基类");
    const want = a0.v as string;
    return V.bool(want === base || want === "Object");
  }
  if (name === "set" || name === "get") {
    const key = args[0] as Variant | undefined;
    if (key === undefined || (key.t !== Tag.STRING && key.t !== Tag.STRING_NAME)) {
      throw new GodotRuntimeError("object-setget", `${name}() 的第一个实参需要是属性名（String）`);
    }
    const prop = key.v as string;
    if (name === "get") {
      if (args.length !== 1) throw new GodotRuntimeError("arity", `get() 需要 1 个参数（收到 ${args.length} 个）`);
      if (!(prop in (inner as Record<string, unknown>))) return V.nil();
      return wrapValue(attribute(obj, prop));
    }
    if (args.length !== 2) throw new GodotRuntimeError("arity", `set() 需要 2 个参数（收到 ${args.length} 个）`);
    if (!Object.hasOwn(inner as object, prop)) return V.nil();
    try {
      writeProp(obj, prop, args[1] as Variant);
    } catch (e) {
      if (e instanceof GodotRuntimeError) return V.nil();
      throw e;
    }
    return V.nil();
  }
  if (name === "call" || name === "callv") {
    const fname = args[0] as Variant | undefined;
    if (fname === undefined || (fname.t !== Tag.STRING && fname.t !== Tag.STRING_NAME)) {
      throw new GodotRuntimeError("object-call", `${name}() 的第一个实参需要是方法名（String）`);
    }
    const who = fname.v as string;
    const label = objectBaseLabel(inner);
    const fn = (inner as Record<string, unknown>)[who];
    if (typeof fn !== "function") {
      throw new GodotRuntimeError("object-call", `Invalid call. Nonexistent function '${who} (via call)' in base '${label}'.`);
    }
    const rest = name === "call" ? (args.slice(1) as Variant[]) : callvArgs(args[1] as Variant | undefined);
    const declared = methodAritiesOf(inner)?.[who];
    if (declared === undefined) {
      throw new UnsupportedError("object-call-arity", `Object.call() 拿不到 ${who}() 的声明形参数（方法表里没有它）`);
    }
    const min = declared[0];
    const max = declared[1];
    if (rest.length < min || rest.length > max) {
      if (name === "callv") {
        return V.nil();
      }
      throw new GodotRuntimeError(
        "object-call",
        `Invalid call to function '${who} (via call)' in base '${label}'. Expected ${max} argument(s).`,
      );
    }
    const hit = callSlot(inner, who, rest);
    if (hit === null) {
      throw new UnsupportedError("method-slot-missing", `${who}() 在接收者上不可调用（注册表与产物不一致）`);
    }
    return hit;
  }
  if (name === "call_deferred") {
    const fname = args[0] as Variant | undefined;
    if (fname === undefined || (fname.t !== Tag.STRING && fname.t !== Tag.STRING_NAME)) {
      throw new GodotRuntimeError("object-call", `call_deferred() 的第一个实参需要是方法名（String）`);
    }
    const who = fname.v as string;
    const fn = (inner as Record<string, unknown>)[who];
    if (typeof fn !== "function") {
      throw new UnsupportedError("object-call-deferred", `call_deferred("${who}") 的方法不存在，失败形状也没量过`);
    }
    const rest = args.slice(1) as Variant[];
    callDeferred(() => {
      try {
        callSlot(inner, who, rest);
      } catch (e) {
        if (!isAritySay(e)) throw e;
        const base = nativeBaseOf(inner);
        const file = scriptLabelOf(inner);
        const want = methodAritiesOf(inner)?.[who]?.[0];
        if (base === null || file === null || want === undefined) throw e;
        deferredArityBlock(base, file, who, want, rest.length);
      }
    });
    return V.nil();
  }
  if (name === "set_meta" || name === "get_meta" || name === "has_meta" || name === "remove_meta") {
    const obj = inner as object;
    if (name === "set_meta") {
      if (args.length !== 2) throw new GodotRuntimeError("arity", `set_meta() 需要 2 个参数（收到 ${args.length} 个）`);
      setMeta(obj, args[0] as Variant, args[1] as Variant);
      return V.nil();
    }
    if (name === "has_meta") {
      if (args.length !== 1) throw new GodotRuntimeError("arity", `has_meta() 需要 1 个参数（收到 ${args.length} 个）`);
      return V.bool(hasMeta(obj, args[0] as Variant));
    }
    if (name === "remove_meta") {
      if (args.length !== 1) throw new GodotRuntimeError("arity", `remove_meta() 需要 1 个参数（收到 ${args.length} 个）`);
      removeMeta(obj, args[0] as Variant);
      return V.nil();
    }
    if (args.length > 2 || args.length < 1) throw new GodotRuntimeError("arity", `get_meta() 需要 1 或 2 个参数（收到 ${args.length} 个）`);
    return getMeta(obj, args[0] as Variant, args[1]);
  }

  const smSay = scriptMethodSay(inner, name, args);
  if (smSay !== null) throw new GodotRuntimeError("script-method-arity", smSay);
  const direct = callSlot(inner, name, scriptParamArgs(inner, name, args));
  if (direct !== null) return direct;

  const sd = descFor(inner);
  if (sd !== null && hasStaticName(sd, name)) return callStatic(sd, name, args);
  if (inner instanceof GdScriptObject) {
    const member = (inner as unknown as Record<string, unknown>)[name];
    if (typeof member === "function") {
      throw new UnsupportedError("method-slot-missing", `${name}() 不在 ${classNameOf(inner) ?? "Object"} 的派发表里（脚本类的方法都由发射器进了表）`);
    }
  }

  throw new UnsupportedError("object-method", `对象上的 ${name}() 未实现`);
}
