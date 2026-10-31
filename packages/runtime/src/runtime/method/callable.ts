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
import { boundArgsOf, callableArityBounds, declaredArgCount, descOf, methodAritiesOf, nativeBaseOf, requiredArgCount, wrapValue, scriptLabelOf, ctorAritiesOf } from "../class/object/script-object";
import { CallableBox, callableLabel, isCallableBox, isNullCallable, nullCallable } from "../class/object/script-object";
import { callDeferred } from "../class/identity/callable";
import { nativeAritySay } from "../face-arity";
import { NULL_OBJECT } from "../class/identity/null-object";
import type { GdIdentified } from "../class/identity/null-object";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "../tags";
import { GArray, truthyOf } from "../values";
import { valueTypeName } from "../string-ops";
import { isLess } from "../ops";
import { attribute } from "./access";
import { deferredArityBlock, isAritySay } from "./core";

let methodDispatch: ((raw: unknown, name: string, args: Variant[]) => Variant) | null = null;
export function registerMethodDispatch(fn: (raw: unknown, name: string, args: Variant[]) => Variant): void {
  methodDispatch = fn;
}

export function callableCtor(args: Variant[]): Variant {
  if (args.length === 0) return nullCallable();
  if (args.length === 1) {
    const only = args[0] as Variant;
    if (isCallableBox(only.v)) return only;
    throw new UnsupportedError("callable-ctor", `Callable(x) 这一格只量过实参本身就是 Callable（收到 ${tagName(only.t)}）`);
  }
  if (args.length === 2) {
    const [obj, name] = args as [Variant, Variant | undefined];
    if (name === undefined || (name.t !== Tag.STRING && name.t !== Tag.STRING_NAME)) {
      throw new UnsupportedError("callable-ctor", "Callable(对象, 名字) 的第二个实参量过的是方法名字符串");
    }
    if (obj.t === Tag.NIL) {
      return V.object(new CallableBox(null, String(name.v), null, [], null, false, null, null, 0, null, 0, "null"));
    }
    if (obj.t === Tag.INT) {
      return V.object(new CallableBox(null, String(name.v), null, [], null, false, null, null, 0, null, 0, "int"));
    }
    let hit: Variant | null = null;
    try {
      hit = attribute(obj, String(name.v)) as Variant;
    } catch {
      hit = null;
    }
    if (hit !== null && isCallableBox(hit.v)) return hit;
    return V.object(new CallableBox(null, String(name.v), obj, [], null, false, null, null, 0, null, 0, null, true));
  }
  throw new UnsupportedError(
    "callable-ctor",
    `Callable() 只量过 0、1、2 参（收到 ${args.length} 个）`,
  );
}

export function callableStatic(name: string, args: Variant[] = []): Variant {
  if (name === "create") {
    if (args.length !== 2) {
      throw new UnsupportedError("callable-create-arity", "Callable.create() 的元数没量过（只量过 2 个实参）");
    }
    const a0 = args[0] as Variant;
    if (a0.t !== Tag.OBJECT && a0.t !== Tag.NIL && a0.t !== Tag.INT) {
      throw new UnsupportedError("callable-create-obj", "Callable.create() 的第一个实参只量过对象 / null / int 来源");
    }
    return callableCtor(args);
  }
  throw new UnsupportedError("callable-static", `Callable.${name} 未实现`);
}

export function callCallableBox(box: CallableBox, args: Variant[]): Variant {
  if (box.invalidMethod) {
    throw new GodotRuntimeError("callable-invalid-method-call", `Invalid call. Nonexistent function '${callableCallLabel(box)} (Callable)'.`);
  }
  if (box.detachedOwner !== null) {
    throw new GodotRuntimeError("callable-detached-call", `Attempt to call function '${box.detachedOwner}::${String(box.name)} (Callable)' on a null instance.`);
  }
  const all: Variant[] = [];
  for (const a of keptCallArgs(box, args)) all.push(a);
  for (const b of box.bound) all.push(b);
  if (box.fn !== null) return wrapValue(box.fn(all));
  if (box.name !== null && box.object !== null) {
    if (methodDispatch === null) throw new UnsupportedError("method-dispatch-unregistered", "Callable 按名字调用要经 method() 分派，注册那一步没发生");
    return methodDispatch(box.object, box.name, all);
  }
  throw new GodotRuntimeError("callable-null-call", "Attempt to call function 'null::null (Callable)' on a null instance.");
}

