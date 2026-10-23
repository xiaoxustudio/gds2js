// 值类型面的元数表：解析期（`analyze` 的元数与表外名两族）与运行期（装箱接收者的属性读要发绑定 Callable）共用一份，
// 两侧不可能各量一次 —— 方向同 `PACK_ABSENT_*`（S415）。
// Array 49 名、String 108 名都逐名过裁判（S379 / S380，读数 `tmp/probe-array/compare22.txt` 与 `tmp/probe-slice/compare{104,105}.txt`）。
export const ARRAY_METHOD_ARITY: Record<string, [number, number]> = {
  all: [1, 1], any: [1, 1], append: [1, 1], append_array: [1, 1], assign: [1, 1], back: [0, 0],
  bsearch: [1, 2], bsearch_custom: [2, 3], clear: [0, 0], count: [1, 1], duplicate: [0, 1], duplicate_deep: [0, 1], erase: [1, 1],
  fill: [1, 1], filter: [1, 1], find: [1, 2], find_custom: [1, 2], front: [0, 0], get: [1, 1],
  get_typed_builtin: [0, 0], get_typed_class_name: [0, 0], get_typed_script: [0, 0], has: [1, 1],
  hash: [0, 0], insert: [2, 2], is_empty: [0, 0], is_read_only: [0, 0], is_same_typed: [1, 1],
  is_typed: [0, 0], make_read_only: [0, 0], map: [1, 1], max: [0, 0], min: [0, 0], pick_random: [0, 0],
  pop_at: [1, 1], pop_back: [0, 0], pop_front: [0, 0], push_back: [1, 1], push_front: [1, 1], reduce: [1, 2],
  remove_at: [1, 1], resize: [1, 1], reverse: [0, 0], rfind: [1, 2], rfind_custom: [1, 2], set: [2, 2], shuffle: [0, 0],
  size: [0, 0], slice: [1, 4], sort: [0, 0], sort_custom: [1, 1],
};

export const STRING_METHOD_ARITY: Record<string, [number, number]> = {
  begins_with: [1, 1], bigrams: [0, 0], bin_to_int: [0, 0], c_escape: [0, 0], c_unescape: [0, 0],
  capitalize: [0, 0], casecmp_to: [1, 1], chr: [1, 1], contains: [1, 1], containsn: [1, 1], count: [1, 3],
  countn: [1, 3], dedent: [0, 0], ends_with: [1, 1], erase: [1, 2], filecasecmp_to: [1, 1],
  filenocasecmp_to: [1, 1], find: [1, 2], findn: [1, 2], format: [1, 2], get_base_dir: [0, 0],
  get_basename: [0, 0], get_extension: [0, 0], get_file: [0, 0], get_slice: [2, 2], get_slice_count: [1, 1],
  get_slicec: [2, 2], hash: [0, 0], hex_decode: [0, 0], hex_to_int: [0, 0], humanize_size: [1, 1],
  indent: [1, 1], insert: [2, 2], is_absolute_path: [0, 0], is_empty: [0, 0], is_relative_path: [0, 0],
  is_subsequence_of: [1, 1], is_subsequence_ofn: [1, 1], is_valid_filename: [0, 0], is_valid_float: [0, 0],
  is_valid_hex_number: [0, 1], is_valid_html_color: [0, 0], is_valid_identifier: [0, 0], is_valid_int: [0, 0],
  is_valid_ip_address: [0, 0], join: [1, 1], json_escape: [0, 0], left: [1, 1], length: [0, 0], lpad: [1, 2],
  lstrip: [1, 1], match: [1, 1], matchn: [1, 1], md5_buffer: [0, 0], md5_text: [0, 0],
  naturalcasecmp_to: [1, 1], naturalnocasecmp_to: [1, 1], nocasecmp_to: [1, 1], num: [1, 2],
  num_int64: [1, 3], num_scientific: [1, 1], num_uint64: [1, 3], pad_decimals: [1, 1], pad_zeros: [1, 1],
  path_join: [1, 1], repeat: [1, 1], replace: [2, 2], replacen: [2, 2], reverse: [0, 0], rfind: [1, 2],
  rfindn: [1, 2], right: [1, 1], rpad: [1, 2], rsplit: [0, 3], rstrip: [1, 1], sha1_buffer: [0, 0],
  sha1_text: [0, 0], sha256_buffer: [0, 0], sha256_text: [0, 0], similarity: [1, 1], simplify_path: [0, 0],
  split: [0, 3], split_floats: [1, 2], strip_edges: [0, 2], strip_escapes: [0, 0], substr: [1, 2],
  to_ascii_buffer: [0, 0], to_camel_case: [0, 0], to_float: [0, 0], to_int: [0, 0], to_kebab_case: [0, 0],
  to_lower: [0, 0], to_pascal_case: [0, 0], to_snake_case: [0, 0], to_upper: [0, 0], to_utf16_buffer: [0, 0],
  to_utf32_buffer: [0, 0], to_utf8_buffer: [0, 0], to_wchar_buffer: [0, 0], trim_prefix: [1, 1],
  trim_suffix: [1, 1], unicode_at: [1, 1], uri_decode: [0, 0], uri_encode: [0, 0], uri_file_decode: [0, 0],
  is_valid_ascii_identifier: [0, 0], is_valid_unicode_identifier: [0, 0], validate_filename: [0, 0],
  validate_node_name: [0, 0], xml_escape: [0, 1], xml_unescape: [0, 0],
  remove_char: [1, 1],
  remove_chars: [1, 1],
  replace_char: [2, 2],
  replace_chars: [2, 2],
  to_multibyte_char_buffer: [0, 1]
};


