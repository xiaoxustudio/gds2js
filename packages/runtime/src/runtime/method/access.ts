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
import { classNameOf, descOf, fieldTypesOf, methodParamsOf, methodAritiesOf, nativeBaseOf, staticCall, hasStaticName, varSlotOf, GdScriptObject, methodCallable, ClassDesc } from "../class/object/script-object";
import { boundBuiltinCallable } from "../class/identity/callable";
import { faceArity, faceMemberKnown, valueAttrKind } from "../face-arity";
import { readOnlyError } from "../frames";
import { GdNodePath } from "../class/identity/node-path";
import { GdNativeClass } from "../class/identity/native-class";
import { engineClassConst } from "../engine-class-consts";
import { Signal } from "../class/identity/signal";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "../tags";
import { GArray, GDict, toStringNameSlot, show } from "../values";
import { posOobSay, strAt, valueTypeName } from "../string-ops";
import { pctFormatOp } from "../ops";
import { GVector2, toVec2, vecReadIndex, vecWrite } from "../class/vector/vector2";
import { GVector3, vec3ReadIndex, vec3Write } from "../class/vector/vector3";
import { GVector4, vec4ReadIndex, vec4Write } from "../class/vector/vector4";
import { GVector4i, vec4iReadIndex, vec4iWrite } from "../class/vector/vector4i";
import { GVector2i, toVec2i, vec2iReadIndex, vec2iWrite } from "../class/vector/vector2i";
import { aabbReadProp } from "../class/shape/aabb";
import { planeReadProp } from "../class/orient/plane";
import { quaternionReadProp } from "../class/orient/quaternion";
import { transform2dReadProp } from "../class/orient/transform2d";
import { transform3dReadProp, transform3dWriteProp } from "../class/orient/transform3d";
import { basisReadProp, basisWriteProp } from "../class/orient/basis";
import { isEngineNode, nodeFaceOf, nodeNameSet } from "../class/object/node";
import { GdSceneTree, treeReadProp } from "../class/object/scene-tree";
import { node2dRead, node2dWrite } from "../class/object/node2d";
import { ctlRead, ctlWrite } from "../class/object/control";
import { node3dRead, node3dWrite } from "../class/object/node3d";
import { GRect2, rect2ReadProp, rect2WriteProp, GRect2i, rect2iReadProp, rect2iWriteProp } from "../class/shape/rect";
import { asVec3i, GVector3i, toVec3, toVec3i, vec3iReadIndex, vec3iWrite } from "../class/vector/vector3i";
import { colorRead, colorWrite, GColor, toColor } from "../class/color/color";
import { bytesReadIndex, bytesWriteIndex, GBytes, packItems, packNameAbsent, packTypeName } from "../class/bytes/packed";
import { ARRAY_ATTR_ABSENT, STRING_ATTR_ABSENT, VECTOR_FACES, asArray, asDict, asString, intArgIdx, norm } from "./core";

import { GBasis } from "../class/orient/basis";

import { GPlane } from "../class/orient/plane";

import { GQuaternion } from "../class/orient/quaternion";

import { GTransform2D } from "../class/orient/transform2d";

import { GTransform3D } from "../class/orient/transform3d";

import { GAABB } from "../class/shape/aabb";

export function signalCtor(args: Variant[]): Variant {
  if (args.length === 0) return V.object(new Signal());
  if (args.length !== 2) {
    throw new UnsupportedError("signal-ctor", `Signal(...) 只量过 0 参与 (Object, name) 两形（收到 ${args.length} 个实参）`);
  }
  const obj = args[0] as Variant;
  const nm = args[1] as Variant;
  if (nm.t !== Tag.STRING && nm.t !== Tag.STRING_NAME) {
    throw new UnsupportedError("signal-ctor", "Signal(Object, name) 的 name 只量过 String / StringName 来源");
  }
  const inner = obj.t === Tag.OBJECT ? obj.v : null;
  if (inner === null || typeof inner !== "object") {
    throw new UnsupportedError("signal-ctor", "Signal(Object, name) 的 Object 实参只量过对象来源");
  }
  const name = nm.v as string;
  const prop = (inner as Record<string, unknown>)[name];
  return V.object(prop instanceof Signal ? prop : new Signal(name));
}

