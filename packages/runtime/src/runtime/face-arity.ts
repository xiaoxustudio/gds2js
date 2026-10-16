// 值类型面的元数表：解析期（`analyze` 的元数与表外名两族）与运行期（装箱接收者的属性读要发绑定 Callable）共用一份，
// 两侧不可能各量一次 —— 方向同 `PACK_ABSENT_*`（S415）。
// Array 49 名、String 108 名都逐名过裁判（S379 / S380，读数 `tmp/probe-array/compare22.txt` 与 `tmp/probe-slice/compare{104,105}.txt`）。
export const ARRAY_METHOD_ARITY: Record<string, [number, number]> = {
  all: [1, 1], any: [1, 1], append: [1, 1], append_array: [1, 1], assign: [1, 1], back: [0, 0],
  bsearch: [1, 2], bsearch_custom: [2, 3], clear: [0, 0], count: [1, 1], duplicate: [0, 1], erase: [1, 1],
  fill: [1, 1], filter: [1, 1], find: [1, 2], find_custom: [1, 2], front: [0, 0], get: [1, 1],
  get_typed_builtin: [0, 0], get_typed_class_name: [0, 0], get_typed_script: [0, 0], has: [1, 1],
  hash: [0, 0], insert: [2, 2], is_empty: [0, 0], is_read_only: [0, 0], is_same_typed: [1, 1],
  is_typed: [0, 0], make_read_only: [0, 0], map: [1, 1], max: [0, 0], min: [0, 0], pick_random: [0, 0],
  pop_at: [1, 1], pop_back: [0, 0], pop_front: [0, 0], push_back: [1, 1], push_front: [1, 1], reduce: [1, 2],
  remove_at: [1, 1], resize: [1, 1], reverse: [0, 0], rfind: [1, 2], rfind_custom: [1, 2], shuffle: [0, 0],
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
  trim_suffix: [1, 1], unicode_at: [1, 1], uri_decode: [0, 0], uri_encode: [0, 0], validate_filename: [0, 0],
  validate_node_name: [0, 0], xml_escape: [0, 1], xml_unescape: [0, 0],
};


export const PACK_METHOD_ARITY: Record<string, [number, number]> = {
  append: [1, 1], append_array: [1, 1], bsearch: [1, 2], clear: [0, 0], count: [1, 1],
  duplicate: [0, 0], fill: [1, 1], find: [1, 2], get: [1, 1], has: [1, 1],
  insert: [2, 2], is_empty: [0, 0], push_back: [1, 1], remove_at: [1, 1], resize: [1, 1],
  reverse: [0, 0], rfind: [1, 2], set: [2, 2], size: [0, 0], slice: [1, 2], sort: [0, 0],
};
export const PACK_METHOD_ARITY_WITH_BYTES: Record<string, [number, number]> = { ...PACK_METHOD_ARITY, to_byte_array: [0, 0] };

const PACK_NINE: Record<string, boolean> = {
  PackedByteArray: true, PackedInt32Array: true, PackedInt64Array: true, PackedFloat32Array: true,
  PackedFloat64Array: true, PackedStringArray: true, PackedVector2Array: true, PackedVector3Array: true,
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
  Vector3i: {
    abs: [0, 0], clamp: [2, 2], clampi: [2, 2], distance_squared_to: [1, 1], distance_to: [1, 1],
    length: [0, 0], length_squared: [0, 0], max: [1, 1], max_axis_index: [0, 0], maxi: [1, 1],
    min: [1, 1], min_axis_index: [0, 0], mini: [1, 1], sign: [0, 0], snapped: [1, 1],
    snappedi: [1, 1],
  },
  Color: {
    blend: [1, 1], clamp: [0, 2], darkened: [1, 1], from_hsv: [3, 4], from_ok_hsl: [3, 4],
    from_rgbe9995: [1, 1], from_string: [2, 2], get_luminance: [0, 0], hex: [1, 1], hex64: [1, 1],
    html: [1, 1], html_is_valid: [1, 1], inverted: [0, 0], is_equal_approx: [1, 1], lerp: [2, 2],
    lightened: [1, 1], linear_to_srgb: [0, 0], srgb_to_linear: [0, 0], to_abgr32: [0, 0], to_abgr64: [0, 0],
    to_argb32: [0, 0], to_argb64: [0, 0], to_html: [0, 1], to_rgba32: [0, 0], to_rgba64: [0, 0],
  },
  PackedByteArray: PACK_METHOD_ARITY,
  PackedInt32Array: PACK_METHOD_ARITY_WITH_BYTES,
  PackedInt64Array: PACK_METHOD_ARITY_WITH_BYTES,
  PackedFloat32Array: PACK_METHOD_ARITY_WITH_BYTES,
  PackedFloat64Array: PACK_METHOD_ARITY_WITH_BYTES,
  PackedStringArray: PACK_METHOD_ARITY_WITH_BYTES,
  PackedVector2Array: PACK_METHOD_ARITY_WITH_BYTES,
  PackedVector3Array: PACK_METHOD_ARITY_WITH_BYTES,
  PackedColorArray: PACK_METHOD_ARITY_WITH_BYTES,
};

/** 按面名与成员名查那一对元数上下界；查不到给 null（表外名、byte 独有的名字，或候选宇宙之外的名字）。 */
export function faceArity(face: string, name: string): [number, number] | null {
  const table = face === "Array" ? ARRAY_METHOD_ARITY : face === "String" ? STRING_METHOD_ARITY
    : PACK_NINE[face] === true ? (face === "PackedByteArray" ? PACK_METHOD_ARITY : PACK_METHOD_ARITY_WITH_BYTES)
      : VALUE_METHOD_ARITY[face];
  if (table === undefined || table === null) return null;
  const row = table[name];
  return row === undefined ? null : [row[0], row[1]];
}