// StringName 与 String 的名册只差那六名（尺 `tmp/probe639/gen639.mjs`，读数 `names.gd` 二十一格，并与本机 4.6.3 的
// `--dump-extension-api` 导出逐名对账，尺 `tmp/probe639/diff639.mts`）：六名 `chr / humanize_size / num / num_int64 /
// num_scientific / num_uint64` 在 StringName 面上是表外名（`Invalid access to property or key 'X' on a base object of type 'StringName'.`），
// 三名 `uri_file_decode / is_valid_ascii_identifier / is_valid_unicode_identifier` 两面都存在且零元（S639 读的是属性读，
// 两面都回 `StringName::X` / `String::X` 的绑定 Callable；元数两界随 S668 一起登进 String 那张表，两面共用）。
const STRING_NAME_ABSENT = ["chr", "humanize_size", "num", "num_int64", "num_scientific", "num_uint64"];
export const STRING_NAME_METHOD_ARITY: Record<string, [number, number]> =
  Object.fromEntries(Object.entries(STRING_METHOD_ARITY).filter(([n]) => !STRING_NAME_ABSENT.includes(n)));

export const PACK_METHOD_ARITY: Record<string, [number, number]> = {
  append: [1, 1], append_array: [1, 1], bsearch: [1, 2], clear: [0, 0], count: [1, 1],
  duplicate: [0, 0], erase: [1, 1], fill: [1, 1], find: [1, 2], get: [1, 1], has: [1, 1],
  insert: [2, 2], is_empty: [0, 0], push_back: [1, 1], remove_at: [1, 1], resize: [1, 1],
  reverse: [0, 0], rfind: [1, 2], set: [2, 2], size: [0, 0], slice: [1, 2], sort: [0, 0],
};
export const PACK_METHOD_ARITY_WITH_BYTES: Record<string, [number, number]> = { ...PACK_METHOD_ARITY, to_byte_array: [0, 0] };
// `PackedByteArray` 独有那一批名字一名一名过了裁判：前 11 名的元数上下界见尺 `tmp/probe-bytearity/round2.mts`（读数 `compare1.txt`
// 与 `raw.txt`），后 36 名与上下界见尺 `tmp/probe636/arity636.mjs`（读数 `arity636.compare.txt`）—— 零实参不报错的那些就是「至少 0」，
// 五实参报「至多 N」的就是上界；`decompress` 两界都直接从两句里读。名册完整性另有一把尺 `tmp/probe636/gen636.mjs`（读数 `attr.out`）：
// 94 个候选名 × 十支的属性读，落进存在集的 69 / 23 名与本机 4.6.3 的实例成员表一字不差。
export const PACK_BYTE_EXTRA_ARITY: Record<string, [number, number]> = {
  compress: [0, 1], decompress: [1, 2], get_string_from_ascii: [0, 0], get_string_from_utf16: [0, 0],
  get_string_from_utf8: [0, 0], get_string_from_wchar: [0, 0], hex_encode: [0, 0], to_float32_array: [0, 0],
  to_float64_array: [0, 0], to_int32_array: [0, 0], to_int64_array: [0, 0],
  bswap16: [0, 2], bswap32: [0, 2], bswap64: [0, 2], decompress_dynamic: [1, 2], has_encoded_var: [1, 2],
  decode_u8: [1, 1], decode_s8: [1, 1], decode_u16: [1, 1], decode_s16: [1, 1], decode_u32: [1, 1],
  decode_s32: [1, 1], decode_u64: [1, 1], decode_s64: [1, 1], decode_half: [1, 1], decode_float: [1, 1],
  decode_double: [1, 1], decode_var: [1, 2], decode_var_size: [1, 2],
  encode_u8: [2, 2], encode_s8: [2, 2], encode_u16: [2, 2], encode_s16: [2, 2], encode_u32: [2, 2],
  encode_s32: [2, 2], encode_u64: [2, 2], encode_s64: [2, 2], encode_half: [2, 2], encode_float: [2, 2],
  encode_double: [2, 2], encode_var: [2, 3],
  get_string_from_multibyte_char: [0, 1], get_string_from_utf32: [0, 0],
  to_vector2_array: [0, 0], to_vector3_array: [0, 0], to_vector4_array: [0, 0], to_color_array: [0, 0],
};

