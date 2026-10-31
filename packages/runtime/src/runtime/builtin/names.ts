import { UnsupportedError } from "../errors";
import { Tag, V, tagName, type Variant } from "../tags";
import { INT64_MIN } from "../numstr";
import { intArgBig } from "../string-ops";
import { Signal } from "../class/identity/signal";
import { ENGINE_CLASS_NAMES } from "../engine-classes";
import { range } from "./array";

const TYPE_NAMES = ["Nil", "bool", "int", "float", "String", "Vector2", "Vector2i", "Rect2", "Rect2i", "Vector3",
  "Vector3i", "Transform2D", "Vector4", "Vector4i", "Plane", "Quaternion", "AABB", "Basis", "Transform3D",
  "Projection", "Color", "StringName", "NodePath", "RID", "Object", "Callable", "Signal", "Dictionary", "Array",
  "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array",
  "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray", "PackedVector4Array"];

const ERROR_NAMES = ["OK", "Failed", "Unavailable", "Unconfigured", "Unauthorized", "Parameter out of range",
  "Out of memory", "File not found", "File: Bad drive", "File: Bad path", "File: Permission denied",
  "File already in use", "Can't open file", "Can't write file", "Can't read file", "File unrecognized",
  "File corrupt", "Missing dependencies for file", "End of file", "Can't open", "Can't create", "Query failed",
  "Already in use", "Locked", "Timeout", "Can't connect", "Can't resolve", "Connection error",
  "Can't acquire resource", "Can't fork", "Invalid data", "Invalid parameter", "Already exists",
  "Does not exist", "Can't read database", "Can't write database", "Compilation failed", "Method not found",
  "Link failed", "Script failed", "Cyclic link detected", "Invalid declaration", "Duplicate symbol",
  "Parse error", "Busy", "Skip", "Help", "Bug", "Printer on fire"];

/** 引擎这两支的形参是 int32：先按 32 位回绕再查表 —— 实测 `error_string(INT64_MIN)` 给 **OK**（低 32 位是 0），`error_string(-1)` 给 `(invalid error code)`。 */
function nameById(v: Variant, who: string, names: string[], fallback: string): Variant {
  const x = Number(BigInt.asIntN(32, intArgBig(v, who)));
  return x >= 0 && x < names.length ? V.str(names[x] as string) : V.str(fallback);
}

export function gTypeString(v: Variant): Variant {
  return nameById(v, "type_string() 的参数", TYPE_NAMES, "<invalid type>");
}

export function gErrorString(v: Variant): Variant {
  return nameById(v, "error_string() 的参数", ERROR_NAMES, "(invalid error code)");
}

export function gTypeExists(v: Variant): Variant {
  if (v.t !== Tag.STRING) {
    throw new UnsupportedError("type-exists-arg", `type_exists() 的实参只量过 String（收到 ${tagName(v.t)}）`);
  }
  return V.bool(ENGINE_CLASS_NAMES.has(v.v as string));
}
