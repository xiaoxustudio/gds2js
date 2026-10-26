export type GlobalArgType = "int" | "float";
export const GLOBAL_ARG_TYPES: Readonly<Record<string, ReadonlyArray<readonly [number, GlobalArgType]>>> = {
  absf: [[1, "float"]],
  absi: [[1, "int"]],
  acos: [[1, "float"]],
  acosh: [[1, "float"]],
  angle_difference: [[1, "float"], [2, "float"]],
  asin: [[1, "float"]],
  asinh: [[1, "float"]],
  atan: [[1, "float"]],
  atan2: [[1, "float"], [2, "float"]],
  atanh: [[1, "float"]],
  bezier_derivative: [[1, "float"], [2, "float"], [3, "float"], [4, "float"], [5, "float"]],
  bezier_interpolate: [[1, "float"], [2, "float"], [3, "float"], [4, "float"], [5, "float"]],
  cubic_interpolate: [[1, "float"], [2, "float"], [3, "float"], [4, "float"], [5, "float"]],
  cubic_interpolate_angle: [[1, "float"], [2, "float"], [3, "float"], [4, "float"], [5, "float"]],
  cubic_interpolate_angle_in_time: [[1, "float"], [2, "float"], [3, "float"], [4, "float"], [5, "float"], [6, "float"], [7, "float"], [8, "float"]],
  cubic_interpolate_in_time: [[1, "float"], [2, "float"], [3, "float"], [4, "float"], [5, "float"], [6, "float"], [7, "float"], [8, "float"]],
  remap: [[1, "float"], [2, "float"], [3, "float"], [4, "float"], [5, "float"]],
  ceilf: [[1, "float"]],
  ceili: [[1, "float"]],
  char: [[1, "int"]],
  clampf: [[1, "float"], [2, "float"], [3, "float"]],
  clampi: [[1, "int"], [2, "int"], [3, "int"]],
  cos: [[1, "float"]],
  cosh: [[1, "float"]],
  db_to_linear: [[1, "float"]],
  deg_to_rad: [[1, "float"]],
  ease: [[1, "float"], [2, "float"]],
  exp: [[1, "float"]],
  floorf: [[1, "float"]],
  floori: [[1, "float"]],
  fmod: [[1, "float"], [2, "float"]],
  fposmod: [[1, "float"], [2, "float"]],
  inverse_lerp: [[1, "float"], [2, "float"], [3, "float"]],
  is_equal_approx: [[1, "float"], [2, "float"]],
  is_finite: [[1, "float"]],
  is_inf: [[1, "float"]],
  is_nan: [[1, "float"]],
  is_zero_approx: [[1, "float"]],
  lerp_angle: [[1, "float"], [2, "float"], [3, "float"]],
  lerpf: [[1, "float"], [2, "float"], [3, "float"]],
  linear_to_db: [[1, "float"]],
  log: [[1, "float"]],
  maxf: [[1, "float"], [2, "float"]],
  maxi: [[1, "int"], [2, "int"]],
  minf: [[1, "float"], [2, "float"]],
  mini: [[1, "int"], [2, "int"]],
  move_toward: [[1, "float"], [2, "float"], [3, "float"]],
  nearest_po2: [[1, "int"]],
  pingpong: [[1, "float"], [2, "float"]],
  posmod: [[1, "int"], [2, "int"]],
  pow: [[1, "float"], [2, "float"]],
  rad_to_deg: [[1, "float"]],
  rotate_toward: [[1, "float"], [2, "float"], [3, "float"]],
  roundf: [[1, "float"]],
  roundi: [[1, "float"]],
  signf: [[1, "float"]],
  signi: [[1, "int"]],
  sin: [[1, "float"]],
  sinh: [[1, "float"]],
  smoothstep: [[1, "float"], [2, "float"], [3, "float"]],
  snappedf: [[1, "float"], [2, "float"]],
  snappedi: [[1, "float"], [2, "int"]],
  sqrt: [[1, "float"]],
  step_decimals: [[1, "float"]],
  tan: [[1, "float"]],
  tanh: [[1, "float"]],
  wrap: [[1, "float"]],
  wrapf: [[1, "float"], [2, "float"], [3, "float"]],
  wrapi: [[1, "int"], [2, "int"], [3, "int"]],
};

export const ARG_TYPE_FOLLOWS_FIRST: Readonly<Record<string, ReadonlyArray<number>>> = {
  clamp: [2, 3],
  lerp: [2],
  wrap: [2, 3],
};

export const GLOBAL_ARG_BOOL_REFUSED: Readonly<Record<string, ReadonlyArray<number>>> = {
  wrap: [1],
};

export const GLOBAL_ARG_VARARG: Readonly<Record<string, ReadonlySet<string>>> = {
  max: new Set(["String", "StringName", "NodePath", "bool", "null", "Vector4", "Vector4i"]),
  min: new Set(["String", "StringName", "NodePath", "bool", "null", "Vector4", "Vector4i"]),
};

export const GLOBAL_ARG_FOLLOWS_BOOL: Readonly<Record<string, true>> = {
  clamp: true,
};