const PACK_BYTE_ARITY: Record<string, [number, number]> = { ...PACK_METHOD_ARITY, ...PACK_BYTE_EXTRA_ARITY };

export const NODE_PATH_METHOD_ARITY: Record<string, [number, number]> = {
  get_as_property_path: [0, 0], get_concatenated_names: [0, 0], get_concatenated_subnames: [0, 0],
  get_name: [1, 1], get_name_count: [0, 0], get_subname: [1, 1],
  get_subname_count: [0, 0], hash: [0, 0], is_absolute: [0, 0], is_empty: [0, 0], slice: [1, 2],
};

/** `Callable` 面装箱直调的上下界（尺 `tmp/probe644/sc645.gd` 廿一格）：越界两向都报**声明的全部数**，
 *  所以每一非变参名的两界同数；`bind` 是变参、零支收下（实测 `Callable().bind()` 原样回同一只），
 *  上界用最大安全整数占位（越不出界，那句里的数永远读不到它）。
 *  没量过的名不进表：`call` / `call_deferred` / `rpc` / `rpc_id`（变参的界没单独量）、
 *  `emit` / `disconnect`（引擎在取返回值那一步先给 `Trying to get a return value of a method that returns "void"`）。 */
export const CALLABLE_METHOD_ARITY: Record<string, [number, number]> = {
  bind: [0, Number.MAX_SAFE_INTEGER], bindv: [1, 1], callv: [1, 1], create: [2, 2],
  get_argument_count: [0, 0], get_bound_arguments: [0, 0], get_bound_arguments_count: [0, 0],
  get_method: [0, 0], get_object: [0, 0], get_object_id: [0, 0], get_unbound_arguments_count: [0, 0],
  hash: [0, 0], is_custom: [0, 0], is_null: [0, 0], is_standard: [0, 0], is_valid: [0, 0], unbind: [1, 1],
};

