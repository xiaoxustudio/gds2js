import { NODE_PATH_METHOD_ARITY, STRING_NAME_METHOD_ARITY } from "@gds2js/runtime/runtime/face-arity";

export interface NamedFace {
  type: string;
  lit: string;
  arity: Record<string, [number, number]>;
  arityCode: string;
  ctorRecv?: boolean;
}

export const STRINGNAME_FACE: NamedFace = {
  type: "StringName",
  lit: "string_name",
  arity: STRING_NAME_METHOD_ARITY,
  arityCode: "string-name-arity",
};

export const NODE_PATH_FACE: NamedFace = {
  type: "NodePath",
  lit: "node_path",
  arity: NODE_PATH_METHOD_ARITY,
  arityCode: "node-path-arity",
  ctorRecv: true,
};

export const CTOR_REFUSED: Record<string, string[][]> = {
  int: [["int", "int"], ["int", "int", "int"]],
  float: [["int", "int"], ["int", "int", "int"]],
  bool: [["int", "int"], ["int", "int", "int"]],
  String: [["int"], ["int", "int"], ["int", "int", "int"]],
  StringName: [["int"], ["int", "int"], ["int", "int", "int"]],
  NodePath: [["int"], ["int", "int"], ["int", "int", "int"]],
  Array: [
    ["int"], ["int", "int"], ["int", "int", "int"], ["String"],
    ["Dictionary"], ["null"], ["float"], ["bool"], ["StringName"], ["Vector2"], ["Color"],
    ["Array", "int"], ["Array", "Variant.Type"], ["Dictionary", "Variant.Type"],
    ["float", "Variant.Type"], ["bool", "Variant.Type"], ["Vector2", "Variant.Type"],
    ["StringName", "Variant.Type"], ["PackedStringArray", "Variant.Type"], ["PackedByteArray", "Variant.Type"],
    ["null", "Variant.Type", "StringName", "null"], ["String", "Variant.Type", "StringName", "null"],
    ["int", "Variant.Type", "StringName", "null"], ["Array", "Variant.Type", "Variant.Type", "bool"],
    ["Array", "Variant.Type", "StringName", "null", "int"],
    ["Array", "Variant.Type", "StringName", "null", "int", "int"],
    ["int", "Variant.Type"], ["String", "Variant.Type"],
    ["int", "Variant.Type", "int"], ["Array", "Variant.Type", "StringName"],
    ["Array", "Variant.Type", "String"], ["int", "Variant.Type", "StringName"],
    ["Array", "Variant.Type", "Variant.Type", "StringName"],
    ["Array", "Variant.Type", "int", "null"], ["Array", "Variant.Type", "int", "String"],
    ["Array", "Variant.Type", "int", "bool"],
    ["int", "Variant.Type", "StringName", "bool"], ["Dictionary", "Variant.Type", "StringName", "bool"],
    ["int", "String", "String", "bool"],
    ["int", "Variant.Type", "int", "String", "int"],
    ["Array", "Variant.Type", "StringName", "bool", "bool"],
  ],
  Dictionary: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  Vector2: [["int"], ["int", "int", "int"], ["String"]],
  Vector2i: [["int"], ["int", "int", "int"], ["String"]],
  Vector3: [["int"], ["int", "int"], ["String"]],
  Vector3i: [["int"], ["int", "int"], ["String"]],
  Vector4: [["int"], ["int", "int"], ["int", "int", "int"]],
  Vector4i: [["int"], ["int", "int"], ["int", "int", "int"]],
  PackedVector4Array: [["Vector4"]],
  Callable: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  Signal: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  RID: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  PackedByteArray: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  PackedInt32Array: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  PackedFloat64Array: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  PackedStringArray: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
};