export const GLOBAL_ARG_SENTENCE: Readonly<Record<string, ReadonlyArray<readonly [number, readonly string[], string, readonly string[]]>>> = {
  abs: [[1, ["bool", "String", "StringName", "NodePath", "null", "Color"], "Invalid argument for \"abs()\" function: Argument \"x\" must be \"int\", \"float\", \"Vector2\", \"Vector2i\", \"Vector3\", \"Vector3i\", \"Vector4\", or \"Vector4i\".", []]],
  ceil: [[1, ["bool", "String", "StringName", "NodePath", "null", "Color"], "Invalid argument for \"ceil()\" function: Argument \"x\" must be \"int\", \"float\", \"Vector2\", \"Vector2i\", \"Vector3\", \"Vector3i\", \"Vector4\", or \"Vector4i\".", []]],
  floor: [[1, ["bool", "String", "StringName", "NodePath", "null", "Color"], "Invalid argument for \"floor()\" function: Argument \"x\" must be \"int\", \"float\", \"Vector2\", \"Vector2i\", \"Vector3\", \"Vector3i\", \"Vector4\", or \"Vector4i\".", []]],
  is_instance_of: [[2, ["float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "Invalid argument for \"is_instance_of()\" function: Invalid type argument for is_instance_of(), should be a TYPE_* constant, a class or a script.", []]],
  lerp: [[1, ["bool", "String", "StringName", "NodePath", "null", "Vector2i", "Vector3i"], "Invalid argument for \"lerp()\" function: Argument \"from\" must be \"int\", \"float\", \"Vector2\", \"Vector3\", \"Vector4\", \"Color\", \"Quaternion\", \"Basis\", \"Transform2D\", or \"Transform3D\".", []]],
  round: [[1, ["bool", "String", "StringName", "NodePath", "null", "Color"], "Invalid argument for \"round()\" function: Argument \"x\" must be \"int\", \"float\", \"Vector2\", \"Vector2i\", \"Vector3\", \"Vector3i\", \"Vector4\", or \"Vector4i\".", []]],
  sign: [[1, ["bool", "String", "StringName", "NodePath", "null", "Color"], "Invalid argument for \"sign()\" function: Argument \"x\" must be \"int\", \"float\", \"Vector2\", \"Vector2i\", \"Vector3\", \"Vector3i\", \"Vector4\", or \"Vector4i\".", []]],
  snapped: [[1, ["bool", "String", "StringName", "NodePath", "null", "Color"], "Invalid argument for \"snapped()\" function: Argument \"x\" must be \"int\", \"float\", \"Vector2\", \"Vector2i\", \"Vector3\", \"Vector3i\", \"Vector4\", or \"Vector4i\".", []], [2, ["bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "Invalid argument for \"snapped()\" function: Argument \"step\" must be \"int\" or \"float\".", ["Vector2", "Vector2i", "Vector3", "Vector3i"]]],
};

export const GLOBAL_ARG_AS: Readonly<Record<string, ReadonlyArray<readonly [number, readonly string[], string, readonly string[], readonly string[]]>>> = {
  bytes_to_var: [[1, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "PackedByteArray", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"]]],
  bytes_to_var_with_objects: [[1, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "PackedByteArray", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"]]],
  dict_to_inst: [[1, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "Dictionary", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"]]],
  error_string: [[1, ["String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "int", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"]]],
  instance_from_id: [[1, ["String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "int", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"]]],
  is_instance_id_valid: [[1, ["String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "int", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"]]],
  rand_from_seed: [[1, ["String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "int", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"]]],
  randf_range: [[1, ["String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "float", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"]], [2, ["String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "float", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"]]],
  randfn: [[1, ["String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "float", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"]], [2, ["String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "float", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"]]],
  randi_range: [[1, ["String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "int", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"]], [2, ["String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "int", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"]]],
  rid_from_int64: [[1, ["String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "int", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"]]],
  type_convert: [[2, ["String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "int", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"]]],
  type_string: [[1, ["String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "int", [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"]]],
  seed: [[1, ["String", "StringName", "Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "NodePath", "null"], "int", [], ["String", "StringName", "Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "NodePath", "null"]]],

};

export const GLOBAL_ARG_SHOULD_BE: Readonly<Record<string, ReadonlyArray<readonly [number, readonly string[], string, readonly string[]]>>> = {
  bytes_to_var: [[1, ["Dictionary", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "PackedByteArray", []]],
  bytes_to_var_with_objects: [[1, ["Dictionary", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "PackedByteArray", []]],
  convert: [[2, ["String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "int", []], [2, ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "Variant.Type", []]],
  dict_to_inst: [[1, ["Array", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "Dictionary", []]],
  error_string: [[1, ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "int", []]],
  inst_to_dict: [[1, ["int", "float", "bool", "String", "StringName", "NodePath", "Array", "Dictionary", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "Object", []]],
  instance_from_id: [[1, ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "int", []]],
  is_instance_id_valid: [[1, ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "int", []]],
  rand_from_seed: [[1, ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "int", []]],
  randf_range: [[1, ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "float", []], [2, ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "float", []]],
  randfn: [[1, ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "float", []], [2, ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "float", []]],
  randi_range: [[1, ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "int", []], [2, ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "int", []]],
  rid_from_int64: [[1, ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "int", []]],
  type_convert: [[2, ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "int", []]],
  type_string: [[1, ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "int", []]],
  seed: [[1, ["Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"], "int", []]],

};

export const DERIVED_ARG_TYPES: Readonly<Record<string, ReadonlyArray<readonly [string, number, readonly string[]]>>> = {
  clamp: [["Color", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"]], ["Vector2", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2i", "Vector3", "Vector3i", "Color"]], ["Vector2", 3, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2i", "Vector3", "Vector3i", "Color"]], ["Vector3", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3i", "Color"]], ["Vector3", 3, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3i", "Color"]]],
  lerp: [["Color", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i"]], ["Vector2", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2i", "Vector3", "Vector3i", "Color"]], ["Vector3", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3i", "Color"]]],
  snapped: [["Vector2", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2i", "Vector3", "Vector3i", "Color"]], ["Vector3", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3i", "Color"]]],
};

export const GLOBAL_ARG_SUPPRESS_OTHER: Readonly<Record<string, readonly [number, readonly string[]]>> = {
  clamp: [2, ["Array", "Dictionary"]],
  wrap: [1, ["Array", "Dictionary"]],
};