export function objectBaseLabel(inner: unknown): string {
  const cls = classNameOf(inner);
  const native = nativeBaseOf(inner);
  if (native !== null && cls !== null) return `${native} (${cls})`;
  if (native !== null) return native;
  if (cls !== null) return cls;
  throw new UnsupportedError("object-call-base", "call/callv 的报错还不知道这个对象的基类标签");
}

export function callvArgs(v: Variant | undefined): Variant[] {
  if (v === undefined || v.t !== Tag.ARRAY) {
    throw new GodotRuntimeError("object-callv", "callv() 的第二个实参需要是 Array");
  }
  return (v.v as GArray).raw().slice();
}

function intoSlot(kind: string | undefined, value: Variant, key: string, owner: unknown): Variant {
  if (kind === undefined) return value;
  if (kind === "int") return toInt(value);
  if (kind === "float") return toFloat(value);
  if (kind === "bool") return toBool(value);
  if (kind === "String") {
    if (value.t === Tag.STRING) return value;
    if (value.t === Tag.STRING_NAME) return V.str(value.v as string);
    throw propAssignError(key, value, owner);
  }
  if (kind === "Vector2") return toVec2(value);
  if (kind === "Vector2i") return toVec2i(value);
  if (kind === "Vector3") return toVec3(value);
  if (kind === "Vector3i") return toVec3i(value);
  if (kind === "Color") return toColor(value);
  if (kind === "StringName") return toStringNameSlot(value);
  return value;
}

/** 静态方法调用：`A.f()` 与 `p.f()` 两条路都汇到这里，入口表在登记时就建好，这里只按名字取用。 */
export function callStatic(desc: ClassDesc, name: string, args: Variant[]): Variant {
  return staticCall(desc, name, args);
}

/** 在接收者上按名字调一个方法：`this` 由方法调用表达式天然给对，所以不需要 `Function.prototype.apply`（它在静态编译目标上没有 lowering）。 */
export function callSlot(recv: unknown, name: string, args: Variant[]): Variant | null {
  return recv instanceof GdScriptObject ? recv.__gdDispatch(name, args) : null;
}

const PARAM_REFUSED: Record<string, readonly string[]> = {
  int: ["String", "StringName", "Nil", "Array", "Dictionary", "Vector2", "Callable", "NodePath"],
  float: ["String", "Nil", "Vector2"],
  bool: ["Nil", "String"],
  String: ["int", "float", "Array", "Nil", "Vector2"],
  StringName: ["int"],
  Vector2: ["int", "Array"],
};

function paramFold(want: string, v: Variant): Variant {
  if (want === "int" && v.t === Tag.BOOL) return V.int(v.v ? 1 : 0);
  if (want === "int" && v.t === Tag.FLOAT) {
    const n = Math.trunc(v.v as number);
    return Number.isSafeInteger(n) ? V.int(n) : v;
  }
  if (want === "float" && v.t === Tag.INT) return typeof v.v === "number" ? V.float(v.v) : v;
  if (want === "float" && v.t === Tag.BOOL) return V.float(v.v ? 1 : 0);
  if (want === "bool" && (v.t === Tag.INT || v.t === Tag.FLOAT)) return V.bool(intToNum(v.v as IntPayload) !== 0 || (v.t === Tag.FLOAT && (v.v as number) !== 0));
  if (want === "String" && v.t === Tag.STRING_NAME) return V.str(v.v as string);
  if (want === "StringName" && v.t === Tag.STRING) return V.stringName(v.v as string);
  return v;
}

export function scriptParamArgs(recv: unknown, name: string, args: Variant[]): Variant[] {
  const want = methodParamsOf(recv)?.[name];
  if (want === undefined) return args;
  const out = args.slice();
  for (let i = 0; i < want.length && i < out.length; i++) {
    const declared = want[i];
    if (declared === undefined || declared === null) continue;
    const slot = declared.replace(/\[.*\]$/, "");
    const refused = PARAM_REFUSED[slot];
    if (refused === undefined) continue;
    const v = out[i] as Variant;
    const got = valueTypeName(v);
    if (refused.includes(got)) {
      const cls = classNameOf(recv);
      const base = nativeBaseOf(recv);
      if (cls === null || base === null) {
        throw new UnsupportedError("script-method-label", `${name}() 的实参位要发引擎那句转换错，但这台实例的类名或原生基类还没登记`);
      }
      throw new GodotRuntimeError("script-param-type", `Invalid type in function '${name}' in base '${base} (${cls})'. Cannot convert argument ${String(i + 1)} from ${got} to ${slot}.`);
    }
    out[i] = paramFold(slot, v);
  }
  return out;
}