function callableCall(box: CallableBox, args: Variant[]): Variant {
  if (isNullCallable(box)) {
    throw new GodotRuntimeError("callable-null-call", "Attempt to call function 'null::null (Callable)' on a null instance.");
  }
  if (box.name === "new" && box.object !== null) {
    const ctor = ctorAritiesOf(box.object.v);
    if (ctor !== null && keptCallArgs(box, args).length + boundArgsOf(box).length < ctor[0]) {
      throw new GodotRuntimeError(
        "callable-arity",
        `Invalid call to function '${callableCallLabel(box)} (Callable)'. Expected ${ctor[0]} argument(s).`,
      );
    }
  }
  const bounds = callableArityBounds(box);
  if (bounds !== null) {
    const given = keptCallArgs(box, args).length + boundArgsOf(box).length;
    if (given < bounds[0] || given > bounds[1]) {
      const n = box.builtin !== null || given > bounds[1] ? bounds[1] : bounds[0];
      throw new GodotRuntimeError(
        "callable-arity",
        `Invalid call to function '${callableCallLabel(box)} (Callable)'. Expected ${n} argument(s).`,
      );
    }
  }
  return callCallableBox(box, args);
}

function unbindCountArg(args: readonly Variant[]): number {
  const v = args[0] as Variant;
  if (v.t !== Tag.INT) throw new UnsupportedError("callable-unbind-arg", `Callable.unbind() 的实参只量过 int（收到 ${tagName(v.t)}）`);
  const n = intToNum(v.v as IntPayload);
  if (n < 0) throw new UnsupportedError("callable-unbind-neg", "Callable.unbind() 的负数那一形没量过，不发");
  return n;
}

function keptCallArgs(box: CallableBox, args: Variant[]): Variant[] {
  if (box.unbindCount === 0) return args;
  if (args.length < box.unbindCount) {
    throw new GodotRuntimeError(
      "callable-unbind-count",
      `Callable unbinds ${String(box.unbindCount)} arguments, but called with ${String(args.length)}`,
    );
  }
  return args.slice(0, args.length - box.unbindCount);
}

function callableCallLabel(box: CallableBox): string {
  const label = callableLabel(box);
  if (label !== null) return label;
  throw new UnsupportedError("callable-arity-label", "还不知道这个 Callable 的函数标签");
}

const CALLABLE_METHOD_NAMES = new Set([
  "bind",
  "bindv",
  "call",
  "call_deferred",
  "callv",
  "create",
  "get_argument_count",
  "get_bound_arguments",
  "get_bound_arguments_count",
  "get_unbound_arguments_count",
  "get_method",
  "get_object",
  "get_object_id",
  "hash",
  "is_custom",
  "is_null",
  "is_standard",
  "is_valid",
  "rpc",
  "rpc_id",
  "unbind",
]);

