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
  max: [[1, "float"], [2, "float"]],
  maxf: [[1, "float"], [2, "float"]],
  maxi: [[1, "int"], [2, "int"]],
  min: [[1, "float"], [2, "float"]],
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
};

/** `(位, 引擎拒的 kind 名单, 期望型 T, 同上)`，句子与 `GLOBAL_ARG_TYPES` 同式。 */
export const GLOBAL_ARG_SHOULD_BE: Readonly<Record<string, ReadonlyArray<readonly [number, readonly string[], string, readonly string[]]>>> = {
  bytes_to_var: [[1, ["Dictionary"], "PackedByteArray", []]],
  bytes_to_var_with_objects: [[1, ["Dictionary"], "PackedByteArray", []]],
  convert: [[2, ["String", "StringName", "NodePath", "null", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "int", []], [2, ["Array", "Dictionary"], "Variant.Type", []]],
  dict_to_inst: [[1, ["Array"], "Dictionary", []]],
  error_string: [[1, ["Array", "Dictionary"], "int", []]],
  inst_to_dict: [[1, ["int", "float", "bool", "String", "StringName", "NodePath", "Array", "Dictionary", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"], "Object", []]],
  instance_from_id: [[1, ["Array", "Dictionary"], "int", []]],
  is_instance_id_valid: [[1, ["Array", "Dictionary"], "int", []]],
  rand_from_seed: [[1, ["Array", "Dictionary"], "int", []]],
  randf_range: [[1, ["Array", "Dictionary"], "float", []], [2, ["Array", "Dictionary"], "float", []]],
  randfn: [[1, ["Array", "Dictionary"], "float", []], [2, ["Array", "Dictionary"], "float", []]],
  randi_range: [[1, ["Array", "Dictionary"], "int", []], [2, ["Array", "Dictionary"], "int", []]],
  rid_from_int64: [[1, ["Array", "Dictionary"], "int", []]],
  type_convert: [[2, ["Array", "Dictionary"], "int", []]],
  type_string: [[1, ["Array", "Dictionary"], "int", []]],
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
  wrap: [1, ["Array", "Dictionary"]],
};