export function scriptMethodSay(recv: unknown, name: string, args: Variant[]): string | null {
  if (!(recv instanceof GdScriptObject)) return null;
  const bounds = methodAritiesOf(recv)?.[name];
  if (bounds === undefined) return null;
  if (args.length >= bounds[0] && args.length <= bounds[1]) return null;
  const cls = classNameOf(recv);
  const base = nativeBaseOf(recv);
  if (cls === null || base === null) {
    throw new UnsupportedError("script-method-label", `${name}() 越元数，但这台实例的类名或原生基类还没登记，发不出引擎那句 base 标签`);
  }
  return `Invalid call to function '${name}' in base '${base} (${cls})'. Expected ${String(args.length < bounds[0] ? bounds[0] : bounds[1])} argument(s).`;
}

/** 接收者（实例、类值、或「脚本值」那一格）→ 它的 desc；不是脚本类给 null。 */
export function descFor(inner: unknown): ClassDesc | null {
  return descOf(inner);
}

export function index(raw: unknown, idx: Variant, base?: string): Variant {
  const obj = norm(raw);
  if (obj.t === Tag.ARRAY) return asArray(obj, "下标").get(intArgIdx(idx, "下标"), base);
  if (obj.t === Tag.DICT) return asDict(obj, "下标").getRequired(idx);
  if (obj.t === Tag.STRING) return V.str(strAt(asString(obj, "下标"), intArgIdx(idx, "下标"), base));
  if (base !== undefined && obj.t === Tag.OBJECT && obj.v instanceof GBytes) {
    const len = (obj.v as GBytes).length;
    const i = intArgIdx(idx, "下标");
    const k = i < 0 ? i + len : i;
    if (k < 0 || k >= len) throw new GodotRuntimeError("packed-index", posOobSay(String(i), base, base));
  }
  if (obj.t === Tag.OBJECT && obj.v instanceof GVector2) return vecReadIndex(obj.v as GVector2, idx);
  if (obj.t === Tag.OBJECT && obj.v instanceof GVector3) return vec3ReadIndex(obj.v as GVector3, idx);
  if (obj.t === Tag.OBJECT && obj.v instanceof GVector4) return vec4ReadIndex(obj.v as GVector4, idx);
  if (obj.t === Tag.OBJECT && obj.v instanceof GVector4i) return vec4iReadIndex(obj.v as GVector4i, idx);
  if (obj.t === Tag.OBJECT && obj.v instanceof GVector2i) return vec2iReadIndex(obj.v as GVector2i, idx);
  if (obj.t === Tag.OBJECT && obj.v instanceof GVector3i) return vec3iReadIndex(obj.v as GVector3i, idx);
  if (obj.t === Tag.OBJECT && obj.v instanceof GColor) return colorRead(obj.v as GColor, idx, "read");
  if (obj.t === Tag.OBJECT && obj.v instanceof GBytes) return bytesReadIndex(obj.v as GBytes, idx);
  throw new UnsupportedError("index-type", `类型 ${obj.t} 不支持下标`);
}

export function dictIndexInt(raw: unknown, idx: Variant): Variant {
  const obj = norm(raw);
  if (obj.t === Tag.DICT && idx.t === Tag.INT) {
    const d = asDict(obj, "下标");
    if (!d.has(idx)) {
      throw new GodotRuntimeError("dict-index-oob", `Out of bounds get index '${show(idx)}' (on base: '${d.typeLabel()}')`);
    }
    return d.getRequired(idx);
  }
  return index(raw, idx);
}

function propAssignError(key: string, value: Variant, inner: unknown): GodotRuntimeError {
  return new GodotRuntimeError(
    "prop-assign",
    `Invalid assignment of property or key '${key}' with value of type '${tagName(value.t)}' on a base object of type 'RefCounted (${classNameOf(inner) ?? "Object"})'.`,
  );
}