/** `Signal` 面同一把尺（同支探头八名 × 越界两向）：`connect` 报 2、`is_connected` 报 1、其余六名报 0。
 *  `connect` 的两界是 `[1, 2]` 而不是 `[2, 2]` —— `flags` 有默认值，一支实参引擎照样连上
 *  （S546 那批重复连/空 Callable 的读数都是一支形），只是越界那句报的是声明的全部数 2。 */
export const SIGNAL_METHOD_ARITY: Record<string, [number, number]> = {
  connect: [1, 2], disconnect: [1, 1], emit: [0, Number.MAX_SAFE_INTEGER],
  get_connections: [0, 0], get_name: [0, 0], get_object: [0, 0],
  get_object_id: [0, 0], has_connections: [0, 0], is_connected: [1, 1], is_null: [0, 0],
};


const PACK_NINE: Record<string, boolean> = {
  PackedByteArray: true, PackedInt32Array: true, PackedInt64Array: true, PackedFloat32Array: true,
  PackedFloat64Array: true, PackedStringArray: true, PackedVector2Array: true, PackedVector3Array: true, PackedVector4Array: true,
  PackedColorArray: true,
};

export const VALUE_METHOD_ARITY: Record<string, Record<string, [number, number]>> = {
  Vector2: {
    abs: [0, 0], angle: [0, 0], angle_to: [1, 1], angle_to_point: [1, 1], aspect: [0, 0],
    bezier_derivative: [4, 4], bezier_interpolate: [4, 4], bounce: [1, 1], ceil: [0, 0], clamp: [2, 2],
    clampf: [2, 2], cross: [1, 1], cubic_interpolate: [4, 4], cubic_interpolate_in_time: [7, 7], direction_to: [1, 1],
    distance_squared_to: [1, 1], distance_to: [1, 1], dot: [1, 1], floor: [0, 0], from_angle: [1, 1],
    is_equal_approx: [1, 1], is_finite: [0, 0], is_normalized: [0, 0], is_zero_approx: [0, 0], length: [0, 0],
    length_squared: [0, 0], lerp: [2, 2], limit_length: [0, 1], max: [1, 1], max_axis_index: [0, 0],
    maxf: [1, 1], min: [1, 1], min_axis_index: [0, 0], minf: [1, 1], move_toward: [2, 2],
    normalized: [0, 0], orthogonal: [0, 0], posmod: [1, 1], posmodv: [1, 1], project: [1, 1],
    reflect: [1, 1], rotated: [1, 1], round: [0, 0], sign: [0, 0], slerp: [2, 2],
    slide: [1, 1], snapped: [1, 1], snappedf: [1, 1],
  },
  Vector2i: {
    abs: [0, 0], aspect: [0, 0], clamp: [2, 2], clampi: [2, 2], distance_squared_to: [1, 1],
    distance_to: [1, 1], length: [0, 0], length_squared: [0, 0], max: [1, 1], max_axis_index: [0, 0],
    maxi: [1, 1], min: [1, 1], min_axis_index: [0, 0], mini: [1, 1], sign: [0, 0],
    snapped: [1, 1], snappedi: [1, 1],
  },
  Vector3: {
    abs: [0, 0], angle_to: [1, 1], bezier_derivative: [4, 4], bezier_interpolate: [4, 4], bounce: [1, 1],
    ceil: [0, 0], clamp: [2, 2], clampf: [2, 2], cross: [1, 1], cubic_interpolate: [4, 4],
    cubic_interpolate_in_time: [7, 7], direction_to: [1, 1], distance_squared_to: [1, 1], distance_to: [1, 1], dot: [1, 1],
    floor: [0, 0], inverse: [0, 0], is_equal_approx: [1, 1], is_finite: [0, 0], is_normalized: [0, 0],
    is_zero_approx: [0, 0], length: [0, 0], length_squared: [0, 0], lerp: [2, 2], limit_length: [0, 1],
    max: [1, 1], max_axis_index: [0, 0], maxf: [1, 1], min: [1, 1], min_axis_index: [0, 0],
    minf: [1, 1], move_toward: [2, 2], normalized: [0, 0], octahedron_decode: [1, 1], octahedron_encode: [0, 0],
    outer: [1, 1], posmod: [1, 1], posmodv: [1, 1], project: [1, 1], reflect: [1, 1],
    rotated: [2, 2], round: [0, 0], sign: [0, 0], signed_angle_to: [2, 2], slerp: [2, 2],
    slide: [1, 1], snapped: [1, 1], snappedf: [1, 1],
  },
  Vector4: {
    abs: [0, 0], ceil: [0, 0], clamp: [2, 2], clampf: [2, 2], cubic_interpolate: [4, 4],
    cubic_interpolate_in_time: [7, 7], direction_to: [1, 1], distance_squared_to: [1, 1], distance_to: [1, 1], dot: [1, 1],
    floor: [0, 0], inverse: [0, 0], is_equal_approx: [1, 1], is_finite: [0, 0], is_normalized: [0, 0],
    is_zero_approx: [0, 0], length: [0, 0], length_squared: [0, 0], lerp: [2, 2], max: [1, 1],
    max_axis_index: [0, 0], maxf: [1, 1], min: [1, 1], min_axis_index: [0, 0], minf: [1, 1],
    normalized: [0, 0], posmod: [1, 1], posmodv: [1, 1], round: [0, 0], sign: [0, 0],
    snapped: [1, 1], snappedf: [1, 1],
  },
  Vector4i: {
    abs: [0, 0], clamp: [2, 2], clampi: [2, 2], distance_squared_to: [1, 1], distance_to: [1, 1],
    length: [0, 0], length_squared: [0, 0], max: [1, 1], max_axis_index: [0, 0], maxi: [1, 1],
    min: [1, 1], min_axis_index: [0, 0], mini: [1, 1], sign: [0, 0], snapped: [1, 1], snappedi: [1, 1],
  },
  Vector3i: {
    abs: [0, 0], clamp: [2, 2], clampi: [2, 2], distance_squared_to: [1, 1], distance_to: [1, 1],
    length: [0, 0], length_squared: [0, 0], max: [1, 1], max_axis_index: [0, 0], maxi: [1, 1],
    min: [1, 1], min_axis_index: [0, 0], mini: [1, 1], sign: [0, 0], snapped: [1, 1],
    snappedi: [1, 1],
  },
  Color: {
    blend: [1, 1], clamp: [0, 2], darkened: [1, 1], from_hsv: [3, 4], from_ok_hsl: [3, 4],
    from_rgba8: [3, 4], from_rgbe9995: [1, 1], from_string: [2, 2], get_luminance: [0, 0], hex: [1, 1], hex64: [1, 1],
    html: [1, 1], html_is_valid: [1, 1], inverted: [0, 0], is_equal_approx: [1, 1], lerp: [2, 2],
    lightened: [1, 1], linear_to_srgb: [0, 0], srgb_to_linear: [0, 0], to_abgr32: [0, 0], to_abgr64: [0, 0],
    to_argb32: [0, 0], to_argb64: [0, 0], to_html: [0, 1], to_rgba32: [0, 0], to_rgba64: [0, 0],
  },
  PackedByteArray: PACK_BYTE_ARITY,
  PackedInt32Array: PACK_METHOD_ARITY_WITH_BYTES,
  PackedInt64Array: PACK_METHOD_ARITY_WITH_BYTES,
  PackedFloat32Array: PACK_METHOD_ARITY_WITH_BYTES,
  PackedFloat64Array: PACK_METHOD_ARITY_WITH_BYTES,
  PackedStringArray: PACK_METHOD_ARITY_WITH_BYTES,
  PackedVector2Array: PACK_METHOD_ARITY_WITH_BYTES,
  PackedVector3Array: PACK_METHOD_ARITY_WITH_BYTES,
  PackedColorArray: PACK_METHOD_ARITY_WITH_BYTES,
};

