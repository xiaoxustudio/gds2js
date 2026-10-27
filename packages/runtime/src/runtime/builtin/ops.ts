import { GodotRuntimeError, UnsupportedError } from "../errors";
import { Tag, V, intToBig, tagName, type IntPayload, type Variant } from "../tags";
import { GArray, GDict, valueEq } from "../values";
import { intArgBig, strLength, valueTypeName } from "../string-ops";
import { GBytes, isBytes } from "../packed";
import { CallableBox, callableEq, isCallableBox } from "../callable";
import { Signal } from "../signal";
import { ClassDesc, GdScriptObject, isFreed } from "../object";
import { GdNativeClass } from "../native-class";
import { NULL_OBJECT, isNullRefValue, isWeakRefBox, liveObjectOf, weakRefBox } from "../identity";
import { allocateRid, rid } from "../rid";
import { typeOf } from "../patterns";

export function lengthOf(v: Variant): Variant {
  if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) return V.int(strLength(v.v as string));
  if (v.t === Tag.ARRAY) return V.int((v.v as GArray).size());
  if (v.t === Tag.DICT) return V.int((v.v as GDict).size());
  if (v.t === Tag.OBJECT && v.v instanceof GBytes) return V.int((v.v as GBytes).length);
  const tn = v.t === Tag.OBJECT && v.v instanceof Signal ? "Signal" : valueTypeName(v);
  throw new GodotRuntimeError("len", `Error calling GDScript utility function "len()": Value of type '${tn}' can't provide a length.`);
}

export function gIsSame(a: Variant, b: Variant): Variant {
  const ta = (typeOf(a) as Variant).v as number;
  if ((typeOf(b) as Variant).v !== ta) return V.bool(false);
  if (ta === 2) {
    return V.bool(intToBig(a.v as IntPayload) === intToBig(b.v as IntPayload));
  }
  if (ta === 3) {
    const x = a.v as number;
    const y = b.v as number;
    return V.bool(x === y || (Number.isNaN(x) && Number.isNaN(y)));
  }
  if (ta === 25) return V.bool(callableEq(a.v as CallableBox, b.v as CallableBox));
  if (ta === 24 || ta === 26 || ta === 27 || ta === 28 || isBytes(a)) return V.bool(a.v === b.v);
  return V.bool(valueEq(a, b));
}

export function gIsInstanceValid(v: Variant): Variant {
  if (v.t !== Tag.OBJECT) return V.bool(false);
  const inner = v.v;
  if (isNullRefValue(inner) || isCallableBox(inner) || inner instanceof Signal) return V.bool(false);
  return V.bool(
    (inner instanceof GdScriptObject && !isFreed(inner)) || inner instanceof ClassDesc || inner instanceof GdNativeClass || isWeakRefBox(inner),
  );
}

export function gInstanceFromId(v: Variant): Variant {
  const live = liveObjectOf(Number(BigInt.asIntN(64, intArgBig(v, "instance_from_id() 的实参"))));
  return live === null ? V.object(NULL_OBJECT) : V.object(live);
}

export function gIsInstanceIdValid(v: Variant): Variant {
  return V.bool(liveObjectOf(Number(BigInt.asIntN(64, intArgBig(v, "is_instance_id_valid() 的实参")))) !== null);
}

export function gWeakref(v: Variant): Variant {
  if (v.t === Tag.NIL) return V.object(weakRefBox(null));
  if (!gIsInstanceValid(v).v) {
    throw new UnsupportedError("weakref-arg", `weakref() 只量过对象与 null（收到 ${tagName(v.t)}）`);
  }
  return V.object(weakRefBox(v));
}

export function utilityArgLabel(v: Variant): string {
  return v.t === Tag.NIL ? "Nil" : valueTypeName(v);
}

function ridArgBig(v: Variant): bigint {
  if (v.t === Tag.INT) return intToBig(v.v as IntPayload);
  if (v.t === Tag.BOOL) return v.v ? 1n : 0n;
  if (v.t === Tag.FLOAT) {
    const n = v.v as number;
    if (!Number.isFinite(n)) {
      throw new UnsupportedError("rid-arg-float", `rid_from_int64() 的非有限浮点实参没量过（收到 ${String(n)}）`);
    }
    return BigInt(Math.trunc(n));
  }
  throw new GodotRuntimeError(
    "rid-arg",
    `Invalid type in utility function "rid_from_int64()". Cannot convert argument 1 from ${utilityArgLabel(v)} to int.`,
  );
}

/** `RID` 只能从这两支来：实测 `RID(int)` 是解析期那句「No constructor of "RID" matches the signature "RID(int)"」，所以不发构造函数。 */
export function gRidFromInt64(v: Variant): Variant {
  return rid(ridArgBig(v));
}

/** 实测新进程里连读 13241 / 13242 / 13243，另一份脚本首格同为 13241 —— 起点固定、每调一次加一。 */
export function gRidAllocateId(): Variant {
  return V.int(allocateRid());
}
