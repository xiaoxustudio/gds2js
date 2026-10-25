export const NATIVE_CLASS_SLOTS = new Set(["Object", "RefCounted", "Node"]);

export const ELEM_FACES = new Set(["Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", "Vector4i", "Color", "String", "int", "float", "bool"]);

export const STATIC_VALUE_TYPES = new Set(["Vector2", "Vector3", "Vector2i", "Vector3i", "Vector4", "Vector4i", "Color"]);

export const PACK_SHAPE_NAMES = new Set([
  "PackedByteArray",
  "PackedInt32Array",
  "PackedInt64Array",
  "PackedFloat32Array",
  "PackedFloat64Array",
  "PackedStringArray",
  "PackedVector2Array",
  "PackedVector3Array",
  "PackedVector4Array",
  "PackedColorArray",
]);

export const PACK_IS_AS_NAMES = new Set([
  "PackedByteArray",
  "PackedInt32Array",
  "PackedInt64Array",
  "PackedFloat32Array",
  "PackedFloat64Array",
  "PackedStringArray",
  "PackedVector2Array",
  "PackedVector3Array",
  "PackedVector4Array",
  "PackedColorArray",
]);

export const PACK_APPEND_NAMED = new Set([
  "bool", "float", "int", "String", "StringName", "NodePath", "Color", "Vector2", "Vector2i", "Vector3", "Vector3i",
  "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array",
  "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedVector4Array", "PackedColorArray",
  "Callable", "Object", "Node",
]);

export const PACK_APPEND_ARRAY_AS = ["bool", "float", "int", "String", "StringName", "NodePath", "Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "null", "Callable", "Object", "Node"];

export const PACK_ARG_SLOTS: Record<string, { slot: string; ok: readonly string[] }> = {
  PackedByteArray: { slot: "int", ok: ["int", "float", "bool"] },
  PackedInt32Array: { slot: "int", ok: ["int", "float", "bool"] },
  PackedInt64Array: { slot: "int", ok: ["int", "float", "bool"] },
  PackedFloat32Array: { slot: "float", ok: ["int", "float", "bool"] },
  PackedFloat64Array: { slot: "float", ok: ["int", "float", "bool"] },
  PackedStringArray: { slot: "String", ok: ["String", "StringName", "NodePath"] },
  PackedVector2Array: { slot: "Vector2", ok: ["Vector2", "Vector2i"] },
  PackedVector3Array: { slot: "Vector3", ok: ["Vector3", "Vector3i"] },
  PackedVector4Array: { slot: "Vector4", ok: ["Vector4", "Vector4i"] },
  PackedColorArray: { slot: "Color", ok: ["Color", "int", "String"] },
};

export const PACK_ARG_POSITIONS: Record<string, readonly string[]> = {
  append: ["e"], push_back: ["e"], fill: ["e"], has: ["e"], count: ["e"], erase: ["e"],
  get: ["i"], set: ["i", "e"], insert: ["i", "e"], find: ["e", "i"], rfind: ["e", "i"],
  bsearch: ["e", "b"], resize: ["i"], slice: ["i", "i"], remove_at: ["i"], append_array: ["a"],
};

export const PACK_INT_SLOT_OK = ["int", "float", "bool"];

export const PACK_BOOL_SLOT_OK = ["bool", "int", "float"];

export const PACK_TYPE_NAMES = new Set([
  "PackedByteArray",
  "PackedInt32Array",
  "PackedInt64Array",
  "PackedFloat32Array",
  "PackedFloat64Array",
  "PackedStringArray",
  "PackedVector2Array",
  "PackedVector3Array",
  "PackedVector4Array",
  "PackedColorArray",
]);

export const ANNOT_SOURCES = new Set(["int", "float", "bool", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", "Vector4i", "Color", "Array", "Dictionary"]);

export const OBJECT_ARG_NAMES = new Set(["Callable", "Object", "Node"]);

export const VALUE_ARG_WANTS = new Set([
  "int", "float", "bool", "String", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color",
  "Array", "Dictionary",
  "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array",
  "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedVector4Array", "PackedColorArray",
]);

export const ARG_NAME_TYPES = new Set([
  "int", "float", "bool", "String", "StringName", "NodePath", "Color", "Vector2", "Vector2i", "Vector3", "Vector3i",
  "Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array",
  "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedVector4Array", "PackedColorArray",
  "Callable", "Object", "Node",
]);

export const PARAM_OWN_SLOTS = new Set(["Array", "Dictionary", "NodePath", "Callable", "Signal",
  "Rect2", "Rect2i", "Transform2D", "Plane", "Quaternion", "Basis", "AABB"]);

export const INSTANCE_OF_TYPE_LAST = 38;

export const PCT_NUMERIC = "dfoxX";

export const PCT_VECTORS = new Set(["Vector2", "Vector3", "Vector4", "Vector2i", "Vector3i", "Vector4i"]);

export const PCT_VALUE_CTORS = new Set(["Color", "Callable"]);

export const PCT_MSG = {
  unsupported: "unsupported format character in operator %.",
  incomplete: "incomplete format in operator %.",
  number: "a number is required in operator %.",
  char: "%c requires number or single-character string in operator %.",
  negative: "unsigned integer is lower than minimum in operator %.",
  vector: "%v requires a vector type (Vector2/3/4/2i/3i/4i) in operator %.",
  star: "* wants number or vector in operator %.",
  notAll: "not all arguments converted during string formatting in operator %.",
  notEnough: "not enough arguments for format string in operator %.",
};

export const NUMERIC_VALUE_CTORS = new Set(["Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", "Vector4i", "Color"]);

export const FACE_ANNOTATIONS = new Set(["String", "Array", "Dictionary"]);

export const SIGNAL_PARSE_MISSING = new Set(["is_valid"]);