// 属性读那一形两面过裁判的读数（S431）：宇宙 = 175 个候选名（`tmp/probe-vattr/` 拿别面的成员名当表外名试），
// 每面的「存在集」= 宇宙里引擎**没**判为表外的那些，也就是该面的成员 ∪ 真属性；宇宙内又不在存在集的就是表外。
// 构造位逐名读数 `tmp/probe-vattr/compare1.txt`；装箱位同式七格 `tmp/probe-vattr/box.gd`。

export const VALUE_ATTR_UNIVERSE: readonly string[] = [
  "a", "all", "any", "append", "append_array", "assign", "b", "back", "begins_with", "bigrams", "bin_to_int",
  "bsearch", "bsearch_custom", "c_escape", "c_unescape", "capitalize", "casecmp_to", "chr", "clear", "contains",
  "containsn", "count", "countn", "dedent", "distance_to", "duplicate", "ends_with", "erase", "filecasecmp_to",
  "filenocasecmp_to", "fill", "filter", "find", "find_custom", "find_key", "findn", "format", "front", "g", "get",
  "get_base_dir", "get_basename", "get_extension", "get_file", "get_name_count", "get_or_add", "get_slice",
  "get_slice_count", "get_slicec", "get_typed_builtin", "get_typed_class_name", "get_typed_script", "has",
  "has_all", "hash", "hex_decode", "hex_to_int", "humanize_size", "imag", "indent", "insert", "is_absolute_path",
  "is_empty", "is_read_only", "is_relative_path", "is_same_typed", "is_subsequence_of", "is_subsequence_ofn",
  "is_typed", "is_valid_filename", "is_valid_float", "is_valid_hex_number", "is_valid_html_color",
  "is_valid_identifier", "is_valid_int", "is_valid_ip_address", "join", "json_escape", "keys", "left", "length",
  "lpad", "lstrip", "make_read_only", "map", "match", "matchn", "max", "md5_buffer", "md5_text", "merge", "merged",
  "min", "name", "naturalcasecmp_to", "naturalnocasecmp_to", "nocasecmp_to", "normalized", "nosuch", "num",
  "num_int64", "num_scientific", "num_uint64", "pad_decimals", "pad_zeros", "path_join", "pick_random", "pop_at",
  "pop_back", "pop_front", "push_back", "push_front", "r", "real", "recursive_equal", "reduce", "remove_at",
  "repeat", "replace", "replacen", "resize", "reverse", "rfind", "rfind_custom", "rfindn", "right", "rpad",
  "rsplit", "rstrip", "set", "sha1_buffer", "sha1_text", "sha256_buffer", "sha256_text", "shuffle", "similarity",
  "simplify_path", "size", "slice", "sort", "sort_custom", "split", "split_floats", "strip_edges", "strip_escapes",
  "substr", "to_abgr32", "to_ascii_buffer", "to_camel_case", "to_float", "to_html", "to_int", "to_kebab_case",
  "to_lower", "to_pascal_case", "to_snake_case", "to_upper", "to_utf16_buffer", "to_utf32_buffer",
  "to_utf8_buffer", "to_wchar_buffer", "trim_prefix", "trim_suffix", "unicode_at", "uri_decode", "uri_encode",
  "validate_filename", "validate_node_name", "value", "values", "x", "xml_escape", "xml_unescape", "y", "z"
];

