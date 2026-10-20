import { GodotRuntimeError, UnsupportedError } from "./errors";
import { md5Hex } from "./md5";
import { HEX_PREFIX_RE, HEX_RE, INT_RE, hashDjb2, strHexToInt, toBool, toFloat, toInt, variantHashNumber,
  abs, lengthOf, range as gRange, sqrt, variantHash, gAngleDifference, gCubic, gClamp, gCeil, gDegToRad, gRadToDeg, gEase, gExp,
  gFloor, gFmod, gFposmod, gInverseLerp, gIsEqualApprox, gIsFinite, gIsInf, gIsNan, gIsZeroApprox, gLerp, gLog,
  gMax, gMaxF, gMaxI, gMin, gMinF, gMinI, gMoveToward, gPosmod, gPow, gRemap, gRound, gSign, gSignF, gSignI,
  gSmoothstep, gSnapped, gSnappedF, gSnappedI, gWrap, gAbsF, gAbsI, gWrapAny, gIsSame,
  gTypeString, gErrorString, gTypeExists,
  gWeakref, gInstanceFromId, gIsInstanceValid, gIsInstanceIdValid, gRidFromInt64, gRidAllocateId, gInstToDict,
  gRandi, gRandf, gRandomize, gSeed, gRandFromSeed, gRandiRange, gRandfRange, gRandfn,
  gSin, gCos, gTan, gAsin, gAcos, gAtan, gAtan2, gSinh, gCosh, gTanh, gAsinh, gAcosh, gAtanh,
  gDbToLinear, gLinearToDb, gPingpong, gStepDecimals, gNearestPo2, gRotateToward, gLerpAngle,
  gBezierInterpolate, gBezierDerivative, gCubicAngle, gCubicInTime, gCubicAngleInTime } from "./builtins";
import { GLOBAL_CALLABLES, globalCallableLabel } from "./global-names";
import { variantConvert } from "./convert";
import { typeOf, gIsInstanceOf } from "./patterns";
import { strToInt, strToFloat } from "./numstr";
import { registerBoundSnapshotHook, CallableBox, boundArgsOf, callableArityBounds, callableLabel, classNameOf, declaredArgCount, descOf, dictDescOf, dictShapeOf, writeDictWritten, beginBareConstruction, endBareConstruction, fieldTypesOf, getMeta, hasMeta, isCallableBox, isNullCallable, isVariant, methodAritiesOf, nativeBaseOf, nullCallable, requiredArgCount, removeMeta, setMeta, staticCall, hasStaticName, staticNamesOf, varSlotOf, staticVarsOf, wrapValue, GdScriptObject, methodCallable, loadScript, ClassDesc, type Fn } from "./object";
import { boundBuiltinCallable, callDeferred } from "./callable";
import { faceArity, valueAttrKind } from "./face-arity";
import { isEncodedObjectIdBox, isWeakRefBox, NULL_OBJECT } from "./identity";
import { asRid } from "./rid";
import { gGetStack, gPrintStack, gPushError, gPushWarning, readOnlyError, stringFormatInvalidType, stringReplaceCharNul, stringReplaceCharsNul, signalDuplicateConnect, signalNullCallable } from "./frames";
import { gBytesToVar, gBytesToVarWithObjects, gVarToBytes, gVarToBytesWithObjects } from "./var-bytes";
import { asNodePath, GdNodePath, nodePathMethod, nodePathText } from "./node-path";
import type { GdIdentified } from "./identity";
import { GdNativeClass } from "./native-class";
import { Signal } from "./signal";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { GArray, GDict, posOobSay, strAt, strBinToInt, strCaseStyle, strCapitalize, strCEscape, strCase, strContains, strCount, strEdge, strEndsWith, strEraseAt, strFind, strFormat, strGetSlice, strGetSlicec, strInsertAt, strIsValidFilename, strJoin, strLength, strPadZeros, strRepeat, strReplace, strSplit,
  strSplitCapped, strSimilarity, strStartsWith, strStripEdges, strSubstr, strUnicodeAt, strUriDecode, strUriEncode, strCmp, strFormatV, toStringNameSlot, truthyOf, stringChr,
  strBuiltin, varToStr, strToVar, valueTypeName, valueEq, show, strReplaceChar, strReplaceChars, strRemoveChar, strRemoveChars, strIsValidAsciiIdentifier } from "./values";
import { isLess, pctFormatOp, sortLess } from "./ops";
import { GVector2, toVec2, vecReadIndex, vecWrite, vector2Method } from "./vector2";
import { GVector3, vec3ReadIndex, vec3Write, vector3Method } from "./vector3";
import { GVector2i, toVec2i, vec2iReadIndex, vec2iWrite, vector2iMethod } from "./vector2i";
import { asVec3i, GVector3i, toVec3, toVec3i, vec3iReadIndex, vec3iWrite, vector3iMethod } from "./vector3i";
import { colorMethod, colorRead, colorWrite, GColor, toColor } from "./color";
import { bytesReadIndex, bytesMethod, bytesWriteIndex, GBytes, packItems, packNameAbsent, packTypeName } from "./packed";

function asArray(v: Variant, who: string): GArray {
  if (v.t !== Tag.ARRAY) throw new UnsupportedError("not-array", `${who} 需要 Array，收到 ${v.t}`);
  return v.v as GArray;
}

function asDict(v: Variant, who: string): GDict {
  if (v.t !== Tag.DICT) throw new UnsupportedError("not-dict", `${who} 需要 Dictionary，收到 ${v.t}`);
  return v.v as GDict;
}

function asString(v: Variant, who: string): string {
  if (v.t === Tag.STRING) return v.v as string;
  // StringName 与 NodePath 在 String 位上引擎收下来并按其文本折（`"abc".contains(&"abc")` 真、`"abc".replace(^"a", "Z")` 给 `Zbc`）
  if (v.t === Tag.STRING_NAME) return v.v as string;
  if (v.t === Tag.OBJECT) {
    const np = asNodePath(v);
    if (np !== null) return nodePathText(np);
  }
  throw new UnsupportedError("not-string", `${who} 需要 String，收到 ${v.t}`);
}

/** 替换码点：引擎收 int 后直接当 char32_t 用；超出 Unicode 标量范围的那一形没量过，响亮拒。 */
function charReplacement(n: number, who: string): number {
  if (n < 0 || n > 0x10ffff || (n >= 0xd800 && n <= 0xdfff)) {
    throw new UnsupportedError("string-char-invalid", `${who}() 的替换码点 ${String(n)} 超出 Unicode 标量范围，那一形没实测过`);
  }
  return n;
}

/** 入口可能是裸 JS 值（lambda、引擎对象），先归一成 Variant */
function norm(v: unknown): Variant {
  return isVariant(v) ? v : wrapValue(v);
}

/** `Object.call` / `callv` 报错文本里的 `RefCounted (Thing)` 标签：与形参槽、`get_class()` 同一批登记。 */
function objectBaseLabel(inner: unknown): string {
  const cls = classNameOf(inner);
  const native = nativeBaseOf(inner);
  if (native !== null && cls !== null) return `${native} (${cls})`;
  if (native !== null) return native;
  if (cls !== null) return cls;
  throw new UnsupportedError("object-call-base", "call/callv 的报错还不知道这个对象的基类标签");
}

/** `callv(name, args)` 的第二个实参：必须是 Array，元素原样当实参用。 */
function callvArgs(v: Variant | undefined): Variant[] {
  if (v === undefined || v.t !== Tag.ARRAY) {
    throw new GodotRuntimeError("object-callv", "callv() 的第二个实参需要是 Array");
  }
  return (v.v as GArray).raw().slice();
}

/** 声明类型槽的写入值折算；字段写与静态变量写**共用这一张表**，避免两套规则各写一遍。 */
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
function callStatic(desc: ClassDesc, name: string, args: Variant[]): Variant {
  return staticCall(desc, name, args);
}

/** 在接收者上按名字调一个方法：`this` 由方法调用表达式天然给对，所以不需要 `Function.prototype.apply`（它在静态编译目标上没有 lowering）。 */
function callSlot(recv: unknown, name: string, args: Variant[]): Variant | null {
  // 一次 `instanceof` 收窄，真正的「按名字找方法」在**子类生成的 `__gdDispatch`** 里 —— 运行时全程不 cast 动态值。
  return recv instanceof GdScriptObject ? recv.__gdDispatch(name, args) : null;
}

/** 接收者（实例、类值、或「脚本值」那一格）→ 它的 desc；不是脚本类给 null。 */
function descFor(inner: unknown): ClassDesc | null {
  return descOf(inner);
}

/** `Callable()`、`Callable(Callable)` 与 `Callable(对象, "方法名")` 三个构造式（实测都通）。 */
export function callableCtor(args: Variant[]): Variant {
  if (args.length === 0) return nullCallable();
  if (args.length === 1) {
    // 实测 `Callable(abs) == abs` 真、typeof 25、哈希同值（`tmp/probe-hash-callable/ctor.log` w01）。
    // 其余单实参在引擎是解析期那句 "No constructor of "Callable" matches the signature "Callable(String)"."，到不了运行期。
    const only = args[0] as Variant;
    if (isCallableBox(only.v)) return only;
    throw new UnsupportedError("callable-ctor", `Callable(x) 这一格只量过实参本身就是 Callable（收到 ${tagName(only.t)}）`);
  }
  if (args.length === 2) {
    const [obj, name] = args as [Variant, Variant | undefined];
    if (name === undefined || (name.t !== Tag.STRING && name.t !== Tag.STRING_NAME)) {
      throw new UnsupportedError("callable-ctor", "Callable(对象, 名字) 的第二个实参量过的是方法名字符串");
    }
    return attribute(obj, String(name.v)) as Variant;
  }
  throw new UnsupportedError(
    "callable-ctor",
    `Callable() 只量过 0、1、2 参（收到 ${args.length} 个）`,
  );
}

/** 调一个 Callable 盒子：调用实参排在绑定实参**之前**；lambda 走盒子带的式子，方法 / 静态方法交 `method()` 按名派发。 */
function callCallableBox(box: CallableBox, args: Variant[]): Variant {
  const all: Variant[] = [];
  for (const a of keptCallArgs(box, args)) all.push(a);
  for (const b of box.bound) all.push(b);
  if (box.fn !== null) return wrapValue(box.fn(all));
  if (box.name !== null && box.object !== null) return method(box.object, box.name, all);
  throw new GodotRuntimeError("callable-null-call", "Attempt to call function 'null::null (Callable)' on a null instance.");
}