export function writeProp(raw: unknown, key: string, value: Variant): Variant | null {
  const base = norm(raw);
  if (base.t === Tag.DICT) {
    asDict(base, "属性").set(V.stringName(key), value);
    return null;
  }
  if (base.t === Tag.ARRAY || base.t === Tag.STRING) {
    throw new GodotRuntimeError(
      "container-prop-assign",
      `Invalid assignment of property or key '${key}' with value of type '${tagName(value.t)}' on a base object of type '${tagName(base.t)}'.`,
    );
  }
  const vec = base.t === Tag.OBJECT && base.v instanceof GVector2 ? (base.v as GVector2) : null;
  const vec3 = base.t === Tag.OBJECT && base.v instanceof GVector3 ? (base.v as GVector3) : null;
  if (vec3 !== null) return vec3Write(vec3, V.str(key), value, "prop");
  const vec4 = base.t === Tag.OBJECT && base.v instanceof GVector4 ? (base.v as GVector4) : null;
  if (vec4 !== null) return vec4Write(vec4, V.str(key), value, "prop");
  const vec4i = base.t === Tag.OBJECT && base.v instanceof GVector4i ? (base.v as GVector4i) : null;
  if (vec4i !== null) return vec4iWrite(vec4i, V.str(key), value, "prop");
  const vec2i = base.t === Tag.OBJECT && base.v instanceof GVector2i ? (base.v as GVector2i) : null;
  if (vec2i !== null) return vec2iWrite(vec2i, V.str(key), value, "prop");
  const vec3i = asVec3i(base);
  if (vec3i !== null) return vec3iWrite(vec3i, V.str(key), value, "prop");
  const rc = base.t === Tag.OBJECT && base.v instanceof GRect2 ? (base.v as GRect2) : null;
  if (rc !== null) return rect2WriteProp(rc, key, value);
  const rci = base.t === Tag.OBJECT && base.v instanceof GRect2i ? (base.v as GRect2i) : null;
  if (rci !== null) return rect2iWriteProp(rci, key, value);
  const bs = base.t === Tag.OBJECT && base.v instanceof GBasis ? (base.v as GBasis) : null;
  if (bs !== null) return basisWriteProp(bs, key, value);
  const t3w = base.t === Tag.OBJECT && base.v instanceof GTransform3D ? (base.v as GTransform3D) : null;
  if (t3w !== null) {
    transform3dWriteProp(t3w, key, value);
    return null;
  }
  const enw = nodeFaceOf(base.t === Tag.OBJECT ? base.v : null);
  if (enw !== null) {
    if (enw.__gd_engine_class__ === "Node3D" && key !== "name") {
      node3dWrite(base.v, key, value);
      return null;
    }
    if (enw.__gd_engine_class__ === "Control" && key !== "name") {
      ctlWrite(base.v, key, value);
      return null;
    }
    if (enw.__gd_engine_class__ === "Node2D" && key !== "name") {
      node2dWrite(base.v, key, value);
      return null;
    }
    if (key !== "name") throw new UnsupportedError("node-prop-write", `${enw.__gd_engine_class__}.${key} 的属性写没量过`);
    if (enw.__gd_freed__) throw new UnsupportedError("node-freed-prop", `在已 free() 的实例上写 ${key} 那一形没建模`);
    nodeNameSet(enw, asString(value, "属性写入"));
    return null;
  }
  const col = base.t === Tag.OBJECT && base.v instanceof GColor ? (base.v as GColor) : null;
  if (col !== null) return colorWrite(col, V.str(key), value, "prop");
  if (
    base.t === Tag.OBJECT &&
    base.v !== null &&
    (typeof base.v === "function" || typeof base.v === "object")
  ) {
    const sd = descFor(base.v);
    const svars = sd === null ? null : sd.staticVars;
    const slot = sd === null ? null : varSlotOf(sd, key);
    if (sd !== null && svars !== null && slot !== null) {
      slot.set(intoSlot(svars[key], value, key, base.v));
      return null;
    }
  }
  const objInner = base.t === Tag.OBJECT
    && base.v !== null
    && typeof base.v === "object"
    && !(base.v instanceof GVector2 || base.v instanceof GVector3 || base.v instanceof GVector4 || base.v instanceof GVector4i || base.v instanceof GVector2i || base.v instanceof GVector3i || base.v instanceof GColor || base.v instanceof GBytes || base.v instanceof Signal)
    ? (base.v as Record<string, unknown>)
    : null;
  if (objInner !== null) {
    const kind = fieldTypesOf(objInner)?.[key];
    if (kind === undefined && !Object.hasOwn(objInner, key)) {
      throw propAssignError(key, value, objInner);
    }
    objInner[key] = intoSlot(kind, value, key, objInner);
    return null;
  }
  if (base.t === Tag.OBJECT && base.v instanceof GBytes) {
    if (packNameAbsent((base.v as GBytes).kind, key)) {
      throw new GodotRuntimeError(
        "packed-prop-assign",
        `Invalid assignment of property or key '${key}' with value of type '${tagName(value.t)}' on a base object of type '${packTypeName((base.v as GBytes).kind)}'.`,
      );
    }
    throw new UnsupportedError("packed-property", `pack 的属性写只量过表外名那一格：${packTypeName((base.v as GBytes).kind)}.${key} = … 没实测过`);
  }
  if (vec === null) {
    throw new GodotRuntimeError(
      "vector2-write",
      `Invalid assignment of property or key '${key}' with value of type '${tagName(value.t)}' on a base object of type '${tagName(base.t)}'.`,
    );
  }
  return vecWrite(vec, V.str(key), value, "prop");
}