export const VALUE_VEC2_EXISTS: readonly string[] = [
  "distance_to", "length", "max", "min", "normalized", "x", "y"
];

export const VALUE_VEC2i_EXISTS: readonly string[] = [
  "distance_to", "length", "max", "min", "x", "y"
];

export const VALUE_VEC3_EXISTS: readonly string[] = [
  "distance_to", "length", "max", "min", "normalized", "x", "y", "z"
];

export const VALUE_VEC3i_EXISTS: readonly string[] = [
  "distance_to", "length", "max", "min", "x", "y", "z"
];

export const VALUE_VEC4_EXISTS: readonly string[] = [
  "min_axis_index", "max_axis_index", "length", "length_squared", "abs", "sign", "floor", "ceil", "round", "lerp", "cubic_interpolate", "cubic_interpolate_in_time", "posmod", "posmodv", "snapped", "snappedf", "clamp", "clampf", "normalized", "is_normalized", "direction_to", "distance_to", "distance_squared_to", "dot", "inverse", "is_equal_approx", "is_zero_approx", "is_finite", "min", "minf", "max", "maxf", "w", "x", "y", "z"
];

export const VALUE_VEC4i_EXISTS: readonly string[] = [
  "min_axis_index", "max_axis_index", "length", "length_squared", "sign", "abs", "clamp", "clampi", "snapped", "snappedi", "min", "mini", "max", "maxi", "distance_to", "distance_squared_to", "w", "x", "y", "z"
];