export function callableMethod(box: CallableBox, name: string, args: Variant[]): Variant {
  const cbSay = nativeAritySay("Callable", name, args.length);
  if (cbSay !== null) throw new GodotRuntimeError("callable-arity", cbSay);
  const bound = boundArgsOf(box);
  const empty = isNullCallable(box);
  switch (name) {
    case "bind": {
      if (box.detachedOwner !== null || box.invalidMethod) throw new UnsupportedError("callable-detached-bind", "空对象方法 Callable 再 bind() 那一形没量过");
      if (box.defaultCount > 0) {
        throw new UnsupportedError("lambda-bind-default", "带默认值形参的 lambda 再 `bind()` 那一形没实测过，不发");
      }
      const next: Variant[] = [];
      if (box.unbindCount > 0) {
        for (const b of bound) next.push(b);
        return V.object(new CallableBox(box.fn, box.name, box.object, next, box.arity, true, box.builtin, box.builtinBounds, 0, box.builtinSnap, box.unbindCount - args.length < 0 ? 0 : box.unbindCount - args.length));
      }
      for (const a of args) next.push(a);
      for (const b of bound) next.push(b);
      return V.object(new CallableBox(box.fn, box.name, box.object, next, box.arity, true, box.builtin, box.builtinBounds, 0, box.builtinSnap));
    }
    case "bindv": {
      if (box.detachedOwner !== null || box.invalidMethod) throw new UnsupportedError("callable-detached-bind", "空对象方法 Callable 再 bindv() 那一形没量过");
      const arr = args[0] as Variant;
      if (!(arr.v instanceof GArray)) {
        throw new GodotRuntimeError(
          "callable-bindv-arg",
          `Invalid type in function 'bindv' in base 'Callable'. Cannot convert argument 1 from ${valueTypeName(arr)} to Array.`,
        );
      }
      const list = (arr.v as GArray).raw();
      if (list.length === 0) return V.object(box);
      if (box.defaultCount > 0) {
        throw new UnsupportedError("lambda-bind-default", "带默认值形参的 lambda 再 `bind()` 那一形没实测过，不发");
      }
      const nextv: Variant[] = [];
      if (box.unbindCount > 0) {
        for (const b of bound) nextv.push(b);
        return V.object(new CallableBox(box.fn, box.name, box.object, nextv, box.arity, true, null, null, 0, null, box.unbindCount - list.length < 0 ? 0 : box.unbindCount - list.length));
      }
      for (const a of list) nextv.push(a);
      for (const b of bound) nextv.push(b);
      return V.object(new CallableBox(box.fn, box.name, box.object, nextv, box.arity, true));
    }
    case "is_custom": {
      if (empty) return V.bool(false);
      return V.bool(box.builtin !== null || box.object === null || bound.length > 0 || box.unbindCount > 0);
    }
    case "is_standard": {
      if (empty) return V.bool(false);
      return V.bool(box.builtin === null && box.object !== null && bound.length === 0 && box.unbindCount === 0);
    }
    case "get_object_id": {
      if (empty || box.builtin !== null) return V.int(0);
      if (box.object === null) {
        if (box.name === null) {
          throw new UnsupportedError("callable-object-id-lambda", "lambda 的 get_object_id() 给的是定义它的脚本对象号，宿主不可复现");
        }
        return V.int(0);
      }
      const oid = box.object;
      if (oid.t !== Tag.OBJECT) throw new UnsupportedError("callable-object-id", "get_object_id() 的接收者不是对象盒子");
      const id = (oid.v as GdIdentified).gdObjectId;
      if (!(id > 0)) throw new UnsupportedError("instance-id", "这一类对象还没发身份号");
      return V.int(id);
    }
    case "hash":
      return V.int(variantHashNumber(V.object(box)));
    case "unbind": {
      if (box.detachedOwner !== null || box.invalidMethod) throw new UnsupportedError("callable-detached-unbind", "空对象方法 Callable 再 unbind() 那一形没量过");
      const n = box.unbindCount + unbindCountArg(args);
      const next: Variant[] = [];
      for (const b of bound) next.push(b);
      return V.object(new CallableBox(
        box.fn, box.name, box.object, next, box.arity, true, box.builtin, box.builtinBounds, box.defaultCount, box.builtinSnap, n,
      ));
    }
    case "get_bound_arguments":
      return V.array(GArray.of(bound.slice()));
    case "get_bound_arguments_count":
      return V.int(bound.length);
    case "get_unbound_arguments_count":
      return V.int(box.unbindCount);
    case "get_argument_count": {
      if (box.detachedOwner !== null || box.invalidMethod) return V.int(0);
      const declared = declaredArgCount(box);
      if (declared === null) {
        throw new UnsupportedError(
          "callable-arity-count",
          "get_argument_count() 拿不到这个 Callable 的声明形参数（方法表里没有它，或它带默认值形参 —— 那一格没量）",
        );
      }
      const left = declared - bound.length + box.unbindCount;
      return V.int(isNullCallable(box) ? 0 : left);
    }
    case "call":
      return callableCall(box, args);
    case "call_deferred": {
      if (empty) throw new UnsupportedError("callable-deferred-null", "空 Callable 上 call_deferred() 没量过");
      callDeferred(() => {
        try {
          callCallableBox(box, args);
        } catch (e) {
          if (!isAritySay(e) || box.builtin !== null || boundArgsOf(box).length > 0 || box.object === null || box.name === null) throw e;
          const base = nativeBaseOf(box.object.v);
          const file = scriptLabelOf(box.object.v);
          const want = methodAritiesOf(box.object.v)?.[box.name]?.[0];
          if (base === null || file === null || want === undefined) throw e;
          deferredArityBlock(base, file, box.name, want, args.length);
        }
      });
      return V.nil();
    }
    case "callv": {
      const arr = args[0];
      if (arr === undefined || !(arr.v instanceof GArray)) {
        throw new GodotRuntimeError("callable-callv", "callv() 需要一个 Array 实参");
      }
      if (empty) return V.nil();
      const given = (arr.v as GArray).raw();
      const bounds = callableArityBounds(box);
      if (bounds !== null) {
        const total = given.length + bound.length;
        if (total < bounds[0] || total > bounds[1]) return V.nil();
      }
      return callCallableBox(box, given);
    }
    case "get_method": {
      const m = box.name;
      if (m !== null) return V.stringName(m);
      if (empty) return V.stringName("");
      return V.stringName("<anonymous lambda>");
    }
    case "get_object": {
      if (box.builtin !== null) return V.object(NULL_OBJECT);
      if (box.detachedOwner !== null || box.invalidMethod) return V.object(NULL_OBJECT);
      if (box.object === null) {
        throw new UnsupportedError(
          "callable-get-object",
          "get_object() 这一支要给的是我们没建模的对象：lambda 的 owner 是定义它那个类的 GDScript 对象，空 Callable 与全局内置是 typeof 24 的 null Object（探头 tmp/probe-callable-object）",
        );
      }
      return box.object;
    }
    case "is_null":
      return V.bool(empty && bound.length === 0);
    case "is_valid":
      if (box.detachedOwner !== null || box.invalidMethod) return V.bool(false);
      if (empty && bound.length > 0) {
        throw new UnsupportedError("callable-is-valid-bound-null", "绑过实参的空 Callable 上 is_valid() 没量过");
      }
      return V.bool(!empty);
  }
  if (!CALLABLE_METHOD_NAMES.has(name)) {
    throw new GodotRuntimeError("callable-method", `Invalid call. Nonexistent function '${name}' in base 'Callable'.`);
  }
  if (name === "rpc" || name === "rpc_id") {
    if (box.fn !== null) {
      throw new GodotRuntimeError("callable-method", `Invalid call. Nonexistent function '${name}' in base 'Callable'.`);
    }
    if (box.builtin === null && (box.object !== null || empty)) {
      const ob = box.object;
      if (name === "rpc_id" && args.length === 0 && ob !== null && descOf(ob.v) !== null) {
        throw new GodotRuntimeError("callable-arity", "Invalid call to function 'rpc_id' in base 'Callable'. Expected 1 argument(s).");
      }
      throw new GodotRuntimeError("callable-null-instance", `Attempt to call function '${name}' in base 'Callable' on a null instance.`);
    }
  }
  throw new UnsupportedError("callable-method", `Callable.${name}() 未实现`);
}

export function callerOf(v: Variant | undefined, argc: number, who: string): (args: Variant[]) => Variant | null {
  const inner = v === undefined ? undefined : v.v;
  if (!(inner instanceof CallableBox)) {
    throw new UnsupportedError("array-callable", `Array.${who}() 需要一个 Callable`);
  }
  if (requiredArgCount(inner) !== argc) return () => null;
  return (args) => callCallableBox(inner, args);
}

export function predOf(v: Variant | undefined, who: string): (x: Variant) => Variant | null {
  const call = callerOf(v, 1, who);
  return (x) => call([x]);
}

export function comparatorOf(v: Variant | undefined, who: string): (a: Variant, b: Variant) => boolean {
  const call = callerOf(v, 2, who);
  return (x, y) => {
    const r = call([x, y]);
    return r !== null && truthyOf(r);
  };
}

const NO_ORDER = new Set(["compare-operands", "color-cmp"]);

export function lessOrFalse(a: Variant, b: Variant): boolean {
  try {
    return isLess(a, b);
  } catch (e) {
    if (NO_ORDER.has((e as { code?: string }).code ?? "")) return false;
    throw e;
  }
}
