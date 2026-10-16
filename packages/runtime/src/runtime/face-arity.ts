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


/** 按面名与成员名查那一对元数上下界；查不到给 null（表外名或没量过的名字）。 */
export function faceArity(face: string, name: string): [number, number] | null {
  const table = face === "Array" ? ARRAY_METHOD_ARITY : face === "String" ? STRING_METHOD_ARITY : null;
  if (table === null) return null;
  const row = table[name];
  return row === undefined ? null : [row[0], row[1]];
}