export function writeIdx(raw: unknown, idx: Variant, value: Variant): Variant | null {
  const base = norm(raw);
  if (base.t !== Tag.OBJECT) {
    setIndex(base, idx, value);
    return null;
  }
  if (base.t === Tag.OBJECT && base.v instanceof GVector2) {
    return vecWrite(base.v as GVector2, idx, value, "index");
  }
  if (base.t === Tag.OBJECT && base.v instanceof GVector3) {
    return vec3Write(base.v as GVector3, idx, value, "index");
  }
  if (base.t === Tag.OBJECT && base.v instanceof GVector4) {
    return vec4Write(base.v as GVector4, idx, value, "index");
  }
  if (base.t === Tag.OBJECT && base.v instanceof GVector4i) {
    return vec4iWrite(base.v as GVector4i, idx, value, "index");
  }
  if (base.t === Tag.OBJECT && base.v instanceof GVector2i) {
    return vec2iWrite(base.v as GVector2i, idx, value, "index");
  }
  if (base.t === Tag.OBJECT && base.v instanceof GVector3i) {
    return vec3iWrite(base.v as GVector3i, idx, value, "index");
  }
  if (base.t === Tag.OBJECT && base.v instanceof GColor) {
    return colorWrite(base.v as GColor, idx, value, "index");
  }
  if (base.t === Tag.OBJECT && base.v instanceof GBytes) {
    return bytesWriteIndex(base.v as GBytes, idx, value, "index");
  }
  setIndex(base, idx, value);
  return null;
}

export function setIndex(raw: unknown, idx: Variant, val: Variant): void {
  const obj = norm(raw);
  if (obj.t === Tag.ARRAY) {
    const a = asArray(obj, "下标赋值");
    if (a.isReadOnly()) {
      throw new GodotRuntimeError("read-only-assign", "Invalid assignment on read-only value (on base: 'Array').");
    }
    const k = intArgIdx(idx, "下标赋值");
    a.set(k, val);
    return;
  }
  if (obj.t === Tag.DICT) {
    const d = asDict(obj, "下标赋值");
    if (d.isReadOnly()) {
      readOnlyError("set (core/variant/dictionary.cpp:207)", "Dictionary");
      throw new GodotRuntimeError("read-only-assign", "Invalid assignment on read-only value (on base: 'Dictionary').");
    }
    d.set(idx, val);
    return;
  }
  throw new UnsupportedError("setindex-type", `类型 ${obj.t} 不支持下标赋值`);
}