/** `Callable.call()` 的实参数量：**给的 + 绑的** 对不上声明数就是运行期那句 `Invalid call to function '<标签> (Callable)'. Expected <N> argument(s).`，少给报必填数、多给报全部数。 */
function callableCall(box: CallableBox, args: Variant[]): Variant {
  if (isNullCallable(box)) {
    throw new GodotRuntimeError("callable-null-call", "Attempt to call function 'null::null (Callable)' on a null instance.");
  }
  const bounds = callableArityBounds(box);
  if (bounds !== null) {
    const given = keptCallArgs(box, args).length + boundArgsOf(box).length;
    if (given < bounds[0] || given > bounds[1]) {
      const n = given < bounds[0] ? bounds[0] : bounds[1];
      throw new GodotRuntimeError(
        "callable-arity",
        `Invalid call to function '${callableCallLabel(box)} (Callable)'. Expected ${n} argument(s).`,
      );
    }
  }
  return callCallableBox(box, args);
}

/** `unbind(n)` 的实参：只量过 0 与正 int；负数、float、缺参与多参之外的那几形没读数，响亮拒。 */
function unbindCountArg(args: readonly Variant[]): number {
  if (args.length === 0) throw new GodotRuntimeError("arity", `Too few arguments for "unbind()" call. Expected at least 1 but received 0.`);
  if (args.length > 1) throw new GodotRuntimeError("arity", `Too many arguments for "unbind()" call. Expected at most 1 but received ${String(args.length)}.`);
  const v = args[0] as Variant;
  if (v.t !== Tag.INT) throw new UnsupportedError("callable-unbind-arg", `Callable.unbind() 的实参只量过 int（收到 ${tagName(v.t)}）`);
  const n = intToNum(v.v as IntPayload);
  if (n < 0) throw new UnsupportedError("callable-unbind-neg", "Callable.unbind() 的负数那一形没量过，不发");
  return n;
}

/** `unbind(n)` 的那一位怎么用：`n` 支实参必须由调用方给（少了是那句 `Callable unbinds …`），给了又在**尾部**削掉——
 *  绑着的那串照旧接在削剩的后面（`tmp/probe-unbind/{v2,v3,w1,w2,w4,w5}.gd` 六格把这判据钉死：`bind(1,2).unbind(1).call(9)` 给的是 `f(1, 2)`）。 */
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

/** 那句报错里的**函数标签**，与打印用的是同一串（五种形状实测过：空、lambda、全局、静态、方法）。 */
function callableCallLabel(box: CallableBox): string {
  const label = callableLabel(box);
  if (label !== null) return label;
  throw new UnsupportedError("callable-arity-label", "还不知道这个 Callable 的函数标签");
}

/** Callable 的方法面：方法 Callable、静态方法 Callable、lambda、`Callable()` 空 Callable 四种形状共用这一张表。 */
/** 4.6.3 实测存在的 Callable 成员名（`tmp/probe-callable-names/sweep.mts` 二十四名一名一名过裁判）。
 *  表外一律给运行期那句 `Nonexistent function` —— 与 Signal / RID / NodePath 同一条口径。
 *  被抄来的清单污染掉的四名（`from` / `get_object_instance_id` / `is_equal` / `unbind_many`）在这一格里归位：它们 4.6.3 根本没有。 */
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