export const VALUE_Color_EXISTS: readonly string[] = [
  "a", "b", "g", "r", "to_abgr32", "to_html"
];

export const VALUE_StringName_EXISTS: readonly string[] = [
  "begins_with", "bigrams", "bin_to_int", "c_escape", "c_unescape", "capitalize", "casecmp_to", "contains",
  "containsn", "count", "countn", "dedent", "ends_with", "erase", "filecasecmp_to", "filenocasecmp_to", "find",
  "findn", "format", "get_base_dir", "get_basename", "get_extension", "get_file", "get_slice", "get_slice_count",
  "get_slicec", "hash", "hex_decode", "hex_to_int", "indent", "insert", "is_absolute_path", "is_empty",
  "is_relative_path", "is_subsequence_of", "is_subsequence_ofn", "is_valid_filename", "is_valid_float",
  "is_valid_hex_number", "is_valid_html_color", "is_valid_identifier", "is_valid_int", "is_valid_ip_address",
  "join", "json_escape", "left", "length", "lpad", "lstrip", "match", "matchn", "md5_buffer", "md5_text",
  "naturalcasecmp_to", "naturalnocasecmp_to", "nocasecmp_to", "pad_decimals", "pad_zeros", "path_join", "repeat",
  "replace", "replacen", "reverse", "rfind", "rfindn", "right", "rpad", "rsplit", "rstrip", "sha1_buffer",
  "sha1_text", "sha256_buffer", "sha256_text", "similarity", "simplify_path", "split", "split_floats",
  "strip_edges", "strip_escapes", "substr", "to_ascii_buffer", "to_camel_case", "to_float", "to_int",
  "to_kebab_case", "to_lower", "to_pascal_case", "to_snake_case", "to_upper", "to_utf16_buffer", "to_utf32_buffer",
  "to_utf8_buffer", "to_wchar_buffer", "trim_prefix", "trim_suffix", "unicode_at", "uri_decode", "uri_encode",
  "validate_filename", "validate_node_name", "xml_escape", "xml_unescape"
];

export const VALUE_NodePath_EXISTS: readonly string[] = [
  "get_name_count", "hash", "is_empty", "slice"
];

const VALUE_EXIST: Record<string, readonly string[]> = {
  "Vector2": VALUE_VEC2_EXISTS,
  "Vector2i": VALUE_VEC2i_EXISTS,
  "Vector3": VALUE_VEC3_EXISTS,
  "Vector3i": VALUE_VEC3i_EXISTS,
  "Vector4": VALUE_VEC4_EXISTS,
  "Vector4i": VALUE_VEC4i_EXISTS,
  "Color": VALUE_Color_EXISTS,
  "StringName": VALUE_StringName_EXISTS,
  "NodePath": VALUE_NodePath_EXISTS,
};

/** 值类型面与两支名字面的属性读三分类：`"member"` 给绑定 Callable、`"prop"` 走原路、`"absent"` 给引擎那句、null 是没量过。 */
export function valueAttrKind(face: string, name: string): "member" | "prop" | "absent" | null {
  const ex = VALUE_EXIST[face];
  if (ex === undefined) return null;
  if (!VALUE_ATTR_UNIVERSE.includes(name)) return null;
  if (!ex.includes(name)) return "absent";
  return faceArity(face, name) === null ? "prop" : "member";
}