export function iter(v: Variant): Variant[] {
  if (v.t === Tag.ARRAY) return (v.v as GArray).raw();
  if (v.t === Tag.DICT) return (v.v as GDict).keys();
  if (v.t === Tag.STRING) return [...(v.v as string)].map((c) => V.str(c));
  if (v.t === Tag.INT) {
    const n = intToNum(v.v as IntPayload);
    if (!Number.isSafeInteger(n)) {
      throw new UnsupportedError("iter-count", `for 的整数上界超出 2^53 安全整数范围（${String(v.v)}）`);
    }
    const out: Variant[] = [];
    for (let i = 0; i < n; i++) out.push(V.int(i));
    return out;
  }
  if (v.t === Tag.FLOAT) {
    const end = v.v as number;
    if (!Number.isFinite(end)) {
      throw new UnsupportedError("iter-count", `for 的 float 上界是 ${String(end)}，展不开`);
    }
    const out: Variant[] = [];
    for (let i = 0; i < end; i++) out.push(V.float(i));
    return out;
  }
  if (v.t === Tag.OBJECT && v.v instanceof GBytes) return packItems(v.v as GBytes);
  throw new UnsupportedError("iter-type", `类型 ${v.t} 不可迭代`);
}

export function dictOf(pairs: Array<[Variant, Variant]>): Variant {
  const d = new GDict();
  for (const [k, v] of pairs) d.set(k, v);
  return V.dict(d);
}

/** `"%d/%s" % [...]` —— 字符串格式化运算符：与 `ops.mod` 那一路同一判据，`soft` 是发射器按**两侧的静态型**定的形状旗标（S696：两侧静态 → 推一块 ERROR 回原格式串；任一侧 Variant → SCRIPT ERROR 作废那支函数） */
export function formatOf(fmt: Variant, args: Variant, soft: boolean): Variant {
  return pctFormatOp(fmt, args, soft);
}

/** 内建类型面的「方法名当值」：发射器只在**静态已知的接收者**且名字是那一面的成员时发这一支
 *  （读数 `tmp/probe-bincall/p1.gd` 的 16 面与 `compare6.txt` 的 N6：印法 `<面>::<名>`、`typeof` 25、`is_valid()` 真、`get_object()` 空引用）。 */
export function boundMethod(raw: unknown, face: string, name: string, min: number, max: number): Variant {
  return boundBuiltinCallable(norm(raw), face, name, min, max);
}

export function boundSnapshot(v: Variant): Variant | null {
  const inner = v.v;
  if (inner instanceof GArray) {
    const snap = inner.duplicate(true);
    snap.elem = inner.elem;
    return V.array(snap);
  }
  if (inner instanceof GBytes) return V.object(new GBytes(inner.raw().slice(), inner.kind));
  return null;
}

