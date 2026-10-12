/**
 * 内建类型「静态名」的形参拒：`Color.html(1)`、`Vector3.octahedron_decode(1)` 这些在解析期就被拒的形，
 * 每一位的每一个 kind 都是实测（主探针 `statics.mts` 之外，`statics2 / statics3 / statics4` 补量主探针自己抄错的两名与没走到的第四位）。
 * 键是 `"类型.静态名"`，行是 `(位, 引擎真拒的 kind 名单, 期望型 T[, 引擎还追 A 式那一句的 kind 名单])`。
 * 与全局函数那一族同构：`STATIC_ARG_AS` 发 `Cannot pass a value of type "U" as "T".`（第五列在的同位再追 `argument N should be "T" but is "U".`），
 * `STATIC_ARG_TYPES` 只发后一句 —— Array / Dictionary 那两形常走这一支。
 */
export const STATIC_ARG_AS: Readonly<Record<string, ReadonlyArray<readonly [number, readonly string[], string, readonly string[]]>>> = {
  "Color.from_hsv": [[1, ["String", "StringName", "null", "Color", "Vector2"], "float", ["String", "StringName", "null", "Color", "Vector2"]], [2, ["String", "StringName", "null", "Color", "Vector2"], "float", ["String", "StringName", "null", "Color", "Vector2"]], [3, ["String", "StringName", "null", "Color", "Vector2"], "float", ["String", "StringName", "null", "Color", "Vector2"]], [4, ["String", "StringName", "null", "Color", "Vector2"], "float", ["String", "StringName", "null", "Color", "Vector2"]]],
  "Color.from_ok_hsl": [[1, ["String", "StringName", "null", "Color", "Vector2"], "float", ["String", "StringName", "null", "Color", "Vector2"]], [2, ["String", "StringName", "null", "Color", "Vector2"], "float", ["String", "StringName", "null", "Color", "Vector2"]], [3, ["String", "StringName", "null", "Color", "Vector2"], "float", ["String", "StringName", "null", "Color", "Vector2"]], [4, ["String", "StringName", "null", "Color", "Vector2"], "float", ["String", "StringName", "null", "Color", "Vector2"]]],
  "Color.from_rgba8": [[1, ["String", "StringName", "null", "Color", "Vector2"], "int", ["String", "StringName", "null", "Color", "Vector2"]], [2, ["String", "StringName", "null", "Color", "Vector2"], "int", ["String", "StringName", "null", "Color", "Vector2"]], [3, ["String", "StringName", "null", "Color", "Vector2"], "int", ["String", "StringName", "null", "Color", "Vector2"]], [4, ["String", "StringName", "null", "Color", "Vector2"], "int", ["String", "StringName", "null", "Color", "Vector2"]]],
  "Color.from_rgbe9995": [[1, ["String", "StringName", "null", "Color", "Vector2"], "int", ["String", "StringName", "null", "Color", "Vector2"]]],
  "Color.from_string": [[1, ["int", "float", "bool", "null", "Color", "Vector2"], "String", ["int", "float", "bool", "null", "Color", "Vector2"]], [2, ["float", "bool", "StringName", "null", "Vector2"], "Color", ["float", "bool", "StringName", "null", "Vector2"]]],
  "Color.hex": [[1, ["String", "StringName", "null", "Color", "Vector2"], "int", ["String", "StringName", "null", "Color", "Vector2"]]],
  "Color.hex64": [[1, ["String", "StringName", "null", "Color", "Vector2"], "int", ["String", "StringName", "null", "Color", "Vector2"]]],
  "Color.html": [[1, ["int", "float", "bool", "null", "Color", "Vector2"], "String", ["int", "float", "bool", "null", "Color", "Vector2"]]],
  "Color.html_is_valid": [[1, ["int", "float", "bool", "null", "Color", "Vector2"], "String", ["int", "float", "bool", "null", "Color", "Vector2"]]],
  "String.chr": [[1, ["String", "StringName", "null", "Color", "Vector2"], "int", ["String", "StringName", "null", "Color", "Vector2"]]],
  "String.humanize_size": [[1, ["String", "StringName", "null", "Color", "Vector2"], "int", ["String", "StringName", "null", "Color", "Vector2"]]],
  "String.num": [[1, ["String", "StringName", "null", "Color", "Vector2"], "float", ["String", "StringName", "null", "Color", "Vector2"]], [2, ["String", "StringName", "null", "Color", "Vector2"], "int", ["String", "StringName", "null", "Color", "Vector2"]]],
  "String.num_int64": [[1, ["String", "StringName", "null", "Color", "Vector2"], "int", ["String", "StringName", "null", "Color", "Vector2"]], [2, ["String", "StringName", "null", "Color", "Vector2"], "int", ["String", "StringName", "null", "Color", "Vector2"]], [3, ["String", "StringName", "null", "Color", "Vector2"], "bool", ["String", "StringName", "null", "Color", "Vector2"]]],
  "String.num_scientific": [[1, ["String", "StringName", "null", "Color", "Vector2"], "float", ["String", "StringName", "null", "Color", "Vector2"]]],
  "String.num_uint64": [[1, ["String", "StringName", "null", "Color", "Vector2"], "int", ["String", "StringName", "null", "Color", "Vector2"]], [2, ["String", "StringName", "null", "Color", "Vector2"], "int", ["String", "StringName", "null", "Color", "Vector2"]], [3, ["String", "StringName", "null", "Color", "Vector2"], "bool", ["String", "StringName", "null", "Color", "Vector2"]]],
  "Vector2.from_angle": [[1, ["String", "StringName", "null", "Color", "Vector2"], "float", ["String", "StringName", "null", "Color", "Vector2"]]],
  "Vector3.octahedron_decode": [[1, ["int", "float", "bool", "String", "StringName", "null", "Color"], "Vector2", ["int", "float", "bool", "String", "StringName", "null", "Color"]]],
};