function callableMethod(box: CallableBox, name: string, args: Variant[]): Variant {
  const bound = boundArgsOf(box);
  const empty = isNullCallable(box);
  switch (name) {
    case "bind": {
      if (box.defaultCount > 0) {
        throw new UnsupportedError("lambda-bind-default", "带默认值形参的 lambda 再 `bind()` 那一形没实测过，不发");
      }
      // 绑定串排在**前面**；实参拼接不用 spread —— 静态编译目标上没有它的 lowering
      const next: Variant[] = [];
      if (box.unbindCount > 0) {
        // `bind()` 落在 unbind 腾出的那些位上：绑定串本身不动，`unbind` 的计数按绑的支数减（`tmp/probe-unbind/{y1,y2,y3,y5}.gd`）
        for (const b of bound) next.push(b);
        return V.object(new CallableBox(box.fn, box.name, box.object, next, box.arity, true, null, null, 0, null, box.unbindCount - args.length < 0 ? 0 : box.unbindCount - args.length));
      }
      for (const a of args) next.push(a);
      for (const b of bound) next.push(b);
      return V.object(new CallableBox(box.fn, box.name, box.object, next, box.arity, true));
    }
    case "unbind": {
      // 计数是**累加**的：`u.unbind(1).unbind(1)` 等于 `u.unbind(2)`（`tmp/probe-unbind/x6.gd`）
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
      // 实测读数就是 `get_bound_arguments()` 那支数组的长度（全局 Callable 的两格：0 与 2）
      return V.int(bound.length);
    case "get_unbound_arguments_count":
      // 实测七格（tmp/d6/s545.gd）：就是 unbind 计数；先 unbind 再 bind 会填掉一格（unbind(2).bind(1) → 1）
      return V.int(box.unbindCount);
    case "get_argument_count": {
      // 语义是「**还要几个实参**」= 声明形参数 − 绑定数，不是「只要 bind 过就给 0」
      const declared = declaredArgCount(box);
      if (declared === null) {
        throw new UnsupportedError(
          "callable-arity-count",
          "get_argument_count() 拿不到这个 Callable 的声明形参数（方法表里没有它，或它带默认值形参 —— 那一格没量）",
        );
      }
      const left = declared - bound.length + box.unbindCount;
      // 实测（`tmp/probe-binds-c/disc.gd` 与语料 288）：**方法 / 静态与 lambda 都是 `声明 − 已绑`，绑过头就给负数**
      // （声明 1 支的方法绑 3 支给 −2、声明 1 支的 lambda 链式绑 2 支给 −1），只有**空 Callable 基**恒给 0
      // （`Callable()` 绑 1 支、2 支、链式、绑 3 支全是 0）。
      return V.int(isNullCallable(box) ? 0 : left);
    }
    case "call":
      return callableCall(box, args);
    case "call_deferred": {
      if (empty) throw new UnsupportedError("callable-deferred-null", "空 Callable 上 call_deferred() 没量过");
      callDeferred(() => {
        callCallableBox(box, args);
      });
      return V.nil();
    }
    case "callv": {
      const arr = args[0];
      if (arr === undefined || !(arr.v instanceof GArray)) {
        throw new GodotRuntimeError("callable-callv", "callv() 需要一个 Array 实参");
      }
      // 空 Callable 的 `callv` **不报错也不调**，给 null
      if (empty) return V.nil();
      const given = (arr.v as GArray).raw();
      // `callv` 的数量不合式**既不报错也不调用**，安静给 null —— 与 `call()` 那两句正相反，照 `call` 那样抛就把「安静给 null」变成了「抛错」
      const bounds = callableArityBounds(box);
      if (bounds !== null) {
        const total = given.length + bound.length;
        if (total < bounds[0] || total > bounds[1]) return V.nil();
      }
      return callCallableBox(box, given);
    }
    case "get_method": {
      // 实测四种形状的 `get_method()` 全是 StringName（typeof 21），不是 String
      const m = box.name;
      if (m !== null) return V.stringName(m);
      // 空 Callable 给**空串**；lambda 给字面量 `<anonymous lambda>`
      if (empty) return V.stringName("");
      return V.stringName("<anonymous lambda>");
    }
    case "get_object": {
      // 实测：方法 Callable 给接收者实例（`== o` 真、跨实例假），静态给那个类值（`== Inner` 真、`== 外层脚本` 假）；
      // lambda 给**定义它那个类的 GDScript 对象**（`== self` 假、`== get_script()` 真），空 Callable 与全局内置给
      // typeof 24 的 null Object（打 `<Object#null>`、`== null` 真）—— 后两形我们没有，响亮拒。
      // 内建类型面绑定来的那一只：引擎给的是 typeof 24 的空对象引用，不是那台数组 / 字符串（读数 `tmp/probe-bincall/h3.gd` 的 Q6）
      if (box.builtin !== null) return V.object(NULL_OBJECT);
      if (box.object === null) {
        throw new UnsupportedError(
          "callable-get-object",
          "get_object() 这一支要给的是我们没建模的对象：lambda 的 owner 是定义它那个类的 GDScript 对象，空 Callable 与全局内置是 typeof 24 的 null Object（探头 tmp/probe-callable-object）",
        );
      }
      return box.object;
    }
    case "is_null":
      // 四种形状里只有空 Callable 为真；绑过实参就不再是空的
      return V.bool(empty && bound.length === 0);
    case "is_valid":
      if (empty && bound.length > 0) {
        throw new UnsupportedError("callable-is-valid-bound-null", "绑过实参的空 Callable 上 is_valid() 没量过");
      }
      // 空 Callable 假；lambda / 静态方法 / 方法 Callable 真
      return V.bool(!empty);
  }
  if (!CALLABLE_METHOD_NAMES.has(name)) {
    throw new GodotRuntimeError("callable-method", `Invalid call. Nonexistent function '${name}' in base 'Callable'.`);
  }
  throw new UnsupportedError("callable-method", `Callable.${name}() 未实现`);
}

/** Array 上实测**不存在**的成员名（4.6.3 一名一名过裁判，S300 两名、S379 补上 `is_same`）：给的是运行期那句 `Nonexistent function`，不是「未实现」。
 *  `is_same` 是字典那侧的同名直觉 —— 数组上这一支叫 `is_same_typed`。 */
const ARRAY_NO_METHOD = new Set(["join", "concat", "is_same"]);

/** 属性读那一形的**确认不存在**名单（尺 `tmp/probe-bincall/round5.mts`：189 名逐名在字面量接收者上过裁判，
 *  读数 `compare5.txt`；与 S413 的存在数 String 108 / Array 50 对得上）。方向与 `PACK_ABSENT_*` 一致：
 *  只有裁判说「没这名字」的才发引擎那句，成员名要给内建类型的绑定 Callable（§6 第 83 条①还没接），照旧响亮拒。 */
const STRING_ATTR_ABSENT = [
  "all", "any", "append", "append_array", "assign", "at", "back", "binary_search", "bsearch",
  "bsearch_custom", "clear", "compress", "copy_on_write", "decode_string", "decompress", "dedent2",
  "duplicate", "each", "fill", "filter", "find_custom", "find_key", "front", "get", "get_bytes",
  "get_index", "get_or_add", "get_pointer", "get_string_from_ascii", "get_typed_builtin",
  "get_typed_class_name", "get_typed_script", "has", "has_all", "hex_encode", "insert_array",
  "is_null", "is_read_only", "is_same_typed", "is_typed", "keys", "make_read_only", "map", "max",
  "merge", "merged", "min", "nosuch", "pick_random", "pop_at", "pop_back", "pop_front", "push_back",
  "push_front", "recursive_equal", "reduce", "remove_at", "remove_at_copy", "resize", "rfind_custom",
  "same_type", "search_sorted", "set", "shuffle", "size", "slice", "sort", "sort_custom", "sort_flags",
  "subarray", "sum", "to_base64", "to_byte_array", "to_float32_array", "to_float64_array",
  "to_hex_string", "to_int32_array", "to_int64_array", "to_raw_string", "to_string", "values"
];

const ARRAY_ATTR_ABSENT = [
  "at", "begins_with", "bigrams", "bin_to_int", "binary_search", "c_escape", "c_unescape",
  "capitalize", "casecmp_to", "chr", "compress", "contains", "containsn", "copy_on_write", "countn",
  "decode_string", "decompress", "dedent", "dedent2", "each", "ends_with", "filecasecmp_to",
  "filenocasecmp_to", "find_key", "findn", "format", "get_base_dir", "get_basename", "get_bytes",
  "get_extension", "get_file", "get_index", "get_or_add", "get_pointer", "get_slice",
  "get_slice_count", "get_slicec", "get_string_from_ascii", "has_all", "hex_decode", "hex_encode",
  "hex_to_int", "humanize_size", "indent", "insert_array", "is_absolute_path", "is_null",
  "is_relative_path", "is_subsequence_of", "is_subsequence_ofn", "is_valid_filename", "is_valid_float",
  "is_valid_hex_number", "is_valid_html_color", "is_valid_identifier", "is_valid_int",
  "is_valid_ip_address", "join", "json_escape", "keys", "left", "length", "lpad", "lstrip", "match",
  "matchn", "md5_buffer", "md5_text", "merge", "merged", "naturalcasecmp_to", "naturalnocasecmp_to",
  "nocasecmp_to", "nosuch", "num", "num_int64", "num_scientific", "num_uint64", "pad_decimals",
  "pad_zeros", "path_join", "recursive_equal", "remove_at_copy", "repeat", "replace", "replacen",
  "rfindn", "right", "rpad", "rsplit", "rstrip", "same_type", "search_sorted", "sha1_buffer",
  "sha1_text", "sha256_buffer", "sha256_text", "similarity", "simplify_path", "sort_flags", "split",
  "split_floats", "strip_edges", "strip_escapes", "subarray", "substr", "sum", "to_ascii_buffer",
  "to_base64", "to_byte_array", "to_camel_case", "to_float", "to_float32_array", "to_float64_array",
  "to_hex_string", "to_int", "to_int32_array", "to_int64_array", "to_kebab_case", "to_lower",
  "to_pascal_case", "to_raw_string", "to_snake_case", "to_string", "to_upper", "to_utf16_buffer",
  "to_utf32_buffer", "to_utf8_buffer", "to_wchar_buffer", "trim_prefix", "trim_suffix", "unicode_at",
  "uri_decode", "uri_encode", "validate_filename", "validate_node_name", "values", "xml_escape",
  "xml_unescape"
];


/** Dictionary 上实测**不存在**的成员名（49 名过裁判量出 29 支，`tmp/probe-dict/compare22.txt`，S378）：同一句。
 *  名单里大半是 Array 那侧的名字（`push_back` / `sort_custom` / `slice` 那一族）—— 此前它们落到 switch 的兜底、发的是中文自述。 */
const DICT_NO_METHOD = new Set([
  "all", "any", "append_array", "bsearch", "bsearch_custom", "count", "fill", "filter", "find", "find_custom",
  "insert", "is_same", "join", "map", "max", "min", "pop_at", "pop_back", "pop_front", "push_back",
  "push_front", "reduce", "remove_at", "resize", "reverse", "rfind", "rfind_custom", "slice", "sort_custom",
]);

/** 只读容器被写的那一面（S403 逐格量的）：名 → 引擎那块的 `at:` 标签（每支各有各的 C++ 文件与行号）。 */
const ARRAY_RO_WRITE: Readonly<Record<string, string>> = {
  append: "push_back (core/variant/array.cpp:283)",
  push_back: "push_back (core/variant/array.cpp:283)",
  push_front: "push_front (core/variant/array.cpp:775)",
  insert: "insert (core/variant/array.cpp:326)",
  erase: "erase (core/variant/array.cpp:348)",
  remove_at: "remove_at (core/variant/array.cpp:505)",
  pop_back: "pop_back (core/variant/array.cpp:782)",
  pop_front: "pop_front (core/variant/array.cpp:793)",
  pop_at: "pop_at (core/variant/array.cpp:803)",
  clear: "clear (core/variant/array.cpp:125)",
  resize: "resize (core/variant/array.cpp:307)",
  sort: "sort (core/variant/array.cpp:734)",
  sort_custom: "sort_custom (core/variant/array.cpp:739)",
  reverse: "reverse (core/variant/array.cpp:770)",
  shuffle: "shuffle (core/variant/array.cpp:744)",
  fill: "fill (core/variant/array.cpp:341)",
  append_array: "append_array (core/variant/array.cpp:290)",
};

/** 只读那一面挡下写之后，`resize` 与 `insert` 这两支返回 23（`ERR_READ_ONLY`），其余给 null。 */
const ARRAY_RO_INT23 = new Set(["resize", "insert"]);

const DICT_RO_WRITE: Readonly<Record<string, string>> = {
  clear: "clear (core/variant/dictionary.cpp:315)",
  erase: "erase (core/variant/dictionary.cpp:255)",
  merge: "merge (core/variant/dictionary.cpp:337)",
  sort: "sort (core/variant/dictionary.cpp:332)",
  set: "set (core/variant/dictionary.cpp:207)",
};

/** 只读挡写：推一块 `ERROR: <面> is in read-only state.`，内容不变、脚本不打断（实测 `assign` 与 `get_or_add` 不在这一族里）。 */
function readOnlyWrite(at: string, kind: "Array" | "Dictionary", name: string): Variant {
  readOnlyError(at, kind);
  return ARRAY_RO_INT23.has(name) ? V.int(23) : V.nil();
}

export function method(raw: unknown, name: string, args: Variant[]): Variant {
  const obj = norm(raw);
  if (obj.t === Tag.STRING_NAME) return method(V.str(obj.v as string), name, args);

  if (obj.t === Tag.OBJECT) {
    const inner = obj.v;

    if (inner instanceof GdNativeClass) {
      throw new UnsupportedError("native-class-member", `引擎类 ${inner.className} 的 .${name}() 还没建模（实测 Node.new() 造得出实例、我们不发）`);
    }
    if (inner instanceof GVector2) return vector2Method(inner, name, args);
    if (inner instanceof GVector3) return vector3Method(inner, name, args);
    if (inner instanceof GVector2i) return vector2iMethod(inner, name, args);
    if (inner instanceof GVector3i) return vector3iMethod(inner, name, args);
    if (inner instanceof GColor) return colorMethod(inner, name, args);
    if (inner instanceof GBytes) return bytesMethod(inner, name, args);

    if (inner instanceof Signal) {
      if (name === "emit") {
        inner.emitList(args);
        return V.nil();
      }
      if (name === "connect") {
        const cb = args[0];
        if (cb === undefined || !isCallableBox(cb.v)) {
          throw new UnsupportedError("signal-connect", "connect() 的 Callable 实参这一格没量过（非 Callable 来源）");
        }
        // flags 只认 int 来源；其余值响亮拒，不静默按 0 处理
        const flags = args.length > 1 ? (args[1] as Variant) : V.int(0);
        if (flags.t !== Tag.INT) {
          throw new UnsupportedError("signal-flag", "connect() 的 flags 只量过 int 来源");
        }
        // flags 认 0 / 1 / 2 / 4 / 8。**1（CONNECT_DEFERRED）故意不发** —— 局部实例在 `_initialize` 返回时被回收、Godot 一声不响丢弃，而我们的盒子对接收者是强引用，排干队列就从「两边都不印」变成「Godot 不印、我们多印一行」= 静默错；要发这一格得先有宿主的对象生命周期模型。
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
          // 标签复刻不了（宿主类路径没登记）时只少一块 stderr，返回值仍是实测的 31
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
      // 这三个名字在 Signal 上**不存在**，而且是**运行期**那句 `Invalid call. Nonexistent function 'X' in base 'Signal'.`（`is_valid` 那一格是解析期拦的，不同）
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
      // 实测 RID 上只有 get_id()：别的名给运行期那句 Nonexistent function
      throw new GodotRuntimeError("rid-method", `Invalid call. Nonexistent function '${name}' in base 'RID'.`);
    }

    const npv = asNodePath(obj);
    if (npv !== null) return nodePathMethod(npv, name, args);

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
      // 实测：同一个对象两次调用相等、不同对象不等、typeof 是 2。数字本身是指针派生的，跨运行不定，所以语料只钉关系。
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
      // 认的是**引擎那条链**，脚本类名不在里面：`is_class("Thing")` 假，`is_class("RefCounted")` 与 `is_class("Object")` 真
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
        // 未知键静默给 null；**方法名给的是 Callable**，字段就是字段值
        if (args.length !== 1) throw new GodotRuntimeError("arity", `get() 需要 1 个参数（收到 ${args.length} 个）`);
        if (!(prop in (inner as Record<string, unknown>))) return V.nil();
        return wrapValue(attribute(obj, prop));
      }
      if (args.length !== 2) throw new GodotRuntimeError("arity", `set() 需要 2 个参数（收到 ${args.length} 个）`);
      // 键不存在或槽装不下都是**静默无操作**（读回来还是原样）；未定型字段照旧自由赋值
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
      // 必填数 = 第一个带默认值之前的形参数，最多数由产物登记；两个数都从发射器那张表拿（JS 的 `fn.length` 在静态编译目标上没有 lowering）
      const declared = methodAritiesOf(inner)?.[who];
      if (declared === undefined) {
        throw new UnsupportedError("object-call-arity", `Object.call() 拿不到 ${who}() 的声明形参数（方法表里没有它）`);
      }
      const min = declared[0];
      const max = declared[1];
      if (rest.length < min || rest.length > max) {
        if (name === "callv") {
          // `callv` 不合式**不抛**，返回 null
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
        // 「方法不存在」与「实参不合式」的确切文本未定 → 响亮拒
        throw new UnsupportedError("object-call-deferred", `call_deferred("${who}") 的方法不存在，失败形状也没量过`);
      }
      // `call_deferred()` 的**返回值就是 null**，真正的调用排在后面
      const rest = args.slice(1) as Variant[];
      callDeferred(() => {
        callSlot(inner, who, rest);
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

    const direct = callSlot(inner, name, args);
    if (direct !== null) return direct;

    const sd = descFor(inner);
    // 静态方法按名调用（`Inner.make()` 与 `p.make()` 两条接收者都到这里）：类值不在派发表里，走 desc 的显式静态表
    if (sd !== null && hasStaticName(sd, name)) return callStatic(sd, name, args);
    // 走到这里说明注册表与产物不一致：实例上确有这个函数，发射器却没把它进表 → 响亮拒
    if (inner instanceof GdScriptObject) {
      const member = (inner as unknown as Record<string, unknown>)[name];
      if (typeof member === "function") {
        throw new UnsupportedError("method-slot-missing", `${name}() 不在 ${classNameOf(inner) ?? "Object"} 的派发表里（脚本类的方法都由发射器进了表）`);
      }
    }

    throw new UnsupportedError("object-method", `对象上的 ${name}() 未实现`);
  }

  switch (obj.t) {
    case Tag.ARRAY: {
      const a = obj.v as GArray;
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
        case "duplicate":
          return V.array(a.duplicate(boolArgOr(args, 0, false)));
        case "duplicate_deep": {
          // 实测（S548）：纯容器里模式 0 / 1 / 2 / 3 / -1 都是**整棵深拷**，嵌套改一边不动另一边；模式只对 Resource 子资源有意义（Tier 1 不出）
          if (args.length > 0 && (args[0] as Variant).t !== Tag.INT) {
            throw new UnsupportedError("duplicate-deep-arg", "Array.duplicate_deep() 的模式参数只量过 int 来源");
          }
          return V.array(a.duplicate(true));
        }
        case "size":
          return V.int(a.size());
        case "is_empty":
          return V.bool(a.size() === 0);
        case "has":
          return V.bool(a.has(one(args, "has")));
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
          // 这两个名在 Array 上**根本没有**：`join` 是 String 的方法（S171 量过），`concat` 是 JS 的 API —— S300 把 String / Array / Dictionary
          // 三族 180 个成员名一名一名过了裁判，只有 `concat` 是「我们表里有、引擎没这名字」那一格。接收者是推断出来的 var 时解析期放过，运行期给下面那句。
          if (ARRAY_NO_METHOD.has(name)) {
            throw new GodotRuntimeError("array-no-method", `Invalid call. Nonexistent function '${name}' in base 'Array'.`);
          }
          throw new UnsupportedError("array-method", `Array.${name}() 未实现`);
      }
    }
    case Tag.DICT: {
      const d = obj.v as GDict;
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
          // 引擎这一支返回 true（实测 `d.set("a", 2)` 印 `true`、`d.set(1, 5)` 也印 `true` 且键都真换掉了）
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
        // `merged` 是 `merge` 的不改接收者版：浅拷一份再并（实测改结果不动接收者，而嵌套的值两边共享 —— `tmp/probe-dict/compare21.txt` 07/08）
        case "merged": {
          const copy = d.duplicate(false);
          copy.mergeWith(asDict(one(args, "merged"), "merged"), boolArgOr(args, 1, false));
          return V.dict(copy);
        }
        // 键已在就给现值、一个字节也不写；不在才落默认值（单实参时落 null），给回的就是传进来那一份（实测字典默认值不拷）
        case "get_or_add": {
          const key = one(args, "get_or_add");
          if (d.has(key)) return d.get(key);
          const added = args[1] ?? V.nil();
          if (d.isReadOnly()) return added;
          d.set(key, added);
          return added;
        }
        // 引擎那一支的签名是 `recursive_equal(字典, 递归计数)` —— 两支实参都必填（4.6.3 实测少一支给 `Expected at least 2`），
        // 而它与 `==` 是同一段 C++：自引用时两边都打 `Max recursion reached` 再给 true（`tmp/probe-dict/cell2-*.txt`）；
        // 计数在无环时不影响结果（0 / 1 / 2 / 99 / -1 五格同值），所以直接走 `valueEq`
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
        case "hash":
          return V.int(variantHashNumber(obj));
        default:
          if (DICT_NO_METHOD.has(name)) throw new GodotRuntimeError("dict-no-method", `Invalid call. Nonexistent function '${name}' in base 'Dictionary'.`);
          throw new UnsupportedError("dict-method", `Dictionary.${name}() 未实现`);
      }
    }
    case Tag.STRING: {
      const s = obj.v as string;
      switch (name) {
        case "length":
          return V.int(strLength(s));
        case "substr":
          return V.str(strSubstr(s, intArg(args, 0, "substr"), intArgOr(args, 1, -1)));
        case "left":
          return V.str(strEdge(s, intArg(args, 0, "left"), "left"));
        case "right":
          return V.str(strEdge(s, intArg(args, 0, "right"), "right"));
        case "is_empty":
          return V.bool(strLength(s) === 0);
        case "contains":
          return V.bool(strContains(s, asString(one(args, "contains"), "contains")));
        case "replace":
        case "replacen":
        case "find":
        case "findn":
        case "rfind":
        case "rfindn": {
          const min = name.startsWith("find") || name.startsWith("rfind") ? 1 : 2;
          if (args.length < min) {
            throw new GodotRuntimeError(
              "arity",
              `Too few arguments for "${name}()" call. Expected at least ${min} but received ${args.length}.`,
            );
          }
          if (args.length > 2) {
            throw new GodotRuntimeError(
              "arity",
              `Too many arguments for "${name}()" call. Expected at most 2 but received ${args.length}.`,
            );
          }
          const insensitive = name.endsWith("n");
          if (min === 2) {
            return V.str(
              strReplace(s, asString(args[0] as Variant, name), asString(args[1] as Variant, name), insensitive),
            );
          }
          const needle = asString(args[0] as Variant, name);
          const from = args.length === 2 ? intArg(args, 1, name) : name.startsWith("r") ? -1 : 0;
          return V.int(strFind(s, needle, from, name.startsWith("r"), insensitive));
        }
        case "replace_char": {
          const key = intArg(args, 0, "replace_char");
          const withCp = intArg(args, 1, "replace_char");
          if (withCp === 0) {
            stringReplaceCharNul();
            return V.str(s);
          }
          return V.str(strReplaceChar(s, key, charReplacement(withCp, "replace_char")));
        }
        case "replace_chars": {
          const keys = asString(one(args, "replace_chars"), "replace_chars");
          const withCp = intArg(args, 1, "replace_chars");
          if (withCp === 0) {
            stringReplaceCharsNul();
            return V.str(s);
          }
          return V.str(strReplaceChars(s, keys, charReplacement(withCp, "replace_chars")));
        }
        case "remove_char":
          return V.str(strRemoveChar(s, intArg(args, 0, "remove_char")));
        case "remove_chars":
          return V.str(strRemoveChars(s, asString(one(args, "remove_chars"), "remove_chars")));
        case "uri_file_decode": {
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `uri_file_decode() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.str(strUriDecode(s, false));
        }
        case "is_valid_ascii_identifier": {
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `is_valid_ascii_identifier() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.bool(strIsValidAsciiIdentifier(s));
        }
        case "split": {
          if (args.length > 3) {
            throw new GodotRuntimeError("arity", `split() 最多 3 个参数（收到 ${args.length} 个）`);
          }
          const allow = args[1] === undefined ? true : boolArg(args, 1, "split");
          const dm = asString(one(args, "split"), "split");
          let parts: string[];
          if (args.length === 3) {
            const mx = args[2] as Variant;
            // maxsplit 那一位同样按 int 位的折法收（`"abc".split("a", 1, true)` 实测与给 1 一字一样）
            const cap = foldInt(mx, `split() 的第 3 个参数需要 int`);
            parts = cap <= 0 ? strSplit(s, dm, allow) : strSplitCapped(s, dm, allow, cap);
          } else {
            parts = strSplit(s, dm, allow);
          }
          return V.array(GArray.of(parts.map((p) => V.str(p))));
        }
        case "to_upper":
          return V.str(strCase(s, "upper"));
        case "to_lower":
          return V.str(strCase(s, "lower"));
        case "capitalize":
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `capitalize() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.str(strCapitalize(s));
        case "to_utf8_buffer": {
          if (args.length !== 0) throw new GodotRuntimeError("arity", `to_utf8_buffer() 不接受参数（收到 ${args.length} 个）`);
          return V.object(new GBytes(Array.from(new TextEncoder().encode(s))));
        }
        case "to_ascii_buffer": {
          if (args.length !== 0) throw new GodotRuntimeError("arity", `to_ascii_buffer() 不接受参数（收到 ${args.length} 个）`);
          if (Array.from(s).some((ch) => (ch.codePointAt(0) as number) > 127)) {
            throw new UnsupportedError("string-ascii-buffer", "to_ascii_buffer() 只实测过纯 ASCII 字符串");
          }
          return V.object(new GBytes(Array.from(s, (ch) => ch.codePointAt(0) as number)));
        }
        case "to_float":
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `to_float() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.float(strToFloat(s));
        case "is_valid_float": {
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `is_valid_float() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.bool(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]*)?$/.test(s));
        }
        case "join": {
          if (args.length !== 1) {
            throw new GodotRuntimeError(
              "join-arity",
              args.length === 0
                ? `Too few arguments for "join()" call. Expected at least 1 but received 0.`
                : `Too many arguments for "join()" call. Expected at most 1 but received ${args.length}.`,
            );
          }
          const a = args[0] as Variant;
          if (a.t !== Tag.ARRAY) {
            throw new GodotRuntimeError(
              "join-arg",
              a.t === Tag.DICT
                ? `Invalid argument for "join()" function: argument 1 should be "PackedStringArray" but is "Dictionary".`
                : `Cannot pass a value of type "${tagName(a.t)}" as "PackedStringArray".`,
            );
          }
          return V.str(strJoin(s, a.v as GArray));
        }
        case "to_int":
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `to_int() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.int(strToInt(s));
        case "is_valid_int":
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `is_valid_int() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.bool(INT_RE.test(s));
        case "hex_to_int":
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `hex_to_int() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.int(strHexToInt(s));
        case "bin_to_int":
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `bin_to_int() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.int(strBinToInt(s));
        case "is_valid_hex_number": {
          if (args.length > 1) {
            throw new GodotRuntimeError("arity", `is_valid_hex_number() 最多 1 个参数（收到 ${args.length} 个）`);
          }
          const withPrefix = args.length === 1 ? boolArg(args, 0, "is_valid_hex_number") : false;
          return V.bool(withPrefix ? HEX_PREFIX_RE.test(s) : HEX_RE.test(s));
        }
        case "hash":
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `hash() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.int(hashDjb2(s));
        case "begins_with":
        case "ends_with": {
          const w = asString(one(args, name), name);
          return V.bool(name === "begins_with" ? strStartsWith(s, w) : strEndsWith(s, w));
        }
        case "pad_zeros": {
          if (args.length !== 1) {
            throw new GodotRuntimeError("arity", `pad_zeros() 要 1 个参数（收到 ${args.length} 个）`);
          }
          return V.str(strPadZeros(s, intArg(args, 0, "pad_zeros")));
        }
        case "get_slicec": {
          if (args.length !== 2) {
            throw new GodotRuntimeError("arity", `get_slicec() 要 2 个参数（收到 ${args.length} 个）`);
          }
          return V.str(strGetSlicec(s, intArg(args, 0, "get_slicec"), intArg(args, 1, "get_slicec")));
        }
        case "get_slice": {
          if (args.length < 2) {
            throw new GodotRuntimeError("arity", `Too few arguments for "get_slice()" call. Expected at least 2 but received ${args.length}.`);
          }
          if (args.length > 2) {
            throw new GodotRuntimeError("arity", `Too many arguments for "get_slice()" call. Expected at most 2 but received ${args.length}.`);
          }
          return V.str(strGetSlice(s, asString(args[0] as Variant, "get_slice"), intArg(args, 1, "get_slice")));
        }
        case "insert": {
          if (args.length !== 2) {
            throw new GodotRuntimeError("arity", `insert() 要 2 个参数（收到 ${args.length} 个）`);
          }
          return V.str(strInsertAt(s, intArg(args, 0, "insert"), asString(args[1] as Variant, "insert")));
        }
        case "erase": {
          if (args.length !== 2) {
            throw new GodotRuntimeError("arity", `erase() 要 2 个参数（收到 ${args.length} 个）`);
          }
          return V.str(strEraseAt(s, intArg(args, 0, "erase"), intArg(args, 1, "erase")));
        }
        case "repeat": {
          if (args.length !== 1) {
            throw new GodotRuntimeError("arity", `repeat() 要 1 个参数（收到 ${args.length} 个）`);
          }
          return V.str(strRepeat(s, intArg(args, 0, "repeat")));
        }
        case "similarity":
          return V.float(strSimilarity(s, asString(one(args, "similarity"), "similarity")));
        case "strip_edges": {
          if (args.length > 2) {
            throw new GodotRuntimeError("arity", `Too many arguments for "strip_edges()" call. Expected at most 2 but received ${args.length}.`);
          }
          const left = args[0] === undefined ? true : boolArg(args, 0, "strip_edges");
          const right = args[1] === undefined ? true : boolArg(args, 1, "strip_edges");
          return V.str(strStripEdges(s, left, right));
        }
        case "unicode_at":
          return V.int(strUnicodeAt(s, intArg(args, 0, "unicode_at")));
        case "casecmp_to":
          return V.int(strCmp(s, asString(one(args, "casecmp_to"), "casecmp_to")));
        case "is_valid_filename": {
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `is_valid_filename() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.bool(strIsValidFilename(s));
        }
        case "uri_encode": {
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `uri_encode() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.str(strUriEncode(s));
        }
        case "uri_decode": {
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `uri_decode() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.str(strUriDecode(s));
        }
        case "c_escape": {
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `c_escape() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.str(strCEscape(s));
        }
        case "to_camel_case":
        case "to_kebab_case":
        case "to_snake_case": {
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `${name}() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.str(strCaseStyle(s, name === "to_camel_case" ? "camel" : name === "to_kebab_case" ? "kebab" : "snake"));
        }
        case "count":
        case "countn": {
          if (args.length < 1) {
            throw new GodotRuntimeError("arity", `Too few arguments for "${name}()" call. Expected at least 1 but received ${args.length}.`);
          }
          if (args.length > 3) {
            throw new GodotRuntimeError("arity", `Too many arguments for "${name}()" call. Expected at most 3 but received ${args.length}.`);
          }
          // 第二、三个参数是 `from` / `to`（码点下标），不是布尔：41 格实测把这条钉死了（S232）
          const from = args.length >= 2 ? intArg(args, 1, name) : 0;
          const to = args.length >= 3 ? intArg(args, 2, name) : 0;
          return V.int(strCount(s, asString(args[0] as Variant, name), name === "countn", from, to));
        }
        case "format": {
          if (args.length < 1) {
            throw new GodotRuntimeError("arity", `Too few arguments for "format()" call. Expected at least 1 but received ${args.length}.`);
          }
          if (args.length > 2) {
            throw new GodotRuntimeError("arity", `Too many arguments for "format()" call. Expected at most 2 but received ${args.length}.`);
          }
          const ph = args.length >= 2 ? asString(args[1] as Variant, "format") : "{_}";
          const vals = args[0] as Variant;
          // 引擎只认 Array / Dictionary / 真对象；其余 Variant 档位（标量、值型、Callable…）打一块非致命 ERROR、脚本照跑、格式串原样回吐（实测 `tmp/d6/s511fmt.gd`，S511）。
          if (!(vals.t === Tag.ARRAY || vals.t === Tag.DICT || (vals.t === Tag.OBJECT && vals.v instanceof GdScriptObject))) {
            stringFormatInvalidType();
          }
          return V.str(strFormatV(s, vals, ph));
        }
        case "md5_text":
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `md5_text() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.str(md5Hex(s));
        default:
          throw new UnsupportedError("string-method", `String.${name}() 未实现`);
      }
    }
    default:
      throw new UnsupportedError("method-on-type", `类型 ${obj.t} 上调用 ${name}() 未实现`);
  }
}

export function index(raw: unknown, idx: Variant, base?: string): Variant {
  const obj = norm(raw);
  if (obj.t === Tag.ARRAY) return asArray(obj, "下标").get(intArgIdx(idx, "下标"), base);
  if (obj.t === Tag.DICT) return asDict(obj, "下标").getRequired(idx);
  if (obj.t === Tag.STRING) return V.str(strAt(asString(obj, "下标"), intArgIdx(idx, "下标"), base));
  // 八支 pack 的读那一格：基带静态标注时越界换 `Out of bounds get index …` 那一式，基名按声明的拼法（读数 compare99 的 u3）
  if (base !== undefined && obj.t === Tag.OBJECT && obj.v instanceof GBytes) {
    const len = (obj.v as GBytes).length;
    const i = intArgIdx(idx, "下标");
    const k = i < 0 ? i + len : i;
    if (k < 0 || k >= len) throw new GodotRuntimeError("packed-index", posOobSay(String(i), base, base));
  }
  if (obj.t === Tag.OBJECT && obj.v instanceof GVector2) return vecReadIndex(obj.v as GVector2, idx);
  if (obj.t === Tag.OBJECT && obj.v instanceof GVector3) return vec3ReadIndex(obj.v as GVector3, idx);
  if (obj.t === Tag.OBJECT && obj.v instanceof GVector2i) return vec2iReadIndex(obj.v as GVector2i, idx);
  if (obj.t === Tag.OBJECT && obj.v instanceof GVector3i) return vec3iReadIndex(obj.v as GVector3i, idx);
  if (obj.t === Tag.OBJECT && obj.v instanceof GColor) return colorRead(obj.v as GColor, idx, "read");
  if (obj.t === Tag.OBJECT && obj.v instanceof GBytes) return bytesReadIndex(obj.v as GBytes, idx);
  throw new UnsupportedError("index-type", `类型 ${obj.t} 不支持下标`);
}

/** 静态标注的字典 + 静态 int 键的那一格：引擎讲的是数组那一式 `Out of bounds get index '<k>' (on base: '<基名>')`（句末没有句点，S405 量的）。其余形状退回通读那条。 */
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

/** 属性写的那条错：未知键、往 String 槽塞 int、写方法名**三条文本一模一样**，所以合成一个助手；基类那一段是 `RefCounted (内建类名)`，拿不到注册名就退成 Object。 */
function propAssignError(key: string, value: Variant, inner: unknown): GodotRuntimeError {
  return new GodotRuntimeError(
    "prop-assign",
    `Invalid assignment of property or key '${key}' with value of type '${tagName(value.t)}' on a base object of type 'RefCounted (${classNameOf(inner) ?? "Object"})'.`,
  );
}

/** 属性写 `base.key = value`：入口与 `method` / `attribute` 一样要**归一裸值**；基是值类型时只回报新值（写回目标是变量还是容器的一格，发射器才知道），返回 null 表示原地处理完。 */
export function writeProp(raw: unknown, key: string, value: Variant): Variant | null {
  const base = norm(raw);
  // 字典的属性写不报错，也不挂 JS 属性：引擎就是把这一格当 `d[&"<key>"] = value` 写进字典（读数 `tmp/probe-bincall/j1.gd` 的 R1–R7）
  if (base.t === Tag.DICT) {
    asDict(base, "属性").set(V.stringName(key), value);
    return null;
  }
  // Array / String 的属性写没有「塞一格」这种出路：读数 `tmp/probe-bincall/compare4.txt` 的 M4 / M5 / M8 三格说明
  // **成员名与表外名给的是同一句**，所以这一支不需要名单分岔
  if (base.t === Tag.ARRAY || base.t === Tag.STRING) {
    throw new GodotRuntimeError(
      "container-prop-assign",
      `Invalid assignment of property or key '${key}' with value of type '${tagName(value.t)}' on a base object of type '${tagName(base.t)}'.`,
    );
  }
  const vec = base.t === Tag.OBJECT && base.v instanceof GVector2 ? (base.v as GVector2) : null;
  const vec3 = base.t === Tag.OBJECT && base.v instanceof GVector3 ? (base.v as GVector3) : null;
  if (vec3 !== null) return vec3Write(vec3, V.str(key), value, "prop");
  const vec2i = base.t === Tag.OBJECT && base.v instanceof GVector2i ? (base.v as GVector2i) : null;
  if (vec2i !== null) return vec2iWrite(vec2i, V.str(key), value, "prop");
  const vec3i = asVec3i(base);
  if (vec3i !== null) return vec3iWrite(vec3i, V.str(key), value, "prop");
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
    && !(base.v instanceof GVector2 || base.v instanceof GVector3 || base.v instanceof GVector2i || base.v instanceof GVector3i || base.v instanceof GColor || base.v instanceof GBytes || base.v instanceof Signal)
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
    // 属性写的两形量过：表外名给 `Invalid assignment of property or key … with value of type …`（读数 `tmp/probe-attr/compare2.txt` 的推断位写那一格），
    // 写方法名那一格静态位给的是 `Cannot assign a new value to a constant.`，装箱位没量过 —— 照旧响亮拒
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

/** `v[0] = E`：基是值类型就回报新值，容器/字典的下标赋值原地处理（返回 null）；基收 `unknown` 是因为发射器递来的读式（`rt.attribute` / `rt.index`）就是这个类型。 */
export function writeIdx(raw: unknown, idx: Variant, value: Variant): Variant | null {
  const base = norm(raw);
  // 数组/字典/字符串不可能是向量那批 —— 先落回 setIndex，省掉下面六个 instanceof（下标写是热路径）。
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

/** for ... in 的迭代协议 */
/**
 * `for x in <数>` 是「从 0 数到那个数」：整数给 `0..n-1`、float 给 `0.0..`，n<=0 空转（4.6.3 实测，见 SEMANTICS S202）。
 * 计数口径与 `rangeSeq` 同一条 —— 都是先展开成数组再走 for-of。
 */
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

/** `"%d/%s" % [...]` —— 字符串格式化运算符：与 `ops.mod` 那一路同一判据（失败推一块 ERROR、格式串原样回出去） */
export function formatOf(fmt: Variant, args: Variant): Variant {
  return pctFormatOp(fmt, args);
}

/** 内建类型面的「方法名当值」：发射器只在**静态已知的接收者**且名字是那一面的成员时发这一支
 *  （读数 `tmp/probe-bincall/p1.gd` 的 16 面与 `compare6.txt` 的 N6：印法 `<面>::<名>`、`typeof` 25、`is_valid()` 真、`get_object()` 空引用）。 */
export function boundMethod(raw: unknown, face: string, name: string, min: number, max: number): Variant {
  return boundBuiltinCallable(norm(raw), face, name, min, max);
}

/** 可变那两面（Array 与 pack 九支）读那一刻拷一份；值类型本来就不可变，字典面不发绑定 Callable（S419 ②）。 */
function boundSnapshot(v: Variant): Variant | null {
  const inner = v.v;
  if (inner instanceof GArray) {
    const snap = inner.duplicate(true);
    snap.elem = inner.elem;
    return V.array(snap);
  }
  if (inner instanceof GBytes) return V.object(new GBytes(inner.raw().slice(), inner.kind));
  return null;
}

registerBoundSnapshotHook(boundSnapshot);

export function attribute(raw: unknown, name: string): unknown {
  const obj = norm(raw);
  // 字典的属性读就是查一格 StringName 键：键在就给值（`d.foo = 5` 之后 `d.foo` 是 5，读数 `tmp/probe-bincall/j1.gd` 的 R1），
  // 不在就给那一句 —— 成员名（`d.keys`）也算「不在」，引擎在字典面上不发内建类型的绑定 Callable（S419 ②）
  if (obj.t === Tag.DICT) {
    const dict = asDict(obj, "属性");
    const k = V.stringName(name);
    if (dict.has(k)) return dict.getRequired(k);
    throw new GodotRuntimeError("dict-attribute", `Invalid access to property or key '${name}' on a base object of type 'Dictionary'.`);
  }
  if (obj.t === Tag.STRING_NAME) {
    // StringName 那一面的成员表就是 String 那张（S389 一名一名量过），属性读同一条三分岔
    if (valueAttrKind("StringName", name) === "absent") {
      throw new GodotRuntimeError("face-attribute", `Invalid access to property or key '${name}' on a base object of type 'StringName'.`);
    }
    const row = faceArity("StringName", name);
    if (row !== null) return boundBuiltinCallable(obj, "StringName", name, row[0], row[1]);
    throw new UnsupportedError("face-attribute", `StringName.${name} 的属性读落在两份名单之外：候选宇宙之外的名字没量过，不发引擎那句`);
  }
  if (obj.t === Tag.STRING || obj.t === Tag.ARRAY) {
    const face = obj.t === Tag.STRING ? "String" : "Array";
    const absent = face === "String" ? STRING_ATTR_ABSENT : ARRAY_ATTR_ABSENT;
    if (absent.includes(name)) {
      throw new GodotRuntimeError("face-attribute", `Invalid access to property or key '${name}' on a base object of type '${face}'.`);
    }
    const row = faceArity(face, name);
    if (row !== null) return boundBuiltinCallable(obj, face, name, row[0], row[1]);
    throw new UnsupportedError("face-attribute", `${face}.${name} 的属性读落在两份名单之外：候选宇宙之外的名字没量过，不发引擎那句`);
  }
  if (obj.t === Tag.OBJECT) {
    // 引擎类值（`Node` 当变量用）实测能取身份与比等式，属性面与 `.new()` 都没建模：照形状拒，不发半对文本
    if (obj.v instanceof GdNativeClass) {
      throw new UnsupportedError("native-class-member", `引擎类 ${obj.v.className} 的 .${name} 还没建模（实测能取值、能比等式，打出来带进程内的号）`);
    }
    const vec = obj.v instanceof GVector2 ? (obj.v as GVector2) : null;
    if (vec && (name === "x" || name === "y")) return V.float(vec[name]);
    const vec3 = obj.v instanceof GVector3 ? (obj.v as GVector3) : null;
    if (vec3 && (name === "x" || name === "y" || name === "z")) return V.float(vec3[name]);
    const vec2i = obj.v instanceof GVector2i ? (obj.v as GVector2i) : null;
    if (vec2i && (name === "x" || name === "y")) return V.int(vec2i[name]);
    const vec3i = obj.v instanceof GVector3i ? (obj.v as GVector3i) : null;
    if (vec3i && (name === "x" || name === "y" || name === "z")) return V.int(vec3i[name]);
    const vface = obj.v instanceof GVector2 ? "Vector2" : obj.v instanceof GVector2i ? "Vector2i"
      : obj.v instanceof GVector3 ? "Vector3" : obj.v instanceof GVector3i ? "Vector3i"
        : obj.v instanceof GColor ? "Color" : obj.v instanceof GdNodePath ? "NodePath" : null;
    if (vface !== null) {
      // 装箱位读成员名也是绑定 Callable（读数 `tmp/probe-bincall/m1.gd` 的 M1–M8），表外名给引擎那句（`tmp/probe-vattr/box.gd` 七格）
      const kind = valueAttrKind(vface, name);
      if (kind === "absent") {
        throw new GodotRuntimeError("face-attribute", `Invalid access to property or key '${name}' on a base object of type '${vface}'.`);
      }
      const row = faceArity(vface, name);
      if (row !== null) return boundBuiltinCallable(obj, vface, name, row[0], row[1]);
    }
    const col = obj.v instanceof GColor ? (obj.v as GColor) : null;
    if (col !== null) return colorRead(col, V.str(name), "prop");
    if (obj.v instanceof GBytes) {
      // 属性面只量过三格（读数 `tmp/probe-attr/compare{1,2}.txt`）：表外名给 `Invalid access to property or key …`，
      // 方法名当值引擎给的是 Callable（`PackedByteArray::size`）还没接，其余没量过的名字照旧响亮拒
      if (packNameAbsent((obj.v as GBytes).kind, name)) {
        throw new GodotRuntimeError("packed-attribute", `Invalid access to property or key '${name}' on a base object of type '${packTypeName((obj.v as GBytes).kind)}'.`);
      }
      const row = faceArity(packTypeName((obj.v as GBytes).kind), name);
      if (row !== null) return boundBuiltinCallable(obj, packTypeName((obj.v as GBytes).kind), name, row[0], row[1]);
      throw new UnsupportedError("packed-attribute", `pack 的属性读落在两份名单之外：${packTypeName((obj.v as GBytes).kind)}.${name} 的元数没量过，不发引擎那句`);
    }
    const inner = obj.v as Record<string, unknown>;
    const sd = descFor(inner);
    if (sd !== null && hasStaticName(sd, name)) {
      // 接收者带**类身份**：静态方法 Callable 的形参数与等式都按 (类, 方法名) 判；盒子存 `(a) => staticCall(desc, name, a)` —— 不 spread、不 bind，静态编译目标两样都没有 lowering
      return methodCallable(V.object(sd), name);
    }
    const svars = sd === null ? null : sd.staticVars;
    if (svars !== null && sd !== null && name in svars) {
      const hit = varSlotOf(sd, name);
      if (hit !== null) return hit.get();
    }
    if (!(inner instanceof ClassDesc) && name in inner) {
      const v = inner[name];
      if (typeof v === "function") return methodCallable(obj, name);
      return v;
    }
    // 声明过却没赋上值的属性（字段初始化子出错才留得下来，S406 的 n1 / n2 / q1 三格）：引擎读出来是 null。
    for (let d = sd; d !== null; d = d.base) {
      if (d.scriptProps !== null && d.scriptProps.includes(name)) return V.nil();
    }
  }
  if (obj.t === Tag.NIL) {
    throw new GodotRuntimeError("nil-attribute", `对 null 取属性 ${name}`);
  }
  throw new UnsupportedError("attribute", `取属性 ${name} 未实现（对象模型还没做完）`);
}

/** Callable 实参：Godot **严格按声明的实参个数**调用，对不上整次调用就失败 —— 返回的调用器用 `null` 表示「这次调用失败」。 */
function callerOf(v: Variant | undefined, argc: number, who: string): (args: Variant[]) => Variant | null {
  const inner = v === undefined ? undefined : v.v;
  if (!(inner instanceof CallableBox)) {
    throw new UnsupportedError("array-callable", `Array.${who}() 需要一个 Callable`);
  }
  if (requiredArgCount(inner) !== argc) return () => null;
  return (args) => callCallableBox(inner, args);
}

/** 单实参谓词：`filter`/`map`/`any`/`all`/`find_custom`/`rfind_custom` 收到的都是 `f(元素)`。 */
function predOf(v: Variant | undefined, who: string): (x: Variant) => Variant | null {
  const call = callerOf(v, 1, who);
  return (x) => call([x]);
}

/** `sort_custom` / `bsearch_custom` 的比较实参：f(a,b) 为真表示 a 该在 b 前；实参个数对不上时比较器恒不成立。 */
function comparatorOf(v: Variant | undefined, who: string): (a: Variant, b: Variant) => boolean {
  const call = callerOf(v, 2, who);
  return (x, y) => {
    const r = call([x, y]);
    return r !== null && truthyOf(r);
  };
}

/** 装箱二分那一族的比较：遇到引擎「比不了」的组合时它不报错、按 false 继续走（`[1, 2].bsearch("a")` 与 `bsearch(^"a")` 实测都给 0、
 *  `[Color(1, 0, 0, 1), Color(2, 0, 0, 1)].bsearch(Color(3, 0, 0, 1))` 也给 0 —— Color 与 NodePath 在装箱比较里**根本没有序**，
 *  读数 `tmp/probe-argtype/bsearch2.txt` + `fold11` 的 stderr 计数 0）。
 *  只认这两条 code（同一判据散在 `ops` 与 `color` 两处、句子不同），其余照旧往外抛。 */
const NO_ORDER = new Set(["compare-operands", "color-cmp"]);

function lessOrFalse(a: Variant, b: Variant): boolean {
  try {
    return isLess(a, b);
  } catch (e) {
    if (NO_ORDER.has((e as { code?: string }).code ?? "")) return false;
    throw e;
  }
}

function one(args: Variant[], who: string): Variant {
  const a = args[0];
  if (a === undefined) throw new GodotRuntimeError("arity", `${who} 缺少参数`);
  return a;
}

function argAt(args: Variant[], i: number, who: string): Variant {
  const a = args[i];
  if (a === undefined) throw new GodotRuntimeError("arity", `${who} 缺少第 ${i} 个参数`);
  return a;
}

/** int 位上的实参：int 原样，float 按 C 的截断折、bool 折 0 / 1 —— 判据是 `tmp/probe-argtype/fold*.txt` 的读数
 *  （`"abc".substr(1.9, 1)` 给 `b`、`"abc".left(true)` 给 `a`、`"abc".repeat(-0.5)` 给空串）。
 *  非有限值与越出 int64 的那几格引擎一律折到 INT64_MIN（`left(1e19)`、`substr(NAN, 1)`、`split("a", -INF, 1)` 同形）。 */
function foldInt(v: Variant, fail: string): number {
  if (v.t === Tag.INT) return intToNum(v.v as IntPayload);
  if (v.t === Tag.BOOL) return v.v ? 1 : 0;
  if (v.t === Tag.FLOAT) {
    const n = v.v as number;
    if (!Number.isFinite(n) || Math.abs(n) >= 9223372036854775808) return -9223372036854775808;
    return Math.trunc(n);
  }
  throw new UnsupportedError("need-int-arg", fail);
}

/** bool 位上的实参：int / float 按「不等于 0」折，NaN 也算不等 0（`"abc".split("a", NAN, 1)` 走的是 allow_empty 真那一支）。 */
function foldBool(v: Variant, fail: string): boolean {
  if (v.t === Tag.BOOL) return v.v as boolean;
  if (v.t === Tag.INT) return intToNum(v.v as IntPayload) !== 0;
  if (v.t === Tag.FLOAT) return Number.isNaN(v.v as number) || (v.v as number) !== 0;
  throw new UnsupportedError("need-bool-arg", fail);
}

function intArg(args: Variant[], i: number, who: string): number {
  const a = args[i];
  if (a === undefined) {
    throw new UnsupportedError("need-int-arg", `${who} 的第 ${i} 个参数需要 int`);
  }
  return foldInt(a, `${who} 的第 ${i} 个参数需要 int`);
}

/** 下标那三处（读、字符串取字符、写）只有一个 int 参：直接收 Variant，别为它现造一个参数数组。报错文本与 intArg 一致。 */
function intArgIdx(a: Variant, who: string): number {
  return foldInt(a, `${who} 的第 0 个参数需要 int`);
}

/** 可选 int 参：省略时取 Godot 的默认值。 */
function intArgOr(args: Variant[], i: number, dflt: number): number {
  const a = args[i];
  if (a === undefined) return dflt;
  return foldInt(a, `第 ${i} 个参数需要 int`);
}

function boolArg(args: Variant[], i: number, who: string): boolean {
  const a = args[i];
  if (a === undefined) {
    throw new UnsupportedError("need-bool-arg", `${who} 的第 ${i} 个参数需要 bool`);
  }
  return foldBool(a, `${who} 的第 ${i} 个参数需要 bool`);
}

/** 可选 bool 参：省略时取 Godot 的默认值。 */
function boolArgOr(args: Variant[], i: number, dflt: boolean): boolean {
  const a = args[i];
  if (a === undefined) return dflt;
  return foldBool(a, `第 ${i} 个参数需要 bool`);
}

/** 全局 Callable 的实参槽位：`.call()` 与 `callv()` 都先过实测的区间闸门，只剩 `call_deferred()` 那一形能空着进来（引擎侧没量），响亮拒。 */
function ga(a: Variant[], i: number): Variant {
  const v = a[i];
  if (v === undefined) {
    throw new UnsupportedError("global-callable-arg", `全局 Callable 的第 ${i + 1} 个实参槽是空的（这一形没量过引擎读数）`);
  }
  return v;
}

/** 全局 Callable 的「名字 → 式子」：一支一支对着实测的调用路径写的，与发射器那张 `BUILTIN` 表同形。 */
const GLOBAL_IMPL: Record<string, Fn> = {
  var_to_bytes: (a) => gVarToBytes(ga(a, 0)),
  var_to_bytes_with_objects: (a) => gVarToBytesWithObjects(ga(a, 0)),
  bytes_to_var: (a) => gBytesToVar(ga(a, 0)),
  bytes_to_var_with_objects: (a) => gBytesToVarWithObjects(ga(a, 0)),
  get_stack: () => gGetStack(),
  print_stack: () => gPrintStack(),
  push_error: (a) => gPushError(a),
  push_warning: (a) => gPushWarning(a),
  abs: (a) => abs(ga(a, 0)),
  absf: (a) => gAbsF(ga(a, 0)),
  absi: (a) => gAbsI(ga(a, 0)),
  error_string: (a) => gErrorString(ga(a, 0)),
  type_string: (a) => gTypeString(ga(a, 0)),
  type_exists: (a) => gTypeExists(ga(a, 0)),
  acos: (a) => gAcos(ga(a, 0)),
  acosh: (a) => gAcosh(ga(a, 0)),
  asin: (a) => gAsin(ga(a, 0)),
  asinh: (a) => gAsinh(ga(a, 0)),
  atan: (a) => gAtan(ga(a, 0)),
  atan2: (a) => gAtan2(ga(a, 0), ga(a, 1)),
  atanh: (a) => gAtanh(ga(a, 0)),
  cos: (a) => gCos(ga(a, 0)),
  cosh: (a) => gCosh(ga(a, 0)),
  sin: (a) => gSin(ga(a, 0)),
  sinh: (a) => gSinh(ga(a, 0)),
  tan: (a) => gTan(ga(a, 0)),
  tanh: (a) => gTanh(ga(a, 0)),
  bezier_derivative: (a) => gBezierDerivative(ga(a, 0), ga(a, 1), ga(a, 2), ga(a, 3), ga(a, 4)),
  bezier_interpolate: (a) => gBezierInterpolate(ga(a, 0), ga(a, 1), ga(a, 2), ga(a, 3), ga(a, 4)),
  cubic_interpolate_angle: (a) => gCubicAngle(ga(a, 0), ga(a, 1), ga(a, 2), ga(a, 3), ga(a, 4)),
  cubic_interpolate_angle_in_time: (a) => gCubicAngleInTime(ga(a, 0), ga(a, 1), ga(a, 2), ga(a, 3), ga(a, 4), ga(a, 5), ga(a, 6), ga(a, 7)),
  cubic_interpolate_in_time: (a) => gCubicInTime(ga(a, 0), ga(a, 1), ga(a, 2), ga(a, 3), ga(a, 4), ga(a, 5), ga(a, 6), ga(a, 7)),
  db_to_linear: (a) => gDbToLinear(ga(a, 0)),
  lerp_angle: (a) => gLerpAngle(ga(a, 0), ga(a, 1), ga(a, 2)),
  linear_to_db: (a) => gLinearToDb(ga(a, 0)),
  nearest_po2: (a) => gNearestPo2(ga(a, 0)),
  pingpong: (a) => gPingpong(ga(a, 0), ga(a, 1)),
  rotate_toward: (a) => gRotateToward(ga(a, 0), ga(a, 1), ga(a, 2)),
  step_decimals: (a) => gStepDecimals(ga(a, 0)),
  char: (a) => stringChr(ga(a, 0)),
  angle_difference: (a) => gAngleDifference(ga(a, 0), ga(a, 1)),
  ceil: (a) => gCeil(ga(a, 0), "auto"),
  ceilf: (a) => gCeil(ga(a, 0), "float"),
  ceili: (a) => gCeil(ga(a, 0), "int"),
  clamp: (a) => gClamp(ga(a, 0), ga(a, 1), ga(a, 2), "auto"),
  clampf: (a) => gClamp(ga(a, 0), ga(a, 1), ga(a, 2), "float"),
  clampi: (a) => gClamp(ga(a, 0), ga(a, 1), ga(a, 2), "int"),
  convert: (a) => variantConvert(ga(a, 0), ga(a, 1), true),
  cubic_interpolate: (a) => gCubic(ga(a, 0), ga(a, 1), ga(a, 2), ga(a, 3), ga(a, 4)),
  deg_to_rad: (a) => gDegToRad(ga(a, 0)),
  ease: (a) => gEase(ga(a, 0), ga(a, 1)),
  exp: (a) => gExp(ga(a, 0)),
  floor: (a) => gFloor(ga(a, 0), "auto"),
  floorf: (a) => gFloor(ga(a, 0), "float"),
  floori: (a) => gFloor(ga(a, 0), "int"),
  fmod: (a) => gFmod(ga(a, 0), ga(a, 1)),
  fposmod: (a) => gFposmod(ga(a, 0), ga(a, 1)),
  hash: (a) => variantHash(a),
  inverse_lerp: (a) => gInverseLerp(ga(a, 0), ga(a, 1), ga(a, 2)),
  is_equal_approx: (a) => gIsEqualApprox(ga(a, 0), ga(a, 1)),
  is_finite: (a) => gIsFinite(ga(a, 0)),
  is_inf: (a) => gIsInf(ga(a, 0)),
  is_nan: (a) => gIsNan(ga(a, 0)),
  is_same: (a) => gIsSame(ga(a, 0), ga(a, 1)),
  is_zero_approx: (a) => gIsZeroApprox(ga(a, 0)),
  len: (a) => lengthOf(ga(a, 0)),
  lerp: (a) => gLerp(ga(a, 0), ga(a, 1), ga(a, 2)),
  lerpf: (a) => gLerp(ga(a, 0), ga(a, 1), ga(a, 2)),
  load: (a) => loadScript(ga(a, 0)),
  log: (a) => gLog(ga(a, 0)),
  max: (a) => gMax(ga(a, 0), ga(a, 1), ...a.slice(2)),
  maxf: (a) => gMaxF(ga(a, 0), ga(a, 1)),
  maxi: (a) => gMaxI(ga(a, 0), ga(a, 1)),
  min: (a) => gMin(ga(a, 0), ga(a, 1), ...a.slice(2)),
  minf: (a) => gMinF(ga(a, 0), ga(a, 1)),
  mini: (a) => gMinI(ga(a, 0), ga(a, 1)),
  move_toward: (a) => gMoveToward(ga(a, 0), ga(a, 1), ga(a, 2)),
  posmod: (a) => gPosmod(ga(a, 0), ga(a, 1)),
  pow: (a) => gPow(ga(a, 0), ga(a, 1)),
  rad_to_deg: (a) => gRadToDeg(ga(a, 0)),
  weakref: (a) => gWeakref(ga(a, 0)),
  rid_from_int64: (a) => gRidFromInt64(ga(a, 0)),
  rid_allocate_id: () => gRidAllocateId(),
  inst_to_dict: (a) => gInstToDict(ga(a, 0)),
  dict_to_inst: (a) => gDictToInst(ga(a, 0)),
  instance_from_id: (a) => gInstanceFromId(ga(a, 0)),
  is_instance_of: (a) => gIsInstanceOf(ga(a, 0), ga(a, 1)),
  is_instance_valid: (a) => gIsInstanceValid(ga(a, 0)),
  is_instance_id_valid: (a) => gIsInstanceIdValid(ga(a, 0)),
  randi: () => gRandi(),
  randf: () => gRandf(),
  randomize: () => gRandomize(),
  seed: (a) => gSeed(ga(a, 0)),
  rand_from_seed: (a) => gRandFromSeed(ga(a, 0)),
  randi_range: (a) => gRandiRange(ga(a, 0), ga(a, 1)),
  randf_range: (a) => gRandfRange(ga(a, 0), ga(a, 1)),
  randfn: (a) => gRandfn(ga(a, 0), ga(a, 1)),
  range: (a) => V.array(gRange(a)),
  remap: (a) => gRemap(ga(a, 0), ga(a, 1), ga(a, 2), ga(a, 3), ga(a, 4)),
  round: (a) => gRound(ga(a, 0), "auto"),
  roundf: (a) => gRound(ga(a, 0), "float"),
  roundi: (a) => gRound(ga(a, 0), "int"),
  sign: (a) => gSign(ga(a, 0)),
  signf: (a) => gSignF(ga(a, 0)),
  signi: (a) => gSignI(ga(a, 0)),
  smoothstep: (a) => gSmoothstep(ga(a, 0), ga(a, 1), ga(a, 2)),
  snapped: (a) => gSnapped(ga(a, 0), ga(a, 1)),
  snappedf: (a) => gSnappedF(ga(a, 0), ga(a, 1)),
  snappedi: (a) => gSnappedI(ga(a, 0), ga(a, 1)),
  sqrt: (a) => sqrt(ga(a, 0)),
  str: (a) => strBuiltin(a),
  str_to_var: (a) => strToVar(ga(a, 0)),
  type_convert: (a) => variantConvert(ga(a, 0), ga(a, 1), false),
  typeof: (a) => typeOf(ga(a, 0)),
  var_to_str: (a) => V.str(varToStr(ga(a, 0))),
  wrap: (a) => gWrapAny(ga(a, 0), ga(a, 1), ga(a, 2)),
  wrapf: (a) => gWrap(ga(a, 0), ga(a, 1), ga(a, 2), false),
  wrapi: (a) => gWrap(ga(a, 0), ga(a, 1), ga(a, 2), true),
};

/** 式子发出去了的那些名字：与实测表里「有区间闸门」的那批一一对上才算数（口径钉在 callable.test.ts）。 */
/** `dict_to_inst(dict)`（S269 ⑦ / S272 / S273）：按 `@path` + `@subpath` 认类、裸构造（不跑 `_init`），再把字典里认得的字段灌进实例 —— 普通字段写槽，带 get/set 的写实例上那张原值表（setter 不调）。失败三句是 4.6.3 原文，`@path` 加载不到时引擎前面那两句带 C++ 行号的 ERROR 不复刻。 */
export function gDictToInst(v: Variant): Variant {
  if (v.t !== Tag.DICT) {
    throw new GodotRuntimeError(
      "dict-to-inst-arg",
      `Invalid type in GDScript utility function "dict_to_inst()". Cannot convert argument 1 from ${valueTypeName(v)} to Dictionary.`,
    );
  }
  const d = v.v as GDict;
  const keys = d.keys();
  const vals = d.values();
  let resPath: string | null = null;
  let classPath = "";
  const entries: Array<{ name: string; value: Variant }> = [];
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i] as Variant;
    const val = vals[i] as Variant;
    const text = dictKeyName(k);
    if (text === "@path") {
      resPath = dictPathText(val);
      continue;
    }
    if (text === "@subpath") {
      classPath = dictPathText(val) ?? "";
      continue;
    }
    if (text !== null) entries.push({ name: text, value: val });
  }
  if (resPath === null) {
    throw new GodotRuntimeError(
      "dict-to-inst",
      `Error calling GDScript utility function "dict_to_inst()": Invalid instance dictionary format (missing @path).`,
    );
  }
  const desc = dictDescOf(resPath, classPath);
  if (desc === null) {
    if (dictDescOf(resPath, "") === null) {
      throw new GodotRuntimeError(
        "dict-to-inst",
        `Error calling GDScript utility function "dict_to_inst()": Invalid instance dictionary format (can't load script at @path).`,
      );
    }
    throw new GodotRuntimeError(
      "dict-to-inst",
      `Error calling GDScript utility function "dict_to_inst()": Invalid instance dictionary (invalid subclasses).`,
    );
  }
  if (classPath === "") {
    throw new UnsupportedError(
      "dict-to-inst-root",
      `dict_to_inst() 造模块根类那一形（缺 @subpath 或 @subpath 是空路径）只量过 extends SceneTree 的模块：引擎真会造出宿主实例（实测造出 <SceneTree#号> 并漏出一片 RID），Tier 1 发不出那种实例，别的宿主基类也没量过，不猜`,
    );
  }
  beginBareConstruction();
  let inst: object;
  try {
    inst = desc.make([]);
  } finally {
    endBareConstruction();
  }
  const box = V.object(inst);
  const shape = dictShapeOf(inst);
  if (shape !== null) {
    const accNames = Object.keys(shape.accessors);
    for (const e of entries) {
      if (shape.names.indexOf(e.name) < 0) continue;
      // 带 get/set 的属性进实例上那张原值表：setter 一次都不跑，而 inst_to_dict 会把这一格原样带出门（S272 ③ / S273 ④）。
      if (accNames.indexOf(e.name) >= 0) writeDictWritten(inst, e.name, e.value);
      else writeProp(box, e.name, e.value);
    }
  }
  return box;
}

/** 字典键的名字：String 与 StringName 同形（引擎那两形都认，`@subpath` 给 String 也造得出实例，实测 s01）。 */
function dictKeyName(k: Variant): string | null {
  if (k.t === Tag.STRING || k.t === Tag.STRING_NAME) return k.v as string;
  return null;
}

/** `@path` / `@subpath` 的值：String 与 NodePath 都认（实测 `@path` 给 `^"res://x.gd"` 也会被当路径用）。 */
function dictPathText(val: Variant): string | null {
  if (val.t === Tag.STRING || val.t === Tag.STRING_NAME) return val.v as string;
  const np = asNodePath(val);
  if (np !== null) return nodePathText(np);
  throw new UnsupportedError("dict-to-inst-value", `dict_to_inst() 的 @path / @subpath 只量过 String 与 NodePath（收到 ${valueTypeName(val)}）`);
}

export const GLOBAL_CALLABLE_IMPLEMENTED: ReadonlySet<string> = new Set(Object.keys(GLOBAL_IMPL));

/**
 * 全局函数的 Callable 值：`var f = abs` 实测给 `typeof 25`、打印 `@GlobalScope::abs`，`.call()` 走各自那个式子，
 * 等式按 `(名字, 接收者)` 走 —— 全局那支的接收者是 null，所以同名两个盒子相等（实测 `str_to_var == str_to_var` 真）。
 * 我们没实现那个式子的 36 支（`GLOBAL_CALLABLES` 里 `bounds` 为 null 的）照发盒子：值、`get_method()`、`get_argument_count()`
 * 都是实测读数，只有 `.call()` 响亮拒。
 */
export function globalCallable(name: string): Variant {
  const row = GLOBAL_CALLABLES[name];
  if (row === undefined) {
    throw new UnsupportedError("global-callable-name", `${name} 不在实测「能当值用的全局函数名」那 126 个里`);
  }
  const impl = GLOBAL_IMPL[name];
  const fn: Fn =
    impl ??
    (() => {
      throw new UnsupportedError("global-callable-call", `全局函数 ${name}() 还没实现，Callable 也调不出它`);
    });
  return V.object(new CallableBox(fn, name, null, [], null));
}