export function attribute(raw: unknown, name: string): unknown {
  const obj = norm(raw);
  if (obj.t === Tag.DICT) {
    const dict = asDict(obj, "属性");
    const k = V.stringName(name);
    if (dict.has(k)) return dict.getRequired(k);
    throw new GodotRuntimeError("dict-attribute", `Invalid access to property or key '${name}' on a base object of type 'Dictionary'.`);
  }
  if (obj.t === Tag.STRING_NAME) {
    if (valueAttrKind("StringName", name) === "absent" || !faceMemberKnown("StringName", name)) {
      throw new GodotRuntimeError("face-attribute", `Invalid access to property or key '${name}' on a base object of type 'StringName'.`);
    }
    const row = faceArity("StringName", name);
    if (row !== null) return boundBuiltinCallable(obj, "StringName", name, row[0], row[1]);
    throw new UnsupportedError("face-attribute", `StringName.${name} 的属性读落在两份名单之外：候选宇宙之外的名字没量过，不发引擎那句`);
  }
  if (obj.t === Tag.STRING || obj.t === Tag.ARRAY) {
    const face = obj.t === Tag.STRING ? "String" : "Array";
    const absent = face === "String" ? STRING_ATTR_ABSENT : ARRAY_ATTR_ABSENT;
    if (absent.includes(name) || !faceMemberKnown(face, name)) {
      throw new GodotRuntimeError("face-attribute", `Invalid access to property or key '${name}' on a base object of type '${face}'.`);
    }
    const row = faceArity(face, name);
    if (row !== null) return boundBuiltinCallable(obj, face, name, row[0], row[1]);
    throw new UnsupportedError("face-attribute", `${face}.${name} 的属性读落在两份名单之外：候选宇宙之外的名字没量过，不发引擎那句`);
  }
  if (obj.t === Tag.OBJECT) {
    if (obj.v instanceof GdNativeClass) {
      const konst = engineClassConst(obj.v.className, name);
      if (konst !== null) return V.int(konst);
      throw new UnsupportedError("native-class-member", `引擎类 ${obj.v.className} 的 .${name} 还没建模（实测能取值、能比等式，打出来带进程内的号）`);
    }
    const vec = obj.v instanceof GVector2 ? (obj.v as GVector2) : null;
    if (vec && (name === "x" || name === "y")) return V.float(vec[name]);
    const vec3 = obj.v instanceof GVector3 ? (obj.v as GVector3) : null;
    if (vec3 && (name === "x" || name === "y" || name === "z")) return V.float(vec3[name]);
    const vec4 = obj.v instanceof GVector4 ? (obj.v as GVector4) : null;
    if (vec4 && (name === "x" || name === "y" || name === "z" || name === "w")) return V.float(vec4[name]);
    const vec4i = obj.v instanceof GVector4i ? (obj.v as GVector4i) : null;
    if (vec4i && (name === "x" || name === "y" || name === "z" || name === "w")) return V.int(vec4i[name]);
    const vec2i = obj.v instanceof GVector2i ? (obj.v as GVector2i) : null;
    if (vec2i && (name === "x" || name === "y")) return V.int(vec2i[name]);
    const vec3i = obj.v instanceof GVector3i ? (obj.v as GVector3i) : null;
    if (vec3i && (name === "x" || name === "y" || name === "z")) return V.int(vec3i[name]);
    const t2 = obj.v instanceof GTransform2D ? (obj.v as GTransform2D) : null;
    if (t2 !== null) {
      const part = transform2dReadProp(t2, name);
      if (part !== null) return part;
      throw new UnsupportedError("transform2d-prop", `Transform2D.${name} 的属性读没量过`);
    }
    const t3o = obj.v instanceof GTransform3D ? (obj.v as GTransform3D) : null;
    if (t3o !== null) {
      const part = transform3dReadProp(t3o, name);
      if (part !== null) return part;
      throw new UnsupportedError("transform3d-prop", `Transform3D.${name} 的属性读没量过`);
    }
    const qq = obj.v instanceof GQuaternion ? (obj.v as GQuaternion) : null;
    if (qq !== null) {
      const part = quaternionReadProp(qq, name);
      if (part !== null) return part;
      throw new UnsupportedError("quaternion-prop", `Quaternion.${name} 的属性读没量过`);
    }
    const pl = obj.v instanceof GPlane ? (obj.v as GPlane) : null;
    if (pl !== null) {
      const part = planeReadProp(pl, name);
      if (part !== null) return part;
      throw new UnsupportedError("plane-prop", `Plane.${name} 的属性读没量过`);
    }
    const ab = obj.v instanceof GAABB ? (obj.v as GAABB) : null;
    if (ab !== null) {
      const part = aabbReadProp(ab, name);
      if (part !== null) return part;
      throw new UnsupportedError("aabb-prop", `AABB.${name} 的属性读没量过`);
    }
    const bs = obj.v instanceof GBasis ? (obj.v as GBasis) : null;
    if (bs !== null) {
      const part = basisReadProp(bs, name);
      if (part !== null) return part;
      throw new UnsupportedError("basis-prop", `Basis.${name} 的属性读没量过`);
    }
    const rc = obj.v instanceof GRect2 ? (obj.v as GRect2) : null;
    if (rc !== null) {
      const part = rect2ReadProp(rc, name);
      if (part !== null) return part;
    }
    const rci = obj.v instanceof GRect2i ? (obj.v as GRect2i) : null;
    if (rci !== null) {
      const part = rect2iReadProp(rci, name);
      if (part !== null) return part;
    }
    const vface = obj.v instanceof GVector2 ? "Vector2" : obj.v instanceof GVector2i ? "Vector2i"
      : obj.v instanceof GVector3 ? "Vector3" : obj.v instanceof GVector3i ? "Vector3i"
        : obj.v instanceof GVector4 ? "Vector4" : obj.v instanceof GVector4i ? "Vector4i"
        : obj.v instanceof GColor ? "Color" : obj.v instanceof GdNodePath ? "NodePath" : null;
    if (vface !== null) {
      const kind = valueAttrKind(vface, name);
      if (kind === "absent" || ((VECTOR_FACES.has(vface) || vface === "NodePath") && !faceMemberKnown(vface, name))) {
        throw new GodotRuntimeError("face-attribute", `Invalid access to property or key '${name}' on a base object of type '${vface}'.`);
      }
      const row = faceArity(vface, name);
      if (row !== null) return boundBuiltinCallable(obj, vface, name, row[0], row[1]);
    }
    const col = obj.v instanceof GColor ? (obj.v as GColor) : null;
    if (col !== null) return colorRead(col, V.str(name), "read");
    if (obj.v instanceof GBytes) {
      if (packNameAbsent((obj.v as GBytes).kind, name) || !faceMemberKnown(packTypeName((obj.v as GBytes).kind), name)) {
        throw new GodotRuntimeError("packed-attribute", `Invalid access to property or key '${name}' on a base object of type '${packTypeName((obj.v as GBytes).kind)}'.`);
      }
      const row = faceArity(packTypeName((obj.v as GBytes).kind), name);
      if (row !== null) return boundBuiltinCallable(obj, packTypeName((obj.v as GBytes).kind), name, row[0], row[1]);
      throw new UnsupportedError("packed-attribute", `pack 的属性读落在两份名单之外：${packTypeName((obj.v as GBytes).kind)}.${name} 的元数没量过，不发引擎那句`);
    }
    if (obj.v instanceof GdSceneTree) {
      const tp = treeReadProp(obj.v, name);
      if (tp !== null) return tp;
    }
    const en = nodeFaceOf(obj.v);
    if (en !== null) {
      if (en.__gd_freed__) throw new UnsupportedError("node-freed-prop", `在已 free() 的实例上读 ${name} 那一形没建模`);
      if (en.__gd_engine_class__ === "Node3D") {
        const m3 = node3dRead(obj.v, name);
        if (m3 !== null) return m3;
      }
      if (en.__gd_engine_class__ === "Control") {
        const mc = ctlRead(obj.v, name);
        if (mc !== null) return mc;
      }
      if (en.__gd_engine_class__ === "Node2D") {
        const m2 = node2dRead(obj.v, name);
        if (m2 !== null) return m2;
      }
      if (name === "name") return V.str(en.__gd_node_name__);
      throw new UnsupportedError("node-prop", `${en.__gd_engine_class__}.${name} 的属性读没量过`);
    }
    const inner = obj.v as Record<string, unknown>;
    const sd = descFor(inner);
    if (sd !== null && hasStaticName(sd, name)) {
      return methodCallable(V.object(sd), name);
    }
    const svars = sd === null ? null : sd.staticVars;
    if (svars !== null && sd !== null && name in svars) {
      const hit = varSlotOf(sd, name);
      if (hit !== null) return hit.get();
    }
    if (inner instanceof ClassDesc && name === "new") {
      return methodCallable(obj, "new");
    }
    if (!(inner instanceof ClassDesc) && name in inner) {
      const v = inner[name];
      if (typeof v === "function") return methodCallable(obj, name);
      return v;
    }
    for (let d = sd; d !== null; d = d.base) {
      if (d.scriptProps !== null && d.scriptProps.includes(name)) return V.nil();
    }
  }
  if (obj.t === Tag.NIL || obj.t === Tag.INT || obj.t === Tag.FLOAT || obj.t === Tag.BOOL) {
    throw new GodotRuntimeError("face-attribute", `Invalid access to property or key '${name}' on a base object of type '${valueTypeName(obj)}'.`);
  }
  if (obj.t === Tag.OBJECT) {
    const innerObj = obj.v as Record<string, unknown>;
    if (descFor(innerObj) !== null) {
      throw new GodotRuntimeError(
        "face-attribute",
        `Invalid access to property or key '${name}' on a base object of type 'RefCounted (${classNameOf(innerObj) ?? "Object"})'.`,
      );
    }
  }
  throw new UnsupportedError("attribute", `取属性 ${name} 未实现（对象模型还没做完）`);
}