export const STATIC_ARG_TYPES: Readonly<Record<string, ReadonlyArray<readonly [number, readonly string[], string]>>> = {
  "Color.from_hsv": [[1, ["Array", "Dictionary"], "float"], [2, ["Array", "Dictionary"], "float"], [3, ["Array", "Dictionary"], "float"], [4, ["Array", "Dictionary"], "float"]],
  "Color.from_ok_hsl": [[1, ["Array", "Dictionary"], "float"], [2, ["Array", "Dictionary"], "float"], [3, ["Array", "Dictionary"], "float"], [4, ["Array", "Dictionary"], "float"]],
  "Color.from_rgba8": [[1, ["Array", "Dictionary"], "int"], [2, ["Array", "Dictionary"], "int"], [3, ["Array", "Dictionary"], "int"], [4, ["Array", "Dictionary"], "int"]],
  "Color.from_rgbe9995": [[1, ["Array", "Dictionary"], "int"]],
  "Color.from_string": [[1, ["Array", "Dictionary"], "String"], [2, ["Array", "Dictionary"], "Color"]],
  "Color.hex": [[1, ["Array", "Dictionary"], "int"]],
  "Color.hex64": [[1, ["Array", "Dictionary"], "int"]],
  "Color.html": [[1, ["Array", "Dictionary"], "String"]],
  "Color.html_is_valid": [[1, ["Array", "Dictionary"], "String"]],
  "String.chr": [[1, ["Array", "Dictionary"], "int"]],
  "String.humanize_size": [[1, ["Array", "Dictionary"], "int"]],
  "String.num": [[1, ["Array", "Dictionary"], "float"], [2, ["Array", "Dictionary"], "int"]],
  "String.num_int64": [[1, ["Array", "Dictionary"], "int"], [2, ["Array", "Dictionary"], "int"], [3, ["Array", "Dictionary"], "bool"]],
  "String.num_scientific": [[1, ["Array", "Dictionary"], "float"]],
  "String.num_uint64": [[1, ["Array", "Dictionary"], "int"], [2, ["Array", "Dictionary"], "int"], [3, ["Array", "Dictionary"], "bool"]],
  "Vector2.from_angle": [[1, ["Array", "Dictionary"], "float"]],
  "Vector3.octahedron_decode": [[1, ["Array", "Dictionary"], "Vector2"]],
};
