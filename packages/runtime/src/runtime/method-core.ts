import { GodotRuntimeError, UnsupportedError } from "./errors";
import { isVariant, wrapValue } from "./object";
import { writeOrderedStderr, readOnlyError } from "./frames";
import { asNodePath, nodePathText } from "./node-path";
import { Tag, V, intToNum, type IntPayload, type Variant } from "./tags";
import { GArray, GDict } from "./values";
import { valueTypeName } from "./string-ops";

const NL = String.fromCharCode(10);

export function deferredArityBlock(base: string, file: string, method: string, want: number, given: number): void {
  writeOrderedStderr([
    `ERROR: Error calling deferred method: '${base}(${file})::${method}': Method expected ${String(want)} argument(s), but called with ${String(given)}.`,
    "   at: _call_function (core/object/message_queue.cpp:222)",
  ]);
}

export function isAritySay(e: unknown): boolean {
  return e instanceof GodotRuntimeError && e.code === "script-method-arity";
}

export const VECTOR_FACES = new Set(["Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", "Vector4i"]);

export function asArray(v: Variant, who: string): GArray {
  if (v.t !== Tag.ARRAY) throw new UnsupportedError("not-array", `${who} 需要 Array，收到 ${v.t}`);
  return v.v as GArray;
}

export function asDict(v: Variant, who: string): GDict {
  if (v.t !== Tag.DICT) throw new UnsupportedError("not-dict", `${who} 需要 Dictionary，收到 ${v.t}`);
  return v.v as GDict;
}

export function asString(v: Variant, who: string): string {
  if (v.t === Tag.STRING) return v.v as string;
  if (v.t === Tag.STRING_NAME) return v.v as string;
  if (v.t === Tag.OBJECT) {
    const np = asNodePath(v);
    if (np !== null) return nodePathText(np);
  }
  throw new UnsupportedError("not-string", `${who} 需要 String，收到 ${v.t}`);
}

export const ELEM_TYPE_CODE: Record<string, number> = {
  Object: 24,
  bool: 1, int: 2, float: 3, String: 4, Vector2: 5, Vector2i: 6, Vector3: 9, Vector3i: 10, Vector4: 12, Vector4i: 13,
  Color: 20, StringName: 21, Dictionary: 27, Array: 28,
};

export function elemCode(kind: string | null): number {
  return kind === null ? 0 : ELEM_TYPE_CODE[kind] as number;
}

/** 入口可能是裸 JS 值（lambda、引擎对象），先归一成 Variant */
export function norm(v: unknown): Variant {
  return isVariant(v) ? v : wrapValue(v);
}

const ARRAY_NO_METHOD = new Set(["join", "concat", "is_same"]);

export const STRING_ATTR_ABSENT = [
  "all", "any", "append", "append_array", "assign", "at", "back", "binary_search", "bsearch",
  "bsearch_custom", "clear", "compress", "copy_on_write", "decode_string", "decompress", "dedent2",
  "duplicate", "each", "fill", "filter", "find_custom", "find_key", "front", "get", "get_bytes",
  "get_index", "get_or_add", "get_pointer", "get_string_from_ascii", "get_typed_builtin",
  "get_typed_class_name", "get_typed_script", "has", "has_all", "hex_encode", "insert_array",
  "is_null", "is_read_only", "is_same_typed", "is_typed", "keys", "make_read_only", "map", "max",
  "merge", "merged", "min", "nosuch", "pick_random", "pop_at", "pop_back", "pop_front", "push_back",
  "push_front", "recursive_equal", "reduce", "remove_at", "remove_at_copy", "resize", "rfind_custom",
  "same_type", "search_sorted", "set", "shuffle", "size", "slice", "sort", "sort_custom", "sort_flags",
  "subarray", "sum", "to_base64", "to_byte_array", "to_float32_array", "to_float64_array",
  "to_hex_string", "to_int32_array", "to_int64_array", "to_raw_string", "to_string", "values"
];

