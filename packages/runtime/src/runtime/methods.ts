import { norm } from "./method-core";
import { registerBoundSnapshotHook } from "./object";
import { boundSnapshot } from "./method-access";
import { objectMethod } from "./method-object";
import { arrayMethod } from "./method-array";
import { dictMethod } from "./method-dict";
import { stringMethod } from "./method-string";
import { registerMethodDispatch } from "./method-callable";

import { GodotRuntimeError, UnsupportedError } from "./errors";
import { faceMemberKnown, nativeAritySay } from "./face-arity";

import { packDecompressBufferZero, packDecompressSrcZero, packDecompressInflateErr } from "./frames";
import { Tag, V, type Variant } from "./tags";
import { registerPackErrorSink } from "./packed";

registerPackErrorSink({
  bufferZero: packDecompressBufferZero,
  srcZero: packDecompressSrcZero,
  inflateErr: packDecompressInflateErr,
});

export function method(raw: unknown, name: string, args: Variant[]): Variant {
  const obj = norm(raw);
  if (obj.t === Tag.STRING_NAME) {
    if (!faceMemberKnown("StringName", name)) {
      throw new GodotRuntimeError("stringname-no-method", `Invalid call. Nonexistent function '${name}' in base 'StringName'.`);
    }
    const snSay = nativeAritySay("StringName", name, args.length);
    if (snSay !== null) throw new GodotRuntimeError("stringname-arity", snSay);
    try {
      return method(V.str(obj.v as string), name, args);
    } catch (e) {
      if (e instanceof GodotRuntimeError && e.code === "string-no-method") {
        throw new GodotRuntimeError("stringname-no-method", `Invalid call. Nonexistent function '${name}' in base 'StringName'.`);
      }
      throw e;
    }
  }

  if (obj.t === Tag.OBJECT) return objectMethod(obj, name, args);

  switch (obj.t) {
    case Tag.ARRAY: return arrayMethod(obj, name, args);
    case Tag.DICT: return dictMethod(obj, name, args);
    case Tag.STRING: return stringMethod(obj, name, args);
    default:
      throw new UnsupportedError("method-on-type", `类型 ${obj.t} 上调用 ${name}() 未实现`);
  }
}

registerBoundSnapshotHook(boundSnapshot);
registerMethodDispatch(method);

export { ELEM_TYPE_CODE } from "./method-core";
export { signalCtor, index, dictIndexInt, writeProp, writeIdx, setIndex, iter, dictOf, formatOf, boundMethod, attribute } from "./method-access";
export { callableCtor, callableStatic } from "./method-callable";
export { gDictToInst, GLOBAL_CALLABLE_IMPLEMENTED, globalCallable } from "./method-globals";
