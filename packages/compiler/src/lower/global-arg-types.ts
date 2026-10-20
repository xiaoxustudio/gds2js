/**
 * 全局函数形参在解析期被拒的几张表，每一位 / 每一个 kind 都是 `tmp/probe-argtype/` 塞字面量量出来的：
 * - `GLOBAL_ARG_TYPES`：固定形参型（`fixed.mts` 逐位塞 String 字面量），句子 `argument N should be "T" but is "U".`
 * - `ARG_TYPE_FOLLOWS_FIRST`：期望型跟第一参走的五位（`clamp` / `lerp` / `wrap`）
 * - `GLOBAL_ARG_SENTENCE`：**整句固定**那几族 —— Variant + 允许集的 `Argument "x" must be …`，
 *   加上 `Invalid call for function "convert".` 与 `is_instance_of` 那句自带的，句子照原文存
 * - `GLOBAL_ARG_AS`：形参声明是具体类型（`PackedByteArray` / `Dictionary` / `int` / `float`…）那一族，
 *   句子 `Cannot pass a value of type "U" as "T".`，T 存第三位
 * - `GLOBAL_ARG_SHOULD_BE`：A 式但期望型不是 int / float 的位（`inst_to_dict` 的 Object、`convert` 第二参的 Variant.Type），T 存第三位
 * 这几张表的第二位都是**引擎真拒的字面量 kind 名单**：收的形一个都没写进去
 * （`abs([])` / `abs({})` / `bytes_to_var([])` 引擎收，`sqrt(false)` 也收，`inst_to_dict(null)` 更收）。
 * 同一位可能同时出现在两张表：`bytes_to_var` 的 Dictionary 说 A 式、其余说 as 式。
 */
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

/** 期望型 = 第一参的字面量类型（int / float 两支都量过：`clamp(1, "a", 3)` 说 int、`clamp(1.0, "a", 3.0)` 说 float）。 */
export const ARG_TYPE_FOLLOWS_FIRST: Readonly<Record<string, ReadonlyArray<number>>> = {
  clamp: [2, 3],
  lerp: [2],
  wrap: [2, 3],
};

/** 那几张表的数值位上**连 bool 字面量也拒**的位；句子仍是 A 式、期望型照该位的型。
 *  S362 的 113 格扫出来的分布：64 个函数、101 个 int / float 位里**只有这一处**拒 bool，其余 97 格引擎都收
 *  （`absf(false)` 给 0.0、`sqrt(false)` 给 0.0、`lerp` 的权重位收 bool）。变元的 `max` / `min` 每一位都拒，走下面那支单独扫。 */
export const GLOBAL_ARG_BOOL_REFUSED: Readonly<Record<string, ReadonlyArray<number>>> = {
  wrap: [1],
};

/** 变元那两支（`max` / `min`）不走上面那几张按位表，走的是**另一套扫法**（S388，读数 `tmp/probe-maxmin/{compare38,compare39,compare40,compare41}.txt`）：
 *  每一位期望 `"float"`、句子仍是 A 式，但**第一位不对就停** —— `max("a", 1, "b")` 引擎只推 argument 1 那一句。
 *  `refused` 这五个 kind 是解析期真发句的（量过 1 / 2 / 3 / 4 位）。容器那两形**不在这张表里**：引擎解析一声不出，
 *  走到运行期才打 `Invalid type in utility function "max()". Cannot convert argument N from Array to float.` 并打断脚本 ——
 *  那一条通道由 `rt.gMax` / `rt.gMin` 发（S393，装箱十四形的读数 `tmp/probe-maxrt/compare53.txt`），解析期因此不拦。 */
export const GLOBAL_ARG_VARARG: Readonly<Record<string, ReadonlySet<string>>> = {
  max: new Set(["String", "StringName", "NodePath", "bool", "null", "Vector4", "Vector4i"]),
  min: new Set(["String", "StringName", "NodePath", "bool", "null", "Vector4", "Vector4i"]),
};


/** 「跟第一参走」那一族里**第一参可以是 bool** 的函数：那时后续位期望的是 bool，int / float 字面量反倒拒
 *  （`clamp(true, 1, 2)` → argument 2 should be "bool" but is "int".）。`lerp` 的第一参走允许集、
 *  `wrap` 的第一参直接拒 bool，两支都不在这儿。 */
export const GLOBAL_ARG_FOLLOWS_BOOL: Readonly<Record<string, true>> = {
  clamp: true,
};

/** `(位, 引擎拒的 kind 名单, 整句原文, 第一参是这些 kind 时整条让开)`。 */
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

/** `(位, 引擎拒的 kind 名单, 目标型 T, 第一参是这些 kind 时整条让开, 引擎还追第二句的那些 kind)`，
 *  第一句 `Cannot pass a value of type "U" as "T".`，第二句 `argument N should be "T" but is "U".`（`counts.txt` 逐格数出来的）。 */
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

/** `(位, 引擎拒的 kind 名单, 期望型 T, 同上)`，句子与 `GLOBAL_ARG_TYPES` 同式。 */
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

/** 「跟第一参走」那一族的向量与 Color 那一支：`(第一参的形, 位, 引擎在那一位拒的 kind 名单)`，
 *  句子 `argument N should be "<第一参那一形>" but is "U".`（`tmp/probe-argtype/derived2.mts` 逐格量：第一参钉死一形、其余位给同型合法值）。 */
export const DERIVED_ARG_TYPES: Readonly<Record<string, ReadonlyArray<readonly [string, number, readonly string[]]>>> = {
  clamp: [["Color", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"]], ["Vector2", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2i", "Vector3", "Vector3i", "Color"]], ["Vector2", 3, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2i", "Vector3", "Vector3i", "Color"]], ["Vector3", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3i", "Color"]], ["Vector3", 3, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3i", "Color"]]],
  lerp: [["Color", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i"]], ["Vector2", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2i", "Vector3", "Vector3i", "Color"]], ["Vector3", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3i", "Color"]]],
  snapped: [["Vector2", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2i", "Vector3", "Vector3i", "Color"]], ["Vector3", 2, ["int", "float", "bool", "String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3i", "Color"]]],
};

/** `(那一句归位的位, 其余位上出现这些 kind 时整条不推)`：`wrap(向量, [], 向量)` 引擎一句都不推（`derived2.txt`），
 *  第一位那一句只在其余位都是标量时发。 */
export const GLOBAL_ARG_SUPPRESS_OTHER: Readonly<Record<string, readonly [number, readonly string[]]>> = {
  clamp: [2, ["Array", "Dictionary"]],
  wrap: [1, ["Array", "Dictionary"]],
};