export const ARRAY_ATTR_ABSENT = [
  "at", "begins_with", "bigrams", "bin_to_int", "binary_search", "c_escape", "c_unescape",
  "capitalize", "casecmp_to", "chr", "compress", "contains", "containsn", "copy_on_write", "countn",
  "decode_string", "decompress", "dedent", "dedent2", "each", "ends_with", "filecasecmp_to",
  "filenocasecmp_to", "find_key", "findn", "format", "get_base_dir", "get_basename", "get_bytes",
  "get_extension", "get_file", "get_index", "get_or_add", "get_pointer", "get_slice",
  "get_slice_count", "get_slicec", "get_string_from_ascii", "has_all", "hex_decode", "hex_encode",
  "hex_to_int", "humanize_size", "indent", "insert_array", "is_absolute_path", "is_null",
  "is_relative_path", "is_subsequence_of", "is_subsequence_ofn", "is_valid_filename", "is_valid_float",
  "is_valid_hex_number", "is_valid_html_color", "is_valid_identifier", "is_valid_int",
  "is_valid_ip_address", "join", "json_escape", "keys", "left", "length", "lpad", "lstrip", "match",
  "matchn", "md5_buffer", "md5_text", "merge", "merged", "naturalcasecmp_to", "naturalnocasecmp_to",
  "nocasecmp_to", "nosuch", "num", "num_int64", "num_scientific", "num_uint64", "pad_decimals",
  "pad_zeros", "path_join", "recursive_equal", "remove_at_copy", "repeat", "replace", "replacen",
  "rfindn", "right", "rpad", "rsplit", "rstrip", "same_type", "search_sorted", "sha1_buffer",
  "sha1_text", "sha256_buffer", "sha256_text", "similarity", "simplify_path", "sort_flags", "split",
  "split_floats", "strip_edges", "strip_escapes", "subarray", "substr", "sum", "to_ascii_buffer",
  "to_base64", "to_byte_array", "to_camel_case", "to_float", "to_float32_array", "to_float64_array",
  "to_hex_string", "to_int", "to_int32_array", "to_int64_array", "to_kebab_case", "to_lower",
  "to_pascal_case", "to_raw_string", "to_snake_case", "to_string", "to_upper", "to_utf16_buffer",
  "to_utf32_buffer", "to_utf8_buffer", "to_wchar_buffer", "trim_prefix", "trim_suffix", "unicode_at",
  "uri_decode", "uri_encode", "validate_filename", "validate_node_name", "values", "xml_escape",
  "xml_unescape"
];

const DICT_NO_METHOD = new Set([
  "all", "any", "append_array", "bsearch", "bsearch_custom", "count", "fill", "filter", "find", "find_custom",
  "insert", "is_same", "join", "map", "max", "min", "pop_at", "pop_back", "pop_front", "push_back",
  "push_front", "reduce", "remove_at", "resize", "reverse", "rfind", "rfind_custom", "slice", "sort_custom",
]);

export const ARRAY_RO_WRITE: Readonly<Record<string, string>> = {
  append: "push_back (core/variant/array.cpp:283)",
  push_back: "push_back (core/variant/array.cpp:283)",
  push_front: "push_front (core/variant/array.cpp:775)",
  insert: "insert (core/variant/array.cpp:326)",
  erase: "erase (core/variant/array.cpp:348)",
  remove_at: "remove_at (core/variant/array.cpp:505)",
  pop_back: "pop_back (core/variant/array.cpp:782)",
  pop_front: "pop_front (core/variant/array.cpp:793)",
  pop_at: "pop_at (core/variant/array.cpp:803)",
  clear: "clear (core/variant/array.cpp:125)",
  resize: "resize (core/variant/array.cpp:307)",
  sort: "sort (core/variant/array.cpp:734)",
  sort_custom: "sort_custom (core/variant/array.cpp:739)",
  reverse: "reverse (core/variant/array.cpp:770)",
  shuffle: "shuffle (core/variant/array.cpp:744)",
  fill: "fill (core/variant/array.cpp:341)",
  append_array: "append_array (core/variant/array.cpp:290)",
};

const ARRAY_RO_INT23 = new Set(["resize", "insert"]);

export const DICT_RO_WRITE: Readonly<Record<string, string>> = {
  clear: "clear (core/variant/dictionary.cpp:315)",
  erase: "erase (core/variant/dictionary.cpp:255)",
  merge: "merge (core/variant/dictionary.cpp:337)",
  sort: "sort (core/variant/dictionary.cpp:332)",
  set: "set (core/variant/dictionary.cpp:207)",
};

/** 只读挡写：推一块 `ERROR: <面> is in read-only state.`，内容不变、脚本不打断（实测 `assign` 与 `get_or_add` 不在这一族里）。 */
export function readOnlyWrite(at: string, kind: "Array" | "Dictionary", name: string): Variant {
  readOnlyError(at, kind);
  return ARRAY_RO_INT23.has(name) ? V.int(23) : V.nil();
}

export function one(args: Variant[], who: string): Variant {
  const a = args[0];
  if (a === undefined) throw new GodotRuntimeError("arity", `${who} 缺少参数`);
  return a;
}