export const STATIC_FACE: Record<string, { consts: readonly string[]; axis: readonly string[]; statics: Record<string, [number, number]> }> = {
  Vector2: {
    consts: ["ZERO", "ONE", "INF", "LEFT", "RIGHT", "UP", "DOWN"],
    axis: ["AXIS_X", "AXIS_Y"],
    statics: { from_angle: [1, 1] },
  },
  Vector2i: {
    consts: ["ZERO", "ONE", "LEFT", "RIGHT", "UP", "DOWN", "MAX", "MIN"],
    axis: ["AXIS_X", "AXIS_Y"],
    statics: {},
  },
  Vector3: {
    consts: ["ZERO", "ONE", "INF", "LEFT", "RIGHT", "UP", "DOWN", "FORWARD", "BACK"],
    axis: ["AXIS_X", "AXIS_Y", "AXIS_Z"],
    statics: { octahedron_decode: [1, 1] },
  },
  Vector3i: {
    consts: ["ZERO", "ONE", "LEFT", "RIGHT", "UP", "DOWN", "FORWARD", "BACK", "MAX", "MIN"],
    axis: ["AXIS_X", "AXIS_Y", "AXIS_Z"],
    statics: {},
  },
  Color: {
    consts: [],
    axis: [],
    statics: {
      html: [1, 1],
      html_is_valid: [1, 1],
      from_string: [2, 2],
      from_hsv: [3, 4],
      from_ok_hsl: [3, 4],
      from_rgba8: [3, 4],
      from_rgbe9995: [1, 1],
      hex: [1, 1],
      hex64: [1, 1],
    },
  },
  Vector4: {
    consts: ["ZERO", "ONE", "INF"],
    axis: [],
    statics: {},
  },
  Vector4i: {
    consts: ["ZERO", "ONE", "MIN", "MAX"],
    axis: [],
    statics: {},
  },
  String: {
    consts: [],
    axis: [],
    statics: {
      chr: [1, 1],
      num: [1, 2],
      num_int64: [1, 3],
      num_uint64: [1, 3],
      num_scientific: [1, 1],
      humanize_size: [1, 1],
    },
  },
  Callable: {
    consts: [],
    axis: [],
    statics: { create: [2, 2] },
  },
};

export const GLOBAL_TYPED_NAME_ARGS: Readonly<Record<string, ReadonlyArray<readonly [number, string, readonly string[]]>>> = {
  load: [[1, "String", ["NodePath", "String", "StringName"]]],
  str_to_var: [[1, "String", ["NodePath", "String", "StringName"]]],
  bytes_to_var: [[1, "PackedByteArray", ["Array", "PackedByteArray"]]],
  bytes_to_var_with_objects: [[1, "PackedByteArray", ["Array", "PackedByteArray"]]],
  inst_to_dict: [[1, "Object", []]],
  dict_to_inst: [[1, "Dictionary", ["Dictionary"]]],
  error_string: [[1, "int", ["bool", "float", "int"]]],
  instance_from_id: [[1, "int", ["bool", "float", "int"]]],
  is_instance_id_valid: [[1, "int", ["bool", "float", "int"]]],
  rand_from_seed: [[1, "int", ["bool", "float", "int"]]],
  rid_from_int64: [[1, "int", ["bool", "float", "int"]]],
  type_string: [[1, "int", ["bool", "float", "int"]]],
  randi_range: [[1, "int", ["bool", "float", "int"]], [2, "int", ["bool", "float", "int"]]],
  randf_range: [[1, "float", ["bool", "float", "int"]], [2, "float", ["bool", "float", "int"]]],
  randfn: [[1, "float", ["bool", "float", "int"]], [2, "float", ["bool", "float", "int"]]],
  type_convert: [[2, "int", ["bool", "float", "int"]]],
  convert: [[2, "Variant.Type", ["int"]]],
  ord: [[1, "String", ["NodePath", "String", "StringName"]]],
  type_exists: [[1, "StringName", ["String", "StringName"]]],
  seed: [[1, "int", ["bool", "float", "int"]]],
};

export const FUNC_ARG_SLOTS: Record<string, readonly string[]> = {
  int: ["int", "float", "bool"],
  float: ["int", "float", "bool"],
  bool: ["int", "float", "bool"],
  String: ["String", "StringName"],
  StringName: ["StringName", "String"],
  Vector2: ["Vector2", "Vector2i"],
  Vector2i: ["Vector2i", "Vector2"],
  Vector3: ["Vector3", "Vector3i"],
  Vector3i: ["Vector3i", "Vector3"],
  Vector4: ["Vector4", "Vector4i"],
  Vector4i: ["Vector4i", "Vector4"],
  Color: ["Color", "String", "int"],
  Rect2: [],
};

export const CUBIC_NAME_ARG_FUNCS = new Set(["cubic_interpolate", "cubic_interpolate_in_time", "bezier_interpolate", "bezier_derivative"]);

export const GLOBAL_NUM_ARITH: ReadonlySet<string> = new Set(["sqrt", "exp", "log", "sin", "cos", "tan", "deg_to_rad", "rad_to_deg",
  "wrapf", "move_toward", "smoothstep", "is_equal_approx", "remap",
  "acos", "asin", "atan", "atanh", "sinh", "cosh", "tanh", "ceilf", "floorf", "roundf", "signf",
  "atan2", "pow", "maxf", "minf", "angle_difference",
  "absf", "acosh", "asinh", "clampf", "db_to_linear", "ease", "fmod", "fposmod", "inverse_lerp",
  "is_finite", "is_inf", "is_nan", "is_zero_approx", "lerp_angle", "lerpf", "linear_to_db", "pingpong", "rotate_toward",
  "ceili", "floori", "roundi", "snappedi", "absi", "char", "clampi", "maxi", "mini", "nearest_po2", "posmod", "signi", "wrapi", "step_decimals"]);