/** Dictionary 方法的元数（S378）：解析期与运行期共用一份，运行期靠它认表外名（S627）。 */
export const DICT_METHOD_ARITY: Record<string, [number, number]> = {
  assign: [1, 1], clear: [0, 0], duplicate: [0, 1], duplicate_deep: [0, 1], erase: [1, 1], find_key: [1, 1],
  get: [1, 2], get_or_add: [1, 2], has: [1, 1], has_all: [1, 1], hash: [0, 0],
  is_empty: [0, 0], is_read_only: [0, 0], keys: [0, 0], make_read_only: [0, 0], merge: [1, 2],
  merged: [1, 2], recursive_equal: [2, 2], set: [2, 2], size: [0, 0], sort: [0, 0], values: [0, 0],
  is_typed: [0, 0], is_typed_key: [0, 0], is_typed_value: [0, 0],
  is_same_typed: [1, 1], is_same_typed_key: [1, 1], is_same_typed_value: [1, 1],
  get_typed_key_builtin: [0, 0], get_typed_value_builtin: [0, 0],
  get_typed_key_class_name: [0, 0], get_typed_value_class_name: [0, 0],
  get_typed_key_script: [0, 0], get_typed_value_script: [0, 0],
};

/** 装箱直调越元数那一句（尺 `tmp/probe639/{names,call}.mjs` 与 `tmp/probe636/np642.gd`）：九格九面一字一样 ——
 *  `get_name_count` 给 1 支报 0、`get_name` 给 0 支与 2 支都报 1、`size` / `length` / `get_luminance` 给 1 支报 0、
 *  `append` 给 2 支报 1、`lerp` 给 4 支报 2、`slice` 给 0 支与 4 支都报 2。数恒取**声明的全部数**（与 S637 同一条），
 *  名字不在表里或实参在界内返回 null，由调用方发自己那一句。 */
export function nativeAritySay(face: string, name: string, given: number): string | null {
  const b = faceArity(face, name);
  if (b === null || (given >= b[0] && given <= b[1])) return null;
  // 变长那一侧报的是**必填写数**（`rpc_id()` 一句是 Expected 1，不是 Expected 天文数字；尺 `tmp/probe712/arity3.mts`）
  const want = b[1] === Number.MAX_SAFE_INTEGER ? b[0] : b[1];
  return `Invalid call to function '${name}' in base '${face}'. Expected ${String(want)} argument(s).`;
}

/** 这个名字在这一面上存不存在：元数表里有没有它就是全部判据（S627 的 u1 / u4 / u6 / u7 / u10 与 S668 的五名都已登进表）。 */
export function faceMemberKnown(face: string, name: string): boolean {
  return faceArity(face, name) !== null;
}

/** 按面名与成员名查那一对元数上下界；查不到给 null（表外名、byte 独有的名字，或候选宇宙之外的名字）。 */
export function faceArity(face: string, name: string): [number, number] | null {
  const table = face === "Array" ? ARRAY_METHOD_ARITY : face === "Dictionary" ? DICT_METHOD_ARITY
    : face === "String" ? STRING_METHOD_ARITY
      : face === "StringName" ? STRING_NAME_METHOD_ARITY
    : face === "NodePath" ? NODE_PATH_METHOD_ARITY
    : face === "Callable" ? CALLABLE_METHOD_ARITY : face === "Signal" ? SIGNAL_METHOD_ARITY
    : PACK_NINE[face] === true ? (face === "PackedByteArray" ? PACK_BYTE_ARITY : PACK_METHOD_ARITY_WITH_BYTES)
      : VALUE_METHOD_ARITY[face];
  if (table === undefined || table === null) return null;
  const row = table[name];
  return row === undefined ? null : [row[0], row[1]];
}