export function argAt(args: Variant[], i: number, who: string): Variant {
  const a = args[i];
  if (a === undefined) throw new GodotRuntimeError("arity", `${who} 缺少第 ${i} 个参数`);
  return a;
}

export function foldInt(v: Variant, fail: string): number {
  if (v.t === Tag.INT) return intToNum(v.v as IntPayload);
  if (v.t === Tag.BOOL) return v.v ? 1 : 0;
  if (v.t === Tag.FLOAT) {
    const n = v.v as number;
    if (!Number.isFinite(n) || Math.abs(n) >= 9223372036854775808) return -9223372036854775808;
    return Math.trunc(n);
  }
  throw new UnsupportedError("need-int-arg", fail);
}

const NP_SLICE_ARG_SAY: Record<string, boolean> = { String: true, StringName: true, Nil: true, Vector2i: true, NodePath: true };

export function nodePathSliceArg(args: readonly Variant[], i: number): number {
  const a = args[i] as Variant;
  if (a.t === Tag.INT || a.t === Tag.BOOL || a.t === Tag.FLOAT) return foldInt(a, "");
  const src = valueTypeName(a);
  if (NP_SLICE_ARG_SAY[src] === true) {
    throw new GodotRuntimeError("node-path-slice-arg", `Invalid type in function 'slice' in base 'NodePath'. Cannot convert argument ${String(i + 1)} from ${src} to int.`);
  }
  throw new UnsupportedError("node-path-slice-arg", `NodePath.slice() 的第 ${String(i + 1)} 位收到 ${src}，这一源的形状没量过`);
}

function foldBool(v: Variant, fail: string): boolean {
  if (v.t === Tag.BOOL) return v.v as boolean;
  if (v.t === Tag.INT) return intToNum(v.v as IntPayload) !== 0;
  if (v.t === Tag.FLOAT) return Number.isNaN(v.v as number) || (v.v as number) !== 0;
  throw new UnsupportedError("need-bool-arg", fail);
}

export function intArg(args: Variant[], i: number, who: string): number {
  const a = args[i];
  if (a === undefined) {
    throw new UnsupportedError("need-int-arg", `${who} 的第 ${i} 个参数需要 int`);
  }
  return foldInt(a, `${who} 的第 ${i} 个参数需要 int`);
}

/** 下标那三处（读、字符串取字符、写）只有一个 int 参：直接收 Variant，别为它现造一个参数数组。报错文本与 intArg 一致。 */
export function intArgIdx(a: Variant, who: string): number {
  return foldInt(a, `${who} 的第 0 个参数需要 int`);
}

export function hexDigit(ch: string): number {
  const c = ch.codePointAt(0) as number;
  if (c >= 0x30 && c <= 0x39) return c - 0x30;
  if (c >= 0x61 && c <= 0x66) return 10 + c - 0x61;
  if (c >= 0x41 && c <= 0x46) return 10 + c - 0x41;
  return -1;
}

export function hexPairsToBytes(hex: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < hex.length; i += 2) out.push(parseInt(hex.slice(i, i + 2), 16));
  return out;
}

export function arrayIndexArg(v: Variant | undefined, who: string): number {
  if (v === undefined) {
    throw new GodotRuntimeError("arity", `Too few arguments for "${who}()" call. Expected at least 1 but received 0.`);
  }
  if (v.t === Tag.INT || v.t === Tag.FLOAT || v.t === Tag.BOOL) return foldInt(v, "");
  throw new GodotRuntimeError(
    "array-index-arg",
    `Invalid type in function '${who}' in base 'Array'. Cannot convert argument 1 from ${valueTypeName(v)} to int.`,
  );
}

export function intArgOr(args: Variant[], i: number, dflt: number): number {
  const a = args[i];
  if (a === undefined) return dflt;
  return foldInt(a, `第 ${i} 个参数需要 int`);
}

export function boolArg(args: Variant[], i: number, who: string): boolean {
  const a = args[i];
  if (a === undefined) {
    throw new UnsupportedError("need-bool-arg", `${who} 的第 ${i} 个参数需要 bool`);
  }
  return foldBool(a, `${who} 的第 ${i} 个参数需要 bool`);
}

/** 可选 bool 参：省略时取 Godot 的默认值。 */
export function boolArgOr(args: Variant[], i: number, dflt: boolean): boolean {
  const a = args[i];
  if (a === undefined) return dflt;
  return foldBool(a, `第 ${i} 个参数需要 bool`);
}
